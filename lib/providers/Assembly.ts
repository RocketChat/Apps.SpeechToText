import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { SttInterface } from "../interface/SttInterface";

export class Assembly implements SttInterface {
    async queueAudio(data: any, http: IHttp, read: IRead): Promise<void> {
        console.log("QUeued for transcription")
    }
    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log("Now getting the transcript")
    }

}
