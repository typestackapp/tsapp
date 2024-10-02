import React from 'react'
import LoginComponent from '@typestackapp/core/components/user/access/login'
import { context } from '@typestackapp/core/components/global'
import { Admin, apps, ErrourBoundary } from '@typestackapp/core/components/util'
import { ApolloProvider } from "@apollo/client"

export default function AdminLayout({ children }: {
  children: React.ReactNode 
}) {
  const init = React.useRef(false)
  const globalContext = React.useContext(context)
  const [session, setSession] = React.useState(globalContext.tsappClient.getCurrentSession())
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
  return (
    <context.Provider value={globalContext}>
      <ApolloProvider client={globalContext.tsappClient.graphql["@typestackapp/core"].system}>
        <Admin apps={apps} children={children} />
      </ApolloProvider>
    </context.Provider>
  )
}