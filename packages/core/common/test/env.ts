import fs from "fs-extra"
import { TSA } from "@typestackapp/core"
import { tsapp } from "@typestackapp/core/env"

if (tsapp.env.TSAPP_ENV_TYPE == "prod") throw "Can't run tests in production enviroment"

// remove logs at the begining of all tests, setup() runs before each test file!
if (TSA.config["@typestackapp/core"].system.DEV_CLEAN_MESSAGES_LOGS) {
    fs.emptyDirSync(`${process.cwd()}/logs/email`)
    fs.emptyDirSync(`/tsapp/logs/email`)
}

TSA.init()