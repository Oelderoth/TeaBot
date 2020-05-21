import Discord from 'discord.js';

interface CommandHandler {
    (args: Discord.Message): void;
}

export default class BotCommand {
    constructor(
        public name: string, 
        public description: string,
        public handler: CommandHandler,
        public aliases: string[] = []) {}
    
    public matches(message: string): boolean {
        let regex = (this.aliases?.length ?? 0) === 0
            ? new RegExp(`^!${this.name}$`)
            : new RegExp(`^!(?:${this.name}|${this.aliases.join('|')})$`);
        return regex.test(message);
    }
}