const PhoneNum = require("awesome-phonenumber");

class Command {
  constructor() {
    this.command = "regionmember";
    this.alias = ["askot", "totalmember"];
    this.category = ["group"];
    this.settings = {
      group: true,
    };
    this.description =
      "📊 Menampilkan informasi asal negara semua member di grup";
    this.loading = true;
  }

  run = async (m, { sock, Func, Scraper, config, store }) => {
    let regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    let data = m.metadata;
    let participants = data.participants;

    let countryMembers = {};
    for (let participant of participants) {
      let phoneNumber = "+" + participant.id.split("@")[0];
      let regionCode = PhoneNum(phoneNumber).getRegionCode("internasional");
      let country = regionNames.of(regionCode);
      if (!countryMembers[country]) {
        countryMembers[country] = [];
      }
      countryMembers[country].push(participant.id);
    }

    let countryCounts = Object.keys(countryMembers).map((country) => ({
      name: country,
      total: countryMembers[country].length,
      jid: countryMembers[country],
    }));
    let totalSum = countryCounts.reduce(
      (acc, country) => acc + country.total,
      0,
    );
    let totalRegion = Object.keys(countryMembers).length;
    let hasil = countryCounts.map(({ name, total, jid }) => ({
      name,
      total,
      jid,
      percentage: ((total / totalSum) * 100).toFixed(2) + "%",
    }));

    let cap = `*📍 Informasi Member Berdasarkan Wilayah*\n\n`;
    cap += `> *📌 Nama Grup:* ${m.metadata.subject}\n`;
    cap += `> *👥 Total Member:* ${m.metadata.participants.length}\n`;
    cap += `> *🌎 Jumlah Wilayah Terdata:* ${totalRegion}\n\n`;
    cap += `*🌐 Statistik Wilayah Member*\n`;
    cap += hasil
      .sort((b, a) => a.total - b.total)
      .map(
        (a, i) =>
          `🔹 *${i + 1}. Wilayah:* ${a.name || "Tidak Diketahui"}\n   ➡️ *Total:* ${a.total} anggota\n   ➡️ *Persentase:* ${a.percentage}`,
      )
      .join("\n\n");

    cap += `\n📊 _Gunakan informasi ini untuk memahami lebih baik asal negara anggota grup._`;

    m.reply(cap);
  };
}

module.exports = new Command();
