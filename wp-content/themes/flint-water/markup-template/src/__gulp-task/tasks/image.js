import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminMozjpeg from "imagemin-mozjpeg";

// image optimize build version project
export const imageBuild = (cb) => {
	g.gulp.src(g.v.src.img)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.newer(g.v.build.img))
		.pipe(g.gulp.dest(g.v.build.img));
	cb();
}

//image optimize build version project
export const imageProd = (cb) => {
	g.gulp.src(g.v.src.img)
		.pipe(
			g.plumber({ errorHandler: g.notify.onError("Error: <%= error.message %>") })
		)
		.pipe(g.newer(g.v.dist.img))
		.pipe(
			imagemin(
				[
					imageminPngquant({ quality: [0.7, 0.8] }),
					imageminMozjpeg({ progressive: true }),
				],
				//for more detailed information output
				{ verbose: true }
			)
		)
		.pipe(g.gulp.dest(g.v.dist.img));
	cb();
}
