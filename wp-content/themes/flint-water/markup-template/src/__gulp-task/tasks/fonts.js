// fonts file build version project
export const fontsBuild = (cb) => {
	g.gulp.src(g.v.src.fonts)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.newer(g.v.build.fonts))
		.pipe(g.gulp.dest(g.v.build.fonts));
	cb();
}

// fonts file build version project
export const fontsProd = (cb) => {
	g.gulp.src(g.v.src.fonts)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.gulp.dest(g.v.dist.fonts));
	cb();
}
