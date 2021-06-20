import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { removeSttAttachment } from "./attachmentHelpers";


export const sendMessage = async (modify: IModify, room: IRoom, data) => {
    const { text, userId } = data
    const message = await modify.getCreator().startMessage();
    message
        .setRoom(room)
        .setEmojiAvatar(":stt:")
        .setText(text)
        .setGroupable(false);


    // console.log("MESSAGE HA YE", message)
    // if (room.type !== "l") {
    //     // do nothing
    //     await modify
    //         .getNotifier()
    //         .notifyUser(userId, message.getMessage());
    // } else {
    await modify.getCreator().finish(message);
    // }
}


export const updateSttMessage = async (data, sender: IUser, modify: IModify) => {
    try {
        const { messageId, text, color } = data
        const messageUpdater = modify.getUpdater()
        let builder = await messageUpdater.message(messageId, sender!)
        let attachments = builder.getAttachments()
        console.log("____+++++", attachments)
        attachments = removeSttAttachment(attachments)

        builder.setAttachments([...attachments, {
            title: { value: "SpeechToText" },
            text,
            color,
        }]).setEditor(sender)

        // sendMessage(modify, room, { text: "File Queued for transcription", userId: context.getSender().id })
        await messageUpdater.finish(builder)
    } catch (error) {
        console.log(error)
    }
}


