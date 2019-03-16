const fs = require("fs");
const Path = require("path");

module.exports = class {
  constructor() {}

  static isEpisode(filename) {
    if (/([sS]\d{2}[eE]\d{2})/g.exec(filename)) {
      return true;
    }
    return false;
  }

  static getYear(filename) {
    let rst = /(\d{4})/.exec(filename);
    if (rst) {
      return rst[0];
    }
    return null;
  }

  static getName(filename) {
    let rst = /([sS]\d{2}[eE]\d{2})/g.exec(filename);

    if (rst) {
      let tmp = filename.substr(0, rst.index);
      tmp = tmp.replace(/\./g, " ").trim();

      let year = this.getYear(filename);
      if (year) {
        tmp = tmp.replace(year, "");
        tmp += `(${year})`;
      }
      return tmp;
    }
    return null;
  }

  static getSeason(filename) {
    let rst = /[sS](\d{2})[eE]\d{2}/g.exec(filename);

    if (rst) {
      return rst[1];
    }
  }

  static getEpisode(filename) {
    let rst = /[sS]\d{2}[eE](\d{2})/g.exec(filename);

    if (rst) {
      return rst[1];
    }
  }

  static getFile(path) {
    let files = fs.readdirSync(path);
    let filteredFiles = files.filter(file => {
      let format = Path.extname(file).substr(1);
      if (format === "mp4" || format === "mkv") {
        return true;
      }
    });
    return filteredFiles[0];
  }

  static search(path) {
    return new Promise((resolve, reject) => {
      var list = [];
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        }

        files.map(filename => {
          if (this.isEpisode(filename)) {
            list.push({
              directory: filename,
              name: this.getName(filename),
              season: this.getSeason(filename),
              episode: this.getEpisode(filename),
              file: this.getFile(`${path}\\${filename}`)
            });
          }
        });
        resolve(list);
      });
    });
  }
};
