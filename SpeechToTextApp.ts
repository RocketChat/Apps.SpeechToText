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
import { checkForAudio } from './helpers/attachmentHelper';

export class SpeechToTextApp extends App implements IPreMessageSentExtend {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        // user settings
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
        // API
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

        console.log("this is what was returned", checkForAudio(message))

        return checkForAudio(message)

    }

    public async executePreMessageSentExtend(message: IMessage, extend: IMessageExtender, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
        console.log("NOW RUNNIGN POST")
        return message
    }





}
