import React, { useEffect, useRef, useState } from 'react'
import { apps } from '@typestackapp/core/codegen/next/apps'
import Link from 'next/link'
import TSAppClient from '@typestackapp/core/models/user/app/oauth/client/tsapp'
import { ValuesType } from 'utility-types'
import { useQuery } from "@apollo/client"
import { context } from '@typestackapp/core/components/global'
import { checkResourceAccess } from '@typestackapp/core/models/user/access/util'
import type { AuthOutput } from "@typestackapp/core/express/auth"
import type { AccessCheckOptions } from '@typestackapp/core/models/user/access/middleware'
import { gql } from '@typestackapp/core/codegen/system/client'
import { Packages } from '@typestackapp/core'

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

export type AdminApp = ValuesType<typeof apps>
export type AdminAppData = AdminApp & { is_active: boolean }
export type AdminAppResource = {
  list: { [resource: string]: AdminAppData[] }
  is_opened: boolean
}

export type AdminApps = {
  [pack: string]: AdminAppResource
}

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

export const getAdminUserDataQuery = gql(`#graphql
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

export const getActiveApp = (params: AdminParams): AdminApp | undefined => {
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

export function getAdminApps(apps: AdminApp[], active_app: AdminApp | undefined): AdminApps {
  var adminApps: AdminApps = {}

  apps.forEach((app) => {
    var resources: AdminAppResource = adminApps[app.next.group] || {
      list: {},
      is_opened: false
    }

    resources.list[app.resource] = resources.list[app.resource] || []

    const is_active_app = active_app != undefined && active_app.pack === app.pack && active_app.resource === app.resource
    if(is_active_app) resources.is_opened = true

    resources.list[app.resource]?.push({
      ...app,
      is_active: is_active_app
    })

    adminApps[app.next.group] = resources
  })

  return adminApps
}

export function UserNav({client, path}: {
  client: TSAppClient,
  path: string
}) {
  const [revokeStatus, setRevokeStatus] = React.useState<AuthOutput["revoke"] | undefined>()
  const { data } = useQuery(getAdminUserDataQuery, { fetchPolicy: "cache-first" })

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

export function AdminAppList({ open, path, apps, app }: {
  apps: AdminApp[], // app list
  app: AdminApp | undefined, // active app
  open: boolean, // side nav state open | closed
  path: string, // current base path
}) {
  const globalContext = React.useContext(context)
  const { data } = useQuery(getAdminUserDataQuery, { fetchPolicy: "cache-first" })
  // TODO const access = data?.getCurrentUser?.roles?.data.resource_access
  const access = []
  const [adminApps, setAdminApps] = React.useState<AdminApps | undefined>(globalContext?.apps?.state)

  // watch app change
  React.useEffect(() => {
    if(!access) return

    // remove unaccessible apps
    const _apps = apps.filter((app) => {
      const options: AccessCheckOptions = {
        pack: app.pack as Packages,
        resource: app.resource,
        action: app.action,
        auth: { permission: "Read" }
      }
      const has_access = checkResourceAccess(access, options)
      return has_access
    })

    if(!globalContext?.apps?.state) {
      const adminAppState = getAdminApps(_apps, app)
      globalContext.apps = {state: adminAppState, setState: setAdminApps}
      setAdminApps(adminAppState)
    }

    if(!adminApps || !app || !adminApps[app.next.group]) return

    const side_nav_active_app = adminApps[app.next.group].list[app.resource]
    .find((side_nav_app) => side_nav_app.pack === app.pack && side_nav_app.resource === app.resource && side_nav_app.action === app.action)
    
    if(!side_nav_active_app) return

    // set all apps to inactive
    Object.entries(adminApps).forEach(([group, resources]) => {
      Object.entries(resources.list).forEach(([resource, apps]) => {
        apps.forEach((app) => {
          app.is_active = false
        })
      })
    })

    // set active app
    side_nav_active_app.is_active = true

    setAdminApps({...adminApps})
  }, [app, data])

  function getAppView(app: AdminAppData) {
    return <div key={app.next.hash} className={app.is_active? 'bg-gray-300 border-b' : 'border-b hover:bg-gray-100'}>
      <Link href={getNavPath(app, path)} >
        <div className={app.next.list == 'grow'? 'px-3 py-2': 'px-3 py-2 ml-3'}>
          {app.next.title}
        </div>
      </Link>
    </div>
  }

  function getDefaultList(resources: AdminAppResource, pack: string) {
    if(Object.keys(resources.list).length === 0) return <></>
    return <>
      <div className='border-b'>
        <div className='px-3 py-2 hover:bg-gray-100' onClick={() => {
            if(!adminApps) return
            adminApps[pack].is_opened = !resources.is_opened
            setAdminApps({...adminApps})
          }}
        >{pack}</div>
      </div>

      {resources.is_opened && <div>
        {Object.entries(resources.list).map(([resource, apps]) => 
          Object.entries(apps).map(([index, app]) => getAppView(app))
        )}
      </div>}
    </>
  }

  function getGrowList(apps: AdminAppData[]) {
    if(apps.length === 0) return <></>
    return <>{apps.map((app) => getAppView(app))}</>
  }

  function getPackList(resources: AdminAppResource, pack: string) {
    const grow_list: AdminAppData[] = []
    const default_list: AdminAppResource = {
      list: {},
      is_opened: resources.is_opened
    }

    for(let [resource_key, apps] of Object.entries(resources.list)) {
      for(let [index, app] of Object.entries(apps)) {
        if(app.next.list === 'grow') {
          grow_list.push(app)
        }else if(app.next.list === 'default'){
          default_list.list[resource_key] = default_list.list[resource_key] || []
          default_list.list[resource_key].push(app)
        }
      }
    }

    return <div>
      {getGrowList(grow_list)}
      {getDefaultList(default_list, pack)}
    </div>
  }

  if(!adminApps || !data || !open || !access) return <></>

  return <div className='flex flex-col border-r min-w-[150px]'>
    {Object.entries(adminApps).map(([pack, resources]) => (
      <div className='cursor-pointer' key={pack}>
        {getPackList(resources, pack)}
      </div>
    ))}
  </div>
}
 
export function Main({ children }: {
  children: React.ReactNode 
}){
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
  const globalContext = React.useContext(context)
  const [isOpened, setIsOpened] = useState(true)
  const [AdminApps, setAdminApps] = React.useState<AdminApps | undefined>(globalContext?.apps?.state)
  const { data } = useQuery(getAdminUserDataQuery, { fetchPolicy: "cache-first" })
  // const access = data?.getCurrentUser?.role?.data.resource_access

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
        <AdminAppList apps={apps} app={app} open={isOpened} path={path}/>
      </div>
    </div>
  }

  function getNavBar() {
    return <div className='
      max-md:w-full max-md:h-12 max-md:flex-row max-md:h-12 max-md:min-h-12 max-md:max-h-12 max-md:gap-x-3 max-md:px-3 max-md:py-2
      md:h-full md:flex-col md:w-12 md:min-w-12 md:max-w-12 md:gap-y-3 md:py-3 md:px-1
      flex items-center bg-gray-900 text-gray-200 
    '>
      {/* home */}
      <Link href={path} className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-9 h-9 max-md:w-10 max-md:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </Link>
      
      {/* user */}
      <div className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-9 h-9 max-md:w-10 max-md:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </div>
      
      <div className='flex-grow'></div>

      {/* apps */}
      <div onClick={() => setIsOpened(!isOpened)} className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
        <div className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-9 h-9 max-md:w-10 max-md:h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>
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