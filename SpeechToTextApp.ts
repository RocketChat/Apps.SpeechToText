import {
    IAppAccessors,
    IConfigurationExtend,
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
import { settings } from './config/Setting';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { getAudioAttachment, isAudio } from './helpers/attachmentHelper';

export class SpeechToTextApp extends App implements IPreMessageSentExtend {


    // username alias

    public botName: string = "SpeechToText-BOT";

    /**
     * The bot avatar
     */
    public botAvatar: string = ":stt:";


    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
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
    }

    public async checkPreMessageSentExtend(
        message: IMessage,
        read: IRead,
        http: IHttp
    ): Promise<boolean> {

        console.log("this is what was returned", isAudio(message))

        return isAudio(message)

    }

    public async executePreMessageSentExtend(message: IMessage, extend: IMessageExtender, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
        console.log("NOW RUNNIGN POST")
        // collect fields required
        const audioAttachment = getAudioAttachment(message)
        const rid = message.room.id
        const fileId = message.file?._id
        const messageId = message.id
        const audioURL = audioAttachment.audioUrl
        // adding a slashcommand button with required fields
        extend.addAttachment({
            color: "#2576F5",
            actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
            text: "Click the button to queue audio for transcription",
            actions: [
                {
                    text: 'Transcribe',
                    type: MessageActionType.BUTTON,
                    msg_in_chat_window: true,
                    msg: `/stt ${rid} ${fileId} ${messageId} ${audioURL}`,
                },
            ],
        })
        return message
    }
}
