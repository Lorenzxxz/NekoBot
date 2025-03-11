const { pkg, WABinary } = require("baileys");

const smsg = (m, sock, store) => {
  if (!m) return m;
  let M = pkg.proto.WebMessageInfo;
  m = M.fromObject(m);
  m.sock = sock;
  let protocolMessageKey;
  if (m.message) {
    if (m.mtype == "protocolMessage" && m.msg.key) {
      protocolMessageKey = m.msg.key;
      if (protocolMessageKey == "status@broadcast")
        protocolMessageKey.remoteJid = m.chat;
      if (
        !protocolMessageKey.participant ||
        protocolMessageKey.participant == "status_me"
      )
        protocolMessageKey.participant = m.sender;
      protocolMessageKey.fromMe =
        sock.decodeJid(protocolMessageKey.participant) ===
        sock.decodeJid(sock.user.id);
      if (
        !protocolMessageKey.fromMe &&
        protocolMessageKey.remoteJid === sock.decodeJid(sock.user.id)
      )
        protocolMessageKey.remoteJid = m.sender;
    }
    if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download;
  }
  if (!m.mediaMessage) delete m.download;

  try {
    if (protocolMessageKey && m.mtype == "protocolMessage")
      sock.ev.emit("message.delete", protocolMessageKey);
  } catch (e) {
    console.error(e);
  }
  return m;
};

const serialize = (m, sock, store) => {
  const MediaType = [
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "stickerMessage",
    "documentMessage",
  ];
  return Object.defineProperties(m, {
    id: {
      get() {
        return this.key?.id;
      },
    },
    isBaileys: {
      get() {
        return (
          this.id?.length === 16 ||
          (this.id?.startsWith("BAE5") && this.id?.length === 16) ||
          this.id?.length === 22 ||
          (this.id?.startsWith("3EB0") && this.id?.length === 22) ||
          false
        );
      },
    },
    chat: {
      get() {
        const senderKeyDistributionMessage =
          this.message?.senderKeyDistributionMessage?.groupId;
        return sock.decodeJid(
          this.key?.remoteJid ||
            (senderKeyDistributionMessage &&
              senderKeyDistributionMessage !== "status@broadcast") ||
            "",
        );
      },
    },
    isGroup: {
      get() {
        return this.chat.endsWith("@g.us");
      },
      enumerable: true,
    },
    sender: {
      get() {
        return this.sock?.decodeJid(
          (this.key?.fromMe && this.sock?.user.id) ||
            this.participant ||
            this.key.participant ||
            this.chat ||
            "",
        );
      },
      enumerable: true,
    },
    fromMe: {
      get() {
        return (
          this.key?.fromMe ||
          pkg.areJidsSameUser(this.sock?.user.id, this.sender) ||
          false
        );
      },
    },
    mtype: {
      get() {
        if (!this.message) return "";
        const type = Object.keys(this.message);
        return (
          (!["senderKeyDistributionMessage", "messageContextInfo"].includes(
            type[0],
          ) &&
            type[0]) || // Sometimes message in the front
          (type.length >= 3 && type[1] !== "messageContextInfo" && type[1]) || // Sometimes message in midle if mtype length is greater than or equal to 3
          type[type.length - 1]
        ); // common case
      },
      enumerable: true,
    },
    msg: {
      get() {
        if (!this.message) return null;
        return this.message[this.mtype];
      },
    },
    mediaMessage: {
      get() {
        if (!this.message) return null;
        const Message =
          (this.msg?.url || this.msg?.directPath
            ? { ...this.message }
            : pkg.extractMessageContent(this.message)) || null;
        if (!Message) return null;
        const mtype = Object.keys(Message)[0];
        return MediaType.includes(mtype) ? Message : null;
      },
      enumerable: true,
    },

    mediaType: {
      get() {
        let message;
        if (!(message = this.mediaMessage)) return null;
        return Object.keys(message)[0];
      },
      enumerable: true,
    },
    quoted: {
      get() {
        /**
         * @type {ReturnType<typeof makeWASocket>}
         */
        const self = this;
        const msg = self.msg;
        const contextInfo = msg?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        if (!msg || !contextInfo || !quoted) return null;
        const type = Object.keys(quoted)[0];
        let q = quoted[type];
        const text = typeof q === "string" ? q : q.text;
        return Object.defineProperties(
          JSON.parse(JSON.stringify(typeof q === "string" ? { text: q } : q)),
          {
            mtype: {
              get() {
                return type;
              },
              enumerable: true,
            },
            mediaMessage: {
              get() {
                const Message =
                  (q.url || q.directPath
                    ? { ...quoted }
                    : pkg.extractMessageContent(quoted)) || null;
                if (!Message) return null;
                const mtype = Object.keys(Message)[0];
                return MediaType.includes(mtype) ? Message : null;
              },
              enumerable: true,
            },
            mediaType: {
              get() {
                let message;
                if (!(message = this.mediaMessage)) return null;
                return Object.keys(message)[0];
              },
              enumerable: true,
            },
            id: {
              get() {
                return contextInfo.stanzaId;
              },
              enumerable: true,
            },
            chat: {
              get() {
                return contextInfo.remoteJid || self.chat;
              },
              enumerable: true,
            },
            isBaileys: {
              get() {
                return (
                  this.id?.length === 16 ||
                  (this.id?.startsWith("BAE5") && this.id.length === 16) ||
                  this.id?.length === 22 ||
                  (this.id?.startsWith("3EB0") && this.id.length === 22) ||
                  false
                );
              },
              enumerable: true,
            },
            sender: {
              get() {
                return (contextInfo.participant || this.chat || "").decodeJid();
              },
              enumerable: true,
            },
            fromMe: {
              get() {
                return pkg.areJidsSameUser(this.sender, self.sock?.user.jid);
              },
              enumerable: true,
            },
            text: {
              get() {
                return (
                  text ||
                  this.caption ||
                  this.contentText ||
                  this.selectedDisplayText ||
                  ""
                );
              },
              enumerable: true,
            },
            mentionedJid: {
              get() {
                return (
                  q.contextInfo?.mentionedJid ||
                  self.getQuotedObj()?.mentionedJid ||
                  []
                );
              },
              enumerable: true,
            },
            name: {
              get() {
                const sender = this.sender;
                return sender ? self.sock?.getName(sender) : null;
              },
              enumerable: true,
            },
            vM: {
              get() {
                return pkg.proto.WebMessageInfo.fromObject({
                  key: {
                    fromMe: this.fromMe,
                    remoteJid: this.chat,
                    id: this.id,
                  },
                  message: quoted,
                  ...(self.isGroup ? { participant: this.sender } : {}),
                });
              },
            },
            fakeObj: {
              get() {
                return this.vM;
              },
            },
            download: {
              value(saveToFile = false) {
                const mtype = this.mediaType;
                return self.sock?.downloadM(
                  this.mediaMessage[mtype] ||
                    this.message.viewOnceMessageV2.message[mtype] ||
                    this.header[mtype],
                  mtype.replace(/message/i, ""),
                  saveToFile,
                );
              },
              enumerable: true,
              configurable: true,
            },
            reply: {
              /**
               * Reply to quoted message
               * @param {String|Object} text
               * @param {String|false} chatId
               * @param {Object} options
               */
              value(text, chatId, options = {}, smlcap = { smlcap: false }) {
                return self.sock?.reply(
                  chatId ? chatId : this.chat,
                  text,
                  this.vM,
                  options,
                  smlcap,
                );
              },
              enumerable: true,
            },
            copy: {
              /**
               * Copy quoted message
               */
              value() {
                const M = pkg.proto.WebMessageInfo;
                return smsg(sock, M.fromObject(M.toObject(this.vM)));
              },
              enumerable: true,
            },
            forward: {
              /**
               * Forward quoted message
               * @param {String} jid
               *  @param {Boolean} forceForward
               */
              value(jid, force = false, options) {
                return self.sock?.sendMessage(
                  jid,
                  {
                    forward: this.vM,
                    force,
                    ...options,
                  },
                  { ...options },
                );
              },
              enumerable: true,
            },
            copyNForward: {
              /**
               * Exact Forward quoted message
               * @param {String} jid
               * @param {Boolean|Number} forceForward
               * @param {Object} options
               */
              value(jid, forceForward = false, options) {
                return self.sock?.copyNForward(
                  jid,
                  this.vM,
                  forceForward,
                  options,
                );
              },
              enumerable: true,
            },
            cMod: {
              /**
               * Modify quoted Message
               * @param {String} jid
               * @param {String} text
               * @param {String} sender
               * @param {Object} options
               */
              value(jid, text = "", sender = this.sender, options = {}) {
                return self.sock?.cMod(jid, this.vM, text, sender, options);
              },
              enumerable: true,
            },
            delete: {
              /**
               * Delete quoted message
               */
              value() {
                return self.sock?.sendMessage(this.chat, {
                  delete: this.vM.key,
                });
              },
              enumerable: true,
            },
          },
        );
      },
      enumerable: true,
    },
    _text: {
      value: null,
      writable: true,
    },
    text: {
      get() {
        const msg = this.msg;
        const text =
          (typeof msg === "string" ? msg : msg?.text) ||
          msg?.caption ||
          msg?.contentText ||
          msg?.selectedId ||
          msg?.nativeFlowResponseMessage ||
          msg?.message?.imageMessage?.caption ||
          msg?.message?.videoMessage?.caption ||
          "";
        return typeof this._text === "string"
          ? this._text
          : "" ||
              (typeof text === "string"
                ? text
                : text?.selectedDisplayText ||
                  text?.hydratedTemplate?.hydratedContentText ||
                  JSON.parse(text?.paramsJson)?.id ||
                  text) ||
              "";
      },
      set(str) {
        return (this._text = str);
      },
      enumerable: true,
    },
    mentionedJid: {
      get() {
        return (
          (this.msg?.contextInfo?.mentionedJid?.length &&
            this.msg.contextInfo.mentionedJid) ||
          []
        );
      },
      enumerable: true,
    },
    name: {
      get() {
        return (
          (!nullish(this.pushName) && this.pushName) ||
          this.sock?.getName(this.sender)
        );
      },
      enumerable: true,
    },
    download: {
      value(saveToFile = false) {
        const mtype = this.mediaType;
        return this.sock?.downloadM(
          this.mediaMessage[mtype] ||
            this.message.viewOnceMessageV2.message[mtype] ||
            this.header[mtype],
          mtype.replace(/message/i, ""),
          saveToFile,
        );
      },
      enumerable: true,
      configurable: true,
    },
    reply: {
      value(text, chatId, options = {}, smlcap = { smlcap: false }) {
        return this.sock?.reply(
          chatId ? chatId : this.chat,
          text,
          this,
          options,
          smlcap,
        );
      },
    },
    copy: {
      value() {
        const M = pkg.proto.WebMessageInfo;
        return smsg(this.sock, M.fromObject(M.toObject(this)));
      },
      enumerable: true,
    },
    forward: {
      value(jid, force = false, options = {}) {
        return this.sock?.sendMessage(
          jid,
          {
            forward: this,
            force,
            ...options,
          },
          { ...options },
        );
      },
      enumerable: true,
    },
    copyNForward: {
      value(jid, forceForward = false, options = {}) {
        return this.sock?.copyNForward(jid, this, forceForward, options);
      },
      enumerable: true,
    },
    cMod: {
      value(jid, text = "", sender = this.sender, options = {}) {
        return this.sock?.cMod(jid, this, text, sender, options);
      },
      enumerable: true,
    },
    getQuotedObj: {
      value() {
        if (!this.quoted.id) return null;
        const q = proto.WebMessageInfo.fromObject(
          this.sock?.loadMessage(this.quoted.id) || this.quoted.vM,
        );
        return smsg(this.sock, q);
      },
      enumerable: true,
    },
    getQuotedMessage: {
      get() {
        return this.getQuotedObj;
      },
    },
    delete: {
      value() {
        return this.sock?.sendMessage(this.chat, { delete: this.key });
      },
      enumerable: true,
    },
  });
  String.prototype.decodeJid = function decodeJid() {
    if (/:\d+@/gi.test(this)) {
      const decode = jidDecode(this) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        this
      ).trim();
    } else return this.trim();
  };
};

module.exports = { smsg, serialize };
