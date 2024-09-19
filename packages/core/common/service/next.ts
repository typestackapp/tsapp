import { tsapp } from "@typestackapp/core/env"
import { TSA } from "@typestackapp/core"
import express from "express"
import next from "next"
import { NextServerOptions } from "next/dist/server/next"

const nextBuild = async (dir: string) => {
    return new Promise(async (resolve, reject) => {
        // change cwd directory to dir and run next build ./next
        const { exec } = await import("child_process")
        exec(`npx next build ./codegen/next/`, { cwd: dir }, (err, stdout, stderr) => {
            // CONSOLE LOG SERVER INFO
            console.log(`--------------------NEXT BUILD-------------------------`)
            console.log(`dir: ${dir}`)
            console.log(`cwd: ${process.cwd()}`)
            console.log(`-------------------------------------------------------`)

            if(err) {
                console.log(err)
                reject(err)
            }else {
                console.log(stdout)
                console.log(stderr)
                resolve(true)
            }
        })
    })
}

TSA.init()
.then(async () => {
    const server = express()
    const port = 80
    const dir = `${process.cwd()}/node_modules/@typestackapp/core/codegen/next`
    const conf_dir = `${dir}/next.config`
    const nextConfig = (await import(conf_dir)).default

    const next_options: NextServerOptions = {
        dev: tsapp.env.TSAPP_ENV_TYPE == "dev",
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

    server.all("*", (req, res) => {
        return handle(req, res)
    })

    server.listen(port)
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------NEXT SERVER INFO---------------------`)
    console.log(`SERVER :  https://${tsapp.env.TSAPP_DOMAIN_NAME}`)
    console.log(`ENV    :  env.TYPE: ${tsapp.env.TSAPP_ENV_TYPE}`)
    console.log(`-------------------------------------------------------`)
})