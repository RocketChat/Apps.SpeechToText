import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageExtender,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent, IPreMessageSentExtend, MessageActionButtonsAlignment, MessageActionType } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { send } from 'process';
import { QueueAudioCommand } from './commands/SttCommand';
import { AppSetting, settings } from './config/Setting';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { getAudioAttachment, isAudio } from './helpers/attachmentHelpers';
import { Assembly } from './lib/providers/Assembly';
import { Microsoft } from './lib/providers/Microsoft';

export class SpeechToTextApp extends App implements IPostMessageSent {

    // username alias
    public botName: string = "SpeechToText-BOT";
    //Avatar alias
    public botAvatar: string = ":microphone2:";
    // host can either be live site URL or a tunnel url in case of localhost
    public host
    // provider for Transcription
    public provider
    // webhook to receive transcript completion statuses
    public webhook_url

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async onEnable(
        environmentRead: IEnvironmentRead,
        configModify: IConfigurationModify
    ): Promise<boolean> {
        // on enable set the webhook URL

        const [webhook] = this.getAccessors().providedApiEndpoints.filter((endpoint) => endpoint.path === 'stt-webhook')

        this.webhook_url = webhook.computedPath
        // Check for siteURL & set it to tunnel URL if localhost.
        const siteUrl = await environmentRead.getServerSettings().getValueById('Site_Url');
        if (siteUrl.includes('localhost')) {
            this.host = await environmentRead.getSettings().getValueById(AppSetting.TUNNEL)
        }
        // Initialize the Provider class and set provider
        const provider = await environmentRead.getSettings().getValueById("api-provider")
        switch (provider) {
            case AppSetting.ASSEMBLY:
                this.provider = new Assembly(this)
                break;
            case AppSetting.MICROSOFT:
                this.provider = new Microsoft(this)
                break;
        }
        return true;
    }


    public async onSettingUpdated(
        setting: ISetting,
        configModify: IConfigurationModify,
        read: IRead,
        http: IHttp
    ): Promise<void> {
        // set host to tunnel in case of localhost
        if (setting.id === AppSetting.TUNNEL) {
            this.host = setting.value
        }
        const provider = await read.getEnvironmentReader().getSettings().getValueById("api-provider")
        switch (provider) {
            case AppSetting.ASSEMBLY:
                this.provider = new Assembly(this)
                break;
            case AppSetting.MICROSOFT:
                this.provider = new Microsoft(this)
                // Register webhook *(Required in case of Microsot cognitive services)
                this.provider.registerWebhook(http, read)
                break;
        }
    }


    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        const siteUrl = await environmentRead.getServerSettings().getValueById('Site_Url');
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
        // Add a conditional setting for tunnel URL only in the case of localhost
        if (siteUrl.includes('localhost')) {
            await configuration.settings.provideSetting({
                id: AppSetting.TUNNEL,
                i18nLabel: "Tunnel URL",
                i18nDescription: "Create a tunnel to your localhost and paste the url here for the app to work",
                required: true,
                type: SettingType.STRING,
                public: true,
                packageValue: "",
            })
        } else {
            this.host = siteUrl.slice(0, -1)
        }

        // API Webhook
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new webhookEndpoint(this)],
        });

        // Slash command
        await configuration.slashCommands.provideSlashCommand(
            new QueueAudioCommand(this)
        );

    }



    public async checkPostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp
    ): Promise<boolean> {

        return isAudio(message)

    }

    // public async executePreMessageSentExtend(message: IMessage, extend: IMessageExtender, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
    //     // console.log(message)
    //     const audioAttachment = getAudioAttachment(message)
    //     const rid = message.room.id
    //     const fileId = message.file?._id
    //     const messageId = message.id
    //     const audioUrl = audioAttachment.audioUrl
    //     console.log("________________________-")

    //     console.log("________________________-")
    //     // adding a slashcommand button with required fields
    //     extend.addAttachment({
    //         color: "#2576F5",
    //         actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
    //         title: { value: "SpeechToText" },
    //         text: `Queue audio file for transcription...`,
    //         actions: [
    //             {
    //                 text: 'Transcribe',
    //                 type: MessageActionType.BUTTON,
    //                 msg_in_chat_window: true,
    //                 msg: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}`,
    //             },
    //         ],
    //     })
    //     console.log(extend.getMessage())

    //     return message

    // }

    public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void>{
        // console.log(message)
        // console.log('----->>>>messageID',message.id)
        const audioAttachment = getAudioAttachment(message)
        const rid = message.room.id
        const fileId = message.file?._id
        const messageId = message.id as string
        const audioUrl = audioAttachment.audioUrl
        const sender = message.sender

        const botUser = await read.getUserReader().getAppUser(this.getID())

        const messageUpdater = modify.getUpdater()
        let builder = await messageUpdater.message(messageId, sender!)
        let attachments = builder.getAttachments()

       try {
           builder.addAttachment({
               color: "#2576F5",
               actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
               title: { value: "SpeechToText" },
               text: `Queue audio file for transcription...`,
               actions: [
                   {
                       text: 'Transcribe',
                       type: MessageActionType.BUTTON,
                       msg_in_chat_window: true,
                       msg: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}`,
                   },
               ],
           }).setEditor(sender)
           await messageUpdater.finish(builder)

       } catch (error) {
           console.log(error)
       }
        // console.log(extend.getMessage())

        // return message

    }

}
