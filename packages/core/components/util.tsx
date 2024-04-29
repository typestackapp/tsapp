import React, { useState } from 'react'
import { apps as next_apps } from '@typestackapp/core/codegen/next/apps'
import Link from 'next/link'
import TSAppClient from '@typestackapp/core/models/user/app/oauth/client/tsapp'
import type { AuthOutput } from "@typestackapp/core/express/auth"
import { ValuesType } from 'utility-types'
import { AdminParams, getAdminUserDataQuery } from '@typestackapp/core/components/admin'
import { useQuery } from "@apollo/client"
import { useParams } from 'next/navigation'
import { context } from '@typestackapp/core/components/global'
import { checkResourceAccess } from '@typestackapp/core/models/user/access/util'
import type { AccessCheckOptions } from '@typestackapp/core/models/user/access/middleware'
import { Packages } from '@typestackapp/core'

export type GridProps = {
  heading?: {
    title: string,
    size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  },
  children: React.ReactNode
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

const urlEncode = (str: string) => {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

const getNavPath = (app: any, path: string): string => {
  return `${path}/${urlEncode(app.alias || app.pack)}/${urlEncode(app.resource)}/${urlEncode(app.action)}`
}

export function UserNav({client, path}: {
  client: TSAppClient,
  path: string
}){
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
      <span className="block text-sm text-gray-900 dark:text-white">email: {data.getCurrentUser?.email || ""}</span>
      
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

export function TopNav({sideNavState, setSideNavState, client, path}: {
  sideNavState: boolean, 
  setSideNavState: React.Dispatch<React.SetStateAction<boolean>>
  client: TSAppClient,
  path: string
}){
  const [userNavState, setUserNavState] = React.useState(false)

  return (
    <div>
      <div className='flex items-center h-12 bg-gray-800 text-gray-200 px-4 gap-x-2'>

        <div
          onClick={() => setSideNavState(!sideNavState)}
          className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </div>

        
        <Link href={path} className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </Link>

        <div className='flex-grow'></div>

        <div className='h-8 bg-gray-700 rounded-md flex items-center grow max-md:mx-[10px] max-w-[700px]'>
          <input
            className='text-base px-3 w-full bg-gray-700 focus:outline-none'
            id='search'
            type='text'
            placeholder='search'
          />
          <div className='p-2'>
            <button
              className='bg-gray-700 rounded-full focus:outline-none w-6 h-6 flex items-center justify-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox='0 0 24 24' strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
          </div>
        </div>

        <div className='flex-grow'></div>
        
        <div
          onClick={() => setUserNavState(!userNavState)}
          className='hover:text-gray-300 focus:text-gray-300 focus:outline-none cursor-pointer'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
      </div>

      {userNavState &&
        <div className='absolute right-0 mt-2 mr-2'>
          <UserNav client={client} path={path}/>
        </div>
      }
    </div>
  )
}

export type SideNavApp = ValuesType<typeof next_apps>
export type SideNavAppData = SideNavApp & { is_active: boolean }
export type SideNavAppResource = {
  list: { [resource: string]: SideNavAppData[] }
  is_opened: boolean
}

export type SideNavApps = {
  [pack: string]: SideNavAppResource
}

export function getSideNavApps(apps: SideNavApp[], active_app: SideNavApp | undefined): SideNavApps {
  var sideNavApps: SideNavApps = {}

  apps.forEach((app) => {
    var resources: SideNavAppResource = sideNavApps[app.next.group] || {
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

    sideNavApps[app.next.group] = resources
  })

  return sideNavApps
}

export function SideNav({ open, path, apps, app }: {
  apps: SideNavApp[], // app list
  app: SideNavApp | undefined, // active app
  open: boolean, // side nav state open | closed
  path: string, // current base path
}) {
  const globalContext = React.useContext(context)
  const { data } = useQuery(getAdminUserDataQuery, { fetchPolicy: "cache-first" })
  const access = data?.getCurrentUser?.role?.data.resource_access
  const [sideNavApps, setSideNavApps] = React.useState<SideNavApps | undefined>(globalContext?.apps?.state)

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
      const sideNavAppState = getSideNavApps(_apps, app)
      globalContext.apps = {state: sideNavAppState, setState: setSideNavApps}
      setSideNavApps(sideNavAppState)
    }

    if(!sideNavApps || !app || !sideNavApps[app.next.group]) return

    const side_nav_active_app = sideNavApps[app.next.group].list[app.resource]
    .find((side_nav_app) => side_nav_app.pack === app.pack && side_nav_app.resource === app.resource && side_nav_app.action === app.action)
    
    if(!side_nav_active_app) return

    // set all apps to inactive
    Object.entries(sideNavApps).forEach(([group, resources]) => {
      Object.entries(resources.list).forEach(([resource, apps]) => {
        apps.forEach((app) => {
          app.is_active = false
        })
      })
    })

    // set active app
    side_nav_active_app.is_active = true

    setSideNavApps({...sideNavApps})
  }, [app, data])

  function getAppView(app: SideNavAppData) {
    return <div key={app.next.hash} className={app.is_active? 'bg-gray-300 border-b' : 'border-b hover:bg-gray-100'}>
      <Link href={getNavPath(app, path)} >
        <div className={app.next.list == 'grow'? 'px-3 py-2': 'px-3 py-2 ml-3'}>
          {app.next.title}
        </div>
      </Link>
    </div>
  }

  function getDefaultList(resources: SideNavAppResource, pack: string) {
    if(Object.keys(resources.list).length === 0) return <></>
    return <>
      <div className='border-b'>
        <div className='px-3 py-2 hover:bg-gray-100' onClick={() => {
            if(!sideNavApps) return
            sideNavApps[pack].is_opened = !resources.is_opened
            setSideNavApps({...sideNavApps})
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

  function getGrowList(apps: SideNavAppData[]) {
    if(apps.length === 0) return <></>
    return <>{apps.map((app) => getAppView(app))}</>
  }

  function getPackList(resources: SideNavAppResource, pack: string) {
    const grow_list: SideNavAppData[] = []
    const default_list: SideNavAppResource = {
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

  if(!sideNavApps || !data || !open || !access) return <></>

  return <div className='flex flex-col border-r min-w-[150px]'>
    {Object.entries(sideNavApps).map(([pack, resources]) => (
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