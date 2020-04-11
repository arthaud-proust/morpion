module.exports = async function (c) {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await c.msg.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - c.msg.createdTimestamp}ms.`);

}