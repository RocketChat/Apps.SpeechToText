import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
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
    handleWebhook(success: any, request: IApiRequest, http: IHttp, read: IRead, modify: IModify): Promise<IApiResponse> {
        console.log('======>>>webhook', request.content)

        if (request.headers['x-microsoftspeechservices-event'] === "Challenge") {
            const { validationToken } = request.query
            console.log(request.content)
            return success(validationToken)

        }

        const { self } = request.content
        this.getTranscript({}, http, read, modify)
        console.log(request.content)
        console.log("Transcription complete!!!!")
        return success()
    }

    public host = "https://02b85b5b675e.ngrok.io"

    async registerWebhook(http: IHttp, read: IRead): Promise<void> {

        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");

        console.log("This functions is gonna setup the webhook")
        const reqUrl = "https://eastus.api.cognitive.microsoft.com/speechtotext/v3.0/webhooks"

        const [webhook] = this.app.getAccessors().providedApiEndpoints.filter((endpoint) => endpoint.path === 'stt-webhook');

        const webUrl = `${this.host}${webhook.computedPath}`
        let response = await http.post(reqUrl, {
            data: {
                "displayName": "TranscriptionCompletionWebHook",
                "properties": {},
                webUrl,
                "events": {
                    "transcriptionCompletion": true,
                },
                "description": "Webhook to register webhook"
            },
            headers: {
                ["Ocp-Apim-Subscription-Key"]: `${api_key}`,
                ["content-type"]: "application/json",
            },
        });

        console.log(response.content)
    }

    async queueAudio(data: any, http: IHttp, read: IRead, modify: IModify): Promise<Boolean> {
        return true
    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log("Now getting the transcsript")
    }

}
