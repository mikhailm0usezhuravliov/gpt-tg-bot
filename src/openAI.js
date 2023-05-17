import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system'
    }

    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey
        });
        this.openAI = new OpenAIApi(configuration);
    }
    async chat(messages) {
        try {
            const response = await this.openAI.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            return response.data.choices[0].message;
        } catch (error) {
            console.log(`AI Chat error: ${error.message}`)
        }
    }
    async transcription(filePath) {
        try {
            const response = await this.openAI.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            );
            return response.data.text;

        } catch (error) {
            console.log(`AI Transcription error: ${error.message}`);
        }
    }
}

export const openAI = new OpenAI(config.get('OPENAI_KEY'));