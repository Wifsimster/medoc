/*
 * Medoc
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const fs = require("fs")
const path = require("path")
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
              const destinationpath = this.getDestinationDirectory(this.to, episode)
              if (!fs.existsSync(destinationpath)) {
                this.addDirectory(destinationpath)
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
              this.removepath(sourceDirectory)
                .then(() => {
                  resolve(`${episode.file} copied to ${destination}`)
                })
                .catch(err => {
                  reject(err)
                })
            })
          }
        } else {
          this.removepath(sourceDirectory)
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
          const destinationpath = this.getDestinationDirectory(this.to, episode)
          if (!fs.existsSync(destinationpath)) {
            this.addDirectory(destinationpath)
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
          this.removepath(episode.file)
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

  addDirectory(url) {
    return new Promise((resolve, reject) => {
      fs.mkdir(url, { recursive: true }, err => {
        if (err) {
          reject(err)
        }
        resolve(url)
      })
    })
  }

  removepath(url) {
    return new Promise((resolve, reject) => {
      rimraf(url, () => {
        resolve(`${url} removed !`)
      })
    })
  }

  directoryExist(url) {
    if (!fs.existsSync(url)) {
      mkdirp.sync(url)
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

  hasFile(url) {
    let files = fs.readdirSync(url)
    let filteredFiles = files.filter(file => {
      let format = path.extname(file).substr(1)
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

  getShowName(filename) {
    let rst = /([sS]\d{2}[eE]\d{2})/g.exec(filename)

    if (rst) {
      let tmp = filename.substr(0, rst.index)
      tmp = tmp.replace(/\./g, " ").trim()

      // Extract year from name
      let year = this.getYear(filename)
      if (year) {
        tmp = tmp.replace(year, "")
        tmp += `(${year})`
      }

      // Extract sub team from name
      let subname = /([[\s\S]*])[\s\S]*/g.exec(tmp)
      if (subname) {
        tmp = tmp.substr(subname[1].length, tmp.length)
      }

      tmp = tmp.trim()

      return tmp
    }
    return null
  }

  getEpisodeSeason(filename) {
    let rst = /[sS](\d{2})[eE]\d{2}/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  getEpisodeNumber(filename) {
    let rst = /[sS]\d{2}[eE](\d{2})/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  getFile(url) {
    if (fs.lstatSync(url).isDirectory()) {
      let files = fs.readdirSync(url)
      let filteredFiles = files.filter(file => {
        let format = path.extname(file).substr(1)
        if (format === "mp4" || format === "mkv" || format === "avi") {
          return true
        }
      })
      return filteredFiles[0]
    } else {
      return url
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
    }${path.extname(episode.file)}`
  }

  search() {
    return new Promise((resolve, reject) => {
      var list = []
      fs.readdir(this.from, (err, files) => {
        if (err) {
          reject(err)
        }
        if (files && files.length > 0) {
          files.map(filename => {
            if (this.isEpisode(filename)) {
              let filePath = `${this.from}\\${filename}`
              let showName = this.getShowName(filename)
              let season = Number(this.getEpisodeSeason(filename))
              let number = Number(this.getEpisodeNumber(filename))
              let format = path.extname(this.getFile(filePath))

              list.push({
                origin: {
                  directory: filename,
                  file: this.getFile(filePath),
                  format: format,
                  isDirectory: fs.lstatSync(filePath).isDirectory(),
                  isFile: fs.lstatSync(filePath).isFile(),
                  path: path.resolve(`${filePath}\\${this.getFile(filePath)}`),
                  root: this.from
                },
                episode: {
                  show: showName,
                  season: season,
                  number: number
                },
                destination: {
                  directory: path.resolve(`${this.to}\\${showName}\\Season ${season}`),
                  filename: `${showName} - ${season}x${number}${format}`,
                  path: path.resolve(
                    `${this.to}\\${showName}\\Season ${season}\\${showName} - ${season}x${number}${format}`
                  )
                }
              })
            }
          })
        }
        resolve(list)
      })
    })
  }
}
