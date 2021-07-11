import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { sendMessage, updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Microsoft implements SttInterface {

    public sender: String

    public host = "https://ca246b10dcc9.ngrok.io"

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

        this.getTranscript(request.content, http, read, modify)
        return success()
    }


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
        let reqUrl = "https://eastus.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions";

        let response = await http.post(reqUrl, {
            data: {
                "contentUrls": [
                    recordingUrl,

                ],
                "properties": {
                    "wordLevelTimestampsEnabled": true
                },
                "locale": "en-US",
                "displayName": "Transcription of file using default model for en-US"
            },
            headers: {
                ["Ocp-Apim-Subscription-Key"]: `${api_key}`,
                ["content-type"]: "application/json",
            },
        });

        if (response && response.data.status) {
            return true
        } else {
            return false
        }
    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {

        const { self } = data
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");

        const files = await http.get(`${self}/files`, {
            headers: {
                ["Ocp-Apim-Subscription-Key"]: `${api_key}`,
            },
        });

        // console.log(transcript.content)

        // const file = await http.get(transcript.content!, {
        //     headers: {
        //         ["Ocp-Apim-Subscription-Key"]: `${api_key}`,
        //     },
        // });
        const [transcript] = files.data.values.filter(value => {
            return value.kind === "Transcription"
        })

        const { contentUrl } = transcript.links
        const content = await http.get(`${contentUrl}`, {
            headers: {},
        });

        const [text] = content && content.data.combinedRecognizedPhrases

        const { source } = content.data
        const audio_url = source
        const token = audio_url.split('token=')[1]
        const payload = getPayload(token.split("&")[0])

        const sender = await read.getUserReader().getAppUser(this.app.getID())
        const { messageId, rid, fileId } = payload.context
        updateSttMessage({ messageId, text: text.display, color: "#800080" }, sender!, modify)

        console.log("Now getting the transcsript", text.display)
    }

}
