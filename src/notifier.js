import { readFileSync } from "fs";
import { allEventTimes } from "./scheduler.js";
import { client } from "../index.js";
import { settings } from "../.env.js";

const NOTIFY_CHANNEL_ID = settings.CHANNEL_ID;

export const initCachedTimers = () => {
    // Creates a timer for every event in the DB
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    let eventTimes = allEventTimes(schedule.items);

    for (let event in eventTimes) {
        if (Date.now() < eventTimes[event]) {
            let ETA = eventTimes[event] - Date.now();
            console.log(`Setting notification for event ${event} . . .`)
            setTimeout(() => {
                console.log(`Sending notification for event ${event} . . .`)
                let msg = `Reminder: Event \`${event}\` is scheduled in **1 hour!**\n`
                if (!schedule.items[event].restreamer) {
                    msg += "**WARNING:** There is still no restreamer assigned to the event!\n" // TODO: ping the restreamer urgent role
                }
                for (let user in schedule.items[event].joined) {
                    msg += `<@${schedule.items[event].joined[user]}> `
                }
                const channel = client.channels.cache.get(NOTIFY_CHANNEL_ID);
                channel.send(msg)
            }, ETA - 3600000)
        }
    }
}

export const createTimer = (event) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    if (Date.now() < schedule.items[event].timeUnix) {
        let ETA = schedule.items[event].timeUnix - Date.now();
        console.log(`Setting notification for event ${event} . . .`)
        setTimeout(() => {
            console.log(`Sending notification for event ${event} . . .`)
            let msg = `Reminder: Event \`${event}\` is scheduled in **1 hour!**\n`
            if (!schedule.items[event].restreamer) {
                msg += "**WARNING:** There is still no restreamer assigned to the event!\n" // TODO: ping the restreamer urgent role
            }
            for (let user in schedule.items[event].joined) {
                msg += `<@${schedule.items[event].joined[user]}> `
            }
            const channel = client.channels.cache.get(NOTIFY_CHANNEL_ID);
            channel.send(msg)
        }, ETA - 3600000)
    }
}