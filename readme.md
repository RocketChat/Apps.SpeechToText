<div  align="center">
	<a  href="https://summerofcode.withgoogle.com/projects/#4626086438109184"><img  src="https://rocket.chat/wp-content/uploads/2021/02/Frame.png.webp"  width="650"  alt="google-summer-of-code"></a>
	<br>
	<b>
		<p>
	Speech To Text : A Rocket.Chat App that introduces SpeechToText capabilities into Rocket.Chat.
		</p>
	</b>
</div>


## 📙 About the App

Rocket.Chat users have an option of sending audio files or live audio messages to a room or a chat. Speech To Text app utilises the capabilities of [Rocket.Chat.Apps-Engine](https://github.com/RocketChat/Rocket.Chat.Apps-engine) and allows the user to be able to not only transcribe the audio files but also save the transcript  as metadata. This whole functionality is packaged into a Rocket.Chat.App, which can be configured to use the transcription provider of user's choice.

## 📝 What Speech-To-Text App does

- [x] Transcribes the audio files on server side & store the transcript metadata on demand.

- [x] Provides the User and option to choose from a variety of API providers for trascription. Currently supported providers are:
  - Assembly AI.
  - Mcirosoft Cognitive Services .
  - & Rev AI.

All of the listed deliverables were completed within the GSoC period. YAY !! 🎉

## 🚀 Steps to run
- Clone the repository and install the dependencies :
    - `git clone https://github.com/RocketChat/Apps.SpeechToText.git`
    - `cd SpeechToText`
    - `npm install`
    
- Make Sure you have Rocket.Chat server running on your localhost & you have  [Rocket.Chat.Apps-cli](https://github.com/RocketChat/Rocket.Chat.Apps-cli) installed, if not :
    - `npm install -g @rocket.chat/apps-cli`
- You need to enable ==Apps development mode== in `Administration > General`
-  Now, install the app:
    - `rc-apps deploy --url http://localhost:3000 --username "your username" --password "your password"`
    
- Once successfully installed you'll be able to see the app in `Administration > Apps`.
- Enable ==Use JWT for file Upload== setting from `Administration > General` and add a `JWT` secret.
- Provide the same `JWT` as in fileUpload and select your provider.
- Create a `Tunnel` to the `localhost` and provide it's URL into the App settings (You need to provide this Tunnel URL for the app to work ).
- ENJOY 😉

