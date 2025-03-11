async function Upscale(imageBuffer) {
    try {
        const response = await fetch("https://lexica.qewertyy.dev/upscale", {
            body: JSON.stringify({
                image_data: Buffer.from(imageBuffer, "base64"),
                format: "binary",
            }),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
        return Buffer.from(await response.arrayBuffer());
    } catch {
        return null;
    }
}

module.exports = Upscale;