import { Attachment as MailAttachment, Address } from "nodemailer/lib/mailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import nodemailer from "nodemailer"
import { Channel } from "amqplib/callback_api"
import { ObjectId } from "mongodb"
import { Types } from "mongoose"
import moment from "moment"
import fs from "fs-extra"
import { EmailConfigDocument } from "../models/config/email"
import { EmailMessageDocument, EmailMessageModel, EmailMessageInput } from "../models/message/email"
import { EmailConsumerInput } from "../consumers/message/email"
import { ContactInput, updateContact} from "../models/contact"
import { ChannelConfigDocument} from "../models/config/channel"

export interface Attachment extends MailAttachment {}

export interface JobActionStepId {
    action_id: Types.ObjectId
    step_identifier: string
}

export interface EmailOptions {
    save_html?: boolean // content of email will be saved to db
    step?: JobActionStepId // reference to job action step, will be used to update status
    external_id?: string // reference to external id, will be used to create new contact
}

export interface EmailInput {
    receivers: string[],
    subject: string,
    html: string,
    attachments: Attachment[],
    from?: EmailAddress
}

export interface EmailAddress {
    name?: string,
    address?: string
}

export class Email {
    readonly from?: EmailAddress
    readonly to: string[]
    readonly subject: string
    readonly options?: EmailOptions
    public html: string
    public attachments: Attachment[] = []
    
    constructor( input: EmailInput, options?: EmailOptions ) {
        const send_all_to_dev = global.tsapp["@typestackapp/core"].config.system.DEV_SEND_MESSAGES_TO_DEV
        const dev_emails = global.tsapp["@typestackapp/core"].config.system.DEV_SEND_EMAIL
        this.options = options
        this.from = input.from
        this.to = (send_all_to_dev)? dev_emails: input.receivers
        this.subject = input.subject
        this.html = input.html
        this.attachments = input.attachments
    }

    public async send(email_config: EmailConfigDocument): Promise<EmailMessageDocument> {
        var _envelope: SMTPTransport.SentMessageInfo | undefined = undefined
        var error: string | undefined = undefined

        try{
            const address = this.from?.address || email_config.data.from.address
            const name = this.from?.name || email_config.data.from.name
            const from = { address, name }

            if(global.tsapp["@typestackapp/core"].config.system.SEND_EMAILS) {
                _envelope = await nodemailer
                .createTransport( email_config.data.auth )
                .sendMail({ ...this,  from })
            }else {
                _envelope = this.getMockEmail(from)
            }
            
        }catch(err) {
            error = this.getErrorMsg(err)
        }

        for await(const receiver of this.to) {
            const external_id =  (this.options?.external_id)? [this.options.external_id]: ["unknown"]
            const contact: ContactInput = {
                external_id: external_id,
                value: receiver,
                type: "Email"
            }
            await updateContact(contact)
        }

        var msg_input: EmailMessageInput = {
            data: {
                email: this.to,
                res: _envelope,
                error: error,
                html: (this.options?.save_html)? this.html: undefined,
                options: (this.options)? this.options: undefined
            }
        }

        return EmailMessageModel.create(msg_input)
    }

    private getErrorMsg(err: unknown): string {
        var error
        try {
            error = JSON.stringify(err)
        } catch (error) {
            error = "unknown error"
        }
        return `Email not sent. To: ${this.to.join(", ")} Subject: ${this.subject}, Error: ${error}`
    }

    getMockEmail(from: EmailAddress): SMTPTransport.SentMessageInfo {
        // return mock email response
        const _id = new ObjectId().toString()
        const _time = moment().format("HHmmss")
        const _path = `${process.cwd()}/logs/email/`
        const _name = `${_path}${_time}-${_id}`

        const _envelope: SMTPTransport.SentMessageInfo = {
            envelope: {
                from: `${from?.name} <${from?.address}>`,
                to: this.to
            },
            messageId: _name,
            accepted: ["ok"],
            rejected: [],
            pending: [],
            response: "250 0 0 0 ok"
        }

        // save email to file
        var obj: {html?: string} = { html: "---" }
        Object.assign(obj, this)
        delete obj.html

        const _file = JSON.stringify({ _envelope, email: obj }, null, 4)
        !fs.existsSync(_path) && fs.mkdirSync(_path, { recursive:true }) // create dir if not exist
        fs.writeFileSync(_name+".json", _file)
        fs.writeFileSync(_name+".html", this.html)
        return _envelope
    }

    getInput(): EmailInput {
        return {
            receivers: this.to,
            subject: this.subject,
            html: this.html,
            attachments: this.attachments,
            from: this.from,
        }
    }

    getConsumerInput(): EmailConsumerInput {
        return {
            input: this.getInput(),
            options: this.options
        }
    }

    async sendToQueue( channel_config: ChannelConfigDocument ): Promise<boolean> {
        if(channel_config.data.type != "EmailMessageConsumer") throw "Channel is not EmailMessageConsumer type"
        const email_consumer_data = this.getConsumerInput()
        const case_buf = Buffer.from( JSON.stringify( email_consumer_data ) )
        const queue_id = channel_config._id.toString()
        const channel: Channel = global.tsapp["@typestackapp/core"].rmq.core.getChannel()
        return channel.sendToQueue( queue_id, case_buf, channel_config.data.options?.publish )
    }
}