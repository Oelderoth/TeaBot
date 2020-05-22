import assert from 'assert';
import Discord from 'discord.js';
import fetch, { Response } from 'node-fetch';
import { JSDOM } from 'jsdom';

import { BotCommand, InvalidParamsError } from '../types/BotCommand';

interface TeaInfo {
    day:string,
    date:string,
    name:string,
    description:string,
    caffeine:string,
    instructions:string
}

function loadingEmbed(): Discord.MessageEmbed {
    return new Discord.MessageEmbed()
        .setColor("#aaaaaa")
        .setTimestamp(new Date())
        .setTitle("Adagio CommuniTEA")
        .setURL("https://www.adagio.com/communiTEA/")
        .setDescription("Fetching Tea...")
        .setFooter("Adagio Teas", "https://www.adagio.com/favicon.ico");
}

function failedEmbed(embed: Discord.MessageEmbed): Discord.MessageEmbed {
    return new Discord.MessageEmbed()
        .setColor("#ff4444")
        .setTimestamp(embed.timestamp)
        .setTitle(embed.title)
        .setURL(embed.url)
        .setDescription("Failed to fetch today's tea from Adagio")
        .setFooter(embed.footer.text, embed.footer.iconURL);
}

function successEmbed(teaInfo: TeaInfo, embed: Discord.MessageEmbed): Discord.MessageEmbed {
    return new Discord.MessageEmbed()
        .setColor("#da9034")
        .setTimestamp(embed.timestamp)
        .setTitle(embed.title + ' - ' + teaInfo.date)
        .setURL(`https://www.adagio.com/communiTEA/index.html?day=${teaInfo.day}`)
        .setDescription("")
        .addFields([
            {name: 'Name', value: teaInfo.name, inline: true},
            {name: 'Caffeine', value: teaInfo.caffeine, inline: true},
            {name: 'Description', value: teaInfo.description},
            {name: 'Instructions', value: teaInfo.instructions}
        ])
        .setFooter(embed.footer.text, embed.footer.iconURL);
}

async function extractTea(response: Response): Promise<TeaInfo> {
    if (!response.ok) throw new Error("Failed to get response from Adagio teas");
    const html = await response.text();
    const { document } = new JSDOM(html).window;
    const summaryNode = document.querySelector('.cart .summary');
    const descriptionNode = document.querySelector('.cart .summary div:nth-of-type(5n)');
    const dateText = document.querySelector(".communiTEADate~h1").textContent.trim();
    const info = document.querySelector('.cart .summary div:nth-of-type(6n)').textContent.trim();

    const day = document.querySelector(".communiTEADate select option[selected]").attributes.getNamedItem('value').value;
    const name = document.querySelector('.cart .summary h1').textContent.trim();
    const description = [...descriptionNode.childNodes.values()].map(child => child.nodeType == 3
        ? child.textContent.trim()
        : child.nodeName === 'BR' ? '\n\n' : '')
        .join('');
    const [caffeine, instructions] = info.split('|').map(s => s.trim());
    const date = /^on\s(.+),/i.exec(dateText)?.[1] ?? new Date().toLocaleDateString();

    // Sanity checks
    assert(day?.length > 0, 'Extracted day must be non-empty');
    assert(date?.length > 0, 'Extracted date must be non-empty');
    assert(name?.length > 0, 'Extracted name must be non-empty');
    assert(description?.length > 0, 'Extracted description must be non-empty');
    assert(caffeine?.length > 0, 'Extracted caffeine must be non-empty');
    assert(instructions?.length > 0, 'Extracted instructions must be non-empty');

    return {
        day,
        date,
        name,
        description,
        caffeine,
        instructions
    };
}


export default new BotCommand(
    'communitea',
    'Displays today\'s CommuniTEA',
    async (message: Discord.Message, params: string[]) => {
        let response = await message.channel.send(loadingEmbed());
        
        try {
            let fetchResponse = await fetch(params.length === 0 ? 'https://www.adagio.com/communiTEA/' : `https://www.adagio.com/communiTEA/index.html?day=${params[0]}`);
            let teaInfo = await extractTea(fetchResponse) ;
            response.edit(successEmbed(teaInfo, response.embeds[0]));
        } catch (e) {
            console.log(e);
            response.edit(failedEmbed(response.embeds[0]));
        }
    },
    (message: Discord.Message): string[] => {
        const params = message.content.split(' ').map(s => s.trim()).splice(1);
        if ((params.length > 1) || (params.length === 1 && isNaN(parseInt(params[0], 10)))) {
            throw new InvalidParamsError('Invalid parameters for !tea')
        }
        return params;
    },
    ['tea']
)