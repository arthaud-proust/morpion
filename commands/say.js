module.exports = async function (c) {
    const sayMessage = c.args.join(" ");
    c.msg.delete().catch(O_o=>{}); 
    c.msg.channel.send(sayMessage);
}