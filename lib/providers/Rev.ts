import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApi, IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { sendMessage, updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Rev implements SttInterface {

    public sender: String

    constructor(private readonly app: SpeechToTextApp) {
        this.sender = this.app.getID()
    }

    public host = "https://2b9ace0860bf.ngrok.io"

    async handleWebhook(success, request: IApiRequest, http: IHttp, read: IRead, modify: IModify): Promise<IApiResponse> {
        await this.getTranscript(request.content, http, read, modify)
        return success();
    }

    async queueAudio(data: any, http: IHttp, read: IRead, modify: IModify): Promise<Boolean> {
        console.log("this function queues the audio for REV.ai")
        return false

    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log('this function gets the trancript')

    }

}
