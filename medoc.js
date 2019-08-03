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
      this.search().then(episodes => {
        if (episodes.length > 0) {
          let promises = episodes.map(async episode => {
            return await this.move(episode)
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

  async move(episode) {
    return new Promise((resolve, reject) => {
      const sourcePath = episode.origin.path
      const destinationPath = episode.destination.path
      const destinationDirectory = this.getDestinationDirectory(episode)

      if (episode.origin.isDirectory) {
        const sourceDirectory = this.getOriginDirectory(episode)

        if (this.hasFile(sourceDirectory)) {
          if (!fs.existsSync(destinationDirectory)) {
            this.createDirectory(destinationDirectory)
          }

          let reader = fs.createReadStream(sourcePath)

          reader.on("open", () => {
            console.log(`Coping from '${episode.origin.path}' to '${destinationPath}'...`)

            let writer = fs.createWriteStream(destinationPath)
            reader.pipe(writer)
          })

          reader.on("close", () => {
            this.removepath(sourceDirectory)
              .then(() => {
                resolve(`${episode.origin.file} copied to ${destinationPath}`)
              })
              .catch(err => {
                reject(err)
              })
          })
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

      if (episode.origin.isFile) {
        if (!fs.existsSync(destinationDirectory)) {
          this.createDirectory(destinationDirectory)
        }

        let reader = fs.createReadStream(sourcePath)

        reader.on("open", () => {
          console.log(`Coping from '${episode.origin.path}' to '${destinationPath}'...`)

          let writer = fs.createWriteStream(destinationPath)
          reader.pipe(writer)
        })

        reader.on("close", () => {
          this.removepath(episode.origin.file)
            .then(() => {
              resolve(`${episode.origin.file} copied to ${destinationPath}`)
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

  // Create directory and subdirectories if necessary
  createDirectory(url) {
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
    return `${episode.origin.root}\\${episode.origin.directory}`
  }

  getOriginPath(episode) {
    return `${episode.origin.root}\\${episode.origin.directory}\\${episode.origin.file}`
  }

  getDestinationDirectory(episode) {
    return `${episode.destination.root}\\${episode.destination.directory}`
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
              let isDirectory = fs.lstatSync(filePath).isDirectory()
              let isFile = fs.lstatSync(filePath).isFile()
              let showName = this.getShowName(filename)
              let season = Number(this.getEpisodeSeason(filename))
              let number = Number(this.getEpisodeNumber(filename))
              let format = isDirectory ? path.extname(this.getFile(filePath)) : path.extname(filename)

              list.push({
                origin: {
                  directory: fs.lstatSync(filePath).isDirectory() ? filename : null,
                  file: this.getFile(filePath),
                  format: format,
                  isDirectory: isDirectory,
                  isFile: isFile,
                  path: fs.lstatSync(filePath).isDirectory()
                    ? path.normalize(`${filePath}\\${this.getFile(filePath)}`)
                    : filePath,
                  root: this.from
                },
                episode: {
                  show: showName,
                  season: season,
                  number: number
                },
                destination: {
                  directory: path.normalize(`${showName}\\Season ${season}`),
                  filename: `${showName} - ${season}x${number < 10 ? "0" + number : number}${format}`,
                  path: path.normalize(
                    `${this.to}\\${showName}\\Season ${season}\\${showName} - ${season}x${
                      number < 10 ? "0" + number : number
                    }${format}`
                  ),
                  root: this.to
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
