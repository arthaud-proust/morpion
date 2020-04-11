module.exports = async function (c) {
    // get the delete count, as an actual number.
    const deleteCount = parseInt(c.args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 1 || deleteCount > 99) {
        c.msg.reply("Donne un nombre entre 1 et 99");
        c.msg.delete();
        return
    }
    
    await c.msg.channel.messages.fetch({ limit: deleteCount+1 }).then(messages => { // Fetches the messages
        c.msg.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
    )}).catch(error => c.msg.reply(`J'y arrive pas: ${error}`));
}