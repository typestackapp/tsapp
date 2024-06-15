/* 
    Do not import models is this file!
    This file is used outside global DB connections.
    Importing models will cause error.
*/

import fs from "fs-extra"
import _ from 'lodash'
import type { ChangeStream, ChangeStreamDocument } from "mongodb"
import type { Document } from "bson"
import type { IAccessOptions, IMongoOperationType, IExpressMethod } from "@typestackapp/core"
import type { ApolloServerPlugin } from '@apollo/server'
import type { AccessRequest, GraphqlServerAccess, ExpressRequestHandler, ExpressServerAccess, middleware} from "@typestackapp/core/models/user/access/middleware"
import type { Router } from "express"
import { IGraphqlMethod } from "@typestackapp/core"
import { Packages, packages } from "@typestackapp/core"
import { DeepRequired } from "utility-types"
import { Resolver } from "@apollo/client"

export type ExpressErrorResponse = {
    code: string
    msg: string
}

export interface ExpressResponse<Data = any, Error = ExpressErrorResponse | undefined> {
    data: Data
    error: Error
}

export interface IExpressRouter {
    options?: IAccessOptions
    server: ExpressServerAccess
    handlers: ExpressRequestHandler[]
}

export class ExpressRouter {
    private static prefix: string = "/api" // Express router prefix /${prefix}/...
    private static default_path: string  = "/" // default path is used when no path is provided when adding a route
    private static pack: Packages
    private routers: IExpressRouter[] = []

    get(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("get", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    post(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("post", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    delete(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("delete", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    patch(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("patch", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    put(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("put", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }
    
    all(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("all", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    use(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, ...handlers: ExpressRequestHandler[]): any {
        const _opt = this.getOptions("use", path, options)
        const _handlers = this.getHandlers(path, options, handlers)
        this.routers.push({ options: _opt.options, server: _opt.server, handlers: _handlers })
    }

    private getHandlers(path: string | IAccessOptions | ExpressRequestHandler, options?: IAccessOptions | ExpressRequestHandler, handlers?: ExpressRequestHandler[]): ExpressRequestHandler[] {
        let _handlers: ExpressRequestHandler[] = []
        if(typeof path === 'function') _handlers.push(path)
        if(typeof options === 'function') _handlers.push(options)
        if(handlers) _handlers = _handlers.concat(handlers)
        return _handlers
    }

    getOptions(
            method: IExpressMethod,
            path: string | IAccessOptions | ExpressRequestHandler,
            options?: IAccessOptions | ExpressRequestHandler
        ): {
            options?: IAccessOptions,
            server: ExpressServerAccess
        }{

        let _options: IAccessOptions | undefined = undefined

        if(typeof path === 'object') {
            _options = path
        } else if(typeof options === 'object') {
            _options = options
        }

        return {
            options: _options,
            server: {
                path: this.getPath(path),
                serverMethod: method,
                serverType: "EXPRESS"
            }
        }
    }

    private getPath(path: string | IAccessOptions | ExpressRequestHandler): string[] {
        let _paths = []

        // any user provided path /${prefix}/${path}
        if(typeof path === 'string') 
            _paths.push(path)

        // default path /${prefix}/${pack}/${file_structure}/${file_name}
        _paths.push(`${ExpressRouter.prefix}/${ExpressRouter.pack}${ExpressRouter.default_path}/`)

        // alias path /${prefix}/${alias}/${file_structure}/${file_name}
        const alias = packages[ExpressRouter.pack]?.alias
        if(alias)
            _paths.push(`${ExpressRouter.prefix}/${alias}${ExpressRouter.default_path}/`)

        if(alias == null)
            _paths.push(`${ExpressRouter.prefix}${ExpressRouter.default_path}/`)

        // console.log(`Loading api route: ${ExpressRouter.pack}${ExpressRouter.default_path}`)
        // console.log(_paths)

        return _paths
    }

    getRouters() {
        return this.routers
    }

    // foreach path replace params [param1], [param2] with :param1, :param2
    getPaths(paths: string[]) {
        return paths.map(path => {
            return path.replace(/\[(.*?)\]/g, ":$1")
        })
    }

    registerRoters(router: Router): IExpressRouter[] {
        this.routers.forEach(_router => {
            console.log(`Registering ${_router.server.serverMethod} ${this.getPaths(_router.server.path)}`)
            router[_router.server.serverMethod](this.getPaths(_router.server.path), ..._router.handlers as unknown as any[])
        })
        return this.routers
    }

    static setDefaultPath(options: {default_api_route: string, pack: Packages, prefix: string}) {
        this.default_path = options.default_api_route
        this.pack = options.pack
        this.prefix = options.prefix
    }

    // Imports API routers
    async loadExpressRoutes(_root: string, _pack: Packages, _prefix: string) {
        const routers: IExpressRouter[] = []

        const loadRouter = async (full_path: string, _path: string) => {
            try {
                // check if file is .js and check if it has coresponding ts file
                if(_path.split(".").pop() == "js" && fs.existsSync(full_path.replace('.js', '.ts'))){
                    const default_api_route = full_path.replace(_root, "").replace(".js", "")
                    ExpressRouter.setDefaultPath({
                        default_api_route,
                        pack: _pack,
                        prefix: _prefix
                    })

                    const module = await import(full_path)

                    if(module?.router) {
                        const _router = module.router as ExpressRouter
                        routers.push(..._router.getRouters())
                    }

                    ExpressRouter.setDefaultPath({
                        default_api_route: "",
                        pack: "" as any,
                        prefix: ""
                    })
                }
            } catch (error) {
                console.error(`Error, Api route cant be loaded in: ${full_path}`)
                console.error(error)
            }
        }
        
        const loadRouters = async (root_path: string) => {
            const _paths = fs.readdirSync(root_path)
            for await(const _path of _paths) {
                const full_path = `${root_path}/${_path}`

                if(fs.lstatSync(full_path).isDirectory()) {
                    await loadRouters(full_path)
                }else{
                    await loadRouter(full_path, _path)
                }
            }
        }

        const _paths = fs.readdirSync(_root)
        for await(const _path of _paths) {
            const full_path = `${_root}/${_path}`
            if(fs.lstatSync(full_path).isDirectory()){
                await loadRouters(full_path)
            }else{
                await loadRouter(full_path, _path)
            }
        }

        this.routers.push(...routers)
        return routers
    }
}

export interface IGraphqlRouter {
    options?: IAccessOptions
    server:  GraphqlServerAccess
    serverConfig: GraphqlServerConfig
}

type GraphqlResolverInput<TResolvers> = {
    [Key in keyof TResolvers]?: {
        [Key2 in keyof TResolvers[Key]]?: TResolvers[Key][Key2]
    }
}

type GraphqlResolver<Resolve = any> = {
    typedef?: string,
    access?: IAccessOptions,
    resolve: Resolve 
}

type GraphqlResolvers<TResolvers> = {
    [Key in keyof DeepRequired<TResolvers>]: Key extends keyof Required<TResolvers> ? {
        [Key2 in keyof Required<TResolvers>[Key]]?: GraphqlResolver<Required<TResolvers>[Key][Key2]>
    } : never
}

export type GraphqlResovlerModule = {[key:string]: {[key:string]: GraphqlResolver<Resolver>}}
export type GraphqlResovlerMethod = {[key:string]: {[key:string]: Resolver}}

export class GraphqlRouter<TResolvers extends GraphqlResolverInput<TResolvers>> {
    resolvers: GraphqlResolvers<TResolvers>

    constructor(resolver?: {
        keys?: Array<keyof Required<TResolvers>>
    }){
        const resolvers: {[key: string]: {[key: string]: {}}} = {}
        const resolver_keys = ["Query", "Mutation", "Subscription", ...(resolver?.keys ? [resolver.keys] : [])] as string[]
        for(const resolver of resolver_keys) {
            resolvers[resolver] = {}
        }
        this.resolvers = resolvers as GraphqlResolvers<TResolvers>
    }

    getResolvers() {
        const resolvers: GraphqlResovlerModule = this.resolvers as any
        return resolvers
    }

    getRouters(serverConfig: GraphqlServerConfig) {
        const routers: IGraphqlRouter[] = []
        let options = undefined
        for(const [serverMethod, resolver] of Object.entries(this.resolvers)) {
            if(!resolver) continue
            for(const [resolverName, method] of Object.entries(resolver)) {
                if(!method) continue

                routers.push({
                    serverConfig,
                    options: options,
                    server: {
                        resolverName: resolverName,
                        serverMethod: serverMethod as IGraphqlMethod,
                        path: [serverConfig.serverPath],
                        serverType: "GRAPHQL",
                    }
                })
            }
        }
        return routers
    }

    // replaces all ! with empty string
    static deepOptional(typeDef: string): string {
        return typeDef.replace(/!/g, "")
    }
}

export interface TSAppGraphqlPlugin extends ApolloServerPlugin<AccessRequest> {}

export interface GraphqlServerConfig {
    // automaticly generated, cant be rewritten
    name: string // graphql config key name
    pack: Packages // package name, automaticly generated
    typeDefPath: string // output path for type definitions
    clientPath: string // output path for client
    serverPath: string // rewrite server path,

    // options from graphql.json config file
    isServer: boolean // start graphql server
    isPublic: boolean // remove authentification from graphql server, will have public scheam
    modules: string[] // module file paths 
    documents?: string[] // document file paths, will be used to generate graphql client
}

// listens on mongo change stream
export class StreamListener<T extends Document = Document> {
    listener: Promise<ChangeStreamDocument<T>>

    constructor(public stream: any) {
        stream = stream as ChangeStream<T>
        this.listener = stream.next()
        this.streamListener()
    }

    async streamListener() {
        await this.listener
        this.listener = this.stream.next()
        this.streamListener()
    }

    getOperation(haystack: Array<IMongoOperationType>, needle: string): IMongoOperationType | undefined {
        return haystack.find((op) => op.toString() == needle)
    }

    yield(sub_name: string, data: ChangeStreamDocument<T>) {
        let _sub: { [key: string ]: any } = {}
        _sub[sub_name] = data
        return _sub
    }
}