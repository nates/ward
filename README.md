<h2 align="center">
🔑 ward
</h2>
<h3 align="center">
A Discord verification bot using reCAPTCHA v2. 
</h3>

## Requirements

- [Node.js v16.9.0 or higher](https://nodejs.org/en/)
- [Google reCaptcha Key](https://www.google.com/recaptcha/admin/create)

## Setup

- Rename your `config-example.js` file to `config.js`

- Register your site with [reCaptcha](https://www.google.com/recaptcha/admin/create) with the domain you are currently using. If running locally, only put localhost on the domain area. ChoosereCAPTCHA v2 "I'm not a robot" for the reCaptcha Type, and copy the secret and public key into the config.js file. If you are using HTTPS, enable it in the config add your certificate and private key file with the names: `certificate.pem` and `private.pem`.

- To run your own version on Repl.it, create a new project and click the `Import from Github` button and copy this repository url and paste it on the Repl.it site.

- Here is what the configuration file looks like and the things that are required for the bot to run.
```js
module.exports = {
    server: {
        domain: "localhost",
        https: false,
        httpPort: 8080,
    },

    Discord: {
        // —— Things that are required for the whole project to work.
        prefix: "!", // —— Deprecated lol.
        token: "", // —— Your bot's token.
        botId: "", // —— The bot's ID.
        guildId: "", // —— The server ID on where the commands will be deployed.
        verifiedRole: "", // —— Role that will be added to the user when they verify their account.

        // —— For users that want to have a role removed upon verification, if you want this, set remove-role to true, and set your remove role ID.
        removeRole: false,
        removeRoleId: "",

        // —— Set the bot's presence, for statusType see: https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType
        statusType: 3, // 1 (STREAMING), 2 (LISTENING), 3 (WATCHING), 5 (COMPETING). Default is 0 (PLAYING). 
        statusMsg: "unverified users!",

        // —— By default, rules are set to disabled, this means rules will be hidden. If you want to use the rules function, change disabled to your rules. Please ensure you use \n for each line break and do not use any symbols that could interfear with JSON.
        rulesEnabled: true,
        rules: "Type your rules here if rulesEnabled is enabled, ensure to use \n for new lines"
    },

    reCAPTCHA: {
        secretKey: "",
        publicKey: ""
    }
}
```

- Finished editing the files and ready to turn on your bot? run `npm start` in the bot folder.

## Issues

**Not receiving a DM when joining my server**

- If you are not receiving a DM when joining your server, Go to your Discord bot dashboard and enable both intents. Note: If your bot is more than 100 servers, you will have to verify your bot.

**Bot failing to login**

- You must go to your Discord bot dashboard and enable both intents. Note: If your bot is more than 100 servers, you will have to verify your bot.

## Preview
![Embed](https://i.imgur.com/zomEnpw.png)
![Website](https://i.imgur.com/tmrcyjF.png)
