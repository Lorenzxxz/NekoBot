const fetch = require("node-fetch");

class Gemini {
  constructor({ system = "", cookie, session = {} }) {
    if (!cookie) throw new Error("Masukan Kuki Gemininya~ :3");
    if (typeof cookie !== "string" || !cookie.includes("__Secure-3PSID")) {
      throw new Error("Kukinya yang bener atuh >:3");
    }

    this.system = system;
    this.cookie = cookie;
    this.session = {
      c: session.c || "",
      r: session.r || "",
      ch: session.ch || "",
    };
  }

  async ask({ user, system = "" }) {
    try {
      const fullPrompt = `[System]: ${this.system} ${system}\n[User]: ${user}`;
      const init = await fetch("https://gemini.google.com/", {
        headers: {
          Cookie: this.cookie,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
      });

      const text = await init.text();
      const [snlM0e, bl] = [
        text.match(/"SNlM0e":"(.*?)"/)[1],
        text.match(/"cfb2h":"(.*?)"/)[1],
      ];

      const res = await fetch(
        `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${new URLSearchParams(
          {
            bl: bl,
            _reqid: Math.floor(Math.random() * 1000000).toString(),
            rt: "c",
          },
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Cookie: this.cookie,
          },
          body: new URLSearchParams({
            "f.req": JSON.stringify([
              null,
              JSON.stringify([
                [fullPrompt, 0, null, [], null, null, 0],
                ["id"],
                [
                  this.session.c,
                  this.session.r,
                  this.session.ch,
                  null,
                  null,
                  [],
                ],
                null,
                null,
                null,
                [1],
                0,
                [],
                [],
                1,
                0,
              ]),
            ]),
            at: snlM0e,
          }),
        },
      );

      const data = await res.text();
      const result = JSON.parse(JSON.parse(data.split("\n")[3])[0][2]);

      this.session = {
        c: result[1]?.[0] || this.session.c,
        r: result[1]?.[1] || this.session.r,
        ch: result[4]?.[0]?.[0] || this.session.ch,
      };

      const content = result[4]?.[0]?.[1]?.[0] || "";

      const sources = [
        ...new Set(
          (content.match(/https?:\/\/[^\s)]+/g) || []).map((url) =>
            url.split(/[)\]\s]/)[0].replace(/\\/g, ""),
          ),
        ),
      ];

      return {
        success: true,
        response: content.replace(/\*\*/g, "*"),
        sources: sources.filter((url) => url.length > 0),
        session: this.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        session: this.session,
      };
    }
  }
}

module.exports = Gemini;
