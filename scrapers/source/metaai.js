const axios = require("axios");
const fs = require("node:fs");
const path = require("node:path");

const imgBase = (filePath) => {
    const filex = fs.readFileSync(filePath);
    const based = filex.toString("base64");
    const mimeType = `image/${path.extname(filePath).slice(1)}`;
    return `data:${mimeType};base64,${based}`;
};

const headers = {
    authority: "labs.writingmate.ai",
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://labs.writingmate.ai",
    referer: "https://labs.writingmate.ai/share/JyVg?__show_banner=false",
    "user-agent": "Postify/1.0.0",
};

const mateai = async (array) => {
    const data = {
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "image_prompt",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string"
                        }
                    },
                    required: ["prompt"],
                    additionalProperties: false,
                },
            },
        },
        chatSettings: {
            model: "gpt-4o",
            temperature: 0.7,
            contextLength: 16385,
            includeProfileContext: false,
            includeWorkspaceInstructions: false,
            embeddingsProvider: "openai",
        },
        messages: array,
        customModelId: "",
    };
    try {
        const response = await axios
            .post("https://labs.writingmate.ai/api/chat/public", data, {
                headers
            })
            .catch((e) => e.response);
        return response.data;
    } catch (error) {
        throw new Error(`${error.message}`);
    }
};

module.exports = mateai;