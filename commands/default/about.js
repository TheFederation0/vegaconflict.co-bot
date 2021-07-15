"use strict";
const Discord = require('discord.js');
const { Command } = require('discordjs');
const Package = require('../../package.json');

module.exports = class aboutCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'about',
            group: 'default',
            memberName: 'about',
            description: 'should be obvious',
        });
    }

    run(message) {
        let embed = new Discord.MessageEmbed()
            .setColor('#78a1f3')
            .setTitle('About')
            .addField('Creator', 'The Federation#0001')
            .addField('Bot Build', Package.version)
            .addField('Source', '[vegaconflict.co](https://vegaconflict.co/)')
            .addField('Invite', '[link](https://discordapp.com/api/oauth2/authorize?client_id=588408090068779059&permissions=67488832&scope=bot)')
            .setTimestamp()
            .setFooter('Node ' + process.env.NODE, 'https://vegaconflict.co/img/VCIcon.png');
        message.embed(embed);
    }
};