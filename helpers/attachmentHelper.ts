import { IRead } from "@rocket.chat/apps-engine/definition/accessors"
import { IMessage, IMessageAttachment } from "@rocket.chat/apps-engine/definition/messages"


export function isAudio(message: IMessage): boolean {
    let isAudio: boolean = false
    // condition to check for audio in attachment
    const condition = (attachment) => attachment.audioUrl && attachment.audioUrl.length > 0

    if (message.attachments && message.attachments.length > 0) {
        isAudio = message.attachments.some(condition)
    }
    return isAudio

}

// function to vaidate the audio duration
export function getAudioAttachment(message: IMessage): IMessageAttachment {
    // get audio attachment from the message
    // can use ! because of the isAudio Check
    const audioFile = message.attachments!.find(attachment => attachment.audioUrl!.length > 0)

    return audioFile!
}

// function to vaidate the audio duration
// export async function isValid(message: IMessage, read: IRead): Promise<boolean> {
//     // get min audio duration from user settings
//     const duration = await read.getEnvironmentReader().getSettings().getValueById('min-duration')

//     // get audio attachment from the message
//     // can use ! because of the isAudio Check
//     const audioFile = message.attachments!.find(attachment => attachment.audioUrl!.length > 0)

//     console.log("PIA", { audioFile, duration })

//     return false
// }
