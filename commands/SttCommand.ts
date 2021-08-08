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
import { App } from "@rocket.chat/apps-engine/definition/App";
import { updateSttMessage } from "../helpers/messageHelpers";
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
        // Gettint the roomId and fileId from slash command arguments and userId from slash command context
        const [rid, fileId, messageId, audioUrl] = context.getArguments()
        const sender = await read.getUserReader().getAppUser(this.app.getID())
        const room = context.getRoom()


        // console.log({ rid, fileId, messageId, audioUrl, sender })
        // update status to queuing
        updateSttMessage({ text: "File Queued for transcription", color: "#ffbf00", messageId, button: true, buttonText: "Queued.." }, sender!, modify)

        const data = {
            rid, fileId, messageId, userId: context.getSender(), audioUrl
        }

        const queued = await this.app.provider.queueAudio(data, http, read, modify)
        if (!queued) {
            const sender = await read.getUserReader().getAppUser(this.app.getID())
            updateSttMessage({ text: "Failed, try again !!", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}` }, sender!, modify)

        }


        // try {
        //     const messageUpdater = modify.getUpdater()
        //     let builder = await messageUpdater.message(messageId, sender!)
        //     let attachments = builder.getAttachments()
        //     attachments = removeSttAttachment(attachments)

        //     builder.setAttachments([...attachments, {
        //         title: { value: "SpeechToText" },
        //         text: "File queued for transcription",
        //         color: "#ffbf00",

        //     }]).setEditor(sender)

        //     // sendMessage(modify, room, { text: "File Queued for transcription", userId: context.getSender().id })
        //     await messageUpdater.finish(builder)
        // } catch (error) {
        //     console.log(error)
        // }

    }
}
