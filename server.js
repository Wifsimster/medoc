const Medoc = require('./medoc')

// const PATH_TO_SCAN = `w:`
// const PATH_TO_PUSH = `z:`

const PATH_TO_SCAN = `D:\\hexawin8`
const PATH_TO_PUSH = `D:\\hexawin8`

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)

medoc
  .run()
  .then(results => {
    console.log(results)
  })
  .catch(err => {
    console.error(err)
  })
