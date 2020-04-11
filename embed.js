const { Client, MessageEmbed } = require("discord.js");

module.exports = async function(c, title, type, content) {
    let colors = {
        "error": 0xF03E38,
        "warning": 0xF09A38,
        "success": 0x38F03E,
        "info": 0x38F09A

    }
    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor(colors[type])
      .setDescription(content)
      .setFooter('Bot créé par Arthaud', 'https://arthaud.dev/img/apple-touch-icon.png')
      .setTimestamp();
      await c.msg.channel.send(embed);
};