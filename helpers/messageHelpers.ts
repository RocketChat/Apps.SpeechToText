import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { MessageActionButtonsAlignment, MessageActionType } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { removeSttAttachment } from "./attachmentHelpers";


export const sendMessage = async (modify: IModify, room: IRoom, data) => {
    const { text, userId } = data
    const message = await modify.getCreator().startMessage();
    message
        .setRoom(room)
        .setEmojiAvatar(":microphone2:")
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
        const { messageId, text, color, button = false, buttonText = "", buttonMessage = "" } = data
        const messageUpdater = modify.getUpdater()
        let builder = await messageUpdater.message(messageId, sender!)
        let attachments = builder.getAttachments()
        attachments = removeSttAttachment(attachments)

        builder.setAttachments([...attachments, {
            title: { value: "SpeechToText" },
            text,
            color,
            actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
            actions: button === true ? [
                {
                    text: buttonText,
                    type: MessageActionType.BUTTON,
                    msg_in_chat_window: true,
                    msg: buttonMessage,
                },
            ] : [],
        }]).setEditor(sender)

        // sendMessage(modify, room, { text: "File Queued for transcription", userId: context.getSender().id })
        await messageUpdater.finish(builder)
    } catch (error) {
        console.log(error)
    }
}


