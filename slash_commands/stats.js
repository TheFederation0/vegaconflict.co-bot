"use strict";
const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js');
const Package = require('../package.json');
const axios = require('axios');

module.exports = class statsCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'stats',
            description: 'Displays player stats',
            options: [{
                type: CommandOptionType.INTEGER,
                name: 'kixid',
                description: 'Kixeye ID',
                required: true
            }]
        });

        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }

    async run(ctx) {

        Request(`https://api.vegaconflict.co/${ctx.options.kixid}`, 'get')
            .then(body => {
                body = body.data
                let y = ["N/A", "N/A", "N/A"];

                if (body.baseAttackPercent != null) y[0] = (body.baseAttackPercent).toFixed(2);
                if (body.baseDefencePercent != null) y[1] = (body.baseDefencePercent).toFixed(2);
                if (body.fleetWinPercent != null) y[2] = (body.fleetWinPercent).toFixed(2);
                let names;
                if (body.previousNames != null) {
                    let der = body.previousNames.length - parseInt(1);
                    names = "";
                    for (let i = 0; i < der; i++) {
                        names += body.previousNames[i].alias;
                        names += ", ";
                    }
                } else names = "N/A";

                let res = 'https://i.ibb.co/hZ6p6wg/no-history.png';
                if(body.historical[0].length !== 0) {
                    res = "{type:'line',data:{labels:['Jan','Feb', 'Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets:[{label:'FvF', data: [" + body.historical[0].fleet_atk + "," + body.historical[4].fleet_atk + "," + body.historical[5].fleet_atk + "," + body.historical[6].fleet_atk + "," + body.historical[7].fleet_atk + "," + body.historical[8].fleet_atk + "," + body.historical[9].fleet_atk + "," + body.historical[10].fleet_atk + "," + body.historical[11].fleet_atk + "," + body.historical[1].fleet_atk + "," + body.historical[2].fleet_atk + "," + body.historical[3].fleet_atk + "], fill:false,borderColor:'red',lineTension: '0.25',pointBackgroundColor:'red'}, {label:'Defense', data: [" + body.historical[0].base_def + "," + body.historical[4].base_def + "," + body.historical[5].base_def + "," + body.historical[6].base_def + "," + body.historical[7].base_def + "," + body.historical[8].base_def + "," + body.historical[9].base_def + "," + body.historical[10].base_def + "," + body.historical[11].base_def + "," + body.historical[1].base_def + "," + body.historical[2].base_def + "," + body.historical[3].base_def + "], fill:false,borderColor:'lightgreen',lineTension: '0.25',pointBackgroundColor:'lightgreen'}, {label:'Attack', data: [" + body.historical[0].base_atk + "," + body.historical[4].base_atk + "," + body.historical[5].base_atk + "," + body.historical[6].base_atk + "," + body.historical[7].base_atk + "," + body.historical[8].base_atk + "," + body.historical[9].base_atk + "," + body.historical[10].base_atk + "," + body.historical[11].base_atk + "," + body.historical[1].base_atk + "," + body.historical[2].base_atk + "," + body.historical[3].base_atk + "],fill:false,borderColor:'orange',lineTension: '0.25',pointBackgroundColor:'orange'}]},options: {scales:{xAxes:[{display: true,gridLines: {display: true ,color: 'rgba(255,255,255,0.4)'},ticks: {fontColor: 'white'},}],yAxes: [{display: true,gridLines: {display: true ,color: 'rgba(255,255,255,0.4)'},ticks: {beginAtZero:true,fontColor: 'white'},}]},legend: {labels: {fontColor: 'white'}}}}"
                    res = "https://quickchart.io/chart?c=" + encodeURIComponent(res);
                }

                return JSON.parse(`{
          "embeds": [
            {
              "title": "` + body.alias + `",
              "url": "https://vegaconflict.co/stats/player/` + body.userGameId + `",
              "color": 7905779,
              "footer": {
                "text": "Bot build ` + Package.version + `"
              },
              "thumbnail": {
                "url": "https://vegaconflict.co/img/VCIcon.png"
              },
              "image": {
                "url": "` + res + `"
              },
              "fields": [
                {
                  "name": "\u200b",
                  "value": "\u200b"
                },
                {
                  "name": ":id: Player ID:",
                  "value": "` + body.userGameId + `"
                },
                {
                  "name": "Previous Names:",
                  "value": "` + names +`"
                },
                {
                  "name": ":beginner: Level:",
                  "value": "`+ body.level +`",
                  "inline": true
                },
                {
                  "name": ":trophy: Medals:",
                  "value": "` + body.medals + `",
                  "inline": true
                },
                {
                  "name": ":earth_americas: Planet:",
                  "value": "` + body.planet + `",
                  "inline": true
                },
                {
                  "name": ":calendar_spiral: Playing Since:",
                  "value": "` + body.since  +`",
                  "inline": true
                },
                {
                  "name": "Last Seen:",
                  "value": "` + body.seen +`",
                  "inline": true
                },
                {
                  "name": ":bomb: Base Attack: `  + body.baseAttackTotal + `, ` + y[0] + `%, ` + body.baseAttackKd + `K/D",
                  "value": "Wins  ` + body.baseAttackWin + `; Draw  ` + body.baseAttackDraw + `; Loss  ` + body.baseAttackLoss + `",
                  "inline": false
                },
                {
                  "name": ":shield: Base Defense: ` + body.baseDefenceTotal + `, ` + y[1] + `%, ` + body.baseDefenceKd + `K/D",
                  "value": "Wins  ` + body.baseDefenceWin + `; Draw  ` + body.baseDefenceDraw + `; Loss  ` + body.baseDefenceLoss + `",
                  "inline": false
                },
                {
                  "name": ":crossed_swords: Fleet vs Fleet: ` + body.fleetTotal + `, ` + y[2] + `%, ` + body.fleetKd + `K/D",
                  "value": "Wins  ` + body.fleetWin + `; Draw  ` + body.fleetDraw + `; Loss  ` + body.fleetLoss + `",
                  "inline": false
                }
              ]
            }
          ]
        }`);
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
            });
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

