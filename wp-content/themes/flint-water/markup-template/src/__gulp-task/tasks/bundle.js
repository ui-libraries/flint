export const jsBundleBuild = (cb) => {
	return g.gulp.src(g.v.src.bundle)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.gulp.dest(g.v.build.js));
}

// js file Prod version project
export const jsBundleProd = (cb) => {
	return g.gulp.src(g.v.src.bundle)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.gulp.dest(g.v.dist.js));
}