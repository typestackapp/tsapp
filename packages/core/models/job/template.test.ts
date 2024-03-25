import { expect } from "chai"
import { TemplateJobDocument, TemplateJobInput, TemplateJobModel, discriminator } from "./template"
import { CronJob } from "@typestackapp/core/common/job"
import { JobActionModel } from "."
import { LogModel } from "@typestackapp/core/models/log"

describe(`Test job type ${discriminator}`, () => {
    const job_id = "63281deb77824ea0ca9190fb"
    let job_input: TemplateJobInput
    let job: CronJob

    it('should clean up old data', async () => {
        await TemplateJobModel.deleteOne({_id: job_id})

        job_input = {
            status: "Active",
            description: "Test template job",
            run_on_startup: false,
            data: undefined,
            log: {
                enabled: true,
                max: 1
            },
            params: {
                sender: {
                    email: "test@email.com",
                    name: "Test Sender"
                },
                template: "Hi {{name}}, this is a test email."
            },
            created_by: global.core_tsapp_test.root_user._id,
            updated_by: global.core_tsapp_test.root_user._id
        }
    })

    it(`should prepeare job input data`, async () => {
        await TemplateJobModel.findOneAndUpdate(
            {_id: job_id},
            {_id: job_id, ...job_input},
            {upsert: true, new: true}
        )
    })

    it('should have template job in db', async () => {
        const test_job = await TemplateJobModel.findOne({_id: job_id})
        expect(test_job).not.to.be.null
    })

    it('should add job to job list', async () => {
        const test_job = await TemplateJobModel.findOne({_id: job_id})
        if(!test_job) throw "Job not found"
        job = await global.core_tsapp_test.jobs.add(test_job)
    })

    it('should execute job callback', async () => {
        await job.onTick()
        const test_job = await TemplateJobModel.findOne({parent_id: job_id})
        expect(test_job).not.to.be.null
    })

    it('should get template job actions with step status: "Executed"', async () => {
        const test_job = await TemplateJobModel.findOne({parent_id: job_id})
        if(!test_job) throw "Job not found"

        const actions = await JobActionModel.findOne({job_id: test_job._id})
        if(!actions) throw "Job action not found"
        
        expect(actions.steps).not.to.be.null
        expect(actions.steps.length).to.be.greaterThan(0)

        for(const step of actions?.steps || []) {
            expect(step.status).to.be.equal("Executed")
        }
    })

    it('should get child job with status Success', async () => {
        const test_job = await TemplateJobModel.findOne({parent_id: job_id})
        if(!test_job) throw "Job not found"
        expect(test_job.status).to.be.equal("Success")
    })


    it('should log job update', async () => { // doc._id
        const new_params = {
            sender: {
                email: "test",
                name: "test"
            },
            template: "test"
        }

        const test_job = await TemplateJobModel.findOne({_id: job_id})
        if(!test_job) throw "Job not found"
        test_job.params = new_params
        await test_job.save()

        // get log by doc._id = job_id
        const log = await LogModel.findOne({ "doc._id": job_id })
        if(!log) throw "Log not found"

        const doc = log.doc as TemplateJobDocument

        expect(doc._id).to.be.equal(job_id)
        expect(doc.params.sender.email).to.be.equal(job_input.params.sender.email)

        const test_job_updated = await TemplateJobModel.findOne({_id: job_id})
        if(!test_job_updated) throw "Job not found"
        expect(test_job_updated.params.sender.email).to.be.equal(new_params.sender.email)
    })
})