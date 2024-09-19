import { Packages, Config, config } from "@typestackapp/core"
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

export type Connections = {
    [Package in Packages]: {
        [ DbKey in keyof Config[Package]["db"]["ACTIVE"] ]: {
            [ ConKey in keyof Config[Package]["db"]["ACTIVE"][DbKey] ]: DbKey extends keyof ConnectionType ? ConnectionType[DbKey] : any
        }
    }
}

export type DbConnection<TPackage extends Packages> = Connections[TPackage]


export default class DB {
    private static promise: Promise<Connections>

    public static getInstance(): Promise<Connections> {
        if(DB.promise) return DB.promise

        const connections: Promise<boolean>[] = []
        const _conns: any = {}

        // connect to configured databases
        for(const [pack_key, pack] of Object.entries(config)) {
            for (const [conn_key, conn] of Object.entries(pack.db.ACTIVE)) {
                for (const [config_key, config] of Object.entries<any>(conn)) {
                    _conns[pack_key] = _conns[pack_key] || {}
                    _conns[pack_key][conn_key] = _conns[pack_key][conn_key] || {}
                    _conns[pack_key][conn_key][config_key] = _conns[pack_key][conn_key][config_key] || {}

                    if( config?.options?.disabled ) { // skip connection if disabled
                        // console.log(`WARNING, skipping connection for DB ${pack_key}.${conn_key}.${config_key}.options == true`)
                        continue
                    }
                        
                    let _connection = DB.connect(conn_key, config.conn)
                    
                    // if connection is a promise, wait for it to resolve
                    let _promise = new Promise<boolean>(async (resolve) => {
                        _conns[pack_key][conn_key][config_key] = await _connection
                        resolve(true)
                    })
    
                    connections.push(_promise)
                }
            }
        }
        
        return DB.promise = new Promise<Connections>(async (resolve, reject) => {
            await Promise.all(connections)
            resolve(_conns as Connections)
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