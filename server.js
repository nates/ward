const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const pool = require('./pool');
const discord = require('./discord');
const {
    recaptcha_secret_key
} = require('./variables');

const port = 8080;
const app = express();
app.use(express.static(path.join(__dirname, '/assets')))
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/verify/:verifyId?', (req, res) => {
    if (!req.params.verifyId) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    if (!pool.isValidLink(req.params.verifyId)) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    res.sendFile(path.join(__dirname, '/html/verify.html'));
})

app.post('/verify/:verifyId?', async (req, res) => {
    const response = await axios({
        method: 'post',
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${recaptcha_secret_key}&response=${req.body['g-recaptcha-response']}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (!response.data.success) return res.sendFile(path.join(__dirname, '/html/invalidCaptcha.html'));
    if (!pool.isValidLink(req.params.verifyId)) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    discord.addRole(pool.getDiscordId(req.params.verifyId));
    pool.removeLink(req.params.verifyId);
    res.sendFile(path.join(__dirname, '/html/valid.html'));
})

function main() {
    app.listen(port, () => console.log(`[Express] Listening on port ${port}.`));
}

module.exports = {
    run: main
};
