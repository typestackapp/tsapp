import { Schema, Document, Model } from "mongoose"
import type { ILogOptionsDocument, ILogOptionsInput } from "@typestackapp/core"

export interface LogOptionsDocument extends ILogOptionsDocument {
    add(doc: Document): Promise<null | LogDocument>
}
export interface LogOptionsInput extends ILogOptionsInput {}
export const logOptionsSchema = new Schema<LogOptionsDocument, Model<LogOptionsDocument>, LogOptionsDocument>({
    enabled: { type: Boolean, required: true, index: true, default: true },
    max: { type: Number, required: true, index: true, default: 1000 },
},{ _id: false })

export type LogInput<TDoc = Document> = {
    doc: TDoc
}

export interface LogDocument extends Document, LogInput {
    collectionName?: string
    modelName?: string
}

export const logSchema = new Schema<LogDocument, Model<LogDocument>, LogDocument>({
    doc: { type: Schema.Types.Mixed, required: true, index: true },
    collectionName: { type: String, required: false, index: true },
    modelName: { type: String, required: false, index: true },
}, { timestamps: true })

logSchema.pre('save', async function(next) {
    this.collectionName = this.doc?.collection?.collectionName as string
    const constructor = this.doc?.constructor as unknown as Model<Document>
    this.modelName = constructor.modelName   
    this.doc = this.doc.toJSON() // remove reference to original document
    next()
})

logOptionsSchema.methods.add = async function(doc){
    if(this.max != 0) {
        // get total count of documents
        const count = await LogModel.countDocuments({'doc._id': doc._id.toString()})

        // if count is greater than max, remove oldest documents
        if (count >= this.max) {
            const docs = await LogModel.find({'doc._id': doc._id.toString()}).sort({createdAt: 1}).limit(count - this.max + 1)
            await LogModel.deleteMany({ _id: { $in: docs.map(doc => doc._id) }})
        }
    }

    if (this.enabled) {
        const DocModel = doc.constructor as unknown as Model<Document>
        const db_version_of_doc = await DocModel.findById(doc._id)
        return await LogModel.create({doc: db_version_of_doc})
    }

    return null
}

export const LogModel = global.tsapp["@typestackapp/core"].db.mongoose.core.model('logs', logSchema)