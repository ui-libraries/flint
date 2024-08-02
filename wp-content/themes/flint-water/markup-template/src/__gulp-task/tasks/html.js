import frontMatter from "gulp-front-matter";
import nunjucksRender from "gulp-nunjucks-render";
import imgRetina from "gulp-responsive-imgz-ignore";
import htmlbeautify from "gulp-html-beautify";
import version from "gulp-version-number";

// html file build version
export const htmlBuild = () => {
	return g.gulp.src(g.v.src.html)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(frontMatter({ property: "data" }))
		.pipe(nunjucksRender())
		.pipe(imgRetina(g.v.config.imgRetina))
		.pipe(g.gulp.dest(g.v.build.html));
}

//html file production version
export const htmlProd = () => {
	return g.gulp.src(g.v.src.html)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(frontMatter({ property: "data" }))
		.pipe(nunjucksRender())
		.pipe(imgRetina(g.v.config.imgRetina))
		.pipe(htmlbeautify(g.v.config.optionsHtmlBeautify))
		.pipe(version(g.v.config.versionConfig))
		.pipe(g.gulp.dest(g.v.dist.html));
}
