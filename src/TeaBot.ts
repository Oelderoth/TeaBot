import Discord from 'discord.js';
import BotCommand from './BotCommand';

class TeaBot {
    private client = new Discord.Client();
    private commands: BotCommand[] = [];

    constructor(public token: string) {
        this.client.once('ready', this.onReady.bind(this));
        this.client.on('message', this.onMessage.bind(this));

        this.commands.push(new BotCommand(
            'test', 
            'Displays a test message',
            (message: Discord.Message) => {
                message.channel.send("Test Message!");
            },
            ['t', 'te', 'tst']
        ));
    }

    public start() {
        this.client.login(this.token);
    }

    private onReady(): void {
        console.log("Ready!");
    }

    private onMessage(message: Discord.Message): void {
        if (!message.content.startsWith('!')) return;
        const command = this.commands.find(command => command.matches(message.content));

        if (command) {
            command.handler(message);
            message.delete();
        }
    }
}

export default TeaBot;