import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";


export const sendMessage = async (modify: IModify, room: IRoom, data) => {
    const { text, userId } = data
    const message = await modify.getCreator().startMessage();
    message
        .setRoom(room)
        .setEmojiAvatar(":stt:")
        .setText(text)
        .setGroupable(false);


    console.log("MESSAGE HA YE", message)
    // if (room.type !== "l") {
    //     // do nothing
    //     await modify
    //         .getNotifier()
    //         .notifyUser(userId, message.getMessage());
    // } else {
    await modify.getCreator().finish(message);
    // }
}
