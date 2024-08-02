var $ = jQuery.noConflict();
jQuery(function () {
	handleResizeClass();
	jcfInit();
	isElementExist(".header", () => {
		initStickyHeader();
		setHeaderVariable();
	});
	isElementExist(".menu-drop", initSmartMenu);
	isElementExist(".chart", initChart);
	isElementExist(".pdf-viewer", initPDFReader);
	isElementExist(".calendar-timeline", initCalendarTimeline);
	isElementExist(".range-datepicker", initRangeDatepicker);
	isElementExist("#heatmap", initCalendarHeatmap);
});

jQuery(window).on("load", () => {
	initAOS();
});

//-------- -------- -------- --------
//-------- js custom start
//-------- -------- -------- --------

// Helper if element exist then call function
function isElementExist(_el, _cb) {
	var elem = document.querySelector(_el);

	if (document.body.contains(elem)) {
		try {
			_cb();
		} catch (e) {
			console.log(e);
		}
	}
}

function debounce(func, timeout) {
	var timeoutID,
		timeout = timeout || 200;
	return function () {
		var scope = this,
			args = arguments;
		clearTimeout(timeoutID);
		timeoutID = setTimeout(function () {
			func.apply(scope, Array.prototype.slice.call(args));
		}, timeout);
	};
}

function initAOS() {
	// Documentation here: https://github.com/michalsnik/aos/tree/v2
	const CONFIG = {
		easing: "ease-out-quart",
		offset: 0,
		duration: 1000,
		once: true,
	};

	let delayCounter = 0;
	const DELAY_STEP = 200; // can be any number (milliseconds)

	const $aosBlocks = $("[data-aos]");

	if (!$aosBlocks) return;

	const inViewportBlocks = $aosBlocks.filter((_, el) => isElemVisible(el));

	if (inViewportBlocks.length) {
		// Apply sequenced animation delay for all blocks in viewport on load
		inViewportBlocks.each((_, el) => {
			const delayInSeconds = delayCounter ? delayCounter / 1000 : 0;

			$(el).css("transition-delay", `${delayInSeconds}s`);

			delayCounter += DELAY_STEP;
		});
	}

	AOS.init(CONFIG);

	function isElemVisible(el) {
		const { top, bottom } = el.getBoundingClientRect();
		const vHeight = window.innerHeight || document.documentElement.clientHeight;

		return (top > 0 || bottom > 0) && top < vHeight;
	}
}

function handleResizeClass() {
	let resizeTimeout

	const handleResize = () => {
		const body = document.querySelector('body')
		body.classList.add('resize')

		clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(function () {
			body.classList.remove('resize')
		}, 200)
	}

	window.addEventListener('resize', handleResize)
}

// initialize custom form elements (checkbox, radio, select) https://github.com/w3co/jcf
function jcfInit() {
	var customSelect = jQuery("select:not(.stars)");
	var customCheckbox = jQuery('input[type="checkbox"]');
	var customRadio = jQuery('input[type="radio"]');

	customSelect.each(function () {
		$(this).find('option').first().addClass("placeholder")
	})

	// all option see https://github.com/w3co/jcf
	jcf.setOptions("Select", {
		wrapNative: false,
		wrapNativeOnMobile: false,
		fakeDropInBody: false,
		maxVisibleItems: 6,
	});

	jcf.setOptions("Checkbox", {});

	jcf.setOptions("Radio", {});

	// init only after option
	jcf.replace(customSelect);
	jcf.replace(customCheckbox);
	jcf.replace(customRadio);
}

function initSmartMenu() {
	jQuery(".menu").smartmenus({
		collapsibleBehavior: "accordion",
		hideTimeout: 0,
		showTimeout: 0,
		subMenusSubOffsetX: 1,
		subMenusSubOffsetY: -8,
	});

	// changed date attribute to a class (need to reverse last item menu)
	jQuery('.menu').children().last().addClass('menu-sm-reverse');

	jQuery('.menu').on('show.smapi', function () {
		jQuery('.header').addClass('bg-white');
		jQuery('.wrapper').addClass('_overlay');
	});

	jQuery('.menu').on('hide.smapi', function () {
		jQuery('.header').removeClass('bg-white');
		jQuery('.wrapper').removeClass('_overlay');
	});

	jQuery("body").mobileNav({
		menuActiveClass: "menu-active",
		menuOpener: ".menu-opener",
		hideOnClickOutside: true,
		menuDrop: ".menu-drop",
		scrollStep: 0
	});

	jQuery(window).on("resize orientationchange", function () {
		jQuery("body").removeClass("menu-active");
		// jQuery.smartmenus.hideAll();
		jQuery('.header').removeClass('bg-white');
	});
}

function setRootProperty(name, value) {
	const root = document.querySelector(':root');
	root.style.setProperty(`--${name}`, `${value}px`);
}

function setHeaderVariable() {
	const header = document.querySelector('.header');
	const headerVariableName = 'header-height';
	const DELAY = 300;

	const setHeaderHeightVariable = debounce(() => {
		const headerHeight = header.offsetHeight;
		setRootProperty(headerVariableName, headerHeight);
	}, DELAY);

	setRootProperty(headerVariableName, header.offsetHeight);
	setHeaderHeightVariable();

	window.addEventListener('resize', setHeaderHeightVariable);
}

function initStickyHeader() {
	const header = document.querySelector('.header');
	const headerHeight = header.clientHeight;
	const FIXED_CLASS = '_fixed';
	const HIDDEN_CLASS = '_hidden';
	let scrollPosition = 0;
	let scrollDirection;

	const handleScroll = () => {
		const scrollDirectionUp = scrollDirection === 'up';
		const scrollDirectionDown = scrollDirection === 'down';
		const headerFixed = header.classList.contains(FIXED_CLASS);
		const offsetTop = document.body.getBoundingClientRect().top;
		const isResize = document.body.classList.contains('resize');

		scrollDirection = offsetTop > scrollPosition ? 'up' : 'down';
		scrollPosition = offsetTop;

		if (!isResize && scrollDirectionUp && window.scrollY > headerHeight) {
			header.classList.remove(HIDDEN_CLASS);
			header.classList.add(FIXED_CLASS);
		}

		if (scrollDirectionDown && headerFixed) {
			header.classList.add(HIDDEN_CLASS);
			header.classList.remove(FIXED_CLASS);
		}

		if (window.scrollY === 0) {
			header.classList.remove(HIDDEN_CLASS);
			header.classList.remove(FIXED_CLASS);
		}
	}

	window.addEventListener('scroll', handleScroll);
}

function renderMonthlyBarChart() {
	const ctx = document.querySelectorAll('#monthlyBarChart');
	const ticksFont = {
		size: 12,
		family: "'grotesk', 'sans-serif'"
	};

	const backgroundColor = '#F2F2F2';

	const ticks = {
		color: '#000',
		font: ticksFont
	};

	const chartAreaBackground = {
		id: 'chartAreaBackground',
		beforeDraw(chart, args, options) {
			const { ctx, chartArea: { left, top, width, height } } = chart;
			ctx.save();
			ctx.fillStyle = options.backgroundColor;
			ctx.fillRect(left, top, width, height);
			ctx.restore();
		}
	};

	const axisLabelsOffset = {
		beforeDatasetsDraw(chart) {
			const { scales: { x, y } } = chart;
			x._labelItems.forEach(label => {
				label.textOffset = 10;
			});
			y._labelItems.forEach(label => {
				label.options.translation[0] = 25;
			});
		}
	};

	ctx.forEach(item => {
		if(!item.dataset.months) return;

		const data = JSON.parse(item.dataset.months);

		new Chart(item, {
			type: 'bar',
			data: {
				labels: data.map(item => item.month),
				datasets: [{
					data: data.map(item => item.emails),
					backgroundColor: '#e5a82b',
					fill: false,
					barPercentage: 0.8
				}]
			},
			plugins: [chartAreaBackground, axisLabelsOffset],
			options: {
				plugins: {
					chartAreaBackground: {
						backgroundColor
					},
					legend: {
						display: false
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						},
						border: {
							display: false
						},
						ticks: ticks
					},
					y: {
						grid: {
							display: false
						},
						border: {
							display: false
						},
						ticks: ticks,
						afterFit(context) {
							context.width += 10;
						},
						beginAtZero: true
					}
				}
			}
		});
	});
}

function renderDetailedChart() {
	const ctx = document.querySelectorAll('#detailedChart');

	const barStyles = {
		backgroundColor: '#FF551F',
		fill: false,
		barPercentage: 0.6
	}

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
	const data = [
		{ data: [33, 74, 22, 108, 45, 91, 56, 131, 39, 83, 117, 15], ...barStyles },
		{ data: [19, 96, 43, 54, 123, 67, 79, 118, 32, 77, 105, 12], ...barStyles },
		{ data: [25, 87, 60, 79, 135, 33, 74, 121, 28, 97, 94, 18], ...barStyles },
		{ data: [48, 62, 51, 91, 114, 22, 110, 81, 38, 64, 89, 26], ...barStyles },
		{ data: [39, 56, 67, 71, 104, 41, 99, 92, 36, 108, 68, 49], ...barStyles },
		{ data: [61, 31, 75, 88, 112, 11, 113, 68, 45, 99, 54, 82], ...barStyles },
		{ data: [74, 23, 81, 100, 92, 29, 135, 67, 41, 111, 72, 78], ...barStyles },
		{ data: [85, 10, 96, 78, 122, 19, 142, 59, 50, 123, 46, 68], ...barStyles },
		{ data: [92, 38, 103, 63, 99, 54, 125, 71, 67, 127, 64, 84], ...barStyles },
		{ data: [110, 47, 121, 77, 81, 67, 136, 76, 75, 129, 80, 101], ...barStyles }
	];

	const ticksFont = {
		size: 12,
		family: "'grotesk', 'sans-serif'"
	};

	const xLabelsAlign = {
		beforeDraw(chart) {
			const scale = chart.scales.x;
			const items = scale.getLabelItems();
			const { data } = chart.getDatasetMeta(0);

			for (let i = 0; i < items.length; i++) {
				const { x, width } = data[i];
				const newX = x - width / 2;
				items[i].options.translation.splice(0, 1, newX);
			}
		},
	}

	const yDashBorder = {
		id: 'yDashBorder',
		beforeDraw(chart) {
			const { ctx, chartArea: { left, top, height } } = chart;

			ctx.save();
			ctx.beginPath();
			ctx.setLineDash([5, 5])
			ctx.strokeStyle = 'white'
			ctx.moveTo(left, top);
			ctx.lineTo(left, height);

			ctx.stroke();
		}
	};

	const axisLabelsOffset = {
		beforeDatasetsDraw(chart) {
			const { scales: { x, y } } = chart;
			x._labelItems.forEach(label => {
				label.textOffset = 7;
			});

			y._labelItems.forEach(label => {
				label.options.translation[0] = 25;
				label.textOffset = -5;
			});
		}
	};

	ctx.forEach(item => {
		if(!item.dataset.months) return;

		const data = JSON.parse(item.dataset.months).map(item => ({...item, ...barStyles}));

		const chart = new Chart(item, {
			type: 'bar',
			data: {
				labels: months,
				datasets: data,
			},
			plugins: [axisLabelsOffset, xLabelsAlign, yDashBorder],
			options: {
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
				},
				scales: {
					x: {
						ticks: {
							color: '#cbcbcb',
							font: ticksFont,
						},
					},
					y: {
						ticks: {
							color: '#cbcbcb',
							font: ticksFont,
							maxTicksLimit: 4,
						},
						grid: {
							drawTicks: false,
						},
						border: {
							color: 'white',
						},
						afterFit(context) {
							context.width += 10;
						},
					}
				},
				categoryPercentage: 1,
			},
		});
	});
}

function initChart() {
	renderMonthlyBarChart();
	renderDetailedChart();
}

function initPDFReader() {
	const articles = document.querySelectorAll('.text-card');
	const iframeContainer = document.querySelector('.pdf-viewer_iframe-wrap');
	const pdfViewerLink = document.querySelector('.pdf-viewer_link');

	let observer = null;

	const activeArticle = document.querySelector('.text-card');
	const initialSrc = activeArticle.dataset.src;
	pdfViewerLink.href = initialSrc;

	const createIframe = src => {
		const iframe = document.createElement('iframe');
		iframe.src = src;
		iframe.classList.add('pdf-viewer_iframe', '_hidden');
		iframeContainer.appendChild(iframe);
		return iframe;
	};

	const generateIframes = () => {
		iframeContainer.innerHTML = '';
		articles.forEach((article, index) => {
			const src = article.dataset.src;
			createIframe(src);
		});
	};

	const showIframe = indexToShow => {
		const iframes = document.querySelectorAll('.pdf-viewer_iframe');
		iframes.forEach((iframe, index) => {
			if (index === indexToShow) {
				iframe.classList.add('_active');
				iframe.classList.remove('_hidden');
			} else {
				iframe.classList.remove('_active');
				iframe.classList.add('_hidden');
			}
		});
	};

	const setActiveArticle = indexToShow => {
		articles.forEach((article, index) => {
			if (index === indexToShow) {
				article.classList.add('_active');
			} else {
				article.classList.remove('_active');
			}
		});
	};

	generateIframes();
	showIframe(0);
	setActiveArticle(0);

	articles.forEach((article, index) => {
		article.addEventListener('click', () => {
			showIframe(index);
			setActiveArticle(index);

			const activeIframeSrc = document.querySelector('.pdf-viewer_iframe._active').src;
			pdfViewerLink.href = activeIframeSrc;
		});
	});

	if (articles.length > 0) {
		pdfViewerLink.classList.add('_visible');
	} else {
		pdfViewerLink.classList.remove('_visible');
	}

	const observerConfig = {
		childList: true,
		subtree: true
	};

	const observerCallback = () => {
		initPDFReader();
	};

	observer = new MutationObserver(observerCallback);
	const pdfViewerBox = document.querySelector('.pdf-viewer_box');
	observer.observe(pdfViewerBox, observerConfig);
}

function initCalendarTimeline() {
	const parent = document.querySelectorAll('.calendar-timeline');

	parent.forEach(parentItem => {
		const items = parentItem.querySelectorAll('.calendar-timeline_item._info');

		items.forEach(childItem => {
			childItem.addEventListener('click', () => {
				items.forEach(item => item.classList.remove('_active'));
				childItem.classList.add('_active');
			})
		});

		const datesElements = parentItem.querySelectorAll('.calendar-timeline_date');

		datesElements.forEach(dateEl => {
			const timelineRect = parentItem.getBoundingClientRect();
			const dateRect = dateEl.getBoundingClientRect();

			if (dateRect.left < timelineRect.left) {
				dateEl.classList.add('_pos-left')
			}
		});
	});
}

function initRangeDatepicker() {
	const rangeDatepickerElements = document.querySelectorAll('.range-datepicker');

	rangeDatepickerElements.forEach(datepicker => {
		const fromInput = datepicker.querySelector("#date-from");
		const toInput = datepicker.querySelector("#date-to");

		const fromDateInput = flatpickr(fromInput, {
			dateFormat: "m/d/Y",
			enableTime: false,
			disableMobile: "true",
			onChange: function (selectedDates, dateStr, instance) {
				toDateInput.set("minDate", dateStr);
			}
		});

		const toDateInput = flatpickr(toInput, {
			dateFormat: "m/d/Y",
			enableTime: false,
			disableMobile: "true",
			onChange: function (selectedDates, dateStr, instance) {
				fromDateInput.set("maxDate", dateStr);
			}
		});
	})
}

function initCalendarHeatmap() {
	const heatmapElement = document.querySelectorAll('.heatmap');

	const plugins = [
		[
			Tooltip,
			{
				text: function (date, value, dayjsDate) {
					return (
						(value ? value + ' emails' : 'No emails') + ' on ' + dayjsDate.format('LL')
					);
				},
			},
		],
	]

	heatmapElement.forEach(item => {
		if(!item.dataset.dates) return;

		const data = JSON.parse(item.dataset.dates);
		const heatmap = item.querySelector('#heatmap')
		const cal = new CalHeatmap();
		const navButtonNext = item.querySelector('.heatmap_nav-button._next');
		const navButtonPrev = item.querySelector('.heatmap_nav-button._prev');

		const options = {
			data: {
				source: data,
				x: 'date',
				y: d => +d['value'],
			},
			range: 12,
			date: { start: new Date('2024-01-01') },
			scale: {
				color: {
					range: ['#a1cbac', '#1f700f'],
					domain: [0, 160],
				},
			},
			domain: {
				type: 'month',
				gutter: 25,
				label: {
					text: 'MMM',
					offset: {
						y: 9
					}
				}
			},
			subDomain: {
				type: 'day',
				radius: 2,
				label: 'DD',
				width: 12,
				height: 12,
				gutter: 3,
				color: '#fff'
			},
		};

		cal.paint({
			...options,
			itemSelector: heatmap,
		}, plugins);

		navButtonNext.addEventListener('click', e => {
			e.preventDefault();
			cal.next()
		})

		navButtonPrev.addEventListener('click', e => {
			e.preventDefault();
			cal.previous()
		})
	})
}

//-------- -------- -------- --------
//-------- included js libs start
//-------- -------- -------- --------

//= vendors/smartmenus.js

// jcf library select, radio, checkbox modules
//= vendors/jcf.min.js
//= vendors/aos.min.js
//= vendors/chart.min.js
//= vendors/flatpickr.min.js
//= vendors/d3.js
//= vendors/popper.min.js
//= vendors/heatmap.min.js
//= vendors/tooltip.min.js


//-------- -------- -------- --------
//-------- included js libs end
//-------- -------- -------- --------