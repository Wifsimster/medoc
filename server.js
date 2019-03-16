const fs = require("fs")
const Engine = require("./engine")

const PATH_TO_SCAN = `w:`
const PATH_TO_PUSH = `z:`

async function main() {
  let episodes = await Engine.search(PATH_TO_SCAN)

  episodes.map(episode => {
    let sourceDirectory = Engine.getOriginDirectory(episode)

    if (Engine.hasFile(sourceDirectory)) {
      let source = Engine.getOriginPath(episode)

      let destinationDirectory = Engine.getDestinationDirectory(
        PATH_TO_PUSH,
        episode
      )

      if (Engine.directoryExist(destinationDirectory)) {
        let destination = Engine.getDestinationPath(PATH_TO_PUSH, episode)

        console.log(`Coping ${episode.file}...`)

        let reader = fs.createReadStream(source)

        reader.on("open", () => {
          let writer = fs.createWriteStream(destination)
          reader.pipe(writer)
        })

        reader.on("close", () => {
          console.log(`${episode.file} copied to ${destination}`)
          Engine.removeDirectory(sourceDirectory)
        })
      }
    } else {
      console.log(`${sourceDirectory} directory has no video file`)
      Engine.removeDirectory(sourceDirectory)
    }
  })
}

main()
