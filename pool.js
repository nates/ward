// Packages
const crypto = require('crypto');
const { Signale } = require('signale');

// Variables
const logger = new Signale({ scope: 'Pool' });
let linkPool = [];

// Functions
// Create a link ID for a user
function createLink(discordID) {
    const linkID = crypto.randomBytes(4).toString('hex');
    linkPool.push({
        discordID: discordID,
        linkID: linkID
    });
    setTimeout(function() {
        if (isValidLink(linkID)) removeLink(linkID);
    }, 900000);
    logger.info('Created new link ID:', linkID);
    return linkID;
}

// Checks if link ID exists
function isValidLink(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) return true;
    return false;
}

// Remove link
function removeLink(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) delete linkPool[i];
    linkPool = linkPool.filter(n => n);
}

// Get Discord ID from link ID
function getDiscordId(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) return linkPool[i].discordID;
    return false;
}

module.exports = {
    isValidLink,
    removeLink,
    createLink,
    getDiscordId
};