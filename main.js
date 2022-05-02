// read the file rolls.txt
let fs = require("fs");
let rolls = fs.readFileSync("rolls.txt", "utf8");
require("dotenv").config();

// split the rolls into an array by \n
let rollsArray = rolls.split("\n");
let rollsdb = {};
let farms = {};

rollsArray.forEach(function (roll) {
  let re = /-\s+[a-zA-Z]+.*:\s+[a-zA-Z\s]+/gi;
  let match = roll.match(re);
  if (match) {
    let name = roll.split("- ")[1].split(": ")[0];
    // if it already exists in the db, append a number to the end of the name
    if (rollsdb[name]) {
      name += ` ${Math.floor(Math.random() * 10 + 1)}`;
      console.log("Deduped name: " + name);
    }

    rollsdb[name] = roll;
  }
  let re2 = /To look at: (\s([a-zA-Z]+\s)+)/i; // farms
});
console.log(`Loaded ${Object.keys(rollsdb).length} rolls`);

function levenschtienDistance(a, b) {
  if (a.length == 0) return b.length;
  if (b.length == 0) return a.length;
  let matrix = [];
  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  // fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }
  return matrix[b.length][a.length];
}
function fuzzyMatch(query, dict) {
  let rankings = {};
  for (let key in dict) {
    let distance = levenschtienDistance(query, key);
    rankings[key] = distance;
  }
  // return the top 2 matches
  let top2 = Object.keys(rankings)
    .sort(function (a, b) {
      return rankings[a] - rankings[b];
    })
    .slice(0, 2);

  return [rollsdb[top2[0]], rollsdb[top2[1]]];
}
const { Client, Intents } = require("discord.js");
const token = process.env.TOKEN;

function norm(leven) {
  //i will eventually deal with this
  return leven;
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

const Discord = require("discord.js");
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "search") {
    let query = interaction.options.getString("query");
    let results = fuzzyMatch(query, rollsdb);
    let embed = new Discord.MessageEmbed().setTitle("Results for " + query);
    if (results.length > 1) {
      embed.addFields(
        {
          name: `Option 1 (Probably PVE) [Cfd=${norm(
            levenschtienDistance(
              query,
              results[0].split("- ")[1].split(": ")[0]
            )
          )}]`,
          value: results[0],
        },
        {
          name: `Option 2 (Probably PVP) [Cfd=${norm(
            levenschtienDistance(
              query,
              results[1].split("- ")[1].split(": ")[0]
            )
          )}]`,
          value: results[1],
        }
      );
    } else {
      embed.addFields({ name: "Roll", value: results[0] });
    }
    embed.setFooter(
      "If you're not sure, try searching for the name of the roll in the document! (Cfd. = Confidence, lower is better)"
    );
    // add a url to the title
    embed.setURL(
      "https://docs.google.com/document/d/1CgUldHHOPzNCc4hKiC0Q7hO0V-t6mRn-yR6ks9IQnQ4/edit"
    );

    interaction.reply({ embeds: [embed] });
  }
});

// Login to Discord with your client's token
client.login(token);
