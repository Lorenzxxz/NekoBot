async function translate(query = "", lang) {
    if (!query.trim()) return "";
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.append("client", "gtx");
    url.searchParams.append("sl", "auto");
    url.searchParams.append("dt", "t");
    url.searchParams.append("tl", lang);
    url.searchParams.append("q", query);

    try {
        const response = await fetch(url.href);
        const data = await response.json();
        if (data) {
            return [data[0]].map(([
                [a]
            ]) => a).join(" ");
        } else {
            return "";
        }
    } catch (err) {
        throw err;
    }
}

module.exports = translate;