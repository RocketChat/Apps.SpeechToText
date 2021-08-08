import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SpeechToTextApp } from "../SpeechToTextApp";
import { modifySttAttachment } from "./attachmentHelpers";

export async function notifyUser(app: SpeechToTextApp, user: IUser, modify: IModify, room: IRoom, message: string): Promise<void> {

    const botUser = (await app.getAccessors()
        .reader.getUserReader()
        .getAppUser(app.getID())) as IUser;

    const msg = modify.getCreator().startMessage()
        .setSender(botUser)
        .setUsernameAlias(app.botName)
        .setEmojiAvatar(app.botAvatar)
        .setText(message)
        .setRoom(room)
        .getMessage();
    try {
        await modify.getNotifier().notifyUser(user, msg);
    } catch (error) {
        console.log(error)
        app.getLogger().log(error);
    }
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


