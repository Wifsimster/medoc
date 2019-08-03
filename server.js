const Medoc = require("./medoc")

const PATH_TO_SCAN = `w:`
const PATH_TO_PUSH = `z:`

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)

medoc
  .search()
  .then(results => {
    console.log(results)
  })
  .catch(err => {
    console.error(err)
  })
