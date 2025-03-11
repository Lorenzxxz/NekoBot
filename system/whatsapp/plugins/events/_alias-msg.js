const {
    generateWAMessage,
    areJidsSameUser,
    proto
} = require("baileys");

async function events(m, {
    sock
}) {
    sock.sendAliasMessage = async (jid, mess = {}, alias = {}, quoted = null) => {
        function check(arr) {
            if (!Array.isArray(arr)) {
                return false;
            }
            if (!arr.length) {
                return false;
            }
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                if (typeof item !== "object" || item === null) {
                    return false;
                }
                if (!Object.prototype.hasOwnProperty.call(item, "alias")) {
                    return false;
                }
                if (!Array.isArray(item.alias) && typeof item.alias !== "string") {
                    return false;
                }
                if (
                    Object.prototype.hasOwnProperty.call(item, "response") &&
                    typeof item.response !== "string"
                ) {
                    return false;
                }
                if (
                    Object.prototype.hasOwnProperty.call(item, "eval") &&
                    typeof item.eval !== "string"
                ) {
                    return false;
                }
            }
            return true;
        }
        if (!check(alias)) return "Alias format is not valid!";
        let message = await sock.sendMessage(jid, mess, {
            quoted: quoted
        });
        if (typeof sock.alias[jid] === "undefined")
            sock.alias[jid] = {};
        sock.alias[jid][message.key.id] = {
            chat: jid,
            id: message.key.id,
            alias,
        };
        return message;
    };
    sock.sendInputMessage = async (
        jid,
        mess = {},
        target = "all",
        timeout = 60000,
        quoted = null,
    ) => {
        let time = Date.now();
        let message = await sock.sendMessage(jid, mess, {
            quoted: quoted
        });
        if (typeof sock.input[jid] === "undefined")
            sock.input[jid] = {};
        sock.input[jid][message.key.id] = {
            chat: jid,
            id: message.key.id,
            target,
        };

        while (
            Date.now() - time < timeout &&
            !sock.input[jid][message.key.id].hasOwnProperty("input")
        )
            await sock.delay(500);

        return sock.input[jid][message.key.id].input;
    };

    if (typeof sock.alias === "undefined")
        sock.alias = {};
    if (typeof sock.input === "undefined")
        sock.input = {};

    if (m.quoted) {
        const quotedId = m.quoted.id;
        if (
            sock.input[m.cht]?.[quotedId]?.target === "all" ||
            sock.input[m.cht]?.[quotedId]?.target === m.sender
        ) {
            sock.input[m.cht][quotedId].input = m.body;
        }
        if (sock.alias.hasOwnProperty(m.cht)) {
            if (sock.alias[m.cht].hasOwnProperty(quotedId)) {
                for (const aliasObj of sock.alias[m.cht][quotedId].alias) {
                    if (
                        Array.isArray(aliasObj.alias) &&
                        !aliasObj.alias
                        .map((v) => v.toLowerCase())
                        .includes(m.body.toLowerCase())
                    )
                        continue;
                    else if (aliasObj.alias.toLowerCase() !== m.body.toLowerCase())
                        continue;
                    else {
                        if (aliasObj.response)
                            await m.emit(aliasObj.response);
                        if (aliasObj.eval) await eval(aliasObj.eval);
                    }
                }
            }
        }
    }
};

module.exports = {
    events
};