import dotenv from 'dotenv';
import Discord from 'discord.js';

// Load Environment Variables
dotenv.config();

const client = new Discord.Client();
const discordToken = process.env.DISCORD_TOKEN;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    console.log(message.content);
});

client.login(discordToken);
