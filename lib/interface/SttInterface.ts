import { IHttp, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";

// An interface that a new provider class needs to implement in order to function
export interface SttInterface {
    // function to queue audio file for transcription
    queueAudio(data, http: IHttp, read: IRead, modify: IModify): Promise<{ status: Boolean; message: String }>;
    // function to request the provider for transcription data
    getTranscript(data, http: IHttp, read: IRead, modify: IModify): Promise<void>
    // function to handle the webhook response
    handleWebhook(success, request: IApiRequest, http: IHttp, read: IRead, modify: IModify): Promise<IApiResponse>
}
