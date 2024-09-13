import { Message } from "amqplib/callback_api"
import { OnMessage, parseData } from "@typestackapp/core/common/rabbitmq/consumer"
import { EmailConfigModel } from "@typestackapp/core/models/config/email"
import { Email, EmailInput, EmailOptions } from "@typestackapp/core/common/email"
import { JobActionModel } from "@typestackapp/core/models/job"
import { Types } from "mongoose"

export type EmailConsumerInput = {
    input: Omit<EmailInput, '_id'> & { _id?: string }
    options?: EmailOptions
}

export const type = "EmailMessageConsumer"

export const onMessage: OnMessage = async ( channel, channel_config, consumer ) => {
    const email = await EmailConfigModel.findOne({"_id": new Types.ObjectId(consumer.options?.consumerTag)})
    if(!email) throw `Error, consumers onMessage email config does not exist _id: ${channel_config._id}`
    return ( msg: Message | null ) => {
        if( !msg ) { return }

        const _data = parseData<EmailConsumerInput>(msg.content)
        if(!_data) {
            console.log("Error, msg content is invalid JSON")
            console.log(msg)
            return channel.nack( msg )
        }

        const email_input = {
            ..._data.input,
            _id: new Types.ObjectId(_data.input._id)
        }
        
        // send email
        new Email(email_input, _data.options)
        .send(email)
        .then(async (doc) => {

            // update action if exists
            const step_identifier = _data?.options?.step?.step_identifier
            const action_id = _data?.options?.step?.action_id
            const action = await JobActionModel.findOne({ _id: action_id })
            if(!action) return
            const step = action.getStep(step_identifier)
            if( !step ) return
            step.status = "Executed"
            action.markModified("steps")
            await action?.save()
        })
        .catch((err) => {
            console.error(err)
            console.error(msg)
        })
        .finally(() => {
            channel.ack(msg)
        })
    }
}