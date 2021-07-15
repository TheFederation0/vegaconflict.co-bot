const { CommandoClient } = require('discordjs');
const path = require('path');
const config = require('./config.json');
const { SlashCreator, GatewayServer } = require('slash-create');
const creator = new SlashCreator({
    applicationID: config.CLIENT_ID,
    publicKey: config.CLIENT_PUBLIC_KEY,
    token: config.token,
});

const client = new CommandoClient({
    commandPrefix: config.prefix,
    owner: '419573412730765312',
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['default', 'The default commands'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: false,
        unknownCommand: false,
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log('Running with status code 0');
    client.user.setActivity('#help');
});

creator
    .withServer(
        new GatewayServer(
            (handler) => client.ws.on('INTERACTION_CREATE', handler)
        )
    )
    .registerCommandsIn(path.join(__dirname, 'slash_commands'))
    .syncCommands();

client.on('error', console.error);

client.login(config.token).catch(console.error);