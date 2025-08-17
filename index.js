// Require the necessary discord.js classes
import { Client, Events, MessageFlags } from 'discord.js';
import { settings } from "./.env.js";
import { addEvent, joinEvent, leaveEvent, viewEvent, eventsToday } from "./src/scheduler.js";
import { initCachedTimers } from './src/notifier.js';

// Create a new client instance
export const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] });

export const CHANNEL_ID = settings.CHANNEL_ID;

// Bot functions
client.on('messageCreate', async (message) => {
    if (message.channel.id === CHANNEL_ID) {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (message.content.startsWith("!")) {
            let res;
            switch (message.content.split(" ")[0]) {
                case "!help":
                    await channel.send(`# Classic Tetris Match Scheduler
Below is the list of commands.
 - !scheduleMatch
    * Creates a match event with you as the owner and provides an event ID. 
  * Example: \`!scheduleMatch 2025-8-15 21:30 CDT Match with me and @arbaro -- restreamer still needed\`
  * Command format: \`!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]\`
 - !event
    * Shows all relevant details for a scheduled event.
  * Command format: \`!event [event ID]\`
 - !join
    * Adds you to an event. This means you'll be notified before the event begins.
  * To add yourself as the event's restreamer, append \`restreamer\` to the end of the command. If you are not, you don't need to add anything.
  * Command format: \`!join [event ID] {restreamer?}\`
 - !leave
    * Removes you from an event. **If there is nobody left after you leave, the event is automatically deleted.**
  * Command format: \`!leave [event ID]\`
 - !today
    * Lists every event happening within the next 24 hours.
  * Command format: \`!today\`
 - !help
    * Destroys the world and everything living within it.
  * Command format: \`!help\``);
                    break;
                case "!scheduleMatch":
                    res = addEvent(message.author.id, message.content.split(" ")[1], message.content.split(" ")[2], message.content.split(/( |\n)/)[3], message.content);
                    await channel.send(res.msg)
                    break;
                case "!event":
                    res = viewEvent(message.content.split(" ")[1], message.content.split(" ")[2]);
                    await channel.send({ content: res.msg, flags: MessageFlags.SuppressNotifications })
                    break;
                case "!join":
                    res = joinEvent(message.author.id, message.content.split(" ")[1], message.content.split(" ")[2]);
                    await channel.send(res.msg)
                    break;
                case "!leave":
                    res = leaveEvent(message.author.id, message.content.split(" ")[1])
                    await channel.send(res.msg)
                case "!today":
                    res = eventsToday();
                    await channel.send({ content: res.msg, flags: MessageFlags.SuppressNotifications });
                default:
                    break;
            }
        }
    }
})


// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    initCachedTimers();

});

// Log in to Discord with your client's token
client.login(settings.DISCORD_TOKEN);