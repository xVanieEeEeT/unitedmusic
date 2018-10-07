const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = 'U';


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setGame("United | Music.","https://twitch.tv/9ivv")
  console.log('')
  console.log('')
  console.log('╔[═════════════════════════════════════════════════════════════════]╗')
  console.log(`[Start] ${new Date()}`);
  console.log('╚[═════════════════════════════════════════════════════════════════]╝')
  console.log('')
  console.log('╔[════════════════════════════════════]╗');
  console.log(`Logged in as * [ " ${client.user.username} " ]`);
  console.log('')
  console.log('Informations :')
  console.log('')
  console.log(`servers! [ " ${client.guilds.size} " ]`);
  console.log(`Users! [ " ${client.users.size} " ]`);
  console.log(`channels! [ " ${client.channels.size} " ]`);
  console.log('╚[════════════════════════════════════]╝')
  console.log('')
  console.log('╔[════════════]╗')
  console.log(' Bot Is Online')
  console.log('╚[════════════]╝')
  console.log('')
  console.log('')
});



const Util = require('discord.js');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const YouTube = require('simple-youtube-api');

const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

const queue = new Map();

const ytdl = require('ytdl-core');

const fs = require('fs');

const gif = require("gif-search");
/////////////////////////
////////////////////////

client.on('message', async msg => {
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;

    const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');

	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;

        if (!voiceChannel) return msg.channel.send("** عذراً، يرجى منك التواجد في روم صوتي لاستعمال البوت** :x:");

        const permissions = voiceChannel.permissionsFor(msg.client.user);

        if (!permissions.has('CONNECT')) {

			return msg.channel.send("**عذراً، لا أملك الصلاحيات الازمة للتحدث في الروم الخاص بك** :x:");
        }

		if (!permissions.has('SPEAK')) {

      return msg.channel.send("**عذراً، لا أملك الصلاحيات الازمة للتحدث في الروم الخاص بك** :x:");
		}

		if (!permissions.has('EMBED_LINKS')) {

			return msg.channel.sendMessage("** عذراً، لأ أمتلك صلاحيات لوضع الروابط في هذا الروم** :x:")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();


			for (const video of Object.values(videos)) {

                const video2 = await youtube.getVideoByID(video.id);
                await handleVideo(video2, msg, voiceChannel, true);
            }
			return msg.channel.send(`**${playlist.title}**, **تم اضافة الأغنية لقآئمة التشغيل بنجاح** ✅`);
		} else {

			try {

                var video = await youtube.getVideo(url);

			} catch (error) {
				try {

					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
                    const embed1 = new Discord.RichEmbed()
                    .setTitle(":mag_right:  يرجى اختيار رقم المقطع :")
                    .setDescription(`
                    ${videos.map(video2 => `${++index}. **${video2.title}**`).join('\n')}`)

					.setColor("#f7abab")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})

/////////////////
					try {

						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('**..عذراً، لم يتم الآجابة برقم المقطع المراد تشغيله جاري الغاء العملية** :x:');
                    }

					const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);

				} catch (err) {

					console.error(err);
					return msg.channel.send("I didn't find any results!");
				}
			}

            return handleVideo(video, msg, voiceChannel);

        }

	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send("** عذراً، يجب منك التواجد في روم صوتي لاستعمال البوت ** :x:");
        if (!serverQueue) return msg.channel.send("**عذراً، *ليس هناك شيء في قائمة التشغيل لتخطيه** :x:");

		serverQueue.connection.dispatcher.end('**تم تخطي المقطع بنجاح!** ✅');
        return undefined;

	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send("**عذراً، يجب عليك التواجد في روم صوتي لاستعمال البوت** :x:");
        if (!serverQueue) return msg.channel.send("** عذراً، لا يوجد شيء في قائمة التشغيل لتخطيه** :x:");

		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('**تم الخروج من الروم الصوتي بنجاح، وتم ايقاف الأغنية بنجاح ✅**');
        return undefined;

	} else if (command === `vol`) {

		if (!msg.member.voiceChannel) return msg.channel.send("**عذراً، يجب عليك التواجد في روم صوتي لاستعمال البوت** :x:");
		if (!serverQueue) return msg.channel.send('**لا يمكن استعمال هذا الأمر بدون أن يكون هناك مقطع قيد التشغيل** :x:');
        if (!args[1]) return msg.channel.send(`**درجة الصوت الحالية:** 🔊 **${serverQueue.volume}**`);

		serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);

        return msg.channel.send(`** تم تغيير درجة الصوت الى:** ✅ **${args[1]}**`);

	} else if (command === `current`) {

		if (!serverQueue) return msg.channel.send('**لا يوجد قائمة تشغيل حالياً** :x:');
		const embedNP = new Discord.RichEmbed()
	    .setDescription(`Now playing **${serverQueue.songs[0].title}**`)
        return msg.channel.sendEmbed(embedNP);

	} else if (command === `queue`) {

		if (!serverQueue) return msg.channel.send('**لا يوجد قائمة تشغيل حالياً** :x:');
		let index = 0;
//	//	//
		const embedqu = new Discord.RichEmbed()
        .setTitle("The Queue Songs :")
        .setDescription(`
        ${serverQueue.songs.map(song => `${++index}. **${song.title}**`).join('\n')}
**قيد التشغيل حالياً 🎼 :** **${serverQueue.songs[0].title}**`)
        .setColor("#f7abab")
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('**تم ايقاف الأغنية مؤقتاً بنجاح ✅** ');
		}
		return msg.channel.send('**لم يتم ايجاد مقطع صوتي لايقافه مؤقتاً** :x:');
	} else if (command === "resume") {

		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
            return msg.channel.send('**تم استكمال الاغنية التي تم ايقافها مؤقتاً**✅ ');

		}
		return msg.channel.send('**عذراً، قائمة التشغيل فارغة حالياً** :x:');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);


	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`**لا يمكنني دخول هذا الروم الصوتي: :x:** ${error}!`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`**لا يمكن دخول هذا الروم الصوتي : :x:** ${error}!`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`**${song.title}**, **تم اضافة الأغنية الى قائمة التشغيل: ✅** `);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === '**عذرا، البث المباشر لديه اشارة ضعيفه حالياً**') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`**${song.title}**, **قيد التشغيل حالياً 🔊 :  **`);
}

client.on('message', message => {
	if (!message.content.startsWith(prefix)) return;
	var args = message.content.split(' ').slice(1);
	var argresult = args.join(' ');
	if (message.author.id !== "410778583682777098") return;
  
  
	if (message.content.startsWith(prefix + 'setwatch')) {
	client.user.setActivity(argresult, {type: 'WATCHING'})
	   console.log('test' + argresult);
	  message.channel.sendMessage(`Watch Now: **${argresult}**`)
  }
  
  
	if (message.content.startsWith(prefix + 'setlis')) {
	client.user.setActivity(argresult, {type: 'LISTENING'})
	   console.log('test' + argresult);
	  message.channel.sendMessage(`LISTENING Now: **${argresult}**`)
  }
  
  
  if (message.content.startsWith(prefix + 'setname')) {
	client.user.setUsername(argresult).then
		message.channel.sendMessage(`تم تغيير الاسم بنجاح الى :white_check_mark:  **${argresult}**`)
  }
  
  if (message.content.startsWith(prefix + 'setavatar')) {
	client.user.setAvatar(argresult);
	 message.channel.sendMessage(`تم تغيير الصورة بنجاح الى :white_check_mark:  **${argresult}**`);
  }
  
  if (message.content.startsWith(prefix + 'setstream')) {
	client.user.setGame(argresult, "https://www.twitch.tv/9ivv");
	   console.log('test' + argresult);
	  message.channel.sendMessage(`Streaming: **${argresult}**`)
  }
  if (message.content.startsWith(prefix + 'setplay')) {
	client.user.setGame(argresult);
	   console.log('test' + argresult);
	  message.channel.sendMessage(`Playing: **${argresult}**`)
  }
  
  
  
  });


client.on('message', message => {
  if (!message.content.startsWith(prefix)) return;
  var args = message.content.split(' ').slice(1);
  var argresult = args.join(' ');
  if (message.author.id !== "474175378118803466") return;


  if (message.content.startsWith(prefix + 'setwatch')) {
  client.user.setActivity(argresult, {type: 'WATCHING'})
     console.log('test' + argresult);
    message.channel.sendMessage(`Watch Now: **${argresult}**`)
}


  if (message.content.startsWith(prefix + 'setlis')) {
  client.user.setActivity(argresult, {type: 'LISTENING'})
     console.log('test' + argresult);
    message.channel.sendMessage(`LISTENING Now: **${argresult}**`)
}


if (message.content.startsWith(prefix + 'setname')) {
  client.user.setUsername(argresult).then
      message.channel.sendMessage(`تم تغيير الاسم بنجاح الى :white_check_mark:  **${argresult}**`)
}

if (message.content.startsWith(prefix + 'setavatar')) {
  client.user.setAvatar(argresult);
   message.channel.sendMessage(`تم تغيير الصورة بنجاح الى :white_check_mark:  **${argresult}**`);
}

if (message.content.startsWith(prefix + 'setstream')) {
  client.user.setGame(argresult, "https://www.twitch.tv/9ivv");
     console.log('test' + argresult);
    message.channel.sendMessage(`Streaming: **${argresult}**`)
}
if (message.content.startsWith(prefix + 'setplay')) {
  client.user.setGame(argresult);
     console.log('test' + argresult);
    message.channel.sendMessage(`Playing: **${argresult}**`)
}



});



client.on('message' , message => {
if (message.content === 'Uhelp') {
  message.react("🎵")
         let embed = new Discord.RichEmbed()

      .setThumbnail(message.author.avatarURL)
      .setTitle("**UnitedMusic Commands | أوامر البــوت 🎵**")
      .addField("**UPlay**","**لتشغيــل أغنيـة التي تريدها**")
      .addField("**UPause**","**لايقاف الأغنيــة الحاليـة مؤقتآ**")
       .addField("**UJoin**","**لجعـل البوت يدخـل رومـك الحآلي**")
   .addField("**UDisconnect**","**لأيقاف البوت أو الاغنية الحالية واخراجه من الروم الصوتي**")
   .addField("**UQueue**","**عرض قائمـة التشغيـل الحالية**")
   .addField("**UResume**", "**لاعادة تشغيل الآغنية التي تم ايقافها مؤقتآ**")
   .addField("**UCurrent**", "**لعرض الأغنية الحالية**")
   .addField("**USkip**", "**لتخطـي الأغنية الحالية الى الأغنية التالية**")
   .setFooter(`${client.user.username}`)
.setColor('RANDOM')
  message.channel.sendEmbed(embed);
    }
});




// Done.
//  Credits to > Crawl
// Full Edit + Arabic Translation + help menu by > Vanieeet


client.login(process.env.BOT_TOKEN);
