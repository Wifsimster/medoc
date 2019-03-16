const fs = require("fs")
const Path = require("path")
const mkdirp = require("mkdirp")
const rimraf = require("rimraf")

module.exports = class {
  constructor() {}

  static removeDirectory(path) {
    rimraf(path, () => {
      console.log(`${path} directory removed !`)
    })
  }

  static directoryExist(path) {
    if (!fs.existsSync(path)) {
      mkdirp.sync(path)
      return true
    }
    return true
  }

  static isEpisode(filename) {
    if (/([sS]\d{2}[eE]\d{2})/g.exec(filename)) {
      return true
    }
    return false
  }

  static hasFile(path) {
    let files = fs.readdirSync(path)
    let filteredFiles = files.filter(file => {
      let format = Path.extname(file).substr(1)
      if (format === "mp4" || format === "mkv") {
        return true
      }
    })
    if (filteredFiles[0]) {
      return true
    }
    return false
  }

  static getYear(filename) {
    let rst = /(\d{4})/.exec(filename)
    if (rst) {
      return rst[0]
    }
    return null
  }

  static getName(filename) {
    let rst = /([sS]\d{2}[eE]\d{2})/g.exec(filename)

    if (rst) {
      let tmp = filename.substr(0, rst.index)
      tmp = tmp.replace(/\./g, " ").trim()

      let year = this.getYear(filename)
      if (year) {
        tmp = tmp.replace(year, "")
        tmp += `(${year})`
      }
      return tmp
    }
    return null
  }

  static getSeason(filename) {
    let rst = /[sS](\d{2})[eE]\d{2}/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  static getEpisode(filename) {
    let rst = /[sS]\d{2}[eE](\d{2})/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  static getFile(path) {
    let files = fs.readdirSync(path)
    let filteredFiles = files.filter(file => {
      let format = Path.extname(file).substr(1)
      if (format === "mp4" || format === "mkv") {
        return true
      }
    })
    return filteredFiles[0]
  }

  static getOriginDirectory(episode) {
    return `${episode.root}\\${episode.directory}`
  }

  static getOriginPath(episode) {
    return `${episode.root}\\${episode.directory}\\${episode.file}`
  }

  static getDestinationDirectory(root, episode) {
    return `${root}\\${episode.name}\\Season ${episode.season}`
  }

  static getDestinationPath(root, episode) {
    return `${root}\\${episode.name}\\Season ${episode.season}\\${
      episode.name
    } - ${episode.season}x${episode.episode}${Path.extname(episode.file)}`
  }

  static search(path) {
    return new Promise((resolve, reject) => {
      var list = []
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err)
        }

        files.map(filename => {
          if (this.isEpisode(filename)) {
            list.push({
              root: path,
              directory: filename,
              name: this.getName(filename),
              season: Number(this.getSeason(filename)),
              episode: this.getEpisode(filename),
              file: this.getFile(`${path}\\${filename}`)
            })
          }
        })
        resolve(list)
      })
    })
  }
}
