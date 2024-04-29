import { env, packages } from "@typestackapp/core"
import { expect } from "chai"

describe('Test services', () => {
    const pack = "@typestackapp/core"

    it('should reach ping endpoint via package name', async () => {
        const is_ok = await fetch(`http://${env.SERVER_DOMAIN_NAME}:8000/api/tsapp/v1.0/test/ping`)
        .then( response => response.json() )
        .then( json => json.status )
        expect(is_ok).to.be.equal(true)
    })

    it('should reach ping endpoint via package name', async () => {
        const is_ok = await fetch(`http://${env.SERVER_DOMAIN_NAME}:8000/api/${pack}/tsapp/v1.0/test/ping`)
        .then( response => response.json() )
        .then( json => json.status )
        expect(is_ok).to.be.equal(true)
    })
})