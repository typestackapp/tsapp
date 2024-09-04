import { expect } from "chai"
import { CampaignDocument, CampaignInput, CampaignModel, JobParams, producer, discriminator } from "./campaign"
import { sleep } from "@typestackapp/core/common/util"
import { Types } from "mongoose"
import { JobActionModel } from "."

jest.setTimeout(20000)

describe(`Test job type: ${discriminator}`, () => {
    var job: CampaignDocument
    var job_id = "63281deb77824ea0ca9190fa"

    it('should clean up old data', async () => {
        await CampaignModel.deleteOne({_id: job_id})
    })

    it('should create new job', async () => {
        const job_params: JobParams = {
            "templates": [
                {
                    "channel_id": "63453a61fe9cd72c40188adf",
                    "id": "template1",
                    "subject": "test subject",
                    "type": "Email",
                    "url": "https://httpbin.org/get",
                },
                {
                    "channel_id": "63453a61fe9cd72c40188adf",
                    "id": "template2",
                    "subject": "test subject",
                    "type": "Email",
                    "html": "<h1>Hi %{UNSUBSCRIBE_HASH}% </h1>"
                }
            ],
            "steps": [
                {
                    "id": "step1",
                    "is_first": true,
                    "template_id": "template1"
                }
            ],
            "inputs": [
                {
                    "external_id": "campaign-test-120",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000001",
                        "TASKS": [{"name": "test1"}, {"name": "test2"}]
                    }
                },
                {
                    "external_id": "campaign-test-121",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000002",
                        "TASKS": [{"name": "test3"}, {"name": "test4"}]
                    }
                },
                {
                    "external_id": "campaign-test-122",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000003",
                        "TASKS": [{"name": "test3"}, {"name": "test4"}]
                    }
                },
                {
                    "external_id": "campaign-test-123",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000004",
                        "TASKS": [{"name": "test3"}, {"name": "test4"}]
                    }
                },
                {
                    "external_id": "campaign-test-124",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000003",
                        "TASKS": [{"name": "test3"}, {"name": "test4"}]
                    }
                },
                {
                    "external_id": "campaign-test-125",
                    "email": global.tsapp["@typestackapp/core"].config.system.DEV_EMAIL,
                    "template_input": {
                        "UNSUBSCRIBE_HASH": "#000004",
                        "TASKS": [{"name": "test3"}, {"name": "test4"}]
                    }
                }
            ]
        }

        const job_input: CampaignInput = {
            _id: new Types.ObjectId(job_id),
            status: "Initilized",
            description: "Test campaign job",
            data: undefined,
            params: job_params,
            created_by: global.core_tsapp_test.root_user._id,
            updated_by: global.core_tsapp_test.root_user._id,
            log: { enabled: false, max: 0 },
        }

        job = await CampaignModel.create(job_input)
        await producer(job)
    })
    
    it('should have all emails sent via rabbitmq Email consumer queue', async () => {
        await sleep(1)
        const actions = await JobActionModel.find({ job_id: job._id })
        for(const action of actions) {
            expect(action.steps.length).to.be.equal(1)
            expect(action.steps[0].status).to.be.equal("Executed")
        }
    })
})