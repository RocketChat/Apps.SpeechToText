import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    IHttp,
    IModify,
    IRead,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { notifyUser, updateSttMessage } from "../helpers/messageHelpers";
import { SpeechToTextApp } from "../SpeechToTextApp";



export class QueueAudioCommand implements ISlashCommand {
    public command = "stt-queue";
    public i18nDescription = "Queues an audio message for transcription";
    public i18nParamsExample = "";
    public providesPreview = false;

    constructor(private readonly app: SpeechToTextApp) {
    }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {

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

        const user = context.getSender()
        const room = context.getRoom()
        // Check to ensure all user settings are provided
        const settings_provided = !!api_key && !!api_provider && !!jwt_secret

        if (settings_provided) {
            const [rid, fileId, messageId, audioUrl] = context.getArguments()
            const botUser = await read.getUserReader().getAppUser(this.app.getID())
            // Update the file status
            updateSttMessage({ text: "Queuing file for transcription", color: "#ffbf00", messageId, button: true, buttonText: "Queued.." }, botUser!, modify)

            const data = {
                rid, fileId, messageId, userId: context.getSender(), audioUrl
            }

            const queued = await this.app.provider.queueAudio(data, http, read, modify)
            // Update the file status if queued successfully
            if (queued.status === false) {
                updateSttMessage({ text: queued.message, color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}` }, botUser!, modify)
            } else {
                updateSttMessage({ text: queued.message, color: "#2BE0A5", messageId, button: true, buttonText: "Queued" }, botUser!, modify)
            }

        } else {
            // notify if settings are not provided
            await notifyUser(this.app, user, modify, room, "User settings missing!!! Please provide all user settings")
        }

    }
}
