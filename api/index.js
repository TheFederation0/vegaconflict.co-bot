const cron = require('node-cron');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

UpdateDB(0).catch(function (error) {console.log(error);});

cron.schedule('00 00 00 * * *', function() {
    console.log('updating database');
    UpdateDB(0).catch(function (error) {console.log(error);});
});

async function UpdateDB(offset) {
    for(offset; offset <= 100100; offset += 100) {
        const response = await axios.get(`https://api.kixeye.com/api/v2/leaderboards/52678363c3b9ad7179000001/entries?offset=${offset.toString()}&limit=100`).catch(function (error) {
            console.log(error);
        });

        console.log(offset);
        for (let n = 0; n < response.data.length; n++) {
            await prisma.players.upsert({
                where: {kxid: response.data[n].entryId},
                update: {
                    alias: response.data[n].alias,
                    rank: response.data[n].rank,
                    medals: response.data[n].value
                },
                create: {
                    kxid: response.data[n].entryId,
                    alias: response.data[n].alias,
                    rank: response.data[n].rank,
                    medals: response.data[n].value
                }
            })
        }
    }
}