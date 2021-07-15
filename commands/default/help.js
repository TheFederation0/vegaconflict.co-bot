"use strict";
const Discord = require('discord.js');
const { Command } = require('discordjs');
const config = require('../../config.json');
const Package = require('../../package.json');

module.exports = class helpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'default',
            memberName: 'help',
            description: 'displays the help message',
        });
    }

    run(message) {
        let embed = new Discord.MessageEmbed()
                .setColor('#78A1F3')
                .setTitle('Commands')
                .addField(config.prefix+'stats playerId', 'displays player stats (Vega ID, Kixeye ID or Steam ID)')
                .addField(config.prefix+'about', 'should be obvious')
                .addField(config.prefix+'invite', 'should also be obvious')
                .setTimestamp()
                .setFooter('Bot build ' + Package.version, 'https://vegaconflict.co/img/VCIcon.png');
        return message.embed(embed);
    }
};