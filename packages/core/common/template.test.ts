import { expect } from "chai"
import { Template } from "./template"

const DATA = {
    "UNSUB": "#000001",
    "TASKS": [{"name": "test1"}, {"name": "test2"}]
}

const T_0 = `
    <h1> {{UNSUB}} </h1>
    <div>
    {{#each TASKS}}
        <div> {{name}} </div>
    {{/each}}
    </div>
`

describe('Test template', () => {

    it('should create template', async () => {
        const output = Template.clean(new Template(T_0).render(DATA))
        const expected = Template.clean(`
            <h1> #000001 </h1>
            <div>
                <div> test1 </div>
                <div> test2 </div>
            </div>
        `)
        expect(expected).to.equal(output)
    })

})