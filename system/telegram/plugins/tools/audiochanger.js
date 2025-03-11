
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandNames = [
    'bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 
    'reverse', 'robot', 'slow', 'smooth', 'squirrel', 'vibra'
  ];
  
  // Tagging these commands with 'tools'
  commandNames.forEach(commandName => availableCommands.push({ command: commandName, tags: ['all'] }));

  bot.command(commandNames, async (ctx, next) => {
    const reply = ctx.message.reply_to_message;

    if (!reply || !reply.audio) {
      ctx.reply(`Reply Audio With Command Example: /${ctx.match[0]}`);
      return;
    }

    try {
      const waitMessage = await ctx.reply('Wait a moment...');

      const audioFileId = reply.audio.file_id;
      const audioFile = await ctx.telegram.getFileLink(audioFileId);
      const originalFileName = reply.audio.file_name || 'audio';
      const extension = path.extname(originalFileName);
      const baseName = path.basename(originalFileName, extension);
      const audioPath = path.join(__dirname, `temp_${baseName}${extension}`);
      const outputFileName = `${baseName}_${ctx.match[0]}${extension}`;
      const outputPath = path.join(__dirname, outputFileName);

      const response = await axios({
        url: audioFile,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        let set;
        switch (ctx.match[0]) {
          case 'bass': set = '-af equalizer=f=94:width_type=o:width=2:g=30'; break;
          case 'blown': set = '-af acrusher=.1:1:64:0:log'; break;
          case 'deep': set = '-af atempo=4/4,asetrate=44500*2/3'; break;
          case 'earrape': set = '-af volume=12'; break;
          case 'fast': set = '-filter:a "atempo=1.63,asetrate=44100"'; break;
          case 'fat': set = '-filter:a "atempo=1.6,asetrate=22100"'; break;
          case 'nightcore': set = '-filter:a atempo=1.06,asetrate=44100*1.25'; break;
          case 'reverse': set = '-filter_complex "areverse"'; break;
          case 'robot': set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'; break;
          case 'slow': set = '-filter:a "atempo=0.7,asetrate=44100"'; break;
          case 'smooth': set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'; break;
          case 'squirrel': set = '-filter:a "atempo=0.5,asetrate=65100"'; break;
          case 'vibra': set = '-filter_complex "vibrato=f=15"'; break;
          default: set = ''; break;
        }

        ffmpeg(audioPath)
          .output(outputPath)
          .outputOptions(set.split(' '))
          .on('end', async () => {
            try {
              await ctx.replyWithAudio({ source: outputPath, filename: outputFileName });
              await ctx.telegram.editMessageText(ctx.chat.id, waitMessage.message_id, null, 'Success');
            } catch (error) {
              console.error('Error sending audio:', error);
              await ctx.reply('Terjadi kesalahan saat mengirim audio. Mohon coba lagi nanti.');
            } finally {
              fs.unlinkSync(audioPath);
              fs.unlinkSync(outputPath);
            }
          })
          .on('error', async (err) => {
            console.error('Error processing audio:', err);
            await ctx.reply('Terjadi kesalahan saat memproses audio. Mohon coba lagi nanti.');
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          })
          .run();
      });

      writer.on('error', async (err) => {
        console.error('Error downloading audio:', err);
        await ctx.reply('Terjadi kesalahan saat mengunduh audio. Mohon coba lagi nanti.');
      });

      // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
      next();
    } catch (error) {
      console.error('Error processing audio:', error);
      await ctx.reply('Terjadi kesalahan saat memproses audio. Mohon coba lagi nanti.');
    }
  });
};