import { Packages, Config, config } from '../codegen/config'
import { MongoClient } from 'mongodb'
import { Pool as PgConnection } from 'pg'
import mysql, { Pool as MysqlConnection } from 'mysql2/promise'
import mssql, { ConnectionPool as MssqlConnection } from 'mssql'
import mongoose from 'mongoose'
import { Sequelize } from 'sequelize'

export interface ConnectionType {
    // DB
    mongo: MongoClient,
    postgres: PgConnection,
    mysql: MysqlConnection,
    mssql: MssqlConnection,
    // ORM
    mongoose: mongoose.Connection,
    sequelize: Sequelize
}

export interface ConnectionOptions {
    disabled: boolean, // skips connection if enabled
}

type Connections = {
    [Package in Packages]: {
        [ DbKey in keyof Config[Package]["db"]["ACTIVE"] ]: {
            [ ConKey in keyof Config[Package]["db"]["ACTIVE"][DbKey] ]: DbKey extends keyof ConnectionType ? ConnectionType[DbKey] : any
        }
    }
}

export type Connection<TPackage extends Packages> = Connections[TPackage]


export default class DB {
    private static promise: Promise<boolean>

    public static getInstance(): Promise<boolean> {
        if(DB.promise) return DB.promise

        const connections: Promise<boolean>[] = []

        // connect to configured databases
        for(const [pack_key, pack] of Object.entries(config)){
            for (const [conn_key, conn] of Object.entries(pack.db.ACTIVE)) {
                for (const [config_key, config] of Object.entries<any>(conn)) {

                    const global_pack = global.tsapp as any
                    global_pack[pack_key]["db"] = global_pack[pack_key]["db"] || {} as any
                    global_pack[pack_key]["db"][conn_key] = global_pack[pack_key]["db"][conn_key] || {} as any

                    if( config?.options?.disabled ) { // skip connection if disabled
                        // console.log(`WARNING, skipping connection for DB ${pack_key}.${conn_key}.${config_key}.options == true`)
                        continue
                    }
                    
                    if( global_pack[pack_key]["db"][conn_key][config_key] ) // check if global connection is already set
                        throw `Error, skipping connection for DB ${pack_key}.${conn_key}.${config_key} as it is already set`
                        
                    let _connection = DB.connect(conn_key, config.conn)
    
                    if( !(_connection instanceof Promise) ) {
                        global_pack[pack_key]["db"][conn_key][config_key] = _connection
                        continue
                    }

                    // _connection.then((conn: any) => {
                    //     console.log(`DB, connected to ${pack_key}.${conn_key}.${config_key}`)
                    // })
                    // .catch((err: any) => {
                    //     console.log(`DB, failed to connect to ${pack_key}.${conn_key}.${config_key}`)
                    //     console.log(err)
                    // })
    
                    // if connection is a promise, wait for it to resolve
                    let _promise = new Promise<boolean>(async (resolve) => {
                        // console.log(`DB, connected to ${conn_type}.${conn_config}`)
                        global_pack[pack_key]["db"][conn_key][config_key] = await _connection
                        resolve(true)
                    })
    
                    connections.push(_promise)
                }
            }
        }

        return DB.promise = new Promise<boolean>(async (resolve, reject) => {
            await Promise.all(connections)
            resolve(true)
        })
    }

    private static connect(conn_type: string, _conn: any): any {
        switch (conn_type) {
            case "mongo": return new MongoClient(_conn.host, _conn.options).connect()
            case "postgres": return new PgConnection(_conn)
            case "mysql": return mysql.createPool(_conn)
            case "mssql": return mssql.connect(_conn)
            case "mongoose": return mongoose.createConnection(_conn.host, _conn.options)
            case "sequelize": return new Sequelize(_conn)

            default:
                throw "DB, connection type not supported"
        }
    }
}