import { readFileSync, writeFileSync } from "fs";

// Seed gen internal utility
export const genSeed = () => {
    let seed = Math.floor(Math.random()*16777215).toString(16);
    // Seeds should start with 0s if less than 6 digits
    for (let i = 0; i < 6 - seed.length; i++) {
        seed = "0" + seed;
    }
    return seed.toUpperCase();
}

// !seed command in bot
export const Seed = (author) => {
    return { msg: `<@${author}>, here's your seed: **\`${genSeed()}\`**` }
}

export const SetNextSeed = (author, seed) => {
    let db = JSON.parse(readFileSync("./db.json").toString());

    if (!db.privilegedUsers.includes(author)) {
        return { msg: `No` }
    }

    db.nextSeed = seed.toUpperCase();
    writeFileSync("./db.json", JSON.stringify(db));
    
    return { msg: `Next seed set: **\`${seed.toUpperCase()}\`**`}
}