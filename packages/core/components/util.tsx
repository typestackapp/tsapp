import React, { useState } from 'react'
import { apps } from '@typestackapp/core/codegen/next/apps'
import Link from 'next/link'
import TSAppClient from '@typestackapp/core/models/user/app/oauth/client/tsapp'
import { context } from '@typestackapp/core/components/global'
import { AccessCheckOptions, AccessValidator } from '@typestackapp/core/models/user/access/util'
import type { AuthOutput } from "@typestackapp/core/express/auth"
import { Packages } from '@typestackapp/core'
import { ValuesType } from 'utility-types'
import { getAdminUserData, useQuery } from '@typestackapp/core/components/queries'

export { apps }

export type AdminParams = {
  app?: string[]
}

export type NavState = {
  alias?: string
  pack?: string
  resource?: string
  action?: string
}

export type GridProps = {
  heading?: {
    title: string,
    size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  },
  children: React.ReactNode
}

export type AdminApp = ValuesType<typeof apps> & { is_active?: boolean } // TSAppConfig

export class ErrourBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}

export const getActiveApp = (params: AdminParams): ValuesType<typeof apps> | undefined => {
  const state = getNavState(params)
  return apps.find((app) => {
    return (app.pack === state.pack || app.alias === state.alias) && app.resource === state.resource && app.action === state.action
  })
}

export const getNavState = (params: AdminParams): NavState => {
  if(!params.app) return {}
  const state = {
    alias: urlDecode(params.app[0]),
    pack: urlDecode(params.app[0]),
    resource: urlDecode(params.app[1]),
    action: urlDecode(params.app[2])
  }
  return state
}

export const DisplayComponent = (props: { component: any }) => {
  const Component = props.component
  return <Component/>
}

// get current base path, and remove params
export const getBasePath = (pathname: string): string => {
  const path = pathname
  const parts = path.split('/')
  let base = ''

  for(let i = 0; i < parts.length; i++) {
    // skip if empty
    if(parts[i] === '') continue

    // if parts include admin stop
    if(parts[i] === 'admin') {
      base += '/admin'
      break
    }

    base += '/' + parts[i]
  }

  return base
}

export const urlDecode = (str: string | undefined) => {
  if(str === undefined || str === null || str === '') return undefined
  return decodeURIComponent((str+'').replace(/\+/g, '%20'))
}

export const urlEncode = (str: string) => {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

export const getNavPath = (app: any, path: string): string => {
  return `${path}/${urlEncode(app.alias || app.pack)}/${urlEncode(app.resource)}/${urlEncode(app.action)}`
}

export function getAdminAppState(apps: AdminApp[], active_app: AdminApp | undefined): AdminApp[] {
  const adminApps: AdminApp[] = []
  apps.forEach((app) => {
    const is_active_app = active_app != undefined && active_app.pack === app.pack && active_app.resource === app.resource && active_app.action === app.action
    adminApps.push({
      ...app,
      is_active: is_active_app
    })
  })
  return adminApps
}

export function UserNav({client, path}: {
  client: TSAppClient,
  path: string
}) {
  const [revokeStatus, setRevokeStatus] = React.useState<AuthOutput["revoke"] | undefined>()
  const { data } = useQuery(getAdminUserData, { fetchPolicy: "cache-first" })

  const handleSignOut = (event: any) => {
    event.preventDefault()
    new Promise(async (resolve, reject) => {
      const revoke = await client.auth.revoke.mutate({}) as AuthOutput["revoke"]
      setRevokeStatus(revoke)
      if(!revoke?.error){
        location.href = path
      }else{
        console.error(revoke.error)
      }
    })
  }

  if(!data) return <div>Loading...</div>

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl dark-mode:bg-gray-700">
      <span className="block text-sm text-gray-900 dark:text-white">email: {data.getCurrentUser?.usn || ""}</span>
      
      {revokeStatus && revokeStatus?.error &&
        <span className="block text-sm  text-red-500 truncate dark:text-gray-400">
          there was an error while signing out. Error: {revokeStatus.error.code}, {revokeStatus.error.msg}
        </span>
      }

      <ul className="py-2">
        <li>
          <a 
            href="#" 
            onClick={handleSignOut}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            Sign out
          </a>
        </li>
      </ul>
    </div>
  )
}

export function AppIcon({ app, path }: {
  app: AdminApp, 
  path: string 
}) {
  return <Link href={getNavPath(app, path)} className='flex flex-col'>
    {app.next?.icon && <img src={app.next.icon} className='max-h-14 object-contain'/>}
    {!app.next?.icon && <svg viewBox="-20 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M38.155 140.475L48.988 62.1108L92.869 67.0568L111.437 91.0118L103.396 148.121L38.155 140.475ZM84.013 94.0018L88.827 71.8068L54.046 68.3068L44.192 135.457L98.335 142.084L104.877 96.8088L84.013 94.0018ZM59.771 123.595C59.394 123.099 56.05 120.299 55.421 119.433C64.32 109.522 86.05 109.645 92.085 122.757C91.08 123.128 86.59 125.072 85.71 125.567C83.192 118.25 68.445 115.942 59.771 123.595ZM76.503 96.4988L72.837 99.2588L67.322 92.6168L59.815 96.6468L56.786 91.5778L63.615 88.1508L59.089 82.6988L64.589 79.0188L68.979 85.4578L76.798 81.5328L79.154 86.2638L72.107 90.0468L76.503 96.4988Z" fill="#000000"></path>
    </svg>
    }
    <div className='text-center mt-1'>
      {app.next.title}
    </div>
    <div className='grow'></div>
  </Link>
}

export function AdminAppList({ open, path, apps, app }: {
  apps: AdminApp[], // app list
  app: AdminApp | undefined, // active app
  open: boolean, // side nav state open | closed
  path: string, // current base path
}) {
  const globalContext = React.useContext(context)
  const { data } = useQuery(getAdminUserData, { fetchPolicy: "cache-first" })
  const access = data?.getCurrentUser?.roles?.map( role => role.data.resource_access )
  const [adminApps, setAdminApps] = React.useState<AdminApp[] | undefined>(globalContext?.apps?.state)

  // watch app change
  React.useEffect(() => {
    if(!access) return

    // remove unaccessible apps
    const _apps = apps.filter((app) => {
      const access_required: AccessCheckOptions = {
        pack: app.pack as Packages,
        resource: app.resource,
        action: app.action,
        auth: { permission: "Read" }
      }
      const validator = new AccessValidator(access)
      return validator.checkAccess(access_required)
    })

    if(!globalContext?.apps?.state) {
      const adminAppState = getAdminAppState(_apps, app)
      globalContext.apps = {state: adminApps, setState: setAdminApps}
      setAdminApps(adminAppState)
    }

    if(!adminApps || !app) return
    const side_nav_active_app = adminApps.find((side_nav_app) => side_nav_app.pack === app.pack && side_nav_app.resource === app.resource && side_nav_app.action === app.action)
    if(!side_nav_active_app) return

    // set all apps to inactive
    for(const app of adminApps) {
      app.is_active = false
    }

    // set active app
    side_nav_active_app.is_active = true

    setAdminApps([...adminApps])
  }, [app, data])

  if(!adminApps || !data || !open || !access) return <></>

  return <div className='min-w-[150px] gap-3 place-content-center
    max-md:flex max-md:flex-wrap max-md:gap-x-[3%]
    md:grid md:grid-cols-4'>
    {adminApps.map(app => (<div key={app.next.hash} className={app.is_active ? 'max-md:w-20 flex flex-col p-2 hover:bg-gray-200 cursor-pointer bg-gray-200': 'max-md:w-20 flex flex-col p-2 hover:bg-gray-200 cursor-pointer'}>
      <AppIcon app={app} path={path}/>
    </div>))}
  </div>
}

export function Main({ children }: {
  children: React.ReactNode 
}) {
  return (
    <main className='h-full overflow-y-auto overflow-x-hidden'>
      {children}
    </main>
  )
}

export function Grid(props: GridProps) {
  if(!props?.heading) return (
    <div className="flex-grid">
      {props.children}
    </div>
  )

  if(props.heading.size === "h1") return (
    <div>
      <h1>{props.heading.title}</h1>
      {props.children}
    </div>
  )

  return (
    <div className="border">
      <props.heading.size>{props.heading.title}</props.heading.size>
      <div className="flex-grid">
        <div>{props.children}</div>
      </div>
    </div>
  )
}

export function JsonViewer(props: { data: any, space: number}) {
  return (
    <pre style={{whiteSpace: "pre-wrap", wordWrap: "break-word", wordBreak: "break-all"}}>
      {JSON.stringify(props.data, null, props.space)}
    </pre>
  )
}

export function Admin({ path, apps, app, children }: {
  apps: AdminApp[], // app list
  app: AdminApp | undefined, // active app
  path: string, // current base path
  children: React.ReactNode
}) {
  const [isOpened, setIsOpened] = useState(true)
  const { data } = useQuery(getAdminUserData, { fetchPolicy: "cache-first" })

  function getOverlay() {
    return <div className='fixed h-full w-full bg-gray-200 opacity-30 pointer-events-none'></div>
  }
  
  function getSearchBar() {
    return <div className='flex gap-x-3 w-full items-center'>
      {/* filters */}
      <div>
        <button className='focus:outline-none flex items-center justify-center'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </button>
      </div>

      {/* search */}
      <div className='flex flex-grow h-full items-center max-md:mx-1'>
        <input
          className='text-base bg-transparent focus:outline-none w-full'
          id='search'
          type='text'
          placeholder='Type to search...'
        />
        <div>
          <button className='focus:outline-none flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox='0 0 24 24' strokeWidth={1.6} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
          </button>
        </div>
      </div>
    </div>
  }

  function getAdminPanel() {
    return <div className='
      max-md:w-full max-md:h-full
      md:shadow-xl min-w-[350px] w-[500px]
      flex flex-col overflow-hidden text-gray-700
    '>
      <div className='flex items-center h-12 px-3 gap-x-3 bg-gray-200'>
        {getSearchBar()}
      </div>

      <div className='flex-grow overflow-y-auto bg-gray-50'>
        <AdminAppList apps={apps} app={app} open={true} path={path}/>
      </div>
    </div>
  }

  function getNavBar() {
    return <div className='
      max-md:w-full max-md:h-12 max-md:flex-row max-md:h-12 max-md:min-h-12 max-md:max-h-12 max-md:px-3 max-md:py-2
      md:h-full md:flex-col md:w-12 md:min-w-12 md:max-w-12 md:py-3 md:px-1
      flex items-center bg-gray-900 text-gray-200 
    '>
      {/* home */}
      <Link href={path} className='md:my-2 max-md:mx-1 hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-9 h-9 max-md:w-10 max-md:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </Link>

      {/* user */}
      <div className='md:my-2 max-md:mx-1 hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-9 h-9 max-md:w-10 max-md:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </div>

      <div className='max-md:flex-grow'></div>

      {/* apps */}
      <div onClick={() => setIsOpened(!isOpened)} className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <div className='md:my-2 max-md:mx-1 hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 max-md:w-10 max-md:h-10">
          <path xmlns="http://www.w3.org/2000/svg" d="M9.5 2h-6A1.502 1.502 0 0 0 2 3.5v6A1.502 1.502 0 0 0 3.5 11h6A1.502 1.502 0 0 0 11 9.5v-6A1.502 1.502 0 0 0 9.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 2h-6A1.502 1.502 0 0 0 13 3.5v6a1.502 1.502 0 0 0 1.5 1.5h6A1.502 1.502 0 0 0 22 9.5v-6A1.502 1.502 0 0 0 20.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM9.5 13h-6A1.502 1.502 0 0 0 2 14.5v6A1.502 1.502 0 0 0 3.5 22h6a1.502 1.502 0 0 0 1.5-1.5v-6A1.502 1.502 0 0 0 9.5 13zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 13h-6a1.502 1.502 0 0 0-1.5 1.5v6a1.502 1.502 0 0 0 1.5 1.5h6a1.502 1.502 0 0 0 1.5-1.5v-6a1.502 1.502 0 0 0-1.5-1.5zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5z"/>
        </svg>
        </div>
      </div>

      <div className='md:flex-grow'></div>
    </div>
  }

  return <div className='h-full w-full overflow-hidden'>
    <div className='flex h-full w-full max-md:flex-col md:flex-row'>
      {getNavBar()} 
      {isOpened && getAdminPanel()}
      <div className="h-full w-full overflow-auto max-md:flex-1" onClick={() => (isOpened && setIsOpened(false))}>
        {isOpened && getOverlay()}
        {children}
      </div>
    </div>
  </div>
}