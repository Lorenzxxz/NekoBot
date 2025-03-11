const {
    fetch
} = require("undici");

async function aio(url) {
    try {
        const response = await fetch("https://anydownloader.com/wp-json/aio-dl/video-data/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://anydownloader.com/",
                "Token": "5b64d1dc13a4b859f02bcf9e572b66ea8e419f4b296488b7f32407f386571a0d"
            },
            body: new URLSearchParams({
                url
            }),
        }, );
        const data = await response.json();
        if (!data.url) return data
        return data;
    } catch (error) {
        console.error("Error fetching data:", );
        throw error
    }
}

module.exports = aio