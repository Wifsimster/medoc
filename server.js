const fs = require("fs");
const Engine = require("./engine");
const rimraf = require("rimraf");

const PATH_TO_SCAN = `w:`;
const PATH_TO_PUSH = `z:`;

async function main() {
  let episodes = await Engine.search(PATH_TO_SCAN);

  fs.readdir(PATH_TO_PUSH, (err, directories) => {
    directories.map(directory => {
      episodes.map(episode => {
        if (directory === episode.name) {
          let source = Engine.getOriginPath(episode);
          let destination = `${PATH_TO_PUSH}${Engine.getCleanPath(episode)}`;
          let destinationDirectory = `${PATH_TO_PUSH}${Engine.getDestinationDirectory(
            episode
          )}`;

          if (!fs.existsSync(destinationDirectory)) {
            fs.mkdirSync(destinationDirectory);
          }

          console.log(`Coping ${episode.file}...`);

          let reader = fs.createReadStream(source);

          reader.on("open", () => {
            let writer = fs.createWriteStream(destination);
            reader.pipe(writer);
          });

          reader.on("close", () => {
            console.log(`${source} copied !`);

            rimraf(source, () => {
              console.log(`${source} removed !`);
            });
          });
        }
      });
    });
  });
}

main();
