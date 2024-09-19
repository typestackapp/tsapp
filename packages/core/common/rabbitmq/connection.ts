import amqp, { Connection as RabbitmqConnection, Channel, Message, Options, Replies } from "amqplib/callback_api"
import { Packages, Config, config } from "@typestackapp/core"
import { ChannelOptions } from "@typestackapp/core/models/config/channel"
import { ConsumerList } from "@typestackapp/core/common/rabbitmq/consumer"
import { sleep } from "@typestackapp/cli/common/util"

export type Connections = {
    [Package in Packages]: {
        [ RmqKey in keyof Config[Package]["rabbitmq"]["ACTIVE"] ]: Connection
    }
}

export type RmqConnection<TPackage extends Packages> = Connections[TPackage]

export type ConnectionOptions = {
    host: string
    user: string
    psw: string
    retry_time: number
    channel?: ChannelOptions
    start_consumers?: boolean
}

export class ConnectionList {
    private static connections: Connections

    private constructor(conns: Connections) {
        ConnectionList.connections = conns
    }

    get conns(): Connections {
        if(!ConnectionList.connections) throw  "Error, ConnectionList call initilize before accessing connections"
        return ConnectionList.connections
    }

    static async initilize(start_consumers: boolean = false): Promise<Connections> {
        if(ConnectionList.connections) return ConnectionList.connections

        let temp_connections: any = {}

        for(const [package_key, pack] of Object.entries(config)) {
            for await(const [connection_key, options] of Object.entries(pack.rabbitmq.ACTIVE)) {
                if(!temp_connections[package_key]) temp_connections[package_key] = {}
                const new_conn = await Connection.getInstance({...options, start_consumers})
                temp_connections[package_key][connection_key] = new_conn
            }
        }

        return new ConnectionList(temp_connections).conns
    }
}

export class Connection {
    private options: ConnectionOptions
    conn: RabbitmqConnection
    channel: Channel
    consumers: ConsumerList

    private constructor( conn: RabbitmqConnection, channel: Channel, consumers: ConsumerList, options: ConnectionOptions ) {
        this.options = options
        this.consumers = consumers

        this.conn = conn
        this.conn.on("error", this.onConnError)
        this.conn.on("close", this.onConnClose)

        this.channel = channel
        this.channel.on("error", this.onChannelError)
        this.channel.on("close", this.onChannelClose)
    }

    static async getInstance( options: ConnectionOptions ): Promise<Connection> {
        const conn = await Connection.newConn(options)
        const channel = await Connection.newChannel(conn, options.channel)
        const consumers = new ConsumerList()
        if(options.start_consumers) await consumers.initilize(conn)
        return new Connection(conn, channel, consumers, options)
    }

    getChannel() {
        return this.channel
    }

    static getConnString( config: ConnectionOptions ) {
        return `amqp://${config.user}:${config.psw}@${config.host}/`
    }

    static async newConn( options: ConnectionOptions ) {
        return new Promise<RabbitmqConnection>( resolve => {
            let conn_url = this.getConnString(options)
            amqp.connect(conn_url, ( error: any, connection: RabbitmqConnection ) => {
                if ( error ) throw `${error}`
                return resolve(connection)
            })
        })
    }
    openConn = async (options: ConnectionOptions): Promise<RabbitmqConnection> => {
        console.error("[RMQ] Opening connection!")
        this.conn = await Connection.newConn(options)
        this.conn.on("error", this.onConnError)
        this.conn.on("close", this.onConnClose)
        return this.conn
    }
    onConnError = function(err: any) {
        if (err.message !== "Connection closing") {
            console.error("[RMQ] Connection error", err.message);
        }
    }
    onConnClose = () => {
        console.error("[RMQ] Connection closed")
        this.openConn(this.options)
        .then((_conn) => this.conn = _conn)
        .catch(async err => {
            console.log(err)
            await sleep(this.options.retry_time)
            console.log("retrying connection!")
        })
    }

    static async newChannel( conn: RabbitmqConnection, options: ChannelOptions | undefined ): Promise<Channel> {
        return new Promise<Channel>((resolve) => {
            conn.createChannel(async ( error1, channel ) => {
                if(error1) throw `${error1}`
                if(options?.channel?.prefetch?.global) channel.prefetch(options.channel?.prefetch.global, true)
                if(options?.channel?.prefetch?.channel) channel.prefetch(options.channel?.prefetch.channel, false)
                return resolve(channel)
            })
        })
    }
    openChannel = async (conn: RabbitmqConnection, options: ChannelOptions | undefined): Promise<Channel> => {
        console.error("[RMQ] Opening channel!")
        this.channel = await Connection.newChannel(conn, options)
        this.channel.on("error", this.onChannelError)
        this.channel.on("close", this.onChannelClose)
        return this.channel
    }
    onChannelError = (err: any) => {
        if (err.message !== "Connection closing") {
            console.error("[RMQ] Channel error", err.message);
        }
    }
    onChannelClose = () => {
        console.error("[RMQ] Channel closed")
        this.openChannel(this.conn, this.options.channel)
        .then(async (_channel) => {
            this.channel = _channel
            if(this.options.start_consumers) await this.consumers.recconectConsumers(this.conn, this.channel)
        })
        .catch(async err => {
            console.log(err)
            await sleep(this.options.retry_time)
            console.log("retrying channel!")
            await this.openChannel(this.conn, this.options.channel)
        })
    }
}