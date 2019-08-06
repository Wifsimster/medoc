/*
 * Medoc
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

const VIDEO_FORMATS = ['.avi', '.mkv', '.mp4', '.webm', '.flv', '.vob', '.ogg', '.amv']

module.exports = class Medoc {
  constructor(from, to) {
    this.from = from
    this.to = to
  }

  async run() {
    const episodes = await Medoc.search(this.from, this.to)

    return await Promise.all(
      episodes.map(async episode => {
        return await Yquem.move(episode)
      })
    )
  }

  static async move(episode) {
    const sourcePath = episode.origin.path
    const destinationPath = episode.destination.path
    const destinationDirectory = Medoc.getDestinationDirectory(episode)

    if (episode.origin.isDirectory) {
      const sourceDirectory = Medoc.getOriginDirectory(episode)

      if (Medoc.hasFile(sourceDirectory)) {
        if (!fs.existsSync(destinationDirectory)) {
          Medoc.createDirectory(destinationDirectory)
        }

        let reader = fs.createReadStream(sourcePath)

        reader.on('open', () => {
          console.log(`Coping from '${episode.origin.path}' to '${destinationPath}'...`)
          let writer = fs.createWriteStream(destinationPath)
          reader.pipe(writer)
        })

        reader.on('close', async () => {
          await Medoc.removePath(sourceDirectory)
          console.log(`${episode.origin.file} copied to ${destinationPath}`)
        })
      } else {
        await Medoc.removePath(sourceDirectory)
        console.log(`${sourceDirectory} directory has no video file !`)
      }
    }

    if (episode.origin.isFile) {
      if (!fs.existsSync(destinationDirectory)) {
        Medoc.createDirectory(destinationDirectory)
      }

      let reader = fs.createReadStream(sourcePath)

      reader.on('open', () => {
        // console.log(`Coping from '${episode.origin.path}' to '${destinationPath}'...`)
        let writer = fs.createWriteStream(destinationPath)
        reader.pipe(writer)
      })

      reader.on('close', async () => {
        await Medoc.removePath(episode.origin.file)
        console.log(`${episode.origin.file} copied to ${destinationPath}`)
      })
    }
  }

  static removePath(url) {
    return new Promise((resolve, reject) => {
      rimraf(url, () => {
        resolve(`${url} removed !`)
      })
    })
  }

  // Create directory and subdirectories if necessary
  static createDirectory(url) {
    if (!fs.existsSync(url)) {
      mkdirp.sync(url)
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

  static hasFile(url) {
    let files = fs.readdirSync(url)
    let filteredFiles = files.filter(file => {
      if (VIDEO_FORMATS.includes(path.extname(file))) {
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
    if (rst && rst[0] !== '1080') {
      return rst[0]
    }
    return null
  }

  static getShowName(filename) {
    if (Medoc.isEpisode(filename)) {
      let tmp = filename.substr(0, rst.index)
      tmp = tmp.replace(/\./g, ' ').trim()

      // Extract year from name
      let year = Medoc.getYear(filename)

      if (year) {
        tmp = tmp.replace(year, '')
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

  static getEpisodeSeason(filename) {
    let rst = /[sS](\d{2})[eE]\d{2}/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  static getEpisodeNumber(filename) {
    let rst = /[sS]\d{2}[eE](\d{2})/g.exec(filename)

    if (rst) {
      return rst[1]
    }
  }

  static getFile(url) {
    if (fs.lstatSync(url).isDirectory()) {
      let files = fs.readdirSync(url)

      let filteredFiles = files.filter(file => {
        if (VIDEO_FORMATS.includes(path.extname(file))) {
          return true
        }
      })

      return filteredFiles[0]
    } else {
      return url
    }
  }

  static getOriginDirectory(episode) {
    return `${episode.origin.root}\\${episode.origin.directory}`
  }

  static getOriginPath(episode) {
    return `${episode.origin.root}\\${episode.origin.directory}\\${episode.origin.file}`
  }

  static getDestinationDirectory(episode) {
    return `${episode.destination.root}\\${episode.destination.directory}`
  }

  static search(from, to) {
    var list = []

    const files = fs.readdirSync(from)

    if (files && files.length > 0) {
      files.map(filename => {
        if (Medoc.isEpisode(filename)) {
          let filePath = `${from}\\${filename}`
          let isDirectory = fs.lstatSync(filePath).isDirectory()
          let isFile = fs.lstatSync(filePath).isFile()
          let showName = Medoc.getShowName(filename)
          let season = Number(Medoc.getEpisodeSeason(filename))
          let number = Number(Medoc.getEpisodeNumber(filename))
          let format = isDirectory ? path.extname(Medoc.getFile(filePath)) : path.extname(filename)

          list.push({
            origin: {
              directory: fs.lstatSync(filePath).isDirectory() ? filename : null,
              file: Medoc.getFile(filePath),
              format: format,
              isDirectory: isDirectory,
              isFile: isFile,
              path: fs.lstatSync(filePath).isDirectory()
                ? path.normalize(`${filePath}\\${Medoc.getFile(filePath)}`)
                : filePath,
              root: from
            },
            episode: {
              show: showName,
              season: season,
              number: number
            },
            destination: {
              directory: path.normalize(`${showName}\\Season ${season}`),
              filename: `${showName} - ${season}x${number < 10 ? '0' + number : number}${format}`,
              path: path.normalize(
                `${to}\\${showName}\\Season ${season}\\${showName} - ${season}x${
                  number < 10 ? '0' + number : number
                }${format}`
              ),
              root: to
            }
          })
        }
      })
    }

    return list
  }
}
