const axios = require('axios');
const cheerio = require('cheerio');

async function searchAnime(search) {
    const url = 'https://otakudesu.cloud/?s=' + encodeURIComponent(search) + '&post_type=anime';
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const results = [];

        $('ul.chivsrc li').each((index, element) => {
            const title = $(element).find('h2 a').text();
            const link = $(element).find('h2 a').attr('href');
            const image = $(element).find('img').attr('src');
            const genres = [];

            $(element).find('.set a').each((i, el) => {
                genres.push($(el).text());
            });

            const status = $(element).find('.set:contains("Status")').text().replace('Status : ', '').trim();
            const rating = $(element).find('.set:contains("Rating")').text().replace('Rating : ', '').trim();

            results.push({
                title,
                link,
                image,
                genres,
                status,
                rating
            });
        });

        return results;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function opsidownloadanime(link) {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const downanime = [];

        $('.episodelist ul li span a').each((index, element) => {
            downanime.push($(element).attr('href'));
        });

        return downanime;
    } catch (error) {
        console.error('Error fetching episode links:', error);
        return [];
    }
}

async function getAnimeDetails(link) {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const hasil = [];

        const thumbnail = $('img.attachment-post-thumbnail').attr('src');
        const judul = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Judul')).parent().text().trim().split(': ')[1];
        const skor = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Skor')).parent().text().trim().split(': ')[1];
        const produser = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Produser')).parent().text().trim().split(': ')[1];
        const tipe = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Tipe')).parent().text().trim().split(': ')[1];
        const status = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Status')).parent().text().trim().split(': ')[1];
        const studio = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Studio')).parent().text().trim().split(': ')[1];
        const rilis = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Tanggal Rilis')).parent().text().trim().split(': ')[1];
        const episode = $('div.infozingle span b').filter((index, element) => $(element).text().includes('Total Episode')).parent().text().trim().split(': ')[1];

        let sinopsis = '';
        $('.sinopc p').each((index, element) => {
            sinopsis += $(element).text().trim() + '\n';
        });

        const genreArray = [];
        $('div.infozingle span b').filter((index, element) => $(element).text().includes('Genre')).siblings('a').each((index, element) => {
            genreArray.push($(element).text().trim());
        });
        const genre = genreArray.join(', ');
        const downanime = await opsidownloadanime(link);

        hasil.push({
            judul,
            skor,
            produser,
            tipe,
            status,
            studio,
            rilis,
            episode,
            genre,
            thumbnail,
            downanime,
            sinopsis: sinopsis.trim()
        });

        return hasil;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function otakupdate() {
    const url = 'https://otakudesu.cloud/ongoing-anime/';
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const updates = [];

        $('ul > li .detpost').each((index, element) => {
            const episode = $(element).find('.epz').text().trim();
            const day = $(element).find('.epztipe').text().trim();
            const date = $(element).find('.newnime').text().trim();
            const link = $(element).find('.thumb a').attr('href');
            const title = $(element).find('.thumbz h2.jdlflm').text().trim();

            updates.push({
                title,
                episode,
                day,
                date,
                link
            });
        });

        return updates;
    } catch (error) {
        console.error("Error fetching updates:", error);
        return [];
    }
}

async function getEpisodeLinks(link) {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        let links = [];

        $('li').each((_, element) => {
            const resolution = $(element).find('strong').text().trim();
            const size = $(element).find('i').text().trim();
            const links = $(element).find('a');

            links.each((_, link) => {
                const server = $(link).text().trim();
                const url = $(link).attr('href');
                if (resolution && url) {
                    links.push({
                        resolution,
                        server,
                        url,
                        size: size || "N/A"
                    });
                }
            });
        });

        return links;
    } catch (error) {
        console.error('Error fetching episode links:', error);
        return [];
    }
}

module.exports = {
    searchAnime,
    opsidownloadanime,
    getAnimeDetails,
    otakupdate,
    getEpisodeLinks
};