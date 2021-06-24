import { IMessageBuilder, IModify, IModifyUpdater, IRead } from "@rocket.chat/apps-engine/definition/accessors"
import { IMessage, IMessageAttachment, MessageActionButtonsAlignment, MessageActionType } from "@rocket.chat/apps-engine/definition/messages"


export function isAudio(message: IMessage): boolean {
    let isAudio: boolean = false
    // condition to check for audio in attachment
    const condition = (attachment) => attachment.audioUrl && attachment.audioUrl.length > 0

    if (message.attachments && message.attachments.length > 0) {
        isAudio = message.attachments.some(condition)
    }
    return isAudio

}

export function removeSttAttachment(attachments: Array<IMessageAttachment>): Array<IMessageAttachment> {

    const newAttachments = attachments.filter(attachment => attachment.title?.value !== 'SpeechToText'
    )
    return newAttachments
}

// function to vaidate the audio duration
export function getAudioAttachment(message: IMessage): IMessageAttachment {
    // get audio attachment from the message
    // can use ! because of the isAudio Check
    const audioFile = message.attachments!.find(attachment => attachment.audioUrl!.length > 0)

    return audioFile!
}

export function modifySttAttachment(data, sender, builder: IMessageBuilder): IMessageBuilder {
    const { text, color, button = false, buttonText = "", buttonMessage = "" } = data
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

    return builder
}
