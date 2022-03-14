import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Assembly implements SttInterface {


    constructor(private readonly app: SpeechToTextApp) {
    }

    async handleWebhook(success, request: IApiRequest, http: IHttp, read: IRead, modify: IModify): Promise<IApiResponse> {
        await this.getTranscript(request.content, http, read, modify)
        return success();
    }

    async queueAudio(data: any, http: IHttp, read: IRead): Promise<{ status: Boolean; message: String }> {
        const { rid, fileId, messageId, userId, audioUrl } = data;
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const jwt_secret: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("jwt-secret");

        let jwtToken = generateJWT({
            typ: 'JWT',
            alg: 'HS256',
        }, {
            rid,
            userId,
            fileId,
            messageId,
            audioUrl
        }, jwt_secret)
        // Appending the JWT token to audioURL and getting the final recording URL which is to be sent to the provider
        let recordingUrl = `${this.app.host}${audioUrl}?token=${jwtToken}`;
        let webhook_url = `${this.app.host}${this.app.webhook_url}`;
        let reqUrl = "https://api.assemblyai.com/v2/transcript";

        let response = await http.post(reqUrl, {
            data: {
                audio_url: recordingUrl,
                webhook_url,
            },
            headers: {
                ["authorization"]: `${api_key}`,
                ["content-type"]: "application/json",
            },
        });
        if (response && response.data.status === "queued") {
            return { status: true, message: "Queued for transcription" }
        }
        return { status: false, message: response.data.error }
    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        const { transcript_id } = data
        const reqUrl = `https://api.assemblyai.com/v2/transcript/${transcript_id}`
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        var response = await http.get(reqUrl, {
            headers: {
                ["authorization"]: `${api_key}`,
                ["content-type"]: "application/json",
            },
        });
        const { audio_url, text, status, error } = response.data

        const token = audio_url.split('token=')[1]
        const payload = getPayload(token.split("&")[0])

        const botUser = await read.getUserReader().getAppUser(this.app.getID())
        const { messageId, rid, fileId } = payload.context
        if (status === "error") {
            if (error.includes("Download error")) {
                updateSttMessage({ text: "Transcription failed !! JWT in app setting doesn't match the FileUpload JWT ", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${payload.context.audioUrl}` }, botUser!, modify)
            } else {
                updateSttMessage({ text: "Transcription failed !! ", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${payload.context.audioUrl}` }, botUser!, modify)
            }
        } else {
            updateSttMessage({ messageId, text, color: "#800080" }, botUser!, modify)
        }

    }

}
