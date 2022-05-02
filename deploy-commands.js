const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

let client_id = process.env.CLIENT_ID;
let guild_id = process.env.GUILD_ID;
let token = process.env.TOKEN;
const commands = [
  new SlashCommandBuilder()
    .setName("search")
    .setDescription("saerch for weapon roll")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The name to search for")
        .setRequired(true)
    ),
].map((command) => command.toJSON());
const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
