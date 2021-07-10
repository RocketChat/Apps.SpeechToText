import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { SpeechToTextApp } from "../SpeechToTextApp";

export class webhookEndpoint extends ApiEndpoint {
    public path = "stt-webhook";

    constructor(public app: SpeechToTextApp) {
        super(app);
    }


    async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        return await this.app.provider.handleWebhook(this.success, request, http, read, modify)
    }
}
