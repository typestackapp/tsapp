import React from 'react'
import LoginComponent from '@typestackapp/core/components/user/access/login'
import { context } from '@typestackapp/core/components/global'
import { DisplayComponent, Main, SideNav, SideNavApp, TopNav, getBasePath, urlDecode } from '@typestackapp/core/components/util'
import { useParams, usePathname } from 'next/navigation'
import { apps } from '@typestackapp/core/codegen/next/apps'
import { gql } from '@typestackapp/core/codegen/system/client'
import { ApolloProvider } from "@apollo/client"

export type AdminParams = {
  app?: string[]
}

export type NavState = {
  alias?: string
  pack?: string
  resource?: string
  action?: string
}

const getActiveApp = (params: AdminParams): SideNavApp | undefined => {
  const state = getNavState(params)
  return apps.find((app) => {
    return (app.pack === state.pack || app.alias === state.alias) && app.resource === state.resource && app.action === state.action
  })
}

const getNavState = (params: AdminParams): NavState => {
  if(!params.app) return {}
  const state = {
    alias: urlDecode(params.app[0]),
    pack: urlDecode(params.app[0]),
    resource: urlDecode(params.app[1]),
    action: urlDecode(params.app[2])
  }
  return state
}

export const getAdminUserDataQuery = gql(`#graphql
  query GetAdminUserData {
    getCurrentUser {
      _id
      usn
      role {
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

export default function AdminLayout( { children }: { children: React.ReactNode } ) {
  const init = React.useRef(false)
  const params = useParams() as AdminParams
  const path: string = getBasePath(usePathname())
  const globalContext = React.useContext(context)
  const [sideNavState, setSideNavState] = React.useState(true)
  const [session, setSession] = React.useState(globalContext.tsappClient.getCurrentSession())
  const [app, setApp] = React.useState(getActiveApp(params))
  globalContext.session = {state: session, setState: setSession}

  React.useEffect(() => {
    if (!init.current) {
      init.current = true
      globalContext.tsappClient.getActiveSession()
      .then((data) => setSession(data))
      .catch((error) => setSession({ error: { code: "session-fetch-error", msg: error }, data: undefined}))
    }
  }, [])
  
  if(!session) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        Loading...
      </div>
    )
  }

  if(session?.error || !session?.data) return (
    <context.Provider value={globalContext}>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-[300px]">
          <LoginComponent/>
        </div>
      </div>
    </context.Provider>
  )

  const appContent = app ? <DisplayComponent component={app.next.import}/> : children

  return (
    <context.Provider value={globalContext}>
      <ApolloProvider client={globalContext.tsappClient.graphql["@typestackapp/core"].system}>
        <TopNav
          sideNavState={sideNavState} 
          setSideNavState={setSideNavState}
          client={globalContext.tsappClient}
          path={path}
        />

        <div className="flex h-full">
          <SideNav
            apps={apps}
            app={app}
            open={sideNavState}
            path={path}
          />
          
          <Main children={appContent}/>
        </div>
      </ApolloProvider>
    </context.Provider>
  )
}