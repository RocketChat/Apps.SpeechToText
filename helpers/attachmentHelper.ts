import { IMessage, IMessageAttachment } from "@rocket.chat/apps-engine/definition/messages"

// export function checkForAudio(attachments: Array<IMessageAttachment>): boolean {
//     console.log(attachments)
//     attachments.forEach(attachment => {
//         if (attachment.type === 'file' && attachment.audioUrl) {
//             return true
//         }
//     })
//     return false
// }


export function checkForAudio(message: IMessage): boolean {
    let val: boolean = false
    // condition to check for audio in attachment
    const condition = (attachment) => attachment.audioUrl && attachment.audioUrl.length > 0

    if (message.attachments && message.attachments.length > 0) {
        val = message.attachments.some(condition)
    }
    return val

}

