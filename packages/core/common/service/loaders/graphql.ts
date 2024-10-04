import { tsapp } from "@typestackapp/core/env"
import { ApolloServer } from '@apollo/server'
import type { WithRequired } from '@apollo/utils.withrequired';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ExpressMiddlewareOptions, expressMiddleware } from '@apollo/server/express4'
import depthLimit from 'graphql-depth-limit'
import cors from 'cors'

import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import mongoose from "mongoose"
import { TSAppGraphqlPlugin, IGraphqlRouter } from '@typestackapp/core/common/service'
import { findTSAppRootDir, getGraphqlModules, getGraphqlRouterConfigs, GraphqlServerConfig } from '@typestackapp/cli/common/util'
import type { AccessRequest } from '@typestackapp/core/models/user/access/middleware'
import express from "express"
import http from "http"

export async function graphqlLoader(server: http.Server) {
    const { applyMiddlewareToGraphqlModule, validateUserToken } = await import('@typestackapp/core/models/user/access/middleware')
    const router = express.Router()
    const docs: IGraphqlRouter[] = []

    function getTSAppGraphqlPlugin(options: GraphqlServerConfig): TSAppGraphqlPlugin {
        return {
            async requestDidStart(req) {
                return {
                    async didResolveOperation(req) {
                        if (options.isPublic == false) {
                            // one request can access multiple resources
                            // for all resource requests generate a unique request id
                            // this request id will be used when logging resource access
                            req.contextValue.id = new mongoose.Types.ObjectId()
    
                            // must have valid user key, otherwise throw error
                            const {user, token} = await validateUserToken(req.contextValue)
    
                            // user role must have access to graphql service
                            await user.haveAccessToGraphqlService(options)
                        }
                    }
                }
            }
        }
    }

    for (const graphql_server of getGraphqlRouterConfigs(findTSAppRootDir() || process.cwd())) {
        // skip if isServer == false
        if(graphql_server.isServer == false) continue
        
        const {schema, resolvers, routers} = await getGraphqlModules(graphql_server, {schema: true, resolvers: true})

        // skip if schema is empty
        if(!schema || schema == "" || schema.length == 0) {
            console.log(`skipping, empty schema for pack:${graphql_server.pack} name:${graphql_server.name}`)
            continue
        }

        docs.push(...routers)

        const gql_resolvers = applyMiddlewareToGraphqlModule(resolvers)
        const gql_schema = makeExecutableSchema({ typeDefs: schema, resolvers: gql_resolvers })
        const gql_server = new WebSocketServer({ server, path: graphql_server.serverPath })
        const gql_clenup = useServer({ schema: gql_schema }, gql_server)

        const _server: ApolloServer<AccessRequest> = new ApolloServer({
            schema: gql_schema,
            introspection: true,
            validationRules: [ depthLimit(7) ],
            plugins:[ 
                ApolloServerPluginDrainHttpServer({ httpServer: server }), {
                    async serverWillStart() {
                        return {
                        async drainServer() {
                            await gql_clenup.dispose();
                        },
                        };
                    },
                },
                getTSAppGraphqlPlugin(graphql_server)
            ]
        })

        await _server.start()

        const express_middleware_options: WithRequired<ExpressMiddlewareOptions<AccessRequest>, 'context'> = {
            context: async ({req, res}) => {
                return req as AccessRequest
            }
        }

        router.use(
            `${graphql_server.serverPath}`,
            cors<cors.CorsRequest>(),
            express.json({limit: "100mb"}),
            expressMiddleware<AccessRequest>(_server, express_middleware_options)
        )

        console.log(`---GRAPHQL ${graphql_server.pack} ${graphql_server.name} SERVER INFO-------`)
        console.log(`SERVER:  https://${tsapp.env.TSAPP_DOMAIN_NAME}${graphql_server.serverPath}`)
        console.log(`------------------------------------------------------`)
    }

    return {
        docs,
        router
    }
}