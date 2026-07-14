require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// Carrega os comandos
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log(`✅ ${client.user.tag} está online!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Ocorreu um erro ao executar este comando.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Ocorreu um erro ao executar este comando.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
