import dotenv from 'dotenv';
import TeaBot from './src/TeaBot';

// Load Environment Variables
dotenv.config();
const discordToken = process.env.DISCORD_TOKEN;

const bot = new TeaBot(discordToken);
bot.start();