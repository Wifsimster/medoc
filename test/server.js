const Medoc = require("../medoc")

const PATH_TO_SCAN = "u:"
const PATH_TO_PUSH = "q:"

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)
medoc
	.runSync()
	.then((results) => {
		console.log("Terminé :", results)
	})
	.catch((err) => {
		console.error(err)
	})
