const path = require("node:path");
const fs = require("node:fs");
const { promisify } = require("node:util");
const chokidar = require("chokidar");
const chalk = require("chalk");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class PluginLoader {
  constructor(directory) {
    this.directory = directory;
    this.plugins = {};
  }

  async scandir(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(
      subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? this.scandir(res) : res;
      })
    );
    return files.flat();
  }

  async load() {
    const files = await this.scandir(this.directory);
    for (const filename of files) {
      const ext = path.extname(filename);
      const relativePath = path.relative(process.cwd(), filename);

      try {
        if (ext === ".mjs") {
          this.plugins[relativePath] = (await import(`file://${filename}`)).default;
        } else if (ext === ".js") {
          this.plugins[relativePath] = require(filename);
        }
      } catch (e) {
        console.log(chalk.redBright(`❌ Gagal memuat [ ${relativePath} ]: `) + e);
        delete this.plugins[relativePath];
      }
    }
  }

  async watch() {
    const watcher = chokidar.watch(path.resolve(this.directory), {
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on("add", async (filename) => {
        const ext = path.extname(filename);
        const relativePath = path.relative(process.cwd(), filename);

        if (ext !== ".js" && ext !== ".mjs") return;

        if (require.cache[filename]) {
          delete require.cache[filename];
        }

        try {
          if (ext === ".mjs") {
            this.plugins[relativePath] = (await import(`file://${filename}`)).default;
          } else {
            this.plugins[relativePath] = require(filename);
          }
          console.log(chalk.cyanBright(`📥 Plugin baru terdeteksi: ${filename}`));
          await this.load();
        } catch (e) {
          console.log(chalk.redBright(`❌ Gagal memuat [ ${relativePath} ]: `) + e);
        }
      })
      .on("change", async (filename) => {
        const ext = path.extname(filename);
        if (ext !== ".js" && ext !== ".mjs") return;

        const relativePath = path.relative(process.cwd(), filename);

        if (require.cache[filename]) {
          delete require.cache[filename];
        }

        try {
          if (ext === ".mjs") {
            this.plugins[relativePath] = (await import(`file://${filename}`)).default;
          } else {
            this.plugins[relativePath] = require(filename);
          }
          console.log(chalk.yellowBright(`✏️ File diubah: ${filename}`));
          await this.load();
        } catch (e) {
          console.log(chalk.redBright(`❌ Gagal memperbarui [ ${relativePath} ]: `) + e);
        }
      })
      .on("unlink", (filename) => {
        const relativePath = path.relative(process.cwd(), filename);
        console.log(chalk.redBright(`🗑️ File dihapus: ${filename}`));
        delete this.plugins[relativePath];
      });
  }
}

module.exports = PluginLoader;