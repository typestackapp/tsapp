import { gql } from '@typestackapp/dev/codegen/system/client'
import { useQuery } from "@apollo/client"

export { useQuery }

export const getPingInComponent = gql(`#graphql
    query getPingInComponent {
        getPing
    }
`)