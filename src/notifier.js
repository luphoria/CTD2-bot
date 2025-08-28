import { readFileSync, writeFileSync } from "fs";
import { genSeed } from "./commands.js"
import { client } from "../index.js";
import { settings } from "../.env.js";

const NOTIFY_CHANNEL_ID = settings.CHANNEL_ID;

const CTDNextSeed = () => {
    let db = JSON.parse(readFileSync("./db.json").toString());
    let seed = db.nextSeed ? db.nextSeed : genSeed();

    const channel = client.channels.cache.get(NOTIFY_CHANNEL_ID);
    channel.send(`# Classic Tetris Daily Seed #${db.seeds.length + 1}: **\`${seed}\`**
<@&1407787118767509544>`);

    db.nextSeed = null;
    db.seeds.push(seed);

    writeFileSync("./db.json", JSON.stringify(db));

    console.log(`Setting notification for tomorrow . . .`)
    setTimeout(() => {
        console.log(`${Date.now()}: Sending seed for the day`)
        CTDNextSeed();
    }, 86400000) // 24 hours
}

export const initTimer = () => {
    // Creates a timer for every event in the DB

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let botStartTime = new Date(Date.now());

    let year = botStartTime.getUTCFullYear();
    let month = months[botStartTime.getUTCMonth()];
    let date = botStartTime.getUTCDate();
    let hour = botStartTime.getUTCHours();
    let humanTime = `${year}-${month}-${date} ${hour}:00 UTC`;

    let todayOrTomorrow;
    let nextSeedTime;

    if (hour < 19) { // Seed for the day needs to be scheduled
        todayOrTomorrow = "today";
        nextSeedTime = new Date(`${year}-${month}-${date} 19:00 UTC`);
    } else { // Schedule the seed for tomorrow
        todayOrTomorrow = "tomorrow";
        nextSeedTime = new Date(`${year}-${month}-${date + 1} 19:00 UTC`);
    }

    let notifInMs = nextSeedTime - Date.now();

    console.log(`Now: ${nextSeedTime - 0}`);
    console.log(notifInMs);

    console.log(`Setting notification for ${todayOrTomorrow} . . .`)
    setTimeout(() => {
        console.log(`${Date.now()}: Sending seed for the day`)
        CTDNextSeed();
    }, notifInMs)
}