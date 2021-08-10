import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";
import { generateJWT, getPayload } from "../../helpers/jwtHelpers";
import { updateSttMessage } from "../../helpers/messageHelpers";
import { SpeechToTextApp } from "../../SpeechToTextApp";
import { SttInterface } from "../interface/SttInterface";

export class Microsoft implements SttInterface {

    public sender: String

    constructor(private readonly app: SpeechToTextApp) {
        this.sender = this.app.getID()
        // this.app.
    }
    handleWebhook(success: any, request: IApiRequest, http: IHttp, read: IRead, modify: IModify): Promise<IApiResponse> {

        if (request.headers['x-microsoftspeechservices-event'] === "Challenge") {
            const { validationToken } = request.query
            return success(validationToken)

        }
        console.log(request.content, http, read, modify)
        try {
            this.getTranscript(request.content, http, read, modify)
        } catch (error) {
            console.log(error)
        }
        return success()

    }


    async registerWebhook(http: IHttp, read: IRead): Promise<void> {

        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const [key, location] = api_key.split(' ')

        const reqUrl = `https://${location}.api.cognitive.microsoft.com/speechtotext/v3.0/webhooks`

        const [webhook] = this.app.getAccessors().providedApiEndpoints.filter((endpoint) => endpoint.path === 'stt-webhook');

        const webUrl = `${this.app.host}${webhook.computedPath}`
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
                ["Ocp-Apim-Subscription-Key"]: `${key}`,
                ["content-type"]: "application/json",
            },
        });

    }

    async queueAudio(data: any, http: IHttp, read: IRead, modify: IModify): Promise<{ status: Boolean; message: String }> {

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
        const [key, location] = api_key.split(' ')

        let recordingUrl = `${this.app.host}${audioUrl}?token=${jwtToken}`;
        let reqUrl = `https://${location}.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions`;

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
                ["Ocp-Apim-Subscription-Key"]: `${key}`,
                ["content-type"]: "application/json",
            },
        });

        if (response.data.error) {
            return { status: false, message: `FAILED !! ${response.data.error.message}` }
        } else {
            return { status: true, message: "Queued for transcriptionn" }
        }
    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        const { self } = data
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const [key] = api_key.split(' ')

        const files = await http.get(`${self}/files`, {
            headers: {
                ["Ocp-Apim-Subscription-Key"]: `${key}`,
            },
        });

        const [transcript] = files.data.values.filter(value => {
            return value.kind === "Transcription"
        })

        const botUser = await read.getUserReader().getAppUser(this.app.getID())

        if (transcript) {
            const { contentUrl } = transcript.links
            const content = await http.get(`${contentUrl}`, {
                headers: {},
            });
            const [text] = content && content.data.combinedRecognizedPhrases

            const { source } = content.data
            const audio_url = source
            const token = audio_url.split('token=')[1]
            const payload = getPayload(token.split("&")[0])

            const { messageId } = payload.context
            updateSttMessage({ messageId, text: text.display, color: "#800080" }, botUser!, modify)
        } else {
            try {
                const url = files.data.values[0].self
                const content = await http.get(`${url}`, {
                    headers: {
                        ["Ocp-Apim-Subscription-Key"]: `${key}`,
                    },
                });
                const { links } = content.data
                const link_data = await http.get(`${links.contentUrl}`, {
                    headers: {
                        ["Ocp-Apim-Subscription-Key"]: `${key}`,
                    },
                });
                const [details] = link_data.data.details

                const token = details.source.split('token=')[1]
                const payload = getPayload(token.split("&")[0])
                const { messageId, rid, fileId, audio_url } = payload.context

                updateSttMessage({ text: "Transcription failed !! Maybe Check your JWT", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${payload.context.audioUrl}` }, botUser!, modify)
            } catch (error) {
                console.log(error)
            }
        }

    }

}
