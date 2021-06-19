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
import { removeSttAttachment } from "../helpers/attachmentHelper";
import { sendMessage } from "../helpers/messageHelpers";


export class QueueAudioCommand implements ISlashCommand {
    public command = "stt-queue";
    public i18nDescription = "Queues an audio message for transcription";
    public i18nParamsExample = "";
    public providesPreview = false;

    constructor(private readonly app: App) { }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        // Gettint the roomId and fileId from slash command arguments and userId from slash command context
        const [rid, fileId, messageId, audioURL] = context.getArguments()
        const sender = await read.getUserReader().getById("rocket.cat");
        const room = context.getRoom()


        console.log({ rid, fileId, messageId, audioURL, sender })

        try {
            const messageUpdater = modify.getUpdater()
            let builder = await messageUpdater.message(messageId, sender!)
            let attachments = builder.getAttachments()
            attachments = removeSttAttachment(attachments)

            builder.setAttachments([...attachments, {
                title: { value: "SpeechToText" },
                text: "File queued for transcription",
                color: "#ffbf00",

            }]).setEditor(sender)

            // sendMessage(modify, room, { text: "File Queued for transcription", userId: context.getSender().id })
            await messageUpdater.finish(builder)
        } catch (error) {
            console.log(error)
        }

    }
}
