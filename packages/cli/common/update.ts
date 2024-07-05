import fs from "fs"
import type { Transaction, UpdateInput, UpdateDocument } from "@typestackapp/core/models/update"
import { getPackageConfigs, sleep } from "./util"

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

    const { UpdateModel } = await import("@typestackapp/core/models/update")

    const session = await global.tsapp["@typestackapp/core"].db.mongoose.core.startSession()
    session.startTransaction()
    
    // sleep for 2 second, fixes Update error: MongoServerError: Unable to acquire IX lock on
    await sleep(2)

    const pack_updates: UpdateDocument[] = [];
    const pack_errors: UpdateDocument[] = [];

    console.log(`Info, updating packages:`)

    for (const [pack_key, pack] of Object.entries(getPackageConfigs())) {
        const update_path = `${options.cwd}/node_modules/${pack_key}/models/update`
        const pack_version = pack.version
        console.log(`Info, ${pack_key}:${pack_version}`)

        if (!fs.existsSync(update_path)) continue

        // read each file in the update folder
        const files = await fs.promises.readdir(update_path)
        for (const file of files) {
            const filePath = `${update_path}/${file}`

            // use .js files only
            if(file.split(".").pop() != "js")
                continue

            // use .js file only if .d.ts file exists
            if(!fs.existsSync(`${update_path}/${file.replace('.js', '.ts')}`))
                continue

            const module = await import(filePath)
            
            if(!module.transaction) continue

            const transaction = module.transaction as Transaction

            const update_input: UpdateInput = {
                pack: pack_key as any,
                version: pack_version,
                log: []
            }
        
            const update = await UpdateModel.findOneAndUpdate(
                { version: update_input.version }, update_input, 
                { upsert: true, new: true }
            )
        
            update.log.push({ type: "update", msg: "started" })

            const logFilePath = filePath.replace('.js', '.ts').split('/').slice(-2).join('/')
            console.log(`Info,  ${logFilePath}`)
            await transaction(session, update)
            .then(async () => {
                update.log.push({ type: "update", msg: "completed" })
                pack_updates.push(update)
            })
            .catch(async (err: any) => {
                console.log("Update error in package: ", pack_key)
                console.log("Update error:", err)
                update.log.push({ type: "error", msg: `${err}` })
                pack_errors.push(update)
            })
        }
    }

    if(pack_errors.length > 0) {
        console.log(`Error, update failed`)
        await session.abortTransaction()
        session.endSession()
    }else {
        console.log(`Info, update completed`)
        await session.commitTransaction()
        session.endSession()
    }

    // save each update
    for(const update of pack_updates){
        await update.save()
    }

    // save each error
    for(const update of pack_errors){
        await update.save()
    }

    console.log(`Info, update log saved`)
    process.exit(0)
}