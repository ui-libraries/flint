// other file build version project
export const otherBuild = (cb) => {
	g.gulp.src(g.v.src.other)
	.pipe(g.newer(g.v.build.other))
	.pipe(g.gulp.dest(g.v.build.other));
	cb();
}

// other file build version project
export const otherProd = (cb) => {
	g.gulp.src(g.v.src.other)
	.pipe(g.newer(g.v.dist.other))
	.pipe(g.gulp.dest(g.v.dist.other));
	cb();
}
