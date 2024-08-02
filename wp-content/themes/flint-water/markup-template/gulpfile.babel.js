import gulp from "gulp";
import {deleteSync} from "del";
import newer from "gulp-newer";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import path from "path";
import browserSyncPlugin from "browser-sync";

// ==================== IMPORT COMMON VARIABL
import { pathVar } from "./src/__gulp-task/gulp-config.js";

// If you need to work with modules and es6 or es7, replace variable "modulesOnVariable" to "true" and uncomment file connection on file 'src\template\includes.html'
const modulesOnVariable = false;

// ==================== CREATE GLOBAL OBJECT g
global.g = {
	modulesOn: modulesOnVariable,
	gulp: gulp,
	newer: newer,
	notify: notify,
	plumber: plumber,
	deleteSync: deleteSync,
	browserSync: browserSyncPlugin.create(),
	bsr(cb) {
		g.browserSync.reload();
		cb();
	},
	v: pathVar
}


// ====================
// ==================== IMPORT TASK
// ====================

import { cleanBuild, cleanProd } from "./src/__gulp-task/tasks/clean.js";
import { cssBuild, cssProd } from "./src/__gulp-task/tasks/css.js";
import { fontsBuild, fontsProd } from "./src/__gulp-task/tasks/fonts.js";
import { htmlBuild, htmlProd } from "./src/__gulp-task/tasks/html.js";
import { imageBuild, imageProd } from "./src/__gulp-task/tasks/image.js";
import { jsBuild, jsModulesBuild, jsModulesProd, jsProd } from "./src/__gulp-task/tasks/js.js";
import { otherBuild, otherProd } from "./src/__gulp-task/tasks/other.js";

// For debug
// export const test = htmlBuild;


// ====================
// ==================== DEV MAIN TASK
// ====================

// watch task with DEV and init server
function watchServBuild() {
	// init server for DEV mode
	g.browserSync.init(g.v.config.configWebserverBuild);

	gulp.watch(g.v.watch.html, gulp.series(htmlBuild, g.bsr));

	gulp.watch(g.v.watch.style, cssBuild);

	gulp.watch(g.v.watch.js, gulp.series(jsBuild, g.bsr));

	gulp.watch(g.v.watch.jsModules, gulp.series(jsModulesBuild, g.bsr));

	gulp.watch(g.v.watch.fonts, gulp.series(fontsBuild, g.bsr));

	gulp.watch(g.v.watch.img, gulp.series(imageBuild, g.bsr));

	gulp.watch(g.v.watch.delet).on("unlink", function (filepath) {
		var filePathFromSrc = path.relative(
			path.resolve(g.v.folderProject.src),
			filepath
		);
		var destFilePath = path.resolve(g.v.folderProject.build, filePathFromSrc);
		console.log("You delet this file - " + destFilePath);
		g.deleteSync(destFilePath);
	});
}

// create common task for DEV mode
const filesBuild = gulp.parallel(
	htmlBuild,
	jsBuild,
	jsModulesBuild,
	cssBuild,
	fontsBuild,
	otherBuild
);

// exports default task for DEV mode
export default gulp.series(filesBuild, imageBuild, watchServBuild);
export const dev = gulp.series(cleanBuild, filesBuild, imageBuild, watchServBuild);

// // ====================
// // ==================== DIST MAIN TASK
// // ====================


// watch task and init server on PROD mode
function watchServerProd() {
	// init server for DEV mode
	g.browserSync.init(g.v.config.configWebserverProd);

	gulp.watch(g.v.watch.html, gulp.series(htmlProd, g.bsr));

	gulp.watch(g.v.watch.style, cssProd);

	gulp.watch(g.v.watch.js, gulp.series(jsProd, g.bsr));

	gulp.watch(g.v.watch.jsModules, gulp.series(jsModulesProd, g.bsr));

	gulp.watch(g.v.watch.fonts, gulp.series(fontsProd, g.bsr));

	gulp.watch(g.v.watch.img, gulp.series(imageProd, g.bsr));

	gulp.watch(g.v.watch.delet).on("unlink", function (filepath) {
		var filePathFromSrc = path.relative(
			path.resolve(g.v.folderProject.src),
			filepath
		);
		var destFilePath = path.resolve(g.v.folderProject.dist, filePathFromSrc);
		console.log("You delet this file - " + destFilePath);
		g.deleteSync(destFilePath);
	});
}

// create common task for PROD mode
const filesProd = gulp.parallel(
	htmlProd,
	jsProd,
	jsModulesProd,
	cssProd,
	fontsProd,
	otherProd
);

// exports task for PROD mode
export const dist = gulp.series(filesProd, imageProd, watchServerProd);
export const distClean = gulp.series(
	cleanProd,
	filesProd,
	imageProd,
	watchServerProd
);
