const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const embed = require("./embed.js");
const morpion = require("./morpion.js");


bot.morpion = {
    players: [],
    grid: [[0,0,0],[0,0,0],[0,0,0]],
    turn: Math.floor(Math.random()+1),
    disp: {},
    state: null
};  

bot.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, prefix: ${config.prefix}`); 
    bot.user.setPresence({ activity: { name: `${config.prefix}help`, type:'WATCHING' }, status: 'online' })
});


bot.on("message", async msg => {
    // ignore others bots
    if(msg.author.bot) return;
    
    // prefix
    if(msg.content.indexOf(config.prefix) !== 0) return;
    
    // command and args
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    morpion({bot, msg, command, args});

    // try {
    //     morpion({bot, msg, command, args});
    // } catch(e) {
    //     embed({bot, msg, command, args}, "Liste des commandes", "error",`${Object.keys(commands).map((command)=>{return('`'+config.prefix+command+'`')}).join('\n')}`);
    //     console.log(e);
    //     return
    // }    
});

bot.login(config.token);