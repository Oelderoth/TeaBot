import Discord from 'discord.js';

import { BotCommand, InvalidParamsError } from './types/BotCommand';

import TestCommand from './commands/Test';
import CommuniTeaCommand from './commands/Communitea';

class TeaBot {
    private static commands: BotCommand[] = [
        TestCommand,
        CommuniTeaCommand
    ];

    private client = new Discord.Client();

    constructor(public token: string) {
        this.client.once('ready', this.onReady.bind(this));
        this.client.on('message', this.onMessage.bind(this));
    }

    public start() {
        this.client.login(this.token);
    }

    private onReady(): void {
        console.log("Ready!");
    }

    private async onMessage(message: Discord.Message): Promise<void> {
        if (!message.content.startsWith('!')) return;
        const command = TeaBot.commands.find(command => command.matches(message.content));

        if (command) {
            try {
                const params = command.paramExtractor(message);
                const handler = command.handler(message, params);
                message.delete();
                await handler;
            } catch (e) {
                if (e instanceof InvalidParamsError) {
                    console.log("Params were invalid");
                    // TODO: Handle invalid params by sending usage/help message
                } else {
                    console.error(`Failed to execute command ${message.content}: `, e);
                }
            }  
        }
    }
}

export default TeaBot;