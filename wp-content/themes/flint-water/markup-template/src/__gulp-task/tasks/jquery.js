export const jqBuild = () => {
	return g.gulp.src(g.v.src.jq)
		.pipe(g.gulp.dest(g.v.build.js));
}

export const jqProd = () => {
	return g.gulp.src(g.v.src.jq)
		.pipe(g.gulp.dest(g.v.dist.js));
}