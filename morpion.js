const embed = require('./embed.js');
const config = require('./config.json');

module.exports = function(c) {
    if (c.command == "new" && c.bot.morpion.state != "playing") {
        newgame(c);
    } else if (c.command == "join") {
        c.msg.delete();
        if(c.bot.morpion.state == "created") {
            join(c);
        } else {
            c.msg.reply(`Aucune partie n'existe ou alors elle a déjà commencé. Tu peux en créer une avec \`${config.prefix}new\``)
        }
    } else if(c.command == "clear" && c.bot.morpion.state != "playing") { 
        clear(c)
    } else if(c.bot.morpion.state == "playing" && c.command) { //play in one ceil
        play(c)
    } else {
        c.msg.delete();
        embed(c, "Liste des commandes morpion", "error", `\`${config.prefix}new\` : créer une partie\n\`${config.prefix}join\` : rejoindre la partie\n\`${config.prefix}clear nombreDeMessages\` : supprimer n messages du bot, tous les messages si rien n'est spécifié`)
    }
}

async function clear(c) {
    // get the delete count, as an actual number.
    const deleteCount = parseInt(c.args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 1 || deleteCount > 99) {
        c.msg.reply("Donne un nombre entre 1 et 99");
        c.msg.delete();
        return
    }
    
    await c.msg.channel.messages.fetch({ limit: deleteCount }).then(messages => { // Fetches the messages
        messages = messages.filter(message=>message.author.id == c.bot.user.id)
        c.msg.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
    )}).catch(error => c.msg.reply(`J'y arrive pas: ${error}`));
    c.msg.delete();
}

function newgame(c) {
    // if game is already playing, do nothing
    if (c.bot.morpion.state === "playing") {
        return
    }
    // else create or recreate game
    c.bot.morpion = {
        players: [],
        grid: [[2,2,2],[2,2,2],[2,2,2]],
        turn: Math.round(Math.random()),
        disp: {},
        state: "created"
    };  
    c.bot.morpion.players.push(c.msg.member);
    c.msg.delete();
    c.bot.morpion.disp.embed = embed(c, "Nouvelle partie de morpion", "success", `**${c.msg.member.displayName}** vient de créer une partie. Il manque un joueur! \nTape la commande \`${config.prefix}join\` pour rejoindre la partie.\n\nDisposition des cases:\na1 b1 c1\na2 b2 c2\na3 b3 c3\nLorsque c'est ton tour joue avec \`${config.prefix}n° case\`\n**Ex:** \`${config.prefix}b1 ou B1\``)
}

function getGrid(c) {
    let grid = c.bot.morpion.grid.map((row)=>{
        return(row.map((ceil)=>{
            if(ceil==2) return(':black_circle:') 
            else return(ceil==1?':x:':':o:')
        }).join('')+'\n')
    }).join('');
    return(grid)
}

async function display(c) {
    try {
        c.bot.morpion.disp.player.delete();
        c.bot.morpion.disp.grid.delete();
    } catch{}
    c.bot.morpion.disp.player = await c.msg.channel.send(`C'est à ${c.bot.morpion.players[c.bot.morpion.turn].displayName} de jouer en tapant \`${config.prefix}a1|a2..c2|c3\`\n`);
    c.bot.morpion.disp.grid = await c.msg.channel.send(getGrid(c));
}

async function join(c) {
    if (c.bot.morpion.players.length ==1 && (c.msg.member.id !== c.bot.morpion.players[0].id)) {
        c.bot.morpion.players.push(c.msg.member);
        let x = await c.msg.reply(`Tu est :x: et ${c.bot.morpion.players[0].displayName} :o:`);
        setTimeout(function(c) {x.delete()}, 4000);

        c.bot.morpion.state = "playing";
        display(c);
    } else {
        c.msg.reply('Soit tu joue déjà, soit c\'est plein');
    }
}


async function play(c) {
    let r =/[a-cA-C]{1}[1-3]{1}/gm; // only letterNumber form

    if(c.msg.member.id !== c.bot.morpion.players[c.bot.morpion.turn].id || !r.test(c.command)) {
        c.msg.delete();
        return
    }
    const l={"a": 0, "b":1, "c": 2};
    let x = l[c.command[0].toLowerCase()];
    let y = c.command[1]-1;
    if (c.bot.morpion.grid[y][x] == 2) {
        c.bot.morpion.grid[y][x] = c.bot.morpion.turn;
        checkWin(c);
        c.bot.morpion.turn = c.bot.morpion.turn==1?0:1;
        display(c);
        c.msg.delete();
    } else {
        c.msg.delete();
        let x = await c.msg.reply("c'est déjà rempli!");
        setTimeout(function(c) {x.delete()}, 2000);
    }

}


function checkWin(c) {
    let g = c.bot.morpion.grid;
    let t = c.bot.morpion.turn;
    let winner=null;

    for(let player=0; player<2; player++) {
        for(let i=0; i<g.length;i++) {
            if (g[i][0]==t && g[i][1]==t && g[i][2]==t) {winner=player}
        }
        for(let j=0; j<g[0].length;j++) {
            if (g[0][j]==t && g[1][j]==t && g[2][j]==t) {winner=player}
        }
        if (g[0][0]==t && g[1][1]==t && g[2][2]==t) {winner=player}
        if (g[0][2]==t && g[1][1]==t && g[2][0]==t) {winner=player}
    }
    if (winner) {
        end(c, `${c.bot.morpion.players[winner].displayName} a gagné!`);
    } else if (!winner && !g[0].includes(2) && !g[1].includes(2) && !g[2].includes(2)) {
        end(c, "Égalité")
    }

}
function end(c, msg) {
    c.bot.morpion.state = "end";
    embed(c, msg, "success", `Vous pouvez relancer une partie avec \`${config.prefix}new\``);
}