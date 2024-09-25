import fs from 'fs'
import { getPackageConfigs } from './util'

export type InitOptions = {
    cwd: string
    env?: string
}

export const init = async (options: InitOptions) => {
    const env_name = options.env || 'dev'
    const packages = getPackageConfigs()
    // copy package/example.env to package/${options.env}.env
    for(const [pack_key, _config] of Object.entries(packages)) {
        const src = `${options.cwd}/packages/${_config.alias}/example.env`
        const dest = `${options.cwd}/packages/${_config.alias}/${env_name}.env`
        if(fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest)
            console.log(`Copied ${src} to ${dest}`)
        }else if(fs.existsSync(dest)) {
            console.log(`File ${dest} already exists`)
        } else if (!fs.existsSync(src)) {
            console.log(`File ${src} does not exist`)
        }
    }
}