import rigger from "gulp-rigger";

// // js file build version project
export const jsBuild = (cb) => {
	return g.gulp.src(g.v.src.js)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(rigger())
		.pipe(g.gulp.dest(g.v.build.js));
}

// js file Prod version project
export const jsProd = (cb) => {
	return g.gulp.src(g.v.src.js)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(rigger())
		.pipe(g.gulp.dest(g.v.dist.js));
}