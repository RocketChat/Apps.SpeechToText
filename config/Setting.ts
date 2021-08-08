import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    API_PROVIDER = 'api-provider',
    API_KEY = 'api-key',
    TUNNEL = 'tunnel',
    JWT_SECRET = 'jwt-secret',
    ASSEMBLY = 'Assembly',
    MICROSOFT = 'Microsoft',
    REV = 'Rev',
    GOOGLE = 'Google'
}


export const settings: Array<ISetting> = [
    {
        id: AppSetting.API_PROVIDER,
        i18nLabel: "API Provider",
        i18nDescription: "Select you API provider",
        required: true,
        type: SettingType.SELECT,
        public: true,
        packageValue: "",
        values: [
            {
                key: AppSetting.ASSEMBLY,
                i18nLabel: "Assembly AI",
            },
            {
                key: AppSetting.MICROSOFT,
                i18nLabel: "Microsoft Cognitive",
            }
            // ,
            // {
            //     key: AppSetting.REV,
            //     i18nLabel: "Rev.AI",
            // }
        ],
    },
    {
        id: AppSetting.API_KEY,
        i18nLabel: "API Key",
        i18nDescription: "Provide your API key here *(For MicrosoftCognitiveServices you need to also provide your region seperated by space from the api-key)",
        required: true,
        type: SettingType.STRING,
        public: true,
        packageValue: "",
    },
    {
        id: AppSetting.JWT_SECRET,
        i18nLabel: "JWT Secret",
        i18nDescription: "You FileUpload JWT secret (Should be same as JWT secret in FileUpload setting)",
        required: true,
        type: SettingType.STRING,
        public: true,
        packageValue: "",
    },
];
