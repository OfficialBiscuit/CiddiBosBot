const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const db = require("quick.db");
const moment = require("moment");
const ayarlar = require("./ayarlar.json");
const express = require("express");
const randomPuppy = require("random-puppy");
const api = require("covidapi");
const Canvacord = require("canvacord")


const prefix = ayarlar.prefix;
/////
const app = express();
app.get("/", (req, res) => res.send("Boş Bot Aktif"));
app.listen(process.env.PORT, () =>
  console.log("Port ayarlandı: " + process.env.PORT)
);
//////////////////

client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(" ")[0].slice(ayarlar.prefix.length);
  let params = message.content.split(" ").slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
});

client.on("ready", () => {
  console.log(`Bütün komutlar başarıyla yüklendi!`);
  client.user.setStatus("dnd");
  client.user.setActivity("-yardım Yazmanı", { type: "LISTENING" });
});

const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut ismi: ${props.help.name.toUpperCase()}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.yetkiler = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = -ayarlar.varsayilanperm;
  if (message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if (message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if (message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if (message.author.id === message.guild.ownerID) permlvl = 6;
  if (message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};

client.on("message", async msg => {
  if (msg.author.bot) return;

  let i = await db.fetch(`reklamFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const reklam = [
      "https://",
      "http://",
      "discord.gg",
      "www",
      ".com",
      ".guide",
      ".html",
      ".php",
      ".asp",
      ".rar",
      ".zip",
      ".xml",
      ".tr",
      ".istanbul",
      ".blog",
      ".co",
      ".club",
      ".top",
      ".network",
      ".info",
      ".xyz",
      ".org",
      ".shop",
      ".academy",
      ".codes",
      ".studio",
      ".gg",
      ".tools"
    ];
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        {
          msg.delete();
          return msg.channel
            .send(`<@${msg.author.id}>, Reklam Yapmak Yasak!`)
            .then(message => message.delete({ timeout: 5000 }));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

client.on("message", msg => {
  const i = db.fetch(`${msg.guild.id}.kufur`);
  if (i) {
    const kufur = [
      "oç",
      "amk",
      "yarrak",
      "ananı sikiyim",
      "puşt",
      "göt",
      "ibne",
      "sik",
      "orospu çocuğu",
      "pezevenq",
      "pezevenk",
      "yavşak",
      "aq",
      "orospu",
      "oruspu"
    ];
    if (kufur.some(word => msg.content.includes(word))) {
      try {
        {
          msg.delete();

          return msg.channel
            .send(`<@${msg.author.id}> Bu Sunucuda Küfür Filtresi Aktiftir.`)
            .then(message => message.delete({ timeout: 5000 }));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  if (i == "acik") {
    if (
      msg.content.toLowerCase() == "sa" ||
      msg.content.toLowerCase() == "s.a" ||
      msg.content.toLowerCase() == "selamun aleyküm" ||
      msg.content.toLowerCase() == "sea" ||
      msg.content.toLowerCase() == "selam"
    ) {
      try {
        msg.react("767675205103255617");
        msg.react("767675188061274152");

        return msg.reply("Aleyküm Selam, Hoşgeldin");
      } catch (err) {
        console.log(err);
      }
    }
  } else if (i == "kapali") {
  }
  if (!i) return;
});

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  {
    if (
      msg.content.toLowerCase() == "ben çok hawliyim" ||
      msg.content.toLowerCase() == "ben çok hawaliyim" ||
      msg.content.toLowerCase() == "ben hawaliyim" ||
      msg.content.toLowerCase() == "ben hawliyim" ||
      msg.content.toLowerCase() == "hawli oldum" ||
      msg.content.toLowerCase() == "hawliyim" ||
      msg.content.toLowerCase() == "hawaliyim" ||
      msg.content.toLowerCase() == "çok hawaliyim" ||
      msg.content.toLowerCase() == "çok hawliyim"
    ) {
      try {
        msg.react("767351281509335040");
        msg.react("🇭");
        msg.react("🇦");
        msg.react("🇼");
        msg.react("🇱");
        msg.react("🇮");
        msg.react("😎");

        return msg.reply("Belli Oluyor Zaten <:whuuuu:767351281509335040>");
      } catch (err) {
        console.log(err);
      }
    }
  }
  {
  }
  if (!i) return;
});

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  {
    if (
      msg.content.toLowerCase() == "hawli" ||
      msg.content.toLowerCase() == "hawali" ||
      msg.content.toLowerCase() == "sen hawalisin" ||
      msg.content.toLowerCase() == "sen hawalisin"
    ) {
      try {
        return msg.reply(
          "Kime Dedin Bilmiyorum Ama O Kişi Çok Hawali <:whuuuu:767351281509335040>"
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  {
  }
  if (!i) return;
});

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  {
    if (
      msg.content.toLowerCase() == "görüşürüz" ||
      msg.content.toLowerCase() == "bb" ||
      msg.content.toLowerCase() == "by" ||
      msg.content.toLowerCase() == "bye"
    ) {
      try {
        msg.react("768101321147809814");

        return msg.reply("Yine görüşmek dileğiyle <:bye:768101321147809814>");
      } catch (err) {
        console.log(err);
      }
    }
  }
  {
  }
  if (!i) return;
});

client.on("message", async msg => {
  if (msg.content === "-korona dünya") {
    api.all().then(console.log);

    const data = await api.all();
    const coronaembed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("😷Dünya Korona Virüs Tablosu😷")
      .addField("😷Toplam Vaka😷", data.cases, true)
      .addField("😷Toplam Aktif Vaka😷", data.active, true)
      .addField("😷Ağır Vakalar😷", data.critical, true)
      .addField("💀Toplam Ölüm💀", data.deaths, true)
      .addField("💚Toplam İyileşen💚", data.recovered, true)
      .addField("😷Bugünki Vaka😷", data.todayCases, true)
      .addField("💀Bugünki Ölümler💀", data.todayDeaths, true)
      .addField("💚Bugünki İyileşenler💚", data.todayRecovered, true);
    msg.channel.send(coronaembed);
  } else if (msg.content.startsWith("-korona")) {
    if (msg.content === "-korona")
      return msg.channel.send("Lütfen Ülkeyi Yazarak Tekrar Deneyiniz");
    var prefix = "-";
    const countrycovid = msg.content.slice(prefix.lenght).split(" ");
    const countrydata = await api.countries({ country: countrycovid });

    const data = await api.all();
    const corona = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle(`😷${countrycovid[1]} Korona Virüs Tablosu😷`)
      .setFooter(
        "Eğer Bugünki İstatistikler 0 ise Daha Korona Virüs Tablosu Yayınlanmamış Demektir"
      )
      .setTimestamp()
      .addField("😷Toplam Vaka😷", countrydata.cases, true)
      .addField("😷Toplam Aktif Vaka😷", countrydata.active, true)
      .addField("😷Ağır Vakalar😷", countrydata.critical, true)
      .addField("💀Toplam Ölüm💀", countrydata.deaths, true)
      .addField("💚Toplam İyileşen💚", countrydata.recovered, true)
      .addField("😷Bugünki Vaka😷", countrydata.todayCases, true)
      .addField("💀Bugünki Ölümler💀", countrydata.todayDeaths, true)
      .addField("💚Bugünki İyileşenler💚", countrydata.todayRecovered, true);
    msg.channel.send(corona);
  }
});

client.on("message", async message => {
  if (message.content === "-meme") {
    const subReddits = ["burdurland", "adaland", "memeler", "tarihmemes"];
    const random = subReddits[Math.floor(Math.random() * subReddits.length)];

    const img = await randomPuppy(random);
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setImage(img)
      .setTitle(`/r/${random}`)
      .setURL(`https://reddit.com/r/${random}`);
    message.channel.send(embed);
  }
});


client.on("message", async message => {
  if(message.author.bot) return
})

function xp(message) {
if(message.content.startsWith(ayarlar.prefix)) return
const randomNumber = Math.Floor(Math.random() * 10) + 15
db.add(`guild_${message.guild.id}_xp_${message.author.id}`, randomNumber)
db.add(`guild_${message.guild.id}_xptotal_${message.guild.id}`, randomNumber)
  var level = db.get(`guild_${message.guild.id}_level_${message.author.id}`) || 1
  var xp = db.get(`guild_${message.guild.id}_xp_${message.author.id}`)
}

client.login(ayarlar.token);
