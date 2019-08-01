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
      this.search(this.from).then(episodes => {
        if (episodes.length > 0) {
          let promises = episodes.map(episode => {
            return this.move(episode)
          })

          Promise.all(promises)
            .then(results => {
              resolve(results)
            })
            .catch(err => {
              reject(err)
            })
        } else {
          reject("No episode found !")
        }
      })
    })
  }

  move(episode) {
    return new Promise((resolve, reject) => {
      let sourceDirectory = this.getOriginDirectory(episode)

      if (episode.isDirectory) {
        if (this.hasFile(sourceDirectory)) {
          let source = this.getOriginPath(episode)

          let destinationDirectory = this.getDestinationDirectory(this.to, episode)

          if (this.directoryExist(destinationDirectory)) {
            let destination = this.getDestinationPath(this.to, episode)

            console.log(`Coping ${episode.file}...`)

            let reader = fs.createReadStream(source)

            reader.on("open", () => {
              const destinationPath = this.getDestinationDirectory(this.to, episode)
              if (!fs.existsSync(destinationPath)) {
                this.addDirectory(destinationPath)
                  .then(() => {
                    let writer = fs.createWriteStream(destination)
                    reader.pipe(writer)
                  })
                  .catch(err => {
                    reject(err)
                  })
              } else {
                let writer = fs.createWriteStream(destination)
                reader.pipe(writer)
              }
            })

            reader.on("close", () => {
              this.removePath(sourceDirectory)
                .then(() => {
                  resolve(`${episode.file} copied to ${destination}`)
                })
                .catch(err => {
                  reject(err)
                })
            })
          }
        } else {
          this.removePath(sourceDirectory)
            .then(() => {
              resolve(`${sourceDirectory} directory has no video file !`)
            })
            .catch(err => {
              reject(err)
            })
        }
      }

      if (episode.isFile) {
        let destination = this.getDestinationPath(this.to, episode)
        let reader = fs.createReadStream(episode.file)

        reader.on("open", () => {
          const destinationPath = this.getDestinationDirectory(this.to, episode)
          if (!fs.existsSync(destinationPath)) {
            this.addDirectory(destinationPath)
              .then(() => {
                let writer = fs.createWriteStream(destination)
                reader.pipe(writer)
              })
              .catch(err => {
                reject(err)
              })
          } else {
            let writer = fs.createWriteStream(destination)
            reader.pipe(writer)
          }
        })

        reader.on("close", () => {
          this.removePath(episode.file)
            .then(() => {
              resolve(`${episode.file} copied to ${destination}`)
            })
            .catch(err => {
              reject(err)
            })
        })
      }
    })
  }

  addDirectory(path) {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true }, err => {
        if (err) {
          reject(err)
        }
        resolve(path)
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
      if (format === "mp4" || format === "mkv" || format === "avi") {
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
    if (rst && rst[0] !== "1080") {
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
        if (format === "mp4" || format === "mkv" || format === "avi") {
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
    return `${root}\\${episode.name}\\Season ${episode.season}\\${episode.name} - ${episode.season}x${
      episode.episode
    }${Path.extname(episode.file)}`
  }

  search(path) {
    return new Promise((resolve, reject) => {
      var list = []
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err)
        }
        if (files && files.length > 0) {
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
        }
        resolve(list)
      })
    })
  }
}
