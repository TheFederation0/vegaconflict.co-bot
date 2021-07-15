"use strict";
const Discord = require('discord.js');
const { Command } = require('discordjs');
const Package = require('../../package.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'default',
            memberName: 'invite',
            description: '',
        });
    }

    run(message) {
        return message.say('Basic Bot: <https://discord.com/api/oauth2/authorize?client_id=588408090068779059&permissions=313408&scope=bot> \n' +
            'Slash Commands Only: <https://discord.com/api/oauth2/authorize?client_id=588408090068779059&scope=applications.commands>\n' +
            'Both: <https://discord.com/api/oauth2/authorize?client_id=588408090068779059&permissions=313408&scope=applications.commands%20bot>');
    }
};