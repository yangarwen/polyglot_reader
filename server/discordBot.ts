import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events,
} from 'discord.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GEMINI_API_KEY) {
  throw new Error(
    '請在 .env 檔案中設定 DISCORD_TOKEN、DISCORD_CLIENT_ID 以及 GEMINI_API_KEY。'
  );
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('fixcode')
    .setDescription('讓 Discord AI 幫你檢查並修正程式問題。')
    .addStringOption((option) =>
      option
        .setName('problem')
        .setDescription('請描述你想修正的 bug、錯誤訊息或程式碼問題。')
        .setRequired(true)
    )
    .toJSON(),
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  if (DISCORD_GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log('已註冊 guild 指令。');
  } else {
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
      body: commands,
    });
    console.log('已註冊全域指令。');
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Discord bot 已啟動，登入為 ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'fixcode') {
    const problem = interaction.options.getString('problem', true);
    await interaction.deferReply();

    const prompt = `You are a programming assistant. A user sent this request: ${problem}\n\nPlease analyze the issue and provide a practical fix or debugging advice. Respond clearly, and if code changes are needed, show the updated code snippets.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 512,
        },
      });

      const text = response.text ?? '抱歉，模型未返回可用內容。';
      await interaction.editReply(text);
    } catch (error) {
      console.error('AI 呼叫錯誤：', error);
      await interaction.editReply(
        '無法連線到 AI 服務，請稍後再試或檢查 GEMINI_API_KEY 是否正確。'
      );
    }
  }
});

registerCommands()
  .then(() => client.login(DISCORD_TOKEN))
  .catch((error) => {
    console.error('指令註冊/登入失敗：', error);
    process.exit(1);
  });
