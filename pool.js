
// —— Requiring the packages that we need for this file.
const { Signale } = require('signale');
const createCode = require('./public/util.js').createCode;
const logger = new Signale({ scope: 'Pool' }); 

// —— Making the functions!!
let linkPool = [];

function createLink(discordID) { 
    const linkID = createCode(8);
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

function isValidLink(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) return true;
    return false;
}

function removeLink(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) delete linkPool[i];
    linkPool = linkPool.filter(n => n);
}

function getDiscordId(linkID) {
    for (let i = 0; i < linkPool.length; i++) if (linkPool[i].linkID == linkID) return linkPool[i].discordID;
    return false;
}


module.exports = { isValidLink, removeLink, createLink, getDiscordId };
