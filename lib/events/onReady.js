module.exports = async (client, message) => {
    const user = client.user;
    console.log("Logged in as " + user.tag);
    await user.setPresence({
        game: {
            name: "you",
            type: "LISTENING"
        }
    });
};

module.exports.eventName = "ready";
