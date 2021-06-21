import { IHttp, IRead, IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { generateJWT } from "../../helpers/jwtHelpers";
import { sendMessage, updateSttMessage } from "../../helpers/messageHelpers";
import { SttInterface } from "../interface/SttInterface";

export class Assembly implements SttInterface {

    public host = "http://df6aa0c173f1.ngrok.io"


    async queueAudio(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log("QUeued for transcription")
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
            // do nothing
            console.log(response.data)
        } else {
            const sender = await read.getUserReader().getById("rocket.cat");
            updateSttMessage({ text: "Failed, try again !!", color: "#dc143c", messageId, button: true, buttonText: "ReQueue", buttonMessage: `/stt-queue ${rid} ${fileId} ${messageId} ${audioUrl}` }, sender, modify)

        }

    }


    async getTranscript(data: any, http: IHttp, read: IRead, modify: IModify): Promise<void> {
        console.log("Now getting the transcript")
    }

}
