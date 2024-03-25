import amqp, { Connection as RabbitmqConnection, Channel, Message, Options, Replies } from "amqplib/callback_api"
import { Packages, Config } from '../../codegen/config'
import { ChannelOptions } from "../../models/config/channel"
import { ConsumerList } from "./consumer"

export type Connections = {
    [Package in Packages]: {
        [ RmqKey in keyof Config[Package]["rabbitmq"]["ACTIVE"] ]: ConnectionInstance
    }
}

export type Connection<TPackage extends Packages> = Connections[TPackage]

export type ConnectionOptions = {
    host: string
    user: string
    psw: string
    retry_time: number
    channel?: ChannelOptions
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

    static async initilize(): Promise<Connections> {
        if(ConnectionList.connections) return ConnectionList.connections

        let temp_connections: any = {}

        for(const [package_key, pack] of Object.entries(global.tsapp)) {
            for await(const [connection_key, options] of Object.entries(pack.config.rabbitmq.ACTIVE)) {
                if(!temp_connections[package_key]) temp_connections[package_key] = {}
                const new_conn = await ConnectionInstance.getInstance(options)
                
                const global_pack = global.tsapp as any
                global_pack[package_key].rmq = global_pack[package_key].rmq || {} as any
                global_pack[package_key].rmq[connection_key] = new_conn
                temp_connections[package_key][connection_key] = new_conn
            }
        }

        return new ConnectionList(temp_connections).conns
    }
}

export class ConnectionInstance {
    static start_consumers: boolean = false
    private options: ConnectionOptions
    conn: RabbitmqConnection
    channel: Channel
    consumers: ConsumerList

    private constructor( conn: RabbitmqConnection, channel: Channel, consumers: ConsumerList, options: ConnectionOptions ) {
        this.conn = conn
        this.channel = channel
        this.consumers = consumers
        this.options = options

        const onChannelError = () => {
            const intervalID = setInterval(() => {
                console.error("Channel is reconnecting!")
                ConnectionInstance.newChannel(this.conn, this.options.channel)
                .then((_channel) => {
                    console.error("Channel is reconnected!")
                    this.channel = _channel
                    this.channel.on("close", onChannelError)
                    this.channel.on("error", onChannelError)
                })
                .then(async () => {
                    if(ConnectionInstance.start_consumers) await this.consumers.recconectConsumers(this.conn, this.channel)
                }) 
                .then(() => clearInterval(intervalID))
                .catch((error) => {
                    console.log(error)
                })
            }, this.options.retry_time)
        }

        channel.on("close", onChannelError)
        channel.on("error", onChannelError)
    }

    static async getInstance( options: ConnectionOptions ): Promise<ConnectionInstance> {
        const conn = await ConnectionInstance.newConnection(options)
        const channel = await ConnectionInstance.newChannel(conn, options.channel)
        const consumers = new ConsumerList()
        if(this.start_consumers) await consumers.initilize(conn)
        return new ConnectionInstance(conn, channel, consumers, options)
    }

    getChannel() {
        return this.channel
    }

    private static getConnString( config: ConnectionOptions ) {
        return `amqp://${config.user}:${config.psw}@${config.host}/`
    }

    static async newChannel( conn: RabbitmqConnection, options: ChannelOptions | undefined ): Promise<Channel> {
        return await new Promise<Channel>((resolve) => {
            conn.createChannel(( error1, channel ) => {
                if(error1) throw `${error1}`
                if(options?.channel?.prefetch?.global) channel.prefetch(options.channel?.prefetch.global, true)
                if(options?.channel?.prefetch?.channel) channel.prefetch(options.channel?.prefetch.channel, false)
                return resolve(channel)
            })
        })
    }

    private static async newConnection( options: ConnectionOptions): Promise<RabbitmqConnection> {
        var conn

        const openConnection = (): Promise<RabbitmqConnection> => {
            return new Promise( resolve => {
                let conn_url = this.getConnString(options)
                amqp.connect(conn_url, ( error: any, connection: RabbitmqConnection ) => {
                    if ( error ) throw `${error}`
                    return resolve(connection)
                })
            })
        }

        const onError = function(err: any) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        }

        const onClose = () => {
            console.error("Connection closed")
            const intervalID = setInterval(() => {
                console.error("opening connection!")
                openConnection()
                .then((_conn) => {
                    conn = _conn
                    conn.on("error", onError)
                    conn.on("close", onClose)
                })
                .then(() => clearInterval(intervalID))
                .catch(err => console.log(err))
            }, options.retry_time)
        }

        conn = await openConnection()
        conn.on("error", onError)
        conn.on("close", onClose)

        return conn
    }
}