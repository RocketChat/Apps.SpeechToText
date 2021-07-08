import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { sendMessage, updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Microsoft implements SttInterface {

    public sender: String

    constructor(private readonly app: SpeechToTextApp) {
        this.sender = this.app.getID()
        // this.app.
    }

    public host = "http://687eebbb7fb7.ngrok.io"

    async queueAudio(data: any, http: IHttp, read: IRead, modify: IModify): Promise<Boolean> {
        return true
    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {

    }

}
