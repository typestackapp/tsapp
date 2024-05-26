import { env } from "@typestackapp/core"
import DB from "@typestackapp/core/common/db"
DB.getInstance()

import { ConnectionList } from "@typestackapp/core/common/rabbitmq/connection"
import express from "express"
import next from "next"
import { NextServerOptions } from "next/dist/server/next"

async function initilize() {
    await DB.getInstance()
    await ConnectionList.initilize()
}

const nextBuild = async (dir: string) => {
    return new Promise(async (resolve, reject) => {
        // change cwd directory to dir and run next build ./next
        const cwd = process.cwd()
        process.chdir(dir)
        const { exec } = await import("child_process")
        exec("npx next build ./next", (err, stdout, stderr) => {

            // CONSOLE LOG SERVER INFO
            console.log(`--------------------NEXT BUILD-------------------------`)
            console.log(`dir: ${dir}`)
            console.log(`-------------------------------------------------------`)

            if(err) {
                console.log(err)
                reject(err)
            }
            console.log(stdout)
            console.log(stderr)
            resolve(true)
            process.chdir(cwd)
        })
    })
}

initilize()
.then(async () => {
    const server = express()
    const port = 80
    const dir = `${process.cwd()}/node_modules/@typestackapp/core/codegen/next`
    const conf_dir = `${dir}/next.config`
    const nextConfig = (await import(conf_dir)).default

    const next_options: NextServerOptions = {
        dev: env.TYPE == "dev",
        port,
        dir,
        quiet: false,
        customServer: true,
        conf: nextConfig,
    }

    // build next
    if(next_options.dev == false) await nextBuild(dir)

    const app = next(next_options)
    await app.prepare()
    const handle = app.getRequestHandler()

    server.get("*", (req, res) => {
        return handle(req, res)
    })

    server.listen(port)
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------NEXT SERVER INFO---------------------`)
    console.log(`SERVER :  https://${env.SERVER_DOMAIN_NAME}`)
    console.log(`ENV    :  env.TYPE: ${env.TYPE}`)
    console.log(`-------------------------------------------------------`)
})