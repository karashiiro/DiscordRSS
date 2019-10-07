const fs = require("fs");
const path = require("path");

const configStructure = require("./configStructure");

module.exports = (configPath) => {
    const truePath = path.join(__dirname, "../..", configPath);

    if (!fs.existsSync(truePath)) {
        fs.writeFileSync(truePath, JSON.stringify(configStructure));
        console.log("Please input your bot token into config.json.");
        process.exit(0);
    }

    const config = require(truePath);

    if (!config.token || config.token.length === 0) {
        console.error("Bot token not provided in config.json!");
        process.exit(1);
    }

    return config;
};
