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
import { MessageActionButtonsAlignment, MessageActionType } from "@rocket.chat/apps-engine/definition/messages";
import { removeSttAttachment } from "../helpers/attachmentHelpers";
import { sendMessage, updateSttMessage } from "../helpers/messageHelpers";
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
        console.log("++++++++++++++")
        // Gettint the roomId and fileId from slash command arguments and userId from slash command context
        const [rid, fileId, messageId, audioUrl] = context.getArguments()
        const sender = await read.getUserReader().getById("rocket.cat");
        const room = context.getRoom()


        console.log({ rid, fileId, messageId, audioUrl, sender })
        const data = {
            rid, fileId, messageId, userId: context.getSender(), audioUrl
        }

        updateSttMessage({ text: "File Queued for transcription", color: "#ffbf00", messageId }, sender, modify)


        this.app.provider.queueAudio(data, http, read, modify)



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
