const Engine = require("./engine");

const PATH_TO_SCAN = `w:`;

async function main() {
  let files = await Engine.search(PATH_TO_SCAN);
  console.log(files);
}

main();
