async function events(m, { sock }) {
  if (m.type === "interactiveResponseMessage" && m.quoted.fromMe) {
    sock.appendTextMessage(
      m,
      JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id,
      m,
    );
  }
  if (m.type === "templateButtonReplyMessage" && m.quoted.fromMe) {
    sock.appendTextMessage(m, m.msg.selectedId, m);
  }
}

module.exports = {
  events,
};
