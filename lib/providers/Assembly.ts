import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApi, IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { sendMessage, updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Assembly implements SttInterface {

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
        // console.log("This is the PAPAPPAPAPAPA", this.sender)
        // destructure data
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
        let recordingUrl = `${this.host}${audioUrl}?token=${jwtToken}`;
        let webhook_url = `${this.host}/api/apps/public/0cb2ef83-b652-4862-9331-275ccbf2bfa7/stt-webhook`;
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
            return true
        }
        return false

    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log("WebhookReponseIsThis", data)
        const { transcript_id, status } = data
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
        const responseData = response.data
        console.log("This is transcript data", response.data)
        const { audio_url, text } = responseData
        console.log({ audio_url, text })
        const token = audio_url.split('token=')[1]
        const payload = getPayload(token.split("&")[0])

        const sender = await read.getUserReader().getAppUser(this.app.getID())
        const { messageId, rid, fileId } = payload.context
        if (status === "completed") {
            console.log({ messageId, text, color: "#800080" })
            updateSttMessage({ messageId, text, color: "#800080" }, sender!, modify)
        } else {
            // bug url/url/url need to slice the url to just get '/fileupload${fileID}-${filename}
            // bug fix
            updateSttMessage({ text: "Failed, try again !!", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${payload.context.audioUrl}` }, sender!, modify)
        }

    }

}
