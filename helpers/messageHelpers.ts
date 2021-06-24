import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { MessageActionButtonsAlignment, MessageActionType } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { modifySttAttachment, removeSttAttachment } from "./attachmentHelpers";


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
        const { messageId } = data
        const messageUpdater = modify.getUpdater()
        let builder = await messageUpdater.message(messageId, sender!)
        await messageUpdater.finish(modifySttAttachment(data, sender, builder))

    } catch (error) {
        console.log(error)
    }
}


