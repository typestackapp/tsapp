import { ConfigBase, ConfigDocumentBase } from "../schema"

export const schema = `#graphql
    type GraphqlAccess {
        pack: Packages!
        services: [String!]!
    }

    type RoleConfigDataInput {
        name: String!
        resource_access: [AccessInput!]!
        graphql_access: [GraphqlAccess!]!
    }

    type RoleConfigDataDocument {
        name: String!
        resource_access: [AccessDocument!]!
        graphql_access: [GraphqlAccess!]!
    }

    type RoleConfigInput {
        ${ConfigBase}
        log: LogOptionsInput
        data: RoleConfigDataInput!
    }

    type RoleConfigDocument {
        ${ConfigBase}
        ${ConfigDocumentBase}
        data: RoleConfigDataDocument!
    }
`