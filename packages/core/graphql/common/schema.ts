import { GraphqlRouter } from '@typestackapp/core/common/server'

export const Pagination = `
    total: Int
`

export const SearchScore = `
    score: Float
`

export const MongoId = `
    _id: ObjectId!
`

export const MongoIdMeybe = `
    _id: ObjectId
`

export const MongoTimeStamps = `
    createdAt: DateTime!
    updatedAt: DateTime!
`
export const MongoTimeStampsMeybe = `
    createdAt: DateTime
    updatedAt: DateTime
`

export const ServerAccess = `
    path: [String!]!
    serverType: ServerType!
    serverMethod: ServerMethod!
`

export const Enabled = `
    enabled: Boolean!
`

export const DefaultAccessOptions = `
    resource: String! # used in checkResourceAccess() to check if user has access to resource
    pack: Packages! # package name
    action: String! # any string value used to namespace AccessOptions
    resourceAction: String! # resource and action names combined
    types: [AccessType!] # resource could return multiple types of data
`

export const AuthOptions = `
    authParamKeyName: String # if defined will use req.params[authParamKeyName] as Authorization key
    tokens: [TokenType!]! # token types: ApiKey | Bearer | Basic, default: Bearer
    permission: PermissionType # permissions Read | Write , default: undefined, skips validation if not defined
`

export const LogOptions = `
`

export const CaptchaOptions = `
    pack: Packages! # package name
    type: String! # captcha configuration type from config captcha.ACTIVE.key
`

export const LimitOptions = `
    limitInterval: String! # 60s 20h 1d 1w 1m 1y
    limitTreshold: Int! #  number of requests per interval
`

export const TypeOptions = `
    mongoose: String # model name: @typestackapp/core/models/config
`

export const SearchInput = `
    limit: Int
    offset: Int
    text: String!
`

export const AccessInput = `
    status: AccessStatus!
    pack: Packages!
    resource: String!
    action: String
    permissions: [PermissionType!]!
    created_by: ObjectId
    updated_by: ObjectId
`

export const LogOptionsDocument = `
    enabled: Boolean!
    max: Int!
`

export const LogOptionsInput = `
    enabled: Boolean
    max: Int
`

export const queries = `#graphql
    query getPing($ping: String!) {
        getPing
    }
`

export default `#graphql
    scalar DateTime
    scalar Object
    scalar ObjectId
    scalar Packages

    type Query {
        getPing: Boolean
    }

    type Mutation {
        getPing: Boolean
    }

    type Subscription {
        getPing: Boolean
    }

    input SearchInput {
        ${SearchInput}
    }
    
    interface SearchScore {
        ${SearchScore}
    }

    interface Pagination {
        ${Pagination}
    }

    interface MongoId {
        ${MongoId}
    }

    interface MongoIdMeybe {
        ${MongoIdMeybe}
    }

    interface MongoTimeStamps {
        ${MongoTimeStamps}
    }

    interface MongoTimeStampsMeybe {
        ${MongoTimeStampsMeybe}
    }

    type MongoTimeStampsType implements MongoTimeStamps {
        ${MongoTimeStamps}
    }

    enum MongoOperationType {
        modify
        create
        createIndexes
        delete
        dropDatabase
        drop
        dropIndexes
        dropCollection
        insert
        invalidate
        refineCollectionShardKey
        rename
        replace
        reshardCollection
        shardCollection
        update
    }

    type MongoStreamNameSpace {
        db: String
        coll: String
    }

    type MongoStreamUpdateDescription {
        updatedFields: Object!
        removedFields: [String!]!
        truncatedArrays: [String!]!
    }

    type MongoStream {
        operationType: MongoOperationType!
        ns: MongoStreamNameSpace!
        documentKey: MongoId!
        fullDocument: Object
        fullDocumentBeforeChange: Object
        updateDescription: MongoStreamUpdateDescription
    }

    input MongoStreamInput {
        operations: [MongoOperationType!]!
    }

    type MongoUpdateRes {
        acknowledged: Boolean
        matchedCount: Int
        upsertedId: String
        upsertedCount: Int
        modifiedCount: Int
    }

    type MySqlRes {
        fieldCount: Int
        affectedRows: Int
        insertId: Int
        serverStatus: Int
        warningCount: Int
        message: String
        protocol41: Boolean
        changedRows: Int
    }

    interface LogOptionsInput {
        ${LogOptionsInput}
    }

    interface LogOptionsDocument {
        ${LogOptionsDocument}
    }

    interface Enabled {
        ${Enabled}
    }

    interface ServerAccess {
        ${ServerAccess}
    }

    interface AuthOptions implements Enabled {
        ${Enabled}
        ${AuthOptions}
    }

    interface LogOptions implements Enabled {
        ${Enabled}
        ${LogOptions}
    }

    interface CaptchaOptions implements Enabled {
        ${Enabled}
        ${CaptchaOptions}
    }

    interface LimitOptions implements Enabled {
        ${Enabled}
        ${LimitOptions}
    }

    interface TypeOptions {
        ${TypeOptions}
    }

    interface DefaultAccessOptions {
        ${DefaultAccessOptions}
    }

    interface AccessType {
        pack: Packages!
        type: String!
        path: String!
        info: [String!]
    }

    type AccessOptions implements Enabled { 
        log: LogOptions!
        auth: AuthOptions
        captcha: CaptchaOptions
        limit: LimitOptions
        type: TypeOptions
        ${Enabled}
        ${DefaultAccessOptions}
    }

    interface AccessInput {
        ${AccessInput}
    }

    type AccessDocument implements AccessInput & MongoTimeStamps { # access to resource, used in user.access, key.access
        ${AccessInput}
        ${MongoTimeStamps}
    }
    
    enum ExpressMethod {
        all
        get
        post
        put
        delete
        patch
        options
        head
        use
    }

    enum GraphqlMethod {
        Query
        Mutation
        Subscription
    }
    
    enum ServerMethod {
        # express
        all
        get
        post
        put
        delete
        patch
        options
        head
        use
        
        # graphql
        Query
        Mutation
        Subscription
    }

    enum ServerType {
        EXPRESS
        GRAPHQL
    }

    enum AccessStatus {
        Enabled
        Disabled
        EnabledByUser
        DisabledByUser
    }

    enum TokenType {
        Basic
        ApiKey
        Bearer
    }

    enum PermissionType {
        Read
        Write
        Update
        Delete
    }
`