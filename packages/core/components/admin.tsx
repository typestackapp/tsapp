import React from 'react'
import LoginComponent from '@typestackapp/core/components/user/access/login'
import { context } from '@typestackapp/core/components/global'
import { Admin, AdminApp, apps, ErrourBoundary } from '@typestackapp/core/components/util'
import { ApolloProvider } from "@apollo/client"
import { getAdminData, useQuery } from '@typestackapp/core/components/queries'

export default function AdminLayoutContext({ children }: {
  children: React.ReactNode 
}) {
  const ctx = React.useContext(context)
  return <context.Provider value={ctx}>
    <ApolloProvider client={ctx.tsappClient.graphql["@typestackapp/core"].admin}>
      <AdminLayout children={children}/>
    </ApolloProvider>
  </context.Provider>
}

function AdminLayout({ children }: {
  children: React.ReactNode 
}) {
  const init = React.useRef(false)
  const ctx = React.useContext(context)
  const [session, setSession] = React.useState(ctx.tsappClient.getCurrentSession())
  const [adminApps, setAdminApps] = React.useState<AdminApp[] | undefined>(ctx.apps?.state || undefined)
  const adminUser = useQuery(getAdminData, { fetchPolicy: "cache-first" })
  const access = adminUser?.data?.getCurrentUser?.roles?.map( role => role.data.resource_access )

  ctx.session = { state: session, setState: setSession }
  ctx.apps = { state: adminApps, setState: setAdminApps }

  React.useEffect(() => {
    if (!init.current) {
      init.current = true
      ctx.tsappClient.getActiveSession()
      .then((data) => setSession(data))
      .catch((error) => setSession({ error: { code: "session-fetch-error", msg: error }, data: undefined}))
    }
    
    if(adminUser.error) adminUser.refetch()
  }, [session])
  
  // loading
  if(adminUser.loading)
    return <div className="flex flex-col items-center justify-center w-full h-full">
      Loading...
    </div>

  // login
  if(adminUser.error || (session && session.error))
    return <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="w-[300px]">
        <ErrourBoundary>
          <LoginComponent/>
        </ErrourBoundary>
      </div>
    </div>

  // admin
  return <Admin apps={apps} children={children} access={access}/>
}