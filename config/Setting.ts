import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';



export const settings: Array<ISetting> = [
    {
        id: "api-provider",
        i18nLabel: "API Provider",
        i18nDescription: "Select you API provider",
        required: true,
        type: SettingType.SELECT,
        public: true,
        packageValue: "",
        values: [
            {
                key: "Assembly",
                i18nLabel: "Assembly AI",
            },
            {
                key: "Rev",
                i18nLabel: "Rev.AI",
            },
            {
                key: "Google",
                i18nLabel: "Google Speech to Text API",
            },
        ],
    },
    {
        id: "api-key",
        i18nLabel: "API Key",
        i18nDescription: "Provide your API key here",
        required: true,
        type: SettingType.STRING,
        public: true,
        packageValue: "",
    },
    {
        id: "jwt-secret",
        i18nLabel: "JWT Secret",
        i18nDescription: "You FileUpload JWT secret (Should be same as JWT secret in FileUpload setting)",
        required: true,
        type: SettingType.STRING,
        public: true,
        packageValue: "",
    },
    {
        id: "min-duration",
        i18nLabel: "Minimum Duration",
        i18nDescription: "Minimum duration for an audio file to be queued to transcription in seconds",
        required: true,
        type: SettingType.NUMBER,
        public: true,
        packageValue: 2,
    },
];
