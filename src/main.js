import config from 'config'
import { Telegraf, session } from 'telegraf'
import { code } from 'telegraf/format'
import { message } from 'telegraf/filters'
import { ogg } from './ogg.js'
import { openAI } from './openAI.js'

const INITIAL_SESSION = {
    messages: []
}

console.log(config.get('PRODUCTION'))

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));
bot.use(session());
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply('Wait for voice or text message')
})
bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply('Wait for voice or text message')
})
bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        await ctx.reply(code('Message recieved. Waiting response from server...'));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);
        const text = await openAI.transcription(mp3Path);

        await ctx.reply(code(`Your message: ${text}`));
        ctx.session.messages.push({ role: openAI.roles.USER, content: text });

        const response = await openAI.chat(ctx.session.messages);
        ctx.session.messages.push({ role: openAI.roles.ASSISTANT, content: response.content });

        await ctx.reply(response.content);
    }
    catch (e) {
        console.log(`Somthing went wrong, error: ${e.message}`);
    }
})
bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {

        await ctx.reply(code('Message recieved. Waiting response from server...'));        
        ctx.session.messages.push({ role: openAI.roles.USER, content: ctx.message.text });

        const response = await openAI.chat(ctx.session.messages);
        ctx.session.messages.push({ role: openAI.roles.ASSISTANT, content: response.content });

        await ctx.reply(response.content);
    }
    catch (e) {
        console.log(`Somthing went wrong, error: ${e.message}`);
    }
})


bot.command('start', async (contex) => {
    await contex.reply(JSON.stringify(contex.message));
})
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));