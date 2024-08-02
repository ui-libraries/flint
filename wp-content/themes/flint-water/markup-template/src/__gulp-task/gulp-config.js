/* Gulp config */
const folder = {
	src: "src/",
	build: "build/",
	dist: "markup/"
}

const ext = {
	fonts: "+(otf|eot|woff2|woff|ttf|svg|OTF|EOT|WOFF2|WOFF|TTF|SVG)",
	img: "+(jpg|jpeg|png|svg|gif|ico|JPG|JPEG|PNG|SVG|GIF|ICO)",
}

//----------#OPTIONS FOR imgRetina PLUGIN
const imgRetinaVar = {
	suffix: {
		2: "@2x",
		// 3: '@3x'
	},
	ignore: ["wpn-", "none-"],
}

//----------#OPTIONS FOR HTMLBEAUTIFY PLUGIN
// all options https://www.npmjs.com/package/gulp-html-beautify
const optionsHtmlBeautifyVar = {
	//indent tabs
	indent_with_tabs: true,
	//maximum number of new lines
	max_preserve_newlines: 0,
	unformatted: [
		// https://www.w3.org/TR/html5/dom.html#phrasing-content
		"abbr",
		"area",
		"b",
		"bdi",
		"bdo",
		"br",
		"cite",
		"code",
		"data",
		"datalist",
		"del",
		"dfn",
		"em",
		"embed",
		"i",
		"ins",
		"kbd",
		"keygen",
		"map",
		"mark",
		"math",
		"meter",
		"noscript",
		"object",
		"output",
		"progress",
		"q",
		"ruby",
		"s",
		"samp",
		"small",
		"strong",
		"sub",
		"sup",
		"template",
		"time",
		"u",
		"var",
		"wbr",
		"text",
		"acronym",
		"address",
		"big",
		"dt",
		"ins",
		"strike",
		"tt",
	],
}

//----------#OPTIONS FOR cssComb PLUGIN
const cssCombVar = {
	"remove-empty-rulesets": true,
	"always-semicolon": true,
	"color-case": "lower",
	"block-indent": "\t",
	"color-shorthand": true,
	"element-case": "lower",
	"eof-newline": true,
	"leading-zero": true,
	"space-before-colon": "",
	"space-after-colon": " ",
	"space-before-combinator": " ",
	"space-after-combinator": " ",
	"space-between-declarations": "\n",
	"space-before-opening-brace": " ",
	"space-after-opening-brace": "\n",
	"space-after-selector-delimiter": "\n",
	"space-before-selector-delimiter": "",
	"space-before-closing-brace": "\n",
	"strip-spaces": true,
}

//----------#OPTIONS FOR version PLUGIN
const versionConfigVar = {
	value: "%DT%",
	append: {
		key: "_v",
		to: [
			{
				type: "css",
				files: ["style.css"],
			},
			{
				type: "js",
				files: ["main.js"],
			},
		],
	},
	output: {
		file: "src/__gulp-task/version.json",
	},
}

export const pathVar = {
	folderProject: folder,
	src: {
		html: `${folder.src}*.html`,
		style: `${folder.src}scss/*.scss`,
		js: `${folder.src}js/main.js`,
		bundle: `${folder.src}js/bundle.js`,
		jq: `${folder.src}js/vendors/jquery.min.js`,
		img: `${folder.src}img/**/*.${ext.img}`,
		fonts: `${folder.src}fonts/**/*.${ext.fonts}`,
		other: `${folder.src}other/**/*.*`,
	},
	build: {
		html: folder.build,
		style: `${folder.build}css/`,
		js: `${folder.build}js/`,
		img: `${folder.build}img/`,
		fonts: `${folder.build}fonts/`,
		other: `${folder.build}other/`,
		clean: `${folder.build}**/*.*`,
	},
	dist: {
		html: folder.dist,
		style: `${folder.dist}css/`,
		js: `${folder.dist}js/`,
		img: `${folder.dist}img/`,
		fonts: `${folder.dist}fonts/`,
		other: `${folder.dist}other/`,
		clean: `${folder.dist}**`,
	},
	watch: {
		html: [`${folder.src}*.html`, `${folder.src}template/**/*.html`],
		style: `${folder.src}scss/**/*.scss`,
		js: `${folder.src}js/**/*.js`,
		img: `${folder.src}img/**/*.${ext.img}`,
		fonts: `${folder.src}fonts/**/*.${ext.fonts}`,
		delet: [
			`${folder.src}img/**/*.${ext.img}`,
			`${folder.src}fonts/**/*.${ext.fonts}`,
			`${folder.src}js/*.js`,
			`${folder.src}*.html`
		],
	},
	config: {
		imgRetina: imgRetinaVar,
		//config webserver for browserSync build
		configWebserverBuild: {
			server: {
				baseDir: folder.build,
				index: folder.build + "home.html",
				reloadDelay: 300,
				directory: true,
			},
			tunnel: false,
			host: "localhost",
			port: 3000,
			logPrefix: "build",
		},
		//config webserver for browserSync prod
		configWebserverProd: {
			server: {
				baseDir: folder.dist,
				index: folder.dist + "home.html",
				reloadDelay: 300,
				directory: true,
			},
			tunnel: false,
			host: "localhost",
			port: 3000,
			logPrefix: "prod",
		},
		//----------#OPTIONS FOR HTMLBEAUTIFY PLUGIN
		//HtmlBeautify config
		optionsHtmlBeautify: optionsHtmlBeautifyVar,
		// cssComb config
		cssComb: cssCombVar,
		// versionConfig config
		versionConfig: versionConfigVar,
	},
};
