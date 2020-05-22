import Discord from 'discord.js';

interface CommandHandler {
    (message: Discord.Message, params: string[]): void;
}

interface AsyncCommandHandler {
    (message: Discord.Message, params: string[]): Promise<void>;
}

interface ParamExtractor {
    (message: Discord.Message): string[];
}

export class InvalidParamsError extends Error {
    constructor(public message: string) {
        super(message);
    };
}

export class BotCommand {
    constructor(
        public name: string, 
        public description: string,
        public handler: CommandHandler | AsyncCommandHandler,
        public paramExtractor: ParamExtractor = () => [],
        public aliases: string[] = []) {}
    
    public matches(message: string): boolean {
        let regex = (this.aliases?.length ?? 0) === 0
            ? new RegExp(`^!${this.name}(?:\\s+.+)?$`)
            : new RegExp(`^!(?:${this.name}|${this.aliases.join('|')})(?:\\s+.+)*$`);
        return regex.test(message);
    }
}