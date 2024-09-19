
import { Document, Model, Schema, Types } from "mongoose"
import { IJobInput, IJobDocument, TSA } from "@typestackapp/core"
import { IJobActionInput, IJobStepInput } from "@typestackapp/core"
import { LogOptionsDocument, logOptionsSchema } from "@typestackapp/core/models/log"
import { MongooseDocument } from "@typestackapp/core/models/util"

export interface JobInput<TParams, TData = undefined> extends IJobInput { _id?: Types.ObjectId, params: TParams, data: TData }
export interface JobActionInput extends IJobActionInput { steps: JobStepInput<any>[]}
export interface JobStepInput<TData> extends IJobStepInput { data: TData }

export type JobActionDocument = MongooseDocument & JobActionInput & {
    getStep<TStep>(step_identifier: string | undefined): JobStepInput<TStep> | undefined
}

export interface JobDocument<TParams, TData = undefined> extends Document, IJobDocument {
    _id: Types.ObjectId
    params: TParams,
    data: TData,
    log: LogOptionsDocument,
    onTick: () => Promise<void>
    action: () => Promise<JobActionDocument>
}

export const jobSchema = new Schema<JobDocument<any>, Model<JobDocument<any>>, JobDocument<any>>({
    description: { type: String, index: true, required: true },
    time_zone: { type: String, index: true, required: true, default: "UTC" },
    cron: { type: String, index: true },
    run_on_startup: { type: Boolean, index: true, required: true, default: false },
    status: { type: String, index: true, required: true, default: "Disabled" },
    parent_id: { type: Schema.Types.ObjectId, ref: 'jobs', index: true },
    error: { type: String, index: true },
    log: { type: logOptionsSchema, index: true, required: true, default: {} },
    created_by: { type: Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'users', index: true, required: true },
}, { timestamps: true })

export const stepSchema = new Schema<JobStepInput<any>, {}, JobStepInput<any>>({
    identifier: { type: String, index: true, required: true },
    status: { type: String, index: true, required: true },
    data: { type: Schema.Types.Mixed, index: true },
    error: { type: String, index: true },
}, { timestamps: false })

export const jobActionSchema = new Schema<JobActionDocument, {}, JobActionDocument>({
    job_id: { type: Schema.Types.ObjectId, ref: 'jobs', index: true },
    steps: { type: [stepSchema] },
}, { timestamps: true })

// add search index for job_type, time_zone, cron, description, params fields
jobSchema.index(
    { job_type: "text", time_zone: "text", cron: "text", description: "text", params: "text" },
    { name: "job_search_index" }
)

jobActionSchema.methods.getStep = function(step_identifier){
    const step = this.steps.find(step => step.identifier === step_identifier)
    return step
}

jobSchema.methods.action = async function(){
    const new_action: IJobActionInput = {
        job_id: this._id,
        steps: []
    }
    return await JobActionModel.create(new_action)
}

jobSchema.methods.onTick = async function() {
    throw "Job onTick not implemented"
}

// log job after save
jobSchema.post('save', async function() {
    await this.log.add(this)
})

// log job after update
jobSchema.post('findOneAndUpdate', async function() {
    const job = await this.model.findOne(this.getQuery()) as unknown as JobDocument<any> | null
    if (job) await job.log.add(job)
})

// before delete job, delete all job actions
jobSchema.pre('deleteOne', async function(next) {
    const job = await this.model.findOne(this.getQuery()) as unknown as JobDocument<any> | null
    if (job) await JobActionModel.deleteMany({ job_id: job._id })
    next()
})

// before delete job, delete all child jobs
jobSchema.pre('deleteOne', async function(next) {
    const job = await this.model.findOne(this.getQuery()) as unknown as JobDocument<any> | null
    if (job) await JobModel.deleteMany({ parent_id: job._id })
    next()
})

export const JobModel = TSA.db["@typestackapp/core"].mongoose.core.model("jobs", jobSchema)
export const JobActionModel = TSA.db["@typestackapp/core"].mongoose.core.model("job_actions", jobActionSchema)