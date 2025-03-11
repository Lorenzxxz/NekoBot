const {
    js
} = require("js-beautify");
const fs = require('fs');

class CaseManager {
    constructor(file) {
        this.file = file;
    }

    get = (name) => {
        try {
            let content = fs.readFileSync(this.file, 'utf8');
            let regex = /case .*?:/g;
            let cases = content.match(regex);
            let targetCases = cases.filter(cas => cas.includes(name));
            if (targetCases.length > 0) {
                let start = content.indexOf(targetCases[0]);
                let end = content.indexOf('break', start);
                return content.substring(start, end + 6);
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Gagal membaca file: ${error.message}`);
        }
    }

    add = (code) => {
        try {
            let content = fs.readFileSync(this.file, 'utf8');
            let regex = /switch\s*\([^)]+\)\s*{/;
            let switchContent = content.match(regex);
            let newCase = `${code}`;
            let updatedContent = content.replace(regex, `${switchContent}\n${newCase}`);
            fs.writeFileSync(this.file, js(updatedContent));
            return true
        } catch (error) {
            console.error(`Gagal menambahkan case: ${error.message}`);
            return false;
        }
    }

    delete = (name) => {
        try {
            let content = fs.readFileSync(this.file, 'utf8');
            let caseToDelete = this.get(name);
            if (!caseToDelete) return false;
            let updatedContent = content.replace(caseToDelete, '');
            fs.writeFileSync(this.file, updatedContent);
            return true;
        } catch (error) {
            console.error(`Gagal menghapus case: ${error.message}`);
            return false;
        }
    }

    list = () => {
        try {
           let data = fs.readFileSync(this.file, "utf8");
           let casePattern = /case\s+"([^"]+)"/g;
           let matches = data.match(casePattern).map((match) => match.replace(/case\s+"([^"]+)"/, "$1"));

          return matches
        } catch (error) {
            console.error(`Gagal membaca file: ${error.message}`);
            return [];
        }
    }
}

module.exports = CaseManager