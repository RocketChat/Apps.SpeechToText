import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageExtender,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPreMessageSentExtend, MessageActionButtonsAlignment, MessageActionType } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
import { QueueAudioCommand } from './commands/SttCommand';
import { AppSetting, settings } from './config/Setting';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { getAudioAttachment, isAudio } from './helpers/attachmentHelpers';
import { sendMessage } from './helpers/messageHelpers';
import { SttInterface } from './lib/interface/SttInterface';
import { Assembly } from './lib/providers/Assembly';
import { Microsoft } from './lib/providers/Microsoft';
import { Rev } from './lib/providers/Rev';

export class SpeechToTextApp extends App implements IPreMessageSentExtend {


    // username alias
    public botName: string = "SpeechToText-BOT";
    //Avatar alias
    public botAvatar: string = ":microphone2:";

    public webhook_url: string

    public provider

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }


    /**
     * Updates room ids for members and messages when settings are updated
     *
     * @param setting
     * @param configModify
     * @param read
     * @param http
     */
    public async onSettingUpdated(
        setting: ISetting,
        configModify: IConfigurationModify,
        read: IRead,
        http: IHttp
    ): Promise<void> {
        if (setting.id === "api-provider") {
            switch (setting.value) {
                case AppSetting.ASSEMBLY:
                    this.provider = new Assembly(this)
                    break;
                case AppSetting.MICROSOFT:
                    this.provider = new Microsoft(this)
                    this.provider.registerWebhook(http, read)
                    break;
                case AppSetting.REV:
                    this.provider = new Rev(this)
                    break;
            }
        }
    }

    /**
     * @param environmentRead
     * @param configModify
     */
    public async onEnable(
        environmentRead: IEnvironmentRead,
        configModify: IConfigurationModify
    ): Promise<boolean> {
        const siteUrl = await environmentRead.getServerSettings().getValueById('Site_Url');
        const [webhook] = this.getAccessors().providedApiEndpoints.filter((endpoint) => endpoint.path === 'stt-webhook')

        const setting = await environmentRead.getSettings().getById("api-provider")
        switch (setting.value) {
            case AppSetting.ASSEMBLY:
                this.provider = new Assembly(this)
                break;
            case AppSetting.MICROSOFT:
                this.provider = new Microsoft(this)
                break;
            case AppSetting.REV:
                this.provider = new Rev(this)
                break;
        }
        return true;
    }



    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        // user settings
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
        // API Webhook
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new webhookEndpoint(this)],
        });
        // Slash command
        await configuration.slashCommands.provideSlashCommand(
            new QueueAudioCommand(this)
        );
    }

    public async checkPreMessageSentExtend(
        message: IMessage,
        read: IRead,
        http: IHttp
    ): Promise<boolean> {

        // return isAudio(message)
        return true

    }

    public async executePreMessageSentExtend(message: IMessage, extend: IMessageExtender, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {


        // check for settings
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const api_provider: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-provider");
        const jwt_secret: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("jwt-secret");

        if (api_key.length > 0 && api_provider.length > 0 && jwt_secret.length > 0) {
            // collect fields required

            const audioAttachment = getAudioAttachment(message)
            const rid = message.room.id
            const fileId = message.file?._id
            const messageId = message.id
            const audioUrl = audioAttachment.audioUrl
            // adding a slashcommand button with required fields
            extend.addAttachment({
                color: "#2576F5",
                actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
                title: { value: "SpeechToText" },
                text: "Queue audio file for transcription",
                actions: [
                    {
                        text: 'Transcribe',
                        type: MessageActionType.BUTTON,
                        msg_in_chat_window: true,
                        msg: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}`,
                    },
                ],
            })
        } else {
            // console.log("Settings not provided")
            // sendMessage(modify, message.room.id, { message: "HIHI" })
        }


        return message
    }
}
