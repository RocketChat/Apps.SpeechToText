import { IHttp, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";

export interface SttInterface {

    queueAudio(data, http: IHttp, read: IRead): Promise<void>;

    getTranscript(data, http: IHttp, read: IRead, modify: IModify): Promise<void>

}
