import { gql } from '@typestackapp/core/codegen/system/client'
import { useQuery } from "@apollo/client"

export { useQuery }

export const getRoleManagerData = gql(`#graphql
  query getRoleManagerData {
    getAllAccessConfigs {
      enabled
      resource
      pack
      action
      resourceAction
      limit {
        enabled
      }
      log {
        enabled
      }
      auth {
        enabled
      }
      captcha {
        enabled
      }
      model {
        mongoose
      }
    }
    getAllRoles {
      _id
      title
      created_by
      updated_by
      pack
      type
      data {
        name
        resource_access {
          status
          pack
          resource
          action
          permissions
          created_by
          updated_by
          createdAt
          updatedAt
        }
        graphql_access {
          pack
          services
        }
      }
      createdAt
      updatedAt
    }
  }
`)

export const getAdminUserData = gql(`#graphql
  query GetAdminUserData {
    getCurrentUser {
      _id
      usn
      roles {
        _id
        title
        pack
        type
        data {
          name
          resource_access {
            status
            pack
            resource
            action
            permissions
          }
          graphql_access {
            pack
            services
          }
        }
      }
    }
  }
`)