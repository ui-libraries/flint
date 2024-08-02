// delet folder build version project
export const cleanBuild = (cb) => {
	console.log("----------- FOLDER FOR BUILD CLEAN");
	g.deleteSync(g.v.build.clean, { force: true });
	cb();
}

// delet folder build version project
export const cleanProd = (cb) => {
	console.log("------------ FOLDER FOR PRODUCTION CLEAN");
	g.deleteSync(g.v.dist.clean, { force: true });
	cb();
}
