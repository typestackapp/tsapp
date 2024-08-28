import React from 'react'
import LoginComponent from '@typestackapp/core/components/user/access/login'
import { context } from '@typestackapp/core/components/global'
import { DisplayComponent, Admin, apps, getBasePath, AdminParams, getActiveApp, ErrourBoundary, AdminApp } from '@typestackapp/core/components/util'
import { useParams, usePathname } from 'next/navigation'
import { ApolloProvider } from "@apollo/client"

export default function AdminLayout({ children }: {
  children: React.ReactNode 
}) {
  const init = React.useRef(false)
  const params = useParams() as AdminParams
  const path: string = getBasePath(usePathname())
  const globalContext = React.useContext(context)
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
  
  // loading
  if(!session) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        Loading...
      </div>
    )
  }

  // login
  if(session?.error || !session?.data) return (
    <context.Provider value={globalContext}>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-[300px]">
          <ErrourBoundary>
            <LoginComponent/>
          </ErrourBoundary>
        </div>
      </div>
    </context.Provider>
  )

  // admin
  const appContent = app ? <DisplayComponent component={app.next.import}/> : children
  return (
    <context.Provider value={globalContext}>
      <ApolloProvider client={globalContext.tsappClient.graphql["@typestackapp/core"].system}>
        <Admin apps={apps} app={app} path={path} children={appContent}/>
      </ApolloProvider>
    </context.Provider>
  )
}