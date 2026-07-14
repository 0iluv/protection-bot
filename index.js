require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const { REST, Routes } = require("discord.js");
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

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} está online!`);

  const commands = [];

  client.commands.forEach(command => {
    commands.push(command.data.toJSON());
  });

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados!");
  } catch (err) {
    console.error(err);
  }
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
