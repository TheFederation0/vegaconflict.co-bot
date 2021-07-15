"use strict";
const Discord = require('discord.js');
const axios = require('axios');
const { Command } = require('discordjs');
const Package = require('../../package.json');
const Emoji = require('../../emojis.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
let reac;

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'default',
            memberName: 'stats',
            description: 'displays player stats (Vega ID, Kixeye ID or Steam ID)',
            args: [
                {
                    key: 'text',
                    prompt: 'Please enter a valid ID or Username',
                    type: 'string'
                },
            ],
        });
    }

    async run(message, {text}) {
        let author = message.author.id;
        let emojis = [];
        let Embed = [];
        if(isNaN(Number.parseInt(text, 10))) {

            await prisma.players.findMany({
                where: { alias: text }, select: {kxid: true, rank: true, medals: true, uid: true, alias: true}
            })
                .then(resp => {
                if (resp.length === 0) {
                    message.channel.send('No player with specified name');
                    return;
                }
                if (resp.length === 1) {
                    let Embed = new Discord.MessageEmbed()
                        .setColor('#e0b869')
                        .setTitle("Processing <a:typingstatus:651375221323988992>")
                        .setTimestamp()
                        .setFooter('Bot build ' + Package.version);
                    message.embed(Embed).catch(err => console.log(err))
                        .then(function (msg) {
                            Process(msg, resp[0].kxid).catch(err => {console.log(err); Embed.setDescription('There was an error, please try again later').setColor('#c10f0f')});
                        });
                }
                else if (resp.length > 9) {
                    let num = (resp.length / 9).toFixed(0);
                    let val = 0;
                    for (let n = 0; n < num; n++) {
                        Embed.push(new Discord.MessageEmbed()
                            .setColor('#78a1f3')
                            .setTitle("Players with specified name")
                            .setDescription('Please react with the desired reaction')
                            .setThumbnail('https://vegaconflict.co/img/VCIcon.png')
                            .addField('\u200b', '\u200b')
                            .setTimestamp()
                            .setFooter('Page ' + (n + 1) + '/' + num));
                        for (let x = 0; (x < 9 && val < resp.length); x++, val++)
                            Embed[n].addField(Emoji.numbers[x] + ' ' + resp[val].alias, 'Rank: ' + resp[val].rank + ' ; Medals: ' + resp[val].medals, true);
                    }
                    message.embed(Embed[0])
                        .catch(err => console.log(err))
                        .then(function (msg) {
                            msg.react("◀").catch(err => console.log(err))
                            for (let n = 0; n < 9; n++)
                                emojis.push(Emoji.numbers[n]);
                            msg.react("▶").catch(err => console.log(err));
                            const filter = (reaction, user) => {
                                return (emojis.includes(reaction.emoji.name) || reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === author;
                            };

                            const collector = msg.createReactionCollector(filter, {time: 60000});

                            collector.on('collect', (reaction, user) => {
                                reac = reaction.emoji.name;
                                if (reac === '◀' && reaction.message.embeds[0].footer.text[5] != 1)
                                    msg.edit(Embed[Number.parseInt(reaction.message.embeds[0].footer.text[5], 10) - 2]).catch(() => console.error).then(() => {
                                        reaction.users.remove(reaction.users.cache.last()).catch(err => console.log(err))
                                        collector.empty()
                                    });
                                else if (reac === '▶' && reaction.message.embeds[0].footer.text[5] != num)
                                    msg.edit(Embed[Number.parseInt(reaction.message.embeds[0].footer.text[5], 10)]).catch(() => console.error).then(() => {
                                        reaction.users.remove(reaction.users.cache.last()).catch(err => console.log(err));
                                        collector.empty()
                                    });
                                else if (emojis.includes(reac)) {
                                    Process(msg, resp[emojis.findIndex(checkReaction) + (9 * (Number.parseInt(reaction.message.embeds[0].footer.text[5], 10) - 1))].kxid)
                                    collector.stop()
                                }
                            });

                            collector.on('end', collected => {
                                if (collected.first() === undefined || !emojis.includes(collected.first().emoji.name))
                                    msg.channel.send('request expired');
                                msg.reactions.removeAll()
                            });
                        });
                }
                else {
                    Embed[0] = new Discord.MessageEmbed()
                        .setColor('#78a1f3')
                        .setTitle("Players with specified name")
                        .setThumbnail('https://vegaconflict.co/img/VCIcon.png')
                        .addField('\u200b', '\u200b')
                        .setTimestamp()
                        .setFooter('Bot build ' + Package.version);
                    for (let n = 0; n < resp.length; n++)
                        Embed[0].addField(Emoji.numbers[n] + ' ' + resp[n].alias, 'Rank: ' + resp[n].rank + ' ; Medals: ' + resp[n].medals, true);

                    message.embed(Embed[0])
                        .catch(err => console.log(err))
                        .then(function (msg) {
                            for (let n = 0; n < resp.length; n++) {
                                msg.react(Emoji.numbers[n]).catch(err => console.log(err))
                                emojis.push(Emoji.numbers[n]);
                            }

                            let filter = (reaction, user) => {
                                return emojis.includes(reaction.emoji.name) && user.id === author;
                            };

                            msg.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
                                .then(collected => {
                                    const reaction = collected.first();
                                    reac = reaction.emoji.name;
                                    if (emojis.includes(reaction.emoji.name)) {
                                        Process(msg, resp[emojis.findIndex(checkReaction)].kxid)
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                    msg.reactions.removeAll();
                                    msg.channel.send('request expired');
                                });
                        });
            }
            });
        }
        else {
            let Embed = new Discord.MessageEmbed()
                .setColor('#e0b869')
                .setTitle("Processing <a:typingstatus:651375221323988992>")
                .setTimestamp()
                .setFooter('Bot build ' + Package.version);
            message.embed(Embed).catch(err => console.log(err))
                .then(function (msg) {
                    Process(msg, text).catch(err => {console.log(err); Embed.setDescription('There was an error, please try again later').setColor('#c10f0f')});
                });
        }
    }
}

function Request(url, method, data, headers){
        return axios({
            method: method,
            url: url,
            headers: headers,
            data: data
        });
}

async function Process(msg, id) {
    Request(`https://api.vegaconflict.co/${id}`, 'get')
        .then(body => {
            body = body.data

            let y = ["N/A", "N/A", "N/A"];

            if (body.baseAttackPercent != null) y[0] = (body.baseAttackPercent).toFixed(2);
            if (body.baseDefencePercent != null) y[1] = (body.baseDefencePercent).toFixed(2);
            if (body.fleetWinPercent != null) y[2] = (body.fleetWinPercent).toFixed(2);

            let names = "None";

            if (body.previousNames != null) {
                let der = body.previousNames.length - parseInt(1);
                names = "";
                for (let i = 0; i < der; i++) {
                    names += body.previousNames[i].alias;
                    names += ", ";
                }
            }

            let res = 'https://i.ibb.co/hZ6p6wg/no-history.png';
            if (body.historical[0].length !== 0) {
                res = "{type:'line',data:{labels:['Jan','Feb', 'Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets:[{label:'FvF', data: [" + body.historical[0].fleet_atk + "," + body.historical[4].fleet_atk + "," + body.historical[5].fleet_atk + "," + body.historical[6].fleet_atk + "," + body.historical[7].fleet_atk + "," + body.historical[8].fleet_atk + "," + body.historical[9].fleet_atk + "," + body.historical[10].fleet_atk + "," + body.historical[11].fleet_atk + "," + body.historical[1].fleet_atk + "," + body.historical[2].fleet_atk + "," + body.historical[3].fleet_atk + "], fill:false,borderColor:'red',lineTension: '0.25',pointBackgroundColor:'red'}, {label:'Defense', data: [" + body.historical[0].base_def + "," + body.historical[4].base_def + "," + body.historical[5].base_def + "," + body.historical[6].base_def + "," + body.historical[7].base_def + "," + body.historical[8].base_def + "," + body.historical[9].base_def + "," + body.historical[10].base_def + "," + body.historical[11].base_def + "," + body.historical[1].base_def + "," + body.historical[2].base_def + "," + body.historical[3].base_def + "], fill:false,borderColor:'lightgreen',lineTension: '0.25',pointBackgroundColor:'lightgreen'}, {label:'Attack', data: [" + body.historical[0].base_atk + "," + body.historical[4].base_atk + "," + body.historical[5].base_atk + "," + body.historical[6].base_atk + "," + body.historical[7].base_atk + "," + body.historical[8].base_atk + "," + body.historical[9].base_atk + "," + body.historical[10].base_atk + "," + body.historical[11].base_atk + "," + body.historical[1].base_atk + "," + body.historical[2].base_atk + "," + body.historical[3].base_atk + "],fill:false,borderColor:'orange',lineTension: '0.25',pointBackgroundColor:'orange'}]},options: {scales:{xAxes:[{display: true,gridLines: {display: true ,color: 'rgba(255,255,255,0.4)'},ticks: {fontColor: 'white'},}],yAxes: [{display: true,gridLines: {display: true ,color: 'rgba(255,255,255,0.4)'},ticks: {beginAtZero:true,fontColor: 'white'},}]},legend: {labels: {fontColor: 'white'}}}}"
                res = "https://quickchart.io/chart?c=" + encodeURIComponent(res);
            }

            let statsEmbed = new Discord.MessageEmbed()
                .setColor('#78a1f3')
                .setTitle(body.alias)
                .setURL('https://vegaconflict.co/stats/player/' + body.userGameId)
                .setThumbnail('https://vegaconflict.co/img/VCIcon.png')
                .setImage(res)
                .addField('\u200b', '\u200b')
                .addField(':id: Player ID:', body.userGameId, false)
                .addField('Previous Names:', names, false)
                .addField(':beginner: Level:', body.level, true)
                .addField(':trophy: Medals:', body.medals, true)
                .addField(':earth_americas: Planet:', body.planet, true)
                .addField(':calendar_spiral: Playing Since:', body.since, true)
                .addField('Last Seen:', body.seen, true)
                .addField(':bomb: Base Attack: ' + body.baseAttackTotal + ', ' + y[0] + '%, ' + body.baseAttackKd + 'K/D', 'Win  ' + body.baseAttackWin + '; Draw  ' + body.baseAttackDraw + '; Loss  ' + body.baseAttackLoss, false)
                .addField(':shield: Base Defense: ' + body.baseDefenceTotal + ', ' + y[1] + '%, ' + body.baseDefenceKd + 'K/D', 'Win  ' + body.baseDefenceWin + '; Draw  ' + body.baseDefenceDraw + '; Loss  ' + body.baseDefenceLoss, false)
                .addField(':crossed_swords: Fleet vs Fleet: ' + body.fleetTotal + ', ' + y[2] + '%, ' + body.fleetKd + 'K/D', 'Win  ' + body.fleetWin + '; Draw  ' + body.fleetDraw + '; Loss  ' + body.fleetLoss, false)
                .setTimestamp()
                .setFooter('Bot build ' + Package.version);

            msg.edit(statsEmbed).catch(r => console.error)
    })
    .catch(err => {
        console.log(err);
        let Embed = new Discord.MessageEmbed()
            .setColor('#c10f0f')
            .setTitle("There was an error, please try again later")
            .setTimestamp()
            .setFooter('Bot build ' + Package.version);
        if(err.response.status === 404) Embed.setTitle("No stats available for the specified ID").setColor('#f35f0f');
        msg.edit(Embed).catch(r => console.error)
    })
}

function checkReaction(data) {
    return data === reac;
}