/*
 * Medoc
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const fs = require("fs")
const Path = require("path")
const mkdirp = require("mkdirp")
const rimraf = require("rimraf")

module.exports = class {
  constructor(from, to) {
    this.from = from
    this.to = to
  }

  run() {
    return new Promise((resolve, reject) => {
      let promises = []
      this.search(this.from).then(episodes => {
        if (episodes.length > 0) {
          episodes.map(episode => {
            promises.push(
              new Promise((res, rej) => {
                let sourceDirectory = this.getOriginDirectory(episode)

                if (episode.isDirectory) {
                  if (this.hasFile(sourceDirectory)) {
                    let source = this.getOriginPath(episode)

                    let destinationDirectory = this.getDestinationDirectory(
                      this.to,
                      episode
                    )

                    if (this.directoryExist(destinationDirectory)) {
                      let destination = this.getDestinationPath(
                        this.to,
                        episode
                      )

                      console.log(`Coping ${episode.file}...`)

                      let reader = fs.createReadStream(source)

                      reader.on("open", () => {
                        let writer = fs.createWriteStream(destination)
                        reader.pipe(writer)
                      })

                      reader.on("close", () => {
                        this.removePath(sourceDirectory).then(() => {
                          resolve(`${episode.file} copied to ${destination}`)
                        })
                      })
                    }
                  } else {
                    this.removePath(sourceDirectory).then(() => {
                      resolve(
                        `${sourceDirectory} directory has no video file !`
                      )
                    })
                  }
                }

                if (episode.isFile) {
                  let destination = this.getDestinationPath(this.to, episode)
                  let reader = fs.createReadStream(episode.file)

                  reader.on("open", () => {
                    let writer = fs.createWriteStream(destination)
                    reader.pipe(writer)
                  })

                  reader.on("close", () => {
                    this.removePath(episode.file).then(() => {
                      resolve(`${episode.file} copied to ${destination}`)
                    })
                  })
                }
              })
            )
          })
        } else {
          reject("No episode found !")
        }
      })
    })
  }

  removePath(path) {
    return new Promise((resolve, reject) => {
      rimraf(path, () => {
        resolve(`${path} removed !`)
      })
    })
  }

  directoryExist(path) {
    if (!fs.existsSync(path)) {
      mkdirp.sync(path)
      return true
    }
    return true
  }

  isEpisode(filename) {
    if (/([sS]\d{2}[eE]\d{2})/g.exec(filename)) {
      return true
    }
    return false
  }

  hasFile(path) {
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

  getYear(filename) {
    let rst = /(\d{4})/.exec(filename)
    if (rst) {
      return rst[0]
    }
    return null
  }

  getName(filename) {
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

  getSeason(filename) {
    let rst = /[sS](\d{2})[eE]\d{2}/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  getEpisode(filename) {
    let rst = /[sS]\d{2}[eE](\d{2})/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  getFile(path) {
    if (fs.lstatSync(path).isDirectory()) {
      let files = fs.readdirSync(path)
      let filteredFiles = files.filter(file => {
        let format = Path.extname(file).substr(1)
        if (format === "mp4" || format === "mkv") {
          return true
        }
      })
      return filteredFiles[0]
    } else {
      return path
    }
  }

  getOriginDirectory(episode) {
    return `${episode.root}\\${episode.directory}`
  }

  getOriginPath(episode) {
    return `${episode.root}\\${episode.directory}\\${episode.file}`
  }

  getDestinationDirectory(root, episode) {
    return `${root}\\${episode.name}\\Season ${episode.season}`
  }

  getDestinationPath(root, episode) {
    return `${root}\\${episode.name}\\Season ${episode.season}\\${
      episode.name
    } - ${episode.season}x${episode.episode}${Path.extname(episode.file)}`
  }

  search(path) {
    return new Promise((resolve, reject) => {
      var list = []
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err)
        }

        files.map(filename => {
          if (this.isEpisode(filename)) {
            list.push({
              isDirectory: fs.lstatSync(`${path}\\${filename}`).isDirectory(),
              isFile: fs.lstatSync(`${path}\\${filename}`).isFile(),
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
