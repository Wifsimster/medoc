const Medoc = require("./medoc")

const PATH_TO_SCAN = `w:`
const PATH_TO_PUSH = `z:`

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)

medoc
  .run()
  .then(results => {
    console.log(results)
    console.log(`All Done :)`)
  })
  .catch(err => {
    console.error(err)
  })
