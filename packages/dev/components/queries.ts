import { gql } from '@typestackapp/devcodegen/admin/client'
import { useQuery } from "@apollo/client"

export { useQuery }

export const getPingInComponent = gql(`#graphql
    query getPingInComponent {
        getPing
    }
`)