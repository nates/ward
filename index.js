const secret = process.env['secret_key'];
const token = process.env['token'];

if (!token || !secret) return console.log('Add your token and secret-key as environment variables!');


const discord = require('./discord');
discord.run();

const webserver = require('./server');
webserver.run();