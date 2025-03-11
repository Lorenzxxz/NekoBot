const { Telegraf, Markup } = require('telegraf');
const fs = require('fs').promises;
const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')
const fetch = require("node-fetch");
const { config, saveConfig } = require('./misc/addBotToken');
const searchResults = {}
const baseUrl = 'https://cin.one/';
const { telegramToWhatsapp } = require("../../index.js");
const logger = require("./misc/logger.js");

async function filter(content){   
    switch(content){
        case "airing":
        case "topanime":
        case "upcoming":
        case "movie":
        case "tv":
        case "ova":
        case "ona":
        case "special":
        case "bypopularity":
        case "favorite":
            return content;
        break;
        
        default: 
            return false;
    }
}

async function getMyAnimeListData(command){
    let url = `https://myanimelist.net/topanime.php?type=${command}`;
    return new Promise((resolve, reject) => {
        let data = [];
        request(url, (err, res, html) => {
            if (err || res.statusCode != 200) reject("Error");
            let $ = cheerio.load(html);
            let title = $("#content > div.pb12 > h2 ").find("span").remove().end().text();
            data.push(`<<< ${title} >>>\n`);
            $("#content > div.pb12 > table > tbody > tr:nth-child(n+2)").each(function () {
                let link = $(this).find("td.title.al.va-t.word-break > div > div.di-ib.clearfix a[href]").attr("href");
                let score = $(this).find("td.score.ac.fs14 > div > span").text();
                let position = $(this).find("td.rank.ac > span").text();
                let name = $(this).find("td.title.al.va-t.word-break > div > div.di-ib.clearfix")
                    .text()
                    .replace("Watch Episode Video", "")
                    .replace("Watch Promotional Video", "");
                data.push(`${position} ° - ${name} |${score}| [view more](${link})`);
                resolve(data);
            });
        });
    });
}

async function nh(id) {
	let uri = id ? baseUrl + `v/${+id}/` : baseUrl;
	let html = (await axios.get(uri)).data;
	return JSON.parse(html.split('<script id="__NEXT_DATA__" type="application/json">')[1].split('</script>')[0]).props.pageProps.data;
}

async function getID(id) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await nh(id);
			let pages = data.images.pages.map((v, i) => {
				let ext = new URL(v.t).pathname.split('.')[1];
				return `https://external-content.duckduckgo.com/iu/?u=https://i7.nhentai.net/galleries/${data.media_id}/${i + 1}.${ext}`;
			});
			let tags = data.tags.reduce((acc, tag) => {
				acc[tag.type] = acc[tag.type] || [];
				acc[tag.type].push(tag.name);
				return acc;
			}, {});
			resolve({
				id: data.id,
				title: data.title,
				thumb: `https://external-content.duckduckgo.com/iu/?u=https://t.nhentai.net/galleries/${data.media_id}/thumb.jpg`,
				pages,
				tag: tags.tag || [],
				artist: tags.artist || [],
				category: tags.category || [],
				language: tags.language || [],
				media_id: data.media_id,
				num_pages: pages.length,
				upload_date: data.upload_date
			});
		} catch (err) {
			resolve({ message: err.message });
		}
	});
}

async function loadAllFeatures(bot) {
  const allFeaturesDir = path.join(__dirname, './plugins');
  const { promises: fsPromises } = require('fs');
  const files = await fsPromises.readdir(allFeaturesDir);

  let availableCommands = [];

  for (const file of files) {
    if (file.endsWith('.js')) {
      const allFeaturePath = path.join(allFeaturesDir, file);
      try {
        const allFeature = require(allFeaturePath);
        allFeature(bot, availableCommands);        
      } catch (error) {        
      }
    }
  }

  return availableCommands;
}

async function mangaLatest() {
    try {
        const { data } = await axios.get('https://mangakakalot.com/');
        const $ = cheerio.load(data);
        const results = [];

        $('.itemupdate').each((i, item) => {
            const title = $(item).find('h3 a').text();
            const url = $(item).find('h3 a').attr('href');
            const image = $(item).find('a.cover img').attr('src');

            results.push({
                title,
                image,
                url
            });
        });

        return {
            status: true,
            creator: 'LorenzoWajes',
            results
        };
    } catch (error) {
        return {
            status: false,
            msg: error.message
        };
    }
}

function captureScreenshot(url) {
  return new Promise((resolve, reject) => {
    ssweb(url)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function ssweb(url, device = 'desktop') {
  return new Promise((resolve, reject) => {
    const base = 'https://www.screenshotmachine.com';
    const param = {
      url: url,
      device: device,
      cacheLimit: 0
    };

    axios({
      url: `${base}/capture.php`,
      method: 'POST',
      data: param,
      headers: {
        'content-type': 'application/json'
      }
    })
      .then((data) => {
        const cookies = data.headers['set-cookie'];

        if (data.data.status === 'success') {
          axios
            .get(`${base}/${data.data.link}`, {
              headers: {
                cookie: cookies.join('')
              },
              responseType: 'arraybuffer'
            })
            .then(({ data }) => {
              const result = {
                status: 200,
                author: 'Re7Pntx',
                result: data
              };
              resolve(result);
            });
        } else {
          reject({ status: 404, author: 'Re7Pntx', message: data.data });
        }
      })
      .catch(reject);
  });
}

async function animeNews() {
  try {
    const { data } = await axios.get('https://www.animenewsnetwork.com/news/');
    const tobrut = cheerio.load(data);
    const articles = tobrut('.mainfeed-section .herald.box.news.t-news');
    const newsList = [];

    articles.each((index, element) => {
      const title = tobrut(element).find('h3 a').text().trim();
      const link = 'https://www.animenewsnetwork.com' + tobrut(element).find('h3 a').attr('href');

      newsList.push({ title, link });
    });

    return newsList;

  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

async function fetchJson(url, options = {}) {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
}

async function danbooruDl(url) {
    let html = (await axios.get(url)).data
    let $ = cheerio.load(html), obj = {}
    $('#post-information > ul > li').each((idx, el) => {
        let str = $(el).text().trim().replace(/\n/g, '').split(': ')
        obj[str[0]] = str[1].replace('»', '').trim().split(' .')[0]
    })
    obj.url = $('#post-information > ul > li[id="post-info-size"] > a').attr('href')
    return obj
}

async function konachan(chara) {
    return new Promise((resolve, reject) => {
        let text = chara.replace(' ', '_')
        axios.get('https://konachan.net/post?tags=' + text + '+')
            .then(({ data }) => {
                const $$ = cheerio.load(data)
                const no = []

                $$('div.pagination > a').each(function (c, d) {
                    no.push($$(d).text())
                })

                let mat = Math.floor(Math.random() * no.length)
                axios.get('https://konachan.net/post?page=' + mat + '&tags=' + text + '+')
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        const result = []

                        $('#post-list > div.content > div:nth-child(4) > ul > li > a.directlink.largeimg').each(function (a, b) {
                            result.push($(b).attr('href'))
                        })

                        resolve(result)
                    })
            })
            .catch(reject)
    })
}

async function animeRandom() {
    try {
        let response = await axios.get('https://konachan.net/post?tags=order%3Arandom')
        let $ = cheerio.load(response.data)
        let hasil = {
            status: 200,
            creator: 'Lorenzo',
            imageUrl: []
        }
        $('#post-list-posts a.directlink.largeimg').each((index, element) => {
            hasil.imageUrl.push($(element).attr('href'))
        })
        return hasil
    } catch (error) {
        console.error('Error:', error)
        return { status: 500, error: error.message }
    }
}

async function YandereRandom() {
    try {
        let response = await axios.get('https://yande.re/post.json?api_version=2')
        let results = response.data.posts

        if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No images found')
        }

        let randomImage = results[Math.floor(Math.random() * results.length)]
        let imageUrl = randomImage.jpeg_url || randomImage.sample_url || randomImage.file_url

        if (!imageUrl) {
            throw new Error('Image URL not found')
        }

        return { status: 200, imageUrl }
    } catch (error) {
        console.error('Error:', error)
        return { status: 500, error: error.message }
    }
}

async function rule34Random() {
    try {
        let response = await axios.get('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1')
        let results = response.data

        if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No images found')
        }

        let randomImage = results[Math.floor(Math.random() * results.length)]
        let imageUrl = randomImage.file_url

        if (!imageUrl) {
            throw new Error('Image URL not found')
        }

        return { status: 200, imageUrl }
    } catch (error) {
        console.error('Error:', error)
        return { status: 500, error: error.message }
    }
}

async function getHentaiList() {
    const page = Math.floor(Math.random() * 1153)
    const response = await fetch(`https://sfmcompile.club/page/${page}`)
    const htmlText = await response.text()
    const $ = cheerio.load(htmlText)

    const list = []
    $("#primary > div > div > ul > li > article").each(function (a, b) {
        list.push({
            title: $(b).find("header > h2").text(),
            link: $(b).find("header > h2 > a").attr("href"),
            category: $(b).find("header > div.entry-before-title > span > span").text().replace("in ", ""),
            share_count: $(b).find("header > div.entry-after-title > p > span.entry-shares").text(),
            views_count: $(b).find("header > div.entry-after-title > p > span.entry-views").text(),
            type: $(b).find("source").attr("type") || "image/jpeg",
            video_1: $(b).find("source").attr("src") || $(b).find("img").attr("data-src"),
            video_2: $(b).find("video > a").attr("href") || ""
        })
    })

    return list
}

function hentaisearch(query) {
    return new Promise((resolve, reject) => {
        axios.get('https://sfmcompile.club/?s=' + query)
            .then((data) => {
                const $ = cheerio.load(data.data)
                const hasil = []
                $('#primary > div > div > ul > li > article').each(function (a, b) {
                    hasil.push({
                        title: $(b).find('header > h2').text(),
                        link: $(b).find('header > h2 > a').attr('href'),
                        category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                        share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                        views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                        type: $(b).find('source').attr('type') || 'image/jpeg',
                        video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                        video_2: $(b).find('video > a').attr('href') || ''
                    })
                })
                resolve(hasil)
            })
            .catch(err => reject(err))
    })
}

function getCaption(obj) {
    return `*Title:* ${obj.title}\n*Link:* ${obj.link}\n*Category:* ${obj.category}\n*Share Count:* ${obj.share_count}\n*Views Count:* ${obj.views_count}\n*Type:* ${obj.type}`
}

function convertt(timestamp) {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
}

class Pixiv {
    async search(q, r18) {
        try {
            const { data } = await axios.get(`https://api.lolicon.app/setu/v2?r18=${r18 ? 1 : 0}&num=15&excludeAi=true&size=regular&keyword=${q}`);
            const array = data.data.map(res => ({
                caption: res.title,
                author: res.author,
                tags: res.tags.slice(0, 4).join(', '),
                type: res.aiType === 2 ? 'AI Generated' : 'Illustrations',
                uploadDate: convertt(res.uploadDate),
                imageUrl: res.urls.regular
            }));
            return array;
        } catch (error) {
            console.error('Error fetching Pixiv data:', error);
            return [];
        }
    }
}

const pixiv = new Pixiv();

function initializeBot(name, token) {
  const bot = new Telegraf(token);

  loadAllFeatures(bot).then(availableCommands => {    
  
  bot.on("message", async (ctx, next) => {
    await logger(ctx);
    await next();
   });    
      
    bot.command('addbot', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 3) {
        return ctx.reply('How to use the feature\n\n1. Get the bot token from @botfather\n2. Type /addbot by filling in the username and token\n3. If you have registered, you can use the bot that you have registered\n\nexample: /addbot Lorenzo_bot [token]');
      }

      const name = args[1];
      const token = args[2];
      config.bots.push({ name, token });
      saveConfig();

      initializeBot(name, token);
      ctx.reply(`Bot ${name} has been added and is running.`);
    });

    bot.command('listbot', (ctx) => {
      if (config.bots.length === 0) {
        return ctx.reply('No bots registered.');
      }

      let response = 'Bot list:\n';
      config.bots.forEach((bot, index) => {
        response += `${index + 1}. @${bot.name}\n`;
      });

      ctx.reply(response);
    });

    bot.command('deletebot', (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        return ctx.reply('Please enter the name of the bot you want to delete. Example: /deletebot <name>');
      }

      const name = args[1];
      const botIndex = config.bots.findIndex(bot => bot.name === name);

      if (botIndex === -1) {
        return ctx.reply(`Bot named ${name} not found.`);
      }

      config.bots.splice(botIndex, 1);
      saveConfig();

      ctx.reply(`Bot ${name} has been removed.`);
    });
    
bot.command('start', (ctx) => {
    const helpMessage = `
Welcome to our bot! The following commands are available:

- /hentai - Get random hentai videos
- /hentaisearch <query> - Search for hentai videos
- /nhentai <code> - Download/Get nhentai files
- /rule34 - Get random hentai image
- /danbooru <link> - Download image from danbooru
- /cosplay - Get random cosplay image
- /picre - Get random image from pic.re
- /yandere - Get random image from yande.re
- /kcrandom - Get random image from konachan
- /kcsearch - Search a image from konachan
- /gtguide - Search GuardianTales character stats
- /bluearchive - Search BlueArchive character stats
- /genshinstalk - Stalking GenshinImpact account
- /animeupdate - Get latest anime update
- /animenews - Get latest anime news
- /animerank - Get top anime
- /comicsupdate - Get latest manga, manhwa, and manhua update
- /fantox - Get list anime image category from fantox
- /pixivr18 - Get random pixiv r18 image
- /sendtowa - Send a Message from telegram to any whatsapp number

Please use the command above to get started!
`;

    ctx.replyWithPhoto(
        { url: 'https://files.catbox.moe/yupd7z.jpg' },
        { caption: helpMessage, parse_mode: 'Markdown' }
    );
});

bot.command('hentai', async (ctx) => {
    const inputText = ctx.message.text.split(' ')[1]
    if (inputText) {
        await ctx.reply('Processing, Please Wait...')
        try {
            const list = await getHentaiList()
            const selectedIndex = parseInt(inputText) - 1
            if (selectedIndex < 0 || selectedIndex >= list.length) {
                await ctx.reply('Invalid video number!')
                return
            }
            const selectedVideo = list[selectedIndex]
            const caption = getCaption(selectedVideo)
            const replyMarkup = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'More Hentai', url: 'https://example.com' }]
                    ]
                }
            }

            await ctx.replyWithVideo(selectedVideo.video_1 || selectedVideo.video_2, {
                caption: caption,
                reply_markup: replyMarkup,
                parse_mode: 'Markdown'
            })
        } catch (error) {
            console.error('Error:', error)
            await ctx.reply('An error occurred while processing your request.')
        }
    } else {
        const list = await getHentaiList()
        const teks = list
            .slice(0, 9)
            .map((obj, index) => `*${index + 1}.* ${obj.title}`)
            .join("\n")
        await ctx.reply(`*[ HENTAI LIST ]*\n${teks}\n\n*Input Number from 1 to 9 to get video*`, { parse_mode: 'Markdown' })
    }
})

bot.command('hentaisearch', async (ctx) => {
    const query = ctx.message.text.split(' ')[1]
    if (!query) {
        return ctx.reply('Please provide a search term. Example: /hentaiSearch <query>')
    }
    
    await ctx.reply('Processing your search, please wait...')
    try {
        const results = await hentaisearch(query)
        if (results.length === 0) {
            await ctx.reply('No results found for your search.')
            return
        }
        
        searchResults[ctx.from.id] = results

        const teks = results
            .slice(0, 9)
            .map((obj, index) => `*${index + 1}.* ${obj.title}`)
            .join("\n")

        await ctx.reply(`*[ HENTAI SEARCH RESULTS ]*\n${teks}\n\n*Input Number from 1 to 9 to get video*`, { parse_mode: 'Markdown' })
    } catch (error) {
        console.error('Error:', error)
        await ctx.reply('An error occurred while processing your search request.')
    }
})

bot.command('pixivr18', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!text) {
        return ctx.reply('Where is the query? Please enter a keyword after /pixivr18.');
    }

    await ctx.reply('Searching for NSFW Pixiv images, please wait...');

    try {
        let results = await pixiv.search(text, true);
        if (results.length === 0) {
            return ctx.reply('No results found.');
        }

        const hasil = results[Math.floor(Math.random() * results.length)];
        let caption = `*[ Pixiv R-18 Search ‼️ ]*\n${hasil.caption}\n*By*: ${hasil.author}\n*Type*: ${hasil.type}`;

        await ctx.replyWithPhoto(
            { url: hasil.imageUrl },
            { caption: caption, parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error:', error);
        ctx.reply('An error occurred while fetching Pixiv images.');
    }
});

bot.command('danbooru', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1)
    if (args.length === 0) {
        return ctx.reply('Please provide a URL. Example: /danbooru <image_url>')
    }
    
    const imageUrl = args[0]

    try {
        const data = await danbooruDl(imageUrl)
        const img = data.url
        delete data.url
        const caption = Object.keys(data).map((x) => `${x}: ${data[x]}`).join('\n')
         
        await ctx.reply('Processing, Please Wait...')

        await ctx.replyWithPhoto(img, {
            caption: caption,
            parse_mode: 'Markdown'
        })
    } catch (error) {
        console.error('Error:', error)
        await ctx.reply('An error occurred while processing your request.')
    }
})

bot.command('rule34', async (ctx) => {
    await ctx.reply('Processing, Please Wait...')
    const result = await rule34Random()

    if (result.status === 200) {
        await ctx.replyWithPhoto(result.imageUrl, {
            caption: 'Here is your random Rule34 image!',
            parse_mode: 'Markdown'
        })
    } else {
        await ctx.reply('An error occurred: ' + result.error)
    }
})

bot.command('picre', async (ctx) => {
    await ctx.reply('Processing, Please Wait...')
    let ini_url = `https://pic.re/image`
    let res = await fetch(ini_url)

    if (!res.ok) {
        return ctx.reply('Error: ' + await res.text())
    }

    const photoUrl = ini_url
    await ctx.replyWithPhoto({ url: photoUrl }, { caption: 'Here is your random Picre image!' })
})

bot.command('cosplay', async (ctx) => {
    await ctx.reply('Processing, Please Wait...')
    await ctx.replyWithPhoto({ url: `https://fantox-cosplay-api.onrender.com/` }, { caption: 'Here is your random Cosplay image!' })
})

bot.command('yandere', async (ctx) => {
        await ctx.reply('Processing, Please Wait...')
    const result = await YandereRandom()
    if (result.status === 200) {
        await ctx.replyWithPhoto({ url: result.imageUrl })
    } else {
        await ctx.reply('Error: ' + result.error)
    }
})

bot.command('kcrandom', async (ctx) => {
await ctx.reply('Processing, Please Wait...')
    const response = await animeRandom()
    if (response.status === 200 && response.imageUrl.length > 0) {
        let randomImage = response.imageUrl[Math.floor(Math.random() * response.imageUrl.length)]
        await ctx.replyWithPhoto({ url: randomImage })
    } else {
        await ctx.reply('Error: ' + response.error)
    }
})

bot.command('kcsearch', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join('_')
    if (!query) {
        return ctx.reply('Please provide a character name to search. Example: /kcsearch <query>')
    }
    
    try {
        const results = await konachan(query)
        if (results.length > 0) {
            let randomImage = results[Math.floor(Math.random() * results.length)]
            await ctx.replyWithPhoto({ url: randomImage })
        } else {
            await ctx.reply('No images found for the given character.')
        }
    } catch (error) {
        await ctx.reply('Error: ' + error.message)
    }
})

bot.command('gtguide', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Please provide a character name to search. Example: /gtguide <query>');

    async function avz(query) {
        try {
            const { data } = await axios.get(`https://guardiantalesguides.com/game/guardians/show/${query.toLowerCase()}`);
            const $ = cheerio.load(data);

            let result = '';

            const characterName = $('.stats div:contains("Name:")').text().replace('Name:', '').trim();
            const characterSchool = $('.stats div:contains("School:") em').text().trim();
            const characterGroupBuff = $('.stats div:contains("Group Buff:")').text().replace('Group Buff:', '').trim();
            const characterIntroduced = $('.stats div:contains("Introduced:")').text().replace('Introduced:', '').trim();

            const characterImage = $('.portrait.unique img').attr('src');
            const characterImageUrl = `https://guardiantalesguides.com${characterImage}`;

            result += `*Info Character:*\n`;
            result += `- Name: ${characterName}\n`;
            result += `- School: ${characterSchool}\n`;
            result += `- Group Buff: ${characterGroupBuff}\n`;
            result += `- Introduced: ${characterIntroduced}\n\n`;

            result += `*Skill*\n`;

            const normalAtkTitle = $('div.info:contains("Normal Atk") .heading').text().trim();
            const normalAtkDesc = $('div.info:contains("Normal Atk") .text h5').text().trim() + ' ' +
                                  $('div.info:contains("Normal Atk") .text').text().replace($('div.info:contains("Normal Atk") .text h5').text(), '').trim();
            result += `${normalAtkTitle}\n> ${normalAtkDesc}\n\n`;

            const chainSkillTitle = $('div.info:contains("Chain Skill") .heading').text().trim();
            const chainSkillDesc = $('div.info:contains("Chain Skill") .text h5').text().trim() + ' ' +
                                   $('div.info:contains("Chain Skill") .text').text().replace($('div.info:contains("Chain Skill") .text h5').text(), '').trim();
            result += `${chainSkillTitle} - ${$('div.info:contains("Chain Skill") .heading em').text().trim()}\n> ${chainSkillDesc}\n\n`;

            const specialAbilityTitle = $('div.info:contains("Special Ability") .heading').text().trim();
            const specialAbilityDesc = $('div.info:contains("Special Ability") .text h5').text().trim() + ' ' +
                                      $('div.info:contains("Special Ability") .text').text().replace($('div.info:contains("Special Ability") .text h5').text(), '').trim();
            result += `${specialAbilityTitle}\n> ${specialAbilityDesc}\n\n`;

            const exWeaponTitle = $('div.info:contains("Ex Weapon") .heading').text().trim();
            const exWeaponDesc = $('div.info:contains("Ex Weapon") .text h5').text().trim() + ' ' +
                                 $('div.info:contains("Ex Weapon") .text').text().replace($('div.info:contains("Ex Weapon") .text h5').text(), '').trim();
            result += `${exWeaponTitle}\n> ${exWeaponDesc}\n\n`;

            result += `*Latest Meta Rankings:*\n`;

            $('.metaGuardianRankings > div').each((i, el) => {
                const rankTitle = $(el).find('h2').text().trim();
                const rankNumber = $(el).find('.ranks').text().trim();
                const percentageTop = $(el).find('strong').first().text().trim();
                const additionalInfo = $(el).find('div').eq(1).text().trim();

                result += `${rankTitle} - Rank #${rankNumber}\n> ${percentageTop}% of Top 100\n${additionalInfo ? '> ' + additionalInfo : ''}\n\n`;
            });

            // Mengirim foto tanpa caption
            await ctx.replyWithPhoto({ url: characterImageUrl });
            // Mengirim deskripsi karakter sebagai pesan teks
            await ctx.reply(result);
        } catch (error) {
            console.error(error);
            ctx.reply('Terjadi Rusak.');
        }
    }

    avz(`${encodeURIComponent(query)}`);
});

bot.command('bluearchive', async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");
  
  let chara = (
    await fetchJson("https://api.ennead.cc/buruaka/character")
  ).map((a) => a.name);

  if (!query) {
    return ctx.reply(`Example: bluearchive [character name]\n\nList Characters in database :\n${chara.map((a) => "• " + a).join("\n")}`);
  }

  const capital = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  
  if (!chara.includes(capital(query))) {
    return ctx.reply(`Example: /bluearchive [character name]\n\nList Characters in database :\n${chara.map((a) => "• " + a).join("\n")}`);
  }

  let a = await fetchJson(`https://api.ennead.cc/buruaka/character/${capital(query)}`);
  
  if (a.StatusCode) {
    return ctx.reply("[ CHARACTER NOT FOUND ]");
  } else {
    let cap = `[ BLUE ARCHIVE INFORMATION ]
• Name : ${a.character.name}
• Age : ${a.info.age}
• Height : ${a.info.height}
• School : ${a.info.school}
• Year : ${a.info.schoolYear}
• Club : ${a.info.club}
• Birth Date : ${a.info.birthDate}

• Base Star : ${a.character.baseStar}
• Rank : ${a.character.rarity}
• Role : ${a.character.role}
• Type :
 Squad : ${a.character.squadType}
 Weapon : ${a.character.weaponType}
 Bullet : ${a.character.bulletType}
 Armor : ${a.character.armorType}`;

    await ctx.replyWithPhoto({ url: a.image.portrait }, { caption: cap });
  }
});

bot.command("genshinstalk", async (ctx) => {
  const userUID = ctx.message.text.split(" ")[1];
  
  if (!userUID) {
    return ctx.reply(`Please provide a UID by running the command with a valid UID first.\nExample: /genhsinstalk 830980536`);
  }
  
  try {    
    const response = await axios(`https://enka.network/api/uid/${userUID}`);
    
    if (response.status === 200) {
      const { playerInfo } = response.data;
      const nickname = playerInfo.nickname || 'Unknown';
      const arLevel = playerInfo.level || 'Unknown';
      const signature = playerInfo.signature || 'Unknown';
      const worldLevel = playerInfo.worldLevel || 'Unknown';
      const achievement = playerInfo.finishAchievementNum || 'Unknown';
      const spiralFloorIndex = playerInfo.towerFloorIndex || 'Unknown';
      const spiralLevelIndex = playerInfo.towerLevelIndex || 'Unknown';

      const imgEnka = `https://image.thum.io/get/width/1900/crop/1000/fullpage/https://enka.network/u/${userUID}`;
      const profileMessage = `
╭───【 Traveler Info 】───
│
│ Traveler Name  : ${nickname} (AR ${arLevel}) | WL ${worldLevel}
│ Signature      : ${signature}
│ Achievement    : ${achievement}
│
╰───┬─────────────────────┬───
╭───【 End Game Challenge 】───
│
│ Spiral Abyss    : Floor ${spiralFloorIndex} - Level ${spiralLevelIndex}
│ Imaginarium     : Status Unknown
│
╰───┴─────────────────────┴───`;

      await ctx.replyWithPhoto({ url: imgEnka }, { caption: profileMessage });
      
    } else {
      switch (response.status) {
        case 400:
          ctx.reply('Invalid UID format. Please enter a valid UID.');
          break;
        case 404:
          ctx.reply('Player not found. Please check the UID or player name again.');
          break;
        case 424:
          ctx.reply('Server is under maintenance or experiencing issues after a game update. Please try again later.');
          break;
        case 429:
          ctx.reply('You have reached the request limit. Please wait a moment before making another request.');
          break;
        case 500:
          ctx.reply('Server error occurred. Please try again later.');
          break;
        case 503:
          ctx.reply('Major error with the application. We will fix it as soon as possible.');
          break;
        default:
          ctx.reply('Error loading data. Please try again later.');
          break;
      }
    }
    
  } catch (error) {
    ctx.reply('Error loading data. Please try again later.');
  }
});

bot.command('nhentai', async (ctx) => {
	const code = ctx.message.text.split(' ')[1];
	if (!code) return ctx.reply('Please provide a search term. Example: /nhentai <query>')
	try {
		const result = await getID(code)
		const images = await Promise.all(
			result.pages.map(async (url) => {
				const response = await axios.get(url, { responseType: 'arraybuffer' })
				return Buffer.from(response.data).toString('base64');
			})
		);
		const htmlContent = `
			<!DOCTYPE html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${result.title.english}</title>
				<style>
					img { display: block; margin: auto; width: 100%; }
					body { background-color: #1a202c; color: #ffffff; text-align: center; }
					@media (min-width: 576px) { img { width: auto; max-width: 100%; height: auto; } }
				</style>
			</head>
			<body>
				<h1>${result.title.english}</h1>
				${images.map((img) => `<img src="data:image/jpeg;base64,${img}">`).join('')}
			</body>`;
		const filePath = `./${result.title.english.replace(/\s/g, '_')}.html`;
		fs.writeFileSync(filePath, htmlContent)
		await ctx.replyWithDocument({ source: filePath, filename: `${result.title.english}.html` })
		fs.unlinkSync(filePath)
	} catch (err) {
		ctx.reply(`Error: ${err.message}`)
	}
});

bot.command('animeupdate', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;

  ctx.reply("Fetching the latest anime updates, please wait...", { reply_to_message_id: messageId });

  try {
    const response = await globalThis.fetch('https://api.jikan.moe/v4/seasons/now?filter=tv');
    const data = await response.json();
    const arr = [];

    for (let a of data.data) {
      arr.push([
        `• Title : ${a.title}
• Genre : [ ${a.genres.map((g) => g.name).join(", ")} ]
• Type : ${a.type}
• Season : ${a.season} [ ${a.year} ]
• Source : ${a.source}
• Total episode : ${a.episodes}
• Status : ${a.status}
• Duration : ${a.duration}
• Studio : [ ${a.studios.map((s) => s.name).join(", ")} ]
• Rating : ${a.rating}
• Score : ${a.score}/10.0
• Popularity : ${a.popularity}`,
        null,
        a.images.jpg.large_image_url,
        [["Watch Trailer!", a.trailer.url]]
      ]);
    }

    const media = arr.map((a) => ({
      type: "photo",
      media: a[2],
      caption: a[0],
      parse_mode: "Markdown",
    }));

    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < media.length; i += chunkSize) {
      chunks.push(media.slice(i, i + chunkSize));
    }

    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        ctx.telegram.sendMediaGroup(chatId, chunk, {
          reply_to_message_id: messageId,
        });
      }, index * 1000);
    });
    
  } catch (error) {
    console.error('Error:', error);
    ctx.reply('An error occurred while processing your request.', { reply_to_message_id: messageId });
  }
});

bot.command('animenews', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;

  ctx.reply("Fetching the latest anime news, please wait...", { reply_to_message_id: messageId });

  try {
    const newsList = await animeNews();

    if (newsList.length === 0) {
      ctx.reply("No news available at the moment.", { reply_to_message_id: messageId });
      return;
    }

    let message = "*Latest Anime News:*\n\n";
    newsList.slice(0, 10).forEach((news, index) => {
      message += `*${index + 1}. ${news.title}*\n[Read more](${news.link})\n\n`;
    });

    ctx.replyWithMarkdown(message, { disable_web_page_preview: true, reply_to_message_id: messageId });

  } catch (error) {
    console.error('Error sending news:', error);
    ctx.reply("An error occurred while fetching the news.", { reply_to_message_id: messageId });
  }
});

bot.command('fantox', async (ctx) => {
    const categories = [
    "genshin", "swimsuit", "schoolswimsuit", "white", "barefoot", "tornclothes",
    "touhou", "gamecg", "uncensored", "glasses", "weapon", "shirtlift", "chain",
    "fingering", "flatchest", "bondage", "demon", "pantypull", "headdress",
    "headphones", "anusview", "shorts", "stockings", "topless", "beach",
    "bunnygirl", "bunnyears", "vampire", "nobra", "bikini", "whitehair",
    "blonde", "pinkhair", "bed", "ponytail", "nude", "dress", "underwear",
    "foxgirl", "skirt", "breasts", "twintails", "spreadpussy", "seethrough",
    "breasthold", "fateseries", "openshirt", "headband", "nipples",
    "erectnipples", "greenhair", "wolfgirl", "catgirl"
    ];

    const buttons = categories.map((category) => ({
        text: category,
        callback_data: `fantox_${category}`
    }))

    const buttonLayout = []
    for (let i = 0; i < buttons.length; i += 3) {
        buttonLayout.push(buttons.slice(i, i + 3))
    }

    ctx.reply("Select The Category Belows:", {
        reply_markup: {
            inline_keyboard: buttonLayout
        }
    })
})

bot.action(/fantox_(.+)/, async (ctx) => {
    const command = ctx.match[1]

    try {
        let res = await fetch(`https://fantox-apis.vercel.app/${command}`)
        if (!res.ok) throw await res.text()
        
        let json = await res.json()
        if (!json.url) throw 'Error'
        
        await ctx.replyWithPhoto({ url: json.url }, { caption: `Here you go!` })
    } catch (error) {
        ctx.reply(`Terjadi kesalahan: ${error}`)
    }
});

bot.command('comicsupdate', async (ctx) => {
  const chatId = ctx.chat.id
  const messageId = ctx.message.message_id

  ctx.reply("Fetching the latest manga updates, please wait...", { reply_to_message_id: messageId })

  try {
    const response = await axios.get('https://mangakakalove.com/')
    const $ = cheerio.load(response.data)
    const arr = []

    $('.itemupdate').slice(0, 10).each((i, item) => {
      const title = $(item).find('h3 a').text()
      const url = $(item).find('h3 a').attr('href')
      const image = $(item).find('a.cover img').attr('src')
      const chapterTitle = $(item).find('ul li span a').first().text()
      const chapterUrl = $(item).find('ul li span a').first().attr('href')

      arr.push({
        title: `• Title: ${title}\n• Chapter: ${chapterTitle}\n[Read More](${chapterUrl})`,
        image: image
      })
    })

    const media = arr.map((manga) => ({
      type: "photo",
      media: manga.image,
      caption: manga.title,
      parse_mode: "Markdown",
    }))

    ctx.telegram.sendMediaGroup(chatId, media, {
      reply_to_message_id: messageId,
    })

  } catch (error) {
    console.error('Error:', error)
    ctx.reply('An error occurred while processing your request.', { reply_to_message_id: messageId })
  }
})

bot.command('animerank', async (ctx) => {
    const id = ctx.chat.id;
    const message = ctx.message.text;
    
    let args = message.split(/[ ,]+/).slice(1);
    let position = Number.isInteger(parseInt(args[1])) ? parseInt(args[1]) : 10;
    
    let content = await filter(args[0]);
    if (!content) {
        return ctx.reply(
            "Incorrect argument\n\nType:\n/animerank (filters) (amount)\n\nList filters:\nairing\nupcoming\ntopanime\nmovie\ntv\nova\nona\nspecial\nbypopularity\nfavorite"
        );
    }

    let result = await cache(content);
    let formattedResult = result.slice(0, position + 1).join("\n");
    
    return ctx.reply(formattedResult, { parse_mode: 'Markdown', disable_web_page_preview: true });
});

bot.command('sendtowa', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = String(ctx.from.id);
    const args = ctx.message.text.split(' ').slice(1).join(' ');

    if (!args) {
        return ctx.reply('Format salah! Gunakan: /sendtowa nomor|pesan');
    }

    const [number, message] = args.split('|');
    if (!number || !message) {
        return ctx.reply('Format salah! Gunakan: /sendtowa nomor|pesan');
    }

    const targetJid = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    try {
        await telegramToWhatsapp(targetJid, message);
        ctx.reply('Successfully sent message from Telegram to WhatsApp');
    } catch (error) {
        ctx.reply(`Error: ${error.message}`);
    }
});

bot.on('text', async (ctx) => {
    const inputText = ctx.message.text
    const selectedIndex = parseInt(inputText) - 1

    if (searchResults[ctx.from.id] && !isNaN(selectedIndex)) {
        const results = searchResults[ctx.from.id]
        if (selectedIndex >= 0 && selectedIndex < results.length) {
            const selectedVideo = results[selectedIndex]
            const caption = getCaption(selectedVideo)

            await ctx.replyWithVideo(selectedVideo.video_1 || selectedVideo.video_2, {
                caption: caption,
                parse_mode: 'Markdown'
            })
        } else {
            await ctx.reply('Invalid video number from the search results!')
        }
    }
})

bot.launch()
      .catch(error => {        
      });
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

config.bots.forEach(bot => initializeBot(bot.name, bot.token));
