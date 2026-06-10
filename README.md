<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/230d5d24-51cb-4784-8c1d-a420871bb8c8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Discord AI Bot

1. Create a Discord bot application and add it to your server.
2. Set the following environment variables in `.env.local` or your environment:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID` (optional, for faster command registration)
3. Start the bot:
   `npm run discord-bot`

Then use `/fixcode` in Discord and描述你要修的程式問題，機器人會透過 Gemini 幫你回覆。