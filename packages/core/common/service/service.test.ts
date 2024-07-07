import { tsapp } from "@typestackapp/core/env"
import { expect } from "chai"

jest.setTimeout(10000) // extend timeout to 10 seconds

describe('Test services', () => {
    it('should reach api endpoint', async () => {
        // fetch till it gets response from server
        let is_ok = false
        while(!is_ok) {
            is_ok = await fetch(`http://${tsapp.env.TSAPP_IP}:8000/api`)
            .then( response => is_ok = true )
            .catch( error => is_ok = false )
        }
    })

    it('should reach ping endpoint via alias', async () => {
        const is_ok = await fetch(`http://${tsapp.env.TSAPP_IP}:8000/api/core/v1.0/test/ping`)
        .then( response => response.json() )
        .then( json => json.status )
        expect(is_ok).to.be.equal(true)
    })

    it('should reach ping endpoint via package name', async () => {
        const is_ok = await fetch(`http://${tsapp.env.TSAPP_IP}:8000/api/@typestackapp/core/v1.0/test/ping`)
        .then( response => response.json() )
        .then( json => json.status )
        expect(is_ok).to.be.equal(true)
    })
})