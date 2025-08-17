import { readFileSync, writeFileSync } from "fs";
import { createTimer } from "./notifier.js";

export const allEventTimes = (eventList) => {
    let eventTimes = {};
    for (let event in eventList) {
        eventTimes[event] = eventList[event].timeUnix
    }

    return eventTimes;
}

const pingSanitize = (msg) => {
    // This DOES NOT remove individual pings, only room and role pings. 
    return msg.replaceAll(/(@everyone|@room|@here|<@&[0-9]*?>)/g, "");
}

export const addEvent = (author, date, time, timezone, content) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    // Validate

    if (!date || !time || !timezone || !content) {
        return { msg: "ERROR: missing fields\nCommand format: `!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]`" }
    }

    if (!date.match(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)) {
        return { msg: "ERROR: invalid date\nDate format: YYYY-MM-DD\nCommand format: `!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]`" }
    }

    if (timezone == "am" || timezone == "pm" || timezone == "AM" || timezone == "PM") {
        return { msg: "ERROR: invalid time, please use 24-hour time (such as `20:00`)\nCommand format: `!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]`" }
    }

    let dateUnix = new Date(`${date} ${time} ${timezone}`);
    console.log(dateUnix);

    if (isNaN(dateUnix)) return { msg: "ERROR: invalid date/time\nCommand format: `!scheduleMatch [YYYY-MM-DD] [24HH:MM] [timezone] [description]`" }

    // Filter out attempted mass pings in case the bot has permission to do so 
    content = pingSanitize(content);

    // Add to schedule
    // First, let's generate an ID for the event 
    let eventId = Math.floor(Math.random() * 16777215).toString(16).toUpperCase(); // This is also a way to generate seeds, just a fun addition

    // Master list of scheduled items is here
    schedule.items[eventId] = {
        author: author,
        timeUnix: dateUnix - 0,
        content: content,
        joined: [author],
        restreamer: null
    }

    if (!schedule.users[author]) schedule.users[author] = [eventId]
    else { schedule.users[author].push(eventId); }

    console.log(schedule);

    writeFileSync("./schedule.json", JSON.stringify(schedule));

    createTimer(eventId);

    return { msg: `Event **${eventId}** created by <@${author}> for <t:${dateUnix / 1000}:F>:\n>>> ${content}` }
}

export const viewEvent = (event) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    if (!event) {
        return { msg: "Usage: `!event [event ID]`" }
    }

    event = event.toUpperCase();

    if (!schedule.items[event]) {
        return { msg: `ERROR: Event ${pingSanitize(event)} does not exist` }
    }


    // Pretty list of members
    let joinListAggregate = ""

    for (let user in schedule.items[event].joined) {
        joinListAggregate += `<@${schedule.items[event].joined[user]}>, `
    }

    joinListAggregate = joinListAggregate.slice(0, -2);

    return {
        msg: `**Event \`${event}\`** (created by <@${schedule.items[event].author}>)
    Time: <t:${schedule.items[event].timeUnix / 1000}:F>
    Who's joined so far?: ${joinListAggregate}
    Restreamer yet?: ${schedule.items[event].restreamer ? `<@${schedule.items[event].restreamer}>` : "**NO**"}
>>> ${schedule.items[event].content}`
    }
}

export const joinEvent = (author, event, restreamer) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    if (!event) {
        return { msg: "Usage: `!join [event ID] ['restreamer' if you will restream]`" }
    }

    event = event.toUpperCase();

    if (!schedule.items[event]) {
        return { msg: `ERROR: Event ${pingSanitize(event)} does not exist` }
    }

    if (restreamer == "restreamer" || restreamer == "yes") {
        // TODO: Check if the user has @Restreamer permissions
        if (schedule.items[event].restreamer) return { msg: `This event already has a restreamer!` }
        schedule.items[event].restreamer = author;
        if (!schedule.items[event].joined.includes(author)) schedule.items[event].joined.push(author);

        writeFileSync("./schedule.json", JSON.stringify(schedule));
        return { msg: `<@${author}> joined event **\`${event}\`** as a **Restreamer**` }
    }

    if (schedule.items[event].joined.includes(author)) {
        return { msg: `You're already in this event!` }
    }

    schedule.items[event].joined.push(author);

    writeFileSync("./schedule.json", JSON.stringify(schedule));

    return { msg: `<@${author}> joined event **\`${event}\`**` }
}

export const leaveEvent = (author, event) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    if (!event) {
        return { msg: "Usage: `!leave [event ID]`" }
    }

    event = event.toUpperCase();

    if (!schedule.items[event]) {
        return { msg: `ERROR: Event ${pingSanitize(event)} does not exist` }
    }

    if (schedule.items[event].restreamer == author) {
        schedule.items[event].restreamer = null;
    }

    if (!schedule.items[event].joined.includes(author)) {
        return { msg: `You're already not in this event!` }
    }

    schedule.items[event].joined = schedule.items[event].joined.filter(user => {
        return user !== author;
    })

    if (schedule.items[event].joined.length == 0) {
        // Delete the event
        let eventAuthor = schedule.items[event].author;
        delete schedule.items[event];
        schedule.users[eventAuthor].filter(ev => {
            return event !== ev; // Remove only the existing event
        });

    }

    writeFileSync("./schedule.json", JSON.stringify(schedule));

    return { msg: `<@${author}> left event **\`${event}\`**` }
}

export const deleteEvent = (author, event) => {
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    if (!event) {
        return { msg: "Usage: `!delete [event ID]`" }
    }

    event = event.toUpperCase();

    if (!schedule.items[event]) {
        return { msg: `ERROR: Event ${pingSanitize(event)} does not exist` }
    }

    if (schedule.items[event].author !== author) {
        // TODO: allow mod role to delete events anyway
        return { msg: `ERROR: You did not create the event` }
    }

    let eventAuthor = schedule.items[event].author;
    delete schedule.items[event];
    schedule.users[eventAuthor].filter(ev => {
        return event !== ev; // Remove only the existing event
    });

    writeFileSync("./schedule.json", JSON.stringify(schedule));

    return { msg: `Event **\`${event}\`** deleted.` }
}

export const eventsToday = () => {
    // Create a list of each event happening within the next 24 hours
    let schedule = JSON.parse(readFileSync("./schedule.json").toString());

    let eventTimes = allEventTimes(schedule.items);

    let eventsArr = Object.keys(eventTimes);

    eventsArr.sort((a, b) => eventTimes[a] - eventTimes[b]);

    let res = "## Events in the next 24 hours:\n"

    for (let event in eventTimes) {
        if (Date.now() < eventTimes[event] &&
            eventTimes[event] < Date.now() + 86400000) { // 24h
            // Pretty list of members
            let joinListAggregate = ""

            for (let user in schedule.items[event].joined) {
                joinListAggregate += `<@${schedule.items[event].joined[user]}>, `
            }

            joinListAggregate = joinListAggregate.slice(0, -2);

            res += `### \`${event}\` (<@${schedule.items[event].author}>) <t:${schedule.items[event].timeUnix / 1000}:t>
    Who's joined so far?: ${joinListAggregate}
    Restreamer yet?: ${schedule.items[event].restreamer ? `<@${schedule.items[event].restreamer}>` : "**NO**"}
`
        }
    }

    return { msg: res }
}