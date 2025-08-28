// Require the necessary discord.js classes
import { Client, Events, MessageFlags } from 'discord.js';
import { settings } from "./.env.js";
import { Seed, SetNextSeed } from "./src/commands.js";
import { initTimer } from './src/notifier.js';

// Create a new client instance
export const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] });

export const CHANNEL_ID = settings.CHANNEL_ID;

// Bot functions
client.on('messageCreate', async (message) => {
    const channel = client.channels.cache.get(message.channel.id);
    if (message.content.startsWith("!")) {
        let res;
        switch (message.content.split(" ")[0]) {
            case "!help":
                await channel.send(`# Classic Tetris Daily Bot
This bot generates a daily seed and posts it each day. 
 - !seed
    * Generates a seed. 
 - !setnext [seed]
    * Changes the next upcoming seed to a fixed one.
`);
                break;
            case "!seed":
                res = Seed(message.author.id);
                await channel.send(res.msg)
                break;
            case "!setnext":
                res = SetNextSeed(message.author.id, message.content.split(" ")[1]);
                await channel.send(res.msg)
                break;
            default:
                break;
        }
    }
})


client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    initTimer();

});

// Log in to Discord with your client's token
client.login(settings.DISCORD_TOKEN);