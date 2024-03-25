
import { Packages, config } from "@typestackapp/cli/config"
import fs from "fs"

// export static class named ModelLoader
export class ModelLoader {
    static loadedModels: { [key: string]: boolean } = {};

    static async loadAllModels() {
        for (const pack of Object.keys(config) as Packages[]) {
            await ModelLoader.loadModels(pack)
        }
    }

    static async loadModels(pack: Packages) {
        if (ModelLoader.loadedModels[pack]) return;

        ModelLoader.loadedModels[pack] = true;
        const path = `${process.cwd()}/node_modules/${pack}/models/`;

        const loadAllModels = async (path: string) => {
            const files = fs.readdirSync(path);
            for (const file of files) {
                if (fs.lstatSync(`${path}/${file}`).isDirectory()) {
                    await loadAllModels(`${path}/${file}`)
                    continue
                }

                // skip non js files
                if (!file.endsWith(".js")) continue;
                // skip map.js files
                if (file.endsWith(".map.js")) continue;
                
                await import(`${path}/${file}`)
                .then((model) => {})
                .catch((err) => {
                    ///console.log(err);
                })
                
            }
        }

        // skipt if folder does not exist
        if( !fs.existsSync(path) ) return;

        loadAllModels(path);
    }
}


