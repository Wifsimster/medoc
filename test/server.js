const Medoc = require("../medoc")

const PATH_TO_SCAN = "y:"
const PATH_TO_PUSH = "z:"

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)
medoc
	.runSync()
	.then((results) => {
		console.log("Terminé :", results)
	})
	.catch((err) => {
		console.error(err)
	})
