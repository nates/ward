var crypto = require("crypto");
var linkPool = [];

function createLink(discordId) {
    var id = crypto.randomBytes(4).toString('hex');
    linkPool.push({
        discordId: discordId,
        linkId: id
    })
    setTimeout(function () {
        if (isValidLink(id)) removeLink(id);
    }, 900000)
    console.log('Created new link:', id);
    return id;
}

function isValidLink(link) {
    for (var i = 0; i < linkPool.length; i++)
        if (linkPool[i].linkId == link) return true;
    return false;
}

function removeLink(link) {
    for (var i = 0; i < linkPool.length; i++)
        if (linkPool[i].linkId == link) delete linkPool[i];
    linkPool = linkPool.filter(n => n);
}

function getDiscordId(link) {
    for (var i = 0; i < linkPool.length; i++)
        if (linkPool[i].linkId == link) return linkPool[i].discordId;
    return false;
}

module.exports = {
    isValidLink,
    removeLink,
    createLink,
    getDiscordId
}