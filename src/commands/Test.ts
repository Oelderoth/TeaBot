import Discord from 'discord.js';
import { BotCommand } from '../types/BotCommand';

export default new BotCommand(
    'test',
    'Displays a test message',
    (message: Discord.Message) => {
        message.channel.send("Test Message!");
    },
    () => [],
    ['t', 'te', 'tst']
);