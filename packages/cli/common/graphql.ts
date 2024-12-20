import fs from 'fs'
import { getGraphqlRouterConfigs, getGraphqlModules, createGraphqlResovlerFile } from './util'
import { generate } from '@graphql-codegen/cli'
import { Types } from '@graphql-codegen/plugin-helpers'

export type GraphqlOptions = {
    cwd: string
}

export const graphql = async (options: GraphqlOptions) => {
    // initilize graphql/resolvers.json file
    createGraphqlResovlerFile(options.cwd)

    for (const graphql_server of getGraphqlRouterConfigs(options.cwd)) {
        var {schema} = await getGraphqlModules(graphql_server, {schema: true, resolvers: false})

        // if schema is empty
        if(!schema || schema == "" || schema.length == 0){
            console.log(`skipping, empty schema for pack:${graphql_server.pack} name:${graphql_server.name}`)
            continue
        }

        const generates: Types.Config['generates'] = {}

        generates[graphql_server.typeDefPath] = {
            plugins: ['typescript', 'typescript-operations', 'typescript-resolvers', 'typed-document-node' ],
            config: {
                typesPrefix: 'I',
                declarationKind: 'interface',
                scalars: {
                    Object: '{[key:string]: any}',
                    DateTime: 'Date',
                    Packages: 'Packages',
                    ObjectId: 'MongooseTypes.ObjectId',
                },
                enumsAsTypes: true,
                skipTypename: true,
            }
        } satisfies Types.ConfiguredOutput | Types.ConfiguredPlugin[]

        if(graphql_server.genClient == true) {
            generates[graphql_server.clientPath] = {
                preset: 'client',
                presetConfig: {
                    gqlTagName: 'gql',
                    typesPrefix: 'I',
                    declarationKind: 'interface',
                    scalars: {
                        Object: '{[key:string]: any}',
                        DateTime: 'Date',
                        Packages: 'string',
                        ObjectId: 'string',
                    },
                    enumsAsTypes: true,
                    skipTypename: true,
                }
            } satisfies Types.ConfiguredOutput | Types.ConfiguredPlugin[]
        }

        // write schema to file
        const CodegenConfig: Types.Config = {
            errorsOnly: true,
            debug: true,
            verbose: false,
            schema,
            documents: graphql_server.documents,
            generates
        }

        try {
            // if graphql shema is empty
            if(!CodegenConfig.schema || CodegenConfig.schema == "") throw new Error('graphql schema is empty')

            // generate graphql code
            await generate(CodegenConfig, true)

            let file_result = fs.readFileSync(graphql_server.typeDefPath, 'utf8')
            file_result = `
                import type { DeepRequired } from 'utility-types'
                import type { Packages } from '@typestackapp/core'
                import type { Types as MongooseTypes } from 'mongoose'
    
                ${file_result}
    
                // additional types generated by build-graphql.js script!
                export type GraphqlResolvers = Record<IGraphqlMethod, Record<string, any>>

                export type GraphObj = Scalars["Object"]["input"]
    
                type GraphqlResources<T extends GraphqlResolvers> = {
                    [K in IGraphqlMethod]?: {
                        [K2 in keyof T[K]]?: IAccessOptions  
                    } 
                }
    
                export type Resources<T> = GraphqlResources<DeepRequired<IResolvers<T>>>
            `
            fs.writeFileSync(graphql_server.typeDefPath, file_result, 'utf8')
        } catch (error) {
            console.error(error)
            // console.log({...CodegenConfig, schema: '...'})
        }
    }

    // initilize or replace graphql/resolvers.json file
    createGraphqlResovlerFile(options.cwd)
}