import { config } from '@typestackapp/cli/config'
import { UserDocument } from '@typestackapp/core/models/user'
import { EmailConfigDocument } from '@typestackapp/core/models/config/email'
import { ChannelConfigDocument } from '@typestackapp/core/models/config/channel'
import { TokenDocument } from '@typestackapp/core/models/user/token'
import { JobList } from '@typestackapp/core/common/job'
import { Connections as RmqConnections} from '@typestackapp/core/common/rabbitmq/connection'

declare global {
    var core_tsapp_test: {
        root_user: UserDocument
        email_config: EmailConfigDocument
        email_channel_config: ChannelConfigDocument
        api_key: TokenDocument
        jobs: JobList
    }
}