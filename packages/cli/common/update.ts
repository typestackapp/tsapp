import fs from "fs"

export type UpdateOptions = {
    cwd: string // current working directory
}

export async function update(options: UpdateOptions) {
    const core = await import("@typestackapp/core")

    console.log(`Info, connecting to databases`)
    const db = await import("@typestackapp/core/common/db")
    await db.default.getInstance()

    console.log(`Info, loading all models`)
    const model_loader = await import("@typestackapp/core/common/model")
    await model_loader.ModelLoader.loadAllModels()

    console.log(`Info, connecting to rabbitmq`)
    const rabbitmq = await import("@typestackapp/core/common/rabbitmq/connection")
    await rabbitmq.ConnectionList.initilize()

    for (const [pack_key, pack] of Object.entries(core.packages)) {
        const update_path = `${options.cwd}/node_modules/${pack_key}/models/update`
        console.log(`Info, updating package: ${pack_key}`)

        if (!fs.existsSync(update_path)) {
            console.log(`Warning, no update scripts found for package: ${pack_key}`)
            continue
        }

        // read each file in the update folder
        const files = await fs.promises.readdir(update_path)
        for (const file of files) {
            const filePath = `${update_path}/${file}`

            // use .js files only
            if(file.split(".").pop() != "js")
                continue

            // use .js file only if .ts file exists
            if(!fs.existsSync(`${update_path}/${file.replace('.js', '.ts')}`))
                continue

            const module = await import(filePath)

            if (module.update) {
                const logFilePath = filePath.replace('.js', '.ts').split('/').slice(-2).join('/')
                console.log(`Info, running script: ${logFilePath}`)
                await module.update()
            }
        }
    }

    console.log(`Info, update completed`)
    process.exit(0)
}