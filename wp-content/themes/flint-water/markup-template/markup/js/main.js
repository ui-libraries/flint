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
    ];

    heatmapElement.forEach(item => {
        if (!item.dataset.dates) return;

        const data = JSON.parse(item.dataset.dates);
        const heatmap = item.querySelector('#heatmap');
        const cal = new CalHeatmap();

        function paintHeatmap(year) {
            const startOfYear = new Date(`${year}-01-01`);

            const options = {
                data: {
                    source: data,
                    x: 'date',
                    y: d => +d['value'],
                },
                range: 12,
                date: { start: startOfYear },
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
                            y: 9,
                        },
                    },
                },
                subDomain: {
                    type: 'day',
                    radius: 2,
                    label: 'DD',
                    width: 12,
                    height: 12,
                    gutter: 3,
                    color: '#fff',
                },
            };

            // Paint the heatmap and attach the click event listener
            cal.paint({
                ...options,
                itemSelector: heatmap,
            }, plugins).then(() => {
                cal.on('click', function (event, date) {
					const formattedDate = dayjs(date).utc().format('YYYY-MM-DD');
					console.log(`Date clicked: ${formattedDate}`);
				
					// Convert the clicked date to start and end timestamps in UTC
					const startOfDay = dayjs(date).utc().startOf('day').unix();
					const endOfDay = dayjs(date).utc().endOf('day').unix();
				
					// Call the function to fetch data from the API
					fetchDataForDate(startOfDay, endOfDay);
				});
				
            });
        }

        // Function to fetch data from the API
        function fetchDataForDate(startTimestamp, endTimestamp) {
			const apiUrl = `https://fwcpublicarchive.lib.uiowa.edu/api/api.php/records/emails?filter=timestamp,bt,${startTimestamp},${endTimestamp}`;
		
			fetch(apiUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`);
					}
					return response.json();
				})
				.then(data => {
					console.log('Data fetched from API:', data);
					displayDataInTable(data.records);
				})
				.catch(error => {
					console.error('Error fetching data:', error);
				});
		}
		

        // Initial paint for the default year
        paintHeatmap('2014');

        // Navigation buttons
        const navButtonNext = item.querySelector('.heatmap_nav-button._next');
        const navButtonPrev = item.querySelector('.heatmap_nav-button._prev');

        navButtonNext.addEventListener('click', e => {
            e.preventDefault();
            cal.next().then(() => {
                cal.on('click', function (event, date) {
                    const formattedDate = dayjs(date).format('YYYY-MM-DD');
                    console.log(`Date clicked: ${formattedDate}`);
                    const startOfDay = dayjs(date).startOf('day').unix();
                    const endOfDay = dayjs(date).endOf('day').unix();
                    fetchDataForDate(startOfDay, endOfDay);
                });
            });
        });

        navButtonPrev.addEventListener('click', e => {
            e.preventDefault();
            cal.previous().then(() => {
                cal.on('click', function (event, date) {
                    const formattedDate = dayjs(date).format('YYYY-MM-DD');
                    console.log(`Date clicked: ${formattedDate}`);
                    const startOfDay = dayjs(date).startOf('day').unix();
                    const endOfDay = dayjs(date).endOf('day').unix();
                    fetchDataForDate(startOfDay, endOfDay);
                });
            });
        });

        const yearDropdown = document.querySelector('select');

        yearDropdown.addEventListener('change', function () {
            const selectedYear = this.value;
            if (selectedYear) {
                paintHeatmap(selectedYear);
            }
        });
    });
}



function displayDataInTable(records) {
    // Get the container div
    const container = document.getElementById('email-table-container');
    container.innerHTML = ''; 

    // Check if records are available
    if (!records || records.length === 0) {
        container.innerHTML = '<p>No emails found for this date.</p>';
        return;
    }

    // Create the table element
    const table = document.createElement('table');
    table.classList.add('email-table'); 

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columns = [
        { header: 'Date', field: 'timestamp' },
        { header: 'Sender', field: 'sender' },
        { header: 'Recipient', field: 'recipient_to' },
        { header: 'Subject', field: 'subject' },
		{ header: 'PDF', field: 'bookmark_url' },
    ];

    // Create header cells
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    records.forEach(record => {
        const row = document.createElement('tr');

        columns.forEach(col => {
			const td = document.createElement('td');
		
			if (col.field === 'timestamp') {
				// Format the timestamp
				const date = new Date(record[col.field] * 1000)
				td.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
			} else if (col.field === 'bookmark_url') {
				// Transform the URL and display as an icon
				const bookmarkUrl = record[col.field].replace('http://s-lib007.lib.uiowa.edu/flint/', 'https://fwcpublicarchive.lib.uiowa.edu/');
				
				const link = document.createElement('a');
				link.href = bookmarkUrl;
				link.target = '_blank'; // Open in new tab
				
				const icon = document.createElement('img');
				icon.src = 'https://fwcpublicarchive.lib.uiowa.edu/wp-content/uploads/2024/10/file.png';
				icon.alt = 'PDF Bookmark';
				icon.style.width = '20px'; // Set icon size
				icon.style.height = '20px';
		
				link.appendChild(icon);
				td.appendChild(link);
			} else {
				td.textContent = record[col.field];
			}
		
			row.appendChild(td);
		});
		

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}







//-------- -------- -------- --------
//-------- included js libs start
//-------- -------- -------- --------

/*
 * Simple Mobile Navigation
 */
(function ($) {
	function MobileNav(options) {
		this.options = $.extend(
			{
				container: null,
				hideOnClickOutside: false,
				menuActiveClass: "nav-active",
				menuOpener: ".nav-opener",
				menuDrop: ".nav-drop",
				toggleEvent: "click",
				outsideClickEvent: "click touchstart pointerdown MSPointerDown"
			},
			options
		);
		this.initStructure();
		this.attachEvents();
	}
	MobileNav.prototype = {
		initStructure: function () {
			this.page = $("html");
			this.container = $(this.options.container);
			this.opener = this.container.find(this.options.menuOpener);
			this.drop = this.container.find(this.options.menuDrop);
		},
		attachEvents: function () {
			var self = this;
			if (activateResizeHandler) {
				activateResizeHandler();
				activateResizeHandler = null;
			}
			this.outsideClickHandler = function (e) {
				if (self.isOpened()) {
					var target = $(e.target);
					if (
						!target.closest(self.opener).length &&
						!target.closest(self.drop).length
					) {
						self.hide();
					}
				}
			};
			this.openerClickHandler = function (e) {
				e.preventDefault();
				self.toggle();
			};
			this.opener.on(this.options.toggleEvent, this.openerClickHandler);
		},
		isOpened: function () {
			return this.container.hasClass(this.options.menuActiveClass);
		},
		show: function () {
			this.container.addClass(this.options.menuActiveClass);
			if (this.options.hideOnClickOutside) {
				this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);
			}
		},
		hide: function () {
			this.container.removeClass(this.options.menuActiveClass);
			if (this.options.hideOnClickOutside) {
				this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
			}
		},
		toggle: function () {
			if (this.isOpened()) {
				this.hide();
			} else {
				this.show();
			}
		},
		destroy: function () {
			this.container.removeClass(this.options.menuActiveClass);
			this.opener.off(this.options.toggleEvent, this.clickHandler);
			this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
		}
	};
	var activateResizeHandler = function () {
		var win = $(window),
			doc = $("html"),
			resizeClass = "resize-active",
			flag,
			timer;
		var removeClassHandler = function () {
			flag = false;
			doc.removeClass(resizeClass);
		};
		var resizeHandler = function () {
			if (!flag) {
				flag = true;
				doc.addClass(resizeClass);
			}
			clearTimeout(timer);
			timer = setTimeout(removeClassHandler, 500);
		};
		win.on("resize orientationchange", resizeHandler);
	};
	$.fn.mobileNav = function (opt) {
		var args = Array.prototype.slice.call(arguments);
		var method = args[0];
		return this.each(function () {
			var $container = jQuery(this);
			var instance = $container.data("MobileNav");
			if (typeof opt === "object" || typeof opt === "undefined") {
				$container.data(
					"MobileNav",
					new MobileNav(
						$.extend(
							{
								container: this
							},
							opt
						)
					)
				);
			} else if (typeof method === "string" && instance) {
				if (typeof instance[method] === "function") {
					args.shift();
					instance[method].apply(instance, args);
				}
			}
		});
	};
})(jQuery);
/*
 * SmartMenus jQuery v1.1.0+
 * http://www.smartmenus.org/
 *
 * Copyright Vasil Dinkov, Vadikom Web Ltd.
 * http://vadikom.com/
 *
 * Released under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function (factory) {
	if (typeof define === "function" && define.amd) {
		// AMD
		define(["jquery"], factory);
	} else if (typeof module === "object" && typeof module.exports === "object") {
		// CommonJS
		module.exports = factory(require("jquery"));
	} else {
		// Global jQuery
		factory(jQuery);
	}
})(function ($) {
	var menuTrees = [],
		mouse = false, // optimize for touch by default - we will detect for mouse input
		touchEvents = "ontouchstart" in window, // we use this just to choose between toucn and pointer events, not for touch screen detection
		mouseDetectionEnabled = false,
		requestAnimationFrame =
			window.requestAnimationFrame ||
			function (callback) {
				return setTimeout(callback, 1000 / 60);
			},
		cancelAnimationFrame =
			window.cancelAnimationFrame ||
			function (id) {
				clearTimeout(id);
			},
		canAnimate = !!$.fn.animate;
	// Handle detection for mouse input (i.e. desktop browsers, tablets with a mouse, etc.)
	function initMouseDetection(disable) {
		var eNS = ".smartmenus_mouse";
		if (!mouseDetectionEnabled && !disable) {
			// if we get two consecutive mousemoves within 2 pixels from each other and within 300ms, we assume a real mouse/cursor is present
			// in practice, this seems like impossible to trick unintentianally with a real mouse and a pretty safe detection on touch devices (even with older browsers that do not support touch events)
			var firstTime = true,
				lastMove = null,
				events = {
					mousemove: function (e) {
						var thisMove = {
							x: e.pageX,
							y: e.pageY,
							timeStamp: new Date().getTime()
						};
						if (lastMove) {
							var deltaX = Math.abs(lastMove.x - thisMove.x),
								deltaY = Math.abs(lastMove.y - thisMove.y);
							if (
								(deltaX > 0 || deltaY > 0) &&
								deltaX <= 2 &&
								deltaY <= 2 &&
								thisMove.timeStamp - lastMove.timeStamp <= 300
							) {
								mouse = true;
								// if this is the first check after page load, check if we are not over some item by chance and call the mouseenter handler if yes
								if (firstTime) {
									var $a = $(e.target).closest("a");
									if ($a.is("a")) {
										$.each(menuTrees, function () {
											if ($.contains(this.$root[0], $a[0])) {
												this.itemEnter({ currentTarget: $a[0] });
												return false;
											}
										});
									}
									firstTime = false;
								}
							}
						}
						lastMove = thisMove;
					}
				};
			events[
				touchEvents
					? "touchstart"
					: "pointerover pointermove pointerout MSPointerOver MSPointerMove MSPointerOut"
			] = function (e) {
				if (isTouchEvent(e.originalEvent)) {
					mouse = false;
				}
			};
			$(document).on(getEventsNS(events, eNS));
			mouseDetectionEnabled = true;
		} else if (mouseDetectionEnabled && disable) {
			$(document).off(eNS);
			mouseDetectionEnabled = false;
		}
	}

	function isTouchEvent(e) {
		return !/^(4|mouse)$/.test(e.pointerType);
	}
	// returns a jQuery on() ready object
	function getEventsNS(events, eNS) {
		if (!eNS) {
			eNS = "";
		}
		var eventsNS = {};
		for (var i in events) {
			eventsNS[i.split(" ").join(eNS + " ") + eNS] = events[i];
		}
		return eventsNS;
	}
	$.SmartMenus = function (elm, options) {
		this.$root = $(elm);
		this.opts = options;
		this.rootId = ""; // internal
		this.accessIdPrefix = "";
		this.$subArrow = null;
		this.activatedItems = []; // stores last activated A's for each level
		this.visibleSubMenus = []; // stores visible sub menus UL's (might be in no particular order)
		this.showTimeout = 0;
		this.hideTimeout = 0;
		this.scrollTimeout = 0;
		this.clickActivated = false;
		this.focusActivated = false;
		this.zIndexInc = 0;
		this.idInc = 0;
		this.$firstLink = null; // we'll use these for some tests
		this.$firstSub = null; // at runtime so we'll cache them
		this.disabled = false;
		this.$disableOverlay = null;
		this.$touchScrollingSub = null;
		this.cssTransforms3d =
			"perspective" in elm.style || "webkitPerspective" in elm.style;
		this.wasCollapsible = false;
		this.init();
	};
	$.extend($.SmartMenus, {
		hideAll: function () {
			$.each(menuTrees, function () {
				this.menuHideAll();
			});
		},
		destroy: function () {
			while (menuTrees.length) {
				menuTrees[0].destroy();
			}
			initMouseDetection(true);
		},
		prototype: {
			init: function (refresh) {
				var self = this;
				if (!refresh) {
					menuTrees.push(this);
					this.rootId = (new Date().getTime() + Math.random() + "").replace(
						/\D/g,
						""
					);
					this.accessIdPrefix = "sm-" + this.rootId + "-";
					if (this.$root.hasClass("sm-rtl")) {
						this.opts.rightToLeftSubMenus = true;
					}
					// init root (main menu)
					var eNS = ".smartmenus";
					this.$root
						.data("smartmenus", this)
						.attr("data-smartmenus-id", this.rootId)
						.dataSM("level", 1)
						.on(
							getEventsNS(
								{
									"mouseover focusin": $.proxy(this.rootOver, this),
									"mouseout focusout": $.proxy(this.rootOut, this),
									keydown: $.proxy(this.rootKeyDown, this)
								},
								eNS
							)
						)
						.on(
							getEventsNS(
								{
									mouseenter: $.proxy(this.itemEnter, this),
									mouseleave: $.proxy(this.itemLeave, this),
									mousedown: $.proxy(this.itemDown, this),
									focus: $.proxy(this.itemFocus, this),
									blur: $.proxy(this.itemBlur, this),
									click: $.proxy(this.itemClick, this)
								},
								eNS
							),
							"a"
						);
					// hide menus on tap or click outside the root UL
					eNS += this.rootId;
					if (this.opts.hideOnClick) {
						$(document).on(
							getEventsNS(
								{
									touchstart: $.proxy(this.docTouchStart, this),
									touchmove: $.proxy(this.docTouchMove, this),
									touchend: $.proxy(this.docTouchEnd, this),
									// for Opera Mobile < 11.5, webOS browser, etc. we'll check click too
									click: $.proxy(this.docClick, this)
								},
								eNS
							)
						);
					}
					// hide sub menus on resize
					$(window).on(
						getEventsNS(
							{ "resize orientationchange": $.proxy(this.winResize, this) },
							eNS
						)
					);
					if (this.opts.subIndicators) {
						this.$subArrow = $("<span/>").addClass("sub-arrow");
						if (this.opts.subIndicatorsText) {
							this.$subArrow.html(this.opts.subIndicatorsText);
						}
					}
					// make sure mouse detection is enabled
					initMouseDetection();
				}
				// init sub menus
				this.$firstSub = this.$root
					.find("ul")
					.each(function () {
						self.menuInit($(this));
					})
					.eq(0);
				this.$firstLink = this.$root.find("a").eq(0);
				// find current item
				if (this.opts.markCurrentItem) {
					var reDefaultDoc = /(index|default)\.[^#\?\/]*/i,
						reHash = /#.*/,
						locHref = window.location.href.replace(reDefaultDoc, ""),
						locHrefNoHash = locHref.replace(reHash, "");
					this.$root.find("a:not(.mega-menu a)").each(function () {
						var href = this.href.replace(reDefaultDoc, ""),
							$this = $(this);
						if (href == locHref || href == locHrefNoHash) {
							$this.addClass("current");
							if (self.opts.markCurrentTree) {
								$this
									.parentsUntil("[data-smartmenus-id]", "ul")
									.each(function () {
										$(this)
											.dataSM("parent-a")
											.addClass("current");
									});
							}
						}
					});
				}
				// save initial state
				this.wasCollapsible = this.isCollapsible();
			},
			destroy: function (refresh) {
				if (!refresh) {
					var eNS = ".smartmenus";
					this.$root
						.removeData("smartmenus")
						.removeAttr("data-smartmenus-id")
						.removeDataSM("level")
						.off(eNS);
					eNS += this.rootId;
					$(document).off(eNS);
					$(window).off(eNS);
					if (this.opts.subIndicators) {
						this.$subArrow = null;
					}
				}
				this.menuHideAll();
				var self = this;
				this.$root
					.find("ul")
					.each(function () {
						var $this = $(this);
						if ($this.dataSM("scroll-arrows")) {
							$this.dataSM("scroll-arrows").remove();
						}
						if ($this.dataSM("shown-before")) {
							if (self.opts.subMenusMinWidth || self.opts.subMenusMaxWidth) {
								$this
									.css({ width: "", minWidth: "", maxWidth: "" })
									.removeClass("sm-nowrap");
							}
							if ($this.dataSM("scroll-arrows")) {
								$this.dataSM("scroll-arrows").remove();
							}
							$this.css({
								zIndex: "",
								top: "",
								left: "",
								marginLeft: "",
								marginTop: "",
								display: ""
							});
						}
						if (($this.attr("id") || "").indexOf(self.accessIdPrefix) == 0) {
							$this.removeAttr("id");
						}
					})
					.removeDataSM("in-mega")
					.removeDataSM("shown-before")
					.removeDataSM("scroll-arrows")
					.removeDataSM("parent-a")
					.removeDataSM("level")
					.removeDataSM("beforefirstshowfired")
					.removeAttr("role")
					.removeAttr("aria-hidden")
					.removeAttr("aria-labelledby")
					.removeAttr("aria-expanded");
				this.$root
					.find("a.has-submenu")
					.each(function () {
						var $this = $(this);
						if ($this.attr("id").indexOf(self.accessIdPrefix) == 0) {
							$this.removeAttr("id");
						}
					})
					.removeClass("has-submenu")
					.removeDataSM("sub")
					.removeAttr("aria-haspopup")
					.removeAttr("aria-controls")
					.removeAttr("aria-expanded")
					.closest("li")
					.removeDataSM("sub");
				if (this.opts.subIndicators) {
					this.$root.find("span.sub-arrow").remove();
				}
				if (this.opts.markCurrentItem) {
					this.$root.find("a.current").removeClass("current");
				}
				if (!refresh) {
					this.$root = null;
					this.$firstLink = null;
					this.$firstSub = null;
					if (this.$disableOverlay) {
						this.$disableOverlay.remove();
						this.$disableOverlay = null;
					}
					menuTrees.splice($.inArray(this, menuTrees), 1);
				}
			},
			disable: function (noOverlay) {
				if (!this.disabled) {
					this.menuHideAll();
					// display overlay over the menu to prevent interaction
					if (!noOverlay && !this.opts.isPopup && this.$root.is(":visible")) {
						var pos = this.$root.offset();
						this.$disableOverlay = $('<div class="sm-jquery-disable-overlay"/>')
							.css({
								position: "absolute",
								top: pos.top,
								left: pos.left,
								width: this.$root.outerWidth(),
								height: this.$root.outerHeight(),
								zIndex: this.getStartZIndex(true),
								opacity: 0
							})
							.appendTo(document.body);
					}
					this.disabled = true;
				}
			},
			docClick: function (e) {
				if (this.$touchScrollingSub) {
					this.$touchScrollingSub = null;
					return;
				}
				// hide on any click outside the menu or on a menu link
				if (
					(this.visibleSubMenus.length &&
						!$.contains(this.$root[0], e.target)) ||
					$(e.target).closest("a").length
				) {
					this.menuHideAll();
				}
			},
			docTouchEnd: function (e) {
				if (!this.lastTouch) {
					return;
				}
				if (
					this.visibleSubMenus.length &&
					(this.lastTouch.x2 === undefined ||
						this.lastTouch.x1 == this.lastTouch.x2) &&
					(this.lastTouch.y2 === undefined ||
						this.lastTouch.y1 == this.lastTouch.y2) &&
					(!this.lastTouch.target ||
						!$.contains(this.$root[0], this.lastTouch.target))
				) {
					if (this.hideTimeout) {
						clearTimeout(this.hideTimeout);
						this.hideTimeout = 0;
					}
					// hide with a delay to prevent triggering accidental unwanted click on some page element
					var self = this;
					this.hideTimeout = setTimeout(function () {
						self.menuHideAll();
					}, 350);
				}
				this.lastTouch = null;
			},
			docTouchMove: function (e) {
				if (!this.lastTouch) {
					return;
				}
				var touchPoint = e.originalEvent.touches[0];
				this.lastTouch.x2 = touchPoint.pageX;
				this.lastTouch.y2 = touchPoint.pageY;
			},
			docTouchStart: function (e) {
				var touchPoint = e.originalEvent.touches[0];
				this.lastTouch = {
					x1: touchPoint.pageX,
					y1: touchPoint.pageY,
					target: touchPoint.target
				};
			},
			enable: function () {
				if (this.disabled) {
					if (this.$disableOverlay) {
						this.$disableOverlay.remove();
						this.$disableOverlay = null;
					}
					this.disabled = false;
				}
			},
			getClosestMenu: function (elm) {
				var $closestMenu = $(elm).closest("ul");
				while ($closestMenu.dataSM("in-mega")) {
					$closestMenu = $closestMenu.parent().closest("ul");
				}
				return $closestMenu[0] || null;
			},
			getHeight: function ($elm) {
				return this.getOffset($elm, true);
			},
			// returns precise width/height float values
			getOffset: function ($elm, height) {
				var old;
				if ($elm.css("display") == "none") {
					old = {
						position: $elm[0].style.position,
						visibility: $elm[0].style.visibility
					};
					$elm.css({ position: "absolute", visibility: "hidden" }).show();
				}
				var box =
					$elm[0].getBoundingClientRect && $elm[0].getBoundingClientRect(),
					val =
						box &&
						(height
							? box.height || box.bottom - box.top
							: box.width || box.right - box.left);
				if (!val && val !== 0) {
					val = height ? $elm[0].offsetHeight : $elm[0].offsetWidth;
				}
				if (old) {
					$elm.hide().css(old);
				}
				return val;
			},
			getStartZIndex: function (root) {
				var zIndex = parseInt(
					this[root ? "$root" : "$firstSub"].css("z-index")
				);
				if (!root && isNaN(zIndex)) {
					zIndex = parseInt(this.$root.css("z-index"));
				}
				return !isNaN(zIndex) ? zIndex : 1;
			},
			getTouchPoint: function (e) {
				return (
					(e.touches && e.touches[0]) ||
					(e.changedTouches && e.changedTouches[0]) ||
					e
				);
			},
			getViewport: function (height) {
				var name = height ? "Height" : "Width",
					val = document.documentElement["client" + name],
					val2 = window["inner" + name];
				if (val2) {
					val = Math.min(val, val2);
				}
				return val;
			},
			getViewportHeight: function () {
				return this.getViewport(true);
			},
			getViewportWidth: function () {
				return this.getViewport();
			},
			getWidth: function ($elm) {
				return this.getOffset($elm);
			},
			handleEvents: function () {
				return !this.disabled && this.isCSSOn();
			},
			handleItemEvents: function ($a) {
				return this.handleEvents() && !this.isLinkInMegaMenu($a);
			},
			isCollapsible: function () {
				return this.$firstSub.css("position") == "static";
			},
			isCSSOn: function () {
				return this.$firstLink.css("display") != "inline";
			},
			isFixed: function () {
				var isFixed = this.$root.css("position") == "fixed";
				if (!isFixed) {
					this.$root.parentsUntil("body").each(function () {
						if ($(this).css("position") == "fixed") {
							isFixed = true;
							return false;
						}
					});
				}
				return isFixed;
			},
			isLinkInMegaMenu: function ($a) {
				return $(this.getClosestMenu($a[0])).hasClass("mega-menu");
			},
			isTouchMode: function () {
				return !mouse || this.opts.noMouseOver || this.isCollapsible();
			},
			itemActivate: function ($a, hideDeeperSubs) {
				var $ul = $a.closest("ul"),
					level = $ul.dataSM("level");
				// if for some reason the parent item is not activated (e.g. this is an API call to activate the item), activate all parent items first
				if (
					level > 1 &&
					(!this.activatedItems[level - 2] ||
						this.activatedItems[level - 2][0] != $ul.dataSM("parent-a")[0])
				) {
					var self = this;
					$(
						$ul
							.parentsUntil("[data-smartmenus-id]", "ul")
							.get()
							.reverse()
					)
						.add($ul)
						.each(function () {
							self.itemActivate($(this).dataSM("parent-a"));
						});
				}
				// hide any visible deeper level sub menus
				if (!this.isCollapsible() || hideDeeperSubs) {
					this.menuHideSubMenus(
						!this.activatedItems[level - 1] ||
							this.activatedItems[level - 1][0] != $a[0]
							? level - 1
							: level
					);
				}
				// save new active item for this level
				this.activatedItems[level - 1] = $a;
				if (this.$root.triggerHandler("activate.smapi", $a[0]) === false) {
					return;
				}
				// show the sub menu if this item has one
				var $sub = $a.dataSM("sub");
				if (
					$sub &&
					(this.isTouchMode() || !this.opts.showOnClick || this.clickActivated)
				) {
					this.menuShow($sub);
				}
			},
			itemBlur: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				this.$root.triggerHandler("blur.smapi", $a[0]);
			},
			itemClick: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				if (
					this.$touchScrollingSub &&
					this.$touchScrollingSub[0] == $a.closest("ul")[0]
				) {
					this.$touchScrollingSub = null;
					e.stopPropagation();
					return false;
				}
				if (this.$root.triggerHandler("click.smapi", $a[0]) === false) {
					return false;
				}
				var $sub = $a.dataSM("sub"),
					firstLevelSub = $sub ? $sub.dataSM("level") == 2 : false;
				if ($sub) {
					var subArrowClicked = $(e.target).is(".sub-arrow"),
						collapsible = this.isCollapsible(),
						behaviorToggle = /toggle$/.test(this.opts.collapsibleBehavior),
						behaviorLink = /link$/.test(this.opts.collapsibleBehavior),
						behaviorAccordion = /^accordion/.test(
							this.opts.collapsibleBehavior
						);
					// if the sub is hidden, try to show it
					if (!$sub.is(":visible")) {
						if (!behaviorLink || !collapsible || subArrowClicked) {
							if (this.opts.showOnClick && firstLevelSub) {
								this.clickActivated = true;
							}
							// try to activate the item and show the sub
							this.itemActivate($a, behaviorAccordion);
							// if "itemActivate" showed the sub, prevent the click so that the link is not loaded
							// if it couldn't show it, then the sub menus are disabled with an !important declaration (e.g. via mobile styles) so let the link get loaded
							if ($sub.is(":visible")) {
								this.focusActivated = true;
								return false;
							}
						}
						// if the sub is visible and we are in collapsible mode
					} else if (collapsible && (behaviorToggle || subArrowClicked)) {
						this.itemActivate($a, behaviorAccordion);
						this.menuHide($sub);
						if (behaviorToggle) {
							this.focusActivated = false;
						}
						return false;
					}
				}
				if (
					(this.opts.showOnClick && firstLevelSub) ||
					$a.hasClass("disabled") ||
					this.$root.triggerHandler("select.smapi", $a[0]) === false
				) {
					return false;
				}
			},
			itemDown: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				$a.dataSM("mousedown", true);
			},
			itemEnter: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				if (!this.isTouchMode()) {
					if (this.showTimeout) {
						clearTimeout(this.showTimeout);
						this.showTimeout = 0;
					}
					var self = this;
					this.showTimeout = setTimeout(
						function () {
							self.itemActivate($a);
						},
						this.opts.showOnClick && $a.closest("ul").dataSM("level") == 1
							? 1
							: this.opts.showTimeout
					);
				}
				this.$root.triggerHandler("mouseenter.smapi", $a[0]);
			},
			itemFocus: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				// fix (the mousedown check): in some browsers a tap/click produces consecutive focus + click events so we don't need to activate the item on focus
				if (
					this.focusActivated &&
					(!this.isTouchMode() || !$a.dataSM("mousedown")) &&
					(!this.activatedItems.length ||
						this.activatedItems[this.activatedItems.length - 1][0] != $a[0])
				) {
					this.itemActivate($a, true);
				}
				this.$root.triggerHandler("focus.smapi", $a[0]);
			},
			itemLeave: function (e) {
				var $a = $(e.currentTarget);
				if (!this.handleItemEvents($a)) {
					return;
				}
				if (!this.isTouchMode()) {
					$a[0].blur();
					if (this.showTimeout) {
						clearTimeout(this.showTimeout);
						this.showTimeout = 0;
					}
				}
				$a.removeDataSM("mousedown");
				this.$root.triggerHandler("mouseleave.smapi", $a[0]);
			},
			menuHide: function ($sub) {
				if (this.$root.triggerHandler("beforehide.smapi", $sub[0]) === false) {
					return;
				}
				if (canAnimate) {
					$sub.stop(true, true);
				}
				if ($sub.css("display") != "none") {
					var complete = function () {
						// unset z-index
						$sub.css("z-index", "");
					};
					// if sub is collapsible (mobile view)
					if (this.isCollapsible()) {
						if (canAnimate && this.opts.collapsibleHideFunction) {
							this.opts.collapsibleHideFunction.call(this, $sub, complete);
						} else {
							$sub.hide(this.opts.collapsibleHideDuration, complete);
						}
					} else {
						if (canAnimate && this.opts.hideFunction) {
							this.opts.hideFunction.call(this, $sub, complete);
						} else {
							$sub.hide(this.opts.hideDuration, complete);
						}
					}
					// deactivate scrolling if it is activated for this sub
					if ($sub.dataSM("scroll")) {
						this.menuScrollStop($sub);
						$sub
							.css({
								"touch-action": "",
								"-ms-touch-action": "",
								"-webkit-transform": "",
								transform: ""
							})
							.off(".smartmenus_scroll")
							.removeDataSM("scroll")
							.dataSM("scroll-arrows")
							.hide();
					}
					// unhighlight parent item + accessibility
					$sub
						.dataSM("parent-a")
						.removeClass("highlighted")
						.attr("aria-expanded", "false");
					$sub.attr({
						"aria-expanded": "false",
						"aria-hidden": "true"
					});
					var level = $sub.dataSM("level");
					this.activatedItems.splice(level - 1, 1);
					this.visibleSubMenus.splice($.inArray($sub, this.visibleSubMenus), 1);
					this.$root.triggerHandler("hide.smapi", $sub[0]);
				}
			},
			menuHideAll: function () {
				if (this.showTimeout) {
					clearTimeout(this.showTimeout);
					this.showTimeout = 0;
				}
				// hide all subs
				// if it's a popup, this.visibleSubMenus[0] is the root UL
				var level = this.opts.isPopup ? 1 : 0;
				for (var i = this.visibleSubMenus.length - 1; i >= level; i--) {
					this.menuHide(this.visibleSubMenus[i]);
				}
				// hide root if it's popup
				if (this.opts.isPopup) {
					if (canAnimate) {
						this.$root.stop(true, true);
					}
					if (this.$root.is(":visible")) {
						if (canAnimate && this.opts.hideFunction) {
							this.opts.hideFunction.call(this, this.$root);
						} else {
							this.$root.hide(this.opts.hideDuration);
						}
					}
				}
				this.activatedItems = [];
				this.visibleSubMenus = [];
				this.clickActivated = false;
				this.focusActivated = false;
				// reset z-index increment
				this.zIndexInc = 0;
				this.$root.triggerHandler("hideAll.smapi");
			},
			menuHideSubMenus: function (level) {
				for (var i = this.activatedItems.length - 1; i >= level; i--) {
					var $sub = this.activatedItems[i].dataSM("sub");
					if ($sub) {
						this.menuHide($sub);
					}
				}
			},
			menuInit: function ($ul) {
				if (!$ul.dataSM("in-mega")) {
					// mark UL's in mega drop downs (if any) so we can neglect them
					if ($ul.hasClass("mega-menu")) {
						$ul.find("ul").dataSM("in-mega", true);
					}
					// get level (much faster than, for example, using parentsUntil)
					var level = 2,
						par = $ul[0];
					while ((par = par.parentNode.parentNode) != this.$root[0]) {
						level++;
					}
					// cache stuff for quick access
					var $a = $ul.prevAll("a").eq(-1);
					// if the link is nested (e.g. in a heading)
					if (!$a.length) {
						$a = $ul
							.prevAll()
							.find("a")
							.eq(-1);
					}
					$a.addClass("has-submenu").dataSM("sub", $ul);
					$ul
						.dataSM("parent-a", $a)
						.dataSM("level", level)
						.parent()
						.dataSM("sub", $ul);
					// accessibility
					var aId = $a.attr("id") || this.accessIdPrefix + ++this.idInc,
						ulId = $ul.attr("id") || this.accessIdPrefix + ++this.idInc;
					$a.attr({
						id: aId,
						"aria-haspopup": "true",
						"aria-controls": ulId,
						"aria-expanded": "false"
					});
					$ul.attr({
						id: ulId,
						role: "group",
						"aria-hidden": "true",
						"aria-labelledby": aId,
						"aria-expanded": "false"
					});
					// add sub indicator to parent item
					if (this.opts.subIndicators) {
						$a[this.opts.subIndicatorsPos](this.$subArrow.clone());
					}
				}
			},
			menuPosition: function ($sub) {
				var $a = $sub.dataSM("parent-a"),
					$li = $a.closest("li"),
					$ul = $li.parent(),
					level = $sub.dataSM("level"),
					subW = this.getWidth($sub),
					subH = this.getHeight($sub),
					itemOffset = $a.offset(),
					itemX = itemOffset.left,
					itemY = itemOffset.top,
					itemW = this.getWidth($a),
					itemH = this.getHeight($a),
					$win = $(window),
					winX = $win.scrollLeft(),
					winY = $win.scrollTop(),
					winW = this.getViewportWidth(),
					winH = this.getViewportHeight(),
					horizontalParent =
						$ul.parent().is("[data-sm-horizontal-sub]") ||
						(level == 2 && !$ul.hasClass("sm-vertical")),
					rightToLeft =
						(this.opts.rightToLeftSubMenus && !$li.is(".nav-sm-reverse")) ||
						(!this.opts.rightToLeftSubMenus && $li.is(".nav-sm-reverse")),
					subOffsetX =
						level == 2
							? this.opts.mainMenuSubOffsetX
							: this.opts.subMenusSubOffsetX,
					subOffsetY =
						level == 2
							? this.opts.mainMenuSubOffsetY
							: this.opts.subMenusSubOffsetY,
					x,
					y;
				if (horizontalParent) {
					x = rightToLeft ? itemW - subW - subOffsetX : subOffsetX;
					y = this.opts.bottomToTopSubMenus
						? -subH - subOffsetY
						: itemH + subOffsetY;
				} else {
					x = rightToLeft ? subOffsetX - subW : itemW - subOffsetX;
					y = this.opts.bottomToTopSubMenus
						? itemH - subOffsetY - subH
						: subOffsetY;
				}
				if (this.opts.keepInViewport) {
					var absX = itemX + x,
						absY = itemY + y;
					if (rightToLeft && absX < winX) {
						x = horizontalParent ? winX - absX + x : itemW - subOffsetX;
					} else if (!rightToLeft && absX + subW > winX + winW) {
						x = horizontalParent
							? winX + winW - subW - absX + x
							: subOffsetX - subW;
					}
					if (!horizontalParent) {
						if (subH < winH && absY + subH > winY + winH) {
							y += winY + winH - subH - absY;
						} else if (subH >= winH || absY < winY) {
							y += winY - absY;
						}
					}
					// do we need scrolling?
					// 0.49 used for better precision when dealing with float values
					if (
						(horizontalParent &&
							(absY + subH > winY + winH + 0.49 || absY < winY)) ||
						(!horizontalParent && subH > winH + 0.49)
					) {
						var self = this;
						if (!$sub.dataSM("scroll-arrows")) {
							$sub.dataSM(
								"scroll-arrows",
								$([
									$(
										'<span class="scroll-up"><span class="scroll-up-arrow"></span></span>'
									)[0],
									$(
										'<span class="scroll-down"><span class="scroll-down-arrow"></span></span>'
									)[0]
								])
									.on({
										mouseenter: function () {
											$sub.dataSM("scroll").up = $(this).hasClass("scroll-up");
											self.menuScroll($sub);
										},
										mouseleave: function (e) {
											self.menuScrollStop($sub);
											self.menuScrollOut($sub, e);
										},
										"mousewheel DOMMouseScroll": function (e) {
											e.preventDefault();
										}
									})
									.insertAfter($sub)
							);
						}
						// bind scroll events and save scroll data for this sub
						var eNS = ".smartmenus_scroll";
						$sub
							.dataSM("scroll", {
								y: this.cssTransforms3d ? 0 : y - itemH,
								step: 1,
								// cache stuff for faster recalcs later
								itemH: itemH,
								subH: subH,
								arrowDownH: this.getHeight($sub.dataSM("scroll-arrows").eq(1))
							})
							.on(
								getEventsNS(
									{
										mouseover: function (e) {
											self.menuScrollOver($sub, e);
										},
										mouseout: function (e) {
											self.menuScrollOut($sub, e);
										},
										"mousewheel DOMMouseScroll": function (e) {
											self.menuScrollMousewheel($sub, e);
										}
									},
									eNS
								)
							)
							.dataSM("scroll-arrows")
							.css({
								top: "auto",
								left: "0",
								marginLeft: x + (parseInt($sub.css("border-left-width")) || 0),
								width:
									subW -
									(parseInt($sub.css("border-left-width")) || 0) -
									(parseInt($sub.css("border-right-width")) || 0),
								zIndex: $sub.css("z-index")
							})
							.eq(horizontalParent && this.opts.bottomToTopSubMenus ? 0 : 1)
							.show();
						// when a menu tree is fixed positioned we allow scrolling via touch too
						// since there is no other way to access such long sub menus if no mouse is present
						if (this.isFixed()) {
							var events = {};
							events[
								touchEvents
									? "touchstart touchmove touchend"
									: "pointerdown pointermove pointerup MSPointerDown MSPointerMove MSPointerUp"
							] = function (e) {
								self.menuScrollTouch($sub, e);
							};
							$sub
								.css({ "touch-action": "none", "-ms-touch-action": "none" })
								.on(getEventsNS(events, eNS));
						}
					}
				}
				$sub.css({
					top: "auto",
					left: "0",
					marginLeft: x,
					marginTop: y - itemH
				});
			},
			menuScroll: function ($sub, once, step) {
				var data = $sub.dataSM("scroll"),
					$arrows = $sub.dataSM("scroll-arrows"),
					end = data.up ? data.upEnd : data.downEnd,
					diff;
				if (!once && data.momentum) {
					data.momentum *= 0.92;
					diff = data.momentum;
					if (diff < 0.5) {
						this.menuScrollStop($sub);
						return;
					}
				} else {
					diff =
						step ||
						(once || !this.opts.scrollAccelerate
							? this.opts.scrollStep
							: Math.floor(data.step));
				}
				// hide any visible deeper level sub menus
				var level = $sub.dataSM("level");
				if (
					this.activatedItems[level - 1] &&
					this.activatedItems[level - 1].dataSM("sub") &&
					this.activatedItems[level - 1].dataSM("sub").is(":visible")
				) {
					this.menuHideSubMenus(level - 1);
				}
				data.y =
					(data.up && end <= data.y) || (!data.up && end >= data.y)
						? data.y
						: Math.abs(end - data.y) > diff
							? data.y + (data.up ? diff : -diff)
							: end;
				$sub.css(
					this.cssTransforms3d
						? {
							"-webkit-transform": "translate3d(0, " + data.y + "px, 0)",
							transform: "translate3d(0, " + data.y + "px, 0)"
						}
						: { marginTop: data.y }
				);
				// show opposite arrow if appropriate
				if (
					mouse &&
					((data.up && data.y > data.downEnd) ||
						(!data.up && data.y < data.upEnd))
				) {
					$arrows.eq(data.up ? 1 : 0).show();
				}
				// if we've reached the end
				if (data.y == end) {
					if (mouse) {
						$arrows.eq(data.up ? 0 : 1).hide();
					}
					this.menuScrollStop($sub);
				} else if (!once) {
					if (this.opts.scrollAccelerate && data.step < this.opts.scrollStep) {
						data.step += 0.2;
					}
					var self = this;
					this.scrollTimeout = requestAnimationFrame(function () {
						self.menuScroll($sub);
					});
				}
			},
			menuScrollMousewheel: function ($sub, e) {
				if (this.getClosestMenu(e.target) == $sub[0]) {
					e = e.originalEvent;
					var up = (e.wheelDelta || -e.detail) > 0;
					if (
						$sub
							.dataSM("scroll-arrows")
							.eq(up ? 0 : 1)
							.is(":visible")
					) {
						$sub.dataSM("scroll").up = up;
						this.menuScroll($sub, true);
					}
				}
				e.preventDefault();
			},
			menuScrollOut: function ($sub, e) {
				if (mouse) {
					if (
						!/^scroll-(up|down)/.test((e.relatedTarget || "").className) &&
						(($sub[0] != e.relatedTarget &&
							!$.contains($sub[0], e.relatedTarget)) ||
							this.getClosestMenu(e.relatedTarget) != $sub[0])
					) {
						$sub.dataSM("scroll-arrows").css("visibility", "hidden");
					}
				}
			},
			menuScrollOver: function ($sub, e) {
				if (mouse) {
					if (
						!/^scroll-(up|down)/.test(e.target.className) &&
						this.getClosestMenu(e.target) == $sub[0]
					) {
						this.menuScrollRefreshData($sub);
						var data = $sub.dataSM("scroll"),
							upEnd =
								$(window).scrollTop() -
								$sub.dataSM("parent-a").offset().top -
								data.itemH;
						$sub
							.dataSM("scroll-arrows")
							.eq(0)
							.css("margin-top", upEnd)
							.end()
							.eq(1)
							.css(
								"margin-top",
								upEnd + this.getViewportHeight() - data.arrowDownH
							)
							.end()
							.css("visibility", "visible");
					}
				}
			},
			menuScrollRefreshData: function ($sub) {
				var data = $sub.dataSM("scroll"),
					upEnd =
						$(window).scrollTop() -
						$sub.dataSM("parent-a").offset().top -
						data.itemH;
				if (this.cssTransforms3d) {
					upEnd = -(parseFloat($sub.css("margin-top")) - upEnd);
				}
				$.extend(data, {
					upEnd: upEnd,
					downEnd: upEnd + this.getViewportHeight() - data.subH
				});
			},
			menuScrollStop: function ($sub) {
				if (this.scrollTimeout) {
					cancelAnimationFrame(this.scrollTimeout);
					this.scrollTimeout = 0;
					$sub.dataSM("scroll").step = 1;
					return true;
				}
			},
			menuScrollTouch: function ($sub, e) {
				e = e.originalEvent;
				if (isTouchEvent(e)) {
					var touchPoint = this.getTouchPoint(e);
					// neglect event if we touched a visible deeper level sub menu
					if (this.getClosestMenu(touchPoint.target) == $sub[0]) {
						var data = $sub.dataSM("scroll");
						if (/(start|down)$/i.test(e.type)) {
							if (this.menuScrollStop($sub)) {
								// if we were scrolling, just stop and don't activate any link on the first touch
								e.preventDefault();
								this.$touchScrollingSub = $sub;
							} else {
								this.$touchScrollingSub = null;
							}
							// update scroll data since the user might have zoomed, etc.
							this.menuScrollRefreshData($sub);
							// extend it with the touch properties
							$.extend(data, {
								touchStartY: touchPoint.pageY,
								touchStartTime: e.timeStamp
							});
						} else if (/move$/i.test(e.type)) {
							var prevY =
								data.touchY !== undefined ? data.touchY : data.touchStartY;
							if (prevY !== undefined && prevY != touchPoint.pageY) {
								this.$touchScrollingSub = $sub;
								var up = prevY < touchPoint.pageY;
								// changed direction? reset...
								if (data.up !== undefined && data.up != up) {
									$.extend(data, {
										touchStartY: touchPoint.pageY,
										touchStartTime: e.timeStamp
									});
								}
								$.extend(data, {
									up: up,
									touchY: touchPoint.pageY
								});
								this.menuScroll($sub, true, Math.abs(touchPoint.pageY - prevY));
							}
							e.preventDefault();
						} else {
							// touchend/pointerup
							if (data.touchY !== undefined) {
								if (
									(data.momentum =
										Math.pow(
											Math.abs(touchPoint.pageY - data.touchStartY) /
											(e.timeStamp - data.touchStartTime),
											2
										) * 15)
								) {
									this.menuScrollStop($sub);
									this.menuScroll($sub);
									e.preventDefault();
								}
								delete data.touchY;
							}
						}
					}
				}
			},
			menuShow: function ($sub) {
				if (!$sub.dataSM("beforefirstshowfired")) {
					$sub.dataSM("beforefirstshowfired", true);
					if (
						this.$root.triggerHandler("beforefirstshow.smapi", $sub[0]) ===
						false
					) {
						return;
					}
				}
				if (this.$root.triggerHandler("beforeshow.smapi", $sub[0]) === false) {
					return;
				}
				$sub.dataSM("shown-before", true);
				if (canAnimate) {
					$sub.stop(true, true);
				}
				if (!$sub.is(":visible")) {
					// highlight parent item
					var $a = $sub.dataSM("parent-a"),
						collapsible = this.isCollapsible();
					if (this.opts.keepHighlighted || collapsible) {
						$a.addClass("highlighted");
					}
					if (collapsible) {
						$sub
							.removeClass("sm-nowrap")
							.css({
								zIndex: "",
								width: "auto",
								minWidth: "",
								maxWidth: "",
								top: "",
								left: "",
								marginLeft: "",
								marginTop: ""
							});
					} else {
						// set z-index
						$sub.css(
							"z-index",
							(this.zIndexInc = (this.zIndexInc || this.getStartZIndex()) + 1)
						);
						// min/max-width fix - no way to rely purely on CSS as all UL's are nested
						if (this.opts.subMenusMinWidth || this.opts.subMenusMaxWidth) {
							$sub
								.css({ width: "auto", minWidth: "", maxWidth: "" })
								.addClass("sm-nowrap");
							if (this.opts.subMenusMinWidth) {
								$sub.css("min-width", this.opts.subMenusMinWidth);
							}
							if (this.opts.subMenusMaxWidth) {
								var noMaxWidth = this.getWidth($sub);
								$sub.css("max-width", this.opts.subMenusMaxWidth);
								if (noMaxWidth > this.getWidth($sub)) {
									$sub
										.removeClass("sm-nowrap")
										.css("width", this.opts.subMenusMaxWidth);
								}
							}
						}
						this.menuPosition($sub);
					}
					var complete = function () {
						// fix: "overflow: hidden;" is not reset on animation complete in jQuery < 1.9.0 in Chrome when global "box-sizing: border-box;" is used
						$sub.css("overflow", "");
					};
					// if sub is collapsible (mobile view)
					if (collapsible) {
						if (canAnimate && this.opts.collapsibleShowFunction) {
							this.opts.collapsibleShowFunction.call(this, $sub, complete);
						} else {
							$sub.show(this.opts.collapsibleShowDuration, complete);
						}
					} else {
						if (canAnimate && this.opts.showFunction) {
							this.opts.showFunction.call(this, $sub, complete);
						} else {
							$sub.show(this.opts.showDuration, complete);
						}
					}
					// accessibility
					$a.attr("aria-expanded", "true");
					$sub.attr({
						"aria-expanded": "true",
						"aria-hidden": "false"
					});
					// store sub menu in visible array
					this.visibleSubMenus.push($sub);
					this.$root.triggerHandler("show.smapi", $sub[0]);
				}
			},
			popupHide: function (noHideTimeout) {
				if (this.hideTimeout) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = 0;
				}
				var self = this;
				this.hideTimeout = setTimeout(
					function () {
						self.menuHideAll();
					},
					noHideTimeout ? 1 : this.opts.hideTimeout
				);
			},
			popupShow: function (left, top) {
				if (!this.opts.isPopup) {
					alert(
						'SmartMenus jQuery Error:\n\nIf you want to show this menu via the "popupShow" method, set the isPopup:true option.'
					);
					return;
				}
				if (this.hideTimeout) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = 0;
				}
				this.$root.dataSM("shown-before", true);
				if (canAnimate) {
					this.$root.stop(true, true);
				}
				if (!this.$root.is(":visible")) {
					this.$root.css({ left: left, top: top });
					// show menu
					var self = this,
						complete = function () {
							self.$root.css("overflow", "");
						};
					if (canAnimate && this.opts.showFunction) {
						this.opts.showFunction.call(this, this.$root, complete);
					} else {
						this.$root.show(this.opts.showDuration, complete);
					}
					this.visibleSubMenus[0] = this.$root;
				}
			},
			refresh: function () {
				this.destroy(true);
				this.init(true);
			},
			rootKeyDown: function (e) {
				if (!this.handleEvents()) {
					return;
				}
				switch (e.keyCode) {
					case 27: // reset on Esc
						var $activeTopItem = this.activatedItems[0];
						if ($activeTopItem) {
							this.menuHideAll();
							$activeTopItem[0].focus();
							var $sub = $activeTopItem.dataSM("sub");
							if ($sub) {
								this.menuHide($sub);
							}
						}
						break;
					case 32: // activate item's sub on Space
						var $target = $(e.target);
						if ($target.is("a") && this.handleItemEvents($target)) {
							var $sub = $target.dataSM("sub");
							if ($sub && !$sub.is(":visible")) {
								this.itemClick({ currentTarget: e.target });
								e.preventDefault();
							}
						}
						break;
				}
			},
			rootOut: function (e) {
				if (
					!this.handleEvents() ||
					this.isTouchMode() ||
					e.target == this.$root[0]
				) {
					return;
				}
				if (this.hideTimeout) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = 0;
				}
				if (!this.opts.showOnClick || !this.opts.hideOnClick) {
					var self = this;
					this.hideTimeout = setTimeout(function () {
						self.menuHideAll();
					}, this.opts.hideTimeout);
				}
			},
			rootOver: function (e) {
				if (
					!this.handleEvents() ||
					this.isTouchMode() ||
					e.target == this.$root[0]
				) {
					return;
				}
				if (this.hideTimeout) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = 0;
				}
			},
			winResize: function (e) {
				if (!this.handleEvents()) {
					// we still need to resize the disable overlay if it's visible
					if (this.$disableOverlay) {
						var pos = this.$root.offset();
						this.$disableOverlay.css({
							top: pos.top,
							left: pos.left,
							width: this.$root.outerWidth(),
							height: this.$root.outerHeight()
						});
					}
					return;
				}
				// hide sub menus on resize - on mobile do it only on orientation change
				if (
					!("onorientationchange" in window) ||
					e.type == "orientationchange"
				) {
					var collapsible = this.isCollapsible();
					// if it was collapsible before resize and still is, don't do it
					if (!(this.wasCollapsible && collapsible)) {
						if (this.activatedItems.length) {
							this.activatedItems[this.activatedItems.length - 1][0].blur();
						}
						this.menuHideAll();
					}
					this.wasCollapsible = collapsible;
				}
			}
		}
	});
	$.fn.dataSM = function (key, val) {
		if (val) {
			return this.data(key + "_smartmenus", val);
		}
		return this.data(key + "_smartmenus");
	};
	$.fn.removeDataSM = function (key) {
		return this.removeData(key + "_smartmenus");
	};
	$.fn.smartmenus = function (options) {
		if (typeof options == "string") {
			var args = arguments,
				method = options;
			Array.prototype.shift.call(args);
			return this.each(function () {
				var smartmenus = $(this).data("smartmenus");
				if (smartmenus && smartmenus[method]) {
					smartmenus[method].apply(smartmenus, args);
				}
			});
		}
		return this.each(function () {
			// [data-sm-options] attribute on the root UL
			var dataOpts = $(this).data("sm-options") || null;
			if (dataOpts) {
				try {
					dataOpts = eval("(" + dataOpts + ")");
				} catch (e) {
					dataOpts = null;
					alert(
						'ERROR\n\nSmartMenus jQuery init:\nInvalid "data-sm-options" attribute value syntax.'
					);
				}
			}
			new $.SmartMenus(
				this,
				$.extend({}, $.fn.smartmenus.defaults, options, dataOpts)
			);
		});
	};
	// default settings
	$.fn.smartmenus.defaults = {
		isPopup: false, // is this a popup menu (can be shown via the popupShow/popupHide methods) or a permanent menu bar
		mainMenuSubOffsetX: 0, // pixels offset from default position
		mainMenuSubOffsetY: 0, // pixels offset from default position
		subMenusSubOffsetX: 0, // pixels offset from default position
		subMenusSubOffsetY: 0, // pixels offset from default position
		subMenusMinWidth: "10em", // min-width for the sub menus (any CSS unit) - if set, the fixed width set in CSS will be ignored
		subMenusMaxWidth: "20em", // max-width for the sub menus (any CSS unit) - if set, the fixed width set in CSS will be ignored
		subIndicators: true, // create sub menu indicators - creates a SPAN and inserts it in the A
		subIndicatorsPos: "append", // position of the SPAN relative to the menu item content ('append', 'prepend')
		subIndicatorsText: "", // [optionally] add text in the SPAN (e.g. '+') (you may want to check the CSS for the sub indicators too)
		scrollStep: 30, // pixels step when scrolling long sub menus that do not fit in the viewport height
		scrollAccelerate: true, // accelerate scrolling or use a fixed step
		showTimeout: 250, // timeout before showing the sub menus
		hideTimeout: 500, // timeout before hiding the sub menus
		showDuration: 0, // duration for show animation - set to 0 for no animation - matters only if showFunction:null
		showFunction: null, // custom function to use when showing a sub menu (the default is the jQuery 'show')
		// don't forget to call complete() at the end of whatever you do
		// e.g.: function($ul, complete) { $ul.fadeIn(250, complete); }
		hideDuration: 0, // duration for hide animation - set to 0 for no animation - matters only if hideFunction:null
		hideFunction: function ($ul, complete) {
			$ul.fadeOut(200, complete);
		}, // custom function to use when hiding a sub menu (the default is the jQuery 'hide')
		// don't forget to call complete() at the end of whatever you do
		// e.g.: function($ul, complete) { $ul.fadeOut(250, complete); }
		collapsibleShowDuration: 0, // duration for show animation for collapsible sub menus - matters only if collapsibleShowFunction:null
		collapsibleShowFunction: function ($ul, complete) {
			$ul.slideDown(200, complete);
		}, // custom function to use when showing a collapsible sub menu
		// (i.e. when mobile styles are used to make the sub menus collapsible)
		collapsibleHideDuration: 0, // duration for hide animation for collapsible sub menus - matters only if collapsibleHideFunction:null
		collapsibleHideFunction: function ($ul, complete) {
			$ul.slideUp(200, complete);
		}, // custom function to use when hiding a collapsible sub menu
		// (i.e. when mobile styles are used to make the sub menus collapsible)
		showOnClick: false, // show the first-level sub menus onclick instead of onmouseover (i.e. mimic desktop app menus) (matters only for mouse input)
		hideOnClick: true, // hide the sub menus on click/tap anywhere on the page
		noMouseOver: false, // disable sub menus activation onmouseover (i.e. behave like in touch mode - use just mouse clicks) (matters only for mouse input)
		keepInViewport: true, // reposition the sub menus if needed to make sure they always appear inside the viewport
		keepHighlighted: true, // keep all ancestor items of the current sub menu highlighted (adds the 'highlighted' class to the A's)
		markCurrentItem: false, // automatically add the 'current' class to the A element of the item linking to the current URL
		markCurrentTree: true, // add the 'current' class also to the A elements of all ancestor items of the current item
		rightToLeftSubMenus: false, // right to left display of the sub menus (check the CSS for the sub indicators' position)
		bottomToTopSubMenus: false, // bottom to top display of the sub menus
		collapsibleBehavior: "default" // parent items behavior in collapsible (mobile) view ('default', 'toggle', 'link', 'accordion', 'accordion-toggle', 'accordion-link')
		// 'default' - first tap on parent item expands sub, second tap loads its link
		// 'toggle' - the whole parent item acts just as a toggle button for its sub menu (expands/collapses on each tap)
		// 'link' - the parent item acts as a regular item (first tap loads its link), the sub menu can be expanded only via the +/- button
		// 'accordion' - like 'default' but on expand also resets any visible sub menus from deeper levels or other branches
		// 'accordion-toggle' - like 'toggle' but on expand also resets any visible sub menus from deeper levels or other branches
		// 'accordion-link' - like 'link' but on expand also resets any visible sub menus from deeper levels or other branches
	};
	return $;
});

// jcf library select, radio, checkbox modules
// jcf start

/*!
 * JavaScript Custom Forms
 *
 * Copyright 2014-2015 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.1.3
 */

!function(e,t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?module.exports=t(require("jquery")):e.jcf=t(jQuery)}(this,function(e){"use strict";var t=[],s={optionsKey:"jcf",dataKey:"jcf-instance",rtlClass:"jcf-rtl",focusClass:"jcf-focus",pressedClass:"jcf-pressed",disabledClass:"jcf-disabled",hiddenClass:"jcf-hidden",resetAppearanceClass:"jcf-reset-appearance",unselectableClass:"jcf-unselectable"},i="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,n=/Windows Phone/.test(navigator.userAgent);s.isMobileDevice=!!(i||n);var o=/(iPad|iPhone).*OS ([0-9_]*) .*/.exec(navigator.userAgent);o&&(o=parseFloat(o[2].replace(/_/g,"."))),s.ios=o;var l,a,r,h,c,p,d,f,u,m,v,E=function(){var t=e("<style>").appendTo("head"),i=t.prop("sheet")||t.prop("styleSheet"),n=function(e,t,s){i.insertRule?i.insertRule(e+"{"+t+"}",s):i.addRule(e,t,s)};n("."+s.hiddenClass,"position:absolute !important;left:-9999px !important;height:1px !important;width:1px !important;margin:0 !important;border-width:0 !important;-webkit-appearance:none;-moz-appearance:none;appearance:none"),n("."+s.rtlClass+" ."+s.hiddenClass,"right:-9999px !important; left: auto !important"),n("."+s.unselectableClass,"-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0);"),n("."+s.resetAppearanceClass,"background: none; border: none; -webkit-appearance: none; appearance: none; opacity: 0; filter: alpha(opacity=0);");var o=e("html"),l=e("body");("rtl"===o.css("direction")||"rtl"===l.css("direction"))&&o.addClass(s.rtlClass),o.on("reset",function(){setTimeout(function(){C.refreshAll()},0)}),s.styleSheetCreated=!0};a=navigator.pointerEnabled||navigator.msPointerEnabled,r="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,h={},c="jcf-",l=a?{pointerover:navigator.pointerEnabled?"pointerover":"MSPointerOver",pointerdown:navigator.pointerEnabled?"pointerdown":"MSPointerDown",pointermove:navigator.pointerEnabled?"pointermove":"MSPointerMove",pointerup:navigator.pointerEnabled?"pointerup":"MSPointerUp"}:{pointerover:"mouseover",pointerdown:"mousedown"+(r?" touchstart":""),pointermove:"mousemove"+(r?" touchmove":""),pointerup:"mouseup"+(r?" touchend":"")},e.each(l,function(t,s){e.each(s.split(" "),function(e,s){h[s]=t})}),e.each(l,function(t,s){s=s.split(" "),e.event.special[c+t]={setup:function(){var t=this;e.each(s,function(e,s){t.addEventListener?t.addEventListener(s,f,!1):t["on"+s]=f})},teardown:function(){var t=this;e.each(s,function(e,s){t.addEventListener?t.removeEventListener(s,f,!1):t["on"+s]=null})}}}),p=null,d=function(e){var t=Math.abs(e.pageX-p.x),s=Math.abs(e.pageY-p.y);if(t<=25&&s<=25)return!0},f=function(t){var s=t||window.event,i=null,n=h[s.type];if((t=e.event.fix(s)).type=c+n,s.pointerType)switch(s.pointerType){case 2:t.pointerType="touch";break;case 3:t.pointerType="pen";break;case 4:t.pointerType="mouse";break;default:t.pointerType=s.pointerType}else t.pointerType=s.type.substr(0,5);if(t.pageX||t.pageY||(i=s.changedTouches?s.changedTouches[0]:s,t.pageX=i.pageX,t.pageY=i.pageY),"touchend"===s.type&&(p={x:t.pageX,y:t.pageY}),!("mouse"===t.pointerType&&p&&d(t)))return(e.event.dispatch||e.event.handle).call(this,t)},u=("onwheel"in document||document.documentMode>=9?"wheel":"mousewheel DOMMouseScroll").split(" "),m="jcf-mousewheel",e.event.special[m]={setup:function(){var t=this;e.each(u,function(e,s){t.addEventListener?t.addEventListener(s,v,!1):t["on"+s]=v})},teardown:function(){var t=this;e.each(u,function(e,s){t.addEventListener?t.removeEventListener(s,v,!1):t["on"+s]=null})}},v=function(t){var s=t||window.event;return(t=e.event.fix(s)).type=m,"detail"in s&&(t.deltaY=-s.detail),"wheelDelta"in s&&(t.deltaY=-s.wheelDelta),"wheelDeltaY"in s&&(t.deltaY=-s.wheelDeltaY),"wheelDeltaX"in s&&(t.deltaX=-s.wheelDeltaX),"deltaY"in s&&(t.deltaY=s.deltaY),"deltaX"in s&&(t.deltaX=s.deltaX),t.delta=t.deltaY||t.deltaX,1===s.deltaMode&&(t.delta*=16,t.deltaY*=16,t.deltaX*=16),(e.event.dispatch||e.event.handle).call(this,t)};var g={fireNativeEvent:function(t,s){e(t).each(function(){var e;this.dispatchEvent?((e=document.createEvent("HTMLEvents")).initEvent(s,!0,!0),this.dispatchEvent(e)):document.createEventObject&&((e=document.createEventObject()).target=this,this.fireEvent("on"+s,e))})},bindHandlers:function(){var t=this;e.each(t,function(s,i){0===s.indexOf("on")&&e.isFunction(i)&&(t[s]=function(){return i.apply(t,arguments)})})}},C={version:"1.1.3",modules:{},getOptions:function(){return e.extend({},s)},setOptions:function(t,i){arguments.length>1?this.modules[t]&&e.extend(this.modules[t].prototype.options,i):e.extend(s,t)},addModule:function(i){var n=function(i){i.element.data(s.dataKey)||i.element.data(s.dataKey,this),t.push(this),this.options=e.extend({},s,this.options,o(i.element),i),this.bindHandlers(),this.init.apply(this,arguments)},o=function(t){var i=t.data(s.optionsKey),n=t.attr(s.optionsKey);if(i)return i;if(n)try{return e.parseJSON(n)}catch(o){}};n.prototype=i,e.extend(i,g),i.plugins&&e.each(i.plugins,function(t,s){e.extend(s.prototype,g)});var l=n.prototype.destroy;n.prototype.destroy=function(){this.options.element.removeData(this.options.dataKey);for(var e=t.length-1;e>=0;e--)if(t[e]===this){t.splice(e,1);break}l&&l.apply(this,arguments)},this.modules[i.name]=n},getInstance:function(t){return e(t).data(s.dataKey)},replace:function(t,i,n){var o,l=this;return s.styleSheetCreated||E(),e(t).each(function(){var t,a=e(this);(o=a.data(s.dataKey))?o.refresh():(i||e.each(l.modules,function(e,t){if(t.prototype.matchElement.call(t.prototype,a))return i=e,!1}),i&&(t=e.extend({element:a},n),o=new l.modules[i](t)))}),o},refresh:function(t){e(t).each(function(){var t=e(this).data(s.dataKey);t&&t.refresh()})},destroy:function(t){e(t).each(function(){var t=e(this).data(s.dataKey);t&&t.destroy()})},replaceAll:function(t){var s=this;e.each(this.modules,function(i,n){e(n.prototype.selector,t).each(function(){0>this.className.indexOf("jcf-ignore")&&s.replace(this,i)})})},refreshAll:function(i){if(i)e.each(this.modules,function(t,n){e(n.prototype.selector,i).each(function(){var t=e(this).data(s.dataKey);t&&t.refresh()})});else for(var n=t.length-1;n>=0;n--)t[n].refresh()},destroyAll:function(i){if(i)e.each(this.modules,function(t,n){e(n.prototype.selector,i).each(function(t,i){var n=e(i).data(s.dataKey);n&&n.destroy()})});else for(;t.length;)t[0].destroy()}};return window.jcf=C,C}),function(e,t){"use strict";function s(t){this.options=e.extend({wrapNative:!0,wrapNativeOnMobile:!0,fakeDropInBody:!0,useCustomScroll:!0,flipDropToFit:!0,maxVisibleItems:10,fakeAreaStructure:'<span class="jcf-select"><span class="jcf-select-text"></span><span class="jcf-select-opener"></span></span>',fakeDropStructure:'<div class="jcf-select-drop"><div class="jcf-select-drop-content"></div></div>',optionClassPrefix:"jcf-option-",selectClassPrefix:"jcf-select-",dropContentSelector:".jcf-select-drop-content",selectTextSelector:".jcf-select-text",dropActiveClass:"jcf-drop-active",flipDropClass:"jcf-drop-flipped"},t),this.init()}function i(t){this.options=e.extend({wrapNative:!0,useCustomScroll:!0,fakeStructure:'<span class="jcf-list-box"><span class="jcf-list-wrapper"></span></span>',selectClassPrefix:"jcf-select-",listHolder:".jcf-list-wrapper"},t),this.init()}function n(t){this.options=e.extend({holder:null,maxVisibleItems:10,selectOnClick:!0,useHoverClass:!1,useCustomScroll:!1,handleResize:!0,multipleSelectWithoutKey:!1,alwaysPreventMouseWheel:!1,indexAttribute:"data-index",cloneClassPrefix:"jcf-option-",containerStructure:'<span class="jcf-list"><span class="jcf-list-content"></span></span>',containerSelector:".jcf-list-content",captionClass:"jcf-optgroup-caption",disabledClass:"jcf-disabled",optionClass:"jcf-option",groupClass:"jcf-optgroup",hoverClass:"jcf-hover",selectedClass:"jcf-selected",scrollClass:"jcf-scroll-active"},t),this.init()}jcf.addModule({name:"Select",selector:"select",options:{element:null,multipleCompactStyle:!1},plugins:{ListBox:i,ComboBox:s,SelectList:n},matchElement:function(e){return e.is("select")},init:function(){this.element=e(this.options.element),this.createInstance()},isListBox:function(){return this.element.is("[size]:not([jcf-size]), [multiple]")},createInstance:function(){this.instance&&this.instance.destroy(),this.isListBox()&&!this.options.multipleCompactStyle?this.instance=new i(this.options):this.instance=new s(this.options)},refresh:function(){this.isListBox()&&this.instance instanceof s||!this.isListBox()&&this.instance instanceof i?this.createInstance():this.instance.refresh()},destroy:function(){this.instance.destroy()}}),e.extend(s.prototype,{init:function(){this.initStructure(),this.bindHandlers(),this.attachEvents(),this.refresh()},initStructure:function(){this.win=e(t),this.doc=e(document),this.realElement=e(this.options.element),this.fakeElement=e(this.options.fakeAreaStructure).insertAfter(this.realElement),this.selectTextContainer=this.fakeElement.find(this.options.selectTextSelector),this.selectText=e("<span></span>").appendTo(this.selectTextContainer),l(this.fakeElement),this.fakeElement.addClass(o(this.realElement.prop("className"),this.options.selectClassPrefix)),this.realElement.prop("multiple")&&this.fakeElement.addClass("jcf-compact-multiple"),this.options.isMobileDevice&&this.options.wrapNativeOnMobile&&!this.options.wrapNative&&(this.options.wrapNative=!0),this.options.wrapNative?this.realElement.prependTo(this.fakeElement).css({position:"absolute",height:"100%",width:"100%"}).addClass(this.options.resetAppearanceClass):(this.realElement.addClass(this.options.hiddenClass),this.fakeElement.attr("title",this.realElement.attr("title")),this.fakeDropTarget=this.options.fakeDropInBody?e("body"):this.fakeElement)},attachEvents:function(){var e=this;this.delayedRefresh=function(){setTimeout(function(){e.refresh(),e.list&&(e.list.refresh(),e.list.scrollToActiveOption())},1)},this.options.wrapNative?this.realElement.on({focus:this.onFocus,change:this.onChange,click:this.onChange,keydown:this.onChange}):(this.realElement.on({focus:this.onFocus,change:this.onChange,keydown:this.onKeyDown}),this.fakeElement.on({"jcf-pointerdown":this.onSelectAreaPress}))},onKeyDown:function(e){13===e.which?this.toggleDropdown():this.dropActive&&this.delayedRefresh()},onChange:function(){this.refresh()},onFocus:function(){this.pressedFlag&&this.focusedFlag||(this.fakeElement.addClass(this.options.focusClass),this.realElement.on("blur",this.onBlur),this.toggleListMode(!0),this.focusedFlag=!0)},onBlur:function(){this.pressedFlag||(this.fakeElement.removeClass(this.options.focusClass),this.realElement.off("blur",this.onBlur),this.toggleListMode(!1),this.focusedFlag=!1)},onResize:function(){this.dropActive&&this.hideDropdown()},onSelectDropPress:function(){this.pressedFlag=!0},onSelectDropRelease:function(e,t){this.pressedFlag=!1,"mouse"===t.pointerType&&this.realElement.focus()},onSelectAreaPress:function(t){!(!this.options.fakeDropInBody&&e(t.target).closest(this.dropdown).length||t.button>1||this.realElement.is(":disabled"))&&(this.selectOpenedByEvent=t.pointerType,this.toggleDropdown(),this.focusedFlag||("mouse"===t.pointerType?this.realElement.focus():this.onFocus(t)),this.pressedFlag=!0,this.fakeElement.addClass(this.options.pressedClass),this.doc.on("jcf-pointerup",this.onSelectAreaRelease))},onSelectAreaRelease:function(e){this.focusedFlag&&"mouse"===e.pointerType&&this.realElement.focus(),this.pressedFlag=!1,this.fakeElement.removeClass(this.options.pressedClass),this.doc.off("jcf-pointerup",this.onSelectAreaRelease)},onOutsideClick:function(t){var s=e(t.target);s.closest(this.fakeElement).length||s.closest(this.dropdown).length||this.hideDropdown()},onSelect:function(){this.refresh(),this.realElement.prop("multiple")?this.repositionDropdown():this.hideDropdown(),this.fireNativeEvent(this.realElement,"change")},toggleListMode:function(e){this.options.wrapNative||(e?this.realElement.attr({size:4,"jcf-size":""}):this.options.wrapNative||this.realElement.removeAttr("size jcf-size"))},createDropdown:function(){this.dropdown&&(this.list.destroy(),this.dropdown.remove()),this.dropdown=e(this.options.fakeDropStructure).appendTo(this.fakeDropTarget),this.dropdown.addClass(o(this.realElement.prop("className"),this.options.selectClassPrefix)),l(this.dropdown),this.realElement.prop("multiple")&&this.dropdown.addClass("jcf-compact-multiple"),this.options.fakeDropInBody&&this.dropdown.css({position:"absolute",top:-9999}),this.list=new n({useHoverClass:!0,handleResize:!1,alwaysPreventMouseWheel:!0,maxVisibleItems:this.options.maxVisibleItems,useCustomScroll:this.options.useCustomScroll,holder:this.dropdown.find(this.options.dropContentSelector),multipleSelectWithoutKey:this.realElement.prop("multiple"),element:this.realElement}),e(this.list).on({select:this.onSelect,press:this.onSelectDropPress,release:this.onSelectDropRelease})},repositionDropdown:function(){var e,t,s,i=this.fakeElement.offset(),n=this.fakeElement.outerWidth(),o=this.fakeElement.outerHeight(),l=this.dropdown.css("width",n).outerHeight(),a=this.win.scrollTop(),r=this.win.height(),h=!1;i.top+o+l>a+r&&i.top-l>a&&(h=!0),this.options.fakeDropInBody&&(s="static"!==this.fakeDropTarget.css("position")?this.fakeDropTarget.offset().top:0,this.options.flipDropToFit&&h?(t=i.left,e=i.top-l-s):(t=i.left,e=i.top+o-s),this.dropdown.css({width:n,left:t,top:e})),this.dropdown.add(this.fakeElement).toggleClass(this.options.flipDropClass,this.options.flipDropToFit&&h)},showDropdown:function(){this.realElement.prop("options").length&&(this.dropdown||this.createDropdown(),this.dropActive=!0,this.dropdown.appendTo(this.fakeDropTarget),this.fakeElement.addClass(this.options.dropActiveClass),this.refreshSelectedText(),this.repositionDropdown(),this.list.setScrollTop(this.savedScrollTop),this.list.refresh(),this.win.on("resize",this.onResize),this.doc.on("jcf-pointerdown",this.onOutsideClick))},hideDropdown:function(){this.dropdown&&(this.savedScrollTop=this.list.getScrollTop(),this.fakeElement.removeClass(this.options.dropActiveClass+" "+this.options.flipDropClass),this.dropdown.removeClass(this.options.flipDropClass).detach(),this.doc.off("jcf-pointerdown",this.onOutsideClick),this.win.off("resize",this.onResize),this.dropActive=!1,"touch"===this.selectOpenedByEvent&&this.onBlur())},toggleDropdown:function(){this.dropActive?this.hideDropdown():this.showDropdown()},refreshSelectedText:function(){var t,s=this.realElement.prop("selectedIndex"),i=this.realElement.prop("options")[s],n=i?i.getAttribute("data-image"):null,l="";this.realElement.prop("multiple")?(e.each(this.realElement.prop("options"),function(e,t){t.selected&&(l+=(l?", ":"")+t.innerHTML)}),l||(l=this.realElement.attr("placeholder")||""),this.selectText.removeAttr("class").html(l)):i?(this.currentSelectedText!==i.innerHTML||this.currentSelectedImage!==n)&&(t=o(i.className,this.options.optionClassPrefix),this.selectText.attr("class",t).html(i.innerHTML),n?(this.selectImage||(this.selectImage=e("<img>").prependTo(this.selectTextContainer).hide()),this.selectImage.attr("src",n).show()):this.selectImage&&this.selectImage.hide(),this.currentSelectedText=i.innerHTML,this.currentSelectedImage=n):(this.selectImage&&this.selectImage.hide(),this.selectText.removeAttr("class").empty())},refresh:function(){"none"===this.realElement.prop("style").display?this.fakeElement.hide():this.fakeElement.show(),this.refreshSelectedText(),this.fakeElement.toggleClass(this.options.disabledClass,this.realElement.is(":disabled"))},destroy:function(){this.options.wrapNative?this.realElement.insertBefore(this.fakeElement).css({position:"",height:"",width:""}).removeClass(this.options.resetAppearanceClass):(this.realElement.removeClass(this.options.hiddenClass),this.realElement.is("[jcf-size]")&&this.realElement.removeAttr("size jcf-size")),this.fakeElement.remove(),this.doc.off("jcf-pointerup",this.onSelectAreaRelease),this.realElement.off({focus:this.onFocus})}}),e.extend(i.prototype,{init:function(){this.bindHandlers(),this.initStructure(),this.attachEvents()},initStructure:function(){this.realElement=e(this.options.element),this.fakeElement=e(this.options.fakeStructure).insertAfter(this.realElement),this.listHolder=this.fakeElement.find(this.options.listHolder),l(this.fakeElement),this.fakeElement.addClass(o(this.realElement.prop("className"),this.options.selectClassPrefix)),this.realElement.addClass(this.options.hiddenClass),this.list=new n({useCustomScroll:this.options.useCustomScroll,holder:this.listHolder,selectOnClick:!1,element:this.realElement})},attachEvents:function(){var t=this;this.delayedRefresh=function(e){(!e||16!==e.which)&&(clearTimeout(t.refreshTimer),t.refreshTimer=setTimeout(function(){t.refresh(),t.list.scrollToActiveOption()},1))},this.realElement.on({focus:this.onFocus,click:this.delayedRefresh,keydown:this.delayedRefresh}),e(this.list).on({select:this.onSelect,press:this.onFakeOptionsPress,release:this.onFakeOptionsRelease})},onFakeOptionsPress:function(e,t){this.pressedFlag=!0,"mouse"===t.pointerType&&this.realElement.focus()},onFakeOptionsRelease:function(e,t){this.pressedFlag=!1,"mouse"===t.pointerType&&this.realElement.focus()},onSelect:function(){this.fireNativeEvent(this.realElement,"change"),this.fireNativeEvent(this.realElement,"click")},onFocus:function(){this.pressedFlag&&this.focusedFlag||(this.fakeElement.addClass(this.options.focusClass),this.realElement.on("blur",this.onBlur),this.focusedFlag=!0)},onBlur:function(){this.pressedFlag||(this.fakeElement.removeClass(this.options.focusClass),this.realElement.off("blur",this.onBlur),this.focusedFlag=!1)},refresh:function(){this.fakeElement.toggleClass(this.options.disabledClass,this.realElement.is(":disabled")),this.list.refresh()},destroy:function(){this.list.destroy(),this.realElement.insertBefore(this.fakeElement).removeClass(this.options.hiddenClass),this.fakeElement.remove()}}),e.extend(n.prototype,{init:function(){this.initStructure(),this.refreshSelectedClass(),this.attachEvents()},initStructure:function(){this.element=e(this.options.element),this.indexSelector="["+this.options.indexAttribute+"]",this.container=e(this.options.containerStructure).appendTo(this.options.holder),this.listHolder=this.container.find(this.options.containerSelector),this.lastClickedIndex=this.element.prop("selectedIndex"),this.rebuildList()},attachEvents:function(){this.bindHandlers(),this.listHolder.on("jcf-pointerdown",this.indexSelector,this.onItemPress),this.listHolder.on("jcf-pointerdown",this.onPress),this.options.useHoverClass&&this.listHolder.on("jcf-pointerover",this.indexSelector,this.onHoverItem)},onPress:function(t){e(this).trigger("press",t),this.listHolder.on("jcf-pointerup",this.onRelease)},onRelease:function(t){e(this).trigger("release",t),this.listHolder.off("jcf-pointerup",this.onRelease)},onHoverItem:function(e){var t=parseFloat(e.currentTarget.getAttribute(this.options.indexAttribute));this.fakeOptions.removeClass(this.options.hoverClass).eq(t).addClass(this.options.hoverClass)},onItemPress:function(e){"touch"===e.pointerType||this.options.selectOnClick?(this.tmpListOffsetTop=this.list.offset().top,this.listHolder.on("jcf-pointerup",this.indexSelector,this.onItemRelease)):this.onSelectItem(e)},onItemRelease:function(e){this.listHolder.off("jcf-pointerup",this.indexSelector,this.onItemRelease),this.tmpListOffsetTop===this.list.offset().top&&this.listHolder.on("click",this.indexSelector,{savedPointerType:e.pointerType},this.onSelectItem),delete this.tmpListOffsetTop},onSelectItem:function(t){var s,i=parseFloat(t.currentTarget.getAttribute(this.options.indexAttribute)),n=t.data&&t.data.savedPointerType||t.pointerType||"mouse";this.listHolder.off("click",this.indexSelector,this.onSelectItem),!(t.button>1)&&!this.realOptions[i].disabled&&(this.element.prop("multiple")?t.metaKey||t.ctrlKey||"touch"===n||this.options.multipleSelectWithoutKey?this.realOptions[i].selected=!this.realOptions[i].selected:t.shiftKey?(s=[this.lastClickedIndex,i].sort(function(e,t){return e-t}),this.realOptions.each(function(e,t){t.selected=e>=s[0]&&e<=s[1]})):this.element.prop("selectedIndex",i):this.element.prop("selectedIndex",i),t.shiftKey||(this.lastClickedIndex=i),this.refreshSelectedClass(),"mouse"===n&&this.scrollToActiveOption(),e(this).trigger("select"))},rebuildList:function(){var t=this,s=this.element[0];this.storedSelectHTML=s.innerHTML,this.optionIndex=0,this.list=e(this.createOptionsList(s)),this.listHolder.empty().append(this.list),this.realOptions=this.element.find("option"),this.fakeOptions=this.list.find(this.indexSelector),this.fakeListItems=this.list.find("."+this.options.captionClass+","+this.indexSelector),delete this.optionIndex;var i=this.options.maxVisibleItems,n=this.element.prop("size");n>1&&!this.element.is("[jcf-size]")&&(i=n);var o=this.fakeOptions.length>i;if(this.container.toggleClass(this.options.scrollClass,o),o&&(this.listHolder.css({maxHeight:this.getOverflowHeight(i),overflow:"auto"}),this.options.useCustomScroll&&jcf.modules.Scrollable)){jcf.replace(this.listHolder,"Scrollable",{handleResize:this.options.handleResize,alwaysPreventMouseWheel:this.options.alwaysPreventMouseWheel});return}this.options.alwaysPreventMouseWheel&&(this.preventWheelHandler=function(e){var s=t.listHolder.scrollTop(),i=t.listHolder.prop("scrollHeight")-t.listHolder.innerHeight();(s<=0&&e.deltaY<0||s>=i&&e.deltaY>0)&&e.preventDefault()},this.listHolder.on("jcf-mousewheel",this.preventWheelHandler))},refreshSelectedClass:function(){var e,t=this,s=this.element.prop("multiple"),i=this.element.prop("selectedIndex");s?this.realOptions.each(function(e,s){t.fakeOptions.eq(e).toggleClass(t.options.selectedClass,!!s.selected)}):(this.fakeOptions.removeClass(this.options.selectedClass+" "+this.options.hoverClass),e=this.fakeOptions.eq(i).addClass(this.options.selectedClass),this.options.useHoverClass&&e.addClass(this.options.hoverClass))},scrollToActiveOption:function(){var e=this.getActiveOptionOffset();"number"==typeof e&&this.listHolder.prop("scrollTop",e)},getSelectedIndexRange:function(){var e=-1,t=-1;return this.realOptions.each(function(s,i){i.selected&&(e<0&&(e=s),t=s)}),[e,t]},getChangedSelectedIndex:function(){var e,t=this.element.prop("selectedIndex");return this.element.prop("multiple")?(this.previousRange||(this.previousRange=[t,t]),this.currentRange=this.getSelectedIndexRange(),e=this.currentRange[this.currentRange[0]!==this.previousRange[0]?0:1],this.previousRange=this.currentRange,e):t},getActiveOptionOffset:function(){var e=this.listHolder.height(),t=this.listHolder.prop("scrollTop"),s=this.getChangedSelectedIndex(),i=this.fakeOptions.eq(s),n=i.offset().top-this.list.offset().top,o=i.innerHeight();return n+o>=t+e?n-e+o:n<t?n:void 0},getOverflowHeight:function(e){var t,s=this.fakeListItems.eq(e-1),i=this.list.offset().top;return s.offset().top+s.innerHeight()-i},getScrollTop:function(){return this.listHolder.scrollTop()},setScrollTop:function(e){this.listHolder.scrollTop(e)},createOption:function(e){var t=document.createElement("span");t.className=this.options.optionClass,t.innerHTML=e.innerHTML,t.setAttribute(this.options.indexAttribute,this.optionIndex++);var s,i=e.getAttribute("data-image");return i&&((s=document.createElement("img")).src=i,t.insertBefore(s,t.childNodes[0])),e.disabled&&(t.className+=" "+this.options.disabledClass),e.className&&(t.className+=" "+o(e.className,this.options.cloneClassPrefix)),t},createOptGroup:function(e){var t,s,i=document.createElement("span"),n=e.getAttribute("label");return(t=document.createElement("span")).className=this.options.captionClass,t.innerHTML=n,i.appendChild(t),e.children.length&&(s=this.createOptionsList(e),i.appendChild(s)),i.className=this.options.groupClass,i},createOptionContainer:function(){return document.createElement("li")},createOptionsList:function(t){var s=this,i=document.createElement("ul");return e.each(t.children,function(e,t){var n,o=s.createOptionContainer(t);switch(t.tagName.toLowerCase()){case"option":n=s.createOption(t);break;case"optgroup":n=s.createOptGroup(t)}i.appendChild(o).appendChild(n)}),i},refresh:function(){this.storedSelectHTML!==this.element.prop("innerHTML")&&this.rebuildList();var e=jcf.getInstance(this.listHolder);e&&e.refresh(),this.refreshSelectedClass()},destroy:function(){this.listHolder.off("jcf-mousewheel",this.preventWheelHandler),this.listHolder.off("jcf-pointerdown",this.indexSelector,this.onSelectItem),this.listHolder.off("jcf-pointerover",this.indexSelector,this.onHoverItem),this.listHolder.off("jcf-pointerdown",this.onPress)}});var o=function(e,t){return e?e.replace(/[\s]*([\S]+)+[\s]*/gi,t+"$1 "):""},l=function(){var e=jcf.getOptions().unselectableClass;function t(e){e.preventDefault()}return function(s){s.addClass(e).on("selectstart",t)}}()}(jQuery,this),function(e){"use strict";jcf.addModule({name:"Radio",selector:'input[type="radio"]',options:{wrapNative:!0,checkedClass:"jcf-checked",uncheckedClass:"jcf-unchecked",labelActiveClass:"jcf-label-active",fakeStructure:'<span class="jcf-radio"><span></span></span>'},matchElement:function(e){return e.is(":radio")},init:function(){this.initStructure(),this.attachEvents(),this.refresh()},initStructure:function(){this.doc=e(document),this.realElement=e(this.options.element),this.fakeElement=e(this.options.fakeStructure).insertAfter(this.realElement),this.labelElement=this.getLabelFor(),this.options.wrapNative?this.realElement.prependTo(this.fakeElement).css({position:"absolute",opacity:0}):this.realElement.addClass(this.options.hiddenClass)},attachEvents:function(){this.realElement.on({focus:this.onFocus,click:this.onRealClick}),this.fakeElement.on("click",this.onFakeClick),this.fakeElement.on("jcf-pointerdown",this.onPress)},onRealClick:function(e){var t=this;this.savedEventObject=e,setTimeout(function(){t.refreshRadioGroup()},0)},onFakeClick:function(e){!(this.options.wrapNative&&this.realElement.is(e.target))&&(this.realElement.is(":disabled")||(delete this.savedEventObject,this.currentActiveRadio=this.getCurrentActiveRadio(),this.stateChecked=this.realElement.prop("checked"),this.realElement.prop("checked",!0),this.fireNativeEvent(this.realElement,"click"),this.savedEventObject&&this.savedEventObject.isDefaultPrevented()?(this.realElement.prop("checked",this.stateChecked),this.currentActiveRadio.prop("checked",!0)):this.fireNativeEvent(this.realElement,"change"),delete this.savedEventObject))},onFocus:function(){this.pressedFlag&&this.focusedFlag||(this.focusedFlag=!0,this.fakeElement.addClass(this.options.focusClass),this.realElement.on("blur",this.onBlur))},onBlur:function(){this.pressedFlag||(this.focusedFlag=!1,this.fakeElement.removeClass(this.options.focusClass),this.realElement.off("blur",this.onBlur))},onPress:function(e){this.focusedFlag||"mouse"!==e.pointerType||this.realElement.focus(),this.pressedFlag=!0,this.fakeElement.addClass(this.options.pressedClass),this.doc.on("jcf-pointerup",this.onRelease)},onRelease:function(e){this.focusedFlag&&"mouse"===e.pointerType&&this.realElement.focus(),this.pressedFlag=!1,this.fakeElement.removeClass(this.options.pressedClass),this.doc.off("jcf-pointerup",this.onRelease)},getCurrentActiveRadio:function(){return this.getRadioGroup(this.realElement).filter(":checked")},getRadioGroup:function(t){var s=t.attr("name"),i=t.parents("form");return s?i.length?i.find('input[name="'+s+'"]'):e('input[name="'+s+'"]:not(form input)'):t},getLabelFor:function(){var t=this.realElement.closest("label"),s=this.realElement.prop("id");return!t.length&&s&&(t=e('label[for="'+s+'"]')),t.length?t:null},refreshRadioGroup:function(){this.getRadioGroup(this.realElement).each(function(){jcf.refresh(this)})},refresh:function(){var e=this.realElement.is(":checked"),t=this.realElement.is(":disabled");this.fakeElement.toggleClass(this.options.checkedClass,e).toggleClass(this.options.uncheckedClass,!e).toggleClass(this.options.disabledClass,t),this.labelElement&&this.labelElement.toggleClass(this.options.labelActiveClass,e)},destroy:function(){this.options.wrapNative?this.realElement.insertBefore(this.fakeElement).css({position:"",width:"",height:"",opacity:"",margin:""}):this.realElement.removeClass(this.options.hiddenClass),this.fakeElement.off("jcf-pointerdown",this.onPress),this.fakeElement.remove(),this.doc.off("jcf-pointerup",this.onRelease),this.realElement.off({blur:this.onBlur,focus:this.onFocus,click:this.onRealClick})}})}(jQuery),function(e){"use strict";jcf.addModule({name:"Checkbox",selector:'input[type="checkbox"]',options:{wrapNative:!0,checkedClass:"jcf-checked",uncheckedClass:"jcf-unchecked",labelActiveClass:"jcf-label-active",fakeStructure:'<span class="jcf-checkbox"><span></span></span>'},matchElement:function(e){return e.is(":checkbox")},init:function(){this.initStructure(),this.attachEvents(),this.refresh()},initStructure:function(){this.doc=e(document),this.realElement=e(this.options.element),this.fakeElement=e(this.options.fakeStructure).insertAfter(this.realElement),this.labelElement=this.getLabelFor(),this.options.wrapNative?this.realElement.appendTo(this.fakeElement).css({position:"absolute",height:"100%",width:"100%",opacity:0,margin:0}):this.realElement.addClass(this.options.hiddenClass)},attachEvents:function(){this.realElement.on({focus:this.onFocus,click:this.onRealClick}),this.fakeElement.on("click",this.onFakeClick),this.fakeElement.on("jcf-pointerdown",this.onPress)},onRealClick:function(e){var t=this;this.savedEventObject=e,setTimeout(function(){t.refresh()},0)},onFakeClick:function(e){!(this.options.wrapNative&&this.realElement.is(e.target))&&(this.realElement.is(":disabled")||(delete this.savedEventObject,this.stateChecked=this.realElement.prop("checked"),this.realElement.prop("checked",!this.stateChecked),this.fireNativeEvent(this.realElement,"click"),this.savedEventObject&&this.savedEventObject.isDefaultPrevented()?this.realElement.prop("checked",this.stateChecked):this.fireNativeEvent(this.realElement,"change"),delete this.savedEventObject))},onFocus:function(){this.pressedFlag&&this.focusedFlag||(this.focusedFlag=!0,this.fakeElement.addClass(this.options.focusClass),this.realElement.on("blur",this.onBlur))},onBlur:function(){this.pressedFlag||(this.focusedFlag=!1,this.fakeElement.removeClass(this.options.focusClass),this.realElement.off("blur",this.onBlur))},onPress:function(e){this.focusedFlag||"mouse"!==e.pointerType||this.realElement.focus(),this.pressedFlag=!0,this.fakeElement.addClass(this.options.pressedClass),this.doc.on("jcf-pointerup",this.onRelease)},onRelease:function(e){this.focusedFlag&&"mouse"===e.pointerType&&this.realElement.focus(),this.pressedFlag=!1,this.fakeElement.removeClass(this.options.pressedClass),this.doc.off("jcf-pointerup",this.onRelease)},getLabelFor:function(){var t=this.realElement.closest("label"),s=this.realElement.prop("id");return!t.length&&s&&(t=e('label[for="'+s+'"]')),t.length?t:null},refresh:function(){var e=this.realElement.is(":checked"),t=this.realElement.is(":disabled");this.fakeElement.toggleClass(this.options.checkedClass,e).toggleClass(this.options.uncheckedClass,!e).toggleClass(this.options.disabledClass,t),this.labelElement&&this.labelElement.toggleClass(this.options.labelActiveClass,e)},destroy:function(){this.options.wrapNative?this.realElement.insertBefore(this.fakeElement).css({position:"",width:"",height:"",opacity:"",margin:""}):this.realElement.removeClass(this.options.hiddenClass),this.fakeElement.off("jcf-pointerdown",this.onPress),this.fakeElement.remove(),this.doc.off("jcf-pointerup",this.onRelease),this.realElement.off({focus:this.onFocus,click:this.onRealClick})}})}(jQuery);
// jcf end
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AOS=t():e.AOS=t()}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return e[o].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="dist/",t(0)}([function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},r=n(1),a=(o(r),n(6)),u=o(a),c=n(7),s=o(c),f=n(8),d=o(f),l=n(9),p=o(l),m=n(10),b=o(m),v=n(11),y=o(v),g=n(14),h=o(g),w=[],k=!1,x={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded",throttleDelay:99,debounceDelay:50,disableMutationObserver:!1},j=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e&&(k=!0),k)return w=(0,y.default)(w,x),(0,b.default)(w,x.once),w},O=function(){w=(0,h.default)(),j()},M=function(){w.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay")})},S=function(e){return e===!0||"mobile"===e&&p.default.mobile()||"phone"===e&&p.default.phone()||"tablet"===e&&p.default.tablet()||"function"==typeof e&&e()===!0},_=function(e){x=i(x,e),w=(0,h.default)();var t=document.all&&!window.atob;return S(x.disable)||t?M():(x.disableMutationObserver||d.default.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),x.disableMutationObserver=!0),document.querySelector("body").setAttribute("data-aos-easing",x.easing),document.querySelector("body").setAttribute("data-aos-duration",x.duration),document.querySelector("body").setAttribute("data-aos-delay",x.delay),"DOMContentLoaded"===x.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1?j(!0):"load"===x.startEvent?window.addEventListener(x.startEvent,function(){j(!0)}):document.addEventListener(x.startEvent,function(){j(!0)}),window.addEventListener("resize",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("orientationchange",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("scroll",(0,u.default)(function(){(0,b.default)(w,x.once)},x.throttleDelay)),x.disableMutationObserver||d.default.ready("[data-aos]",O),w)};e.exports={init:_,refresh:j,refreshHard:O}},function(e,t){},,,,,function(e,t){(function(t){"use strict";function n(e,t,n){function o(t){var n=b,o=v;return b=v=void 0,k=t,g=e.apply(o,n)}function r(e){return k=e,h=setTimeout(f,t),M?o(e):g}function a(e){var n=e-w,o=e-k,i=t-n;return S?j(i,y-o):i}function c(e){var n=e-w,o=e-k;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=O();return c(e)?d(e):void(h=setTimeout(f,a(e)))}function d(e){return h=void 0,_&&b?o(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),k=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(O())}function m(){var e=O(),n=c(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),o(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,k=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(s);return t=u(t)||0,i(n)&&(M=!!n.leading,S="maxWait"in n,y=S?x(u(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e,t,o){var r=!0,a=!0;if("function"!=typeof e)throw new TypeError(s);return i(o)&&(r="leading"in o?!!o.leading:r,a="trailing"in o?!!o.trailing:a),n(e,t,{leading:r,maxWait:t,trailing:a})}function i(e){var t="undefined"==typeof e?"undefined":c(e);return!!e&&("object"==t||"function"==t)}function r(e){return!!e&&"object"==("undefined"==typeof e?"undefined":c(e))}function a(e){return"symbol"==("undefined"==typeof e?"undefined":c(e))||r(e)&&k.call(e)==d}function u(e){if("number"==typeof e)return e;if(a(e))return f;if(i(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=i(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(l,"");var n=m.test(e);return n||b.test(e)?v(e.slice(2),n?2:8):p.test(e)?f:+e}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s="Expected a function",f=NaN,d="[object Symbol]",l=/^\s+|\s+$/g,p=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,b=/^0o[0-7]+$/i,v=parseInt,y="object"==("undefined"==typeof t?"undefined":c(t))&&t&&t.Object===Object&&t,g="object"==("undefined"==typeof self?"undefined":c(self))&&self&&self.Object===Object&&self,h=y||g||Function("return this")(),w=Object.prototype,k=w.toString,x=Math.max,j=Math.min,O=function(){return h.Date.now()};e.exports=o}).call(t,function(){return this}())},function(e,t){(function(t){"use strict";function n(e,t,n){function i(t){var n=b,o=v;return b=v=void 0,O=t,g=e.apply(o,n)}function r(e){return O=e,h=setTimeout(f,t),M?i(e):g}function u(e){var n=e-w,o=e-O,i=t-n;return S?x(i,y-o):i}function s(e){var n=e-w,o=e-O;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=j();return s(e)?d(e):void(h=setTimeout(f,u(e)))}function d(e){return h=void 0,_&&b?i(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),O=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(j())}function m(){var e=j(),n=s(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),i(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,O=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(c);return t=a(t)||0,o(n)&&(M=!!n.leading,S="maxWait"in n,y=S?k(a(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e){var t="undefined"==typeof e?"undefined":u(e);return!!e&&("object"==t||"function"==t)}function i(e){return!!e&&"object"==("undefined"==typeof e?"undefined":u(e))}function r(e){return"symbol"==("undefined"==typeof e?"undefined":u(e))||i(e)&&w.call(e)==f}function a(e){if("number"==typeof e)return e;if(r(e))return s;if(o(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=o(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(d,"");var n=p.test(e);return n||m.test(e)?b(e.slice(2),n?2:8):l.test(e)?s:+e}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},c="Expected a function",s=NaN,f="[object Symbol]",d=/^\s+|\s+$/g,l=/^[-+]0x[0-9a-f]+$/i,p=/^0b[01]+$/i,m=/^0o[0-7]+$/i,b=parseInt,v="object"==("undefined"==typeof t?"undefined":u(t))&&t&&t.Object===Object&&t,y="object"==("undefined"==typeof self?"undefined":u(self))&&self&&self.Object===Object&&self,g=v||y||Function("return this")(),h=Object.prototype,w=h.toString,k=Math.max,x=Math.min,j=function(){return g.Date.now()};e.exports=n}).call(t,function(){return this}())},function(e,t){"use strict";function n(e){var t=void 0,o=void 0,i=void 0;for(t=0;t<e.length;t+=1){if(o=e[t],o.dataset&&o.dataset.aos)return!0;if(i=o.children&&n(o.children))return!0}return!1}function o(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}function i(){return!!o()}function r(e,t){var n=window.document,i=o(),r=new i(a);u=t,r.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}function a(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),o=Array.prototype.slice.call(e.removedNodes),i=t.concat(o);if(n(i))return u()})}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){};t.default={isSupported:i,ready:r}},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),r=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,a=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,u=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,c=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,s=function(){function e(){n(this,e)}return i(e,[{key:"phone",value:function(){var e=o();return!(!r.test(e)&&!a.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=o();return!(!u.test(e)&&!c.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),e}();t.default=new s},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t,n){var o=e.node.getAttribute("data-aos-once");t>e.position?e.node.classList.add("aos-animate"):"undefined"!=typeof o&&("false"===o||!n&&"true"!==o)&&e.node.classList.remove("aos-animate")},o=function(e,t){var o=window.pageYOffset,i=window.innerHeight;e.forEach(function(e,r){n(e,i+o,t)})};t.default=o},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(12),r=o(i),a=function(e,t){return e.forEach(function(e,n){e.node.classList.add("aos-init"),e.position=(0,r.default)(e.node,t.offset)}),e};t.default=a},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(13),r=o(i),a=function(e,t){var n=0,o=0,i=window.innerHeight,a={offset:e.getAttribute("data-aos-offset"),anchor:e.getAttribute("data-aos-anchor"),anchorPlacement:e.getAttribute("data-aos-anchor-placement")};switch(a.offset&&!isNaN(a.offset)&&(o=parseInt(a.offset)),a.anchor&&document.querySelectorAll(a.anchor)&&(e=document.querySelectorAll(a.anchor)[0]),n=(0,r.default)(e).top,a.anchorPlacement){case"top-bottom":break;case"center-bottom":n+=e.offsetHeight/2;break;case"bottom-bottom":n+=e.offsetHeight;break;case"top-center":n+=i/2;break;case"bottom-center":n+=i/2+e.offsetHeight;break;case"center-center":n+=i/2+e.offsetHeight/2;break;case"top-top":n+=i;break;case"bottom-top":n+=e.offsetHeight+i;break;case"center-top":n+=e.offsetHeight/2+i}return a.anchorPlacement||a.offset||isNaN(t)||(o=t),n+o};t.default=a},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:n,left:t}};t.default=n},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e=e||document.querySelectorAll("[data-aos]"),Array.prototype.map.call(e,function(e){return{node:e}})};t.default=n}])});
/**
 * Skipped minification because the original files appears to be already minified.
 * Original file: /npm/chart.js@4.4.2/dist/chart.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/*!
 * Chart.js v4.4.2
 * https://www.chartjs.org
 * (c) 2024 Chart.js Contributors
 * Released under the MIT License
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){"use strict";var t=Object.freeze({__proto__:null,get Colors(){return Go},get Decimation(){return Qo},get Filler(){return ma},get Legend(){return ya},get SubTitle(){return ka},get Title(){return Ma},get Tooltip(){return Ba}});function e(){}const i=(()=>{let t=0;return()=>t++})();function s(t){return null==t}function n(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return"[object"===e.slice(0,7)&&"Array]"===e.slice(-6)}function o(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)}function a(t){return("number"==typeof t||t instanceof Number)&&isFinite(+t)}function r(t,e){return a(t)?t:e}function l(t,e){return void 0===t?e:t}const h=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100:+t/e,c=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100*e:+t;function d(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)}function u(t,e,i,s){let a,r,l;if(n(t))if(r=t.length,s)for(a=r-1;a>=0;a--)e.call(i,t[a],a);else for(a=0;a<r;a++)e.call(i,t[a],a);else if(o(t))for(l=Object.keys(t),r=l.length,a=0;a<r;a++)e.call(i,t[l[a]],l[a])}function f(t,e){let i,s,n,o;if(!t||!e||t.length!==e.length)return!1;for(i=0,s=t.length;i<s;++i)if(n=t[i],o=e[i],n.datasetIndex!==o.datasetIndex||n.index!==o.index)return!1;return!0}function g(t){if(n(t))return t.map(g);if(o(t)){const e=Object.create(null),i=Object.keys(t),s=i.length;let n=0;for(;n<s;++n)e[i[n]]=g(t[i[n]]);return e}return t}function p(t){return-1===["__proto__","prototype","constructor"].indexOf(t)}function m(t,e,i,s){if(!p(t))return;const n=e[t],a=i[t];o(n)&&o(a)?b(n,a,s):e[t]=g(a)}function b(t,e,i){const s=n(e)?e:[e],a=s.length;if(!o(t))return t;const r=(i=i||{}).merger||m;let l;for(let e=0;e<a;++e){if(l=s[e],!o(l))continue;const n=Object.keys(l);for(let e=0,s=n.length;e<s;++e)r(n[e],t,l,i)}return t}function x(t,e){return b(t,e,{merger:_})}function _(t,e,i){if(!p(t))return;const s=e[t],n=i[t];o(s)&&o(n)?x(s,n):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=g(n))}const y={"":t=>t,x:t=>t.x,y:t=>t.y};function v(t){const e=t.split("."),i=[];let s="";for(const t of e)s+=t,s.endsWith("\\")?s=s.slice(0,-1)+".":(i.push(s),s="");return i}function M(t,e){const i=y[e]||(y[e]=function(t){const e=v(t);return t=>{for(const i of e){if(""===i)break;t=t&&t[i]}return t}}(e));return i(t)}function w(t){return t.charAt(0).toUpperCase()+t.slice(1)}const k=t=>void 0!==t,S=t=>"function"==typeof t,P=(t,e)=>{if(t.size!==e.size)return!1;for(const i of t)if(!e.has(i))return!1;return!0};function D(t){return"mouseup"===t.type||"click"===t.type||"contextmenu"===t.type}const C=Math.PI,O=2*C,A=O+C,T=Number.POSITIVE_INFINITY,L=C/180,E=C/2,R=C/4,I=2*C/3,z=Math.log10,F=Math.sign;function V(t,e,i){return Math.abs(t-e)<i}function B(t){const e=Math.round(t);t=V(t,e,t/1e3)?e:t;const i=Math.pow(10,Math.floor(z(t))),s=t/i;return(s<=1?1:s<=2?2:s<=5?5:10)*i}function W(t){const e=[],i=Math.sqrt(t);let s;for(s=1;s<i;s++)t%s==0&&(e.push(s),e.push(t/s));return i===(0|i)&&e.push(i),e.sort(((t,e)=>t-e)).pop(),e}function N(t){return!isNaN(parseFloat(t))&&isFinite(t)}function H(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}function j(t,e,i){let s,n,o;for(s=0,n=t.length;s<n;s++)o=t[s][i],isNaN(o)||(e.min=Math.min(e.min,o),e.max=Math.max(e.max,o))}function $(t){return t*(C/180)}function Y(t){return t*(180/C)}function U(t){if(!a(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function X(t,e){const i=e.x-t.x,s=e.y-t.y,n=Math.sqrt(i*i+s*s);let o=Math.atan2(s,i);return o<-.5*C&&(o+=O),{angle:o,distance:n}}function q(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function K(t,e){return(t-e+A)%O-C}function G(t){return(t%O+O)%O}function Z(t,e,i,s){const n=G(t),o=G(e),a=G(i),r=G(o-n),l=G(a-n),h=G(n-o),c=G(n-a);return n===o||n===a||s&&o===a||r>l&&h<c}function J(t,e,i){return Math.max(e,Math.min(i,t))}function Q(t){return J(t,-32768,32767)}function tt(t,e,i,s=1e-6){return t>=Math.min(e,i)-s&&t<=Math.max(e,i)+s}function et(t,e,i){i=i||(i=>t[i]<e);let s,n=t.length-1,o=0;for(;n-o>1;)s=o+n>>1,i(s)?o=s:n=s;return{lo:o,hi:n}}const it=(t,e,i,s)=>et(t,i,s?s=>{const n=t[s][e];return n<i||n===i&&t[s+1][e]===i}:s=>t[s][e]<i),st=(t,e,i)=>et(t,i,(s=>t[s][e]>=i));function nt(t,e,i){let s=0,n=t.length;for(;s<n&&t[s]<e;)s++;for(;n>s&&t[n-1]>i;)n--;return s>0||n<t.length?t.slice(s,n):t}const ot=["push","pop","shift","splice","unshift"];function at(t,e){t._chartjs?t._chartjs.listeners.push(e):(Object.defineProperty(t,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[e]}}),ot.forEach((e=>{const i="_onData"+w(e),s=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value(...e){const n=s.apply(this,e);return t._chartjs.listeners.forEach((t=>{"function"==typeof t[i]&&t[i](...e)})),n}})})))}function rt(t,e){const i=t._chartjs;if(!i)return;const s=i.listeners,n=s.indexOf(e);-1!==n&&s.splice(n,1),s.length>0||(ot.forEach((e=>{delete t[e]})),delete t._chartjs)}function lt(t){const e=new Set(t);return e.size===t.length?t:Array.from(e)}const ht="undefined"==typeof window?function(t){return t()}:window.requestAnimationFrame;function ct(t,e){let i=[],s=!1;return function(...n){i=n,s||(s=!0,ht.call(window,(()=>{s=!1,t.apply(e,i)})))}}function dt(t,e){let i;return function(...s){return e?(clearTimeout(i),i=setTimeout(t,e,s)):t.apply(this,s),e}}const ut=t=>"start"===t?"left":"end"===t?"right":"center",ft=(t,e,i)=>"start"===t?e:"end"===t?i:(e+i)/2,gt=(t,e,i,s)=>t===(s?"left":"right")?i:"center"===t?(e+i)/2:e;function pt(t,e,i){const s=e.length;let n=0,o=s;if(t._sorted){const{iScale:a,_parsed:r}=t,l=a.axis,{min:h,max:c,minDefined:d,maxDefined:u}=a.getUserBounds();d&&(n=J(Math.min(it(r,l,h).lo,i?s:it(e,l,a.getPixelForValue(h)).lo),0,s-1)),o=u?J(Math.max(it(r,a.axis,c,!0).hi+1,i?0:it(e,l,a.getPixelForValue(c),!0).hi+1),n,s)-n:s-n}return{start:n,count:o}}function mt(t){const{xScale:e,yScale:i,_scaleRanges:s}=t,n={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!s)return t._scaleRanges=n,!0;const o=s.xmin!==e.min||s.xmax!==e.max||s.ymin!==i.min||s.ymax!==i.max;return Object.assign(s,n),o}class bt{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,s){const n=e.listeners[s],o=e.duration;n.forEach((s=>s({chart:t,initial:e.initial,numSteps:o,currentStep:Math.min(i-e.start,o)})))}_refresh(){this._request||(this._running=!0,this._request=ht.call(window,(()=>{this._update(),this._request=null,this._running&&this._refresh()})))}_update(t=Date.now()){let e=0;this._charts.forEach(((i,s)=>{if(!i.running||!i.items.length)return;const n=i.items;let o,a=n.length-1,r=!1;for(;a>=0;--a)o=n[a],o._active?(o._total>i.duration&&(i.duration=o._total),o.tick(t),r=!0):(n[a]=n[n.length-1],n.pop());r&&(s.draw(),this._notify(s,i,t,"progress")),n.length||(i.running=!1,this._notify(s,i,t,"complete"),i.initial=!1),e+=n.length})),this._lastDate=t,0===e&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce(((t,e)=>Math.max(t,e._duration)),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let s=i.length-1;for(;s>=0;--s)i[s].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}}var xt=new bt;
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */function _t(t){return t+.5|0}const yt=(t,e,i)=>Math.max(Math.min(t,i),e);function vt(t){return yt(_t(2.55*t),0,255)}function Mt(t){return yt(_t(255*t),0,255)}function wt(t){return yt(_t(t/2.55)/100,0,1)}function kt(t){return yt(_t(100*t),0,100)}const St={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},Pt=[..."0123456789ABCDEF"],Dt=t=>Pt[15&t],Ct=t=>Pt[(240&t)>>4]+Pt[15&t],Ot=t=>(240&t)>>4==(15&t);function At(t){var e=(t=>Ot(t.r)&&Ot(t.g)&&Ot(t.b)&&Ot(t.a))(t)?Dt:Ct;return t?"#"+e(t.r)+e(t.g)+e(t.b)+((t,e)=>t<255?e(t):"")(t.a,e):void 0}const Tt=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function Lt(t,e,i){const s=e*Math.min(i,1-i),n=(e,n=(e+t/30)%12)=>i-s*Math.max(Math.min(n-3,9-n,1),-1);return[n(0),n(8),n(4)]}function Et(t,e,i){const s=(s,n=(s+t/60)%6)=>i-i*e*Math.max(Math.min(n,4-n,1),0);return[s(5),s(3),s(1)]}function Rt(t,e,i){const s=Lt(t,1,.5);let n;for(e+i>1&&(n=1/(e+i),e*=n,i*=n),n=0;n<3;n++)s[n]*=1-e-i,s[n]+=e;return s}function It(t){const e=t.r/255,i=t.g/255,s=t.b/255,n=Math.max(e,i,s),o=Math.min(e,i,s),a=(n+o)/2;let r,l,h;return n!==o&&(h=n-o,l=a>.5?h/(2-n-o):h/(n+o),r=function(t,e,i,s,n){return t===n?(e-i)/s+(e<i?6:0):e===n?(i-t)/s+2:(t-e)/s+4}(e,i,s,h,n),r=60*r+.5),[0|r,l||0,a]}function zt(t,e,i,s){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,s)).map(Mt)}function Ft(t,e,i){return zt(Lt,t,e,i)}function Vt(t){return(t%360+360)%360}function Bt(t){const e=Tt.exec(t);let i,s=255;if(!e)return;e[5]!==i&&(s=e[6]?vt(+e[5]):Mt(+e[5]));const n=Vt(+e[2]),o=+e[3]/100,a=+e[4]/100;return i="hwb"===e[1]?function(t,e,i){return zt(Rt,t,e,i)}(n,o,a):"hsv"===e[1]?function(t,e,i){return zt(Et,t,e,i)}(n,o,a):Ft(n,o,a),{r:i[0],g:i[1],b:i[2],a:s}}const Wt={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},Nt={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};let Ht;function jt(t){Ht||(Ht=function(){const t={},e=Object.keys(Nt),i=Object.keys(Wt);let s,n,o,a,r;for(s=0;s<e.length;s++){for(a=r=e[s],n=0;n<i.length;n++)o=i[n],r=r.replace(o,Wt[o]);o=parseInt(Nt[a],16),t[r]=[o>>16&255,o>>8&255,255&o]}return t}(),Ht.transparent=[0,0,0,0]);const e=Ht[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}const $t=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;const Yt=t=>t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055,Ut=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function Xt(t,e,i){if(t){let s=It(t);s[e]=Math.max(0,Math.min(s[e]+s[e]*i,0===e?360:1)),s=Ft(s),t.r=s[0],t.g=s[1],t.b=s[2]}}function qt(t,e){return t?Object.assign(e||{},t):t}function Kt(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=Mt(t[3]))):(e=qt(t,{r:0,g:0,b:0,a:1})).a=Mt(e.a),e}function Gt(t){return"r"===t.charAt(0)?function(t){const e=$t.exec(t);let i,s,n,o=255;if(e){if(e[7]!==i){const t=+e[7];o=e[8]?vt(t):yt(255*t,0,255)}return i=+e[1],s=+e[3],n=+e[5],i=255&(e[2]?vt(i):yt(i,0,255)),s=255&(e[4]?vt(s):yt(s,0,255)),n=255&(e[6]?vt(n):yt(n,0,255)),{r:i,g:s,b:n,a:o}}}(t):Bt(t)}class Zt{constructor(t){if(t instanceof Zt)return t;const e=typeof t;let i;var s,n,o;"object"===e?i=Kt(t):"string"===e&&(o=(s=t).length,"#"===s[0]&&(4===o||5===o?n={r:255&17*St[s[1]],g:255&17*St[s[2]],b:255&17*St[s[3]],a:5===o?17*St[s[4]]:255}:7!==o&&9!==o||(n={r:St[s[1]]<<4|St[s[2]],g:St[s[3]]<<4|St[s[4]],b:St[s[5]]<<4|St[s[6]],a:9===o?St[s[7]]<<4|St[s[8]]:255})),i=n||jt(t)||Gt(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=qt(this._rgb);return t&&(t.a=wt(t.a)),t}set rgb(t){this._rgb=Kt(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${wt(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):void 0;var t}hexString(){return this._valid?At(this._rgb):void 0}hslString(){return this._valid?function(t){if(!t)return;const e=It(t),i=e[0],s=kt(e[1]),n=kt(e[2]);return t.a<255?`hsla(${i}, ${s}%, ${n}%, ${wt(t.a)})`:`hsl(${i}, ${s}%, ${n}%)`}(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,s=t.rgb;let n;const o=e===n?.5:e,a=2*o-1,r=i.a-s.a,l=((a*r==-1?a:(a+r)/(1+a*r))+1)/2;n=1-l,i.r=255&l*i.r+n*s.r+.5,i.g=255&l*i.g+n*s.g+.5,i.b=255&l*i.b+n*s.b+.5,i.a=o*i.a+(1-o)*s.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=function(t,e,i){const s=Ut(wt(t.r)),n=Ut(wt(t.g)),o=Ut(wt(t.b));return{r:Mt(Yt(s+i*(Ut(wt(e.r))-s))),g:Mt(Yt(n+i*(Ut(wt(e.g))-n))),b:Mt(Yt(o+i*(Ut(wt(e.b))-o))),a:t.a+i*(e.a-t.a)}}(this._rgb,t._rgb,e)),this}clone(){return new Zt(this.rgb)}alpha(t){return this._rgb.a=Mt(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=_t(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return Xt(this._rgb,2,t),this}darken(t){return Xt(this._rgb,2,-t),this}saturate(t){return Xt(this._rgb,1,t),this}desaturate(t){return Xt(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=It(t);i[0]=Vt(i[0]+e),i=Ft(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function Jt(t){if(t&&"object"==typeof t){const e=t.toString();return"[object CanvasPattern]"===e||"[object CanvasGradient]"===e}return!1}function Qt(t){return Jt(t)?t:new Zt(t)}function te(t){return Jt(t)?t:new Zt(t).saturate(.5).darken(.1).hexString()}const ee=["x","y","borderWidth","radius","tension"],ie=["color","borderColor","backgroundColor"];const se=new Map;function ne(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let s=se.get(i);return s||(s=new Intl.NumberFormat(t,e),se.set(i,s)),s}(e,i).format(t)}const oe={values:t=>n(t)?t:""+t,numeric(t,e,i){if(0===t)return"0";const s=this.chart.options.locale;let n,o=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(n="scientific"),o=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>=1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=z(Math.abs(o)),r=isNaN(a)?1:Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:n,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),ne(t,s,l)},logarithmic(t,e,i){if(0===t)return"0";const s=i[e].significand||t/Math.pow(10,Math.floor(z(t)));return[1,2,3,5,10,15].includes(s)||e>.8*i.length?oe.numeric.call(this,t,e,i):""}};var ae={formatters:oe};const re=Object.create(null),le=Object.create(null);function he(t,e){if(!e)return t;const i=e.split(".");for(let e=0,s=i.length;e<s;++e){const s=i[e];t=t[s]||(t[s]=Object.create(null))}return t}function ce(t,e,i){return"string"==typeof e?b(he(t,e),i):b(he(t,""),e)}class de{constructor(t,e){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>te(e.backgroundColor),this.hoverBorderColor=(t,e)=>te(e.borderColor),this.hoverColor=(t,e)=>te(e.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return ce(this,t,e)}get(t){return he(this,t)}describe(t,e){return ce(le,t,e)}override(t,e){return ce(re,t,e)}route(t,e,i,s){const n=he(this,t),a=he(this,i),r="_"+e;Object.defineProperties(n,{[r]:{value:n[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[r],e=a[s];return o(t)?Object.assign({},e,t):l(t,e)},set(t){this[r]=t}}})}apply(t){t.forEach((t=>t(this)))}}var ue=new de({_scriptable:t=>!t.startsWith("on"),_indexable:t=>"events"!==t,hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}},[function(t){t.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),t.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>"onProgress"!==t&&"onComplete"!==t&&"fn"!==t}),t.set("animations",{colors:{type:"color",properties:ie},numbers:{type:"number",properties:ee}}),t.describe("animations",{_fallback:"animation"}),t.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>0|t}}}})},function(t){t.set("layout",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})},function(t){t.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:ae.formatters.values,minor:{},major:{},align:"center",crossAlign:"near",showLabelBackdrop:!1,backdropColor:"rgba(255, 255, 255, 0.75)",backdropPadding:2}}),t.route("scale.ticks","color","","color"),t.route("scale.grid","color","","borderColor"),t.route("scale.border","color","","borderColor"),t.route("scale.title","color","","color"),t.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&"callback"!==t&&"parser"!==t,_indexable:t=>"borderDash"!==t&&"tickBorderDash"!==t&&"dash"!==t}),t.describe("scales",{_fallback:"scale"}),t.describe("scale.ticks",{_scriptable:t=>"backdropPadding"!==t&&"callback"!==t,_indexable:t=>"backdropPadding"!==t})}]);function fe(){return"undefined"!=typeof window&&"undefined"!=typeof document}function ge(t){let e=t.parentNode;return e&&"[object ShadowRoot]"===e.toString()&&(e=e.host),e}function pe(t,e,i){let s;return"string"==typeof t?(s=parseInt(t,10),-1!==t.indexOf("%")&&(s=s/100*e.parentNode[i])):s=t,s}const me=t=>t.ownerDocument.defaultView.getComputedStyle(t,null);function be(t,e){return me(t).getPropertyValue(e)}const xe=["top","right","bottom","left"];function _e(t,e,i){const s={};i=i?"-"+i:"";for(let n=0;n<4;n++){const o=xe[n];s[o]=parseFloat(t[e+"-"+o+i])||0}return s.width=s.left+s.right,s.height=s.top+s.bottom,s}const ye=(t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot);function ve(t,e){if("native"in t)return t;const{canvas:i,currentDevicePixelRatio:s}=e,n=me(i),o="border-box"===n.boxSizing,a=_e(n,"padding"),r=_e(n,"border","width"),{x:l,y:h,box:c}=function(t,e){const i=t.touches,s=i&&i.length?i[0]:t,{offsetX:n,offsetY:o}=s;let a,r,l=!1;if(ye(n,o,t.target))a=n,r=o;else{const t=e.getBoundingClientRect();a=s.clientX-t.left,r=s.clientY-t.top,l=!0}return{x:a,y:r,box:l}}(t,i),d=a.left+(c&&r.left),u=a.top+(c&&r.top);let{width:f,height:g}=e;return o&&(f-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/f*i.width/s),y:Math.round((h-u)/g*i.height/s)}}const Me=t=>Math.round(10*t)/10;function we(t,e,i,s){const n=me(t),o=_e(n,"margin"),a=pe(n.maxWidth,t,"clientWidth")||T,r=pe(n.maxHeight,t,"clientHeight")||T,l=function(t,e,i){let s,n;if(void 0===e||void 0===i){const o=ge(t);if(o){const t=o.getBoundingClientRect(),a=me(o),r=_e(a,"border","width"),l=_e(a,"padding");e=t.width-l.width-r.width,i=t.height-l.height-r.height,s=pe(a.maxWidth,o,"clientWidth"),n=pe(a.maxHeight,o,"clientHeight")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:s||T,maxHeight:n||T}}(t,e,i);let{width:h,height:c}=l;if("content-box"===n.boxSizing){const t=_e(n,"border","width"),e=_e(n,"padding");h-=e.width+t.width,c-=e.height+t.height}h=Math.max(0,h-o.width),c=Math.max(0,s?h/s:c-o.height),h=Me(Math.min(h,a,l.maxWidth)),c=Me(Math.min(c,r,l.maxHeight)),h&&!c&&(c=Me(h/2));return(void 0!==e||void 0!==i)&&s&&l.height&&c>l.height&&(c=l.height,h=Me(Math.floor(c*s))),{width:h,height:c}}function ke(t,e,i){const s=e||1,n=Math.floor(t.height*s),o=Math.floor(t.width*s);t.height=Math.floor(t.height),t.width=Math.floor(t.width);const a=t.canvas;return a.style&&(i||!a.style.height&&!a.style.width)&&(a.style.height=`${t.height}px`,a.style.width=`${t.width}px`),(t.currentDevicePixelRatio!==s||a.height!==n||a.width!==o)&&(t.currentDevicePixelRatio=s,a.height=n,a.width=o,t.ctx.setTransform(s,0,0,s,0,0),!0)}const Se=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};fe()&&(window.addEventListener("test",null,e),window.removeEventListener("test",null,e))}catch(t){}return t}();function Pe(t,e){const i=be(t,e),s=i&&i.match(/^(\d+)(\.\d+)?px$/);return s?+s[1]:void 0}function De(t){return!t||s(t.size)||s(t.family)?null:(t.style?t.style+" ":"")+(t.weight?t.weight+" ":"")+t.size+"px "+t.family}function Ce(t,e,i,s,n){let o=e[n];return o||(o=e[n]=t.measureText(n).width,i.push(n)),o>s&&(s=o),s}function Oe(t,e,i,s){let o=(s=s||{}).data=s.data||{},a=s.garbageCollect=s.garbageCollect||[];s.font!==e&&(o=s.data={},a=s.garbageCollect=[],s.font=e),t.save(),t.font=e;let r=0;const l=i.length;let h,c,d,u,f;for(h=0;h<l;h++)if(u=i[h],null==u||n(u)){if(n(u))for(c=0,d=u.length;c<d;c++)f=u[c],null==f||n(f)||(r=Ce(t,o,a,r,f))}else r=Ce(t,o,a,r,u);t.restore();const g=a.length/2;if(g>i.length){for(h=0;h<g;h++)delete o[a[h]];a.splice(0,g)}return r}function Ae(t,e,i){const s=t.currentDevicePixelRatio,n=0!==i?Math.max(i/2,.5):0;return Math.round((e-n)*s)/s+n}function Te(t,e){(e=e||t.getContext("2d")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore()}function Le(t,e,i,s){Ee(t,e,i,s,null)}function Ee(t,e,i,s,n){let o,a,r,l,h,c,d,u;const f=e.pointStyle,g=e.rotation,p=e.radius;let m=(g||0)*L;if(f&&"object"==typeof f&&(o=f.toString(),"[object HTMLImageElement]"===o||"[object HTMLCanvasElement]"===o))return t.save(),t.translate(i,s),t.rotate(m),t.drawImage(f,-f.width/2,-f.height/2,f.width,f.height),void t.restore();if(!(isNaN(p)||p<=0)){switch(t.beginPath(),f){default:n?t.ellipse(i,s,n/2,p,0,0,O):t.arc(i,s,p,0,O),t.closePath();break;case"triangle":c=n?n/2:p,t.moveTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),t.closePath();break;case"rectRounded":h=.516*p,l=p-h,a=Math.cos(m+R)*l,d=Math.cos(m+R)*(n?n/2-h:l),r=Math.sin(m+R)*l,u=Math.sin(m+R)*(n?n/2-h:l),t.arc(i-d,s-r,h,m-C,m-E),t.arc(i+u,s-a,h,m-E,m),t.arc(i+d,s+r,h,m,m+E),t.arc(i-u,s+a,h,m+E,m+C),t.closePath();break;case"rect":if(!g){l=Math.SQRT1_2*p,c=n?n/2:l,t.rect(i-c,s-l,2*c,2*l);break}m+=R;case"rectRot":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+u,s-a),t.lineTo(i+d,s+r),t.lineTo(i-u,s+a),t.closePath();break;case"crossRot":m+=R;case"cross":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"star":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a),m+=R,d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"line":a=n?n/2:Math.cos(m)*p,r=Math.sin(m)*p,t.moveTo(i-a,s-r),t.lineTo(i+a,s+r);break;case"dash":t.moveTo(i,s),t.lineTo(i+Math.cos(m)*(n?n/2:p),s+Math.sin(m)*p);break;case!1:t.closePath()}t.fill(),e.borderWidth>0&&t.stroke()}}function Re(t,e,i){return i=i||.5,!e||t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function Ie(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()}function ze(t){t.restore()}function Fe(t,e,i,s,n){if(!e)return t.lineTo(i.x,i.y);if("middle"===n){const s=(e.x+i.x)/2;t.lineTo(s,e.y),t.lineTo(s,i.y)}else"after"===n!=!!s?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function Ve(t,e,i,s){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(s?e.cp1x:e.cp2x,s?e.cp1y:e.cp2y,s?i.cp2x:i.cp1x,s?i.cp2y:i.cp1y,i.x,i.y)}function Be(t,e,i,s,n){if(n.strikethrough||n.underline){const o=t.measureText(s),a=e-o.actualBoundingBoxLeft,r=e+o.actualBoundingBoxRight,l=i-o.actualBoundingBoxAscent,h=i+o.actualBoundingBoxDescent,c=n.strikethrough?(l+h)/2:h;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=n.decorationWidth||2,t.moveTo(a,c),t.lineTo(r,c),t.stroke()}}function We(t,e){const i=t.fillStyle;t.fillStyle=e.color,t.fillRect(e.left,e.top,e.width,e.height),t.fillStyle=i}function Ne(t,e,i,o,a,r={}){const l=n(e)?e:[e],h=r.strokeWidth>0&&""!==r.strokeColor;let c,d;for(t.save(),t.font=a.string,function(t,e){e.translation&&t.translate(e.translation[0],e.translation[1]),s(e.rotation)||t.rotate(e.rotation),e.color&&(t.fillStyle=e.color),e.textAlign&&(t.textAlign=e.textAlign),e.textBaseline&&(t.textBaseline=e.textBaseline)}(t,r),c=0;c<l.length;++c)d=l[c],r.backdrop&&We(t,r.backdrop),h&&(r.strokeColor&&(t.strokeStyle=r.strokeColor),s(r.strokeWidth)||(t.lineWidth=r.strokeWidth),t.strokeText(d,i,o,r.maxWidth)),t.fillText(d,i,o,r.maxWidth),Be(t,i,o,d,r),o+=Number(a.lineHeight);t.restore()}function He(t,e){const{x:i,y:s,w:n,h:o,radius:a}=e;t.arc(i+a.topLeft,s+a.topLeft,a.topLeft,1.5*C,C,!0),t.lineTo(i,s+o-a.bottomLeft),t.arc(i+a.bottomLeft,s+o-a.bottomLeft,a.bottomLeft,C,E,!0),t.lineTo(i+n-a.bottomRight,s+o),t.arc(i+n-a.bottomRight,s+o-a.bottomRight,a.bottomRight,E,0,!0),t.lineTo(i+n,s+a.topRight),t.arc(i+n-a.topRight,s+a.topRight,a.topRight,0,-E,!0),t.lineTo(i+a.topLeft,s)}function je(t,e=[""],i,s,n=(()=>t[0])){const o=i||t;void 0===s&&(s=ti("_fallback",t));const a={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:t,_rootScopes:o,_fallback:s,_getTarget:n,override:i=>je([i,...t],e,o,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,s)=>qe(i,s,(()=>function(t,e,i,s){let n;for(const o of e)if(n=ti(Ue(o,t),i),void 0!==n)return Xe(t,n)?Je(i,s,t,n):n}(s,e,t,i))),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>ei(t).includes(e),ownKeys:t=>ei(t),set(t,e,i){const s=t._storage||(t._storage=n());return t[e]=s[e]=i,delete t._keys,!0}})}function $e(t,e,i,s){const a={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Ye(t,s),setContext:e=>$e(t,e,i,s),override:n=>$e(t.override(n),e,i,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>qe(t,e,(()=>function(t,e,i){const{_proxy:s,_context:a,_subProxy:r,_descriptors:l}=t;let h=s[e];S(h)&&l.isScriptable(e)&&(h=function(t,e,i,s){const{_proxy:n,_context:o,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error("Recursion detected: "+Array.from(r).join("->")+"->"+t);r.add(t);let l=e(o,a||s);r.delete(t),Xe(t,l)&&(l=Je(n._scopes,n,t,l));return l}(e,h,t,i));n(h)&&h.length&&(h=function(t,e,i,s){const{_proxy:n,_context:a,_subProxy:r,_descriptors:l}=i;if(void 0!==a.index&&s(t))return e[a.index%e.length];if(o(e[0])){const i=e,s=n._scopes.filter((t=>t!==i));e=[];for(const o of i){const i=Je(s,n,t,o);e.push($e(i,a,r&&r[t],l))}}return e}(e,h,t,l.isIndexable));Xe(e,h)&&(h=$e(h,a,r&&r[e],l));return h}(t,e,i))),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,s)=>(t[i]=s,delete e[i],!0)})}function Ye(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:s=e.indexable,_allKeys:n=e.allKeys}=t;return{allKeys:n,scriptable:i,indexable:s,isScriptable:S(i)?i:()=>i,isIndexable:S(s)?s:()=>s}}const Ue=(t,e)=>t?t+w(e):e,Xe=(t,e)=>o(e)&&"adapters"!==t&&(null===Object.getPrototypeOf(e)||e.constructor===Object);function qe(t,e,i){if(Object.prototype.hasOwnProperty.call(t,e))return t[e];const s=i();return t[e]=s,s}function Ke(t,e,i){return S(t)?t(e,i):t}const Ge=(t,e)=>!0===t?e:"string"==typeof t?M(e,t):void 0;function Ze(t,e,i,s,n){for(const o of e){const e=Ge(i,o);if(e){t.add(e);const o=Ke(e._fallback,i,n);if(void 0!==o&&o!==i&&o!==s)return o}else if(!1===e&&void 0!==s&&i!==s)return null}return!1}function Je(t,e,i,s){const a=e._rootScopes,r=Ke(e._fallback,i,s),l=[...t,...a],h=new Set;h.add(s);let c=Qe(h,l,i,r||i,s);return null!==c&&((void 0===r||r===i||(c=Qe(h,l,r,c,s),null!==c))&&je(Array.from(h),[""],a,r,(()=>function(t,e,i){const s=t._getTarget();e in s||(s[e]={});const a=s[e];if(n(a)&&o(i))return i;return a||{}}(e,i,s))))}function Qe(t,e,i,s,n){for(;i;)i=Ze(t,e,i,s,n);return i}function ti(t,e){for(const i of e){if(!i)continue;const e=i[t];if(void 0!==e)return e}}function ei(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter((t=>!t.startsWith("_"))))e.add(t);return Array.from(e)}(t._scopes)),e}function ii(t,e,i,s){const{iScale:n}=t,{key:o="r"}=this._parsing,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={r:n.parse(M(c,o),h)};return a}const si=Number.EPSILON||1e-14,ni=(t,e)=>e<t.length&&!t[e].skip&&t[e],oi=t=>"x"===t?"y":"x";function ai(t,e,i,s){const n=t.skip?e:t,o=e,a=i.skip?e:i,r=q(o,n),l=q(a,o);let h=r/(r+l),c=l/(r+l);h=isNaN(h)?0:h,c=isNaN(c)?0:c;const d=s*h,u=s*c;return{previous:{x:o.x-d*(a.x-n.x),y:o.y-d*(a.y-n.y)},next:{x:o.x+u*(a.x-n.x),y:o.y+u*(a.y-n.y)}}}function ri(t,e="x"){const i=oi(e),s=t.length,n=Array(s).fill(0),o=Array(s);let a,r,l,h=ni(t,0);for(a=0;a<s;++a)if(r=l,l=h,h=ni(t,a+1),l){if(h){const t=h[e]-l[e];n[a]=0!==t?(h[i]-l[i])/t:0}o[a]=r?h?F(n[a-1])!==F(n[a])?0:(n[a-1]+n[a])/2:n[a-1]:n[a]}!function(t,e,i){const s=t.length;let n,o,a,r,l,h=ni(t,0);for(let c=0;c<s-1;++c)l=h,h=ni(t,c+1),l&&h&&(V(e[c],0,si)?i[c]=i[c+1]=0:(n=i[c]/e[c],o=i[c+1]/e[c],r=Math.pow(n,2)+Math.pow(o,2),r<=9||(a=3/Math.sqrt(r),i[c]=n*a*e[c],i[c+1]=o*a*e[c])))}(t,n,o),function(t,e,i="x"){const s=oi(i),n=t.length;let o,a,r,l=ni(t,0);for(let h=0;h<n;++h){if(a=r,r=l,l=ni(t,h+1),!r)continue;const n=r[i],c=r[s];a&&(o=(n-a[i])/3,r[`cp1${i}`]=n-o,r[`cp1${s}`]=c-o*e[h]),l&&(o=(l[i]-n)/3,r[`cp2${i}`]=n+o,r[`cp2${s}`]=c+o*e[h])}}(t,o,e)}function li(t,e,i){return Math.max(Math.min(t,i),e)}function hi(t,e,i,s,n){let o,a,r,l;if(e.spanGaps&&(t=t.filter((t=>!t.skip))),"monotone"===e.cubicInterpolationMode)ri(t,n);else{let i=s?t[t.length-1]:t[0];for(o=0,a=t.length;o<a;++o)r=t[o],l=ai(i,r,t[Math.min(o+1,a-(s?0:1))%a],e.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,i=r}e.capBezierPoints&&function(t,e){let i,s,n,o,a,r=Re(t[0],e);for(i=0,s=t.length;i<s;++i)a=o,o=r,r=i<s-1&&Re(t[i+1],e),o&&(n=t[i],a&&(n.cp1x=li(n.cp1x,e.left,e.right),n.cp1y=li(n.cp1y,e.top,e.bottom)),r&&(n.cp2x=li(n.cp2x,e.left,e.right),n.cp2y=li(n.cp2y,e.top,e.bottom)))}(t,i)}const ci=t=>0===t||1===t,di=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*O/i),ui=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*O/i)+1,fi={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*E),easeOutSine:t=>Math.sin(t*E),easeInOutSine:t=>-.5*(Math.cos(C*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>ci(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>ci(t)?t:di(t,.075,.3),easeOutElastic:t=>ci(t)?t:ui(t,.075,.3),easeInOutElastic(t){const e=.1125;return ci(t)?t:t<.5?.5*di(2*t,e,.45):.5+.5*ui(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-fi.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*fi.easeInBounce(2*t):.5*fi.easeOutBounce(2*t-1)+.5};function gi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function pi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:"middle"===s?i<.5?t.y:e.y:"after"===s?i<1?t.y:e.y:i>0?e.y:t.y}}function mi(t,e,i,s){const n={x:t.cp2x,y:t.cp2y},o={x:e.cp1x,y:e.cp1y},a=gi(t,n,i),r=gi(n,o,i),l=gi(o,e,i),h=gi(a,r,i),c=gi(r,l,i);return gi(h,c,i)}const bi=/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,xi=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function _i(t,e){const i=(""+t).match(bi);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t}const yi=t=>+t||0;function vi(t,e){const i={},s=o(e),n=s?Object.keys(e):e,a=o(t)?s?i=>l(t[i],t[e[i]]):e=>t[e]:()=>t;for(const t of n)i[t]=yi(a(t));return i}function Mi(t){return vi(t,{top:"y",right:"x",bottom:"y",left:"x"})}function wi(t){return vi(t,["topLeft","topRight","bottomLeft","bottomRight"])}function ki(t){const e=Mi(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function Si(t,e){t=t||{},e=e||ue.font;let i=l(t.size,e.size);"string"==typeof i&&(i=parseInt(i,10));let s=l(t.style,e.style);s&&!(""+s).match(xi)&&(console.warn('Invalid font style specified: "'+s+'"'),s=void 0);const n={family:l(t.family,e.family),lineHeight:_i(l(t.lineHeight,e.lineHeight),i),size:i,style:s,weight:l(t.weight,e.weight),string:""};return n.string=De(n),n}function Pi(t,e,i,s){let o,a,r,l=!0;for(o=0,a=t.length;o<a;++o)if(r=t[o],void 0!==r&&(void 0!==e&&"function"==typeof r&&(r=r(e),l=!1),void 0!==i&&n(r)&&(r=r[i%r.length],l=!1),void 0!==r))return s&&!l&&(s.cacheable=!1),r}function Di(t,e,i){const{min:s,max:n}=t,o=c(e,(n-s)/2),a=(t,e)=>i&&0===t?0:t+e;return{min:a(s,-Math.abs(o)),max:a(n,o)}}function Ci(t,e){return Object.assign(Object.create(t),e)}function Oi(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>"center"===t?t:"right"===t?"left":"right",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function Ai(t,e){let i,s;"ltr"!==e&&"rtl"!==e||(i=t.canvas.style,s=[i.getPropertyValue("direction"),i.getPropertyPriority("direction")],i.setProperty("direction",e,"important"),t.prevTextDirection=s)}function Ti(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty("direction",e[0],e[1]))}function Li(t){return"angle"===t?{between:Z,compare:K,normalize:G}:{between:tt,compare:(t,e)=>t-e,normalize:t=>t}}function Ei({start:t,end:e,count:i,loop:s,style:n}){return{start:t%i,end:e%i,loop:s&&(e-t+1)%i==0,style:n}}function Ri(t,e,i){if(!i)return[t];const{property:s,start:n,end:o}=i,a=e.length,{compare:r,between:l,normalize:h}=Li(s),{start:c,end:d,loop:u,style:f}=function(t,e,i){const{property:s,start:n,end:o}=i,{between:a,normalize:r}=Li(s),l=e.length;let h,c,{start:d,end:u,loop:f}=t;if(f){for(d+=l,u+=l,h=0,c=l;h<c&&a(r(e[d%l][s]),n,o);++h)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:f,style:t.style}}(t,e,i),g=[];let p,m,b,x=!1,_=null;const y=()=>x||l(n,b,p)&&0!==r(n,b),v=()=>!x||0===r(o,p)||l(o,b,p);for(let t=c,i=c;t<=d;++t)m=e[t%a],m.skip||(p=h(m[s]),p!==b&&(x=l(p,n,o),null===_&&y()&&(_=0===r(p,n)?t:i),null!==_&&v()&&(g.push(Ei({start:_,end:t,loop:u,count:a,style:f})),_=null),i=t,b=p));return null!==_&&g.push(Ei({start:_,end:d,loop:u,count:a,style:f})),g}function Ii(t,e){const i=[],s=t.segments;for(let n=0;n<s.length;n++){const o=Ri(s[n],t.points,e);o.length&&i.push(...o)}return i}function zi(t,e){const i=t.points,s=t.options.spanGaps,n=i.length;if(!n)return[];const o=!!t._loop,{start:a,end:r}=function(t,e,i,s){let n=0,o=e-1;if(i&&!s)for(;n<e&&!t[n].skip;)n++;for(;n<e&&t[n].skip;)n++;for(n%=e,i&&(o+=n);o>n&&t[o%e].skip;)o--;return o%=e,{start:n,end:o}}(i,n,o,s);if(!0===s)return Fi(t,[{start:a,end:r,loop:o}],i,e);return Fi(t,function(t,e,i,s){const n=t.length,o=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%n];i.skip||i.stop?l.skip||(s=!1,o.push({start:e%n,end:(a-1)%n,loop:s}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&o.push({start:e%n,end:r%n,loop:s}),o}(i,a,r<a?r+n:r,!!t._fullLoop&&0===a&&r===n-1),i,e)}function Fi(t,e,i,s){return s&&s.setContext&&i?function(t,e,i,s){const n=t._chart.getContext(),o=Vi(t.options),{_datasetIndex:a,options:{spanGaps:r}}=t,l=i.length,h=[];let c=o,d=e[0].start,u=d;function f(t,e,s,n){const o=r?-1:1;if(t!==e){for(t+=l;i[t%l].skip;)t-=o;for(;i[e%l].skip;)e+=o;t%l!=e%l&&(h.push({start:t%l,end:e%l,loop:s,style:n}),c=n,d=e%l)}}for(const t of e){d=r?d:t.start;let e,o=i[d%l];for(u=d+1;u<=t.end;u++){const r=i[u%l];e=Vi(s.setContext(Ci(n,{type:"segment",p0:o,p1:r,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:a}))),Bi(e,c)&&f(d,u-1,t.loop,c),o=r,c=e}d<u-1&&f(d,u-1,t.loop,c)}return h}(t,e,i,s):e}function Vi(t){return{backgroundColor:t.backgroundColor,borderCapStyle:t.borderCapStyle,borderDash:t.borderDash,borderDashOffset:t.borderDashOffset,borderJoinStyle:t.borderJoinStyle,borderWidth:t.borderWidth,borderColor:t.borderColor}}function Bi(t,e){if(!e)return!1;const i=[],s=function(t,e){return Jt(e)?(i.includes(e)||i.push(e),i.indexOf(e)):e};return JSON.stringify(t,s)!==JSON.stringify(e,s)}var Wi=Object.freeze({__proto__:null,HALF_PI:E,INFINITY:T,PI:C,PITAU:A,QUARTER_PI:R,RAD_PER_DEG:L,TAU:O,TWO_THIRDS_PI:I,_addGrace:Di,_alignPixel:Ae,_alignStartEnd:ft,_angleBetween:Z,_angleDiff:K,_arrayUnique:lt,_attachContext:$e,_bezierCurveTo:Ve,_bezierInterpolation:mi,_boundSegment:Ri,_boundSegments:Ii,_capitalize:w,_computeSegments:zi,_createResolver:je,_decimalPlaces:U,_deprecated:function(t,e,i,s){void 0!==e&&console.warn(t+': "'+i+'" is deprecated. Please use "'+s+'" instead')},_descriptors:Ye,_elementsEqual:f,_factorize:W,_filterBetween:nt,_getParentNode:ge,_getStartAndCountOfVisiblePoints:pt,_int16Range:Q,_isBetween:tt,_isClickEvent:D,_isDomSupported:fe,_isPointInArea:Re,_limitValue:J,_longestText:Oe,_lookup:et,_lookupByKey:it,_measureText:Ce,_merger:m,_mergerIf:_,_normalizeAngle:G,_parseObjectDataRadialScale:ii,_pointInLine:gi,_readValueToProps:vi,_rlookupByKey:st,_scaleRangesChanged:mt,_setMinAndMaxByKey:j,_splitKey:v,_steppedInterpolation:pi,_steppedLineTo:Fe,_textX:gt,_toLeftRightCenter:ut,_updateBezierControlPoints:hi,addRoundedRectPath:He,almostEquals:V,almostWhole:H,callback:d,clearCanvas:Te,clipArea:Ie,clone:g,color:Qt,createContext:Ci,debounce:dt,defined:k,distanceBetweenPoints:q,drawPoint:Le,drawPointLegend:Ee,each:u,easingEffects:fi,finiteOrDefault:r,fontString:function(t,e,i){return e+" "+t+"px "+i},formatNumber:ne,getAngleFromPoint:X,getHoverColor:te,getMaximumSize:we,getRelativePosition:ve,getRtlAdapter:Oi,getStyle:be,isArray:n,isFinite:a,isFunction:S,isNullOrUndef:s,isNumber:N,isObject:o,isPatternOrGradient:Jt,listenArrayEvents:at,log10:z,merge:b,mergeIf:x,niceNum:B,noop:e,overrideTextDirection:Ai,readUsedSize:Pe,renderText:Ne,requestAnimFrame:ht,resolve:Pi,resolveObjectKey:M,restoreTextDirection:Ti,retinaScale:ke,setsEqual:P,sign:F,splineCurve:ai,splineCurveMonotone:ri,supportsEventListenerOptions:Se,throttled:ct,toDegrees:Y,toDimension:c,toFont:Si,toFontString:De,toLineHeight:_i,toPadding:ki,toPercentage:h,toRadians:$,toTRBL:Mi,toTRBLCorners:wi,uid:i,unclipArea:ze,unlistenArrayEvents:rt,valueOrDefault:l});function Ni(t,e,i,s){const{controller:n,data:o,_sorted:a}=t,r=n._cachedMeta.iScale;if(r&&e===r.axis&&"r"!==e&&a&&o.length){const t=r._reversePixels?st:it;if(!s)return t(o,e,i);if(n._sharedOptions){const s=o[0],n="function"==typeof s.getRange&&s.getRange(e);if(n){const s=t(o,e,i-n),a=t(o,e,i+n);return{lo:s.lo,hi:a.hi}}}}return{lo:0,hi:o.length-1}}function Hi(t,e,i,s,n){const o=t.getSortedVisibleDatasetMetas(),a=i[e];for(let t=0,i=o.length;t<i;++t){const{index:i,data:r}=o[t],{lo:l,hi:h}=Ni(o[t],e,a,n);for(let t=l;t<=h;++t){const e=r[t];e.skip||s(e,i,t)}}}function ji(t,e,i,s,n){const o=[];if(!n&&!t.isPointInArea(e))return o;return Hi(t,i,e,(function(i,a,r){(n||Re(i,t.chartArea,0))&&i.inRange(e.x,e.y,s)&&o.push({element:i,datasetIndex:a,index:r})}),!0),o}function $i(t,e,i,s,n,o){let a=[];const r=function(t){const e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,s){const n=e?Math.abs(t.x-s.x):0,o=i?Math.abs(t.y-s.y):0;return Math.sqrt(Math.pow(n,2)+Math.pow(o,2))}}(i);let l=Number.POSITIVE_INFINITY;return Hi(t,i,e,(function(i,h,c){const d=i.inRange(e.x,e.y,n);if(s&&!d)return;const u=i.getCenterPoint(n);if(!(!!o||t.isPointInArea(u))&&!d)return;const f=r(e,u);f<l?(a=[{element:i,datasetIndex:h,index:c}],l=f):f===l&&a.push({element:i,datasetIndex:h,index:c})})),a}function Yi(t,e,i,s,n,o){return o||t.isPointInArea(e)?"r"!==i||s?$i(t,e,i,s,n,o):function(t,e,i,s){let n=[];return Hi(t,i,e,(function(t,i,o){const{startAngle:a,endAngle:r}=t.getProps(["startAngle","endAngle"],s),{angle:l}=X(t,{x:e.x,y:e.y});Z(l,a,r)&&n.push({element:t,datasetIndex:i,index:o})})),n}(t,e,i,n):[]}function Ui(t,e,i,s,n){const o=[],a="x"===i?"inXRange":"inYRange";let r=!1;return Hi(t,i,e,((t,s,l)=>{t[a](e[i],n)&&(o.push({element:t,datasetIndex:s,index:l}),r=r||t.inRange(e.x,e.y,n))})),s&&!r?[]:o}var Xi={evaluateInteractionItems:Hi,modes:{index(t,e,i,s){const n=ve(e,t),o=i.axis||"x",a=i.includeInvisible||!1,r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a),l=[];return r.length?(t.getSortedVisibleDatasetMetas().forEach((t=>{const e=r[0].index,i=t.data[e];i&&!i.skip&&l.push({element:i,datasetIndex:t.index,index:e})})),l):[]},dataset(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;let r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a);if(r.length>0){const e=r[0].datasetIndex,i=t.getDatasetMeta(e).data;r=[];for(let t=0;t<i.length;++t)r.push({element:i[t],datasetIndex:e,index:t})}return r},point:(t,e,i,s)=>ji(t,ve(e,t),i.axis||"xy",s,i.includeInvisible||!1),nearest(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;return Yi(t,n,o,i.intersect,s,a)},x:(t,e,i,s)=>Ui(t,ve(e,t),"x",i.intersect,s),y:(t,e,i,s)=>Ui(t,ve(e,t),"y",i.intersect,s)}};const qi=["left","top","right","bottom"];function Ki(t,e){return t.filter((t=>t.pos===e))}function Gi(t,e){return t.filter((t=>-1===qi.indexOf(t.pos)&&t.box.axis===e))}function Zi(t,e){return t.sort(((t,i)=>{const s=e?i:t,n=e?t:i;return s.weight===n.weight?s.index-n.index:s.weight-n.weight}))}function Ji(t,e){const i=function(t){const e={};for(const i of t){const{stack:t,pos:s,stackWeight:n}=i;if(!t||!qi.includes(s))continue;const o=e[t]||(e[t]={count:0,placed:0,weight:0,size:0});o.count++,o.weight+=n}return e}(t),{vBoxMaxWidth:s,hBoxMaxHeight:n}=e;let o,a,r;for(o=0,a=t.length;o<a;++o){r=t[o];const{fullSize:a}=r.box,l=i[r.stack],h=l&&r.stackWeight/l.weight;r.horizontal?(r.width=h?h*s:a&&e.availableWidth,r.height=n):(r.width=s,r.height=h?h*n:a&&e.availableHeight)}return i}function Qi(t,e,i,s){return Math.max(t[i],e[i])+Math.max(t[s],e[s])}function ts(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function es(t,e,i,s){const{pos:n,box:a}=i,r=t.maxPadding;if(!o(n)){i.size&&(t[n]-=i.size);const e=s[i.stack]||{size:0,count:1};e.size=Math.max(e.size,i.horizontal?a.height:a.width),i.size=e.size/e.count,t[n]+=i.size}a.getPadding&&ts(r,a.getPadding());const l=Math.max(0,e.outerWidth-Qi(r,t,"left","right")),h=Math.max(0,e.outerHeight-Qi(r,t,"top","bottom")),c=l!==t.w,d=h!==t.h;return t.w=l,t.h=h,i.horizontal?{same:c,other:d}:{same:d,other:c}}function is(t,e){const i=e.maxPadding;function s(t){const s={left:0,top:0,right:0,bottom:0};return t.forEach((t=>{s[t]=Math.max(e[t],i[t])})),s}return s(t?["left","right"]:["top","bottom"])}function ss(t,e,i,s){const n=[];let o,a,r,l,h,c;for(o=0,a=t.length,h=0;o<a;++o){r=t[o],l=r.box,l.update(r.width||e.w,r.height||e.h,is(r.horizontal,e));const{same:a,other:d}=es(e,i,r,s);h|=a&&n.length,c=c||d,l.fullSize||n.push(r)}return h&&ss(n,e,i,s)||c}function ns(t,e,i,s,n){t.top=i,t.left=e,t.right=e+s,t.bottom=i+n,t.width=s,t.height=n}function os(t,e,i,s){const n=i.padding;let{x:o,y:a}=e;for(const r of t){const t=r.box,l=s[r.stack]||{count:1,placed:0,weight:1},h=r.stackWeight/l.weight||1;if(r.horizontal){const s=e.w*h,o=l.size||t.height;k(l.start)&&(a=l.start),t.fullSize?ns(t,n.left,a,i.outerWidth-n.right-n.left,o):ns(t,e.left+l.placed,a,s,o),l.start=a,l.placed+=s,a=t.bottom}else{const s=e.h*h,a=l.size||t.width;k(l.start)&&(o=l.start),t.fullSize?ns(t,o,n.top,a,i.outerHeight-n.bottom-n.top):ns(t,o,e.top+l.placed,a,s),l.start=o,l.placed+=s,o=t.right}}e.x=o,e.y=a}var as={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||"top",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,s){if(!t)return;const n=ki(t.options.layout.padding),o=Math.max(e-n.width,0),a=Math.max(i-n.height,0),r=function(t){const e=function(t){const e=[];let i,s,n,o,a,r;for(i=0,s=(t||[]).length;i<s;++i)n=t[i],({position:o,options:{stack:a,stackWeight:r=1}}=n),e.push({index:i,box:n,pos:o,horizontal:n.isHorizontal(),weight:n.weight,stack:a&&o+a,stackWeight:r});return e}(t),i=Zi(e.filter((t=>t.box.fullSize)),!0),s=Zi(Ki(e,"left"),!0),n=Zi(Ki(e,"right")),o=Zi(Ki(e,"top"),!0),a=Zi(Ki(e,"bottom")),r=Gi(e,"x"),l=Gi(e,"y");return{fullSize:i,leftAndTop:s.concat(o),rightAndBottom:n.concat(l).concat(a).concat(r),chartArea:Ki(e,"chartArea"),vertical:s.concat(n).concat(l),horizontal:o.concat(a).concat(r)}}(t.boxes),l=r.vertical,h=r.horizontal;u(t.boxes,(t=>{"function"==typeof t.beforeLayout&&t.beforeLayout()}));const c=l.reduce(((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1),0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:n,availableWidth:o,availableHeight:a,vBoxMaxWidth:o/2/c,hBoxMaxHeight:a/2}),f=Object.assign({},n);ts(f,ki(s));const g=Object.assign({maxPadding:f,w:o,h:a,x:n.left,y:n.top},n),p=Ji(l.concat(h),d);ss(r.fullSize,g,d,p),ss(l,g,d,p),ss(h,g,d,p)&&ss(l,g,d,p),function(t){const e=t.maxPadding;function i(i){const s=Math.max(e[i]-t[i],0);return t[i]+=s,s}t.y+=i("top"),t.x+=i("left"),i("right"),i("bottom")}(g),os(r.leftAndTop,g,d,p),g.x+=g.w,g.y+=g.h,os(r.rightAndBottom,g,d,p),t.chartArea={left:g.left,top:g.top,right:g.left+g.w,bottom:g.top+g.h,height:g.h,width:g.w},u(r.chartArea,(e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(g.w,g.h,{left:0,top:0,right:0,bottom:0})}))}};class rs{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,s){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,s?Math.floor(e/s):i)}}isAttached(t){return!0}updateConfig(t){}}class ls extends rs{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}updateConfig(t){t.options.animation=!1}}const hs="$chartjs",cs={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},ds=t=>null===t||""===t;const us=!!Se&&{passive:!0};function fs(t,e,i){t&&t.canvas&&t.canvas.removeEventListener(e,i,us)}function gs(t,e){for(const i of t)if(i===e||i.contains(e))return!0}function ps(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.addedNodes,s),e=e&&!gs(i.removedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}function ms(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.removedNodes,s),e=e&&!gs(i.addedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}const bs=new Map;let xs=0;function _s(){const t=window.devicePixelRatio;t!==xs&&(xs=t,bs.forEach(((e,i)=>{i.currentDevicePixelRatio!==t&&e()})))}function ys(t,e,i){const s=t.canvas,n=s&&ge(s);if(!n)return;const o=ct(((t,e)=>{const s=n.clientWidth;i(t,e),s<n.clientWidth&&i()}),window),a=new ResizeObserver((t=>{const e=t[0],i=e.contentRect.width,s=e.contentRect.height;0===i&&0===s||o(i,s)}));return a.observe(n),function(t,e){bs.size||window.addEventListener("resize",_s),bs.set(t,e)}(t,o),a}function vs(t,e,i){i&&i.disconnect(),"resize"===e&&function(t){bs.delete(t),bs.size||window.removeEventListener("resize",_s)}(t)}function Ms(t,e,i){const s=t.canvas,n=ct((e=>{null!==t.ctx&&i(function(t,e){const i=cs[t.type]||t.type,{x:s,y:n}=ve(t,e);return{type:i,chart:e,native:t,x:void 0!==s?s:null,y:void 0!==n?n:null}}(e,t))}),t);return function(t,e,i){t&&t.addEventListener(e,i,us)}(s,e,n),n}class ws extends rs{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){const i=t.style,s=t.getAttribute("height"),n=t.getAttribute("width");if(t[hs]={initial:{height:s,width:n,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",i.boxSizing=i.boxSizing||"border-box",ds(n)){const e=Pe(t,"width");void 0!==e&&(t.width=e)}if(ds(s))if(""===t.style.height)t.height=t.width/(e||2);else{const e=Pe(t,"height");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[hs])return!1;const i=e[hs].initial;["height","width"].forEach((t=>{const n=i[t];s(n)?e.removeAttribute(t):e.setAttribute(t,n)}));const n=i.style||{};return Object.keys(n).forEach((t=>{e.style[t]=n[t]})),e.width=e.width,delete e[hs],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const s=t.$proxies||(t.$proxies={}),n={attach:ps,detach:ms,resize:ys}[e]||Ms;s[e]=n(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),s=i[e];if(!s)return;({attach:vs,detach:vs,resize:vs}[e]||fs)(t,e,s),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,s){return we(t,e,i,s)}isAttached(t){const e=ge(t);return!(!e||!e.isConnected)}}function ks(t){return!fe()||"undefined"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?ls:ws}var Ss=Object.freeze({__proto__:null,BasePlatform:rs,BasicPlatform:ls,DomPlatform:ws,_detectPlatform:ks});const Ps="transparent",Ds={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const s=Qt(t||Ps),n=s.valid&&Qt(e||Ps);return n&&n.valid?n.mix(s,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class Cs{constructor(t,e,i,s){const n=e[i];s=Pi([t.to,s,n,t.from]);const o=Pi([t.from,n,s]);this._active=!0,this._fn=t.fn||Ds[t.type||typeof o],this._easing=fi[t.easing]||fi.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=o,this._to=s,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const s=this._target[this._prop],n=i-this._start,o=this._duration-n;this._start=i,this._duration=Math.floor(Math.max(o,t.duration)),this._total+=n,this._loop=!!t.loop,this._to=Pi([t.to,e,s,t.from]),this._from=Pi([t.from,s,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,s=this._prop,n=this._from,o=this._loop,a=this._to;let r;if(this._active=n!==a&&(o||e<i),!this._active)return this._target[s]=a,void this._notify(!0);e<0?this._target[s]=n:(r=e/i%2,r=o&&r>1?2-r:r,r=this._easing(Math.min(1,Math.max(0,r))),this._target[s]=this._fn(n,a,r))}wait(){const t=this._promises||(this._promises=[]);return new Promise(((e,i)=>{t.push({res:e,rej:i})}))}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let t=0;t<i.length;t++)i[t][e]()}}class Os{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!o(t))return;const e=Object.keys(ue.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach((s=>{const a=t[s];if(!o(a))return;const r={};for(const t of e)r[t]=a[t];(n(a.properties)&&a.properties||[s]).forEach((t=>{t!==s&&i.has(t)||i.set(t,r)}))}))}_animateOptions(t,e){const i=e.options,s=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!s)return[];const n=this._createAnimations(s,i);return i.$shared&&function(t,e){const i=[],s=Object.keys(e);for(let e=0;e<s.length;e++){const n=t[s[e]];n&&n.active()&&i.push(n.wait())}return Promise.all(i)}(t.options.$animations,i).then((()=>{t.options=i}),(()=>{})),n}_createAnimations(t,e){const i=this._properties,s=[],n=t.$animations||(t.$animations={}),o=Object.keys(e),a=Date.now();let r;for(r=o.length-1;r>=0;--r){const l=o[r];if("$"===l.charAt(0))continue;if("options"===l){s.push(...this._animateOptions(t,e));continue}const h=e[l];let c=n[l];const d=i.get(l);if(c){if(d&&c.active()){c.update(d,h,a);continue}c.cancel()}d&&d.duration?(n[l]=c=new Cs(d,t,l,h),s.push(c)):t[l]=h}return s}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(xt.add(this._chart,i),!0):void 0}}function As(t,e){const i=t&&t.options||{},s=i.reverse,n=void 0===i.min?e:0,o=void 0===i.max?e:0;return{start:s?o:n,end:s?n:o}}function Ts(t,e){const i=[],s=t._getSortedDatasetMetas(e);let n,o;for(n=0,o=s.length;n<o;++n)i.push(s[n].index);return i}function Ls(t,e,i,s={}){const n=t.keys,o="single"===s.mode;let r,l,h,c;if(null!==e){for(r=0,l=n.length;r<l;++r){if(h=+n[r],h===i){if(s.all)continue;break}c=t.values[h],a(c)&&(o||0===e||F(e)===F(c))&&(e+=c)}return e}}function Es(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function Rs(t,e,i){const s=t[e]||(t[e]={});return s[i]||(s[i]={})}function Is(t,e,i,s){for(const n of e.getMatchingVisibleMetas(s).reverse()){const e=t[n.index];if(i&&e>0||!i&&e<0)return n.index}return null}function zs(t,e){const{chart:i,_cachedMeta:s}=t,n=i._stacks||(i._stacks={}),{iScale:o,vScale:a,index:r}=s,l=o.axis,h=a.axis,c=function(t,e,i){return`${t.id}.${e.id}.${i.stack||i.type}`}(o,a,s),d=e.length;let u;for(let t=0;t<d;++t){const i=e[t],{[l]:o,[h]:d}=i;u=(i._stacks||(i._stacks={}))[h]=Rs(n,c,o),u[r]=d,u._top=Is(u,a,!0,s.type),u._bottom=Is(u,a,!1,s.type);(u._visualValues||(u._visualValues={}))[r]=d}}function Fs(t,e){const i=t.scales;return Object.keys(i).filter((t=>i[t].axis===e)).shift()}function Vs(t,e){const i=t.controller.index,s=t.vScale&&t.vScale.axis;if(s){e=e||t._parsed;for(const t of e){const e=t._stacks;if(!e||void 0===e[s]||void 0===e[s][i])return;delete e[s][i],void 0!==e[s]._visualValues&&void 0!==e[s]._visualValues[i]&&delete e[s]._visualValues[i]}}}const Bs=t=>"reset"===t||"none"===t,Ws=(t,e)=>e?t:Object.assign({},t);class Ns{static defaults={};static datasetElementType=null;static dataElementType=null;constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Es(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled("filler")&&console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")}updateIndex(t){this.index!==t&&Vs(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),s=(t,e,i,s)=>"x"===t?e:"r"===t?s:i,n=e.xAxisID=l(i.xAxisID,Fs(t,"x")),o=e.yAxisID=l(i.yAxisID,Fs(t,"y")),a=e.rAxisID=l(i.rAxisID,Fs(t,"r")),r=e.indexAxis,h=e.iAxisID=s(r,n,o,a),c=e.vAxisID=s(r,o,n,a);e.xScale=this.getScaleForId(n),e.yScale=this.getScaleForId(o),e.rScale=this.getScaleForId(a),e.iScale=this.getScaleForId(h),e.vScale=this.getScaleForId(c)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&rt(this._data,this),t._stacked&&Vs(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(o(e))this._data=function(t){const e=Object.keys(t),i=new Array(e.length);let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s],i[s]={x:o,y:t[o]};return i}(e);else if(i!==e){if(i){rt(i,this);const t=this._cachedMeta;Vs(t),t._parsed=[]}e&&Object.isExtensible(e)&&at(e,this),this._syncList=[],this._data=e}}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let s=!1;this._dataCheck();const n=e._stacked;e._stacked=Es(e.vScale,e),e.stack!==i.stack&&(s=!0,Vs(e),e.stack=i.stack),this._resyncElements(t),(s||n!==e._stacked)&&zs(this,e._parsed)}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:s}=this,{iScale:a,_stacked:r}=i,l=a.axis;let h,c,d,u=0===t&&e===s.length||i._sorted,f=t>0&&i._parsed[t-1];if(!1===this._parsing)i._parsed=s,i._sorted=!0,d=s;else{d=n(s[t])?this.parseArrayData(i,s,t,e):o(s[t])?this.parseObjectData(i,s,t,e):this.parsePrimitiveData(i,s,t,e);const a=()=>null===c[l]||f&&c[l]<f[l];for(h=0;h<e;++h)i._parsed[h+t]=c=d[h],u&&(a()&&(u=!1),f=c);i._sorted=u}r&&zs(this,d)}parsePrimitiveData(t,e,i,s){const{iScale:n,vScale:o}=t,a=n.axis,r=o.axis,l=n.getLabels(),h=n===o,c=new Array(s);let d,u,f;for(d=0,u=s;d<u;++d)f=d+i,c[d]={[a]:h||n.parse(l[f],f),[r]:o.parse(e[f],f)};return c}parseArrayData(t,e,i,s){const{xScale:n,yScale:o}=t,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={x:n.parse(c[0],h),y:o.parse(c[1],h)};return a}parseObjectData(t,e,i,s){const{xScale:n,yScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=new Array(s);let h,c,d,u;for(h=0,c=s;h<c;++h)d=h+i,u=e[d],l[h]={x:n.parse(M(u,a),d),y:o.parse(M(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const s=this.chart,n=this._cachedMeta,o=e[t.axis];return Ls({keys:Ts(s,!0),values:e._stacks[t.axis]._visualValues},o,n.index,{mode:i})}updateRangeFromParsed(t,e,i,s){const n=i[e.axis];let o=null===n?NaN:n;const a=s&&i._stacks[e.axis];s&&a&&(s.values=a,o=Ls(s,n,this._cachedMeta.index)),t.min=Math.min(t.min,o),t.max=Math.max(t.max,o)}getMinMax(t,e){const i=this._cachedMeta,s=i._parsed,n=i._sorted&&t===i.iScale,o=s.length,r=this._getOtherScale(t),l=((t,e,i)=>t&&!e.hidden&&e._stacked&&{keys:Ts(i,!0),values:null})(e,i,this.chart),h={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:c,max:d}=function(t){const{min:e,max:i,minDefined:s,maxDefined:n}=t.getUserBounds();return{min:s?e:Number.NEGATIVE_INFINITY,max:n?i:Number.POSITIVE_INFINITY}}(r);let u,f;function g(){f=s[u];const e=f[r.axis];return!a(f[t.axis])||c>e||d<e}for(u=0;u<o&&(g()||(this.updateRangeFromParsed(h,t,f,l),!n));++u);if(n)for(u=o-1;u>=0;--u)if(!g()){this.updateRangeFromParsed(h,t,f,l);break}return h}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s][t.axis],a(o)&&i.push(o);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,s=e.vScale,n=this.getParsed(t);return{label:i?""+i.getLabelForValue(n[i.axis]):"",value:s?""+s.getLabelForValue(n[s.axis]):""}}_update(t){const e=this._cachedMeta;this.update(t||"default"),e._clip=function(t){let e,i,s,n;return o(t)?(e=t.top,i=t.right,s=t.bottom,n=t.left):e=i=s=n=t,{top:e,right:i,bottom:s,left:n,disabled:!1===t}}(l(this.options.clip,function(t,e,i){if(!1===i)return!1;const s=As(t,i),n=As(e,i);return{top:n.end,right:s.end,bottom:n.start,left:s.start}}(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,s=i.data||[],n=e.chartArea,o=[],a=this._drawStart||0,r=this._drawCount||s.length-a,l=this.options.drawActiveElementsOnTop;let h;for(i.dataset&&i.dataset.draw(t,n,a,r),h=a;h<a+r;++h){const e=s[h];e.hidden||(e.active&&l?o.push(e):e.draw(t,n))}for(h=0;h<o.length;++h)o[h].draw(t,n)}getStyle(t,e){const i=e?"active":"default";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const s=this.getDataset();let n;if(t>=0&&t<this._cachedMeta.data.length){const e=this._cachedMeta.data[t];n=e.$context||(e.$context=function(t,e,i){return Ci(t,{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:"default",type:"data"})}(this.getContext(),t,e)),n.parsed=this.getParsed(t),n.raw=s.data[t],n.index=n.dataIndex=t}else n=this.$context||(this.$context=function(t,e){return Ci(t,{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:"default",type:"dataset"})}(this.chart.getContext(),this.index)),n.dataset=s,n.index=n.datasetIndex=this.index;return n.active=!!e,n.mode=i,n}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const s="active"===e,n=this._cachedDataOpts,o=t+"-"+e,a=n[o],r=this.enableOptionSharing&&k(i);if(a)return Ws(a,r);const l=this.chart.config,h=l.datasetElementScopeKeys(this._type,t),c=s?[`${t}Hover`,"hover",t,""]:[t,""],d=l.getOptionScopes(this.getDataset(),h),u=Object.keys(ue.elements[t]),f=l.resolveNamedOptions(d,u,(()=>this.getContext(i,s,e)),c);return f.$shared&&(f.$shared=r,n[o]=Object.freeze(Ws(f,r))),f}_resolveAnimations(t,e,i){const s=this.chart,n=this._cachedDataOpts,o=`animation-${e}`,a=n[o];if(a)return a;let r;if(!1!==s.options.animation){const s=this.chart.config,n=s.datasetAnimationScopeKeys(this._type,e),o=s.getOptionScopes(this.getDataset(),n);r=s.createResolver(o,this.getContext(t,i,e))}const l=new Os(s,r&&r.animations);return r&&r._cacheable&&(n[o]=Object.freeze(l)),l}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Bs(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),s=this._sharedOptions,n=this.getSharedOptions(i),o=this.includeOptions(e,n)||n!==s;return this.updateSharedOptions(n,e,i),{sharedOptions:n,includeOptions:o}}updateElement(t,e,i,s){Bs(s)?Object.assign(t,i):this._resolveAnimations(e,s).update(t,i)}updateSharedOptions(t,e,i){t&&!Bs(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,s){t.active=s;const n=this.getStyle(e,s);this._resolveAnimations(e,i,s).update(t,{options:!s&&this.getSharedOptions(n)||n})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[t,e,i]of this._syncList)this[t](e,i);this._syncList=[];const s=i.length,n=e.length,o=Math.min(n,s);o&&this.parse(0,o),n>s?this._insertElements(s,n-s,t):n<s&&this._removeElements(n,s-n)}_insertElements(t,e,i=!0){const s=this._cachedMeta,n=s.data,o=t+e;let a;const r=t=>{for(t.length+=e,a=t.length-1;a>=o;a--)t[a]=t[a-e]};for(r(n),a=t;a<o;++a)n[a]=new this.dataElementType;this._parsing&&r(s._parsed),this.parse(t,e),i&&this.updateElements(n,t,e,"reset")}updateElements(t,e,i,s){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const s=i._parsed.splice(t,e);i._stacked&&Vs(i,s)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,s]=t;this[e](i,s)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync(["_insertElements",this.getDataset().data.length-t,t])}_onDataPop(){this._sync(["_removeElements",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync(["_removeElements",0,1])}_onDataSplice(t,e){e&&this._sync(["_removeElements",t,e]);const i=arguments.length-2;i&&this._sync(["_insertElements",t,i])}_onDataUnshift(){this._sync(["_insertElements",0,arguments.length])}}class Hs{static defaults={};static defaultRoutes=void 0;x;y;active=!1;options;$animations;tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return N(this.x)&&N(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const s={};return t.forEach((t=>{s[t]=i[t]&&i[t].active()?i[t]._to:this[t]})),s}}function js(t,e){const i=t.options.ticks,n=function(t){const e=t.options.offset,i=t._tickSize(),s=t._length/i+(e?0:1),n=t._maxLength/i;return Math.floor(Math.min(s,n))}(t),o=Math.min(i.maxTicksLimit||n,n),a=i.major.enabled?function(t){const e=[];let i,s;for(i=0,s=t.length;i<s;i++)t[i].major&&e.push(i);return e}(e):[],r=a.length,l=a[0],h=a[r-1],c=[];if(r>o)return function(t,e,i,s){let n,o=0,a=i[0];for(s=Math.ceil(s),n=0;n<t.length;n++)n===a&&(e.push(t[n]),o++,a=i[o*s])}(e,c,a,r/o),c;const d=function(t,e,i){const s=function(t){const e=t.length;let i,s;if(e<2)return!1;for(s=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==s)return!1;return s}(t),n=e.length/i;if(!s)return Math.max(n,1);const o=W(s);for(let t=0,e=o.length-1;t<e;t++){const e=o[t];if(e>n)return e}return Math.max(n,1)}(a,e,o);if(r>0){let t,i;const n=r>1?Math.round((h-l)/(r-1)):null;for($s(e,c,d,s(n)?0:l-n,l),t=0,i=r-1;t<i;t++)$s(e,c,d,a[t],a[t+1]);return $s(e,c,d,h,s(n)?e.length:h+n),c}return $s(e,c,d),c}function $s(t,e,i,s,n){const o=l(s,0),a=Math.min(l(n,t.length),t.length);let r,h,c,d=0;for(i=Math.ceil(i),n&&(r=n-s,i=r/Math.floor(r/i)),c=o;c<0;)d++,c=Math.round(o+d*i);for(h=Math.max(o,0);h<a;h++)h===c&&(e.push(t[h]),d++,c=Math.round(o+d*i))}const Ys=(t,e,i)=>"top"===e||"left"===e?t[e]+i:t[e]-i,Us=(t,e)=>Math.min(e||t,t);function Xs(t,e){const i=[],s=t.length/e,n=t.length;let o=0;for(;o<n;o+=s)i.push(t[Math.floor(o)]);return i}function qs(t,e,i){const s=t.ticks.length,n=Math.min(e,s-1),o=t._startPixel,a=t._endPixel,r=1e-6;let l,h=t.getPixelForTick(n);if(!(i&&(l=1===s?Math.max(h-o,a-h):0===e?(t.getPixelForTick(1)-h)/2:(h-t.getPixelForTick(n-1))/2,h+=n<e?l:-l,h<o-r||h>a+r)))return h}function Ks(t){return t.drawTicks?t.tickLength:0}function Gs(t,e){if(!t.display)return 0;const i=Si(t.font,e),s=ki(t.padding);return(n(t.text)?t.text.length:1)*i.lineHeight+s.height}function Zs(t,e,i){let s=ut(t);return(i&&"right"!==e||!i&&"right"===e)&&(s=(t=>"left"===t?"right":"right"===t?"left":t)(s)),s}class Js extends Hs{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:s}=this;return t=r(t,Number.POSITIVE_INFINITY),e=r(e,Number.NEGATIVE_INFINITY),i=r(i,Number.POSITIVE_INFINITY),s=r(s,Number.NEGATIVE_INFINITY),{min:r(t,i),max:r(e,s),minDefined:a(t),maxDefined:a(e)}}getMinMax(t){let e,{min:i,max:s,minDefined:n,maxDefined:o}=this.getUserBounds();if(n&&o)return{min:i,max:s};const a=this.getMatchingVisibleMetas();for(let r=0,l=a.length;r<l;++r)e=a[r].controller.getMinMax(this,t),n||(i=Math.min(i,e.min)),o||(s=Math.max(s,e.max));return i=o&&i>s?s:i,s=n&&i>s?i:s,{min:r(i,r(s,i)),max:r(s,r(i,s))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){d(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:s,grace:n,ticks:o}=this.options,a=o.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=Di(this,n,s),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const r=a<this.ticks.length;this._convertTicksToLabels(r?Xs(this.ticks,a):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),o.display&&(o.autoSkip||"auto"===o.source)&&(this.ticks=js(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),r&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t,e,i=this.options.reverse;this.isHorizontal()?(t=this.left,e=this.right):(t=this.top,e=this.bottom,i=!i),this._startPixel=t,this._endPixel=e,this._reversePixels=i,this._length=e-t,this._alignToPixels=this.options.alignToPixels}afterUpdate(){d(this.options.afterUpdate,[this])}beforeSetDimensions(){d(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,this.top=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){d(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),d(this.options[t],[this])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){d(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,s,n;for(i=0,s=t.length;i<s;i++)n=t[i],n.label=d(e.callback,[n.value,i,t],this)}afterTickToLabelConversion(){d(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){d(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=Us(this.ticks.length,t.ticks.maxTicksLimit),s=e.minRotation||0,n=e.maxRotation;let o,a,r,l=s;if(!this._isVisible()||!e.display||s>=n||i<=1||!this.isHorizontal())return void(this.labelRotation=s);const h=this._getLabelSizes(),c=h.widest.width,d=h.highest.height,u=J(this.chart.width-c,0,this.maxWidth);o=t.offset?this.maxWidth/i:u/(i-1),c+6>o&&(o=u/(i-(t.offset?.5:1)),a=this.maxHeight-Ks(t.grid)-e.padding-Gs(t.title,this.chart.options.font),r=Math.sqrt(c*c+d*d),l=Y(Math.min(Math.asin(J((h.highest.height+6)/o,-1,1)),Math.asin(J(a/r,-1,1))-Math.asin(J(d/r,-1,1)))),l=Math.max(s,Math.min(n,l))),this.labelRotation=l}afterCalculateLabelRotation(){d(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){d(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:s,grid:n}}=this,o=this._isVisible(),a=this.isHorizontal();if(o){const o=Gs(s,e.options.font);if(a?(t.width=this.maxWidth,t.height=Ks(n)+o):(t.height=this.maxHeight,t.width=Ks(n)+o),i.display&&this.ticks.length){const{first:e,last:s,widest:n,highest:o}=this._getLabelSizes(),r=2*i.padding,l=$(this.labelRotation),h=Math.cos(l),c=Math.sin(l);if(a){const e=i.mirror?0:c*n.width+h*o.height;t.height=Math.min(this.maxHeight,t.height+e+r)}else{const e=i.mirror?0:h*n.width+c*o.height;t.width=Math.min(this.maxWidth,t.width+e+r)}this._calculatePadding(e,s,c,h)}}this._handleMargins(),a?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,s){const{ticks:{align:n,padding:o},position:a}=this.options,r=0!==this.labelRotation,l="top"!==a&&"x"===this.axis;if(this.isHorizontal()){const a=this.getPixelForTick(0)-this.left,h=this.right-this.getPixelForTick(this.ticks.length-1);let c=0,d=0;r?l?(c=s*t.width,d=i*e.height):(c=i*t.height,d=s*e.width):"start"===n?d=e.width:"end"===n?c=t.width:"inner"!==n&&(c=t.width/2,d=e.width/2),this.paddingLeft=Math.max((c-a+o)*this.width/(this.width-a),0),this.paddingRight=Math.max((d-h+o)*this.width/(this.width-h),0)}else{let i=e.height/2,s=t.height/2;"start"===n?(i=0,s=t.height):"end"===n&&(i=e.height,s=0),this.paddingTop=i+o,this.paddingBottom=s+o}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){d(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return"top"===e||"bottom"===e||"x"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){let e,i;for(this.beforeTickToLabelConversion(),this.generateTickLabels(t),e=0,i=t.length;e<i;e++)s(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=Xs(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:o,_longestTextCache:a}=this,r=[],l=[],h=Math.floor(e/Us(e,i));let c,d,f,g,p,m,b,x,_,y,v,M=0,w=0;for(c=0;c<e;c+=h){if(g=t[c].label,p=this._resolveTickFontOptions(c),o.font=m=p.string,b=a[m]=a[m]||{data:{},gc:[]},x=p.lineHeight,_=y=0,s(g)||n(g)){if(n(g))for(d=0,f=g.length;d<f;++d)v=g[d],s(v)||n(v)||(_=Ce(o,b.data,b.gc,_,v),y+=x)}else _=Ce(o,b.data,b.gc,_,g),y=x;r.push(_),l.push(y),M=Math.max(_,M),w=Math.max(y,w)}!function(t,e){u(t,(t=>{const i=t.gc,s=i.length/2;let n;if(s>e){for(n=0;n<s;++n)delete t.data[i[n]];i.splice(0,s)}}))}(a,e);const k=r.indexOf(M),S=l.indexOf(w),P=t=>({width:r[t]||0,height:l[t]||0});return{first:P(0),last:P(e-1),widest:P(k),highest:P(S),widths:r,heights:l}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Q(this._alignToPixels?Ae(this.chart,e,0):e)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=function(t,e,i){return Ci(t,{tick:i,index:e,type:"tick"})}(this.getContext(),t,i))}return this.$context||(this.$context=Ci(this.chart.getContext(),{scale:this,type:"scale"}))}_tickSize(){const t=this.options.ticks,e=$(this.labelRotation),i=Math.abs(Math.cos(e)),s=Math.abs(Math.sin(e)),n=this._getLabelSizes(),o=t.autoSkipPadding||0,a=n?n.widest.width+o:0,r=n?n.highest.height+o:0;return this.isHorizontal()?r*i>a*s?a/i:r/s:r*s<a*i?r/i:a/s}_isVisible(){const t=this.options.display;return"auto"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,s=this.options,{grid:n,position:a,border:r}=s,h=n.offset,c=this.isHorizontal(),d=this.ticks.length+(h?1:0),u=Ks(n),f=[],g=r.setContext(this.getContext()),p=g.display?g.width:0,m=p/2,b=function(t){return Ae(i,t,p)};let x,_,y,v,M,w,k,S,P,D,C,O;if("top"===a)x=b(this.bottom),w=this.bottom-u,S=x-m,D=b(t.top)+m,O=t.bottom;else if("bottom"===a)x=b(this.top),D=t.top,O=b(t.bottom)-m,w=x+m,S=this.top+u;else if("left"===a)x=b(this.right),M=this.right-u,k=x-m,P=b(t.left)+m,C=t.right;else if("right"===a)x=b(this.left),P=t.left,C=b(t.right)-m,M=x+m,k=this.left+u;else if("x"===e){if("center"===a)x=b((t.top+t.bottom)/2+.5);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}D=t.top,O=t.bottom,w=x+m,S=w+u}else if("y"===e){if("center"===a)x=b((t.left+t.right)/2);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}M=x-m,k=M-u,P=t.left,C=t.right}const A=l(s.ticks.maxTicksLimit,d),T=Math.max(1,Math.ceil(d/A));for(_=0;_<d;_+=T){const t=this.getContext(_),e=n.setContext(t),s=r.setContext(t),o=e.lineWidth,a=e.color,l=s.dash||[],d=s.dashOffset,u=e.tickWidth,g=e.tickColor,p=e.tickBorderDash||[],m=e.tickBorderDashOffset;y=qs(this,_,h),void 0!==y&&(v=Ae(i,y,o),c?M=k=P=C=v:w=S=D=O=v,f.push({tx1:M,ty1:w,tx2:k,ty2:S,x1:P,y1:D,x2:C,y2:O,width:o,color:a,borderDash:l,borderDashOffset:d,tickWidth:u,tickColor:g,tickBorderDash:p,tickBorderDashOffset:m}))}return this._ticksLength=d,this._borderValue=x,f}_computeLabelItems(t){const e=this.axis,i=this.options,{position:s,ticks:a}=i,r=this.isHorizontal(),l=this.ticks,{align:h,crossAlign:c,padding:d,mirror:u}=a,f=Ks(i.grid),g=f+d,p=u?-d:g,m=-$(this.labelRotation),b=[];let x,_,y,v,M,w,k,S,P,D,C,O,A="middle";if("top"===s)w=this.bottom-p,k=this._getXAxisLabelAlignment();else if("bottom"===s)w=this.top+p,k=this._getXAxisLabelAlignment();else if("left"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("right"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("x"===e){if("center"===s)w=(t.top+t.bottom)/2+g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];w=this.chart.scales[t].getPixelForValue(e)+g}k=this._getXAxisLabelAlignment()}else if("y"===e){if("center"===s)M=(t.left+t.right)/2-g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];M=this.chart.scales[t].getPixelForValue(e)}k=this._getYAxisLabelAlignment(f).textAlign}"y"===e&&("start"===h?A="top":"end"===h&&(A="bottom"));const T=this._getLabelSizes();for(x=0,_=l.length;x<_;++x){y=l[x],v=y.label;const t=a.setContext(this.getContext(x));S=this.getPixelForTick(x)+a.labelOffset,P=this._resolveTickFontOptions(x),D=P.lineHeight,C=n(v)?v.length:1;const e=C/2,i=t.color,o=t.textStrokeColor,h=t.textStrokeWidth;let d,f=k;if(r?(M=S,"inner"===k&&(f=x===_-1?this.options.reverse?"left":"right":0===x?this.options.reverse?"right":"left":"center"),O="top"===s?"near"===c||0!==m?-C*D+D/2:"center"===c?-T.highest.height/2-e*D+D:-T.highest.height+D/2:"near"===c||0!==m?D/2:"center"===c?T.highest.height/2-e*D:T.highest.height-C*D,u&&(O*=-1),0===m||t.showLabelBackdrop||(M+=D/2*Math.sin(m))):(w=S,O=(1-C)*D/2),t.showLabelBackdrop){const e=ki(t.backdropPadding),i=T.heights[x],s=T.widths[x];let n=O-e.top,o=0-e.left;switch(A){case"middle":n-=i/2;break;case"bottom":n-=i}switch(k){case"center":o-=s/2;break;case"right":o-=s;break;case"inner":x===_-1?o-=s:x>0&&(o-=s/2)}d={left:o,top:n,width:s+e.width,height:i+e.height,color:t.backdropColor}}b.push({label:v,font:P,textOffset:O,options:{rotation:m,color:i,strokeColor:o,strokeWidth:h,textAlign:f,textBaseline:A,translation:[M,w],backdrop:d}})}return b}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-$(this.labelRotation))return"top"===t?"left":"right";let i="center";return"start"===e.align?i="left":"end"===e.align?i="right":"inner"===e.align&&(i="inner"),i}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:s,padding:n}}=this.options,o=t+n,a=this._getLabelSizes().widest.width;let r,l;return"left"===e?s?(l=this.right+n,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l+=a)):(l=this.right-o,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l=this.left)):"right"===e?s?(l=this.left+n,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l-=a)):(l=this.left+o,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l=this.right)):r="right",{textAlign:r,x:l}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;return"left"===e||"right"===e?{top:0,left:this.left,bottom:t.height,right:this.right}:"top"===e||"bottom"===e?{top:this.top,left:0,bottom:this.bottom,right:t.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:s,width:n,height:o}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,s,n,o),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const i=this.ticks.findIndex((e=>e.value===t));if(i>=0){return e.setContext(this.getContext(i)).lineWidth}return 0}drawGrid(t){const e=this.options.grid,i=this.ctx,s=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let n,o;const a=(t,e,s)=>{s.width&&s.color&&(i.save(),i.lineWidth=s.width,i.strokeStyle=s.color,i.setLineDash(s.borderDash||[]),i.lineDashOffset=s.borderDashOffset,i.beginPath(),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.restore())};if(e.display)for(n=0,o=s.length;n<o;++n){const t=s[n];e.drawOnChartArea&&a({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),e.drawTicks&&a({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:s}}=this,n=i.setContext(this.getContext()),o=i.display?n.width:0;if(!o)return;const a=s.setContext(this.getContext(0)).lineWidth,r=this._borderValue;let l,h,c,d;this.isHorizontal()?(l=Ae(t,this.left,o)-o/2,h=Ae(t,this.right,a)+a/2,c=d=r):(c=Ae(t,this.top,o)-o/2,d=Ae(t,this.bottom,a)+a/2,l=h=r),e.save(),e.lineWidth=n.width,e.strokeStyle=n.color,e.beginPath(),e.moveTo(l,c),e.lineTo(h,d),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const e=this.ctx,i=this._computeLabelArea();i&&Ie(e,i);const s=this.getLabelItems(t);for(const t of s){const i=t.options,s=t.font;Ne(e,t.label,0,t.textOffset,s,i)}i&&ze(e)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:s}}=this;if(!i.display)return;const a=Si(i.font),r=ki(i.padding),l=i.align;let h=a.lineHeight/2;"bottom"===e||"center"===e||o(e)?(h+=r.bottom,n(i.text)&&(h+=a.lineHeight*(i.text.length-1))):h+=r.top;const{titleX:c,titleY:d,maxWidth:u,rotation:f}=function(t,e,i,s){const{top:n,left:a,bottom:r,right:l,chart:h}=t,{chartArea:c,scales:d}=h;let u,f,g,p=0;const m=r-n,b=l-a;if(t.isHorizontal()){if(f=ft(s,a,l),o(i)){const t=Object.keys(i)[0],s=i[t];g=d[t].getPixelForValue(s)+m-e}else g="center"===i?(c.bottom+c.top)/2+m-e:Ys(t,i,e);u=l-a}else{if(o(i)){const t=Object.keys(i)[0],s=i[t];f=d[t].getPixelForValue(s)-b+e}else f="center"===i?(c.left+c.right)/2-b+e:Ys(t,i,e);g=ft(s,r,n),p="left"===i?-E:E}return{titleX:f,titleY:g,maxWidth:u,rotation:p}}(this,h,e,l);Ne(t,i.text,0,0,a,{color:i.color,maxWidth:u,rotation:f,textAlign:Zs(l,e,s),textBaseline:"middle",translation:[c,d]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=l(t.grid&&t.grid.z,-1),s=l(t.border&&t.border.z,0);return this._isVisible()&&this.draw===Js.prototype.draw?[{z:i,draw:t=>{this.drawBackground(),this.drawGrid(t),this.drawTitle()}},{z:s,draw:()=>{this.drawBorder()}},{z:e,draw:t=>{this.drawLabels(t)}}]:[{z:e,draw:t=>{this.draw(t)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+"AxisID",s=[];let n,o;for(n=0,o=e.length;n<o;++n){const o=e[n];o[i]!==this.id||t&&o.type!==t||s.push(o)}return s}_resolveTickFontOptions(t){return Si(this.options.ticks.setContext(this.getContext(t)).font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class Qs{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;(function(t){return"id"in t&&"defaults"in t})(e)&&(i=this.register(e));const s=this.items,n=t.id,o=this.scope+"."+n;if(!n)throw new Error("class does not have id: "+t);return n in s||(s[n]=t,function(t,e,i){const s=b(Object.create(null),[i?ue.get(i):{},ue.get(e),t.defaults]);ue.set(e,s),t.defaultRoutes&&function(t,e){Object.keys(e).forEach((i=>{const s=i.split("."),n=s.pop(),o=[t].concat(s).join("."),a=e[i].split("."),r=a.pop(),l=a.join(".");ue.route(o,n,l,r)}))}(e,t.defaultRoutes);t.descriptors&&ue.describe(e,t.descriptors)}(t,o,i),this.override&&ue.override(t.id,t.overrides)),o}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,s=this.scope;i in e&&delete e[i],s&&i in ue[s]&&(delete ue[s][i],this.override&&delete re[i])}}class tn{constructor(){this.controllers=new Qs(Ns,"datasets",!0),this.elements=new Qs(Hs,"elements"),this.plugins=new Qs(Object,"plugins"),this.scales=new Qs(Js,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){[...e].forEach((e=>{const s=i||this._getRegistryForType(e);i||s.isForType(e)||s===this.plugins&&e.id?this._exec(t,s,e):u(e,(e=>{const s=i||this._getRegistryForType(e);this._exec(t,s,e)}))}))}_exec(t,e,i){const s=w(t);d(i["before"+s],[],i),e[t](i),d(i["after"+s],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const s=e.get(t);if(void 0===s)throw new Error('"'+t+'" is not a registered '+i+".");return s}}var en=new tn;class sn{constructor(){this._init=[]}notify(t,e,i,s){"beforeInit"===e&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,"install"));const n=s?this._descriptors(t).filter(s):this._descriptors(t),o=this._notify(n,t,e,i);return"afterDestroy"===e&&(this._notify(n,t,"stop"),this._notify(this._init,t,"uninstall")),o}_notify(t,e,i,s){s=s||{};for(const n of t){const t=n.plugin;if(!1===d(t[i],[e,s,n.options],t)&&s.cancelable)return!1}return!0}invalidate(){s(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,s=l(i.options&&i.options.plugins,{}),n=function(t){const e={},i=[],s=Object.keys(en.plugins.items);for(let t=0;t<s.length;t++)i.push(en.getPlugin(s[t]));const n=t.plugins||[];for(let t=0;t<n.length;t++){const s=n[t];-1===i.indexOf(s)&&(i.push(s),e[s.id]=!0)}return{plugins:i,localIds:e}}(i);return!1!==s||e?function(t,{plugins:e,localIds:i},s,n){const o=[],a=t.getContext();for(const r of e){const e=r.id,l=nn(s[e],n);null!==l&&o.push({plugin:r,options:on(t.config,{plugin:r,local:i[e]},l,a)})}return o}(t,n,s,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,s=(t,e)=>t.filter((t=>!e.some((e=>t.plugin.id===e.plugin.id))));this._notify(s(e,i),t,"stop"),this._notify(s(i,e),t,"start")}}function nn(t,e){return e||!1!==t?!0===t?{}:t:null}function on(t,{plugin:e,local:i},s,n){const o=t.pluginScopeKeys(e),a=t.getOptionScopes(s,o);return i&&e.defaults&&a.push(e.defaults),t.createResolver(a,n,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function an(t,e){const i=ue.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||"x"}function rn(t){if("x"===t||"y"===t||"r"===t)return t}function ln(t,...e){if(rn(t))return t;for(const s of e){const e=s.axis||("top"===(i=s.position)||"bottom"===i?"x":"left"===i||"right"===i?"y":void 0)||t.length>1&&rn(t[0].toLowerCase());if(e)return e}var i;throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`)}function hn(t,e,i){if(i[e+"AxisID"]===t)return{axis:e}}function cn(t,e){const i=re[t.type]||{scales:{}},s=e.scales||{},n=an(t.type,e),a=Object.create(null);return Object.keys(s).forEach((e=>{const r=s[e];if(!o(r))return console.error(`Invalid scale configuration for scale: ${e}`);if(r._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${e}`);const l=ln(e,r,function(t,e){if(e.data&&e.data.datasets){const i=e.data.datasets.filter((e=>e.xAxisID===t||e.yAxisID===t));if(i.length)return hn(t,"x",i[0])||hn(t,"y",i[0])}return{}}(e,t),ue.scales[r.type]),h=function(t,e){return t===e?"_index_":"_value_"}(l,n),c=i.scales||{};a[e]=x(Object.create(null),[{axis:l},r,c[l],c[h]])})),t.data.datasets.forEach((i=>{const n=i.type||t.type,o=i.indexAxis||an(n,e),r=(re[n]||{}).scales||{};Object.keys(r).forEach((t=>{const e=function(t,e){let i=t;return"_index_"===t?i=e:"_value_"===t&&(i="x"===e?"y":"x"),i}(t,o),n=i[e+"AxisID"]||e;a[n]=a[n]||Object.create(null),x(a[n],[{axis:e},s[n],r[t]])}))})),Object.keys(a).forEach((t=>{const e=a[t];x(e,[ue.scales[e.type],ue.scale])})),a}function dn(t){const e=t.options||(t.options={});e.plugins=l(e.plugins,{}),e.scales=cn(t,e)}function un(t){return(t=t||{}).datasets=t.datasets||[],t.labels=t.labels||[],t}const fn=new Map,gn=new Set;function pn(t,e){let i=fn.get(t);return i||(i=e(),fn.set(t,i),gn.add(i)),i}const mn=(t,e,i)=>{const s=M(e,i);void 0!==s&&t.add(s)};class bn{constructor(t){this._config=function(t){return(t=t||{}).data=un(t.data),dn(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=un(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),dn(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return pn(t,(()=>[[`datasets.${t}`,""]]))}datasetAnimationScopeKeys(t,e){return pn(`${t}.transition.${e}`,(()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,""]]))}datasetElementScopeKeys(t,e){return pn(`${t}-${e}`,(()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,""]]))}pluginScopeKeys(t){const e=t.id;return pn(`${this.type}-plugin-${e}`,(()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]]))}_cachedScopes(t,e){const i=this._scopeCache;let s=i.get(t);return s&&!e||(s=new Map,i.set(t,s)),s}getOptionScopes(t,e,i){const{options:s,type:n}=this,o=this._cachedScopes(t,i),a=o.get(e);if(a)return a;const r=new Set;e.forEach((e=>{t&&(r.add(t),e.forEach((e=>mn(r,t,e)))),e.forEach((t=>mn(r,s,t))),e.forEach((t=>mn(r,re[n]||{},t))),e.forEach((t=>mn(r,ue,t))),e.forEach((t=>mn(r,le,t)))}));const l=Array.from(r);return 0===l.length&&l.push(Object.create(null)),gn.has(e)&&o.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,re[e]||{},ue.datasets[e]||{},{type:e},ue,le]}resolveNamedOptions(t,e,i,s=[""]){const o={$shared:!0},{resolver:a,subPrefixes:r}=xn(this._resolverCache,t,s);let l=a;if(function(t,e){const{isScriptable:i,isIndexable:s}=Ye(t);for(const o of e){const e=i(o),a=s(o),r=(a||e)&&t[o];if(e&&(S(r)||_n(r))||a&&n(r))return!0}return!1}(a,e)){o.$shared=!1;l=$e(a,i=S(i)?i():i,this.createResolver(t,i,r))}for(const t of e)o[t]=l[t];return o}createResolver(t,e,i=[""],s){const{resolver:n}=xn(this._resolverCache,t,i);return o(e)?$e(n,e,void 0,s):n}}function xn(t,e,i){let s=t.get(e);s||(s=new Map,t.set(e,s));const n=i.join();let o=s.get(n);if(!o){o={resolver:je(e,i),subPrefixes:i.filter((t=>!t.toLowerCase().includes("hover")))},s.set(n,o)}return o}const _n=t=>o(t)&&Object.getOwnPropertyNames(t).some((e=>S(t[e])));const yn=["top","bottom","left","right","chartArea"];function vn(t,e){return"top"===t||"bottom"===t||-1===yn.indexOf(t)&&"x"===e}function Mn(t,e){return function(i,s){return i[t]===s[t]?i[e]-s[e]:i[t]-s[t]}}function wn(t){const e=t.chart,i=e.options.animation;e.notifyPlugins("afterRender"),d(i&&i.onComplete,[t],e)}function kn(t){const e=t.chart,i=e.options.animation;d(i&&i.onProgress,[t],e)}function Sn(t){return fe()&&"string"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const Pn={},Dn=t=>{const e=Sn(t);return Object.values(Pn).filter((t=>t.canvas===e)).pop()};function Cn(t,e,i){const s=Object.keys(t);for(const n of s){const s=+n;if(s>=e){const o=t[n];delete t[n],(i>0||s>e)&&(t[s+i]=o)}}}function On(t,e,i){return t.options.clip?t[i]:e[i]}class An{static defaults=ue;static instances=Pn;static overrides=re;static registry=en;static version="4.4.2";static getChart=Dn;static register(...t){en.add(...t),Tn()}static unregister(...t){en.remove(...t),Tn()}constructor(t,e){const s=this.config=new bn(e),n=Sn(t),o=Dn(n);if(o)throw new Error("Canvas is already in use. Chart with ID '"+o.id+"' must be destroyed before the canvas with ID '"+o.canvas.id+"' can be reused.");const a=s.createResolver(s.chartOptionScopes(),this.getContext());this.platform=new(s.platform||ks(n)),this.platform.updateConfig(s);const r=this.platform.acquireContext(n,a.aspectRatio),l=r&&r.canvas,h=l&&l.height,c=l&&l.width;this.id=i(),this.ctx=r,this.canvas=l,this.width=c,this.height=h,this._options=a,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new sn,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=dt((t=>this.update(t)),a.resizeDelay||0),this._dataChanges=[],Pn[this.id]=this,r&&l?(xt.listen(this,"complete",wn),xt.listen(this,"progress",kn),this._initialize(),this.attached&&this.update()):console.error("Failed to create chart: can't acquire context from the given item")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:o}=this;return s(t)?e&&o?o:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return en}_initialize(){return this.notifyPlugins("beforeInit"),this.options.responsive?this.resize():ke(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins("afterInit"),this}clear(){return Te(this.canvas,this.ctx),this}stop(){return xt.stop(this),this}resize(t,e){xt.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,s=this.canvas,n=i.maintainAspectRatio&&this.aspectRatio,o=this.platform.getMaximumSize(s,t,e,n),a=i.devicePixelRatio||this.platform.getDevicePixelRatio(),r=this.width?"resize":"attach";this.width=o.width,this.height=o.height,this._aspectRatio=this.aspectRatio,ke(this,a,!0)&&(this.notifyPlugins("resize",{size:o}),d(i.onResize,[this,o],this),this.attached&&this._doResize(r)&&this.render())}ensureScalesHaveIDs(){u(this.options.scales||{},((t,e)=>{t.id=e}))}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,s=Object.keys(i).reduce(((t,e)=>(t[e]=!1,t)),{});let n=[];e&&(n=n.concat(Object.keys(e).map((t=>{const i=e[t],s=ln(t,i),n="r"===s,o="x"===s;return{options:i,dposition:n?"chartArea":o?"bottom":"left",dtype:n?"radialLinear":o?"category":"linear"}})))),u(n,(e=>{const n=e.options,o=n.id,a=ln(o,n),r=l(n.type,e.dtype);void 0!==n.position&&vn(n.position,a)===vn(e.dposition)||(n.position=e.dposition),s[o]=!0;let h=null;if(o in i&&i[o].type===r)h=i[o];else{h=new(en.getScale(r))({id:o,type:r,ctx:this.ctx,chart:this}),i[h.id]=h}h.init(n,t)})),u(s,((t,e)=>{t||delete i[e]})),u(i,(t=>{as.configure(this,t,t.options),as.addBox(this,t)}))}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort(((t,e)=>t.index-e.index)),i>e){for(let t=e;t<i;++t)this._destroyDatasetMeta(t);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort(Mn("order","index"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach(((t,i)=>{0===e.filter((e=>e===t._dataset)).length&&this._destroyDatasetMeta(i)}))}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,s;for(this._removeUnreferencedMetasets(),i=0,s=e.length;i<s;i++){const s=e[i];let n=this.getDatasetMeta(i);const o=s.type||this.config.type;if(n.type&&n.type!==o&&(this._destroyDatasetMeta(i),n=this.getDatasetMeta(i)),n.type=o,n.indexAxis=s.indexAxis||an(o,this.options),n.order=s.order||0,n.index=i,n.label=""+s.label,n.visible=this.isDatasetVisible(i),n.controller)n.controller.updateIndex(i),n.controller.linkScales();else{const e=en.getController(o),{datasetElementType:s,dataElementType:a}=ue.datasets[o];Object.assign(e,{dataElementType:en.getElement(a),datasetElementType:s&&en.getElement(s)}),n.controller=new e(this,i),t.push(n.controller)}}return this._updateMetasets(),t}_resetElements(){u(this.data.datasets,((t,e)=>{this.getDatasetMeta(e).controller.reset()}),this)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),s=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),!1===this.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0}))return;const n=this.buildOrUpdateControllers();this.notifyPlugins("beforeElementsUpdate");let o=0;for(let t=0,e=this.data.datasets.length;t<e;t++){const{controller:e}=this.getDatasetMeta(t),i=!s&&-1===n.indexOf(e);e.buildOrUpdateElements(i),o=Math.max(+e.getMaxOverflow(),o)}o=this._minPadding=i.layout.autoPadding?o:0,this._updateLayout(o),s||u(n,(t=>{t.reset()})),this._updateDatasets(t),this.notifyPlugins("afterUpdate",{mode:t}),this._layers.sort(Mn("z","_idx"));const{_active:a,_lastEvent:r}=this;r?this._eventHandler(r,!0):a.length&&this._updateHoverStyles(a,a,!0),this.render()}_updateScales(){u(this.scales,(t=>{as.removeBox(this,t)})),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);P(e,i)&&!!this._responsiveListeners===t.responsive||(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:s,count:n}of e){Cn(t,s,"_removeElements"===i?-n:n)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=e=>new Set(t.filter((t=>t[0]===e)).map(((t,e)=>e+","+t.splice(1).join(",")))),s=i(0);for(let t=1;t<e;t++)if(!P(s,i(t)))return;return Array.from(s).map((t=>t.split(","))).map((t=>({method:t[1],start:+t[2],count:+t[3]})))}_updateLayout(t){if(!1===this.notifyPlugins("beforeLayout",{cancelable:!0}))return;as.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],u(this.boxes,(t=>{i&&"chartArea"===t.position||(t.configure&&t.configure(),this._layers.push(...t._layers()))}),this),this._layers.forEach(((t,e)=>{t._idx=e})),this.notifyPlugins("afterLayout")}_updateDatasets(t){if(!1!==this.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})){for(let t=0,e=this.data.datasets.length;t<e;++t)this.getDatasetMeta(t).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,S(t)?t({datasetIndex:e}):t);this.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),s={meta:i,index:t,mode:e,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetUpdate",s)&&(i.controller._update(e),s.cancelable=!1,this.notifyPlugins("afterDatasetUpdate",s))}render(){!1!==this.notifyPlugins("beforeRender",{cancelable:!0})&&(xt.has(this)?this.attached&&!xt.running(this)&&xt.start(this):(this.draw(),wn({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:t,height:e}=this._resizeBeforeDraw;this._resize(t,e),this._resizeBeforeDraw=null}if(this.clear(),this.width<=0||this.height<=0)return;if(!1===this.notifyPlugins("beforeDraw",{cancelable:!0}))return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let s,n;for(s=0,n=e.length;s<n;++s){const n=e[s];t&&!n.visible||i.push(n)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(!1===this.notifyPlugins("beforeDatasetsDraw",{cancelable:!0}))return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this.ctx,i=t._clip,s=!i.disabled,n=function(t,e){const{xScale:i,yScale:s}=t;return i&&s?{left:On(i,e,"left"),right:On(i,e,"right"),top:On(s,e,"top"),bottom:On(s,e,"bottom")}:e}(t,this.chartArea),o={meta:t,index:t.index,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetDraw",o)&&(s&&Ie(e,{left:!1===i.left?0:n.left-i.left,right:!1===i.right?this.width:n.right+i.right,top:!1===i.top?0:n.top-i.top,bottom:!1===i.bottom?this.height:n.bottom+i.bottom}),t.controller.draw(),s&&ze(e),o.cancelable=!1,this.notifyPlugins("afterDatasetDraw",o))}isPointInArea(t){return Re(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,s){const n=Xi.modes[e];return"function"==typeof n?n(this,t,i,s):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let s=i.filter((t=>t&&t._dataset===e)).pop();return s||(s={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(s)),s}getContext(){return this.$context||(this.$context=Ci(null,{chart:this,type:"chart"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return"boolean"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const s=i?"show":"hide",n=this.getDatasetMeta(t),o=n.controller._resolveAnimations(void 0,s);k(e)?(n.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),o.update(n,{visible:i}),this.update((e=>e.datasetIndex===t?s:void 0)))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),xt.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins("beforeDestroy");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),Te(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete Pn[this.id],this.notifyPlugins("afterDestroy")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(t,e,i)=>{t.offsetX=e,t.offsetY=i,this._eventHandler(t)};u(this.options.events,(t=>i(t,s)))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(i,s)=>{t[i]&&(e.removeEventListener(this,i,s),delete t[i])},n=(t,e)=>{this.canvas&&this.resize(t,e)};let o;const a=()=>{s("attach",a),this.attached=!0,this.resize(),i("resize",n),i("detach",o)};o=()=>{this.attached=!1,s("resize",n),this._stop(),this._resize(0,0),i("attach",a)},e.isAttached(this.canvas)?a():o()}unbindEvents(){u(this._listeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._listeners={},u(this._responsiveListeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const s=i?"set":"remove";let n,o,a,r;for("dataset"===e&&(n=this.getDatasetMeta(t[0].datasetIndex),n.controller["_"+s+"DatasetHoverStyle"]()),a=0,r=t.length;a<r;++a){o=t[a];const e=o&&this.getDatasetMeta(o.datasetIndex).controller;e&&e[s+"HoverStyle"](o.element,o.datasetIndex,o.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map((({datasetIndex:t,index:e})=>{const i=this.getDatasetMeta(t);if(!i)throw new Error("No dataset found at index "+t);return{datasetIndex:t,element:i.data[e],index:e}}));!f(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return 1===this._plugins._cache.filter((e=>e.plugin.id===t)).length}_updateHoverStyles(t,e,i){const s=this.options.hover,n=(t,e)=>t.filter((t=>!e.some((e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)))),o=n(e,t),a=i?t:n(t,e);o.length&&this.updateHoverStyle(o,s.mode,!1),a.length&&s.mode&&this.updateHoverStyle(a,s.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},s=e=>(e.options.events||this.options.events).includes(t.native.type);if(!1===this.notifyPlugins("beforeEvent",i,s))return;const n=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins("afterEvent",i,s),(n||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:s=[],options:n}=this,o=e,a=this._getActiveElements(t,s,i,o),r=D(t),l=function(t,e,i,s){return i&&"mouseout"!==t.type?s?e:t:null}(t,this._lastEvent,i,r);i&&(this._lastEvent=null,d(n.onHover,[t,a,this],this),r&&d(n.onClick,[t,a,this],this));const h=!f(a,s);return(h||e)&&(this._active=a,this._updateHoverStyles(a,s,e)),this._lastEvent=l,h}_getActiveElements(t,e,i,s){if("mouseout"===t.type)return[];if(!i)return e;const n=this.options.hover;return this.getElementsAtEventForMode(t,n.mode,n,s)}}function Tn(){return u(An.instances,(t=>t._plugins.invalidate()))}function Ln(){throw new Error("This method is not implemented: Check that a complete date adapter is provided.")}class En{static override(t){Object.assign(En.prototype,t)}options;constructor(t){this.options=t||{}}init(){}formats(){return Ln()}parse(){return Ln()}format(){return Ln()}add(){return Ln()}diff(){return Ln()}startOf(){return Ln()}endOf(){return Ln()}}var Rn={_date:En};function In(t){const e=t.iScale,i=function(t,e){if(!t._cache.$bar){const i=t.getMatchingVisibleMetas(e);let s=[];for(let e=0,n=i.length;e<n;e++)s=s.concat(i[e].controller.getAllParsedValues(t));t._cache.$bar=lt(s.sort(((t,e)=>t-e)))}return t._cache.$bar}(e,t.type);let s,n,o,a,r=e._length;const l=()=>{32767!==o&&-32768!==o&&(k(a)&&(r=Math.min(r,Math.abs(o-a)||r)),a=o)};for(s=0,n=i.length;s<n;++s)o=e.getPixelForValue(i[s]),l();for(a=void 0,s=0,n=e.ticks.length;s<n;++s)o=e.getPixelForTick(s),l();return r}function zn(t,e,i,s){return n(t)?function(t,e,i,s){const n=i.parse(t[0],s),o=i.parse(t[1],s),a=Math.min(n,o),r=Math.max(n,o);let l=a,h=r;Math.abs(a)>Math.abs(r)&&(l=r,h=a),e[i.axis]=h,e._custom={barStart:l,barEnd:h,start:n,end:o,min:a,max:r}}(t,e,i,s):e[i.axis]=i.parse(t,s),e}function Fn(t,e,i,s){const n=t.iScale,o=t.vScale,a=n.getLabels(),r=n===o,l=[];let h,c,d,u;for(h=i,c=i+s;h<c;++h)u=e[h],d={},d[n.axis]=r||n.parse(a[h],h),l.push(zn(u,d,o,h));return l}function Vn(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}function Bn(t,e,i,s){let n=e.borderSkipped;const o={};if(!n)return void(t.borderSkipped=o);if(!0===n)return void(t.borderSkipped={top:!0,right:!0,bottom:!0,left:!0});const{start:a,end:r,reverse:l,top:h,bottom:c}=function(t){let e,i,s,n,o;return t.horizontal?(e=t.base>t.x,i="left",s="right"):(e=t.base<t.y,i="bottom",s="top"),e?(n="end",o="start"):(n="start",o="end"),{start:i,end:s,reverse:e,top:n,bottom:o}}(t);"middle"===n&&i&&(t.enableBorderRadius=!0,(i._top||0)===s?n=h:(i._bottom||0)===s?n=c:(o[Wn(c,a,r,l)]=!0,n=h)),o[Wn(n,a,r,l)]=!0,t.borderSkipped=o}function Wn(t,e,i,s){var n,o,a;return s?(a=i,t=Nn(t=(n=t)===(o=e)?a:n===a?o:n,i,e)):t=Nn(t,e,i),t}function Nn(t,e,i){return"start"===t?e:"end"===t?i:t}function Hn(t,{inflateAmount:e},i){t.inflateAmount="auto"===e?1===i?.33:0:e}class jn extends Ns{static id="doughnut";static defaults={datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth","spacing"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",spacing:0,indexAxis:"r"};static descriptors={_scriptable:t=>"spacing"!==t,_indexable:t=>"spacing"!==t&&!t.startsWith("borderDash")&&!t.startsWith("hoverBorderDash")};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}};constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,s=this._cachedMeta;if(!1===this._parsing)s._parsed=i;else{let n,a,r=t=>+i[t];if(o(i[t])){const{key:t="value"}=this._parsing;r=e=>+M(i[e],t)}for(n=t,a=t+e;n<a;++n)s._parsed[n]=r(n)}}_getRotation(){return $(this.options.rotation-90)}_getCircumference(){return $(this.options.circumference)}_getRotationExtents(){let t=O,e=-O;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const s=this.chart.getDatasetMeta(i).controller,n=s._getRotation(),o=s._getCircumference();t=Math.min(t,n),e=Math.max(e,n+o)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,s=this._cachedMeta,n=s.data,o=this.getMaxBorderWidth()+this.getMaxOffset(n)+this.options.spacing,a=Math.max((Math.min(i.width,i.height)-o)/2,0),r=Math.min(h(this.options.cutout,a),1),l=this._getRingWeight(this.index),{circumference:d,rotation:u}=this._getRotationExtents(),{ratioX:f,ratioY:g,offsetX:p,offsetY:m}=function(t,e,i){let s=1,n=1,o=0,a=0;if(e<O){const r=t,l=r+e,h=Math.cos(r),c=Math.sin(r),d=Math.cos(l),u=Math.sin(l),f=(t,e,s)=>Z(t,r,l,!0)?1:Math.max(e,e*i,s,s*i),g=(t,e,s)=>Z(t,r,l,!0)?-1:Math.min(e,e*i,s,s*i),p=f(0,h,d),m=f(E,c,u),b=g(C,h,d),x=g(C+E,c,u);s=(p-b)/2,n=(m-x)/2,o=-(p+b)/2,a=-(m+x)/2}return{ratioX:s,ratioY:n,offsetX:o,offsetY:a}}(u,d,r),b=(i.width-o)/f,x=(i.height-o)/g,_=Math.max(Math.min(b,x)/2,0),y=c(this.options.radius,_),v=(y-Math.max(y*r,0))/this._getVisibleDatasetWeightTotal();this.offsetX=p*y,this.offsetY=m*y,s.total=this.calculateTotal(),this.outerRadius=y-v*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-v*l,0),this.updateElements(n,0,n.length,t)}_circumference(t,e){const i=this.options,s=this._cachedMeta,n=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||null===s._parsed[t]||s.data[t].hidden?0:this.calculateCircumference(s._parsed[t]*n/O)}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.chartArea,r=o.options.animation,l=(a.left+a.right)/2,h=(a.top+a.bottom)/2,c=n&&r.animateScale,d=c?0:this.innerRadius,u=c?0:this.outerRadius,{sharedOptions:f,includeOptions:g}=this._getSharedOptions(e,s);let p,m=this._getRotation();for(p=0;p<e;++p)m+=this._circumference(p,n);for(p=e;p<e+i;++p){const e=this._circumference(p,n),i=t[p],o={x:l+this.offsetX,y:h+this.offsetY,startAngle:m,endAngle:m+e,circumference:e,outerRadius:u,innerRadius:d};g&&(o.options=f||this.resolveDataElementOptions(p,i.active?"active":s)),m+=e,this.updateElement(i,p,o,s)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,s=0;for(i=0;i<e.length;i++){const n=t._parsed[i];null===n||isNaN(n)||!this.chart.getDataVisibility(i)||e[i].hidden||(s+=Math.abs(n))}return s}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?O*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t],i.options.locale);return{label:s[t]||"",value:n}}getMaxBorderWidth(t){let e=0;const i=this.chart;let s,n,o,a,r;if(!t)for(s=0,n=i.data.datasets.length;s<n;++s)if(i.isDatasetVisible(s)){o=i.getDatasetMeta(s),t=o.data,a=o.controller;break}if(!t)return 0;for(s=0,n=t.length;s<n;++s)r=a.resolveDataElementOptions(s),"inner"!==r.borderAlign&&(e=Math.max(e,r.borderWidth||0,r.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,s=t.length;i<s;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(l(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}class $n extends Ns{static id="polarArea";static defaults={dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}};constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t].r,i.options.locale);return{label:s[t]||"",value:n}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach(((t,i)=>{const s=this.getParsed(i).r;!isNaN(s)&&this.chart.getDataVisibility(i)&&(s<e.min&&(e.min=s),s>e.max&&(e.max=s))})),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,s=Math.min(e.right-e.left,e.bottom-e.top),n=Math.max(s/2,0),o=(n-Math.max(i.cutoutPercentage?n/100*i.cutoutPercentage:1,0))/t.getVisibleDatasetCount();this.outerRadius=n-o*this.index,this.innerRadius=this.outerRadius-o}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.options.animation,r=this._cachedMeta.rScale,l=r.xCenter,h=r.yCenter,c=r.getIndexAngle(0)-.5*C;let d,u=c;const f=360/this.countVisibleElements();for(d=0;d<e;++d)u+=this._computeAngle(d,s,f);for(d=e;d<e+i;d++){const e=t[d];let i=u,g=u+this._computeAngle(d,s,f),p=o.getDataVisibility(d)?r.getDistanceFromCenterForValue(this.getParsed(d).r):0;u=g,n&&(a.animateScale&&(p=0),a.animateRotate&&(i=g=c));const m={x:l,y:h,innerRadius:0,outerRadius:p,startAngle:i,endAngle:g,options:this.resolveDataElementOptions(d,e.active?"active":s)};this.updateElement(e,d,m,s)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach(((t,i)=>{!isNaN(this.getParsed(i).r)&&this.chart.getDataVisibility(i)&&e++})),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?$(this.resolveDataElementOptions(t,e).angle||i):0}}var Yn=Object.freeze({__proto__:null,BarController:class extends Ns{static id="bar";static defaults={datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}};static overrides={scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}};parsePrimitiveData(t,e,i,s){return Fn(t,e,i,s)}parseArrayData(t,e,i,s){return Fn(t,e,i,s)}parseObjectData(t,e,i,s){const{iScale:n,vScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l="x"===n.axis?a:r,h="x"===o.axis?a:r,c=[];let d,u,f,g;for(d=i,u=i+s;d<u;++d)g=e[d],f={},f[n.axis]=n.parse(M(g,l),d),c.push(zn(M(g,h),f,o,d));return c}updateRangeFromParsed(t,e,i,s){super.updateRangeFromParsed(t,e,i,s);const n=i._custom;n&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,n.min),t.max=Math.max(t.max,n.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:s}=e,n=this.getParsed(t),o=n._custom,a=Vn(o)?"["+o.start+", "+o.end+"]":""+s.getLabelForValue(n[s.axis]);return{label:""+i.getLabelForValue(n[i.axis]),value:a}}initialize(){this.enableOptionSharing=!0,super.initialize();this._cachedMeta.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const o="reset"===n,{index:a,_cachedMeta:{vScale:r}}=this,l=r.getBasePixel(),h=r.isHorizontal(),c=this._getRuler(),{sharedOptions:d,includeOptions:u}=this._getSharedOptions(e,n);for(let f=e;f<e+i;f++){const e=this.getParsed(f),i=o||s(e[r.axis])?{base:l,head:l}:this._calculateBarValuePixels(f),g=this._calculateBarIndexPixels(f,c),p=(e._stacks||{})[r.axis],m={horizontal:h,base:i.base,enableBorderRadius:!p||Vn(e._custom)||a===p._top||a===p._bottom,x:h?i.head:g.center,y:h?g.center:i.head,height:h?g.size:Math.abs(i.size),width:h?Math.abs(i.size):g.size};u&&(m.options=d||this.resolveDataElementOptions(f,t[f].active?"active":n));const b=m.options||t[f].options;Bn(m,b,p,a),Hn(m,b,c.ratio),this.updateElement(t[f],f,m,n)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,n=i.getMatchingVisibleMetas(this._type).filter((t=>t.controller.options.grouped)),o=i.options.stacked,a=[],r=t=>{const i=t.controller.getParsed(e),n=i&&i[t.vScale.axis];if(s(n)||isNaN(n))return!0};for(const i of n)if((void 0===e||!r(i))&&((!1===o||-1===a.indexOf(i.stack)||void 0===o&&void 0===i.stack)&&a.push(i.stack),i.index===t))break;return a.length||a.push(void 0),a}_getStackCount(t){return this._getStacks(void 0,t).length}_getStackIndex(t,e,i){const s=this._getStacks(t,i),n=void 0!==e?s.indexOf(e):-1;return-1===n?s.length-1:n}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,s=[];let n,o;for(n=0,o=e.data.length;n<o;++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis],n));const a=t.barThickness;return{min:a||In(e),pixels:s,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:a?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:n},options:{base:o,minBarLength:a}}=this,r=o||0,l=this.getParsed(t),h=l._custom,c=Vn(h);let d,u,f=l[e.axis],g=0,p=i?this.applyStack(e,l,i):f;p!==f&&(g=p-f,p=f),c&&(f=h.barStart,p=h.barEnd-h.barStart,0!==f&&F(f)!==F(h.barEnd)&&(g=0),g+=f);const m=s(o)||c?g:o;let b=e.getPixelForValue(m);if(d=this.chart.getDataVisibility(t)?e.getPixelForValue(g+p):b,u=d-b,Math.abs(u)<a){u=function(t,e,i){return 0!==t?F(t):(e.isHorizontal()?1:-1)*(e.min>=i?1:-1)}(u,e,r)*a,f===r&&(b-=u/2);const t=e.getPixelForDecimal(0),s=e.getPixelForDecimal(1),o=Math.min(t,s),h=Math.max(t,s);b=Math.max(Math.min(b,h),o),d=b+u,i&&!c&&(l._stacks[e.axis]._visualValues[n]=e.getValueForPixel(d)-e.getValueForPixel(b))}if(b===e.getPixelForValue(r)){const t=F(u)*e.getLineWidthForValue(r)/2;b+=t,u-=t}return{size:u,base:b,head:d,center:d+u/2}}_calculateBarIndexPixels(t,e){const i=e.scale,n=this.options,o=n.skipNull,a=l(n.maxBarThickness,1/0);let r,h;if(e.grouped){const i=o?this._getStackCount(t):e.stackCount,l="flex"===n.barThickness?function(t,e,i,s){const n=e.pixels,o=n[t];let a=t>0?n[t-1]:null,r=t<n.length-1?n[t+1]:null;const l=i.categoryPercentage;null===a&&(a=o-(null===r?e.end-e.start:r-o)),null===r&&(r=o+o-a);const h=o-(o-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/s,ratio:i.barPercentage,start:h}}(t,e,n,i):function(t,e,i,n){const o=i.barThickness;let a,r;return s(o)?(a=e.min*i.categoryPercentage,r=i.barPercentage):(a=o*n,r=1),{chunk:a/n,ratio:r,start:e.pixels[t]-a/2}}(t,e,n,i),c=this._getStackIndex(this.index,this._cachedMeta.stack,o?t:void 0);r=l.start+l.chunk*c+l.chunk/2,h=Math.min(a,l.chunk*l.ratio)}else r=i.getPixelForValue(this.getParsed(t)[i.axis],t),h=Math.min(a,e.min*e.ratio);return{base:r-h/2,head:r+h/2,center:r,size:h}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,s=i.length;let n=0;for(;n<s;++n)null!==this.getParsed(n)[e.axis]&&i[n].draw(this._ctx)}},BubbleController:class extends Ns{static id="bubble";static defaults={datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}};static overrides={scales:{x:{type:"linear"},y:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,s){const n=super.parsePrimitiveData(t,e,i,s);for(let t=0;t<n.length;t++)n[t]._custom=this.resolveDataElementOptions(t+i).radius;return n}parseArrayData(t,e,i,s){const n=super.parseArrayData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s[2],this.resolveDataElementOptions(t+i).radius)}return n}parseObjectData(t,e,i,s){const n=super.parseObjectData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s&&s.r&&+s.r,this.resolveDataElementOptions(t+i).radius)}return n}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y),l=o._custom;return{label:i[t]||"",value:"("+a+", "+r+(l?", "+l:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,s){const n="reset"===s,{iScale:o,vScale:a}=this._cachedMeta,{sharedOptions:r,includeOptions:l}=this._getSharedOptions(e,s),h=o.axis,c=a.axis;for(let d=e;d<e+i;d++){const e=t[d],i=!n&&this.getParsed(d),u={},f=u[h]=n?o.getPixelForDecimal(.5):o.getPixelForValue(i[h]),g=u[c]=n?a.getBasePixel():a.getPixelForValue(i[c]);u.skip=isNaN(f)||isNaN(g),l&&(u.options=r||this.resolveDataElementOptions(d,e.active?"active":s),n&&(u.options.radius=0)),this.updateElement(e,d,u,s)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let s=super.resolveDataElementOptions(t,e);s.$shared&&(s=Object.assign({},s,{$shared:!1}));const n=s.radius;return"active"!==e&&(s.radius=0),s.radius+=l(i&&i._custom,n),s}},DoughnutController:jn,LineController:class extends Ns{static id="line";static defaults={datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1};static overrides={scales:{_index_:{type:"category"},_value_:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:s=[],_dataset:n}=e,o=this.chart._animationsDisabled;let{start:a,count:r}=pt(e,s,o);this._drawStart=a,this._drawCount=r,mt(e)&&(a=0,r=s.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!n._decimated,i.points=s;const l=this.resolveDatasetElementOptions(t);this.options.showLine||(l.borderWidth=0),l.segment=this.options.segment,this.updateElement(i,void 0,{animated:!o,options:l},t),this.updateElements(s,a,r,t)}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,{sharedOptions:c,includeOptions:d}=this._getSharedOptions(e,n),u=a.axis,f=r.axis,{spanGaps:g,segment:p}=this.options,m=N(g)?g:Number.POSITIVE_INFINITY,b=this.chart._animationsDisabled||o||"none"===n,x=e+i,_=t.length;let y=e>0&&this.getParsed(e-1);for(let i=0;i<_;++i){const g=t[i],_=b?g:{};if(i<e||i>=x){_.skip=!0;continue}const v=this.getParsed(i),M=s(v[f]),w=_[u]=a.getPixelForValue(v[u],i),k=_[f]=o||M?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,v,l):v[f],i);_.skip=isNaN(w)||isNaN(k)||M,_.stop=i>0&&Math.abs(v[u]-y[u])>m,p&&(_.parsed=v,_.raw=h.data[i]),d&&(_.options=c||this.resolveDataElementOptions(i,g.active?"active":n)),b||this.updateElement(g,i,_,n),y=v}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,s=t.data||[];if(!s.length)return i;const n=s[0].size(this.resolveDataElementOptions(0)),o=s[s.length-1].size(this.resolveDataElementOptions(s.length-1));return Math.max(i,n,o)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}},PieController:class extends jn{static id="pie";static defaults={cutout:0,rotation:0,circumference:360,radius:"100%"}},PolarAreaController:$n,RadarController:class extends Ns{static id="radar";static defaults={datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}};static overrides={aspectRatio:1,scales:{r:{type:"radialLinear"}}};getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta,i=e.dataset,s=e.data||[],n=e.iScale.getLabels();if(i.points=s,"resize"!==t){const e=this.resolveDatasetElementOptions(t);this.options.showLine||(e.borderWidth=0);const o={_loop:!0,_fullLoop:n.length===s.length,options:e};this.updateElement(i,void 0,o,t)}this.updateElements(s,0,s.length,t)}updateElements(t,e,i,s){const n=this._cachedMeta.rScale,o="reset"===s;for(let a=e;a<e+i;a++){const e=t[a],i=this.resolveDataElementOptions(a,e.active?"active":s),r=n.getPointPositionForValue(a,this.getParsed(a).r),l=o?n.xCenter:r.x,h=o?n.yCenter:r.y,c={x:l,y:h,angle:r.angle,skip:isNaN(l)||isNaN(h),options:i};this.updateElement(e,a,c,s)}}},ScatterController:class extends Ns{static id="scatter";static defaults={datasetElementType:!1,dataElementType:"point",showLine:!1,fill:!1};static overrides={interaction:{mode:"point"},scales:{x:{type:"linear"},y:{type:"linear"}}};getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y);return{label:i[t]||"",value:"("+a+", "+r+")"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,s=this.chart._animationsDisabled;let{start:n,count:o}=pt(e,i,s);if(this._drawStart=n,this._drawCount=o,mt(e)&&(n=0,o=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:n,_dataset:o}=e;n._chart=this.chart,n._datasetIndex=this.index,n._decimated=!!o._decimated,n.points=i;const a=this.resolveDatasetElementOptions(t);a.segment=this.options.segment,this.updateElement(n,void 0,{animated:!s,options:a},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,n,o,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement("line")),super.addElements()}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,c=this.resolveDataElementOptions(e,n),d=this.getSharedOptions(c),u=this.includeOptions(n,d),f=a.axis,g=r.axis,{spanGaps:p,segment:m}=this.options,b=N(p)?p:Number.POSITIVE_INFINITY,x=this.chart._animationsDisabled||o||"none"===n;let _=e>0&&this.getParsed(e-1);for(let c=e;c<e+i;++c){const e=t[c],i=this.getParsed(c),p=x?e:{},y=s(i[g]),v=p[f]=a.getPixelForValue(i[f],c),M=p[g]=o||y?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,i,l):i[g],c);p.skip=isNaN(v)||isNaN(M)||y,p.stop=c>0&&Math.abs(i[f]-_[f])>b,m&&(p.parsed=i,p.raw=h.data[c]),u&&(p.options=d||this.resolveDataElementOptions(c,e.active?"active":n)),x||this.updateElement(e,c,p,n),_=i}this.updateSharedOptions(d,n,c)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let t=0;for(let i=e.length-1;i>=0;--i)t=Math.max(t,e[i].size(this.resolveDataElementOptions(i))/2);return t>0&&t}const i=t.dataset,s=i.options&&i.options.borderWidth||0;if(!e.length)return s;const n=e[0].size(this.resolveDataElementOptions(0)),o=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(s,n,o)/2}}});function Un(t,e,i,s){const n=vi(t.options.borderRadius,["outerStart","outerEnd","innerStart","innerEnd"]);const o=(i-e)/2,a=Math.min(o,s*e/2),r=t=>{const e=(i-Math.min(o,t))*s/2;return J(t,0,Math.min(o,e))};return{outerStart:r(n.outerStart),outerEnd:r(n.outerEnd),innerStart:J(n.innerStart,0,a),innerEnd:J(n.innerEnd,0,a)}}function Xn(t,e,i,s){return{x:i+t*Math.cos(e),y:s+t*Math.sin(e)}}function qn(t,e,i,s,n,o){const{x:a,y:r,startAngle:l,pixelMargin:h,innerRadius:c}=e,d=Math.max(e.outerRadius+s+i-h,0),u=c>0?c+s+i+h:0;let f=0;const g=n-l;if(s){const t=((c>0?c-s:0)+(d>0?d-s:0))/2;f=(g-(0!==t?g*t/(t+s):g))/2}const p=(g-Math.max(.001,g*d-i/C)/d)/2,m=l+p+f,b=n-p-f,{outerStart:x,outerEnd:_,innerStart:y,innerEnd:v}=Un(e,u,d,b-m),M=d-x,w=d-_,k=m+x/M,S=b-_/w,P=u+y,D=u+v,O=m+y/P,A=b-v/D;if(t.beginPath(),o){const e=(k+S)/2;if(t.arc(a,r,d,k,e),t.arc(a,r,d,e,S),_>0){const e=Xn(w,S,a,r);t.arc(e.x,e.y,_,S,b+E)}const i=Xn(D,b,a,r);if(t.lineTo(i.x,i.y),v>0){const e=Xn(D,A,a,r);t.arc(e.x,e.y,v,b+E,A+Math.PI)}const s=(b-v/u+(m+y/u))/2;if(t.arc(a,r,u,b-v/u,s,!0),t.arc(a,r,u,s,m+y/u,!0),y>0){const e=Xn(P,O,a,r);t.arc(e.x,e.y,y,O+Math.PI,m-E)}const n=Xn(M,m,a,r);if(t.lineTo(n.x,n.y),x>0){const e=Xn(M,k,a,r);t.arc(e.x,e.y,x,m-E,k)}}else{t.moveTo(a,r);const e=Math.cos(k)*d+a,i=Math.sin(k)*d+r;t.lineTo(e,i);const s=Math.cos(S)*d+a,n=Math.sin(S)*d+r;t.lineTo(s,n)}t.closePath()}function Kn(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r,options:l}=e,{borderWidth:h,borderJoinStyle:c,borderDash:d,borderDashOffset:u}=l,f="inner"===l.borderAlign;if(!h)return;t.setLineDash(d||[]),t.lineDashOffset=u,f?(t.lineWidth=2*h,t.lineJoin=c||"round"):(t.lineWidth=h,t.lineJoin=c||"bevel");let g=e.endAngle;if(o){qn(t,e,i,s,g,n);for(let e=0;e<o;++e)t.stroke();isNaN(r)||(g=a+(r%O||O))}f&&function(t,e,i){const{startAngle:s,pixelMargin:n,x:o,y:a,outerRadius:r,innerRadius:l}=e;let h=n/r;t.beginPath(),t.arc(o,a,r,s-h,i+h),l>n?(h=n/l,t.arc(o,a,l,i+h,s-h,!0)):t.arc(o,a,n,i+E,s-E),t.closePath(),t.clip()}(t,e,g),o||(qn(t,e,i,s,g,n),t.stroke())}function Gn(t,e,i=e){t.lineCap=l(i.borderCapStyle,e.borderCapStyle),t.setLineDash(l(i.borderDash,e.borderDash)),t.lineDashOffset=l(i.borderDashOffset,e.borderDashOffset),t.lineJoin=l(i.borderJoinStyle,e.borderJoinStyle),t.lineWidth=l(i.borderWidth,e.borderWidth),t.strokeStyle=l(i.borderColor,e.borderColor)}function Zn(t,e,i){t.lineTo(i.x,i.y)}function Jn(t,e,i={}){const s=t.length,{start:n=0,end:o=s-1}=i,{start:a,end:r}=e,l=Math.max(n,a),h=Math.min(o,r),c=n<a&&o<a||n>r&&o>r;return{count:s,start:l,loop:e.loop,ilen:h<l&&!c?s+h-l:h-l}}function Qn(t,e,i,s){const{points:n,options:o}=e,{count:a,start:r,loop:l,ilen:h}=Jn(n,i,s),c=function(t){return t.stepped?Fe:t.tension||"monotone"===t.cubicInterpolationMode?Ve:Zn}(o);let d,u,f,{move:g=!0,reverse:p}=s||{};for(d=0;d<=h;++d)u=n[(r+(p?h-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):c(t,f,u,p,o.stepped),f=u);return l&&(u=n[(r+(p?h:0))%a],c(t,f,u,p,o.stepped)),!!l}function to(t,e,i,s){const n=e.points,{count:o,start:a,ilen:r}=Jn(n,i,s),{move:l=!0,reverse:h}=s||{};let c,d,u,f,g,p,m=0,b=0;const x=t=>(a+(h?r-t:t))%o,_=()=>{f!==g&&(t.lineTo(m,g),t.lineTo(m,f),t.lineTo(m,p))};for(l&&(d=n[x(0)],t.moveTo(d.x,d.y)),c=0;c<=r;++c){if(d=n[x(c)],d.skip)continue;const e=d.x,i=d.y,s=0|e;s===u?(i<f?f=i:i>g&&(g=i),m=(b*m+e)/++b):(_(),t.lineTo(e,i),u=s,b=0,f=g=i),p=i}_()}function eo(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||"monotone"===e.cubicInterpolationMode||e.stepped||i)?to:Qn}const io="function"==typeof Path2D;function so(t,e,i,s){io&&!e.options.segment?function(t,e,i,s){let n=e._path;n||(n=e._path=new Path2D,e.path(n,i,s)&&n.closePath()),Gn(t,e.options),t.stroke(n)}(t,e,i,s):function(t,e,i,s){const{segments:n,options:o}=e,a=eo(e);for(const r of n)Gn(t,o,r.style),t.beginPath(),a(t,e,r,{start:i,end:i+s-1})&&t.closePath(),t.stroke()}(t,e,i,s)}class no extends Hs{static id="line";static defaults={borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t&&"fill"!==t};constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||"monotone"===i.cubicInterpolationMode)&&!i.stepped&&!this._pointsUpdated){const s=i.spanGaps?this._loop:this._fullLoop;hi(this._points,i,t,s,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=zi(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,s=t[e],n=this.points,o=Ii(this,{property:e,start:s,end:s});if(!o.length)return;const a=[],r=function(t){return t.stepped?pi:t.tension||"monotone"===t.cubicInterpolationMode?mi:gi}(i);let l,h;for(l=0,h=o.length;l<h;++l){const{start:h,end:c}=o[l],d=n[h],u=n[c];if(d===u){a.push(d);continue}const f=r(d,u,Math.abs((s-d[e])/(u[e]-d[e])),i.stepped);f[e]=t[e],a.push(f)}return 1===a.length?a[0]:a}pathSegment(t,e,i){return eo(this)(t,this,e,i)}path(t,e,i){const s=this.segments,n=eo(this);let o=this._loop;e=e||0,i=i||this.points.length-e;for(const a of s)o&=n(t,this,a,{start:e,end:e+i-1});return!!o}draw(t,e,i,s){const n=this.options||{};(this.points||[]).length&&n.borderWidth&&(t.save(),so(t,this,i,s),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}function oo(t,e,i,s){const n=t.options,{[i]:o}=t.getProps([i],s);return Math.abs(e-o)<n.radius+n.hitRadius}function ao(t,e){const{x:i,y:s,base:n,width:o,height:a}=t.getProps(["x","y","base","width","height"],e);let r,l,h,c,d;return t.horizontal?(d=a/2,r=Math.min(i,n),l=Math.max(i,n),h=s-d,c=s+d):(d=o/2,r=i-d,l=i+d,h=Math.min(s,n),c=Math.max(s,n)),{left:r,top:h,right:l,bottom:c}}function ro(t,e,i,s){return t?0:J(e,i,s)}function lo(t){const e=ao(t),i=e.right-e.left,s=e.bottom-e.top,n=function(t,e,i){const s=t.options.borderWidth,n=t.borderSkipped,o=Mi(s);return{t:ro(n.top,o.top,0,i),r:ro(n.right,o.right,0,e),b:ro(n.bottom,o.bottom,0,i),l:ro(n.left,o.left,0,e)}}(t,i/2,s/2),a=function(t,e,i){const{enableBorderRadius:s}=t.getProps(["enableBorderRadius"]),n=t.options.borderRadius,a=wi(n),r=Math.min(e,i),l=t.borderSkipped,h=s||o(n);return{topLeft:ro(!h||l.top||l.left,a.topLeft,0,r),topRight:ro(!h||l.top||l.right,a.topRight,0,r),bottomLeft:ro(!h||l.bottom||l.left,a.bottomLeft,0,r),bottomRight:ro(!h||l.bottom||l.right,a.bottomRight,0,r)}}(t,i/2,s/2);return{outer:{x:e.left,y:e.top,w:i,h:s,radius:a},inner:{x:e.left+n.l,y:e.top+n.t,w:i-n.l-n.r,h:s-n.t-n.b,radius:{topLeft:Math.max(0,a.topLeft-Math.max(n.t,n.l)),topRight:Math.max(0,a.topRight-Math.max(n.t,n.r)),bottomLeft:Math.max(0,a.bottomLeft-Math.max(n.b,n.l)),bottomRight:Math.max(0,a.bottomRight-Math.max(n.b,n.r))}}}}function ho(t,e,i,s){const n=null===e,o=null===i,a=t&&!(n&&o)&&ao(t,s);return a&&(n||tt(e,a.left,a.right))&&(o||tt(i,a.top,a.bottom))}function co(t,e){t.rect(e.x,e.y,e.w,e.h)}function uo(t,e,i={}){const s=t.x!==i.x?-e:0,n=t.y!==i.y?-e:0,o=(t.x+t.w!==i.x+i.w?e:0)-s,a=(t.y+t.h!==i.y+i.h?e:0)-n;return{x:t.x+s,y:t.y+n,w:t.w+o,h:t.h+a,radius:t.radius}}var fo=Object.freeze({__proto__:null,ArcElement:class extends Hs{static id="arc";static defaults={borderAlign:"center",borderColor:"#fff",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0};static defaultRoutes={backgroundColor:"backgroundColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t};circumference;endAngle;fullCircles;innerRadius;outerRadius;pixelMargin;startAngle;constructor(t){super(),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.getProps(["x","y"],i),{angle:n,distance:o}=X(s,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:h,outerRadius:c,circumference:d}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],i),u=(this.options.spacing+this.options.borderWidth)/2,f=l(d,r-a)>=O||Z(n,a,r),g=tt(o,h+u,c+u);return f&&g}getCenterPoint(t){const{x:e,y:i,startAngle:s,endAngle:n,innerRadius:o,outerRadius:a}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],t),{offset:r,spacing:l}=this.options,h=(s+n)/2,c=(o+a+l+r)/2;return{x:e+Math.cos(h)*c,y:i+Math.sin(h)*c}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const{options:e,circumference:i}=this,s=(e.offset||0)/4,n=(e.spacing||0)/2,o=e.circular;if(this.pixelMargin="inner"===e.borderAlign?.33:0,this.fullCircles=i>O?Math.floor(i/O):0,0===i||this.innerRadius<0||this.outerRadius<0)return;t.save();const a=(this.startAngle+this.endAngle)/2;t.translate(Math.cos(a)*s,Math.sin(a)*s);const r=s*(1-Math.sin(Math.min(C,i||0)));t.fillStyle=e.backgroundColor,t.strokeStyle=e.borderColor,function(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r}=e;let l=e.endAngle;if(o){qn(t,e,i,s,l,n);for(let e=0;e<o;++e)t.fill();isNaN(r)||(l=a+(r%O||O))}qn(t,e,i,s,l,n),t.fill()}(t,this,r,n,o),Kn(t,this,r,n,o),t.restore()}},BarElement:class extends Hs{static id="bar";static defaults={borderSkipped:"start",borderWidth:0,borderRadius:0,inflateAmount:"auto",pointStyle:void 0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:s}}=this,{inner:n,outer:o}=lo(this),a=(r=o.radius).topLeft||r.topRight||r.bottomLeft||r.bottomRight?He:co;var r;t.save(),o.w===n.w&&o.h===n.h||(t.beginPath(),a(t,uo(o,e,n)),t.clip(),a(t,uo(n,-e,o)),t.fillStyle=i,t.fill("evenodd")),t.beginPath(),a(t,uo(n,e)),t.fillStyle=s,t.fill(),t.restore()}inRange(t,e,i){return ho(this,t,e,i)}inXRange(t,e){return ho(this,t,null,e)}inYRange(t,e){return ho(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:s,horizontal:n}=this.getProps(["x","y","base","horizontal"],t);return{x:n?(e+s)/2:e,y:n?i:(i+s)/2}}getRange(t){return"x"===t?this.width/2:this.height/2}},LineElement:no,PointElement:class extends Hs{static id="point";parsed;skip;stop;static defaults={borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.options,{x:n,y:o}=this.getProps(["x","y"],i);return Math.pow(t-n,2)+Math.pow(e-o,2)<Math.pow(s.hitRadius+s.radius,2)}inXRange(t,e){return oo(this,t,"x",e)}inYRange(t,e){return oo(this,t,"y",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t,e){const i=this.options;this.skip||i.radius<.1||!Re(this,e,this.size(i)/2)||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,Le(t,i,this.x,this.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}});function go(t,e,i,s){const n=t.indexOf(e);if(-1===n)return((t,e,i,s)=>("string"==typeof e?(i=t.push(e)-1,s.unshift({index:i,label:e})):isNaN(e)&&(i=null),i))(t,e,i,s);return n!==t.lastIndexOf(e)?i:n}function po(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}function mo(t,e,{horizontal:i,minRotation:s}){const n=$(s),o=(i?Math.sin(n):Math.cos(n))||.001,a=.75*e*(""+t).length;return Math.min(e/o,a)}class bo extends Js{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return s(t)||("number"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:s,max:n}=this;const o=t=>s=e?s:t,a=t=>n=i?n:t;if(t){const t=F(s),e=F(n);t<0&&e<0?a(0):t>0&&e>0&&o(0)}if(s===n){let e=0===n?1:Math.abs(.05*n);a(n+e),t||o(s-e)}this.min=s,this.max=n}getTickLimit(){const t=this.options.ticks;let e,{maxTicksLimit:i,stepSize:s}=t;return s?(e=Math.ceil(this.max/s)-Math.floor(this.min/s)+1,e>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`),e=1e3)):(e=this.computeTickLimit(),i=i||11),i&&(e=Math.min(i,e)),e}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const n=function(t,e){const i=[],{bounds:n,step:o,min:a,max:r,precision:l,count:h,maxTicks:c,maxDigits:d,includeBounds:u}=t,f=o||1,g=c-1,{min:p,max:m}=e,b=!s(a),x=!s(r),_=!s(h),y=(m-p)/(d+1);let v,M,w,k,S=B((m-p)/g/f)*f;if(S<1e-14&&!b&&!x)return[{value:p},{value:m}];k=Math.ceil(m/S)-Math.floor(p/S),k>g&&(S=B(k*S/g/f)*f),s(l)||(v=Math.pow(10,l),S=Math.ceil(S*v)/v),"ticks"===n?(M=Math.floor(p/S)*S,w=Math.ceil(m/S)*S):(M=p,w=m),b&&x&&o&&H((r-a)/o,S/1e3)?(k=Math.round(Math.min((r-a)/S,c)),S=(r-a)/k,M=a,w=r):_?(M=b?a:M,w=x?r:w,k=h-1,S=(w-M)/k):(k=(w-M)/S,k=V(k,Math.round(k),S/1e3)?Math.round(k):Math.ceil(k));const P=Math.max(U(S),U(M));v=Math.pow(10,s(l)?P:l),M=Math.round(M*v)/v,w=Math.round(w*v)/v;let D=0;for(b&&(u&&M!==a?(i.push({value:a}),M<a&&D++,V(Math.round((M+D*S)*v)/v,a,mo(a,y,t))&&D++):M<a&&D++);D<k;++D){const t=Math.round((M+D*S)*v)/v;if(x&&t>r)break;i.push({value:t})}return x&&u&&w!==r?i.length&&V(i[i.length-1].value,r,mo(r,y,t))?i[i.length-1].value=r:i.push({value:r}):x&&w!==r||i.push({value:w}),i}({maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:!1!==e.includeBounds},this._range||this);return"ticks"===t.bounds&&j(n,this,"value"),t.reverse?(n.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),n}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const s=(i-e)/Math.max(t.length-1,1)/2;e-=s,i+=s}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return ne(t,this.chart.options.locale,this.options.ticks.format)}}class xo extends bo{static id="linear";static defaults={ticks:{callback:ae.formatters.numeric}};determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?t:0,this.max=a(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=$(this.options.ticks.minRotation),s=(t?Math.sin(i):Math.cos(i))||.001,n=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,n.lineHeight/s))}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}const _o=t=>Math.floor(z(t)),yo=(t,e)=>Math.pow(10,_o(t)+e);function vo(t){return 1===t/Math.pow(10,_o(t))}function Mo(t,e,i){const s=Math.pow(10,i),n=Math.floor(t/s);return Math.ceil(e/s)-n}function wo(t,{min:e,max:i}){e=r(t.min,e);const s=[],n=_o(e);let o=function(t,e){let i=_o(e-t);for(;Mo(t,e,i)>10;)i++;for(;Mo(t,e,i)<10;)i--;return Math.min(i,_o(t))}(e,i),a=o<0?Math.pow(10,Math.abs(o)):1;const l=Math.pow(10,o),h=n>o?Math.pow(10,n):0,c=Math.round((e-h)*a)/a,d=Math.floor((e-h)/l/10)*l*10;let u=Math.floor((c-d)/Math.pow(10,o)),f=r(t.min,Math.round((h+d+u*Math.pow(10,o))*a)/a);for(;f<i;)s.push({value:f,major:vo(f),significand:u}),u>=10?u=u<15?15:20:u++,u>=20&&(o++,u=2,a=o>=0?1:a),f=Math.round((h+d+u*Math.pow(10,o))*a)/a;const g=r(t.max,f);return s.push({value:g,major:vo(g),significand:u}),s}class ko extends Js{static id="logarithmic";static defaults={ticks:{callback:ae.formatters.logarithmic,major:{enabled:!0}}};constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=bo.prototype.parse.apply(this,[t,e]);if(0!==i)return a(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?Math.max(0,t):null,this.max=a(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!a(this._userMin)&&(this.min=t===yo(this.min,0)?yo(this.min,-1):yo(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,s=this.max;const n=e=>i=t?i:e,o=t=>s=e?s:t;i===s&&(i<=0?(n(1),o(10)):(n(yo(i,-1)),o(yo(s,1)))),i<=0&&n(yo(s,-1)),s<=0&&o(yo(i,1)),this.min=i,this.max=s}buildTicks(){const t=this.options,e=wo({min:this._userMin,max:this._userMax},this);return"ticks"===t.bounds&&j(e,this,"value"),t.reverse?(e.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),e}getLabelForValue(t){return void 0===t?"0":ne(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=z(t),this._valueRange=z(this.max)-z(t)}getPixelForValue(t){return void 0!==t&&0!==t||(t=this.min),null===t||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(z(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}function So(t){const e=t.ticks;if(e.display&&t.display){const t=ki(e.backdropPadding);return l(e.font&&e.font.size,ue.font.size)+t.height}return 0}function Po(t,e,i,s,n){return t===s||t===n?{start:e-i/2,end:e+i/2}:t<s||t>n?{start:e-i,end:e}:{start:e,end:e+i}}function Do(t){const e={l:t.left+t._padding.left,r:t.right-t._padding.right,t:t.top+t._padding.top,b:t.bottom-t._padding.bottom},i=Object.assign({},e),s=[],o=[],a=t._pointLabels.length,r=t.options.pointLabels,l=r.centerPointLabels?C/a:0;for(let u=0;u<a;u++){const a=r.setContext(t.getPointLabelContext(u));o[u]=a.padding;const f=t.getPointPosition(u,t.drawingArea+o[u],l),g=Si(a.font),p=(h=t.ctx,c=g,d=n(d=t._pointLabels[u])?d:[d],{w:Oe(h,c.string,d),h:d.length*c.lineHeight});s[u]=p;const m=G(t.getIndexAngle(u)+l),b=Math.round(Y(m));Co(i,e,m,Po(b,f.x,p.w,0,180),Po(b,f.y,p.h,90,270))}var h,c,d;t.setCenterPoint(e.l-i.l,i.r-e.r,e.t-i.t,i.b-e.b),t._pointLabelItems=function(t,e,i){const s=[],n=t._pointLabels.length,o=t.options,{centerPointLabels:a,display:r}=o.pointLabels,l={extra:So(o)/2,additionalAngle:a?C/n:0};let h;for(let o=0;o<n;o++){l.padding=i[o],l.size=e[o];const n=Oo(t,o,l);s.push(n),"auto"===r&&(n.visible=Ao(n,h),n.visible&&(h=n))}return s}(t,s,o)}function Co(t,e,i,s,n){const o=Math.abs(Math.sin(i)),a=Math.abs(Math.cos(i));let r=0,l=0;s.start<e.l?(r=(e.l-s.start)/o,t.l=Math.min(t.l,e.l-r)):s.end>e.r&&(r=(s.end-e.r)/o,t.r=Math.max(t.r,e.r+r)),n.start<e.t?(l=(e.t-n.start)/a,t.t=Math.min(t.t,e.t-l)):n.end>e.b&&(l=(n.end-e.b)/a,t.b=Math.max(t.b,e.b+l))}function Oo(t,e,i){const s=t.drawingArea,{extra:n,additionalAngle:o,padding:a,size:r}=i,l=t.getPointPosition(e,s+n+a,o),h=Math.round(Y(G(l.angle+E))),c=function(t,e,i){90===i||270===i?t-=e/2:(i>270||i<90)&&(t-=e);return t}(l.y,r.h,h),d=function(t){if(0===t||180===t)return"center";if(t<180)return"left";return"right"}(h),u=function(t,e,i){"right"===i?t-=e:"center"===i&&(t-=e/2);return t}(l.x,r.w,d);return{visible:!0,x:l.x,y:c,textAlign:d,left:u,top:c,right:u+r.w,bottom:c+r.h}}function Ao(t,e){if(!e)return!0;const{left:i,top:s,right:n,bottom:o}=t;return!(Re({x:i,y:s},e)||Re({x:i,y:o},e)||Re({x:n,y:s},e)||Re({x:n,y:o},e))}function To(t,e,i){const{left:n,top:o,right:a,bottom:r}=i,{backdropColor:l}=e;if(!s(l)){const i=wi(e.borderRadius),s=ki(e.backdropPadding);t.fillStyle=l;const h=n-s.left,c=o-s.top,d=a-n+s.width,u=r-o+s.height;Object.values(i).some((t=>0!==t))?(t.beginPath(),He(t,{x:h,y:c,w:d,h:u,radius:i}),t.fill()):t.fillRect(h,c,d,u)}}function Lo(t,e,i,s){const{ctx:n}=t;if(i)n.arc(t.xCenter,t.yCenter,e,0,O);else{let i=t.getPointPosition(0,e);n.moveTo(i.x,i.y);for(let o=1;o<s;o++)i=t.getPointPosition(o,e),n.lineTo(i.x,i.y)}}class Eo extends bo{static id="radialLinear";static defaults={display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:ae.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5,centerPointLabels:!1}};static defaultRoutes={"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"};static descriptors={angleLines:{_fallback:"grid"}};constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=ki(So(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(this.top+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=a(t)&&!isNaN(t)?t:0,this.max=a(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/So(this.options))}generateTickLabels(t){bo.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map(((t,e)=>{const i=d(this.options.pointLabels.callback,[t,e],this);return i||0===i?i:""})).filter(((t,e)=>this.chart.getDataVisibility(e)))}fit(){const t=this.options;t.display&&t.pointLabels.display?Do(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,s){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-s)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,s))}getIndexAngle(t){return G(t*(O/(this._pointLabels.length||1))+$(this.options.startAngle||0))}getDistanceFromCenterForValue(t){if(s(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(s(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return function(t,e,i){return Ci(t,{label:i,index:e,type:"pointLabel"})}(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const s=this.getIndexAngle(t)-E+i;return{x:Math.cos(s)*e+this.xCenter,y:Math.sin(s)*e+this.yCenter,angle:s}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:s,bottom:n}=this._pointLabelItems[t];return{left:e,top:i,right:s,bottom:n}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),Lo(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:s,border:n}=e,o=this._pointLabels.length;let a,r,l;if(e.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:s}}=t;for(let n=e-1;n>=0;n--){const e=t._pointLabelItems[n];if(!e.visible)continue;const o=s.setContext(t.getPointLabelContext(n));To(i,o,e);const a=Si(o.font),{x:r,y:l,textAlign:h}=e;Ne(i,t._pointLabels[n],r,l+a.lineHeight/2,a,{color:o.color,textAlign:h,textBaseline:"middle"})}}(this,o),s.display&&this.ticks.forEach(((t,e)=>{if(0!==e||0===e&&this.min<0){r=this.getDistanceFromCenterForValue(t.value);const i=this.getContext(e),a=s.setContext(i),l=n.setContext(i);!function(t,e,i,s,n){const o=t.ctx,a=e.circular,{color:r,lineWidth:l}=e;!a&&!s||!r||!l||i<0||(o.save(),o.strokeStyle=r,o.lineWidth=l,o.setLineDash(n.dash),o.lineDashOffset=n.dashOffset,o.beginPath(),Lo(t,i,a,s),o.closePath(),o.stroke(),o.restore())}(this,a,r,o,l)}})),i.display){for(t.save(),a=o-1;a>=0;a--){const s=i.setContext(this.getPointLabelContext(a)),{color:n,lineWidth:o}=s;o&&n&&(t.lineWidth=o,t.strokeStyle=n,t.setLineDash(s.borderDash),t.lineDashOffset=s.borderDashOffset,r=this.getDistanceFromCenterForValue(e.ticks.reverse?this.min:this.max),l=this.getPointPosition(a,r),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(l.x,l.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const s=this.getIndexAngle(0);let n,o;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(s),t.textAlign="center",t.textBaseline="middle",this.ticks.forEach(((s,a)=>{if(0===a&&this.min>=0&&!e.reverse)return;const r=i.setContext(this.getContext(a)),l=Si(r.font);if(n=this.getDistanceFromCenterForValue(this.ticks[a].value),r.showLabelBackdrop){t.font=l.string,o=t.measureText(s.label).width,t.fillStyle=r.backdropColor;const e=ki(r.backdropPadding);t.fillRect(-o/2-e.left,-n-l.size/2-e.top,o+e.width,l.size+e.height)}Ne(t,s.label,0,-n,l,{color:r.color,strokeColor:r.textStrokeColor,strokeWidth:r.textStrokeWidth})})),t.restore()}drawTitle(){}}const Ro={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Io=Object.keys(Ro);function zo(t,e){return t-e}function Fo(t,e){if(s(e))return null;const i=t._adapter,{parser:n,round:o,isoWeekday:r}=t._parseOpts;let l=e;return"function"==typeof n&&(l=n(l)),a(l)||(l="string"==typeof n?i.parse(l,n):i.parse(l)),null===l?null:(o&&(l="week"!==o||!N(r)&&!0!==r?i.startOf(l,o):i.startOf(l,"isoWeek",r)),+l)}function Vo(t,e,i,s){const n=Io.length;for(let o=Io.indexOf(t);o<n-1;++o){const t=Ro[Io[o]],n=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(n*t.size))<=s)return Io[o]}return Io[n-1]}function Bo(t,e,i){if(i){if(i.length){const{lo:s,hi:n}=et(i,e);t[i[s]>=e?i[s]:i[n]]=!0}}else t[e]=!0}function Wo(t,e,i){const s=[],n={},o=e.length;let a,r;for(a=0;a<o;++a)r=e[a],n[r]=a,s.push({value:r,major:!1});return 0!==o&&i?function(t,e,i,s){const n=t._adapter,o=+n.startOf(e[0].value,s),a=e[e.length-1].value;let r,l;for(r=o;r<=a;r=+n.add(r,1,s))l=i[r],l>=0&&(e[l].major=!0);return e}(t,s,n,i):s}class No extends Js{static id="time";static defaults={bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",callback:!1,major:{enabled:!1}}};constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),s=this._adapter=new Rn._date(t.adapters.date);s.init(e),x(i.displayFormats,s.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Fo(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||"day";let{min:s,max:n,minDefined:o,maxDefined:r}=this.getUserBounds();function l(t){o||isNaN(t.min)||(s=Math.min(s,t.min)),r||isNaN(t.max)||(n=Math.max(n,t.max))}o&&r||(l(this._getLabelBounds()),"ticks"===t.bounds&&"labels"===t.ticks.source||l(this.getMinMax(!1))),s=a(s)&&!isNaN(s)?s:+e.startOf(Date.now(),i),n=a(n)&&!isNaN(n)?n:+e.endOf(Date.now(),i)+1,this.min=Math.min(s,n-1),this.max=Math.max(s+1,n)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,s="labels"===i.source?this.getLabelTimestamps():this._generate();"ticks"===t.bounds&&s.length&&(this.min=this._userMin||s[0],this.max=this._userMax||s[s.length-1]);const n=this.min,o=nt(s,n,this.max);return this._unit=e.unit||(i.autoSkip?Vo(e.minUnit,this.min,this.max,this._getLabelCapacity(n)):function(t,e,i,s,n){for(let o=Io.length-1;o>=Io.indexOf(i);o--){const i=Io[o];if(Ro[i].common&&t._adapter.diff(n,s,i)>=e-1)return i}return Io[i?Io.indexOf(i):0]}(this,o.length,e.minUnit,this.min,this.max)),this._majorUnit=i.major.enabled&&"year"!==this._unit?function(t){for(let e=Io.indexOf(t)+1,i=Io.length;e<i;++e)if(Ro[Io[e]].common)return Io[e]}(this._unit):void 0,this.initOffsets(s),t.reverse&&o.reverse(),Wo(this,o,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map((t=>+t.value)))}initOffsets(t=[]){let e,i,s=0,n=0;this.options.offset&&t.length&&(e=this.getDecimalForValue(t[0]),s=1===t.length?1-e:(this.getDecimalForValue(t[1])-e)/2,i=this.getDecimalForValue(t[t.length-1]),n=1===t.length?i:(i-this.getDecimalForValue(t[t.length-2]))/2);const o=t.length<3?.5:.25;s=J(s,0,o),n=J(n,0,o),this._offsets={start:s,end:n,factor:1/(s+1+n)}}_generate(){const t=this._adapter,e=this.min,i=this.max,s=this.options,n=s.time,o=n.unit||Vo(n.minUnit,e,i,this._getLabelCapacity(e)),a=l(s.ticks.stepSize,1),r="week"===o&&n.isoWeekday,h=N(r)||!0===r,c={};let d,u,f=e;if(h&&(f=+t.startOf(f,"isoWeek",r)),f=+t.startOf(f,h?"day":o),t.diff(i,e,o)>1e5*a)throw new Error(e+" and "+i+" are too far apart with stepSize of "+a+" "+o);const g="data"===s.ticks.source&&this.getDataTimestamps();for(d=f,u=0;d<i;d=+t.add(d,a,o),u++)Bo(c,d,g);return d!==i&&"ticks"!==s.bounds&&1!==u||Bo(c,d,g),Object.keys(c).sort(zo).map((t=>+t))}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const i=this.options.time.displayFormats,s=this._unit,n=e||i[s];return this._adapter.format(t,n)}_tickFormatFunction(t,e,i,s){const n=this.options,o=n.ticks.callback;if(o)return d(o,[t,e,i],this);const a=n.time.displayFormats,r=this._unit,l=this._majorUnit,h=r&&a[r],c=l&&a[l],u=i[e],f=l&&c&&u&&u.major;return this._adapter.format(t,s||(f?c:h))}generateTickLabels(t){let e,i,s;for(e=0,i=t.length;e<i;++e)s=t[e],s.label=this._tickFormatFunction(s.value,e,t)}getDecimalForValue(t){return null===t?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,s=$(this.isHorizontal()?e.maxRotation:e.minRotation),n=Math.cos(s),o=Math.sin(s),a=this._resolveTickFontOptions(0).size;return{w:i*n+a*o,h:i*o+a*n}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,s=i[e.unit]||i.millisecond,n=this._tickFormatFunction(t,0,Wo(this,[t],this._majorUnit),s),o=this._getLabelSize(n),a=Math.floor(this.isHorizontal()?this.width/o.w:this.height/o.h)-1;return a>0?a:1}getDataTimestamps(){let t,e,i=this._cache.data||[];if(i.length)return i;const s=this.getMatchingVisibleMetas();if(this._normalized&&s.length)return this._cache.data=s[0].controller.getAllParsedValues(this);for(t=0,e=s.length;t<e;++t)i=i.concat(s[t].controller.getAllParsedValues(this));return this._cache.data=this.normalize(i)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const s=this.getLabels();for(e=0,i=s.length;e<i;++e)t.push(Fo(this,s[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return lt(t.sort(zo))}}function Ho(t,e,i){let s,n,o,a,r=0,l=t.length-1;i?(e>=t[r].pos&&e<=t[l].pos&&({lo:r,hi:l}=it(t,"pos",e)),({pos:s,time:o}=t[r]),({pos:n,time:a}=t[l])):(e>=t[r].time&&e<=t[l].time&&({lo:r,hi:l}=it(t,"time",e)),({time:s,pos:o}=t[r]),({time:n,pos:a}=t[l]));const h=n-s;return h?o+(a-o)*(e-s)/h:o}var jo=Object.freeze({__proto__:null,CategoryScale:class extends Js{static id="category";static defaults={ticks:{callback:po}};constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const t=this.getLabels();for(const{index:i,label:s}of e)t[i]===s&&t.splice(i,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(s(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:J(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:go(i,t,l(e,t),this._addedLabels),i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:s}=this.getMinMax(!0);"ticks"===this.options.bounds&&(t||(i=0),e||(s=this.getLabels().length-1)),this.min=i,this.max=s}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,s=[];let n=this.getLabels();n=0===t&&e===n.length-1?n:n.slice(t,e+1),this._valueRange=Math.max(n.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let i=t;i<=e;i++)s.push({value:i});return s}getLabelForValue(t){return po.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return"number"!=typeof t&&(t=this.parse(t)),null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}},LinearScale:xo,LogarithmicScale:ko,RadialLinearScale:Eo,TimeScale:No,TimeSeriesScale:class extends No{static id="timeseries";static defaults=No.defaults;constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=Ho(e,this.min),this._tableRange=Ho(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,s=[],n=[];let o,a,r,l,h;for(o=0,a=t.length;o<a;++o)l=t[o],l>=e&&l<=i&&s.push(l);if(s.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(o=0,a=s.length;o<a;++o)h=s[o+1],r=s[o-1],l=s[o],Math.round((h+r)/2)!==l&&n.push({time:l,pos:o/(a-1)});return n}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return i.includes(t)&&i.length||i.splice(0,0,t),i.includes(e)&&1!==i.length||i.push(e),i.sort(((t,e)=>t-e))}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return t=e.length&&i.length?this.normalize(e.concat(i)):e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(Ho(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return Ho(this._table,i*this._tableRange+this._minPos,!0)}}});const $o=["rgb(54, 162, 235)","rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(153, 102, 255)","rgb(201, 203, 207)"],Yo=$o.map((t=>t.replace("rgb(","rgba(").replace(")",", 0.5)")));function Uo(t){return $o[t%$o.length]}function Xo(t){return Yo[t%Yo.length]}function qo(t){let e=0;return(i,s)=>{const n=t.getDatasetMeta(s).controller;n instanceof jn?e=function(t,e){return t.backgroundColor=t.data.map((()=>Uo(e++))),e}(i,e):n instanceof $n?e=function(t,e){return t.backgroundColor=t.data.map((()=>Xo(e++))),e}(i,e):n&&(e=function(t,e){return t.borderColor=Uo(e),t.backgroundColor=Xo(e),++e}(i,e))}}function Ko(t){let e;for(e in t)if(t[e].borderColor||t[e].backgroundColor)return!0;return!1}var Go={id:"colors",defaults:{enabled:!0,forceOverride:!1},beforeLayout(t,e,i){if(!i.enabled)return;const{data:{datasets:s},options:n}=t.config,{elements:o}=n;if(!i.forceOverride&&(Ko(s)||(a=n)&&(a.borderColor||a.backgroundColor)||o&&Ko(o)))return;var a;const r=qo(t);s.forEach(r)}};function Zo(t){if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,"data",{configurable:!0,enumerable:!0,writable:!0,value:e})}}function Jo(t){t.data.datasets.forEach((t=>{Zo(t)}))}var Qo={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void Jo(t);const n=t.width;t.data.datasets.forEach(((e,o)=>{const{_data:a,indexAxis:r}=e,l=t.getDatasetMeta(o),h=a||e.data;if("y"===Pi([r,t.options.indexAxis]))return;if(!l.controller.supportsDecimation)return;const c=t.scales[l.xAxisID];if("linear"!==c.type&&"time"!==c.type)return;if(t.options.parsing)return;let{start:d,count:u}=function(t,e){const i=e.length;let s,n=0;const{iScale:o}=t,{min:a,max:r,minDefined:l,maxDefined:h}=o.getUserBounds();return l&&(n=J(it(e,o.axis,a).lo,0,i-1)),s=h?J(it(e,o.axis,r).hi+1,n,i)-n:i-n,{start:n,count:s}}(l,h);if(u<=(i.threshold||4*n))return void Zo(e);let f;switch(s(a)&&(e._data=h,delete e.data,Object.defineProperty(e,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case"lttb":f=function(t,e,i,s,n){const o=n.samples||s;if(o>=i)return t.slice(e,e+i);const a=[],r=(i-2)/(o-2);let l=0;const h=e+i-1;let c,d,u,f,g,p=e;for(a[l++]=t[p],c=0;c<o-2;c++){let s,n=0,o=0;const h=Math.floor((c+1)*r)+1+e,m=Math.min(Math.floor((c+2)*r)+1,i)+e,b=m-h;for(s=h;s<m;s++)n+=t[s].x,o+=t[s].y;n/=b,o/=b;const x=Math.floor(c*r)+1+e,_=Math.min(Math.floor((c+1)*r)+1,i)+e,{x:y,y:v}=t[p];for(u=f=-1,s=x;s<_;s++)f=.5*Math.abs((y-n)*(t[s].y-v)-(y-t[s].x)*(o-v)),f>u&&(u=f,d=t[s],g=s);a[l++]=d,p=g}return a[l++]=t[h],a}(h,d,u,n,i);break;case"min-max":f=function(t,e,i,n){let o,a,r,l,h,c,d,u,f,g,p=0,m=0;const b=[],x=e+i-1,_=t[e].x,y=t[x].x-_;for(o=e;o<e+i;++o){a=t[o],r=(a.x-_)/y*n,l=a.y;const e=0|r;if(e===h)l<f?(f=l,c=o):l>g&&(g=l,d=o),p=(m*p+a.x)/++m;else{const i=o-1;if(!s(c)&&!s(d)){const e=Math.min(c,d),s=Math.max(c,d);e!==u&&e!==i&&b.push({...t[e],x:p}),s!==u&&s!==i&&b.push({...t[s],x:p})}o>0&&i!==u&&b.push(t[i]),b.push(a),h=e,m=0,f=g=l,c=d=u=o}}return b}(h,d,u,n);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=f}))},destroy(t){Jo(t)}};function ta(t,e,i,s){if(s)return;let n=e[t],o=i[t];return"angle"===t&&(n=G(n),o=G(o)),{property:t,start:n,end:o}}function ea(t,e,i){for(;e>t;e--){const t=i[e];if(!isNaN(t.x)&&!isNaN(t.y))break}return e}function ia(t,e,i,s){return t&&e?s(t[i],e[i]):t?t[i]:e?e[i]:0}function sa(t,e){let i=[],s=!1;return n(t)?(s=!0,i=t):i=function(t,e){const{x:i=null,y:s=null}=t||{},n=e.points,o=[];return e.segments.forEach((({start:t,end:e})=>{e=ea(t,e,n);const a=n[t],r=n[e];null!==s?(o.push({x:a.x,y:s}),o.push({x:r.x,y:s})):null!==i&&(o.push({x:i,y:a.y}),o.push({x:i,y:r.y}))})),o}(t,e),i.length?new no({points:i,options:{tension:0},_loop:s,_fullLoop:s}):null}function na(t){return t&&!1!==t.fill}function oa(t,e,i){let s=t[e].fill;const n=[e];let o;if(!i)return s;for(;!1!==s&&-1===n.indexOf(s);){if(!a(s))return s;if(o=t[s],!o)return!1;if(o.visible)return s;n.push(s),s=o.fill}return!1}function aa(t,e,i){const s=function(t){const e=t.options,i=e.fill;let s=l(i&&i.target,i);void 0===s&&(s=!!e.backgroundColor);if(!1===s||null===s)return!1;if(!0===s)return"origin";return s}(t);if(o(s))return!isNaN(s.value)&&s;let n=parseFloat(s);return a(n)&&Math.floor(n)===n?function(t,e,i,s){"-"!==t&&"+"!==t||(i=e+i);if(i===e||i<0||i>=s)return!1;return i}(s[0],e,n,i):["origin","start","end","stack","shape"].indexOf(s)>=0&&s}function ra(t,e,i){const s=[];for(let n=0;n<i.length;n++){const o=i[n],{first:a,last:r,point:l}=la(o,e,"x");if(!(!l||a&&r))if(a)s.unshift(l);else if(t.push(l),!r)break}t.push(...s)}function la(t,e,i){const s=t.interpolate(e,i);if(!s)return{};const n=s[i],o=t.segments,a=t.points;let r=!1,l=!1;for(let t=0;t<o.length;t++){const e=o[t],s=a[e.start][i],h=a[e.end][i];if(tt(n,s,h)){r=n===s,l=n===h;break}}return{first:r,last:l,point:s}}class ha{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:s,y:n,radius:o}=this;return e=e||{start:0,end:O},t.arc(s,n,o,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:s}=this,n=t.angle;return{x:e+Math.cos(n)*s,y:i+Math.sin(n)*s,angle:n}}}function ca(t){const{chart:e,fill:i,line:s}=t;if(a(i))return function(t,e){const i=t.getDatasetMeta(e),s=i&&t.isDatasetVisible(e);return s?i.dataset:null}(e,i);if("stack"===i)return function(t){const{scale:e,index:i,line:s}=t,n=[],o=s.segments,a=s.points,r=function(t,e){const i=[],s=t.getMatchingVisibleMetas("line");for(let t=0;t<s.length;t++){const n=s[t];if(n.index===e)break;n.hidden||i.unshift(n.dataset)}return i}(e,i);r.push(sa({x:null,y:e.bottom},s));for(let t=0;t<o.length;t++){const e=o[t];for(let t=e.start;t<=e.end;t++)ra(n,a[t],r)}return new no({points:n,options:{}})}(t);if("shape"===i)return!0;const n=function(t){const e=t.scale||{};if(e.getPointPositionForValue)return function(t){const{scale:e,fill:i}=t,s=e.options,n=e.getLabels().length,a=s.reverse?e.max:e.min,r=function(t,e,i){let s;return s="start"===t?i:"end"===t?e.options.reverse?e.min:e.max:o(t)?t.value:e.getBaseValue(),s}(i,e,a),l=[];if(s.grid.circular){const t=e.getPointPositionForValue(0,a);return new ha({x:t.x,y:t.y,radius:e.getDistanceFromCenterForValue(r)})}for(let t=0;t<n;++t)l.push(e.getPointPositionForValue(t,r));return l}(t);return function(t){const{scale:e={},fill:i}=t,s=function(t,e){let i=null;return"start"===t?i=e.bottom:"end"===t?i=e.top:o(t)?i=e.getPixelForValue(t.value):e.getBasePixel&&(i=e.getBasePixel()),i}(i,e);if(a(s)){const t=e.isHorizontal();return{x:t?s:null,y:t?null:s}}return null}(t)}(t);return n instanceof ha?n:sa(n,s)}function da(t,e,i){const s=ca(e),{line:n,scale:o,axis:a}=e,r=n.options,l=r.fill,h=r.backgroundColor,{above:c=h,below:d=h}=l||{};s&&n.points.length&&(Ie(t,i),function(t,e){const{line:i,target:s,above:n,below:o,area:a,scale:r}=e,l=i._loop?"angle":e.axis;t.save(),"x"===l&&o!==n&&(ua(t,s,a.top),fa(t,{line:i,target:s,color:n,scale:r,property:l}),t.restore(),t.save(),ua(t,s,a.bottom));fa(t,{line:i,target:s,color:o,scale:r,property:l}),t.restore()}(t,{line:n,target:s,above:c,below:d,area:i,scale:o,axis:a}),ze(t))}function ua(t,e,i){const{segments:s,points:n}=e;let o=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=n[s],c=n[ea(s,l,n)];o?(t.moveTo(h.x,h.y),o=!1):(t.lineTo(h.x,i),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(c.x,i)}t.lineTo(e.first().x,i),t.closePath(),t.clip()}function fa(t,e){const{line:i,target:s,property:n,color:o,scale:a}=e,r=function(t,e,i){const s=t.segments,n=t.points,o=e.points,a=[];for(const t of s){let{start:s,end:r}=t;r=ea(s,r,n);const l=ta(i,n[s],n[r],t.loop);if(!e.segments){a.push({source:t,target:l,start:n[s],end:n[r]});continue}const h=Ii(e,l);for(const e of h){const s=ta(i,o[e.start],o[e.end],e.loop),r=Ri(t,n,s);for(const t of r)a.push({source:t,target:e,start:{[i]:ia(l,s,"start",Math.max)},end:{[i]:ia(l,s,"end",Math.min)}})}}return a}(i,s,n);for(const{source:e,target:l,start:h,end:c}of r){const{style:{backgroundColor:r=o}={}}=e,d=!0!==s;t.save(),t.fillStyle=r,ga(t,a,d&&ta(n,h,c)),t.beginPath();const u=!!i.pathSegment(t,e);let f;if(d){u?t.closePath():pa(t,s,c,n);const e=!!s.pathSegment(t,l,{move:u,reverse:!0});f=u&&e,f||pa(t,s,h,n)}t.closePath(),t.fill(f?"evenodd":"nonzero"),t.restore()}}function ga(t,e,i){const{top:s,bottom:n}=e.chart.chartArea,{property:o,start:a,end:r}=i||{};"x"===o&&(t.beginPath(),t.rect(a,s,r-a,n-s),t.clip())}function pa(t,e,i,s){const n=e.interpolate(i,s);n&&t.lineTo(n.x,n.y)}var ma={id:"filler",afterDatasetsUpdate(t,e,i){const s=(t.data.datasets||[]).length,n=[];let o,a,r,l;for(a=0;a<s;++a)o=t.getDatasetMeta(a),r=o.dataset,l=null,r&&r.options&&r instanceof no&&(l={visible:t.isDatasetVisible(a),index:a,fill:aa(r,a,s),chart:t,axis:o.controller.options.indexAxis,scale:o.vScale,line:r}),o.$filler=l,n.push(l);for(a=0;a<s;++a)l=n[a],l&&!1!==l.fill&&(l.fill=oa(n,a,i.propagate))},beforeDraw(t,e,i){const s="beforeDraw"===i.drawTime,n=t.getSortedVisibleDatasetMetas(),o=t.chartArea;for(let e=n.length-1;e>=0;--e){const i=n[e].$filler;i&&(i.line.updateControlPoints(o,i.axis),s&&i.fill&&da(t.ctx,i,o))}},beforeDatasetsDraw(t,e,i){if("beforeDatasetsDraw"!==i.drawTime)return;const s=t.getSortedVisibleDatasetMetas();for(let e=s.length-1;e>=0;--e){const i=s[e].$filler;na(i)&&da(t.ctx,i,t.chartArea)}},beforeDatasetDraw(t,e,i){const s=e.meta.$filler;na(s)&&"beforeDatasetDraw"===i.drawTime&&da(t.ctx,s,t.chartArea)},defaults:{propagate:!0,drawTime:"beforeDatasetDraw"}};const ba=(t,e)=>{let{boxHeight:i=e,boxWidth:s=e}=t;return t.usePointStyle&&(i=Math.min(i,e),s=t.pointStyleWidth||Math.min(s,e)),{boxWidth:s,boxHeight:i,itemHeight:Math.max(e,i)}};class xa extends Hs{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,this.top=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=d(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter((e=>t.filter(e,this.chart.data)))),t.sort&&(e=e.sort(((e,i)=>t.sort(e,i,this.chart.data)))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display)return void(this.width=this.height=0);const i=t.labels,s=Si(i.font),n=s.size,o=this._computeTitleHeight(),{boxWidth:a,itemHeight:r}=ba(i,n);let l,h;e.font=s.string,this.isHorizontal()?(l=this.maxWidth,h=this._fitRows(o,n,a,r)+10):(h=this.maxHeight,l=this._fitCols(o,s,a,r)+10),this.width=Math.min(l,t.maxWidth||this.maxWidth),this.height=Math.min(h,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,s){const{ctx:n,maxWidth:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.lineWidths=[0],h=s+a;let c=t;n.textAlign="left",n.textBaseline="middle";let d=-1,u=-h;return this.legendItems.forEach(((t,f)=>{const g=i+e/2+n.measureText(t.text).width;(0===f||l[l.length-1]+g+2*a>o)&&(c+=h,l[l.length-(f>0?0:1)]=0,u+=h,d++),r[f]={left:0,top:u,row:d,width:g,height:s},l[l.length-1]+=g+a})),c}_fitCols(t,e,i,s){const{ctx:n,maxHeight:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.columnSizes=[],h=o-t;let c=a,d=0,u=0,f=0,g=0;return this.legendItems.forEach(((t,o)=>{const{itemWidth:p,itemHeight:m}=function(t,e,i,s,n){const o=function(t,e,i,s){let n=t.text;n&&"string"!=typeof n&&(n=n.reduce(((t,e)=>t.length>e.length?t:e)));return e+i.size/2+s.measureText(n).width}(s,t,e,i),a=function(t,e,i){let s=t;"string"!=typeof e.text&&(s=_a(e,i));return s}(n,s,e.lineHeight);return{itemWidth:o,itemHeight:a}}(i,e,n,t,s);o>0&&u+m+2*a>h&&(c+=d+a,l.push({width:d,height:u}),f+=d+a,g++,d=u=0),r[o]={left:f,top:u,col:g,width:p,height:m},d=Math.max(d,p),u+=m+a})),c+=d,l.push({width:d,height:u}),c}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:s},rtl:n}}=this,o=Oi(n,this.left,this.width);if(this.isHorizontal()){let n=0,a=ft(i,this.left+s,this.right-this.lineWidths[n]);for(const r of e)n!==r.row&&(n=r.row,a=ft(i,this.left+s,this.right-this.lineWidths[n])),r.top+=this.top+t+s,r.left=o.leftForLtr(o.x(a),r.width),a+=r.width+s}else{let n=0,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height);for(const r of e)r.col!==n&&(n=r.col,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height)),r.top=a,r.left+=this.left+s,r.left=o.leftForLtr(o.x(r.left),r.width),a+=r.height+s}}isHorizontal(){return"top"===this.options.position||"bottom"===this.options.position}draw(){if(this.options.display){const t=this.ctx;Ie(t,this),this._draw(),ze(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:s}=this,{align:n,labels:o}=t,a=ue.color,r=Oi(t.rtl,this.left,this.width),h=Si(o.font),{padding:c}=o,d=h.size,u=d/2;let f;this.drawTitle(),s.textAlign=r.textAlign("left"),s.textBaseline="middle",s.lineWidth=.5,s.font=h.string;const{boxWidth:g,boxHeight:p,itemHeight:m}=ba(o,d),b=this.isHorizontal(),x=this._computeTitleHeight();f=b?{x:ft(n,this.left+c,this.right-i[0]),y:this.top+c+x,line:0}:{x:this.left+c,y:ft(n,this.top+x+c,this.bottom-e[0].height),line:0},Ai(this.ctx,t.textDirection);const _=m+c;this.legendItems.forEach(((y,v)=>{s.strokeStyle=y.fontColor,s.fillStyle=y.fontColor;const M=s.measureText(y.text).width,w=r.textAlign(y.textAlign||(y.textAlign=o.textAlign)),k=g+u+M;let S=f.x,P=f.y;r.setWidth(this.width),b?v>0&&S+k+c>this.right&&(P=f.y+=_,f.line++,S=f.x=ft(n,this.left+c,this.right-i[f.line])):v>0&&P+_>this.bottom&&(S=f.x=S+e[f.line].width+c,f.line++,P=f.y=ft(n,this.top+x+c,this.bottom-e[f.line].height));if(function(t,e,i){if(isNaN(g)||g<=0||isNaN(p)||p<0)return;s.save();const n=l(i.lineWidth,1);if(s.fillStyle=l(i.fillStyle,a),s.lineCap=l(i.lineCap,"butt"),s.lineDashOffset=l(i.lineDashOffset,0),s.lineJoin=l(i.lineJoin,"miter"),s.lineWidth=n,s.strokeStyle=l(i.strokeStyle,a),s.setLineDash(l(i.lineDash,[])),o.usePointStyle){const a={radius:p*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:n},l=r.xPlus(t,g/2);Ee(s,a,l,e+u,o.pointStyleWidth&&g)}else{const o=e+Math.max((d-p)/2,0),a=r.leftForLtr(t,g),l=wi(i.borderRadius);s.beginPath(),Object.values(l).some((t=>0!==t))?He(s,{x:a,y:o,w:g,h:p,radius:l}):s.rect(a,o,g,p),s.fill(),0!==n&&s.stroke()}s.restore()}(r.x(S),P,y),S=gt(w,S+g+u,b?S+k:this.right,t.rtl),function(t,e,i){Ne(s,i.text,t,e+m/2,h,{strikethrough:i.hidden,textAlign:r.textAlign(i.textAlign)})}(r.x(S),P,y),b)f.x+=k+c;else if("string"!=typeof y.text){const t=h.lineHeight;f.y+=_a(y,t)+c}else f.y+=_})),Ti(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=Si(e.font),s=ki(e.padding);if(!e.display)return;const n=Oi(t.rtl,this.left,this.width),o=this.ctx,a=e.position,r=i.size/2,l=s.top+r;let h,c=this.left,d=this.width;if(this.isHorizontal())d=Math.max(...this.lineWidths),h=this.top+l,c=ft(t.align,c,this.right-d);else{const e=this.columnSizes.reduce(((t,e)=>Math.max(t,e.height)),0);h=l+ft(t.align,this.top,this.bottom-e-t.labels.padding-this._computeTitleHeight())}const u=ft(a,c,c+d);o.textAlign=n.textAlign(ut(a)),o.textBaseline="middle",o.strokeStyle=e.color,o.fillStyle=e.color,o.font=i.string,Ne(o,e.text,u,h,i)}_computeTitleHeight(){const t=this.options.title,e=Si(t.font),i=ki(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,s,n;if(tt(t,this.left,this.right)&&tt(e,this.top,this.bottom))for(n=this.legendHitBoxes,i=0;i<n.length;++i)if(s=n[i],tt(t,s.left,s.left+s.width)&&tt(e,s.top,s.top+s.height))return this.legendItems[i];return null}handleEvent(t){const e=this.options;if(!function(t,e){if(("mousemove"===t||"mouseout"===t)&&(e.onHover||e.onLeave))return!0;if(e.onClick&&("click"===t||"mouseup"===t))return!0;return!1}(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if("mousemove"===t.type||"mouseout"===t.type){const o=this._hoveredItem,a=(n=i,null!==(s=o)&&null!==n&&s.datasetIndex===n.datasetIndex&&s.index===n.index);o&&!a&&d(e.onLeave,[t,o,this],this),this._hoveredItem=i,i&&!a&&d(e.onHover,[t,i,this],this)}else i&&d(e.onClick,[t,i,this],this);var s,n}}function _a(t,e){return e*(t.text?t.text.length:0)}var ya={id:"legend",_element:xa,start(t,e,i){const s=t.legend=new xa({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s)},stop(t){as.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const s=t.legend;as.configure(t,s,i),s.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const s=e.datasetIndex,n=i.chart;n.isDatasetVisible(s)?(n.hide(s),e.hidden=!0):(n.show(s),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:s,textAlign:n,color:o,useBorderRadius:a,borderRadius:r}}=t.legend.options;return t._getSortedDatasetMetas().map((t=>{const l=t.controller.getStyle(i?0:void 0),h=ki(l.borderWidth);return{text:e[t.index].label,fillStyle:l.backgroundColor,fontColor:o,hidden:!t.visible,lineCap:l.borderCapStyle,lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:(h.width+h.height)/4,strokeStyle:l.borderColor,pointStyle:s||l.pointStyle,rotation:l.rotation,textAlign:n||l.textAlign,borderRadius:a&&(r||l.borderRadius),datasetIndex:t.index}}),this)}},title:{color:t=>t.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:t=>!t.startsWith("on"),labels:{_scriptable:t=>!["generateLabels","filter","sort"].includes(t)}}};class va extends Hs{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,this.top=0,!i.display)return void(this.width=this.height=this.right=this.bottom=0);this.width=this.right=t,this.height=this.bottom=e;const s=n(i.text)?i.text.length:1;this._padding=ki(i.padding);const o=s*Si(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=o:this.width=o}isHorizontal(){const t=this.options.position;return"top"===t||"bottom"===t}_drawArgs(t){const{top:e,left:i,bottom:s,right:n,options:o}=this,a=o.align;let r,l,h,c=0;return this.isHorizontal()?(l=ft(a,i,n),h=e+t,r=n-i):("left"===o.position?(l=i+t,h=ft(a,s,e),c=-.5*C):(l=n-t,h=ft(a,e,s),c=.5*C),r=s-e),{titleX:l,titleY:h,maxWidth:r,rotation:c}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=Si(e.font),s=i.lineHeight/2+this._padding.top,{titleX:n,titleY:o,maxWidth:a,rotation:r}=this._drawArgs(s);Ne(t,e.text,0,0,i,{color:e.color,maxWidth:a,rotation:r,textAlign:ut(e.align),textBaseline:"middle",translation:[n,o]})}}var Ma={id:"title",_element:va,start(t,e,i){!function(t,e){const i=new va({ctx:t.ctx,options:e,chart:t});as.configure(t,i,e),as.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;as.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const s=t.titleBlock;as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const wa=new WeakMap;var ka={id:"subtitle",start(t,e,i){const s=new va({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s),wa.set(t,s)},stop(t){as.removeBox(t,wa.get(t)),wa.delete(t)},beforeUpdate(t,e,i){const s=wa.get(t);as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"normal"},fullSize:!0,padding:0,position:"top",text:"",weight:1500},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const Sa={average(t){if(!t.length)return!1;let e,i,s=new Set,n=0,o=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();s.add(t.x),n+=t.y,++o}}return{x:[...s].reduce(((t,e)=>t+e))/s.size,y:n/o}},nearest(t,e){if(!t.length)return!1;let i,s,n,o=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,s=t.length;i<s;++i){const s=t[i].element;if(s&&s.hasValue()){const t=q(e,s.getCenterPoint());t<r&&(r=t,n=s)}}if(n){const t=n.tooltipPosition();o=t.x,a=t.y}return{x:o,y:a}}};function Pa(t,e){return e&&(n(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function Da(t){return("string"==typeof t||t instanceof String)&&t.indexOf("\n")>-1?t.split("\n"):t}function Ca(t,e){const{element:i,datasetIndex:s,index:n}=e,o=t.getDatasetMeta(s).controller,{label:a,value:r}=o.getLabelAndValue(n);return{chart:t,label:a,parsed:o.getParsed(n),raw:t.data.datasets[s].data[n],formattedValue:r,dataset:o.getDataset(),dataIndex:n,datasetIndex:s,element:i}}function Oa(t,e){const i=t.chart.ctx,{body:s,footer:n,title:o}=t,{boxWidth:a,boxHeight:r}=e,l=Si(e.bodyFont),h=Si(e.titleFont),c=Si(e.footerFont),d=o.length,f=n.length,g=s.length,p=ki(e.padding);let m=p.height,b=0,x=s.reduce(((t,e)=>t+e.before.length+e.lines.length+e.after.length),0);if(x+=t.beforeBody.length+t.afterBody.length,d&&(m+=d*h.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),x){m+=g*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(x-g)*l.lineHeight+(x-1)*e.bodySpacing}f&&(m+=e.footerMarginTop+f*c.lineHeight+(f-1)*e.footerSpacing);let _=0;const y=function(t){b=Math.max(b,i.measureText(t).width+_)};return i.save(),i.font=h.string,u(t.title,y),i.font=l.string,u(t.beforeBody.concat(t.afterBody),y),_=e.displayColors?a+2+e.boxPadding:0,u(s,(t=>{u(t.before,y),u(t.lines,y),u(t.after,y)})),_=0,i.font=c.string,u(t.footer,y),i.restore(),b+=p.width,{width:b,height:m}}function Aa(t,e,i,s){const{x:n,width:o}=i,{width:a,chartArea:{left:r,right:l}}=t;let h="center";return"center"===s?h=n<=(r+l)/2?"left":"right":n<=o/2?h="left":n>=a-o/2&&(h="right"),function(t,e,i,s){const{x:n,width:o}=s,a=i.caretSize+i.caretPadding;return"left"===t&&n+o+a>e.width||"right"===t&&n-o-a<0||void 0}(h,t,e,i)&&(h="center"),h}function Ta(t,e,i){const s=i.yAlign||e.yAlign||function(t,e){const{y:i,height:s}=e;return i<s/2?"top":i>t.height-s/2?"bottom":"center"}(t,i);return{xAlign:i.xAlign||e.xAlign||Aa(t,e,i,s),yAlign:s}}function La(t,e,i,s){const{caretSize:n,caretPadding:o,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,h=n+o,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(a);let g=function(t,e){let{x:i,width:s}=t;return"right"===e?i-=s:"center"===e&&(i-=s/2),i}(e,r);const p=function(t,e,i){let{y:s,height:n}=t;return"top"===e?s+=i:s-="bottom"===e?n+i:n/2,s}(e,l,h);return"center"===l?"left"===r?g+=h:"right"===r&&(g-=h):"left"===r?g-=Math.max(c,u)+n:"right"===r&&(g+=Math.max(d,f)+n),{x:J(g,0,s.width-e.width),y:J(p,0,s.height-e.height)}}function Ea(t,e,i){const s=ki(i.padding);return"center"===e?t.x+t.width/2:"right"===e?t.x+t.width-s.right:t.x+s.left}function Ra(t){return Pa([],Da(t))}function Ia(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}const za={beforeTitle:e,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,s=i?i.length:0;if(this&&this.options&&"dataset"===this.options.mode)return e.dataset.label||"";if(e.label)return e.label;if(s>0&&e.dataIndex<s)return i[e.dataIndex]}return""},afterTitle:e,beforeBody:e,beforeLabel:e,label(t){if(this&&this.options&&"dataset"===this.options.mode)return t.label+": "+t.formattedValue||t.formattedValue;let e=t.dataset.label||"";e&&(e+=": ");const i=t.formattedValue;return s(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:e,afterBody:e,beforeFooter:e,footer:e,afterFooter:e};function Fa(t,e,i,s){const n=t[e].call(i,s);return void 0===n?za[e].call(i,s):n}class Va extends Hs{static positioners=Sa;constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),s=i.enabled&&e.options.animation&&i.animations,n=new Os(this.chart,s);return s._cacheable&&(this._cachedAnimations=Object.freeze(n)),n}getContext(){return this.$context||(this.$context=(t=this.chart.getContext(),e=this,i=this._tooltipItems,Ci(t,{tooltip:e,tooltipItems:i,type:"tooltip"})));var t,e,i}getTitle(t,e){const{callbacks:i}=e,s=Fa(i,"beforeTitle",this,t),n=Fa(i,"title",this,t),o=Fa(i,"afterTitle",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}getBeforeBody(t,e){return Ra(Fa(e.callbacks,"beforeBody",this,t))}getBody(t,e){const{callbacks:i}=e,s=[];return u(t,(t=>{const e={before:[],lines:[],after:[]},n=Ia(i,t);Pa(e.before,Da(Fa(n,"beforeLabel",this,t))),Pa(e.lines,Fa(n,"label",this,t)),Pa(e.after,Da(Fa(n,"afterLabel",this,t))),s.push(e)})),s}getAfterBody(t,e){return Ra(Fa(e.callbacks,"afterBody",this,t))}getFooter(t,e){const{callbacks:i}=e,s=Fa(i,"beforeFooter",this,t),n=Fa(i,"footer",this,t),o=Fa(i,"afterFooter",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}_createItems(t){const e=this._active,i=this.chart.data,s=[],n=[],o=[];let a,r,l=[];for(a=0,r=e.length;a<r;++a)l.push(Ca(this.chart,e[a]));return t.filter&&(l=l.filter(((e,s,n)=>t.filter(e,s,n,i)))),t.itemSort&&(l=l.sort(((e,s)=>t.itemSort(e,s,i)))),u(l,(e=>{const i=Ia(t.callbacks,e);s.push(Fa(i,"labelColor",this,e)),n.push(Fa(i,"labelPointStyle",this,e)),o.push(Fa(i,"labelTextColor",this,e))})),this.labelColors=s,this.labelPointStyles=n,this.labelTextColors=o,this.dataPoints=l,l}update(t,e){const i=this.options.setContext(this.getContext()),s=this._active;let n,o=[];if(s.length){const t=Sa[i.position].call(this,s,this._eventPosition);o=this._createItems(i),this.title=this.getTitle(o,i),this.beforeBody=this.getBeforeBody(o,i),this.body=this.getBody(o,i),this.afterBody=this.getAfterBody(o,i),this.footer=this.getFooter(o,i);const e=this._size=Oa(this,i),a=Object.assign({},t,e),r=Ta(this.chart,i,a),l=La(i,a,r,this.chart);this.xAlign=r.xAlign,this.yAlign=r.yAlign,n={opacity:1,x:l.x,y:l.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==this.opacity&&(n={opacity:0});this._tooltipItems=o,this.$context=void 0,n&&this._resolveAnimations().update(this,n),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,s){const n=this.getCaretPosition(t,i,s);e.lineTo(n.x1,n.y1),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3)}getCaretPosition(t,e,i){const{xAlign:s,yAlign:n}=this,{caretSize:o,cornerRadius:a}=i,{topLeft:r,topRight:l,bottomLeft:h,bottomRight:c}=wi(a),{x:d,y:u}=t,{width:f,height:g}=e;let p,m,b,x,_,y;return"center"===n?(_=u+g/2,"left"===s?(p=d,m=p-o,x=_+o,y=_-o):(p=d+f,m=p+o,x=_-o,y=_+o),b=p):(m="left"===s?d+Math.max(r,h)+o:"right"===s?d+f-Math.max(l,c)-o:this.caretX,"top"===n?(x=u,_=x-o,p=m-o,b=m+o):(x=u+g,_=x+o,p=m+o,b=m-o),y=x),{x1:p,x2:m,x3:b,y1:x,y2:_,y3:y}}drawTitle(t,e,i){const s=this.title,n=s.length;let o,a,r;if(n){const l=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.titleAlign,i),e.textAlign=l.textAlign(i.titleAlign),e.textBaseline="middle",o=Si(i.titleFont),a=i.titleSpacing,e.fillStyle=i.titleColor,e.font=o.string,r=0;r<n;++r)e.fillText(s[r],l.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+a,r+1===n&&(t.y+=i.titleMarginBottom-a)}}_drawColorBox(t,e,i,s,n){const a=this.labelColors[i],r=this.labelPointStyles[i],{boxHeight:l,boxWidth:h}=n,c=Si(n.bodyFont),d=Ea(this,"left",n),u=s.x(d),f=l<c.lineHeight?(c.lineHeight-l)/2:0,g=e.y+f;if(n.usePointStyle){const e={radius:Math.min(h,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},i=s.leftForLtr(u,h)+h/2,o=g+l/2;t.strokeStyle=n.multiKeyBackground,t.fillStyle=n.multiKeyBackground,Le(t,e,i,o),t.strokeStyle=a.borderColor,t.fillStyle=a.backgroundColor,Le(t,e,i,o)}else{t.lineWidth=o(a.borderWidth)?Math.max(...Object.values(a.borderWidth)):a.borderWidth||1,t.strokeStyle=a.borderColor,t.setLineDash(a.borderDash||[]),t.lineDashOffset=a.borderDashOffset||0;const e=s.leftForLtr(u,h),i=s.leftForLtr(s.xPlus(u,1),h-2),r=wi(a.borderRadius);Object.values(r).some((t=>0!==t))?(t.beginPath(),t.fillStyle=n.multiKeyBackground,He(t,{x:e,y:g,w:h,h:l,radius:r}),t.fill(),t.stroke(),t.fillStyle=a.backgroundColor,t.beginPath(),He(t,{x:i,y:g+1,w:h-2,h:l-2,radius:r}),t.fill()):(t.fillStyle=n.multiKeyBackground,t.fillRect(e,g,h,l),t.strokeRect(e,g,h,l),t.fillStyle=a.backgroundColor,t.fillRect(i,g+1,h-2,l-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:s}=this,{bodySpacing:n,bodyAlign:o,displayColors:a,boxHeight:r,boxWidth:l,boxPadding:h}=i,c=Si(i.bodyFont);let d=c.lineHeight,f=0;const g=Oi(i.rtl,this.x,this.width),p=function(i){e.fillText(i,g.x(t.x+f),t.y+d/2),t.y+=d+n},m=g.textAlign(o);let b,x,_,y,v,M,w;for(e.textAlign=o,e.textBaseline="middle",e.font=c.string,t.x=Ea(this,m,i),e.fillStyle=i.bodyColor,u(this.beforeBody,p),f=a&&"right"!==m?"center"===o?l/2+h:l+2+h:0,y=0,M=s.length;y<M;++y){for(b=s[y],x=this.labelTextColors[y],e.fillStyle=x,u(b.before,p),_=b.lines,a&&_.length&&(this._drawColorBox(e,t,y,g,i),d=Math.max(c.lineHeight,r)),v=0,w=_.length;v<w;++v)p(_[v]),d=c.lineHeight;u(b.after,p)}f=0,d=c.lineHeight,u(this.afterBody,p),t.y-=n}drawFooter(t,e,i){const s=this.footer,n=s.length;let o,a;if(n){const r=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=r.textAlign(i.footerAlign),e.textBaseline="middle",o=Si(i.footerFont),e.fillStyle=i.footerColor,e.font=o.string,a=0;a<n;++a)e.fillText(s[a],r.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+i.footerSpacing}}drawBackground(t,e,i,s){const{xAlign:n,yAlign:o}=this,{x:a,y:r}=t,{width:l,height:h}=i,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(s.cornerRadius);e.fillStyle=s.backgroundColor,e.strokeStyle=s.borderColor,e.lineWidth=s.borderWidth,e.beginPath(),e.moveTo(a+c,r),"top"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+l-d,r),e.quadraticCurveTo(a+l,r,a+l,r+d),"center"===o&&"right"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+l,r+h-f),e.quadraticCurveTo(a+l,r+h,a+l-f,r+h),"bottom"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+u,r+h),e.quadraticCurveTo(a,r+h,a,r+h-u),"center"===o&&"left"===n&&this.drawCaret(t,e,i,s),e.lineTo(a,r+c),e.quadraticCurveTo(a,r,a+c,r),e.closePath(),e.fill(),s.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,s=i&&i.x,n=i&&i.y;if(s||n){const i=Sa[t.position].call(this,this._active,this._eventPosition);if(!i)return;const o=this._size=Oa(this,t),a=Object.assign({},i,this._size),r=Ta(e,t,a),l=La(t,a,r,e);s._to===l.x&&n._to===l.y||(this.xAlign=r.xAlign,this.yAlign=r.yAlign,this.width=o.width,this.height=o.height,this.caretX=i.x,this.caretY=i.y,this._resolveAnimations().update(this,l))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const s={width:this.width,height:this.height},n={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const o=ki(e.padding),a=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&a&&(t.save(),t.globalAlpha=i,this.drawBackground(n,t,s,e),Ai(t,e.textDirection),n.y+=o.top,this.drawTitle(n,t,e),this.drawBody(n,t,e),this.drawFooter(n,t,e),Ti(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,s=t.map((({datasetIndex:t,index:e})=>{const i=this.chart.getDatasetMeta(t);if(!i)throw new Error("Cannot find a dataset at index "+t);return{datasetIndex:t,element:i.data[e],index:e}})),n=!f(i,s),o=this._positionChanged(s,e);(n||o)&&(this._active=s,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const s=this.options,n=this._active||[],o=this._getActiveElements(t,n,e,i),a=this._positionChanged(o,t),r=e||!f(o,n)||a;return r&&(this._active=o,(s.enabled||s.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),r}_getActiveElements(t,e,i,s){const n=this.options;if("mouseout"===t.type)return[];if(!s)return e.filter((t=>this.chart.data.datasets[t.datasetIndex]&&void 0!==this.chart.getDatasetMeta(t.datasetIndex).controller.getParsed(t.index)));const o=this.chart.getElementsAtEventForMode(t,n.mode,n,i);return n.reverse&&o.reverse(),o}_positionChanged(t,e){const{caretX:i,caretY:s,options:n}=this,o=Sa[n.position].call(this,t,e);return!1!==o&&(i!==o.x||s!==o.y)}}var Ba={id:"tooltip",_element:Va,positioners:Sa,afterInit(t,e,i){i&&(t.tooltip=new Va({chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip;if(e&&e._willRender()){const i={tooltip:e};if(!1===t.notifyPlugins("beforeTooltipDraw",{...i,cancelable:!0}))return;e.draw(t.ctx),t.notifyPlugins("afterTooltipDraw",i)}},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i,e.inChartArea)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{weight:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{weight:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,boxPadding:0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:za},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:t=>"filter"!==t&&"itemSort"!==t&&"external"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]};return An.register(Yn,jo,fo,t),An.helpers={...Wi},An._adapters=Rn,An.Animation=Cs,An.Animations=Os,An.animator=xt,An.controllers=en.controllers.items,An.DatasetController=Ns,An.Element=Hs,An.elements=fo,An.Interaction=Xi,An.layouts=as,An.platforms=Ss,An.Scale=Js,An.Ticks=ae,Object.assign(An,Yn,jo,fo,t,Ss),An.Chart=An,"undefined"!=typeof window&&(window.Chart=An),An}));
//# sourceMappingURL=chart.umd.js.map
/* flatpickr v4.6.13,, @license MIT */
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(e="undefined"!=typeof globalThis?globalThis:e||self).flatpickr=n()}(this,(function(){"use strict";var e=function(){return(e=Object.assign||function(e){for(var n,t=1,a=arguments.length;t<a;t++)for(var i in n=arguments[t])Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i]);return e}).apply(this,arguments)};function n(){for(var e=0,n=0,t=arguments.length;n<t;n++)e+=arguments[n].length;var a=Array(e),i=0;for(n=0;n<t;n++)for(var o=arguments[n],r=0,l=o.length;r<l;r++,i++)a[i]=o[r];return a}var t=["onChange","onClose","onDayCreate","onDestroy","onKeyDown","onMonthChange","onOpen","onParseConfig","onReady","onValueUpdate","onYearChange","onPreCalendarPosition"],a={_disable:[],allowInput:!1,allowInvalidPreload:!1,altFormat:"F j, Y",altInput:!1,altInputClass:"form-control input",animate:"object"==typeof window&&-1===window.navigator.userAgent.indexOf("MSIE"),ariaDateFormat:"F j, Y",autoFillDefaultTime:!0,clickOpens:!0,closeOnSelect:!0,conjunction:", ",dateFormat:"Y-m-d",defaultHour:12,defaultMinute:0,defaultSeconds:0,disable:[],disableMobile:!1,enableSeconds:!1,enableTime:!1,errorHandler:function(e){return"undefined"!=typeof console&&console.warn(e)},getWeek:function(e){var n=new Date(e.getTime());n.setHours(0,0,0,0),n.setDate(n.getDate()+3-(n.getDay()+6)%7);var t=new Date(n.getFullYear(),0,4);return 1+Math.round(((n.getTime()-t.getTime())/864e5-3+(t.getDay()+6)%7)/7)},hourIncrement:1,ignoredFocusElements:[],inline:!1,locale:"default",minuteIncrement:5,mode:"single",monthSelectorType:"dropdown",nextArrow:"<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",noCalendar:!1,now:new Date,onChange:[],onClose:[],onDayCreate:[],onDestroy:[],onKeyDown:[],onMonthChange:[],onOpen:[],onParseConfig:[],onReady:[],onValueUpdate:[],onYearChange:[],onPreCalendarPosition:[],plugins:[],position:"auto",positionElement:void 0,prevArrow:"<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",shorthandCurrentMonth:!1,showMonths:1,static:!1,time_24hr:!1,weekNumbers:!1,wrap:!1},i={weekdays:{shorthand:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longhand:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},months:{shorthand:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longhand:["January","February","March","April","May","June","July","August","September","October","November","December"]},daysInMonth:[31,28,31,30,31,30,31,31,30,31,30,31],firstDayOfWeek:0,ordinal:function(e){var n=e%100;if(n>3&&n<21)return"th";switch(n%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}},rangeSeparator:" to ",weekAbbreviation:"Wk",scrollTitle:"Scroll to increment",toggleTitle:"Click to toggle",amPM:["AM","PM"],yearAriaLabel:"Year",monthAriaLabel:"Month",hourAriaLabel:"Hour",minuteAriaLabel:"Minute",time_24hr:!1},o=function(e,n){return void 0===n&&(n=2),("000"+e).slice(-1*n)},r=function(e){return!0===e?1:0};function l(e,n){var t;return function(){var a=this,i=arguments;clearTimeout(t),t=setTimeout((function(){return e.apply(a,i)}),n)}}var c=function(e){return e instanceof Array?e:[e]};function s(e,n,t){if(!0===t)return e.classList.add(n);e.classList.remove(n)}function d(e,n,t){var a=window.document.createElement(e);return n=n||"",t=t||"",a.className=n,void 0!==t&&(a.textContent=t),a}function u(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function f(e,n){return n(e)?e:e.parentNode?f(e.parentNode,n):void 0}function m(e,n){var t=d("div","numInputWrapper"),a=d("input","numInput "+e),i=d("span","arrowUp"),o=d("span","arrowDown");if(-1===navigator.userAgent.indexOf("MSIE 9.0")?a.type="number":(a.type="text",a.pattern="\\d*"),void 0!==n)for(var r in n)a.setAttribute(r,n[r]);return t.appendChild(a),t.appendChild(i),t.appendChild(o),t}function g(e){try{return"function"==typeof e.composedPath?e.composedPath()[0]:e.target}catch(n){return e.target}}var p=function(){},h=function(e,n,t){return t.months[n?"shorthand":"longhand"][e]},v={D:p,F:function(e,n,t){e.setMonth(t.months.longhand.indexOf(n))},G:function(e,n){e.setHours((e.getHours()>=12?12:0)+parseFloat(n))},H:function(e,n){e.setHours(parseFloat(n))},J:function(e,n){e.setDate(parseFloat(n))},K:function(e,n,t){e.setHours(e.getHours()%12+12*r(new RegExp(t.amPM[1],"i").test(n)))},M:function(e,n,t){e.setMonth(t.months.shorthand.indexOf(n))},S:function(e,n){e.setSeconds(parseFloat(n))},U:function(e,n){return new Date(1e3*parseFloat(n))},W:function(e,n,t){var a=parseInt(n),i=new Date(e.getFullYear(),0,2+7*(a-1),0,0,0,0);return i.setDate(i.getDate()-i.getDay()+t.firstDayOfWeek),i},Y:function(e,n){e.setFullYear(parseFloat(n))},Z:function(e,n){return new Date(n)},d:function(e,n){e.setDate(parseFloat(n))},h:function(e,n){e.setHours((e.getHours()>=12?12:0)+parseFloat(n))},i:function(e,n){e.setMinutes(parseFloat(n))},j:function(e,n){e.setDate(parseFloat(n))},l:p,m:function(e,n){e.setMonth(parseFloat(n)-1)},n:function(e,n){e.setMonth(parseFloat(n)-1)},s:function(e,n){e.setSeconds(parseFloat(n))},u:function(e,n){return new Date(parseFloat(n))},w:p,y:function(e,n){e.setFullYear(2e3+parseFloat(n))}},D={D:"",F:"",G:"(\\d\\d|\\d)",H:"(\\d\\d|\\d)",J:"(\\d\\d|\\d)\\w+",K:"",M:"",S:"(\\d\\d|\\d)",U:"(.+)",W:"(\\d\\d|\\d)",Y:"(\\d{4})",Z:"(.+)",d:"(\\d\\d|\\d)",h:"(\\d\\d|\\d)",i:"(\\d\\d|\\d)",j:"(\\d\\d|\\d)",l:"",m:"(\\d\\d|\\d)",n:"(\\d\\d|\\d)",s:"(\\d\\d|\\d)",u:"(.+)",w:"(\\d\\d|\\d)",y:"(\\d{2})"},w={Z:function(e){return e.toISOString()},D:function(e,n,t){return n.weekdays.shorthand[w.w(e,n,t)]},F:function(e,n,t){return h(w.n(e,n,t)-1,!1,n)},G:function(e,n,t){return o(w.h(e,n,t))},H:function(e){return o(e.getHours())},J:function(e,n){return void 0!==n.ordinal?e.getDate()+n.ordinal(e.getDate()):e.getDate()},K:function(e,n){return n.amPM[r(e.getHours()>11)]},M:function(e,n){return h(e.getMonth(),!0,n)},S:function(e){return o(e.getSeconds())},U:function(e){return e.getTime()/1e3},W:function(e,n,t){return t.getWeek(e)},Y:function(e){return o(e.getFullYear(),4)},d:function(e){return o(e.getDate())},h:function(e){return e.getHours()%12?e.getHours()%12:12},i:function(e){return o(e.getMinutes())},j:function(e){return e.getDate()},l:function(e,n){return n.weekdays.longhand[e.getDay()]},m:function(e){return o(e.getMonth()+1)},n:function(e){return e.getMonth()+1},s:function(e){return e.getSeconds()},u:function(e){return e.getTime()},w:function(e){return e.getDay()},y:function(e){return String(e.getFullYear()).substring(2)}},b=function(e){var n=e.config,t=void 0===n?a:n,o=e.l10n,r=void 0===o?i:o,l=e.isMobile,c=void 0!==l&&l;return function(e,n,a){var i=a||r;return void 0===t.formatDate||c?n.split("").map((function(n,a,o){return w[n]&&"\\"!==o[a-1]?w[n](e,i,t):"\\"!==n?n:""})).join(""):t.formatDate(e,n,i)}},C=function(e){var n=e.config,t=void 0===n?a:n,o=e.l10n,r=void 0===o?i:o;return function(e,n,i,o){if(0===e||e){var l,c=o||r,s=e;if(e instanceof Date)l=new Date(e.getTime());else if("string"!=typeof e&&void 0!==e.toFixed)l=new Date(e);else if("string"==typeof e){var d=n||(t||a).dateFormat,u=String(e).trim();if("today"===u)l=new Date,i=!0;else if(t&&t.parseDate)l=t.parseDate(e,d);else if(/Z$/.test(u)||/GMT$/.test(u))l=new Date(e);else{for(var f=void 0,m=[],g=0,p=0,h="";g<d.length;g++){var w=d[g],b="\\"===w,C="\\"===d[g-1]||b;if(D[w]&&!C){h+=D[w];var M=new RegExp(h).exec(e);M&&(f=!0)&&m["Y"!==w?"push":"unshift"]({fn:v[w],val:M[++p]})}else b||(h+=".")}l=t&&t.noCalendar?new Date((new Date).setHours(0,0,0,0)):new Date((new Date).getFullYear(),0,1,0,0,0,0),m.forEach((function(e){var n=e.fn,t=e.val;return l=n(l,t,c)||l})),l=f?l:void 0}}if(l instanceof Date&&!isNaN(l.getTime()))return!0===i&&l.setHours(0,0,0,0),l;t.errorHandler(new Error("Invalid date provided: "+s))}}};function M(e,n,t){return void 0===t&&(t=!0),!1!==t?new Date(e.getTime()).setHours(0,0,0,0)-new Date(n.getTime()).setHours(0,0,0,0):e.getTime()-n.getTime()}var y=function(e,n,t){return 3600*e+60*n+t},x=864e5;function E(e){var n=e.defaultHour,t=e.defaultMinute,a=e.defaultSeconds;if(void 0!==e.minDate){var i=e.minDate.getHours(),o=e.minDate.getMinutes(),r=e.minDate.getSeconds();n<i&&(n=i),n===i&&t<o&&(t=o),n===i&&t===o&&a<r&&(a=e.minDate.getSeconds())}if(void 0!==e.maxDate){var l=e.maxDate.getHours(),c=e.maxDate.getMinutes();(n=Math.min(n,l))===l&&(t=Math.min(c,t)),n===l&&t===c&&(a=e.maxDate.getSeconds())}return{hours:n,minutes:t,seconds:a}}"function"!=typeof Object.assign&&(Object.assign=function(e){for(var n=[],t=1;t<arguments.length;t++)n[t-1]=arguments[t];if(!e)throw TypeError("Cannot convert undefined or null to object");for(var a=function(n){n&&Object.keys(n).forEach((function(t){return e[t]=n[t]}))},i=0,o=n;i<o.length;i++){var r=o[i];a(r)}return e});function k(p,v){var w={config:e(e({},a),I.defaultConfig),l10n:i};function k(){var e;return(null===(e=w.calendarContainer)||void 0===e?void 0:e.getRootNode()).activeElement||document.activeElement}function T(e){return e.bind(w)}function S(){var e=w.config;!1===e.weekNumbers&&1===e.showMonths||!0!==e.noCalendar&&window.requestAnimationFrame((function(){if(void 0!==w.calendarContainer&&(w.calendarContainer.style.visibility="hidden",w.calendarContainer.style.display="block"),void 0!==w.daysContainer){var n=(w.days.offsetWidth+1)*e.showMonths;w.daysContainer.style.width=n+"px",w.calendarContainer.style.width=n+(void 0!==w.weekWrapper?w.weekWrapper.offsetWidth:0)+"px",w.calendarContainer.style.removeProperty("visibility"),w.calendarContainer.style.removeProperty("display")}}))}function _(e){if(0===w.selectedDates.length){var n=void 0===w.config.minDate||M(new Date,w.config.minDate)>=0?new Date:new Date(w.config.minDate.getTime()),t=E(w.config);n.setHours(t.hours,t.minutes,t.seconds,n.getMilliseconds()),w.selectedDates=[n],w.latestSelectedDateObj=n}void 0!==e&&"blur"!==e.type&&function(e){e.preventDefault();var n="keydown"===e.type,t=g(e),a=t;void 0!==w.amPM&&t===w.amPM&&(w.amPM.textContent=w.l10n.amPM[r(w.amPM.textContent===w.l10n.amPM[0])]);var i=parseFloat(a.getAttribute("min")),l=parseFloat(a.getAttribute("max")),c=parseFloat(a.getAttribute("step")),s=parseInt(a.value,10),d=e.delta||(n?38===e.which?1:-1:0),u=s+c*d;if(void 0!==a.value&&2===a.value.length){var f=a===w.hourElement,m=a===w.minuteElement;u<i?(u=l+u+r(!f)+(r(f)&&r(!w.amPM)),m&&L(void 0,-1,w.hourElement)):u>l&&(u=a===w.hourElement?u-l-r(!w.amPM):i,m&&L(void 0,1,w.hourElement)),w.amPM&&f&&(1===c?u+s===23:Math.abs(u-s)>c)&&(w.amPM.textContent=w.l10n.amPM[r(w.amPM.textContent===w.l10n.amPM[0])]),a.value=o(u)}}(e);var a=w._input.value;O(),ye(),w._input.value!==a&&w._debouncedChange()}function O(){if(void 0!==w.hourElement&&void 0!==w.minuteElement){var e,n,t=(parseInt(w.hourElement.value.slice(-2),10)||0)%24,a=(parseInt(w.minuteElement.value,10)||0)%60,i=void 0!==w.secondElement?(parseInt(w.secondElement.value,10)||0)%60:0;void 0!==w.amPM&&(e=t,n=w.amPM.textContent,t=e%12+12*r(n===w.l10n.amPM[1]));var o=void 0!==w.config.minTime||w.config.minDate&&w.minDateHasTime&&w.latestSelectedDateObj&&0===M(w.latestSelectedDateObj,w.config.minDate,!0),l=void 0!==w.config.maxTime||w.config.maxDate&&w.maxDateHasTime&&w.latestSelectedDateObj&&0===M(w.latestSelectedDateObj,w.config.maxDate,!0);if(void 0!==w.config.maxTime&&void 0!==w.config.minTime&&w.config.minTime>w.config.maxTime){var c=y(w.config.minTime.getHours(),w.config.minTime.getMinutes(),w.config.minTime.getSeconds()),s=y(w.config.maxTime.getHours(),w.config.maxTime.getMinutes(),w.config.maxTime.getSeconds()),d=y(t,a,i);if(d>s&&d<c){var u=function(e){var n=Math.floor(e/3600),t=(e-3600*n)/60;return[n,t,e-3600*n-60*t]}(c);t=u[0],a=u[1],i=u[2]}}else{if(l){var f=void 0!==w.config.maxTime?w.config.maxTime:w.config.maxDate;(t=Math.min(t,f.getHours()))===f.getHours()&&(a=Math.min(a,f.getMinutes())),a===f.getMinutes()&&(i=Math.min(i,f.getSeconds()))}if(o){var m=void 0!==w.config.minTime?w.config.minTime:w.config.minDate;(t=Math.max(t,m.getHours()))===m.getHours()&&a<m.getMinutes()&&(a=m.getMinutes()),a===m.getMinutes()&&(i=Math.max(i,m.getSeconds()))}}A(t,a,i)}}function F(e){var n=e||w.latestSelectedDateObj;n&&n instanceof Date&&A(n.getHours(),n.getMinutes(),n.getSeconds())}function A(e,n,t){void 0!==w.latestSelectedDateObj&&w.latestSelectedDateObj.setHours(e%24,n,t||0,0),w.hourElement&&w.minuteElement&&!w.isMobile&&(w.hourElement.value=o(w.config.time_24hr?e:(12+e)%12+12*r(e%12==0)),w.minuteElement.value=o(n),void 0!==w.amPM&&(w.amPM.textContent=w.l10n.amPM[r(e>=12)]),void 0!==w.secondElement&&(w.secondElement.value=o(t)))}function N(e){var n=g(e),t=parseInt(n.value)+(e.delta||0);(t/1e3>1||"Enter"===e.key&&!/[^\d]/.test(t.toString()))&&ee(t)}function P(e,n,t,a){return n instanceof Array?n.forEach((function(n){return P(e,n,t,a)})):e instanceof Array?e.forEach((function(e){return P(e,n,t,a)})):(e.addEventListener(n,t,a),void w._handlers.push({remove:function(){return e.removeEventListener(n,t,a)}}))}function Y(){De("onChange")}function j(e,n){var t=void 0!==e?w.parseDate(e):w.latestSelectedDateObj||(w.config.minDate&&w.config.minDate>w.now?w.config.minDate:w.config.maxDate&&w.config.maxDate<w.now?w.config.maxDate:w.now),a=w.currentYear,i=w.currentMonth;try{void 0!==t&&(w.currentYear=t.getFullYear(),w.currentMonth=t.getMonth())}catch(e){e.message="Invalid date supplied: "+t,w.config.errorHandler(e)}n&&w.currentYear!==a&&(De("onYearChange"),q()),!n||w.currentYear===a&&w.currentMonth===i||De("onMonthChange"),w.redraw()}function H(e){var n=g(e);~n.className.indexOf("arrow")&&L(e,n.classList.contains("arrowUp")?1:-1)}function L(e,n,t){var a=e&&g(e),i=t||a&&a.parentNode&&a.parentNode.firstChild,o=we("increment");o.delta=n,i&&i.dispatchEvent(o)}function R(e,n,t,a){var i=ne(n,!0),o=d("span",e,n.getDate().toString());return o.dateObj=n,o.$i=a,o.setAttribute("aria-label",w.formatDate(n,w.config.ariaDateFormat)),-1===e.indexOf("hidden")&&0===M(n,w.now)&&(w.todayDateElem=o,o.classList.add("today"),o.setAttribute("aria-current","date")),i?(o.tabIndex=-1,be(n)&&(o.classList.add("selected"),w.selectedDateElem=o,"range"===w.config.mode&&(s(o,"startRange",w.selectedDates[0]&&0===M(n,w.selectedDates[0],!0)),s(o,"endRange",w.selectedDates[1]&&0===M(n,w.selectedDates[1],!0)),"nextMonthDay"===e&&o.classList.add("inRange")))):o.classList.add("flatpickr-disabled"),"range"===w.config.mode&&function(e){return!("range"!==w.config.mode||w.selectedDates.length<2)&&(M(e,w.selectedDates[0])>=0&&M(e,w.selectedDates[1])<=0)}(n)&&!be(n)&&o.classList.add("inRange"),w.weekNumbers&&1===w.config.showMonths&&"prevMonthDay"!==e&&a%7==6&&w.weekNumbers.insertAdjacentHTML("beforeend","<span class='flatpickr-day'>"+w.config.getWeek(n)+"</span>"),De("onDayCreate",o),o}function W(e){e.focus(),"range"===w.config.mode&&oe(e)}function B(e){for(var n=e>0?0:w.config.showMonths-1,t=e>0?w.config.showMonths:-1,a=n;a!=t;a+=e)for(var i=w.daysContainer.children[a],o=e>0?0:i.children.length-1,r=e>0?i.children.length:-1,l=o;l!=r;l+=e){var c=i.children[l];if(-1===c.className.indexOf("hidden")&&ne(c.dateObj))return c}}function J(e,n){var t=k(),a=te(t||document.body),i=void 0!==e?e:a?t:void 0!==w.selectedDateElem&&te(w.selectedDateElem)?w.selectedDateElem:void 0!==w.todayDateElem&&te(w.todayDateElem)?w.todayDateElem:B(n>0?1:-1);void 0===i?w._input.focus():a?function(e,n){for(var t=-1===e.className.indexOf("Month")?e.dateObj.getMonth():w.currentMonth,a=n>0?w.config.showMonths:-1,i=n>0?1:-1,o=t-w.currentMonth;o!=a;o+=i)for(var r=w.daysContainer.children[o],l=t-w.currentMonth===o?e.$i+n:n<0?r.children.length-1:0,c=r.children.length,s=l;s>=0&&s<c&&s!=(n>0?c:-1);s+=i){var d=r.children[s];if(-1===d.className.indexOf("hidden")&&ne(d.dateObj)&&Math.abs(e.$i-s)>=Math.abs(n))return W(d)}w.changeMonth(i),J(B(i),0)}(i,n):W(i)}function K(e,n){for(var t=(new Date(e,n,1).getDay()-w.l10n.firstDayOfWeek+7)%7,a=w.utils.getDaysInMonth((n-1+12)%12,e),i=w.utils.getDaysInMonth(n,e),o=window.document.createDocumentFragment(),r=w.config.showMonths>1,l=r?"prevMonthDay hidden":"prevMonthDay",c=r?"nextMonthDay hidden":"nextMonthDay",s=a+1-t,u=0;s<=a;s++,u++)o.appendChild(R("flatpickr-day "+l,new Date(e,n-1,s),0,u));for(s=1;s<=i;s++,u++)o.appendChild(R("flatpickr-day",new Date(e,n,s),0,u));for(var f=i+1;f<=42-t&&(1===w.config.showMonths||u%7!=0);f++,u++)o.appendChild(R("flatpickr-day "+c,new Date(e,n+1,f%i),0,u));var m=d("div","dayContainer");return m.appendChild(o),m}function U(){if(void 0!==w.daysContainer){u(w.daysContainer),w.weekNumbers&&u(w.weekNumbers);for(var e=document.createDocumentFragment(),n=0;n<w.config.showMonths;n++){var t=new Date(w.currentYear,w.currentMonth,1);t.setMonth(w.currentMonth+n),e.appendChild(K(t.getFullYear(),t.getMonth()))}w.daysContainer.appendChild(e),w.days=w.daysContainer.firstChild,"range"===w.config.mode&&1===w.selectedDates.length&&oe()}}function q(){if(!(w.config.showMonths>1||"dropdown"!==w.config.monthSelectorType)){var e=function(e){return!(void 0!==w.config.minDate&&w.currentYear===w.config.minDate.getFullYear()&&e<w.config.minDate.getMonth())&&!(void 0!==w.config.maxDate&&w.currentYear===w.config.maxDate.getFullYear()&&e>w.config.maxDate.getMonth())};w.monthsDropdownContainer.tabIndex=-1,w.monthsDropdownContainer.innerHTML="";for(var n=0;n<12;n++)if(e(n)){var t=d("option","flatpickr-monthDropdown-month");t.value=new Date(w.currentYear,n).getMonth().toString(),t.textContent=h(n,w.config.shorthandCurrentMonth,w.l10n),t.tabIndex=-1,w.currentMonth===n&&(t.selected=!0),w.monthsDropdownContainer.appendChild(t)}}}function $(){var e,n=d("div","flatpickr-month"),t=window.document.createDocumentFragment();w.config.showMonths>1||"static"===w.config.monthSelectorType?e=d("span","cur-month"):(w.monthsDropdownContainer=d("select","flatpickr-monthDropdown-months"),w.monthsDropdownContainer.setAttribute("aria-label",w.l10n.monthAriaLabel),P(w.monthsDropdownContainer,"change",(function(e){var n=g(e),t=parseInt(n.value,10);w.changeMonth(t-w.currentMonth),De("onMonthChange")})),q(),e=w.monthsDropdownContainer);var a=m("cur-year",{tabindex:"-1"}),i=a.getElementsByTagName("input")[0];i.setAttribute("aria-label",w.l10n.yearAriaLabel),w.config.minDate&&i.setAttribute("min",w.config.minDate.getFullYear().toString()),w.config.maxDate&&(i.setAttribute("max",w.config.maxDate.getFullYear().toString()),i.disabled=!!w.config.minDate&&w.config.minDate.getFullYear()===w.config.maxDate.getFullYear());var o=d("div","flatpickr-current-month");return o.appendChild(e),o.appendChild(a),t.appendChild(o),n.appendChild(t),{container:n,yearElement:i,monthElement:e}}function V(){u(w.monthNav),w.monthNav.appendChild(w.prevMonthNav),w.config.showMonths&&(w.yearElements=[],w.monthElements=[]);for(var e=w.config.showMonths;e--;){var n=$();w.yearElements.push(n.yearElement),w.monthElements.push(n.monthElement),w.monthNav.appendChild(n.container)}w.monthNav.appendChild(w.nextMonthNav)}function z(){w.weekdayContainer?u(w.weekdayContainer):w.weekdayContainer=d("div","flatpickr-weekdays");for(var e=w.config.showMonths;e--;){var n=d("div","flatpickr-weekdaycontainer");w.weekdayContainer.appendChild(n)}return G(),w.weekdayContainer}function G(){if(w.weekdayContainer){var e=w.l10n.firstDayOfWeek,t=n(w.l10n.weekdays.shorthand);e>0&&e<t.length&&(t=n(t.splice(e,t.length),t.splice(0,e)));for(var a=w.config.showMonths;a--;)w.weekdayContainer.children[a].innerHTML="\n      <span class='flatpickr-weekday'>\n        "+t.join("</span><span class='flatpickr-weekday'>")+"\n      </span>\n      "}}function Z(e,n){void 0===n&&(n=!0);var t=n?e:e-w.currentMonth;t<0&&!0===w._hidePrevMonthArrow||t>0&&!0===w._hideNextMonthArrow||(w.currentMonth+=t,(w.currentMonth<0||w.currentMonth>11)&&(w.currentYear+=w.currentMonth>11?1:-1,w.currentMonth=(w.currentMonth+12)%12,De("onYearChange"),q()),U(),De("onMonthChange"),Ce())}function Q(e){return w.calendarContainer.contains(e)}function X(e){if(w.isOpen&&!w.config.inline){var n=g(e),t=Q(n),a=!(n===w.input||n===w.altInput||w.element.contains(n)||e.path&&e.path.indexOf&&(~e.path.indexOf(w.input)||~e.path.indexOf(w.altInput)))&&!t&&!Q(e.relatedTarget),i=!w.config.ignoredFocusElements.some((function(e){return e.contains(n)}));a&&i&&(w.config.allowInput&&w.setDate(w._input.value,!1,w.config.altInput?w.config.altFormat:w.config.dateFormat),void 0!==w.timeContainer&&void 0!==w.minuteElement&&void 0!==w.hourElement&&""!==w.input.value&&void 0!==w.input.value&&_(),w.close(),w.config&&"range"===w.config.mode&&1===w.selectedDates.length&&w.clear(!1))}}function ee(e){if(!(!e||w.config.minDate&&e<w.config.minDate.getFullYear()||w.config.maxDate&&e>w.config.maxDate.getFullYear())){var n=e,t=w.currentYear!==n;w.currentYear=n||w.currentYear,w.config.maxDate&&w.currentYear===w.config.maxDate.getFullYear()?w.currentMonth=Math.min(w.config.maxDate.getMonth(),w.currentMonth):w.config.minDate&&w.currentYear===w.config.minDate.getFullYear()&&(w.currentMonth=Math.max(w.config.minDate.getMonth(),w.currentMonth)),t&&(w.redraw(),De("onYearChange"),q())}}function ne(e,n){var t;void 0===n&&(n=!0);var a=w.parseDate(e,void 0,n);if(w.config.minDate&&a&&M(a,w.config.minDate,void 0!==n?n:!w.minDateHasTime)<0||w.config.maxDate&&a&&M(a,w.config.maxDate,void 0!==n?n:!w.maxDateHasTime)>0)return!1;if(!w.config.enable&&0===w.config.disable.length)return!0;if(void 0===a)return!1;for(var i=!!w.config.enable,o=null!==(t=w.config.enable)&&void 0!==t?t:w.config.disable,r=0,l=void 0;r<o.length;r++){if("function"==typeof(l=o[r])&&l(a))return i;if(l instanceof Date&&void 0!==a&&l.getTime()===a.getTime())return i;if("string"==typeof l){var c=w.parseDate(l,void 0,!0);return c&&c.getTime()===a.getTime()?i:!i}if("object"==typeof l&&void 0!==a&&l.from&&l.to&&a.getTime()>=l.from.getTime()&&a.getTime()<=l.to.getTime())return i}return!i}function te(e){return void 0!==w.daysContainer&&(-1===e.className.indexOf("hidden")&&-1===e.className.indexOf("flatpickr-disabled")&&w.daysContainer.contains(e))}function ae(e){var n=e.target===w._input,t=w._input.value.trimEnd()!==Me();!n||!t||e.relatedTarget&&Q(e.relatedTarget)||w.setDate(w._input.value,!0,e.target===w.altInput?w.config.altFormat:w.config.dateFormat)}function ie(e){var n=g(e),t=w.config.wrap?p.contains(n):n===w._input,a=w.config.allowInput,i=w.isOpen&&(!a||!t),o=w.config.inline&&t&&!a;if(13===e.keyCode&&t){if(a)return w.setDate(w._input.value,!0,n===w.altInput?w.config.altFormat:w.config.dateFormat),w.close(),n.blur();w.open()}else if(Q(n)||i||o){var r=!!w.timeContainer&&w.timeContainer.contains(n);switch(e.keyCode){case 13:r?(e.preventDefault(),_(),fe()):me(e);break;case 27:e.preventDefault(),fe();break;case 8:case 46:t&&!w.config.allowInput&&(e.preventDefault(),w.clear());break;case 37:case 39:if(r||t)w.hourElement&&w.hourElement.focus();else{e.preventDefault();var l=k();if(void 0!==w.daysContainer&&(!1===a||l&&te(l))){var c=39===e.keyCode?1:-1;e.ctrlKey?(e.stopPropagation(),Z(c),J(B(1),0)):J(void 0,c)}}break;case 38:case 40:e.preventDefault();var s=40===e.keyCode?1:-1;w.daysContainer&&void 0!==n.$i||n===w.input||n===w.altInput?e.ctrlKey?(e.stopPropagation(),ee(w.currentYear-s),J(B(1),0)):r||J(void 0,7*s):n===w.currentYearElement?ee(w.currentYear-s):w.config.enableTime&&(!r&&w.hourElement&&w.hourElement.focus(),_(e),w._debouncedChange());break;case 9:if(r){var d=[w.hourElement,w.minuteElement,w.secondElement,w.amPM].concat(w.pluginElements).filter((function(e){return e})),u=d.indexOf(n);if(-1!==u){var f=d[u+(e.shiftKey?-1:1)];e.preventDefault(),(f||w._input).focus()}}else!w.config.noCalendar&&w.daysContainer&&w.daysContainer.contains(n)&&e.shiftKey&&(e.preventDefault(),w._input.focus())}}if(void 0!==w.amPM&&n===w.amPM)switch(e.key){case w.l10n.amPM[0].charAt(0):case w.l10n.amPM[0].charAt(0).toLowerCase():w.amPM.textContent=w.l10n.amPM[0],O(),ye();break;case w.l10n.amPM[1].charAt(0):case w.l10n.amPM[1].charAt(0).toLowerCase():w.amPM.textContent=w.l10n.amPM[1],O(),ye()}(t||Q(n))&&De("onKeyDown",e)}function oe(e,n){if(void 0===n&&(n="flatpickr-day"),1===w.selectedDates.length&&(!e||e.classList.contains(n)&&!e.classList.contains("flatpickr-disabled"))){for(var t=e?e.dateObj.getTime():w.days.firstElementChild.dateObj.getTime(),a=w.parseDate(w.selectedDates[0],void 0,!0).getTime(),i=Math.min(t,w.selectedDates[0].getTime()),o=Math.max(t,w.selectedDates[0].getTime()),r=!1,l=0,c=0,s=i;s<o;s+=x)ne(new Date(s),!0)||(r=r||s>i&&s<o,s<a&&(!l||s>l)?l=s:s>a&&(!c||s<c)&&(c=s));Array.from(w.rContainer.querySelectorAll("*:nth-child(-n+"+w.config.showMonths+") > ."+n)).forEach((function(n){var i,o,s,d=n.dateObj.getTime(),u=l>0&&d<l||c>0&&d>c;if(u)return n.classList.add("notAllowed"),void["inRange","startRange","endRange"].forEach((function(e){n.classList.remove(e)}));r&&!u||(["startRange","inRange","endRange","notAllowed"].forEach((function(e){n.classList.remove(e)})),void 0!==e&&(e.classList.add(t<=w.selectedDates[0].getTime()?"startRange":"endRange"),a<t&&d===a?n.classList.add("startRange"):a>t&&d===a&&n.classList.add("endRange"),d>=l&&(0===c||d<=c)&&(o=a,s=t,(i=d)>Math.min(o,s)&&i<Math.max(o,s))&&n.classList.add("inRange")))}))}}function re(){!w.isOpen||w.config.static||w.config.inline||de()}function le(e){return function(n){var t=w.config["_"+e+"Date"]=w.parseDate(n,w.config.dateFormat),a=w.config["_"+("min"===e?"max":"min")+"Date"];void 0!==t&&(w["min"===e?"minDateHasTime":"maxDateHasTime"]=t.getHours()>0||t.getMinutes()>0||t.getSeconds()>0),w.selectedDates&&(w.selectedDates=w.selectedDates.filter((function(e){return ne(e)})),w.selectedDates.length||"min"!==e||F(t),ye()),w.daysContainer&&(ue(),void 0!==t?w.currentYearElement[e]=t.getFullYear().toString():w.currentYearElement.removeAttribute(e),w.currentYearElement.disabled=!!a&&void 0!==t&&a.getFullYear()===t.getFullYear())}}function ce(){return w.config.wrap?p.querySelector("[data-input]"):p}function se(){"object"!=typeof w.config.locale&&void 0===I.l10ns[w.config.locale]&&w.config.errorHandler(new Error("flatpickr: invalid locale "+w.config.locale)),w.l10n=e(e({},I.l10ns.default),"object"==typeof w.config.locale?w.config.locale:"default"!==w.config.locale?I.l10ns[w.config.locale]:void 0),D.D="("+w.l10n.weekdays.shorthand.join("|")+")",D.l="("+w.l10n.weekdays.longhand.join("|")+")",D.M="("+w.l10n.months.shorthand.join("|")+")",D.F="("+w.l10n.months.longhand.join("|")+")",D.K="("+w.l10n.amPM[0]+"|"+w.l10n.amPM[1]+"|"+w.l10n.amPM[0].toLowerCase()+"|"+w.l10n.amPM[1].toLowerCase()+")",void 0===e(e({},v),JSON.parse(JSON.stringify(p.dataset||{}))).time_24hr&&void 0===I.defaultConfig.time_24hr&&(w.config.time_24hr=w.l10n.time_24hr),w.formatDate=b(w),w.parseDate=C({config:w.config,l10n:w.l10n})}function de(e){if("function"!=typeof w.config.position){if(void 0!==w.calendarContainer){De("onPreCalendarPosition");var n=e||w._positionElement,t=Array.prototype.reduce.call(w.calendarContainer.children,(function(e,n){return e+n.offsetHeight}),0),a=w.calendarContainer.offsetWidth,i=w.config.position.split(" "),o=i[0],r=i.length>1?i[1]:null,l=n.getBoundingClientRect(),c=window.innerHeight-l.bottom,d="above"===o||"below"!==o&&c<t&&l.top>t,u=window.pageYOffset+l.top+(d?-t-2:n.offsetHeight+2);if(s(w.calendarContainer,"arrowTop",!d),s(w.calendarContainer,"arrowBottom",d),!w.config.inline){var f=window.pageXOffset+l.left,m=!1,g=!1;"center"===r?(f-=(a-l.width)/2,m=!0):"right"===r&&(f-=a-l.width,g=!0),s(w.calendarContainer,"arrowLeft",!m&&!g),s(w.calendarContainer,"arrowCenter",m),s(w.calendarContainer,"arrowRight",g);var p=window.document.body.offsetWidth-(window.pageXOffset+l.right),h=f+a>window.document.body.offsetWidth,v=p+a>window.document.body.offsetWidth;if(s(w.calendarContainer,"rightMost",h),!w.config.static)if(w.calendarContainer.style.top=u+"px",h)if(v){var D=function(){for(var e=null,n=0;n<document.styleSheets.length;n++){var t=document.styleSheets[n];if(t.cssRules){try{t.cssRules}catch(e){continue}e=t;break}}return null!=e?e:(a=document.createElement("style"),document.head.appendChild(a),a.sheet);var a}();if(void 0===D)return;var b=window.document.body.offsetWidth,C=Math.max(0,b/2-a/2),M=D.cssRules.length,y="{left:"+l.left+"px;right:auto;}";s(w.calendarContainer,"rightMost",!1),s(w.calendarContainer,"centerMost",!0),D.insertRule(".flatpickr-calendar.centerMost:before,.flatpickr-calendar.centerMost:after"+y,M),w.calendarContainer.style.left=C+"px",w.calendarContainer.style.right="auto"}else w.calendarContainer.style.left="auto",w.calendarContainer.style.right=p+"px";else w.calendarContainer.style.left=f+"px",w.calendarContainer.style.right="auto"}}}else w.config.position(w,e)}function ue(){w.config.noCalendar||w.isMobile||(q(),Ce(),U())}function fe(){w._input.focus(),-1!==window.navigator.userAgent.indexOf("MSIE")||void 0!==navigator.msMaxTouchPoints?setTimeout(w.close,0):w.close()}function me(e){e.preventDefault(),e.stopPropagation();var n=f(g(e),(function(e){return e.classList&&e.classList.contains("flatpickr-day")&&!e.classList.contains("flatpickr-disabled")&&!e.classList.contains("notAllowed")}));if(void 0!==n){var t=n,a=w.latestSelectedDateObj=new Date(t.dateObj.getTime()),i=(a.getMonth()<w.currentMonth||a.getMonth()>w.currentMonth+w.config.showMonths-1)&&"range"!==w.config.mode;if(w.selectedDateElem=t,"single"===w.config.mode)w.selectedDates=[a];else if("multiple"===w.config.mode){var o=be(a);o?w.selectedDates.splice(parseInt(o),1):w.selectedDates.push(a)}else"range"===w.config.mode&&(2===w.selectedDates.length&&w.clear(!1,!1),w.latestSelectedDateObj=a,w.selectedDates.push(a),0!==M(a,w.selectedDates[0],!0)&&w.selectedDates.sort((function(e,n){return e.getTime()-n.getTime()})));if(O(),i){var r=w.currentYear!==a.getFullYear();w.currentYear=a.getFullYear(),w.currentMonth=a.getMonth(),r&&(De("onYearChange"),q()),De("onMonthChange")}if(Ce(),U(),ye(),i||"range"===w.config.mode||1!==w.config.showMonths?void 0!==w.selectedDateElem&&void 0===w.hourElement&&w.selectedDateElem&&w.selectedDateElem.focus():W(t),void 0!==w.hourElement&&void 0!==w.hourElement&&w.hourElement.focus(),w.config.closeOnSelect){var l="single"===w.config.mode&&!w.config.enableTime,c="range"===w.config.mode&&2===w.selectedDates.length&&!w.config.enableTime;(l||c)&&fe()}Y()}}w.parseDate=C({config:w.config,l10n:w.l10n}),w._handlers=[],w.pluginElements=[],w.loadedPlugins=[],w._bind=P,w._setHoursFromDate=F,w._positionCalendar=de,w.changeMonth=Z,w.changeYear=ee,w.clear=function(e,n){void 0===e&&(e=!0);void 0===n&&(n=!0);w.input.value="",void 0!==w.altInput&&(w.altInput.value="");void 0!==w.mobileInput&&(w.mobileInput.value="");w.selectedDates=[],w.latestSelectedDateObj=void 0,!0===n&&(w.currentYear=w._initialDate.getFullYear(),w.currentMonth=w._initialDate.getMonth());if(!0===w.config.enableTime){var t=E(w.config),a=t.hours,i=t.minutes,o=t.seconds;A(a,i,o)}w.redraw(),e&&De("onChange")},w.close=function(){w.isOpen=!1,w.isMobile||(void 0!==w.calendarContainer&&w.calendarContainer.classList.remove("open"),void 0!==w._input&&w._input.classList.remove("active"));De("onClose")},w.onMouseOver=oe,w._createElement=d,w.createDay=R,w.destroy=function(){void 0!==w.config&&De("onDestroy");for(var e=w._handlers.length;e--;)w._handlers[e].remove();if(w._handlers=[],w.mobileInput)w.mobileInput.parentNode&&w.mobileInput.parentNode.removeChild(w.mobileInput),w.mobileInput=void 0;else if(w.calendarContainer&&w.calendarContainer.parentNode)if(w.config.static&&w.calendarContainer.parentNode){var n=w.calendarContainer.parentNode;if(n.lastChild&&n.removeChild(n.lastChild),n.parentNode){for(;n.firstChild;)n.parentNode.insertBefore(n.firstChild,n);n.parentNode.removeChild(n)}}else w.calendarContainer.parentNode.removeChild(w.calendarContainer);w.altInput&&(w.input.type="text",w.altInput.parentNode&&w.altInput.parentNode.removeChild(w.altInput),delete w.altInput);w.input&&(w.input.type=w.input._type,w.input.classList.remove("flatpickr-input"),w.input.removeAttribute("readonly"));["_showTimeInput","latestSelectedDateObj","_hideNextMonthArrow","_hidePrevMonthArrow","__hideNextMonthArrow","__hidePrevMonthArrow","isMobile","isOpen","selectedDateElem","minDateHasTime","maxDateHasTime","days","daysContainer","_input","_positionElement","innerContainer","rContainer","monthNav","todayDateElem","calendarContainer","weekdayContainer","prevMonthNav","nextMonthNav","monthsDropdownContainer","currentMonthElement","currentYearElement","navigationCurrentMonth","selectedDateElem","config"].forEach((function(e){try{delete w[e]}catch(e){}}))},w.isEnabled=ne,w.jumpToDate=j,w.updateValue=ye,w.open=function(e,n){void 0===n&&(n=w._positionElement);if(!0===w.isMobile){if(e){e.preventDefault();var t=g(e);t&&t.blur()}return void 0!==w.mobileInput&&(w.mobileInput.focus(),w.mobileInput.click()),void De("onOpen")}if(w._input.disabled||w.config.inline)return;var a=w.isOpen;w.isOpen=!0,a||(w.calendarContainer.classList.add("open"),w._input.classList.add("active"),De("onOpen"),de(n));!0===w.config.enableTime&&!0===w.config.noCalendar&&(!1!==w.config.allowInput||void 0!==e&&w.timeContainer.contains(e.relatedTarget)||setTimeout((function(){return w.hourElement.select()}),50))},w.redraw=ue,w.set=function(e,n){if(null!==e&&"object"==typeof e)for(var a in Object.assign(w.config,e),e)void 0!==ge[a]&&ge[a].forEach((function(e){return e()}));else w.config[e]=n,void 0!==ge[e]?ge[e].forEach((function(e){return e()})):t.indexOf(e)>-1&&(w.config[e]=c(n));w.redraw(),ye(!0)},w.setDate=function(e,n,t){void 0===n&&(n=!1);void 0===t&&(t=w.config.dateFormat);if(0!==e&&!e||e instanceof Array&&0===e.length)return w.clear(n);pe(e,t),w.latestSelectedDateObj=w.selectedDates[w.selectedDates.length-1],w.redraw(),j(void 0,n),F(),0===w.selectedDates.length&&w.clear(!1);ye(n),n&&De("onChange")},w.toggle=function(e){if(!0===w.isOpen)return w.close();w.open(e)};var ge={locale:[se,G],showMonths:[V,S,z],minDate:[j],maxDate:[j],positionElement:[ve],clickOpens:[function(){!0===w.config.clickOpens?(P(w._input,"focus",w.open),P(w._input,"click",w.open)):(w._input.removeEventListener("focus",w.open),w._input.removeEventListener("click",w.open))}]};function pe(e,n){var t=[];if(e instanceof Array)t=e.map((function(e){return w.parseDate(e,n)}));else if(e instanceof Date||"number"==typeof e)t=[w.parseDate(e,n)];else if("string"==typeof e)switch(w.config.mode){case"single":case"time":t=[w.parseDate(e,n)];break;case"multiple":t=e.split(w.config.conjunction).map((function(e){return w.parseDate(e,n)}));break;case"range":t=e.split(w.l10n.rangeSeparator).map((function(e){return w.parseDate(e,n)}))}else w.config.errorHandler(new Error("Invalid date supplied: "+JSON.stringify(e)));w.selectedDates=w.config.allowInvalidPreload?t:t.filter((function(e){return e instanceof Date&&ne(e,!1)})),"range"===w.config.mode&&w.selectedDates.sort((function(e,n){return e.getTime()-n.getTime()}))}function he(e){return e.slice().map((function(e){return"string"==typeof e||"number"==typeof e||e instanceof Date?w.parseDate(e,void 0,!0):e&&"object"==typeof e&&e.from&&e.to?{from:w.parseDate(e.from,void 0),to:w.parseDate(e.to,void 0)}:e})).filter((function(e){return e}))}function ve(){w._positionElement=w.config.positionElement||w._input}function De(e,n){if(void 0!==w.config){var t=w.config[e];if(void 0!==t&&t.length>0)for(var a=0;t[a]&&a<t.length;a++)t[a](w.selectedDates,w.input.value,w,n);"onChange"===e&&(w.input.dispatchEvent(we("change")),w.input.dispatchEvent(we("input")))}}function we(e){var n=document.createEvent("Event");return n.initEvent(e,!0,!0),n}function be(e){for(var n=0;n<w.selectedDates.length;n++){var t=w.selectedDates[n];if(t instanceof Date&&0===M(t,e))return""+n}return!1}function Ce(){w.config.noCalendar||w.isMobile||!w.monthNav||(w.yearElements.forEach((function(e,n){var t=new Date(w.currentYear,w.currentMonth,1);t.setMonth(w.currentMonth+n),w.config.showMonths>1||"static"===w.config.monthSelectorType?w.monthElements[n].textContent=h(t.getMonth(),w.config.shorthandCurrentMonth,w.l10n)+" ":w.monthsDropdownContainer.value=t.getMonth().toString(),e.value=t.getFullYear().toString()})),w._hidePrevMonthArrow=void 0!==w.config.minDate&&(w.currentYear===w.config.minDate.getFullYear()?w.currentMonth<=w.config.minDate.getMonth():w.currentYear<w.config.minDate.getFullYear()),w._hideNextMonthArrow=void 0!==w.config.maxDate&&(w.currentYear===w.config.maxDate.getFullYear()?w.currentMonth+1>w.config.maxDate.getMonth():w.currentYear>w.config.maxDate.getFullYear()))}function Me(e){var n=e||(w.config.altInput?w.config.altFormat:w.config.dateFormat);return w.selectedDates.map((function(e){return w.formatDate(e,n)})).filter((function(e,n,t){return"range"!==w.config.mode||w.config.enableTime||t.indexOf(e)===n})).join("range"!==w.config.mode?w.config.conjunction:w.l10n.rangeSeparator)}function ye(e){void 0===e&&(e=!0),void 0!==w.mobileInput&&w.mobileFormatStr&&(w.mobileInput.value=void 0!==w.latestSelectedDateObj?w.formatDate(w.latestSelectedDateObj,w.mobileFormatStr):""),w.input.value=Me(w.config.dateFormat),void 0!==w.altInput&&(w.altInput.value=Me(w.config.altFormat)),!1!==e&&De("onValueUpdate")}function xe(e){var n=g(e),t=w.prevMonthNav.contains(n),a=w.nextMonthNav.contains(n);t||a?Z(t?-1:1):w.yearElements.indexOf(n)>=0?n.select():n.classList.contains("arrowUp")?w.changeYear(w.currentYear+1):n.classList.contains("arrowDown")&&w.changeYear(w.currentYear-1)}return function(){w.element=w.input=p,w.isOpen=!1,function(){var n=["wrap","weekNumbers","allowInput","allowInvalidPreload","clickOpens","time_24hr","enableTime","noCalendar","altInput","shorthandCurrentMonth","inline","static","enableSeconds","disableMobile"],i=e(e({},JSON.parse(JSON.stringify(p.dataset||{}))),v),o={};w.config.parseDate=i.parseDate,w.config.formatDate=i.formatDate,Object.defineProperty(w.config,"enable",{get:function(){return w.config._enable},set:function(e){w.config._enable=he(e)}}),Object.defineProperty(w.config,"disable",{get:function(){return w.config._disable},set:function(e){w.config._disable=he(e)}});var r="time"===i.mode;if(!i.dateFormat&&(i.enableTime||r)){var l=I.defaultConfig.dateFormat||a.dateFormat;o.dateFormat=i.noCalendar||r?"H:i"+(i.enableSeconds?":S":""):l+" H:i"+(i.enableSeconds?":S":"")}if(i.altInput&&(i.enableTime||r)&&!i.altFormat){var s=I.defaultConfig.altFormat||a.altFormat;o.altFormat=i.noCalendar||r?"h:i"+(i.enableSeconds?":S K":" K"):s+" h:i"+(i.enableSeconds?":S":"")+" K"}Object.defineProperty(w.config,"minDate",{get:function(){return w.config._minDate},set:le("min")}),Object.defineProperty(w.config,"maxDate",{get:function(){return w.config._maxDate},set:le("max")});var d=function(e){return function(n){w.config["min"===e?"_minTime":"_maxTime"]=w.parseDate(n,"H:i:S")}};Object.defineProperty(w.config,"minTime",{get:function(){return w.config._minTime},set:d("min")}),Object.defineProperty(w.config,"maxTime",{get:function(){return w.config._maxTime},set:d("max")}),"time"===i.mode&&(w.config.noCalendar=!0,w.config.enableTime=!0);Object.assign(w.config,o,i);for(var u=0;u<n.length;u++)w.config[n[u]]=!0===w.config[n[u]]||"true"===w.config[n[u]];t.filter((function(e){return void 0!==w.config[e]})).forEach((function(e){w.config[e]=c(w.config[e]||[]).map(T)})),w.isMobile=!w.config.disableMobile&&!w.config.inline&&"single"===w.config.mode&&!w.config.disable.length&&!w.config.enable&&!w.config.weekNumbers&&/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);for(u=0;u<w.config.plugins.length;u++){var f=w.config.plugins[u](w)||{};for(var m in f)t.indexOf(m)>-1?w.config[m]=c(f[m]).map(T).concat(w.config[m]):void 0===i[m]&&(w.config[m]=f[m])}i.altInputClass||(w.config.altInputClass=ce().className+" "+w.config.altInputClass);De("onParseConfig")}(),se(),function(){if(w.input=ce(),!w.input)return void w.config.errorHandler(new Error("Invalid input element specified"));w.input._type=w.input.type,w.input.type="text",w.input.classList.add("flatpickr-input"),w._input=w.input,w.config.altInput&&(w.altInput=d(w.input.nodeName,w.config.altInputClass),w._input=w.altInput,w.altInput.placeholder=w.input.placeholder,w.altInput.disabled=w.input.disabled,w.altInput.required=w.input.required,w.altInput.tabIndex=w.input.tabIndex,w.altInput.type="text",w.input.setAttribute("type","hidden"),!w.config.static&&w.input.parentNode&&w.input.parentNode.insertBefore(w.altInput,w.input.nextSibling));w.config.allowInput||w._input.setAttribute("readonly","readonly");ve()}(),function(){w.selectedDates=[],w.now=w.parseDate(w.config.now)||new Date;var e=w.config.defaultDate||("INPUT"!==w.input.nodeName&&"TEXTAREA"!==w.input.nodeName||!w.input.placeholder||w.input.value!==w.input.placeholder?w.input.value:null);e&&pe(e,w.config.dateFormat);w._initialDate=w.selectedDates.length>0?w.selectedDates[0]:w.config.minDate&&w.config.minDate.getTime()>w.now.getTime()?w.config.minDate:w.config.maxDate&&w.config.maxDate.getTime()<w.now.getTime()?w.config.maxDate:w.now,w.currentYear=w._initialDate.getFullYear(),w.currentMonth=w._initialDate.getMonth(),w.selectedDates.length>0&&(w.latestSelectedDateObj=w.selectedDates[0]);void 0!==w.config.minTime&&(w.config.minTime=w.parseDate(w.config.minTime,"H:i"));void 0!==w.config.maxTime&&(w.config.maxTime=w.parseDate(w.config.maxTime,"H:i"));w.minDateHasTime=!!w.config.minDate&&(w.config.minDate.getHours()>0||w.config.minDate.getMinutes()>0||w.config.minDate.getSeconds()>0),w.maxDateHasTime=!!w.config.maxDate&&(w.config.maxDate.getHours()>0||w.config.maxDate.getMinutes()>0||w.config.maxDate.getSeconds()>0)}(),w.utils={getDaysInMonth:function(e,n){return void 0===e&&(e=w.currentMonth),void 0===n&&(n=w.currentYear),1===e&&(n%4==0&&n%100!=0||n%400==0)?29:w.l10n.daysInMonth[e]}},w.isMobile||function(){var e=window.document.createDocumentFragment();if(w.calendarContainer=d("div","flatpickr-calendar"),w.calendarContainer.tabIndex=-1,!w.config.noCalendar){if(e.appendChild((w.monthNav=d("div","flatpickr-months"),w.yearElements=[],w.monthElements=[],w.prevMonthNav=d("span","flatpickr-prev-month"),w.prevMonthNav.innerHTML=w.config.prevArrow,w.nextMonthNav=d("span","flatpickr-next-month"),w.nextMonthNav.innerHTML=w.config.nextArrow,V(),Object.defineProperty(w,"_hidePrevMonthArrow",{get:function(){return w.__hidePrevMonthArrow},set:function(e){w.__hidePrevMonthArrow!==e&&(s(w.prevMonthNav,"flatpickr-disabled",e),w.__hidePrevMonthArrow=e)}}),Object.defineProperty(w,"_hideNextMonthArrow",{get:function(){return w.__hideNextMonthArrow},set:function(e){w.__hideNextMonthArrow!==e&&(s(w.nextMonthNav,"flatpickr-disabled",e),w.__hideNextMonthArrow=e)}}),w.currentYearElement=w.yearElements[0],Ce(),w.monthNav)),w.innerContainer=d("div","flatpickr-innerContainer"),w.config.weekNumbers){var n=function(){w.calendarContainer.classList.add("hasWeeks");var e=d("div","flatpickr-weekwrapper");e.appendChild(d("span","flatpickr-weekday",w.l10n.weekAbbreviation));var n=d("div","flatpickr-weeks");return e.appendChild(n),{weekWrapper:e,weekNumbers:n}}(),t=n.weekWrapper,a=n.weekNumbers;w.innerContainer.appendChild(t),w.weekNumbers=a,w.weekWrapper=t}w.rContainer=d("div","flatpickr-rContainer"),w.rContainer.appendChild(z()),w.daysContainer||(w.daysContainer=d("div","flatpickr-days"),w.daysContainer.tabIndex=-1),U(),w.rContainer.appendChild(w.daysContainer),w.innerContainer.appendChild(w.rContainer),e.appendChild(w.innerContainer)}w.config.enableTime&&e.appendChild(function(){w.calendarContainer.classList.add("hasTime"),w.config.noCalendar&&w.calendarContainer.classList.add("noCalendar");var e=E(w.config);w.timeContainer=d("div","flatpickr-time"),w.timeContainer.tabIndex=-1;var n=d("span","flatpickr-time-separator",":"),t=m("flatpickr-hour",{"aria-label":w.l10n.hourAriaLabel});w.hourElement=t.getElementsByTagName("input")[0];var a=m("flatpickr-minute",{"aria-label":w.l10n.minuteAriaLabel});w.minuteElement=a.getElementsByTagName("input")[0],w.hourElement.tabIndex=w.minuteElement.tabIndex=-1,w.hourElement.value=o(w.latestSelectedDateObj?w.latestSelectedDateObj.getHours():w.config.time_24hr?e.hours:function(e){switch(e%24){case 0:case 12:return 12;default:return e%12}}(e.hours)),w.minuteElement.value=o(w.latestSelectedDateObj?w.latestSelectedDateObj.getMinutes():e.minutes),w.hourElement.setAttribute("step",w.config.hourIncrement.toString()),w.minuteElement.setAttribute("step",w.config.minuteIncrement.toString()),w.hourElement.setAttribute("min",w.config.time_24hr?"0":"1"),w.hourElement.setAttribute("max",w.config.time_24hr?"23":"12"),w.hourElement.setAttribute("maxlength","2"),w.minuteElement.setAttribute("min","0"),w.minuteElement.setAttribute("max","59"),w.minuteElement.setAttribute("maxlength","2"),w.timeContainer.appendChild(t),w.timeContainer.appendChild(n),w.timeContainer.appendChild(a),w.config.time_24hr&&w.timeContainer.classList.add("time24hr");if(w.config.enableSeconds){w.timeContainer.classList.add("hasSeconds");var i=m("flatpickr-second");w.secondElement=i.getElementsByTagName("input")[0],w.secondElement.value=o(w.latestSelectedDateObj?w.latestSelectedDateObj.getSeconds():e.seconds),w.secondElement.setAttribute("step",w.minuteElement.getAttribute("step")),w.secondElement.setAttribute("min","0"),w.secondElement.setAttribute("max","59"),w.secondElement.setAttribute("maxlength","2"),w.timeContainer.appendChild(d("span","flatpickr-time-separator",":")),w.timeContainer.appendChild(i)}w.config.time_24hr||(w.amPM=d("span","flatpickr-am-pm",w.l10n.amPM[r((w.latestSelectedDateObj?w.hourElement.value:w.config.defaultHour)>11)]),w.amPM.title=w.l10n.toggleTitle,w.amPM.tabIndex=-1,w.timeContainer.appendChild(w.amPM));return w.timeContainer}());s(w.calendarContainer,"rangeMode","range"===w.config.mode),s(w.calendarContainer,"animate",!0===w.config.animate),s(w.calendarContainer,"multiMonth",w.config.showMonths>1),w.calendarContainer.appendChild(e);var i=void 0!==w.config.appendTo&&void 0!==w.config.appendTo.nodeType;if((w.config.inline||w.config.static)&&(w.calendarContainer.classList.add(w.config.inline?"inline":"static"),w.config.inline&&(!i&&w.element.parentNode?w.element.parentNode.insertBefore(w.calendarContainer,w._input.nextSibling):void 0!==w.config.appendTo&&w.config.appendTo.appendChild(w.calendarContainer)),w.config.static)){var l=d("div","flatpickr-wrapper");w.element.parentNode&&w.element.parentNode.insertBefore(l,w.element),l.appendChild(w.element),w.altInput&&l.appendChild(w.altInput),l.appendChild(w.calendarContainer)}w.config.static||w.config.inline||(void 0!==w.config.appendTo?w.config.appendTo:window.document.body).appendChild(w.calendarContainer)}(),function(){w.config.wrap&&["open","close","toggle","clear"].forEach((function(e){Array.prototype.forEach.call(w.element.querySelectorAll("[data-"+e+"]"),(function(n){return P(n,"click",w[e])}))}));if(w.isMobile)return void function(){var e=w.config.enableTime?w.config.noCalendar?"time":"datetime-local":"date";w.mobileInput=d("input",w.input.className+" flatpickr-mobile"),w.mobileInput.tabIndex=1,w.mobileInput.type=e,w.mobileInput.disabled=w.input.disabled,w.mobileInput.required=w.input.required,w.mobileInput.placeholder=w.input.placeholder,w.mobileFormatStr="datetime-local"===e?"Y-m-d\\TH:i:S":"date"===e?"Y-m-d":"H:i:S",w.selectedDates.length>0&&(w.mobileInput.defaultValue=w.mobileInput.value=w.formatDate(w.selectedDates[0],w.mobileFormatStr));w.config.minDate&&(w.mobileInput.min=w.formatDate(w.config.minDate,"Y-m-d"));w.config.maxDate&&(w.mobileInput.max=w.formatDate(w.config.maxDate,"Y-m-d"));w.input.getAttribute("step")&&(w.mobileInput.step=String(w.input.getAttribute("step")));w.input.type="hidden",void 0!==w.altInput&&(w.altInput.type="hidden");try{w.input.parentNode&&w.input.parentNode.insertBefore(w.mobileInput,w.input.nextSibling)}catch(e){}P(w.mobileInput,"change",(function(e){w.setDate(g(e).value,!1,w.mobileFormatStr),De("onChange"),De("onClose")}))}();var e=l(re,50);w._debouncedChange=l(Y,300),w.daysContainer&&!/iPhone|iPad|iPod/i.test(navigator.userAgent)&&P(w.daysContainer,"mouseover",(function(e){"range"===w.config.mode&&oe(g(e))}));P(w._input,"keydown",ie),void 0!==w.calendarContainer&&P(w.calendarContainer,"keydown",ie);w.config.inline||w.config.static||P(window,"resize",e);void 0!==window.ontouchstart?P(window.document,"touchstart",X):P(window.document,"mousedown",X);P(window.document,"focus",X,{capture:!0}),!0===w.config.clickOpens&&(P(w._input,"focus",w.open),P(w._input,"click",w.open));void 0!==w.daysContainer&&(P(w.monthNav,"click",xe),P(w.monthNav,["keyup","increment"],N),P(w.daysContainer,"click",me));if(void 0!==w.timeContainer&&void 0!==w.minuteElement&&void 0!==w.hourElement){var n=function(e){return g(e).select()};P(w.timeContainer,["increment"],_),P(w.timeContainer,"blur",_,{capture:!0}),P(w.timeContainer,"click",H),P([w.hourElement,w.minuteElement],["focus","click"],n),void 0!==w.secondElement&&P(w.secondElement,"focus",(function(){return w.secondElement&&w.secondElement.select()})),void 0!==w.amPM&&P(w.amPM,"click",(function(e){_(e)}))}w.config.allowInput&&P(w._input,"blur",ae)}(),(w.selectedDates.length||w.config.noCalendar)&&(w.config.enableTime&&F(w.config.noCalendar?w.latestSelectedDateObj:void 0),ye(!1)),S();var n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);!w.isMobile&&n&&de(),De("onReady")}(),w}function T(e,n){for(var t=Array.prototype.slice.call(e).filter((function(e){return e instanceof HTMLElement})),a=[],i=0;i<t.length;i++){var o=t[i];try{if(null!==o.getAttribute("data-fp-omit"))continue;void 0!==o._flatpickr&&(o._flatpickr.destroy(),o._flatpickr=void 0),o._flatpickr=k(o,n||{}),a.push(o._flatpickr)}catch(e){console.error(e)}}return 1===a.length?a[0]:a}"undefined"!=typeof HTMLElement&&"undefined"!=typeof HTMLCollection&&"undefined"!=typeof NodeList&&(HTMLCollection.prototype.flatpickr=NodeList.prototype.flatpickr=function(e){return T(this,e)},HTMLElement.prototype.flatpickr=function(e){return T([this],e)});var I=function(e,n){return"string"==typeof e?T(window.document.querySelectorAll(e),n):e instanceof Node?T([e],n):T(e,n)};return I.defaultConfig={},I.l10ns={en:e({},i),default:e({},i)},I.localize=function(n){I.l10ns.default=e(e({},I.l10ns.default),n)},I.setDefaults=function(n){I.defaultConfig=e(e({},I.defaultConfig),n)},I.parseDate=C({}),I.formatDate=b({}),I.compareDates=M,"undefined"!=typeof jQuery&&void 0!==jQuery.fn&&(jQuery.fn.flatpickr=function(e){return T(this,e)}),Date.prototype.fp_incr=function(e){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+("string"==typeof e?parseInt(e,10):e))},"undefined"!=typeof window&&(window.flatpickr=I),I}));
// https://d3js.org v7.9.0 Copyright 2010-2023 Mike Bostock
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t="undefined"!=typeof globalThis?globalThis:t||self).d3=t.d3||{})}(this,(function(t){"use strict";function n(t,n){return null==t||null==n?NaN:t<n?-1:t>n?1:t>=n?0:NaN}function e(t,n){return null==t||null==n?NaN:n<t?-1:n>t?1:n>=t?0:NaN}function r(t){let r,o,a;function u(t,n,e=0,i=t.length){if(e<i){if(0!==r(n,n))return i;do{const r=e+i>>>1;o(t[r],n)<0?e=r+1:i=r}while(e<i)}return e}return 2!==t.length?(r=n,o=(e,r)=>n(t(e),r),a=(n,e)=>t(n)-e):(r=t===n||t===e?t:i,o=t,a=t),{left:u,center:function(t,n,e=0,r=t.length){const i=u(t,n,e,r-1);return i>e&&a(t[i-1],n)>-a(t[i],n)?i-1:i},right:function(t,n,e=0,i=t.length){if(e<i){if(0!==r(n,n))return i;do{const r=e+i>>>1;o(t[r],n)<=0?e=r+1:i=r}while(e<i)}return e}}}function i(){return 0}function o(t){return null===t?NaN:+t}const a=r(n),u=a.right,c=a.left,f=r(o).center;var s=u;const l=d(y),h=d((function(t){const n=y(t);return(t,e,r,i,o)=>{n(t,e,(r<<=2)+0,(i<<=2)+0,o<<=2),n(t,e,r+1,i+1,o),n(t,e,r+2,i+2,o),n(t,e,r+3,i+3,o)}}));function d(t){return function(n,e,r=e){if(!((e=+e)>=0))throw new RangeError("invalid rx");if(!((r=+r)>=0))throw new RangeError("invalid ry");let{data:i,width:o,height:a}=n;if(!((o=Math.floor(o))>=0))throw new RangeError("invalid width");if(!((a=Math.floor(void 0!==a?a:i.length/o))>=0))throw new RangeError("invalid height");if(!o||!a||!e&&!r)return n;const u=e&&t(e),c=r&&t(r),f=i.slice();return u&&c?(p(u,f,i,o,a),p(u,i,f,o,a),p(u,f,i,o,a),g(c,i,f,o,a),g(c,f,i,o,a),g(c,i,f,o,a)):u?(p(u,i,f,o,a),p(u,f,i,o,a),p(u,i,f,o,a)):c&&(g(c,i,f,o,a),g(c,f,i,o,a),g(c,i,f,o,a)),n}}function p(t,n,e,r,i){for(let o=0,a=r*i;o<a;)t(n,e,o,o+=r,1)}function g(t,n,e,r,i){for(let o=0,a=r*i;o<r;++o)t(n,e,o,o+a,r)}function y(t){const n=Math.floor(t);if(n===t)return function(t){const n=2*t+1;return(e,r,i,o,a)=>{if(!((o-=a)>=i))return;let u=t*r[i];const c=a*t;for(let t=i,n=i+c;t<n;t+=a)u+=r[Math.min(o,t)];for(let t=i,f=o;t<=f;t+=a)u+=r[Math.min(o,t+c)],e[t]=u/n,u-=r[Math.max(i,t-c)]}}(t);const e=t-n,r=2*t+1;return(t,i,o,a,u)=>{if(!((a-=u)>=o))return;let c=n*i[o];const f=u*n,s=f+u;for(let t=o,n=o+f;t<n;t+=u)c+=i[Math.min(a,t)];for(let n=o,l=a;n<=l;n+=u)c+=i[Math.min(a,n+f)],t[n]=(c+e*(i[Math.max(o,n-s)]+i[Math.min(a,n+s)]))/r,c-=i[Math.max(o,n-f)]}}function v(t,n){let e=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&++e;else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(i=+i)>=i&&++e}return e}function _(t){return 0|t.length}function b(t){return!(t>0)}function m(t){return"object"!=typeof t||"length"in t?t:Array.from(t)}function x(t,n){let e,r=0,i=0,o=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(e=n-i,i+=e/++r,o+=e*(n-i));else{let a=-1;for(let u of t)null!=(u=n(u,++a,t))&&(u=+u)>=u&&(e=u-i,i+=e/++r,o+=e*(u-i))}if(r>1)return o/(r-1)}function w(t,n){const e=x(t,n);return e?Math.sqrt(e):e}function M(t,n){let e,r;if(void 0===n)for(const n of t)null!=n&&(void 0===e?n>=n&&(e=r=n):(e>n&&(e=n),r<n&&(r=n)));else{let i=-1;for(let o of t)null!=(o=n(o,++i,t))&&(void 0===e?o>=o&&(e=r=o):(e>o&&(e=o),r<o&&(r=o)))}return[e,r]}class T{constructor(){this._partials=new Float64Array(32),this._n=0}add(t){const n=this._partials;let e=0;for(let r=0;r<this._n&&r<32;r++){const i=n[r],o=t+i,a=Math.abs(t)<Math.abs(i)?t-(o-i):i-(o-t);a&&(n[e++]=a),t=o}return n[e]=t,this._n=e+1,this}valueOf(){const t=this._partials;let n,e,r,i=this._n,o=0;if(i>0){for(o=t[--i];i>0&&(n=o,e=t[--i],o=n+e,r=e-(o-n),!r););i>0&&(r<0&&t[i-1]<0||r>0&&t[i-1]>0)&&(e=2*r,n=o+e,e==n-o&&(o=n))}return o}}class InternMap extends Map{constructor(t,n=N){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:n}}),null!=t)for(const[n,e]of t)this.set(n,e)}get(t){return super.get(A(this,t))}has(t){return super.has(A(this,t))}set(t,n){return super.set(S(this,t),n)}delete(t){return super.delete(E(this,t))}}class InternSet extends Set{constructor(t,n=N){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:n}}),null!=t)for(const n of t)this.add(n)}has(t){return super.has(A(this,t))}add(t){return super.add(S(this,t))}delete(t){return super.delete(E(this,t))}}function A({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):e}function S({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):(t.set(r,e),e)}function E({_intern:t,_key:n},e){const r=n(e);return t.has(r)&&(e=t.get(r),t.delete(r)),e}function N(t){return null!==t&&"object"==typeof t?t.valueOf():t}function k(t){return t}function C(t,...n){return F(t,k,k,n)}function P(t,...n){return F(t,Array.from,k,n)}function z(t,n){for(let e=1,r=n.length;e<r;++e)t=t.flatMap((t=>t.pop().map((([n,e])=>[...t,n,e]))));return t}function $(t,n,...e){return F(t,k,n,e)}function D(t,n,...e){return F(t,Array.from,n,e)}function R(t){if(1!==t.length)throw new Error("duplicate key");return t[0]}function F(t,n,e,r){return function t(i,o){if(o>=r.length)return e(i);const a=new InternMap,u=r[o++];let c=-1;for(const t of i){const n=u(t,++c,i),e=a.get(n);e?e.push(t):a.set(n,[t])}for(const[n,e]of a)a.set(n,t(e,o));return n(a)}(t,0)}function q(t,n){return Array.from(n,(n=>t[n]))}function U(t,...n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");t=Array.from(t);let[e]=n;if(e&&2!==e.length||n.length>1){const r=Uint32Array.from(t,((t,n)=>n));return n.length>1?(n=n.map((n=>t.map(n))),r.sort(((t,e)=>{for(const r of n){const n=O(r[t],r[e]);if(n)return n}}))):(e=t.map(e),r.sort(((t,n)=>O(e[t],e[n])))),q(t,r)}return t.sort(I(e))}function I(t=n){if(t===n)return O;if("function"!=typeof t)throw new TypeError("compare is not a function");return(n,e)=>{const r=t(n,e);return r||0===r?r:(0===t(e,e))-(0===t(n,n))}}function O(t,n){return(null==t||!(t>=t))-(null==n||!(n>=n))||(t<n?-1:t>n?1:0)}var B=Array.prototype.slice;function Y(t){return()=>t}const L=Math.sqrt(50),j=Math.sqrt(10),H=Math.sqrt(2);function X(t,n,e){const r=(n-t)/Math.max(0,e),i=Math.floor(Math.log10(r)),o=r/Math.pow(10,i),a=o>=L?10:o>=j?5:o>=H?2:1;let u,c,f;return i<0?(f=Math.pow(10,-i)/a,u=Math.round(t*f),c=Math.round(n*f),u/f<t&&++u,c/f>n&&--c,f=-f):(f=Math.pow(10,i)*a,u=Math.round(t/f),c=Math.round(n/f),u*f<t&&++u,c*f>n&&--c),c<u&&.5<=e&&e<2?X(t,n,2*e):[u,c,f]}function G(t,n,e){if(!((e=+e)>0))return[];if((t=+t)===(n=+n))return[t];const r=n<t,[i,o,a]=r?X(n,t,e):X(t,n,e);if(!(o>=i))return[];const u=o-i+1,c=new Array(u);if(r)if(a<0)for(let t=0;t<u;++t)c[t]=(o-t)/-a;else for(let t=0;t<u;++t)c[t]=(o-t)*a;else if(a<0)for(let t=0;t<u;++t)c[t]=(i+t)/-a;else for(let t=0;t<u;++t)c[t]=(i+t)*a;return c}function V(t,n,e){return X(t=+t,n=+n,e=+e)[2]}function W(t,n,e){e=+e;const r=(n=+n)<(t=+t),i=r?V(n,t,e):V(t,n,e);return(r?-1:1)*(i<0?1/-i:i)}function Z(t,n,e){let r;for(;;){const i=V(t,n,e);if(i===r||0===i||!isFinite(i))return[t,n];i>0?(t=Math.floor(t/i)*i,n=Math.ceil(n/i)*i):i<0&&(t=Math.ceil(t*i)/i,n=Math.floor(n*i)/i),r=i}}function K(t){return Math.max(1,Math.ceil(Math.log(v(t))/Math.LN2)+1)}function Q(){var t=k,n=M,e=K;function r(r){Array.isArray(r)||(r=Array.from(r));var i,o,a,u=r.length,c=new Array(u);for(i=0;i<u;++i)c[i]=t(r[i],i,r);var f=n(c),l=f[0],h=f[1],d=e(c,l,h);if(!Array.isArray(d)){const t=h,e=+d;if(n===M&&([l,h]=Z(l,h,e)),(d=G(l,h,e))[0]<=l&&(a=V(l,h,e)),d[d.length-1]>=h)if(t>=h&&n===M){const t=V(l,h,e);isFinite(t)&&(t>0?h=(Math.floor(h/t)+1)*t:t<0&&(h=(Math.ceil(h*-t)+1)/-t))}else d.pop()}for(var p=d.length,g=0,y=p;d[g]<=l;)++g;for(;d[y-1]>h;)--y;(g||y<p)&&(d=d.slice(g,y),p=y-g);var v,_=new Array(p+1);for(i=0;i<=p;++i)(v=_[i]=[]).x0=i>0?d[i-1]:l,v.x1=i<p?d[i]:h;if(isFinite(a)){if(a>0)for(i=0;i<u;++i)null!=(o=c[i])&&l<=o&&o<=h&&_[Math.min(p,Math.floor((o-l)/a))].push(r[i]);else if(a<0)for(i=0;i<u;++i)if(null!=(o=c[i])&&l<=o&&o<=h){const t=Math.floor((l-o)*a);_[Math.min(p,t+(d[t]<=o))].push(r[i])}}else for(i=0;i<u;++i)null!=(o=c[i])&&l<=o&&o<=h&&_[s(d,o,0,p)].push(r[i]);return _}return r.value=function(n){return arguments.length?(t="function"==typeof n?n:Y(n),r):t},r.domain=function(t){return arguments.length?(n="function"==typeof t?t:Y([t[0],t[1]]),r):n},r.thresholds=function(t){return arguments.length?(e="function"==typeof t?t:Y(Array.isArray(t)?B.call(t):t),r):e},r}function J(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e<n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e<i||void 0===e&&i>=i)&&(e=i)}return e}function tt(t,n){let e,r=-1,i=-1;if(void 0===n)for(const n of t)++i,null!=n&&(e<n||void 0===e&&n>=n)&&(e=n,r=i);else for(let o of t)null!=(o=n(o,++i,t))&&(e<o||void 0===e&&o>=o)&&(e=o,r=i);return r}function nt(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e>n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e>i||void 0===e&&i>=i)&&(e=i)}return e}function et(t,n){let e,r=-1,i=-1;if(void 0===n)for(const n of t)++i,null!=n&&(e>n||void 0===e&&n>=n)&&(e=n,r=i);else for(let o of t)null!=(o=n(o,++i,t))&&(e>o||void 0===e&&o>=o)&&(e=o,r=i);return r}function rt(t,n,e=0,r=1/0,i){if(n=Math.floor(n),e=Math.floor(Math.max(0,e)),r=Math.floor(Math.min(t.length-1,r)),!(e<=n&&n<=r))return t;for(i=void 0===i?O:I(i);r>e;){if(r-e>600){const o=r-e+1,a=n-e+1,u=Math.log(o),c=.5*Math.exp(2*u/3),f=.5*Math.sqrt(u*c*(o-c)/o)*(a-o/2<0?-1:1);rt(t,n,Math.max(e,Math.floor(n-a*c/o+f)),Math.min(r,Math.floor(n+(o-a)*c/o+f)),i)}const o=t[n];let a=e,u=r;for(it(t,e,n),i(t[r],o)>0&&it(t,e,r);a<u;){for(it(t,a,u),++a,--u;i(t[a],o)<0;)++a;for(;i(t[u],o)>0;)--u}0===i(t[e],o)?it(t,e,u):(++u,it(t,u,r)),u<=n&&(e=u+1),n<=u&&(r=u-1)}return t}function it(t,n,e){const r=t[n];t[n]=t[e],t[e]=r}function ot(t,e=n){let r,i=!1;if(1===e.length){let o;for(const a of t){const t=e(a);(i?n(t,o)>0:0===n(t,t))&&(r=a,o=t,i=!0)}}else for(const n of t)(i?e(n,r)>0:0===e(n,n))&&(r=n,i=!0);return r}function at(t,n,e){if(t=Float64Array.from(function*(t,n){if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(yield n);else{let e=-1;for(let r of t)null!=(r=n(r,++e,t))&&(r=+r)>=r&&(yield r)}}(t,e)),(r=t.length)&&!isNaN(n=+n)){if(n<=0||r<2)return nt(t);if(n>=1)return J(t);var r,i=(r-1)*n,o=Math.floor(i),a=J(rt(t,o).subarray(0,o+1));return a+(nt(t.subarray(o+1))-a)*(i-o)}}function ut(t,n,e=o){if((r=t.length)&&!isNaN(n=+n)){if(n<=0||r<2)return+e(t[0],0,t);if(n>=1)return+e(t[r-1],r-1,t);var r,i=(r-1)*n,a=Math.floor(i),u=+e(t[a],a,t);return u+(+e(t[a+1],a+1,t)-u)*(i-a)}}function ct(t,n,e=o){if(!isNaN(n=+n)){if(r=Float64Array.from(t,((n,r)=>o(e(t[r],r,t)))),n<=0)return et(r);if(n>=1)return tt(r);var r,i=Uint32Array.from(t,((t,n)=>n)),a=r.length-1,u=Math.floor(a*n);return rt(i,u,0,a,((t,n)=>O(r[t],r[n]))),(u=ot(i.subarray(0,u+1),(t=>r[t])))>=0?u:-1}}function ft(t){return Array.from(function*(t){for(const n of t)yield*n}(t))}function st(t,n){return[t,n]}function lt(t,n,e){t=+t,n=+n,e=(i=arguments.length)<2?(n=t,t=0,1):i<3?1:+e;for(var r=-1,i=0|Math.max(0,Math.ceil((n-t)/e)),o=new Array(i);++r<i;)o[r]=t+r*e;return o}function ht(t,e=n){if(1===e.length)return et(t,e);let r,i=-1,o=-1;for(const n of t)++o,(i<0?0===e(n,n):e(n,r)<0)&&(r=n,i=o);return i}var dt=pt(Math.random);function pt(t){return function(n,e=0,r=n.length){let i=r-(e=+e);for(;i;){const r=t()*i--|0,o=n[i+e];n[i+e]=n[r+e],n[r+e]=o}return n}}function gt(t){if(!(i=t.length))return[];for(var n=-1,e=nt(t,yt),r=new Array(e);++n<e;)for(var i,o=-1,a=r[n]=new Array(i);++o<i;)a[o]=t[o][n];return r}function yt(t){return t.length}function vt(t){return t instanceof InternSet?t:new InternSet(t)}function _t(t,n){const e=t[Symbol.iterator](),r=new Set;for(const t of n){const n=bt(t);if(r.has(n))continue;let i,o;for(;({value:i,done:o}=e.next());){if(o)return!1;const t=bt(i);if(r.add(t),Object.is(n,t))break}}return!0}function bt(t){return null!==t&&"object"==typeof t?t.valueOf():t}function mt(t){return t}var xt=1,wt=2,Mt=3,Tt=4,At=1e-6;function St(t){return"translate("+t+",0)"}function Et(t){return"translate(0,"+t+")"}function Nt(t){return n=>+t(n)}function kt(t,n){return n=Math.max(0,t.bandwidth()-2*n)/2,t.round()&&(n=Math.round(n)),e=>+t(e)+n}function Ct(){return!this.__axis}function Pt(t,n){var e=[],r=null,i=null,o=6,a=6,u=3,c="undefined"!=typeof window&&window.devicePixelRatio>1?0:.5,f=t===xt||t===Tt?-1:1,s=t===Tt||t===wt?"x":"y",l=t===xt||t===Mt?St:Et;function h(h){var d=null==r?n.ticks?n.ticks.apply(n,e):n.domain():r,p=null==i?n.tickFormat?n.tickFormat.apply(n,e):mt:i,g=Math.max(o,0)+u,y=n.range(),v=+y[0]+c,_=+y[y.length-1]+c,b=(n.bandwidth?kt:Nt)(n.copy(),c),m=h.selection?h.selection():h,x=m.selectAll(".domain").data([null]),w=m.selectAll(".tick").data(d,n).order(),M=w.exit(),T=w.enter().append("g").attr("class","tick"),A=w.select("line"),S=w.select("text");x=x.merge(x.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),w=w.merge(T),A=A.merge(T.append("line").attr("stroke","currentColor").attr(s+"2",f*o)),S=S.merge(T.append("text").attr("fill","currentColor").attr(s,f*g).attr("dy",t===xt?"0em":t===Mt?"0.71em":"0.32em")),h!==m&&(x=x.transition(h),w=w.transition(h),A=A.transition(h),S=S.transition(h),M=M.transition(h).attr("opacity",At).attr("transform",(function(t){return isFinite(t=b(t))?l(t+c):this.getAttribute("transform")})),T.attr("opacity",At).attr("transform",(function(t){var n=this.parentNode.__axis;return l((n&&isFinite(n=n(t))?n:b(t))+c)}))),M.remove(),x.attr("d",t===Tt||t===wt?a?"M"+f*a+","+v+"H"+c+"V"+_+"H"+f*a:"M"+c+","+v+"V"+_:a?"M"+v+","+f*a+"V"+c+"H"+_+"V"+f*a:"M"+v+","+c+"H"+_),w.attr("opacity",1).attr("transform",(function(t){return l(b(t)+c)})),A.attr(s+"2",f*o),S.attr(s,f*g).text(p),m.filter(Ct).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===wt?"start":t===Tt?"end":"middle"),m.each((function(){this.__axis=b}))}return h.scale=function(t){return arguments.length?(n=t,h):n},h.ticks=function(){return e=Array.from(arguments),h},h.tickArguments=function(t){return arguments.length?(e=null==t?[]:Array.from(t),h):e.slice()},h.tickValues=function(t){return arguments.length?(r=null==t?null:Array.from(t),h):r&&r.slice()},h.tickFormat=function(t){return arguments.length?(i=t,h):i},h.tickSize=function(t){return arguments.length?(o=a=+t,h):o},h.tickSizeInner=function(t){return arguments.length?(o=+t,h):o},h.tickSizeOuter=function(t){return arguments.length?(a=+t,h):a},h.tickPadding=function(t){return arguments.length?(u=+t,h):u},h.offset=function(t){return arguments.length?(c=+t,h):c},h}var zt={value:()=>{}};function $t(){for(var t,n=0,e=arguments.length,r={};n<e;++n){if(!(t=arguments[n]+"")||t in r||/[\s.]/.test(t))throw new Error("illegal type: "+t);r[t]=[]}return new Dt(r)}function Dt(t){this._=t}function Rt(t,n){for(var e,r=0,i=t.length;r<i;++r)if((e=t[r]).name===n)return e.value}function Ft(t,n,e){for(var r=0,i=t.length;r<i;++r)if(t[r].name===n){t[r]=zt,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=e&&t.push({name:n,value:e}),t}Dt.prototype=$t.prototype={constructor:Dt,on:function(t,n){var e,r,i=this._,o=(r=i,(t+"").trim().split(/^|\s+/).map((function(t){var n="",e=t.indexOf(".");if(e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),t&&!r.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:n}}))),a=-1,u=o.length;if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++a<u;)if(e=(t=o[a]).type)i[e]=Ft(i[e],t.name,n);else if(null==n)for(e in i)i[e]=Ft(i[e],t.name,null);return this}for(;++a<u;)if((e=(t=o[a]).type)&&(e=Rt(i[e],t.name)))return e},copy:function(){var t={},n=this._;for(var e in n)t[e]=n[e].slice();return new Dt(t)},call:function(t,n){if((e=arguments.length-2)>0)for(var e,r,i=new Array(e),o=0;o<e;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(o=0,e=(r=this._[t]).length;o<e;++o)r[o].value.apply(n,i)},apply:function(t,n,e){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,o=r.length;i<o;++i)r[i].value.apply(n,e)}};var qt="http://www.w3.org/1999/xhtml",Ut={svg:"http://www.w3.org/2000/svg",xhtml:qt,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function It(t){var n=t+="",e=n.indexOf(":");return e>=0&&"xmlns"!==(n=t.slice(0,e))&&(t=t.slice(e+1)),Ut.hasOwnProperty(n)?{space:Ut[n],local:t}:t}function Ot(t){return function(){var n=this.ownerDocument,e=this.namespaceURI;return e===qt&&n.documentElement.namespaceURI===qt?n.createElement(t):n.createElementNS(e,t)}}function Bt(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function Yt(t){var n=It(t);return(n.local?Bt:Ot)(n)}function Lt(){}function jt(t){return null==t?Lt:function(){return this.querySelector(t)}}function Ht(t){return null==t?[]:Array.isArray(t)?t:Array.from(t)}function Xt(){return[]}function Gt(t){return null==t?Xt:function(){return this.querySelectorAll(t)}}function Vt(t){return function(){return this.matches(t)}}function Wt(t){return function(n){return n.matches(t)}}var Zt=Array.prototype.find;function Kt(){return this.firstElementChild}var Qt=Array.prototype.filter;function Jt(){return Array.from(this.children)}function tn(t){return new Array(t.length)}function nn(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function en(t,n,e,r,i,o){for(var a,u=0,c=n.length,f=o.length;u<f;++u)(a=n[u])?(a.__data__=o[u],r[u]=a):e[u]=new nn(t,o[u]);for(;u<c;++u)(a=n[u])&&(i[u]=a)}function rn(t,n,e,r,i,o,a){var u,c,f,s=new Map,l=n.length,h=o.length,d=new Array(l);for(u=0;u<l;++u)(c=n[u])&&(d[u]=f=a.call(c,c.__data__,u,n)+"",s.has(f)?i[u]=c:s.set(f,c));for(u=0;u<h;++u)f=a.call(t,o[u],u,o)+"",(c=s.get(f))?(r[u]=c,c.__data__=o[u],s.delete(f)):e[u]=new nn(t,o[u]);for(u=0;u<l;++u)(c=n[u])&&s.get(d[u])===c&&(i[u]=c)}function on(t){return t.__data__}function an(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function un(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function cn(t){return function(){this.removeAttribute(t)}}function fn(t){return function(){this.removeAttributeNS(t.space,t.local)}}function sn(t,n){return function(){this.setAttribute(t,n)}}function ln(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function hn(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function dn(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function pn(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function gn(t){return function(){this.style.removeProperty(t)}}function yn(t,n,e){return function(){this.style.setProperty(t,n,e)}}function vn(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function _n(t,n){return t.style.getPropertyValue(n)||pn(t).getComputedStyle(t,null).getPropertyValue(n)}function bn(t){return function(){delete this[t]}}function mn(t,n){return function(){this[t]=n}}function xn(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function wn(t){return t.trim().split(/^|\s+/)}function Mn(t){return t.classList||new Tn(t)}function Tn(t){this._node=t,this._names=wn(t.getAttribute("class")||"")}function An(t,n){for(var e=Mn(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function Sn(t,n){for(var e=Mn(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function En(t){return function(){An(this,t)}}function Nn(t){return function(){Sn(this,t)}}function kn(t,n){return function(){(n.apply(this,arguments)?An:Sn)(this,t)}}function Cn(){this.textContent=""}function Pn(t){return function(){this.textContent=t}}function zn(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function $n(){this.innerHTML=""}function Dn(t){return function(){this.innerHTML=t}}function Rn(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function Fn(){this.nextSibling&&this.parentNode.appendChild(this)}function qn(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function Un(){return null}function In(){var t=this.parentNode;t&&t.removeChild(this)}function On(){var t=this.cloneNode(!1),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function Bn(){var t=this.cloneNode(!0),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function Yn(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.options);++i?n.length=i:delete this.__on}}}function Ln(t,n,e){return function(){var r,i=this.__on,o=function(t){return function(n){t.call(this,n,this.__data__)}}(n);if(i)for(var a=0,u=i.length;a<u;++a)if((r=i[a]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=e),void(r.value=n);this.addEventListener(t.type,o,e),r={type:t.type,name:t.name,value:n,listener:o,options:e},i?i.push(r):this.__on=[r]}}function jn(t,n,e){var r=pn(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function Hn(t,n){return function(){return jn(this,t,n)}}function Xn(t,n){return function(){return jn(this,t,n.apply(this,arguments))}}nn.prototype={constructor:nn,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},Tn.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var Gn=[null];function Vn(t,n){this._groups=t,this._parents=n}function Wn(){return new Vn([[document.documentElement]],Gn)}function Zn(t){return"string"==typeof t?new Vn([[document.querySelector(t)]],[document.documentElement]):new Vn([[t]],Gn)}Vn.prototype=Wn.prototype={constructor:Vn,select:function(t){"function"!=typeof t&&(t=jt(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a,u=n[i],c=u.length,f=r[i]=new Array(c),s=0;s<c;++s)(o=u[s])&&(a=t.call(o,o.__data__,s,u))&&("__data__"in o&&(a.__data__=o.__data__),f[s]=a);return new Vn(r,this._parents)},selectAll:function(t){t="function"==typeof t?function(t){return function(){return Ht(t.apply(this,arguments))}}(t):Gt(t);for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var a,u=n[o],c=u.length,f=0;f<c;++f)(a=u[f])&&(r.push(t.call(a,a.__data__,f,u)),i.push(a));return new Vn(r,i)},selectChild:function(t){return this.select(null==t?Kt:function(t){return function(){return Zt.call(this.children,t)}}("function"==typeof t?t:Wt(t)))},selectChildren:function(t){return this.selectAll(null==t?Jt:function(t){return function(){return Qt.call(this.children,t)}}("function"==typeof t?t:Wt(t)))},filter:function(t){"function"!=typeof t&&(t=Vt(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,c=r[i]=[],f=0;f<u;++f)(o=a[f])&&t.call(o,o.__data__,f,a)&&c.push(o);return new Vn(r,this._parents)},data:function(t,n){if(!arguments.length)return Array.from(this,on);var e=n?rn:en,r=this._parents,i=this._groups;"function"!=typeof t&&(t=function(t){return function(){return t}}(t));for(var o=i.length,a=new Array(o),u=new Array(o),c=new Array(o),f=0;f<o;++f){var s=r[f],l=i[f],h=l.length,d=an(t.call(s,s&&s.__data__,f,r)),p=d.length,g=u[f]=new Array(p),y=a[f]=new Array(p);e(s,l,g,y,c[f]=new Array(h),d,n);for(var v,_,b=0,m=0;b<p;++b)if(v=g[b]){for(b>=m&&(m=b+1);!(_=y[m])&&++m<p;);v._next=_||null}}return(a=new Vn(a,r))._enter=u,a._exit=c,a},enter:function(){return new Vn(this._enter||this._groups.map(tn),this._parents)},exit:function(){return new Vn(this._exit||this._groups.map(tn),this._parents)},join:function(t,n,e){var r=this.enter(),i=this,o=this.exit();return"function"==typeof t?(r=t(r))&&(r=r.selection()):r=r.append(t+""),null!=n&&(i=n(i))&&(i=i.selection()),null==e?o.remove():e(o),r&&i?r.merge(i).order():i},merge:function(t){for(var n=t.selection?t.selection():t,e=this._groups,r=n._groups,i=e.length,o=r.length,a=Math.min(i,o),u=new Array(i),c=0;c<a;++c)for(var f,s=e[c],l=r[c],h=s.length,d=u[c]=new Array(h),p=0;p<h;++p)(f=s[p]||l[p])&&(d[p]=f);for(;c<i;++c)u[c]=e[c];return new Vn(u,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,a=i[o];--o>=0;)(r=i[o])&&(a&&4^r.compareDocumentPosition(a)&&a.parentNode.insertBefore(r,a),a=r);return this},sort:function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=un);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var a,u=e[o],c=u.length,f=i[o]=new Array(c),s=0;s<c;++s)(a=u[s])&&(f[s]=a);f.sort(n)}return new Vn(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var a=r[i];if(a)return a}return null},size:function(){let t=0;for(const n of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],a=0,u=o.length;a<u;++a)(i=o[a])&&t.call(i,i.__data__,a,o);return this},attr:function(t,n){var e=It(t);if(arguments.length<2){var r=this.node();return e.local?r.getAttributeNS(e.space,e.local):r.getAttribute(e)}return this.each((null==n?e.local?fn:cn:"function"==typeof n?e.local?dn:hn:e.local?ln:sn)(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?gn:"function"==typeof n?vn:yn)(t,n,null==e?"":e)):_n(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?bn:"function"==typeof n?xn:mn)(t,n)):this.node()[t]},classed:function(t,n){var e=wn(t+"");if(arguments.length<2){for(var r=Mn(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?kn:n?En:Nn)(e,n))},text:function(t){return arguments.length?this.each(null==t?Cn:("function"==typeof t?zn:Pn)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?$n:("function"==typeof t?Rn:Dn)(t)):this.node().innerHTML},raise:function(){return this.each(Fn)},lower:function(){return this.each(qn)},append:function(t){var n="function"==typeof t?t:Yt(t);return this.select((function(){return this.appendChild(n.apply(this,arguments))}))},insert:function(t,n){var e="function"==typeof t?t:Yt(t),r=null==n?Un:"function"==typeof n?n:jt(n);return this.select((function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)}))},remove:function(){return this.each(In)},clone:function(t){return this.select(t?Bn:On)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=function(t){return t.trim().split(/^|\s+/).map((function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}}))}(t+""),a=o.length;if(!(arguments.length<2)){for(u=n?Ln:Yn,r=0;r<a;++r)this.each(u(o[r],n,e));return this}var u=this.node().__on;if(u)for(var c,f=0,s=u.length;f<s;++f)for(r=0,c=u[f];r<a;++r)if((i=o[r]).type===c.type&&i.name===c.name)return c.value},dispatch:function(t,n){return this.each(("function"==typeof n?Xn:Hn)(t,n))},[Symbol.iterator]:function*(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r,i=t[n],o=0,a=i.length;o<a;++o)(r=i[o])&&(yield r)}};var Kn=0;function Qn(){return new Jn}function Jn(){this._="@"+(++Kn).toString(36)}function te(t){let n;for(;n=t.sourceEvent;)t=n;return t}function ne(t,n){if(t=te(t),void 0===n&&(n=t.currentTarget),n){var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(n.getScreenCTM().inverse())).x,r.y]}if(n.getBoundingClientRect){var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}}return[t.pageX,t.pageY]}Jn.prototype=Qn.prototype={constructor:Jn,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}};const ee={passive:!1},re={capture:!0,passive:!1};function ie(t){t.stopImmediatePropagation()}function oe(t){t.preventDefault(),t.stopImmediatePropagation()}function ae(t){var n=t.document.documentElement,e=Zn(t).on("dragstart.drag",oe,re);"onselectstart"in n?e.on("selectstart.drag",oe,re):(n.__noselect=n.style.MozUserSelect,n.style.MozUserSelect="none")}function ue(t,n){var e=t.document.documentElement,r=Zn(t).on("dragstart.drag",null);n&&(r.on("click.drag",oe,re),setTimeout((function(){r.on("click.drag",null)}),0)),"onselectstart"in e?r.on("selectstart.drag",null):(e.style.MozUserSelect=e.__noselect,delete e.__noselect)}var ce=t=>()=>t;function fe(t,{sourceEvent:n,subject:e,target:r,identifier:i,active:o,x:a,y:u,dx:c,dy:f,dispatch:s}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},subject:{value:e,enumerable:!0,configurable:!0},target:{value:r,enumerable:!0,configurable:!0},identifier:{value:i,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:u,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:f,enumerable:!0,configurable:!0},_:{value:s}})}function se(t){return!t.ctrlKey&&!t.button}function le(){return this.parentNode}function he(t,n){return null==n?{x:t.x,y:t.y}:n}function de(){return navigator.maxTouchPoints||"ontouchstart"in this}function pe(t,n,e){t.prototype=n.prototype=e,e.constructor=t}function ge(t,n){var e=Object.create(t.prototype);for(var r in n)e[r]=n[r];return e}function ye(){}fe.prototype.on=function(){var t=this._.on.apply(this._,arguments);return t===this._?this:t};var ve=.7,_e=1/ve,be="\\s*([+-]?\\d+)\\s*",me="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",xe="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",we=/^#([0-9a-f]{3,8})$/,Me=new RegExp(`^rgb\\(${be},${be},${be}\\)$`),Te=new RegExp(`^rgb\\(${xe},${xe},${xe}\\)$`),Ae=new RegExp(`^rgba\\(${be},${be},${be},${me}\\)$`),Se=new RegExp(`^rgba\\(${xe},${xe},${xe},${me}\\)$`),Ee=new RegExp(`^hsl\\(${me},${xe},${xe}\\)$`),Ne=new RegExp(`^hsla\\(${me},${xe},${xe},${me}\\)$`),ke={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function Ce(){return this.rgb().formatHex()}function Pe(){return this.rgb().formatRgb()}function ze(t){var n,e;return t=(t+"").trim().toLowerCase(),(n=we.exec(t))?(e=n[1].length,n=parseInt(n[1],16),6===e?$e(n):3===e?new qe(n>>8&15|n>>4&240,n>>4&15|240&n,(15&n)<<4|15&n,1):8===e?De(n>>24&255,n>>16&255,n>>8&255,(255&n)/255):4===e?De(n>>12&15|n>>8&240,n>>8&15|n>>4&240,n>>4&15|240&n,((15&n)<<4|15&n)/255):null):(n=Me.exec(t))?new qe(n[1],n[2],n[3],1):(n=Te.exec(t))?new qe(255*n[1]/100,255*n[2]/100,255*n[3]/100,1):(n=Ae.exec(t))?De(n[1],n[2],n[3],n[4]):(n=Se.exec(t))?De(255*n[1]/100,255*n[2]/100,255*n[3]/100,n[4]):(n=Ee.exec(t))?Le(n[1],n[2]/100,n[3]/100,1):(n=Ne.exec(t))?Le(n[1],n[2]/100,n[3]/100,n[4]):ke.hasOwnProperty(t)?$e(ke[t]):"transparent"===t?new qe(NaN,NaN,NaN,0):null}function $e(t){return new qe(t>>16&255,t>>8&255,255&t,1)}function De(t,n,e,r){return r<=0&&(t=n=e=NaN),new qe(t,n,e,r)}function Re(t){return t instanceof ye||(t=ze(t)),t?new qe((t=t.rgb()).r,t.g,t.b,t.opacity):new qe}function Fe(t,n,e,r){return 1===arguments.length?Re(t):new qe(t,n,e,null==r?1:r)}function qe(t,n,e,r){this.r=+t,this.g=+n,this.b=+e,this.opacity=+r}function Ue(){return`#${Ye(this.r)}${Ye(this.g)}${Ye(this.b)}`}function Ie(){const t=Oe(this.opacity);return`${1===t?"rgb(":"rgba("}${Be(this.r)}, ${Be(this.g)}, ${Be(this.b)}${1===t?")":`, ${t})`}`}function Oe(t){return isNaN(t)?1:Math.max(0,Math.min(1,t))}function Be(t){return Math.max(0,Math.min(255,Math.round(t)||0))}function Ye(t){return((t=Be(t))<16?"0":"")+t.toString(16)}function Le(t,n,e,r){return r<=0?t=n=e=NaN:e<=0||e>=1?t=n=NaN:n<=0&&(t=NaN),new Xe(t,n,e,r)}function je(t){if(t instanceof Xe)return new Xe(t.h,t.s,t.l,t.opacity);if(t instanceof ye||(t=ze(t)),!t)return new Xe;if(t instanceof Xe)return t;var n=(t=t.rgb()).r/255,e=t.g/255,r=t.b/255,i=Math.min(n,e,r),o=Math.max(n,e,r),a=NaN,u=o-i,c=(o+i)/2;return u?(a=n===o?(e-r)/u+6*(e<r):e===o?(r-n)/u+2:(n-e)/u+4,u/=c<.5?o+i:2-o-i,a*=60):u=c>0&&c<1?0:a,new Xe(a,u,c,t.opacity)}function He(t,n,e,r){return 1===arguments.length?je(t):new Xe(t,n,e,null==r?1:r)}function Xe(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Ge(t){return(t=(t||0)%360)<0?t+360:t}function Ve(t){return Math.max(0,Math.min(1,t||0))}function We(t,n,e){return 255*(t<60?n+(e-n)*t/60:t<180?e:t<240?n+(e-n)*(240-t)/60:n)}pe(ye,ze,{copy(t){return Object.assign(new this.constructor,this,t)},displayable(){return this.rgb().displayable()},hex:Ce,formatHex:Ce,formatHex8:function(){return this.rgb().formatHex8()},formatHsl:function(){return je(this).formatHsl()},formatRgb:Pe,toString:Pe}),pe(qe,Fe,ge(ye,{brighter(t){return t=null==t?_e:Math.pow(_e,t),new qe(this.r*t,this.g*t,this.b*t,this.opacity)},darker(t){return t=null==t?ve:Math.pow(ve,t),new qe(this.r*t,this.g*t,this.b*t,this.opacity)},rgb(){return this},clamp(){return new qe(Be(this.r),Be(this.g),Be(this.b),Oe(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:Ue,formatHex:Ue,formatHex8:function(){return`#${Ye(this.r)}${Ye(this.g)}${Ye(this.b)}${Ye(255*(isNaN(this.opacity)?1:this.opacity))}`},formatRgb:Ie,toString:Ie})),pe(Xe,He,ge(ye,{brighter(t){return t=null==t?_e:Math.pow(_e,t),new Xe(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?ve:Math.pow(ve,t),new Xe(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=this.h%360+360*(this.h<0),n=isNaN(t)||isNaN(this.s)?0:this.s,e=this.l,r=e+(e<.5?e:1-e)*n,i=2*e-r;return new qe(We(t>=240?t-240:t+120,i,r),We(t,i,r),We(t<120?t+240:t-120,i,r),this.opacity)},clamp(){return new Xe(Ge(this.h),Ve(this.s),Ve(this.l),Oe(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){const t=Oe(this.opacity);return`${1===t?"hsl(":"hsla("}${Ge(this.h)}, ${100*Ve(this.s)}%, ${100*Ve(this.l)}%${1===t?")":`, ${t})`}`}}));const Ze=Math.PI/180,Ke=180/Math.PI,Qe=.96422,Je=1,tr=.82521,nr=4/29,er=6/29,rr=3*er*er,ir=er*er*er;function or(t){if(t instanceof ur)return new ur(t.l,t.a,t.b,t.opacity);if(t instanceof pr)return gr(t);t instanceof qe||(t=Re(t));var n,e,r=lr(t.r),i=lr(t.g),o=lr(t.b),a=cr((.2225045*r+.7168786*i+.0606169*o)/Je);return r===i&&i===o?n=e=a:(n=cr((.4360747*r+.3850649*i+.1430804*o)/Qe),e=cr((.0139322*r+.0971045*i+.7141733*o)/tr)),new ur(116*a-16,500*(n-a),200*(a-e),t.opacity)}function ar(t,n,e,r){return 1===arguments.length?or(t):new ur(t,n,e,null==r?1:r)}function ur(t,n,e,r){this.l=+t,this.a=+n,this.b=+e,this.opacity=+r}function cr(t){return t>ir?Math.pow(t,1/3):t/rr+nr}function fr(t){return t>er?t*t*t:rr*(t-nr)}function sr(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function lr(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function hr(t){if(t instanceof pr)return new pr(t.h,t.c,t.l,t.opacity);if(t instanceof ur||(t=or(t)),0===t.a&&0===t.b)return new pr(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var n=Math.atan2(t.b,t.a)*Ke;return new pr(n<0?n+360:n,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function dr(t,n,e,r){return 1===arguments.length?hr(t):new pr(t,n,e,null==r?1:r)}function pr(t,n,e,r){this.h=+t,this.c=+n,this.l=+e,this.opacity=+r}function gr(t){if(isNaN(t.h))return new ur(t.l,0,0,t.opacity);var n=t.h*Ze;return new ur(t.l,Math.cos(n)*t.c,Math.sin(n)*t.c,t.opacity)}pe(ur,ar,ge(ye,{brighter(t){return new ur(this.l+18*(null==t?1:t),this.a,this.b,this.opacity)},darker(t){return new ur(this.l-18*(null==t?1:t),this.a,this.b,this.opacity)},rgb(){var t=(this.l+16)/116,n=isNaN(this.a)?t:t+this.a/500,e=isNaN(this.b)?t:t-this.b/200;return new qe(sr(3.1338561*(n=Qe*fr(n))-1.6168667*(t=Je*fr(t))-.4906146*(e=tr*fr(e))),sr(-.9787684*n+1.9161415*t+.033454*e),sr(.0719453*n-.2289914*t+1.4052427*e),this.opacity)}})),pe(pr,dr,ge(ye,{brighter(t){return new pr(this.h,this.c,this.l+18*(null==t?1:t),this.opacity)},darker(t){return new pr(this.h,this.c,this.l-18*(null==t?1:t),this.opacity)},rgb(){return gr(this).rgb()}}));var yr=-.14861,vr=1.78277,_r=-.29227,br=-.90649,mr=1.97294,xr=mr*br,wr=mr*vr,Mr=vr*_r-br*yr;function Tr(t,n,e,r){return 1===arguments.length?function(t){if(t instanceof Ar)return new Ar(t.h,t.s,t.l,t.opacity);t instanceof qe||(t=Re(t));var n=t.r/255,e=t.g/255,r=t.b/255,i=(Mr*r+xr*n-wr*e)/(Mr+xr-wr),o=r-i,a=(mr*(e-i)-_r*o)/br,u=Math.sqrt(a*a+o*o)/(mr*i*(1-i)),c=u?Math.atan2(a,o)*Ke-120:NaN;return new Ar(c<0?c+360:c,u,i,t.opacity)}(t):new Ar(t,n,e,null==r?1:r)}function Ar(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Sr(t,n,e,r,i){var o=t*t,a=o*t;return((1-3*t+3*o-a)*n+(4-6*o+3*a)*e+(1+3*t+3*o-3*a)*r+a*i)/6}function Er(t){var n=t.length-1;return function(e){var r=e<=0?e=0:e>=1?(e=1,n-1):Math.floor(e*n),i=t[r],o=t[r+1],a=r>0?t[r-1]:2*i-o,u=r<n-1?t[r+2]:2*o-i;return Sr((e-r/n)*n,a,i,o,u)}}function Nr(t){var n=t.length;return function(e){var r=Math.floor(((e%=1)<0?++e:e)*n),i=t[(r+n-1)%n],o=t[r%n],a=t[(r+1)%n],u=t[(r+2)%n];return Sr((e-r/n)*n,i,o,a,u)}}pe(Ar,Tr,ge(ye,{brighter(t){return t=null==t?_e:Math.pow(_e,t),new Ar(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?ve:Math.pow(ve,t),new Ar(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=isNaN(this.h)?0:(this.h+120)*Ze,n=+this.l,e=isNaN(this.s)?0:this.s*n*(1-n),r=Math.cos(t),i=Math.sin(t);return new qe(255*(n+e*(yr*r+vr*i)),255*(n+e*(_r*r+br*i)),255*(n+e*(mr*r)),this.opacity)}}));var kr=t=>()=>t;function Cr(t,n){return function(e){return t+e*n}}function Pr(t,n){var e=n-t;return e?Cr(t,e>180||e<-180?e-360*Math.round(e/360):e):kr(isNaN(t)?n:t)}function zr(t){return 1==(t=+t)?$r:function(n,e){return e-n?function(t,n,e){return t=Math.pow(t,e),n=Math.pow(n,e)-t,e=1/e,function(r){return Math.pow(t+r*n,e)}}(n,e,t):kr(isNaN(n)?e:n)}}function $r(t,n){var e=n-t;return e?Cr(t,e):kr(isNaN(t)?n:t)}var Dr=function t(n){var e=zr(n);function r(t,n){var r=e((t=Fe(t)).r,(n=Fe(n)).r),i=e(t.g,n.g),o=e(t.b,n.b),a=$r(t.opacity,n.opacity);return function(n){return t.r=r(n),t.g=i(n),t.b=o(n),t.opacity=a(n),t+""}}return r.gamma=t,r}(1);function Rr(t){return function(n){var e,r,i=n.length,o=new Array(i),a=new Array(i),u=new Array(i);for(e=0;e<i;++e)r=Fe(n[e]),o[e]=r.r||0,a[e]=r.g||0,u[e]=r.b||0;return o=t(o),a=t(a),u=t(u),r.opacity=1,function(t){return r.r=o(t),r.g=a(t),r.b=u(t),r+""}}}var Fr=Rr(Er),qr=Rr(Nr);function Ur(t,n){n||(n=[]);var e,r=t?Math.min(n.length,t.length):0,i=n.slice();return function(o){for(e=0;e<r;++e)i[e]=t[e]*(1-o)+n[e]*o;return i}}function Ir(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Or(t,n){var e,r=n?n.length:0,i=t?Math.min(r,t.length):0,o=new Array(i),a=new Array(r);for(e=0;e<i;++e)o[e]=Gr(t[e],n[e]);for(;e<r;++e)a[e]=n[e];return function(t){for(e=0;e<i;++e)a[e]=o[e](t);return a}}function Br(t,n){var e=new Date;return t=+t,n=+n,function(r){return e.setTime(t*(1-r)+n*r),e}}function Yr(t,n){return t=+t,n=+n,function(e){return t*(1-e)+n*e}}function Lr(t,n){var e,r={},i={};for(e in null!==t&&"object"==typeof t||(t={}),null!==n&&"object"==typeof n||(n={}),n)e in t?r[e]=Gr(t[e],n[e]):i[e]=n[e];return function(t){for(e in r)i[e]=r[e](t);return i}}var jr=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,Hr=new RegExp(jr.source,"g");function Xr(t,n){var e,r,i,o=jr.lastIndex=Hr.lastIndex=0,a=-1,u=[],c=[];for(t+="",n+="";(e=jr.exec(t))&&(r=Hr.exec(n));)(i=r.index)>o&&(i=n.slice(o,i),u[a]?u[a]+=i:u[++a]=i),(e=e[0])===(r=r[0])?u[a]?u[a]+=r:u[++a]=r:(u[++a]=null,c.push({i:a,x:Yr(e,r)})),o=Hr.lastIndex;return o<n.length&&(i=n.slice(o),u[a]?u[a]+=i:u[++a]=i),u.length<2?c[0]?function(t){return function(n){return t(n)+""}}(c[0].x):function(t){return function(){return t}}(n):(n=c.length,function(t){for(var e,r=0;r<n;++r)u[(e=c[r]).i]=e.x(t);return u.join("")})}function Gr(t,n){var e,r=typeof n;return null==n||"boolean"===r?kr(n):("number"===r?Yr:"string"===r?(e=ze(n))?(n=e,Dr):Xr:n instanceof ze?Dr:n instanceof Date?Br:Ir(n)?Ur:Array.isArray(n)?Or:"function"!=typeof n.valueOf&&"function"!=typeof n.toString||isNaN(n)?Lr:Yr)(t,n)}function Vr(t,n){return t=+t,n=+n,function(e){return Math.round(t*(1-e)+n*e)}}var Wr,Zr=180/Math.PI,Kr={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Qr(t,n,e,r,i,o){var a,u,c;return(a=Math.sqrt(t*t+n*n))&&(t/=a,n/=a),(c=t*e+n*r)&&(e-=t*c,r-=n*c),(u=Math.sqrt(e*e+r*r))&&(e/=u,r/=u,c/=u),t*r<n*e&&(t=-t,n=-n,c=-c,a=-a),{translateX:i,translateY:o,rotate:Math.atan2(n,t)*Zr,skewX:Math.atan(c)*Zr,scaleX:a,scaleY:u}}function Jr(t,n,e,r){function i(t){return t.length?t.pop()+" ":""}return function(o,a){var u=[],c=[];return o=t(o),a=t(a),function(t,r,i,o,a,u){if(t!==i||r!==o){var c=a.push("translate(",null,n,null,e);u.push({i:c-4,x:Yr(t,i)},{i:c-2,x:Yr(r,o)})}else(i||o)&&a.push("translate("+i+n+o+e)}(o.translateX,o.translateY,a.translateX,a.translateY,u,c),function(t,n,e,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:e.push(i(e)+"rotate(",null,r)-2,x:Yr(t,n)})):n&&e.push(i(e)+"rotate("+n+r)}(o.rotate,a.rotate,u,c),function(t,n,e,o){t!==n?o.push({i:e.push(i(e)+"skewX(",null,r)-2,x:Yr(t,n)}):n&&e.push(i(e)+"skewX("+n+r)}(o.skewX,a.skewX,u,c),function(t,n,e,r,o,a){if(t!==e||n!==r){var u=o.push(i(o)+"scale(",null,",",null,")");a.push({i:u-4,x:Yr(t,e)},{i:u-2,x:Yr(n,r)})}else 1===e&&1===r||o.push(i(o)+"scale("+e+","+r+")")}(o.scaleX,o.scaleY,a.scaleX,a.scaleY,u,c),o=a=null,function(t){for(var n,e=-1,r=c.length;++e<r;)u[(n=c[e]).i]=n.x(t);return u.join("")}}}var ti=Jr((function(t){const n=new("function"==typeof DOMMatrix?DOMMatrix:WebKitCSSMatrix)(t+"");return n.isIdentity?Kr:Qr(n.a,n.b,n.c,n.d,n.e,n.f)}),"px, ","px)","deg)"),ni=Jr((function(t){return null==t?Kr:(Wr||(Wr=document.createElementNS("http://www.w3.org/2000/svg","g")),Wr.setAttribute("transform",t),(t=Wr.transform.baseVal.consolidate())?Qr((t=t.matrix).a,t.b,t.c,t.d,t.e,t.f):Kr)}),", ",")",")");function ei(t){return((t=Math.exp(t))+1/t)/2}var ri=function t(n,e,r){function i(t,i){var o,a,u=t[0],c=t[1],f=t[2],s=i[0],l=i[1],h=i[2],d=s-u,p=l-c,g=d*d+p*p;if(g<1e-12)a=Math.log(h/f)/n,o=function(t){return[u+t*d,c+t*p,f*Math.exp(n*t*a)]};else{var y=Math.sqrt(g),v=(h*h-f*f+r*g)/(2*f*e*y),_=(h*h-f*f-r*g)/(2*h*e*y),b=Math.log(Math.sqrt(v*v+1)-v),m=Math.log(Math.sqrt(_*_+1)-_);a=(m-b)/n,o=function(t){var r=t*a,i=ei(b),o=f/(e*y)*(i*function(t){return((t=Math.exp(2*t))-1)/(t+1)}(n*r+b)-function(t){return((t=Math.exp(t))-1/t)/2}(b));return[u+o*d,c+o*p,f*i/ei(n*r+b)]}}return o.duration=1e3*a*n/Math.SQRT2,o}return i.rho=function(n){var e=Math.max(.001,+n),r=e*e;return t(e,r,r*r)},i}(Math.SQRT2,2,4);function ii(t){return function(n,e){var r=t((n=He(n)).h,(e=He(e)).h),i=$r(n.s,e.s),o=$r(n.l,e.l),a=$r(n.opacity,e.opacity);return function(t){return n.h=r(t),n.s=i(t),n.l=o(t),n.opacity=a(t),n+""}}}var oi=ii(Pr),ai=ii($r);function ui(t){return function(n,e){var r=t((n=dr(n)).h,(e=dr(e)).h),i=$r(n.c,e.c),o=$r(n.l,e.l),a=$r(n.opacity,e.opacity);return function(t){return n.h=r(t),n.c=i(t),n.l=o(t),n.opacity=a(t),n+""}}}var ci=ui(Pr),fi=ui($r);function si(t){return function n(e){function r(n,r){var i=t((n=Tr(n)).h,(r=Tr(r)).h),o=$r(n.s,r.s),a=$r(n.l,r.l),u=$r(n.opacity,r.opacity);return function(t){return n.h=i(t),n.s=o(t),n.l=a(Math.pow(t,e)),n.opacity=u(t),n+""}}return e=+e,r.gamma=n,r}(1)}var li=si(Pr),hi=si($r);function di(t,n){void 0===n&&(n=t,t=Gr);for(var e=0,r=n.length-1,i=n[0],o=new Array(r<0?0:r);e<r;)o[e]=t(i,i=n[++e]);return function(t){var n=Math.max(0,Math.min(r-1,Math.floor(t*=r)));return o[n](t-n)}}var pi,gi,yi=0,vi=0,_i=0,bi=1e3,mi=0,xi=0,wi=0,Mi="object"==typeof performance&&performance.now?performance:Date,Ti="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function Ai(){return xi||(Ti(Si),xi=Mi.now()+wi)}function Si(){xi=0}function Ei(){this._call=this._time=this._next=null}function Ni(t,n,e){var r=new Ei;return r.restart(t,n,e),r}function ki(){Ai(),++yi;for(var t,n=pi;n;)(t=xi-n._time)>=0&&n._call.call(void 0,t),n=n._next;--yi}function Ci(){xi=(mi=Mi.now())+wi,yi=vi=0;try{ki()}finally{yi=0,function(){var t,n,e=pi,r=1/0;for(;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(n=e._next,e._next=null,e=t?t._next=n:pi=n);gi=t,zi(r)}(),xi=0}}function Pi(){var t=Mi.now(),n=t-mi;n>bi&&(wi-=n,mi=t)}function zi(t){yi||(vi&&(vi=clearTimeout(vi)),t-xi>24?(t<1/0&&(vi=setTimeout(Ci,t-Mi.now()-wi)),_i&&(_i=clearInterval(_i))):(_i||(mi=Mi.now(),_i=setInterval(Pi,bi)),yi=1,Ti(Ci)))}function $i(t,n,e){var r=new Ei;return n=null==n?0:+n,r.restart((e=>{r.stop(),t(e+n)}),n,e),r}Ei.prototype=Ni.prototype={constructor:Ei,restart:function(t,n,e){if("function"!=typeof t)throw new TypeError("callback is not a function");e=(null==e?Ai():+e)+(null==n?0:+n),this._next||gi===this||(gi?gi._next=this:pi=this,gi=this),this._call=t,this._time=e,zi()},stop:function(){this._call&&(this._call=null,this._time=1/0,zi())}};var Di=$t("start","end","cancel","interrupt"),Ri=[],Fi=0,qi=1,Ui=2,Ii=3,Oi=4,Bi=5,Yi=6;function Li(t,n,e,r,i,o){var a=t.__transition;if(a){if(e in a)return}else t.__transition={};!function(t,n,e){var r,i=t.__transition;function o(t){e.state=qi,e.timer.restart(a,e.delay,e.time),e.delay<=t&&a(t-e.delay)}function a(o){var f,s,l,h;if(e.state!==qi)return c();for(f in i)if((h=i[f]).name===e.name){if(h.state===Ii)return $i(a);h.state===Oi?(h.state=Yi,h.timer.stop(),h.on.call("interrupt",t,t.__data__,h.index,h.group),delete i[f]):+f<n&&(h.state=Yi,h.timer.stop(),h.on.call("cancel",t,t.__data__,h.index,h.group),delete i[f])}if($i((function(){e.state===Ii&&(e.state=Oi,e.timer.restart(u,e.delay,e.time),u(o))})),e.state=Ui,e.on.call("start",t,t.__data__,e.index,e.group),e.state===Ui){for(e.state=Ii,r=new Array(l=e.tween.length),f=0,s=-1;f<l;++f)(h=e.tween[f].value.call(t,t.__data__,e.index,e.group))&&(r[++s]=h);r.length=s+1}}function u(n){for(var i=n<e.duration?e.ease.call(null,n/e.duration):(e.timer.restart(c),e.state=Bi,1),o=-1,a=r.length;++o<a;)r[o].call(t,i);e.state===Bi&&(e.on.call("end",t,t.__data__,e.index,e.group),c())}function c(){for(var r in e.state=Yi,e.timer.stop(),delete i[n],i)return;delete t.__transition}i[n]=e,e.timer=Ni(o,0,e.time)}(t,e,{name:n,index:r,group:i,on:Di,tween:Ri,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:Fi})}function ji(t,n){var e=Xi(t,n);if(e.state>Fi)throw new Error("too late; already scheduled");return e}function Hi(t,n){var e=Xi(t,n);if(e.state>Ii)throw new Error("too late; already running");return e}function Xi(t,n){var e=t.__transition;if(!e||!(e=e[n]))throw new Error("transition not found");return e}function Gi(t,n){var e,r,i,o=t.__transition,a=!0;if(o){for(i in n=null==n?null:n+"",o)(e=o[i]).name===n?(r=e.state>Ui&&e.state<Bi,e.state=Yi,e.timer.stop(),e.on.call(r?"interrupt":"cancel",t,t.__data__,e.index,e.group),delete o[i]):a=!1;a&&delete t.__transition}}function Vi(t,n){var e,r;return function(){var i=Hi(this,t),o=i.tween;if(o!==e)for(var a=0,u=(r=e=o).length;a<u;++a)if(r[a].name===n){(r=r.slice()).splice(a,1);break}i.tween=r}}function Wi(t,n,e){var r,i;if("function"!=typeof e)throw new Error;return function(){var o=Hi(this,t),a=o.tween;if(a!==r){i=(r=a).slice();for(var u={name:n,value:e},c=0,f=i.length;c<f;++c)if(i[c].name===n){i[c]=u;break}c===f&&i.push(u)}o.tween=i}}function Zi(t,n,e){var r=t._id;return t.each((function(){var t=Hi(this,r);(t.value||(t.value={}))[n]=e.apply(this,arguments)})),function(t){return Xi(t,r).value[n]}}function Ki(t,n){var e;return("number"==typeof n?Yr:n instanceof ze?Dr:(e=ze(n))?(n=e,Dr):Xr)(t,n)}function Qi(t){return function(){this.removeAttribute(t)}}function Ji(t){return function(){this.removeAttributeNS(t.space,t.local)}}function to(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttribute(t);return a===o?null:a===r?i:i=n(r=a,e)}}function no(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttributeNS(t.space,t.local);return a===o?null:a===r?i:i=n(r=a,e)}}function eo(t,n,e){var r,i,o;return function(){var a,u,c=e(this);if(null!=c)return(a=this.getAttribute(t))===(u=c+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,c));this.removeAttribute(t)}}function ro(t,n,e){var r,i,o;return function(){var a,u,c=e(this);if(null!=c)return(a=this.getAttributeNS(t.space,t.local))===(u=c+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,c));this.removeAttributeNS(t.space,t.local)}}function io(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttributeNS(t.space,t.local,n.call(this,e))}}(t,i)),e}return i._value=n,i}function oo(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttribute(t,n.call(this,e))}}(t,i)),e}return i._value=n,i}function ao(t,n){return function(){ji(this,t).delay=+n.apply(this,arguments)}}function uo(t,n){return n=+n,function(){ji(this,t).delay=n}}function co(t,n){return function(){Hi(this,t).duration=+n.apply(this,arguments)}}function fo(t,n){return n=+n,function(){Hi(this,t).duration=n}}var so=Wn.prototype.constructor;function lo(t){return function(){this.style.removeProperty(t)}}var ho=0;function po(t,n,e,r){this._groups=t,this._parents=n,this._name=e,this._id=r}function go(t){return Wn().transition(t)}function yo(){return++ho}var vo=Wn.prototype;po.prototype=go.prototype={constructor:po,select:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=jt(t));for(var r=this._groups,i=r.length,o=new Array(i),a=0;a<i;++a)for(var u,c,f=r[a],s=f.length,l=o[a]=new Array(s),h=0;h<s;++h)(u=f[h])&&(c=t.call(u,u.__data__,h,f))&&("__data__"in u&&(c.__data__=u.__data__),l[h]=c,Li(l[h],n,e,h,l,Xi(u,e)));return new po(o,this._parents,n,e)},selectAll:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=Gt(t));for(var r=this._groups,i=r.length,o=[],a=[],u=0;u<i;++u)for(var c,f=r[u],s=f.length,l=0;l<s;++l)if(c=f[l]){for(var h,d=t.call(c,c.__data__,l,f),p=Xi(c,e),g=0,y=d.length;g<y;++g)(h=d[g])&&Li(h,n,e,g,d,p);o.push(d),a.push(c)}return new po(o,a,n,e)},selectChild:vo.selectChild,selectChildren:vo.selectChildren,filter:function(t){"function"!=typeof t&&(t=Vt(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,c=r[i]=[],f=0;f<u;++f)(o=a[f])&&t.call(o,o.__data__,f,a)&&c.push(o);return new po(r,this._parents,this._name,this._id)},merge:function(t){if(t._id!==this._id)throw new Error;for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),a=new Array(r),u=0;u<o;++u)for(var c,f=n[u],s=e[u],l=f.length,h=a[u]=new Array(l),d=0;d<l;++d)(c=f[d]||s[d])&&(h[d]=c);for(;u<r;++u)a[u]=n[u];return new po(a,this._parents,this._name,this._id)},selection:function(){return new so(this._groups,this._parents)},transition:function(){for(var t=this._name,n=this._id,e=yo(),r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],c=u.length,f=0;f<c;++f)if(a=u[f]){var s=Xi(a,n);Li(a,t,e,f,u,{time:s.time+s.delay+s.duration,delay:0,duration:s.duration,ease:s.ease})}return new po(r,this._parents,t,e)},call:vo.call,nodes:vo.nodes,node:vo.node,size:vo.size,empty:vo.empty,each:vo.each,on:function(t,n){var e=this._id;return arguments.length<2?Xi(this.node(),e).on.on(t):this.each(function(t,n,e){var r,i,o=function(t){return(t+"").trim().split(/^|\s+/).every((function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||"start"===t}))}(n)?ji:Hi;return function(){var a=o(this,t),u=a.on;u!==r&&(i=(r=u).copy()).on(n,e),a.on=i}}(e,t,n))},attr:function(t,n){var e=It(t),r="transform"===e?ni:Ki;return this.attrTween(t,"function"==typeof n?(e.local?ro:eo)(e,r,Zi(this,"attr."+t,n)):null==n?(e.local?Ji:Qi)(e):(e.local?no:to)(e,r,n))},attrTween:function(t,n){var e="attr."+t;if(arguments.length<2)return(e=this.tween(e))&&e._value;if(null==n)return this.tween(e,null);if("function"!=typeof n)throw new Error;var r=It(t);return this.tween(e,(r.local?io:oo)(r,n))},style:function(t,n,e){var r="transform"==(t+="")?ti:Ki;return null==n?this.styleTween(t,function(t,n){var e,r,i;return function(){var o=_n(this,t),a=(this.style.removeProperty(t),_n(this,t));return o===a?null:o===e&&a===r?i:i=n(e=o,r=a)}}(t,r)).on("end.style."+t,lo(t)):"function"==typeof n?this.styleTween(t,function(t,n,e){var r,i,o;return function(){var a=_n(this,t),u=e(this),c=u+"";return null==u&&(this.style.removeProperty(t),c=u=_n(this,t)),a===c?null:a===r&&c===i?o:(i=c,o=n(r=a,u))}}(t,r,Zi(this,"style."+t,n))).each(function(t,n){var e,r,i,o,a="style."+n,u="end."+a;return function(){var c=Hi(this,t),f=c.on,s=null==c.value[a]?o||(o=lo(n)):void 0;f===e&&i===s||(r=(e=f).copy()).on(u,i=s),c.on=r}}(this._id,t)):this.styleTween(t,function(t,n,e){var r,i,o=e+"";return function(){var a=_n(this,t);return a===o?null:a===r?i:i=n(r=a,e)}}(t,r,n),e).on("end.style."+t,null)},styleTween:function(t,n,e){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==n)return this.tween(r,null);if("function"!=typeof n)throw new Error;return this.tween(r,function(t,n,e){var r,i;function o(){var o=n.apply(this,arguments);return o!==i&&(r=(i=o)&&function(t,n,e){return function(r){this.style.setProperty(t,n.call(this,r),e)}}(t,o,e)),r}return o._value=n,o}(t,n,null==e?"":e))},text:function(t){return this.tween("text","function"==typeof t?function(t){return function(){var n=t(this);this.textContent=null==n?"":n}}(Zi(this,"text",t)):function(t){return function(){this.textContent=t}}(null==t?"":t+""))},textTween:function(t){var n="text";if(arguments.length<1)return(n=this.tween(n))&&n._value;if(null==t)return this.tween(n,null);if("function"!=typeof t)throw new Error;return this.tween(n,function(t){var n,e;function r(){var r=t.apply(this,arguments);return r!==e&&(n=(e=r)&&function(t){return function(n){this.textContent=t.call(this,n)}}(r)),n}return r._value=t,r}(t))},remove:function(){return this.on("end.remove",function(t){return function(){var n=this.parentNode;for(var e in this.__transition)if(+e!==t)return;n&&n.removeChild(this)}}(this._id))},tween:function(t,n){var e=this._id;if(t+="",arguments.length<2){for(var r,i=Xi(this.node(),e).tween,o=0,a=i.length;o<a;++o)if((r=i[o]).name===t)return r.value;return null}return this.each((null==n?Vi:Wi)(e,t,n))},delay:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?ao:uo)(n,t)):Xi(this.node(),n).delay},duration:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?co:fo)(n,t)):Xi(this.node(),n).duration},ease:function(t){var n=this._id;return arguments.length?this.each(function(t,n){if("function"!=typeof n)throw new Error;return function(){Hi(this,t).ease=n}}(n,t)):Xi(this.node(),n).ease},easeVarying:function(t){if("function"!=typeof t)throw new Error;return this.each(function(t,n){return function(){var e=n.apply(this,arguments);if("function"!=typeof e)throw new Error;Hi(this,t).ease=e}}(this._id,t))},end:function(){var t,n,e=this,r=e._id,i=e.size();return new Promise((function(o,a){var u={value:a},c={value:function(){0==--i&&o()}};e.each((function(){var e=Hi(this,r),i=e.on;i!==t&&((n=(t=i).copy())._.cancel.push(u),n._.interrupt.push(u),n._.end.push(c)),e.on=n})),0===i&&o()}))},[Symbol.iterator]:vo[Symbol.iterator]};function _o(t){return((t*=2)<=1?t*t:--t*(2-t)+1)/2}function bo(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}var mo=function t(n){function e(t){return Math.pow(t,n)}return n=+n,e.exponent=t,e}(3),xo=function t(n){function e(t){return 1-Math.pow(1-t,n)}return n=+n,e.exponent=t,e}(3),wo=function t(n){function e(t){return((t*=2)<=1?Math.pow(t,n):2-Math.pow(2-t,n))/2}return n=+n,e.exponent=t,e}(3),Mo=Math.PI,To=Mo/2;function Ao(t){return(1-Math.cos(Mo*t))/2}function So(t){return 1.0009775171065494*(Math.pow(2,-10*t)-.0009765625)}function Eo(t){return((t*=2)<=1?So(1-t):2-So(t-1))/2}function No(t){return((t*=2)<=1?1-Math.sqrt(1-t*t):Math.sqrt(1-(t-=2)*t)+1)/2}var ko=4/11,Co=6/11,Po=8/11,zo=3/4,$o=9/11,Do=10/11,Ro=15/16,Fo=21/22,qo=63/64,Uo=1/ko/ko;function Io(t){return(t=+t)<ko?Uo*t*t:t<Po?Uo*(t-=Co)*t+zo:t<Do?Uo*(t-=$o)*t+Ro:Uo*(t-=Fo)*t+qo}var Oo=1.70158,Bo=function t(n){function e(t){return(t=+t)*t*(n*(t-1)+t)}return n=+n,e.overshoot=t,e}(Oo),Yo=function t(n){function e(t){return--t*t*((t+1)*n+t)+1}return n=+n,e.overshoot=t,e}(Oo),Lo=function t(n){function e(t){return((t*=2)<1?t*t*((n+1)*t-n):(t-=2)*t*((n+1)*t+n)+2)/2}return n=+n,e.overshoot=t,e}(Oo),jo=2*Math.PI,Ho=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=jo);function i(t){return n*So(- --t)*Math.sin((r-t)/e)}return i.amplitude=function(n){return t(n,e*jo)},i.period=function(e){return t(n,e)},i}(1,.3),Xo=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=jo);function i(t){return 1-n*So(t=+t)*Math.sin((t+r)/e)}return i.amplitude=function(n){return t(n,e*jo)},i.period=function(e){return t(n,e)},i}(1,.3),Go=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=jo);function i(t){return((t=2*t-1)<0?n*So(-t)*Math.sin((r-t)/e):2-n*So(t)*Math.sin((r+t)/e))/2}return i.amplitude=function(n){return t(n,e*jo)},i.period=function(e){return t(n,e)},i}(1,.3),Vo={time:null,delay:0,duration:250,ease:bo};function Wo(t,n){for(var e;!(e=t.__transition)||!(e=e[n]);)if(!(t=t.parentNode))throw new Error(`transition ${n} not found`);return e}Wn.prototype.interrupt=function(t){return this.each((function(){Gi(this,t)}))},Wn.prototype.transition=function(t){var n,e;t instanceof po?(n=t._id,t=t._name):(n=yo(),(e=Vo).time=Ai(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],c=u.length,f=0;f<c;++f)(a=u[f])&&Li(a,t,n,f,u,e||Wo(a,n));return new po(r,this._parents,t,n)};var Zo=[null];var Ko=t=>()=>t;function Qo(t,{sourceEvent:n,target:e,selection:r,mode:i,dispatch:o}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},target:{value:e,enumerable:!0,configurable:!0},selection:{value:r,enumerable:!0,configurable:!0},mode:{value:i,enumerable:!0,configurable:!0},_:{value:o}})}function Jo(t){t.preventDefault(),t.stopImmediatePropagation()}var ta={name:"drag"},na={name:"space"},ea={name:"handle"},ra={name:"center"};const{abs:ia,max:oa,min:aa}=Math;function ua(t){return[+t[0],+t[1]]}function ca(t){return[ua(t[0]),ua(t[1])]}var fa={name:"x",handles:["w","e"].map(va),input:function(t,n){return null==t?null:[[+t[0],n[0][1]],[+t[1],n[1][1]]]},output:function(t){return t&&[t[0][0],t[1][0]]}},sa={name:"y",handles:["n","s"].map(va),input:function(t,n){return null==t?null:[[n[0][0],+t[0]],[n[1][0],+t[1]]]},output:function(t){return t&&[t[0][1],t[1][1]]}},la={name:"xy",handles:["n","w","e","s","nw","ne","sw","se"].map(va),input:function(t){return null==t?null:ca(t)},output:function(t){return t}},ha={overlay:"crosshair",selection:"move",n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},da={e:"w",w:"e",nw:"ne",ne:"nw",se:"sw",sw:"se"},pa={n:"s",s:"n",nw:"sw",ne:"se",se:"ne",sw:"nw"},ga={overlay:1,selection:1,n:null,e:1,s:null,w:-1,nw:-1,ne:1,se:1,sw:-1},ya={overlay:1,selection:1,n:-1,e:null,s:1,w:null,nw:-1,ne:-1,se:1,sw:1};function va(t){return{type:t}}function _a(t){return!t.ctrlKey&&!t.button}function ba(){var t=this.ownerSVGElement||this;return t.hasAttribute("viewBox")?[[(t=t.viewBox.baseVal).x,t.y],[t.x+t.width,t.y+t.height]]:[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]}function ma(){return navigator.maxTouchPoints||"ontouchstart"in this}function xa(t){for(;!t.__brush;)if(!(t=t.parentNode))return;return t.__brush}function wa(t){var n,e=ba,r=_a,i=ma,o=!0,a=$t("start","brush","end"),u=6;function c(n){var e=n.property("__brush",g).selectAll(".overlay").data([va("overlay")]);e.enter().append("rect").attr("class","overlay").attr("pointer-events","all").attr("cursor",ha.overlay).merge(e).each((function(){var t=xa(this).extent;Zn(this).attr("x",t[0][0]).attr("y",t[0][1]).attr("width",t[1][0]-t[0][0]).attr("height",t[1][1]-t[0][1])})),n.selectAll(".selection").data([va("selection")]).enter().append("rect").attr("class","selection").attr("cursor",ha.selection).attr("fill","#777").attr("fill-opacity",.3).attr("stroke","#fff").attr("shape-rendering","crispEdges");var r=n.selectAll(".handle").data(t.handles,(function(t){return t.type}));r.exit().remove(),r.enter().append("rect").attr("class",(function(t){return"handle handle--"+t.type})).attr("cursor",(function(t){return ha[t.type]})),n.each(f).attr("fill","none").attr("pointer-events","all").on("mousedown.brush",h).filter(i).on("touchstart.brush",h).on("touchmove.brush",d).on("touchend.brush touchcancel.brush",p).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function f(){var t=Zn(this),n=xa(this).selection;n?(t.selectAll(".selection").style("display",null).attr("x",n[0][0]).attr("y",n[0][1]).attr("width",n[1][0]-n[0][0]).attr("height",n[1][1]-n[0][1]),t.selectAll(".handle").style("display",null).attr("x",(function(t){return"e"===t.type[t.type.length-1]?n[1][0]-u/2:n[0][0]-u/2})).attr("y",(function(t){return"s"===t.type[0]?n[1][1]-u/2:n[0][1]-u/2})).attr("width",(function(t){return"n"===t.type||"s"===t.type?n[1][0]-n[0][0]+u:u})).attr("height",(function(t){return"e"===t.type||"w"===t.type?n[1][1]-n[0][1]+u:u}))):t.selectAll(".selection,.handle").style("display","none").attr("x",null).attr("y",null).attr("width",null).attr("height",null)}function s(t,n,e){var r=t.__brush.emitter;return!r||e&&r.clean?new l(t,n,e):r}function l(t,n,e){this.that=t,this.args=n,this.state=t.__brush,this.active=0,this.clean=e}function h(e){if((!n||e.touches)&&r.apply(this,arguments)){var i,a,u,c,l,h,d,p,g,y,v,_=this,b=e.target.__data__.type,m="selection"===(o&&e.metaKey?b="overlay":b)?ta:o&&e.altKey?ra:ea,x=t===sa?null:ga[b],w=t===fa?null:ya[b],M=xa(_),T=M.extent,A=M.selection,S=T[0][0],E=T[0][1],N=T[1][0],k=T[1][1],C=0,P=0,z=x&&w&&o&&e.shiftKey,$=Array.from(e.touches||[e],(t=>{const n=t.identifier;return(t=ne(t,_)).point0=t.slice(),t.identifier=n,t}));Gi(_);var D=s(_,arguments,!0).beforestart();if("overlay"===b){A&&(g=!0);const n=[$[0],$[1]||$[0]];M.selection=A=[[i=t===sa?S:aa(n[0][0],n[1][0]),u=t===fa?E:aa(n[0][1],n[1][1])],[l=t===sa?N:oa(n[0][0],n[1][0]),d=t===fa?k:oa(n[0][1],n[1][1])]],$.length>1&&I(e)}else i=A[0][0],u=A[0][1],l=A[1][0],d=A[1][1];a=i,c=u,h=l,p=d;var R=Zn(_).attr("pointer-events","none"),F=R.selectAll(".overlay").attr("cursor",ha[b]);if(e.touches)D.moved=U,D.ended=O;else{var q=Zn(e.view).on("mousemove.brush",U,!0).on("mouseup.brush",O,!0);o&&q.on("keydown.brush",(function(t){switch(t.keyCode){case 16:z=x&&w;break;case 18:m===ea&&(x&&(l=h-C*x,i=a+C*x),w&&(d=p-P*w,u=c+P*w),m=ra,I(t));break;case 32:m!==ea&&m!==ra||(x<0?l=h-C:x>0&&(i=a-C),w<0?d=p-P:w>0&&(u=c-P),m=na,F.attr("cursor",ha.selection),I(t));break;default:return}Jo(t)}),!0).on("keyup.brush",(function(t){switch(t.keyCode){case 16:z&&(y=v=z=!1,I(t));break;case 18:m===ra&&(x<0?l=h:x>0&&(i=a),w<0?d=p:w>0&&(u=c),m=ea,I(t));break;case 32:m===na&&(t.altKey?(x&&(l=h-C*x,i=a+C*x),w&&(d=p-P*w,u=c+P*w),m=ra):(x<0?l=h:x>0&&(i=a),w<0?d=p:w>0&&(u=c),m=ea),F.attr("cursor",ha[b]),I(t));break;default:return}Jo(t)}),!0),ae(e.view)}f.call(_),D.start(e,m.name)}function U(t){for(const n of t.changedTouches||[t])for(const t of $)t.identifier===n.identifier&&(t.cur=ne(n,_));if(z&&!y&&!v&&1===$.length){const t=$[0];ia(t.cur[0]-t[0])>ia(t.cur[1]-t[1])?v=!0:y=!0}for(const t of $)t.cur&&(t[0]=t.cur[0],t[1]=t.cur[1]);g=!0,Jo(t),I(t)}function I(t){const n=$[0],e=n.point0;var r;switch(C=n[0]-e[0],P=n[1]-e[1],m){case na:case ta:x&&(C=oa(S-i,aa(N-l,C)),a=i+C,h=l+C),w&&(P=oa(E-u,aa(k-d,P)),c=u+P,p=d+P);break;case ea:$[1]?(x&&(a=oa(S,aa(N,$[0][0])),h=oa(S,aa(N,$[1][0])),x=1),w&&(c=oa(E,aa(k,$[0][1])),p=oa(E,aa(k,$[1][1])),w=1)):(x<0?(C=oa(S-i,aa(N-i,C)),a=i+C,h=l):x>0&&(C=oa(S-l,aa(N-l,C)),a=i,h=l+C),w<0?(P=oa(E-u,aa(k-u,P)),c=u+P,p=d):w>0&&(P=oa(E-d,aa(k-d,P)),c=u,p=d+P));break;case ra:x&&(a=oa(S,aa(N,i-C*x)),h=oa(S,aa(N,l+C*x))),w&&(c=oa(E,aa(k,u-P*w)),p=oa(E,aa(k,d+P*w)))}h<a&&(x*=-1,r=i,i=l,l=r,r=a,a=h,h=r,b in da&&F.attr("cursor",ha[b=da[b]])),p<c&&(w*=-1,r=u,u=d,d=r,r=c,c=p,p=r,b in pa&&F.attr("cursor",ha[b=pa[b]])),M.selection&&(A=M.selection),y&&(a=A[0][0],h=A[1][0]),v&&(c=A[0][1],p=A[1][1]),A[0][0]===a&&A[0][1]===c&&A[1][0]===h&&A[1][1]===p||(M.selection=[[a,c],[h,p]],f.call(_),D.brush(t,m.name))}function O(t){if(function(t){t.stopImmediatePropagation()}(t),t.touches){if(t.touches.length)return;n&&clearTimeout(n),n=setTimeout((function(){n=null}),500)}else ue(t.view,g),q.on("keydown.brush keyup.brush mousemove.brush mouseup.brush",null);R.attr("pointer-events","all"),F.attr("cursor",ha.overlay),M.selection&&(A=M.selection),function(t){return t[0][0]===t[1][0]||t[0][1]===t[1][1]}(A)&&(M.selection=null,f.call(_)),D.end(t,m.name)}}function d(t){s(this,arguments).moved(t)}function p(t){s(this,arguments).ended(t)}function g(){var n=this.__brush||{selection:null};return n.extent=ca(e.apply(this,arguments)),n.dim=t,n}return c.move=function(n,e,r){n.tween?n.on("start.brush",(function(t){s(this,arguments).beforestart().start(t)})).on("interrupt.brush end.brush",(function(t){s(this,arguments).end(t)})).tween("brush",(function(){var n=this,r=n.__brush,i=s(n,arguments),o=r.selection,a=t.input("function"==typeof e?e.apply(this,arguments):e,r.extent),u=Gr(o,a);function c(t){r.selection=1===t&&null===a?null:u(t),f.call(n),i.brush()}return null!==o&&null!==a?c:c(1)})):n.each((function(){var n=this,i=arguments,o=n.__brush,a=t.input("function"==typeof e?e.apply(n,i):e,o.extent),u=s(n,i).beforestart();Gi(n),o.selection=null===a?null:a,f.call(n),u.start(r).brush(r).end(r)}))},c.clear=function(t,n){c.move(t,null,n)},l.prototype={beforestart:function(){return 1==++this.active&&(this.state.emitter=this,this.starting=!0),this},start:function(t,n){return this.starting?(this.starting=!1,this.emit("start",t,n)):this.emit("brush",t),this},brush:function(t,n){return this.emit("brush",t,n),this},end:function(t,n){return 0==--this.active&&(delete this.state.emitter,this.emit("end",t,n)),this},emit:function(n,e,r){var i=Zn(this.that).datum();a.call(n,this.that,new Qo(n,{sourceEvent:e,target:c,selection:t.output(this.state.selection),mode:r,dispatch:a}),i)}},c.extent=function(t){return arguments.length?(e="function"==typeof t?t:Ko(ca(t)),c):e},c.filter=function(t){return arguments.length?(r="function"==typeof t?t:Ko(!!t),c):r},c.touchable=function(t){return arguments.length?(i="function"==typeof t?t:Ko(!!t),c):i},c.handleSize=function(t){return arguments.length?(u=+t,c):u},c.keyModifiers=function(t){return arguments.length?(o=!!t,c):o},c.on=function(){var t=a.on.apply(a,arguments);return t===a?c:t},c}var Ma=Math.abs,Ta=Math.cos,Aa=Math.sin,Sa=Math.PI,Ea=Sa/2,Na=2*Sa,ka=Math.max,Ca=1e-12;function Pa(t,n){return Array.from({length:n-t},((n,e)=>t+e))}function za(t,n){var e=0,r=null,i=null,o=null;function a(a){var u,c=a.length,f=new Array(c),s=Pa(0,c),l=new Array(c*c),h=new Array(c),d=0;a=Float64Array.from({length:c*c},n?(t,n)=>a[n%c][n/c|0]:(t,n)=>a[n/c|0][n%c]);for(let n=0;n<c;++n){let e=0;for(let r=0;r<c;++r)e+=a[n*c+r]+t*a[r*c+n];d+=f[n]=e}u=(d=ka(0,Na-e*c)/d)?e:Na/c;{let n=0;r&&s.sort(((t,n)=>r(f[t],f[n])));for(const e of s){const r=n;if(t){const t=Pa(1+~c,c).filter((t=>t<0?a[~t*c+e]:a[e*c+t]));i&&t.sort(((t,n)=>i(t<0?-a[~t*c+e]:a[e*c+t],n<0?-a[~n*c+e]:a[e*c+n])));for(const r of t)if(r<0){(l[~r*c+e]||(l[~r*c+e]={source:null,target:null})).target={index:e,startAngle:n,endAngle:n+=a[~r*c+e]*d,value:a[~r*c+e]}}else{(l[e*c+r]||(l[e*c+r]={source:null,target:null})).source={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]}}h[e]={index:e,startAngle:r,endAngle:n,value:f[e]}}else{const t=Pa(0,c).filter((t=>a[e*c+t]||a[t*c+e]));i&&t.sort(((t,n)=>i(a[e*c+t],a[e*c+n])));for(const r of t){let t;if(e<r?(t=l[e*c+r]||(l[e*c+r]={source:null,target:null}),t.source={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]}):(t=l[r*c+e]||(l[r*c+e]={source:null,target:null}),t.target={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]},e===r&&(t.source=t.target)),t.source&&t.target&&t.source.value<t.target.value){const n=t.source;t.source=t.target,t.target=n}}h[e]={index:e,startAngle:r,endAngle:n,value:f[e]}}n+=u}}return(l=Object.values(l)).groups=h,o?l.sort(o):l}return a.padAngle=function(t){return arguments.length?(e=ka(0,t),a):e},a.sortGroups=function(t){return arguments.length?(r=t,a):r},a.sortSubgroups=function(t){return arguments.length?(i=t,a):i},a.sortChords=function(t){return arguments.length?(null==t?o=null:(n=t,o=function(t,e){return n(t.source.value+t.target.value,e.source.value+e.target.value)})._=t,a):o&&o._;var n},a}const $a=Math.PI,Da=2*$a,Ra=1e-6,Fa=Da-Ra;function qa(t){this._+=t[0];for(let n=1,e=t.length;n<e;++n)this._+=arguments[n]+t[n]}let Ua=class{constructor(t){this._x0=this._y0=this._x1=this._y1=null,this._="",this._append=null==t?qa:function(t){let n=Math.floor(t);if(!(n>=0))throw new Error(`invalid digits: ${t}`);if(n>15)return qa;const e=10**n;return function(t){this._+=t[0];for(let n=1,r=t.length;n<r;++n)this._+=Math.round(arguments[n]*e)/e+t[n]}}(t)}moveTo(t,n){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}`}closePath(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._append`Z`)}lineTo(t,n){this._append`L${this._x1=+t},${this._y1=+n}`}quadraticCurveTo(t,n,e,r){this._append`Q${+t},${+n},${this._x1=+e},${this._y1=+r}`}bezierCurveTo(t,n,e,r,i,o){this._append`C${+t},${+n},${+e},${+r},${this._x1=+i},${this._y1=+o}`}arcTo(t,n,e,r,i){if(t=+t,n=+n,e=+e,r=+r,(i=+i)<0)throw new Error(`negative radius: ${i}`);let o=this._x1,a=this._y1,u=e-t,c=r-n,f=o-t,s=a-n,l=f*f+s*s;if(null===this._x1)this._append`M${this._x1=t},${this._y1=n}`;else if(l>Ra)if(Math.abs(s*u-c*f)>Ra&&i){let h=e-o,d=r-a,p=u*u+c*c,g=h*h+d*d,y=Math.sqrt(p),v=Math.sqrt(l),_=i*Math.tan(($a-Math.acos((p+l-g)/(2*y*v)))/2),b=_/v,m=_/y;Math.abs(b-1)>Ra&&this._append`L${t+b*f},${n+b*s}`,this._append`A${i},${i},0,0,${+(s*h>f*d)},${this._x1=t+m*u},${this._y1=n+m*c}`}else this._append`L${this._x1=t},${this._y1=n}`;else;}arc(t,n,e,r,i,o){if(t=+t,n=+n,o=!!o,(e=+e)<0)throw new Error(`negative radius: ${e}`);let a=e*Math.cos(r),u=e*Math.sin(r),c=t+a,f=n+u,s=1^o,l=o?r-i:i-r;null===this._x1?this._append`M${c},${f}`:(Math.abs(this._x1-c)>Ra||Math.abs(this._y1-f)>Ra)&&this._append`L${c},${f}`,e&&(l<0&&(l=l%Da+Da),l>Fa?this._append`A${e},${e},0,1,${s},${t-a},${n-u}A${e},${e},0,1,${s},${this._x1=c},${this._y1=f}`:l>Ra&&this._append`A${e},${e},0,${+(l>=$a)},${s},${this._x1=t+e*Math.cos(i)},${this._y1=n+e*Math.sin(i)}`)}rect(t,n,e,r){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}h${e=+e}v${+r}h${-e}Z`}toString(){return this._}};function Ia(){return new Ua}Ia.prototype=Ua.prototype;var Oa=Array.prototype.slice;function Ba(t){return function(){return t}}function Ya(t){return t.source}function La(t){return t.target}function ja(t){return t.radius}function Ha(t){return t.startAngle}function Xa(t){return t.endAngle}function Ga(){return 0}function Va(){return 10}function Wa(t){var n=Ya,e=La,r=ja,i=ja,o=Ha,a=Xa,u=Ga,c=null;function f(){var f,s=n.apply(this,arguments),l=e.apply(this,arguments),h=u.apply(this,arguments)/2,d=Oa.call(arguments),p=+r.apply(this,(d[0]=s,d)),g=o.apply(this,d)-Ea,y=a.apply(this,d)-Ea,v=+i.apply(this,(d[0]=l,d)),_=o.apply(this,d)-Ea,b=a.apply(this,d)-Ea;if(c||(c=f=Ia()),h>Ca&&(Ma(y-g)>2*h+Ca?y>g?(g+=h,y-=h):(g-=h,y+=h):g=y=(g+y)/2,Ma(b-_)>2*h+Ca?b>_?(_+=h,b-=h):(_-=h,b+=h):_=b=(_+b)/2),c.moveTo(p*Ta(g),p*Aa(g)),c.arc(0,0,p,g,y),g!==_||y!==b)if(t){var m=v-+t.apply(this,arguments),x=(_+b)/2;c.quadraticCurveTo(0,0,m*Ta(_),m*Aa(_)),c.lineTo(v*Ta(x),v*Aa(x)),c.lineTo(m*Ta(b),m*Aa(b))}else c.quadraticCurveTo(0,0,v*Ta(_),v*Aa(_)),c.arc(0,0,v,_,b);if(c.quadraticCurveTo(0,0,p*Ta(g),p*Aa(g)),c.closePath(),f)return c=null,f+""||null}return t&&(f.headRadius=function(n){return arguments.length?(t="function"==typeof n?n:Ba(+n),f):t}),f.radius=function(t){return arguments.length?(r=i="function"==typeof t?t:Ba(+t),f):r},f.sourceRadius=function(t){return arguments.length?(r="function"==typeof t?t:Ba(+t),f):r},f.targetRadius=function(t){return arguments.length?(i="function"==typeof t?t:Ba(+t),f):i},f.startAngle=function(t){return arguments.length?(o="function"==typeof t?t:Ba(+t),f):o},f.endAngle=function(t){return arguments.length?(a="function"==typeof t?t:Ba(+t),f):a},f.padAngle=function(t){return arguments.length?(u="function"==typeof t?t:Ba(+t),f):u},f.source=function(t){return arguments.length?(n=t,f):n},f.target=function(t){return arguments.length?(e=t,f):e},f.context=function(t){return arguments.length?(c=null==t?null:t,f):c},f}var Za=Array.prototype.slice;function Ka(t,n){return t-n}var Qa=t=>()=>t;function Ja(t,n){for(var e,r=-1,i=n.length;++r<i;)if(e=tu(t,n[r]))return e;return 0}function tu(t,n){for(var e=n[0],r=n[1],i=-1,o=0,a=t.length,u=a-1;o<a;u=o++){var c=t[o],f=c[0],s=c[1],l=t[u],h=l[0],d=l[1];if(nu(c,l,n))return 0;s>r!=d>r&&e<(h-f)*(r-s)/(d-s)+f&&(i=-i)}return i}function nu(t,n,e){var r,i,o,a;return function(t,n,e){return(n[0]-t[0])*(e[1]-t[1])==(e[0]-t[0])*(n[1]-t[1])}(t,n,e)&&(i=t[r=+(t[0]===n[0])],o=e[r],a=n[r],i<=o&&o<=a||a<=o&&o<=i)}function eu(){}var ru=[[],[[[1,1.5],[.5,1]]],[[[1.5,1],[1,1.5]]],[[[1.5,1],[.5,1]]],[[[1,.5],[1.5,1]]],[[[1,1.5],[.5,1]],[[1,.5],[1.5,1]]],[[[1,.5],[1,1.5]]],[[[1,.5],[.5,1]]],[[[.5,1],[1,.5]]],[[[1,1.5],[1,.5]]],[[[.5,1],[1,.5]],[[1.5,1],[1,1.5]]],[[[1.5,1],[1,.5]]],[[[.5,1],[1.5,1]]],[[[1,1.5],[1.5,1]]],[[[.5,1],[1,1.5]]],[]];function iu(){var t=1,n=1,e=K,r=u;function i(t){var n=e(t);if(Array.isArray(n))n=n.slice().sort(Ka);else{const e=M(t,ou);for(n=G(...Z(e[0],e[1],n),n);n[n.length-1]>=e[1];)n.pop();for(;n[1]<e[0];)n.shift()}return n.map((n=>o(t,n)))}function o(e,i){const o=null==i?NaN:+i;if(isNaN(o))throw new Error(`invalid value: ${i}`);var u=[],c=[];return function(e,r,i){var o,u,c,f,s,l,h=new Array,d=new Array;o=u=-1,f=au(e[0],r),ru[f<<1].forEach(p);for(;++o<t-1;)c=f,f=au(e[o+1],r),ru[c|f<<1].forEach(p);ru[f|0].forEach(p);for(;++u<n-1;){for(o=-1,f=au(e[u*t+t],r),s=au(e[u*t],r),ru[f<<1|s<<2].forEach(p);++o<t-1;)c=f,f=au(e[u*t+t+o+1],r),l=s,s=au(e[u*t+o+1],r),ru[c|f<<1|s<<2|l<<3].forEach(p);ru[f|s<<3].forEach(p)}o=-1,s=e[u*t]>=r,ru[s<<2].forEach(p);for(;++o<t-1;)l=s,s=au(e[u*t+o+1],r),ru[s<<2|l<<3].forEach(p);function p(t){var n,e,r=[t[0][0]+o,t[0][1]+u],c=[t[1][0]+o,t[1][1]+u],f=a(r),s=a(c);(n=d[f])?(e=h[s])?(delete d[n.end],delete h[e.start],n===e?(n.ring.push(c),i(n.ring)):h[n.start]=d[e.end]={start:n.start,end:e.end,ring:n.ring.concat(e.ring)}):(delete d[n.end],n.ring.push(c),d[n.end=s]=n):(n=h[s])?(e=d[f])?(delete h[n.start],delete d[e.end],n===e?(n.ring.push(c),i(n.ring)):h[e.start]=d[n.end]={start:e.start,end:n.end,ring:e.ring.concat(n.ring)}):(delete h[n.start],n.ring.unshift(r),h[n.start=f]=n):h[f]=d[s]={start:f,end:s,ring:[r,c]}}ru[s<<3].forEach(p)}(e,o,(function(t){r(t,e,o),function(t){for(var n=0,e=t.length,r=t[e-1][1]*t[0][0]-t[e-1][0]*t[0][1];++n<e;)r+=t[n-1][1]*t[n][0]-t[n-1][0]*t[n][1];return r}(t)>0?u.push([t]):c.push(t)})),c.forEach((function(t){for(var n,e=0,r=u.length;e<r;++e)if(-1!==Ja((n=u[e])[0],t))return void n.push(t)})),{type:"MultiPolygon",value:i,coordinates:u}}function a(n){return 2*n[0]+n[1]*(t+1)*4}function u(e,r,i){e.forEach((function(e){var o=e[0],a=e[1],u=0|o,c=0|a,f=uu(r[c*t+u]);o>0&&o<t&&u===o&&(e[0]=cu(o,uu(r[c*t+u-1]),f,i)),a>0&&a<n&&c===a&&(e[1]=cu(a,uu(r[(c-1)*t+u]),f,i))}))}return i.contour=o,i.size=function(e){if(!arguments.length)return[t,n];var r=Math.floor(e[0]),o=Math.floor(e[1]);if(!(r>=0&&o>=0))throw new Error("invalid size");return t=r,n=o,i},i.thresholds=function(t){return arguments.length?(e="function"==typeof t?t:Array.isArray(t)?Qa(Za.call(t)):Qa(t),i):e},i.smooth=function(t){return arguments.length?(r=t?u:eu,i):r===u},i}function ou(t){return isFinite(t)?t:NaN}function au(t,n){return null!=t&&+t>=n}function uu(t){return null==t||isNaN(t=+t)?-1/0:t}function cu(t,n,e,r){const i=r-n,o=e-n,a=isFinite(i)||isFinite(o)?i/o:Math.sign(i)/Math.sign(o);return isNaN(a)?t:t+a-.5}function fu(t){return t[0]}function su(t){return t[1]}function lu(){return 1}const hu=134217729,du=33306690738754706e-32;function pu(t,n,e,r,i){let o,a,u,c,f=n[0],s=r[0],l=0,h=0;s>f==s>-f?(o=f,f=n[++l]):(o=s,s=r[++h]);let d=0;if(l<t&&h<e)for(s>f==s>-f?(a=f+o,u=o-(a-f),f=n[++l]):(a=s+o,u=o-(a-s),s=r[++h]),o=a,0!==u&&(i[d++]=u);l<t&&h<e;)s>f==s>-f?(a=o+f,c=a-o,u=o-(a-c)+(f-c),f=n[++l]):(a=o+s,c=a-o,u=o-(a-c)+(s-c),s=r[++h]),o=a,0!==u&&(i[d++]=u);for(;l<t;)a=o+f,c=a-o,u=o-(a-c)+(f-c),f=n[++l],o=a,0!==u&&(i[d++]=u);for(;h<e;)a=o+s,c=a-o,u=o-(a-c)+(s-c),s=r[++h],o=a,0!==u&&(i[d++]=u);return 0===o&&0!==d||(i[d++]=o),d}function gu(t){return new Float64Array(t)}const yu=22204460492503146e-32,vu=11093356479670487e-47,_u=gu(4),bu=gu(8),mu=gu(12),xu=gu(16),wu=gu(4);function Mu(t,n,e,r,i,o){const a=(n-o)*(e-i),u=(t-i)*(r-o),c=a-u,f=Math.abs(a+u);return Math.abs(c)>=33306690738754716e-32*f?c:-function(t,n,e,r,i,o,a){let u,c,f,s,l,h,d,p,g,y,v,_,b,m,x,w,M,T;const A=t-i,S=e-i,E=n-o,N=r-o;m=A*N,h=hu*A,d=h-(h-A),p=A-d,h=hu*N,g=h-(h-N),y=N-g,x=p*y-(m-d*g-p*g-d*y),w=E*S,h=hu*E,d=h-(h-E),p=E-d,h=hu*S,g=h-(h-S),y=S-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,_u[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,_u[1]=b-(v+l)+(l-w),T=_+v,l=T-_,_u[2]=_-(T-l)+(v-l),_u[3]=T;let k=function(t,n){let e=n[0];for(let r=1;r<t;r++)e+=n[r];return e}(4,_u),C=yu*a;if(k>=C||-k>=C)return k;if(l=t-A,u=t-(A+l)+(l-i),l=e-S,f=e-(S+l)+(l-i),l=n-E,c=n-(E+l)+(l-o),l=r-N,s=r-(N+l)+(l-o),0===u&&0===c&&0===f&&0===s)return k;if(C=vu*a+du*Math.abs(k),k+=A*s+N*u-(E*f+S*c),k>=C||-k>=C)return k;m=u*N,h=hu*u,d=h-(h-u),p=u-d,h=hu*N,g=h-(h-N),y=N-g,x=p*y-(m-d*g-p*g-d*y),w=c*S,h=hu*c,d=h-(h-c),p=c-d,h=hu*S,g=h-(h-S),y=S-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,wu[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,wu[1]=b-(v+l)+(l-w),T=_+v,l=T-_,wu[2]=_-(T-l)+(v-l),wu[3]=T;const P=pu(4,_u,4,wu,bu);m=A*s,h=hu*A,d=h-(h-A),p=A-d,h=hu*s,g=h-(h-s),y=s-g,x=p*y-(m-d*g-p*g-d*y),w=E*f,h=hu*E,d=h-(h-E),p=E-d,h=hu*f,g=h-(h-f),y=f-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,wu[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,wu[1]=b-(v+l)+(l-w),T=_+v,l=T-_,wu[2]=_-(T-l)+(v-l),wu[3]=T;const z=pu(P,bu,4,wu,mu);m=u*s,h=hu*u,d=h-(h-u),p=u-d,h=hu*s,g=h-(h-s),y=s-g,x=p*y-(m-d*g-p*g-d*y),w=c*f,h=hu*c,d=h-(h-c),p=c-d,h=hu*f,g=h-(h-f),y=f-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,wu[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,wu[1]=b-(v+l)+(l-w),T=_+v,l=T-_,wu[2]=_-(T-l)+(v-l),wu[3]=T;const $=pu(z,mu,4,wu,xu);return xu[$-1]}(t,n,e,r,i,o,f)}const Tu=Math.pow(2,-52),Au=new Uint32Array(512);class Su{static from(t,n=zu,e=$u){const r=t.length,i=new Float64Array(2*r);for(let o=0;o<r;o++){const r=t[o];i[2*o]=n(r),i[2*o+1]=e(r)}return new Su(i)}constructor(t){const n=t.length>>1;if(n>0&&"number"!=typeof t[0])throw new Error("Expected coords to contain numbers.");this.coords=t;const e=Math.max(2*n-5,0);this._triangles=new Uint32Array(3*e),this._halfedges=new Int32Array(3*e),this._hashSize=Math.ceil(Math.sqrt(n)),this._hullPrev=new Uint32Array(n),this._hullNext=new Uint32Array(n),this._hullTri=new Uint32Array(n),this._hullHash=new Int32Array(this._hashSize),this._ids=new Uint32Array(n),this._dists=new Float64Array(n),this.update()}update(){const{coords:t,_hullPrev:n,_hullNext:e,_hullTri:r,_hullHash:i}=this,o=t.length>>1;let a=1/0,u=1/0,c=-1/0,f=-1/0;for(let n=0;n<o;n++){const e=t[2*n],r=t[2*n+1];e<a&&(a=e),r<u&&(u=r),e>c&&(c=e),r>f&&(f=r),this._ids[n]=n}const s=(a+c)/2,l=(u+f)/2;let h,d,p;for(let n=0,e=1/0;n<o;n++){const r=Eu(s,l,t[2*n],t[2*n+1]);r<e&&(h=n,e=r)}const g=t[2*h],y=t[2*h+1];for(let n=0,e=1/0;n<o;n++){if(n===h)continue;const r=Eu(g,y,t[2*n],t[2*n+1]);r<e&&r>0&&(d=n,e=r)}let v=t[2*d],_=t[2*d+1],b=1/0;for(let n=0;n<o;n++){if(n===h||n===d)continue;const e=ku(g,y,v,_,t[2*n],t[2*n+1]);e<b&&(p=n,b=e)}let m=t[2*p],x=t[2*p+1];if(b===1/0){for(let n=0;n<o;n++)this._dists[n]=t[2*n]-t[0]||t[2*n+1]-t[1];Cu(this._ids,this._dists,0,o-1);const n=new Uint32Array(o);let e=0;for(let t=0,r=-1/0;t<o;t++){const i=this._ids[t],o=this._dists[i];o>r&&(n[e++]=i,r=o)}return this.hull=n.subarray(0,e),this.triangles=new Uint32Array(0),void(this.halfedges=new Uint32Array(0))}if(Mu(g,y,v,_,m,x)<0){const t=d,n=v,e=_;d=p,v=m,_=x,p=t,m=n,x=e}const w=function(t,n,e,r,i,o){const a=e-t,u=r-n,c=i-t,f=o-n,s=a*a+u*u,l=c*c+f*f,h=.5/(a*f-u*c),d=t+(f*s-u*l)*h,p=n+(a*l-c*s)*h;return{x:d,y:p}}(g,y,v,_,m,x);this._cx=w.x,this._cy=w.y;for(let n=0;n<o;n++)this._dists[n]=Eu(t[2*n],t[2*n+1],w.x,w.y);Cu(this._ids,this._dists,0,o-1),this._hullStart=h;let M=3;e[h]=n[p]=d,e[d]=n[h]=p,e[p]=n[d]=h,r[h]=0,r[d]=1,r[p]=2,i.fill(-1),i[this._hashKey(g,y)]=h,i[this._hashKey(v,_)]=d,i[this._hashKey(m,x)]=p,this.trianglesLen=0,this._addTriangle(h,d,p,-1,-1,-1);for(let o,a,u=0;u<this._ids.length;u++){const c=this._ids[u],f=t[2*c],s=t[2*c+1];if(u>0&&Math.abs(f-o)<=Tu&&Math.abs(s-a)<=Tu)continue;if(o=f,a=s,c===h||c===d||c===p)continue;let l=0;for(let t=0,n=this._hashKey(f,s);t<this._hashSize&&(l=i[(n+t)%this._hashSize],-1===l||l===e[l]);t++);l=n[l];let g,y=l;for(;g=e[y],Mu(f,s,t[2*y],t[2*y+1],t[2*g],t[2*g+1])>=0;)if(y=g,y===l){y=-1;break}if(-1===y)continue;let v=this._addTriangle(y,c,e[y],-1,-1,r[y]);r[c]=this._legalize(v+2),r[y]=v,M++;let _=e[y];for(;g=e[_],Mu(f,s,t[2*_],t[2*_+1],t[2*g],t[2*g+1])<0;)v=this._addTriangle(_,c,g,r[c],-1,r[_]),r[c]=this._legalize(v+2),e[_]=_,M--,_=g;if(y===l)for(;g=n[y],Mu(f,s,t[2*g],t[2*g+1],t[2*y],t[2*y+1])<0;)v=this._addTriangle(g,c,y,-1,r[y],r[g]),this._legalize(v+2),r[g]=v,e[y]=y,M--,y=g;this._hullStart=n[c]=y,e[y]=n[_]=c,e[c]=_,i[this._hashKey(f,s)]=c,i[this._hashKey(t[2*y],t[2*y+1])]=y}this.hull=new Uint32Array(M);for(let t=0,n=this._hullStart;t<M;t++)this.hull[t]=n,n=e[n];this.triangles=this._triangles.subarray(0,this.trianglesLen),this.halfedges=this._halfedges.subarray(0,this.trianglesLen)}_hashKey(t,n){return Math.floor(function(t,n){const e=t/(Math.abs(t)+Math.abs(n));return(n>0?3-e:1+e)/4}(t-this._cx,n-this._cy)*this._hashSize)%this._hashSize}_legalize(t){const{_triangles:n,_halfedges:e,coords:r}=this;let i=0,o=0;for(;;){const a=e[t],u=t-t%3;if(o=u+(t+2)%3,-1===a){if(0===i)break;t=Au[--i];continue}const c=a-a%3,f=u+(t+1)%3,s=c+(a+2)%3,l=n[o],h=n[t],d=n[f],p=n[s];if(Nu(r[2*l],r[2*l+1],r[2*h],r[2*h+1],r[2*d],r[2*d+1],r[2*p],r[2*p+1])){n[t]=p,n[a]=l;const r=e[s];if(-1===r){let n=this._hullStart;do{if(this._hullTri[n]===s){this._hullTri[n]=t;break}n=this._hullPrev[n]}while(n!==this._hullStart)}this._link(t,r),this._link(a,e[o]),this._link(o,s);const u=c+(a+1)%3;i<Au.length&&(Au[i++]=u)}else{if(0===i)break;t=Au[--i]}}return o}_link(t,n){this._halfedges[t]=n,-1!==n&&(this._halfedges[n]=t)}_addTriangle(t,n,e,r,i,o){const a=this.trianglesLen;return this._triangles[a]=t,this._triangles[a+1]=n,this._triangles[a+2]=e,this._link(a,r),this._link(a+1,i),this._link(a+2,o),this.trianglesLen+=3,a}}function Eu(t,n,e,r){const i=t-e,o=n-r;return i*i+o*o}function Nu(t,n,e,r,i,o,a,u){const c=t-a,f=n-u,s=e-a,l=r-u,h=i-a,d=o-u,p=s*s+l*l,g=h*h+d*d;return c*(l*g-p*d)-f*(s*g-p*h)+(c*c+f*f)*(s*d-l*h)<0}function ku(t,n,e,r,i,o){const a=e-t,u=r-n,c=i-t,f=o-n,s=a*a+u*u,l=c*c+f*f,h=.5/(a*f-u*c),d=(f*s-u*l)*h,p=(a*l-c*s)*h;return d*d+p*p}function Cu(t,n,e,r){if(r-e<=20)for(let i=e+1;i<=r;i++){const r=t[i],o=n[r];let a=i-1;for(;a>=e&&n[t[a]]>o;)t[a+1]=t[a--];t[a+1]=r}else{let i=e+1,o=r;Pu(t,e+r>>1,i),n[t[e]]>n[t[r]]&&Pu(t,e,r),n[t[i]]>n[t[r]]&&Pu(t,i,r),n[t[e]]>n[t[i]]&&Pu(t,e,i);const a=t[i],u=n[a];for(;;){do{i++}while(n[t[i]]<u);do{o--}while(n[t[o]]>u);if(o<i)break;Pu(t,i,o)}t[e+1]=t[o],t[o]=a,r-i+1>=o-e?(Cu(t,n,i,r),Cu(t,n,e,o-1)):(Cu(t,n,e,o-1),Cu(t,n,i,r))}}function Pu(t,n,e){const r=t[n];t[n]=t[e],t[e]=r}function zu(t){return t[0]}function $u(t){return t[1]}const Du=1e-6;class Ru{constructor(){this._x0=this._y0=this._x1=this._y1=null,this._=""}moveTo(t,n){this._+=`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}`}closePath(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")}lineTo(t,n){this._+=`L${this._x1=+t},${this._y1=+n}`}arc(t,n,e){const r=(t=+t)+(e=+e),i=n=+n;if(e<0)throw new Error("negative radius");null===this._x1?this._+=`M${r},${i}`:(Math.abs(this._x1-r)>Du||Math.abs(this._y1-i)>Du)&&(this._+="L"+r+","+i),e&&(this._+=`A${e},${e},0,1,1,${t-e},${n}A${e},${e},0,1,1,${this._x1=r},${this._y1=i}`)}rect(t,n,e,r){this._+=`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}h${+e}v${+r}h${-e}Z`}value(){return this._||null}}class Fu{constructor(){this._=[]}moveTo(t,n){this._.push([t,n])}closePath(){this._.push(this._[0].slice())}lineTo(t,n){this._.push([t,n])}value(){return this._.length?this._:null}}class qu{constructor(t,[n,e,r,i]=[0,0,960,500]){if(!((r=+r)>=(n=+n)&&(i=+i)>=(e=+e)))throw new Error("invalid bounds");this.delaunay=t,this._circumcenters=new Float64Array(2*t.points.length),this.vectors=new Float64Array(2*t.points.length),this.xmax=r,this.xmin=n,this.ymax=i,this.ymin=e,this._init()}update(){return this.delaunay.update(),this._init(),this}_init(){const{delaunay:{points:t,hull:n,triangles:e},vectors:r}=this;let i,o;const a=this.circumcenters=this._circumcenters.subarray(0,e.length/3*2);for(let r,u,c=0,f=0,s=e.length;c<s;c+=3,f+=2){const s=2*e[c],l=2*e[c+1],h=2*e[c+2],d=t[s],p=t[s+1],g=t[l],y=t[l+1],v=t[h],_=t[h+1],b=g-d,m=y-p,x=v-d,w=_-p,M=2*(b*w-m*x);if(Math.abs(M)<1e-9){if(void 0===i){i=o=0;for(const e of n)i+=t[2*e],o+=t[2*e+1];i/=n.length,o/=n.length}const e=1e9*Math.sign((i-d)*w-(o-p)*x);r=(d+v)/2-e*w,u=(p+_)/2+e*x}else{const t=1/M,n=b*b+m*m,e=x*x+w*w;r=d+(w*n-m*e)*t,u=p+(b*e-x*n)*t}a[f]=r,a[f+1]=u}let u,c,f,s=n[n.length-1],l=4*s,h=t[2*s],d=t[2*s+1];r.fill(0);for(let e=0;e<n.length;++e)s=n[e],u=l,c=h,f=d,l=4*s,h=t[2*s],d=t[2*s+1],r[u+2]=r[l]=f-d,r[u+3]=r[l+1]=h-c}render(t){const n=null==t?t=new Ru:void 0,{delaunay:{halfedges:e,inedges:r,hull:i},circumcenters:o,vectors:a}=this;if(i.length<=1)return null;for(let n=0,r=e.length;n<r;++n){const r=e[n];if(r<n)continue;const i=2*Math.floor(n/3),a=2*Math.floor(r/3),u=o[i],c=o[i+1],f=o[a],s=o[a+1];this._renderSegment(u,c,f,s,t)}let u,c=i[i.length-1];for(let n=0;n<i.length;++n){u=c,c=i[n];const e=2*Math.floor(r[c]/3),f=o[e],s=o[e+1],l=4*u,h=this._project(f,s,a[l+2],a[l+3]);h&&this._renderSegment(f,s,h[0],h[1],t)}return n&&n.value()}renderBounds(t){const n=null==t?t=new Ru:void 0;return t.rect(this.xmin,this.ymin,this.xmax-this.xmin,this.ymax-this.ymin),n&&n.value()}renderCell(t,n){const e=null==n?n=new Ru:void 0,r=this._clip(t);if(null===r||!r.length)return;n.moveTo(r[0],r[1]);let i=r.length;for(;r[0]===r[i-2]&&r[1]===r[i-1]&&i>1;)i-=2;for(let t=2;t<i;t+=2)r[t]===r[t-2]&&r[t+1]===r[t-1]||n.lineTo(r[t],r[t+1]);return n.closePath(),e&&e.value()}*cellPolygons(){const{delaunay:{points:t}}=this;for(let n=0,e=t.length/2;n<e;++n){const t=this.cellPolygon(n);t&&(t.index=n,yield t)}}cellPolygon(t){const n=new Fu;return this.renderCell(t,n),n.value()}_renderSegment(t,n,e,r,i){let o;const a=this._regioncode(t,n),u=this._regioncode(e,r);0===a&&0===u?(i.moveTo(t,n),i.lineTo(e,r)):(o=this._clipSegment(t,n,e,r,a,u))&&(i.moveTo(o[0],o[1]),i.lineTo(o[2],o[3]))}contains(t,n,e){return(n=+n)==n&&(e=+e)==e&&this.delaunay._step(t,n,e)===t}*neighbors(t){const n=this._clip(t);if(n)for(const e of this.delaunay.neighbors(t)){const t=this._clip(e);if(t)t:for(let r=0,i=n.length;r<i;r+=2)for(let o=0,a=t.length;o<a;o+=2)if(n[r]===t[o]&&n[r+1]===t[o+1]&&n[(r+2)%i]===t[(o+a-2)%a]&&n[(r+3)%i]===t[(o+a-1)%a]){yield e;break t}}}_cell(t){const{circumcenters:n,delaunay:{inedges:e,halfedges:r,triangles:i}}=this,o=e[t];if(-1===o)return null;const a=[];let u=o;do{const e=Math.floor(u/3);if(a.push(n[2*e],n[2*e+1]),u=u%3==2?u-2:u+1,i[u]!==t)break;u=r[u]}while(u!==o&&-1!==u);return a}_clip(t){if(0===t&&1===this.delaunay.hull.length)return[this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax,this.xmin,this.ymin];const n=this._cell(t);if(null===n)return null;const{vectors:e}=this,r=4*t;return this._simplify(e[r]||e[r+1]?this._clipInfinite(t,n,e[r],e[r+1],e[r+2],e[r+3]):this._clipFinite(t,n))}_clipFinite(t,n){const e=n.length;let r,i,o,a,u=null,c=n[e-2],f=n[e-1],s=this._regioncode(c,f),l=0;for(let h=0;h<e;h+=2)if(r=c,i=f,c=n[h],f=n[h+1],o=s,s=this._regioncode(c,f),0===o&&0===s)a=l,l=0,u?u.push(c,f):u=[c,f];else{let n,e,h,d,p;if(0===o){if(null===(n=this._clipSegment(r,i,c,f,o,s)))continue;[e,h,d,p]=n}else{if(null===(n=this._clipSegment(c,f,r,i,s,o)))continue;[d,p,e,h]=n,a=l,l=this._edgecode(e,h),a&&l&&this._edge(t,a,l,u,u.length),u?u.push(e,h):u=[e,h]}a=l,l=this._edgecode(d,p),a&&l&&this._edge(t,a,l,u,u.length),u?u.push(d,p):u=[d,p]}if(u)a=l,l=this._edgecode(u[0],u[1]),a&&l&&this._edge(t,a,l,u,u.length);else if(this.contains(t,(this.xmin+this.xmax)/2,(this.ymin+this.ymax)/2))return[this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax,this.xmin,this.ymin];return u}_clipSegment(t,n,e,r,i,o){const a=i<o;for(a&&([t,n,e,r,i,o]=[e,r,t,n,o,i]);;){if(0===i&&0===o)return a?[e,r,t,n]:[t,n,e,r];if(i&o)return null;let u,c,f=i||o;8&f?(u=t+(e-t)*(this.ymax-n)/(r-n),c=this.ymax):4&f?(u=t+(e-t)*(this.ymin-n)/(r-n),c=this.ymin):2&f?(c=n+(r-n)*(this.xmax-t)/(e-t),u=this.xmax):(c=n+(r-n)*(this.xmin-t)/(e-t),u=this.xmin),i?(t=u,n=c,i=this._regioncode(t,n)):(e=u,r=c,o=this._regioncode(e,r))}}_clipInfinite(t,n,e,r,i,o){let a,u=Array.from(n);if((a=this._project(u[0],u[1],e,r))&&u.unshift(a[0],a[1]),(a=this._project(u[u.length-2],u[u.length-1],i,o))&&u.push(a[0],a[1]),u=this._clipFinite(t,u))for(let n,e=0,r=u.length,i=this._edgecode(u[r-2],u[r-1]);e<r;e+=2)n=i,i=this._edgecode(u[e],u[e+1]),n&&i&&(e=this._edge(t,n,i,u,e),r=u.length);else this.contains(t,(this.xmin+this.xmax)/2,(this.ymin+this.ymax)/2)&&(u=[this.xmin,this.ymin,this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax]);return u}_edge(t,n,e,r,i){for(;n!==e;){let e,o;switch(n){case 5:n=4;continue;case 4:n=6,e=this.xmax,o=this.ymin;break;case 6:n=2;continue;case 2:n=10,e=this.xmax,o=this.ymax;break;case 10:n=8;continue;case 8:n=9,e=this.xmin,o=this.ymax;break;case 9:n=1;continue;case 1:n=5,e=this.xmin,o=this.ymin}r[i]===e&&r[i+1]===o||!this.contains(t,e,o)||(r.splice(i,0,e,o),i+=2)}return i}_project(t,n,e,r){let i,o,a,u=1/0;if(r<0){if(n<=this.ymin)return null;(i=(this.ymin-n)/r)<u&&(a=this.ymin,o=t+(u=i)*e)}else if(r>0){if(n>=this.ymax)return null;(i=(this.ymax-n)/r)<u&&(a=this.ymax,o=t+(u=i)*e)}if(e>0){if(t>=this.xmax)return null;(i=(this.xmax-t)/e)<u&&(o=this.xmax,a=n+(u=i)*r)}else if(e<0){if(t<=this.xmin)return null;(i=(this.xmin-t)/e)<u&&(o=this.xmin,a=n+(u=i)*r)}return[o,a]}_edgecode(t,n){return(t===this.xmin?1:t===this.xmax?2:0)|(n===this.ymin?4:n===this.ymax?8:0)}_regioncode(t,n){return(t<this.xmin?1:t>this.xmax?2:0)|(n<this.ymin?4:n>this.ymax?8:0)}_simplify(t){if(t&&t.length>4){for(let n=0;n<t.length;n+=2){const e=(n+2)%t.length,r=(n+4)%t.length;(t[n]===t[e]&&t[e]===t[r]||t[n+1]===t[e+1]&&t[e+1]===t[r+1])&&(t.splice(e,2),n-=2)}t.length||(t=null)}return t}}const Uu=2*Math.PI,Iu=Math.pow;function Ou(t){return t[0]}function Bu(t){return t[1]}function Yu(t,n,e){return[t+Math.sin(t+n)*e,n+Math.cos(t-n)*e]}class Lu{static from(t,n=Ou,e=Bu,r){return new Lu("length"in t?function(t,n,e,r){const i=t.length,o=new Float64Array(2*i);for(let a=0;a<i;++a){const i=t[a];o[2*a]=n.call(r,i,a,t),o[2*a+1]=e.call(r,i,a,t)}return o}(t,n,e,r):Float64Array.from(function*(t,n,e,r){let i=0;for(const o of t)yield n.call(r,o,i,t),yield e.call(r,o,i,t),++i}(t,n,e,r)))}constructor(t){this._delaunator=new Su(t),this.inedges=new Int32Array(t.length/2),this._hullIndex=new Int32Array(t.length/2),this.points=this._delaunator.coords,this._init()}update(){return this._delaunator.update(),this._init(),this}_init(){const t=this._delaunator,n=this.points;if(t.hull&&t.hull.length>2&&function(t){const{triangles:n,coords:e}=t;for(let t=0;t<n.length;t+=3){const r=2*n[t],i=2*n[t+1],o=2*n[t+2];if((e[o]-e[r])*(e[i+1]-e[r+1])-(e[i]-e[r])*(e[o+1]-e[r+1])>1e-10)return!1}return!0}(t)){this.collinear=Int32Array.from({length:n.length/2},((t,n)=>n)).sort(((t,e)=>n[2*t]-n[2*e]||n[2*t+1]-n[2*e+1]));const t=this.collinear[0],e=this.collinear[this.collinear.length-1],r=[n[2*t],n[2*t+1],n[2*e],n[2*e+1]],i=1e-8*Math.hypot(r[3]-r[1],r[2]-r[0]);for(let t=0,e=n.length/2;t<e;++t){const e=Yu(n[2*t],n[2*t+1],i);n[2*t]=e[0],n[2*t+1]=e[1]}this._delaunator=new Su(n)}else delete this.collinear;const e=this.halfedges=this._delaunator.halfedges,r=this.hull=this._delaunator.hull,i=this.triangles=this._delaunator.triangles,o=this.inedges.fill(-1),a=this._hullIndex.fill(-1);for(let t=0,n=e.length;t<n;++t){const n=i[t%3==2?t-2:t+1];-1!==e[t]&&-1!==o[n]||(o[n]=t)}for(let t=0,n=r.length;t<n;++t)a[r[t]]=t;r.length<=2&&r.length>0&&(this.triangles=new Int32Array(3).fill(-1),this.halfedges=new Int32Array(3).fill(-1),this.triangles[0]=r[0],o[r[0]]=1,2===r.length&&(o[r[1]]=0,this.triangles[1]=r[1],this.triangles[2]=r[1]))}voronoi(t){return new qu(this,t)}*neighbors(t){const{inedges:n,hull:e,_hullIndex:r,halfedges:i,triangles:o,collinear:a}=this;if(a){const n=a.indexOf(t);return n>0&&(yield a[n-1]),void(n<a.length-1&&(yield a[n+1]))}const u=n[t];if(-1===u)return;let c=u,f=-1;do{if(yield f=o[c],c=c%3==2?c-2:c+1,o[c]!==t)return;if(c=i[c],-1===c){const n=e[(r[t]+1)%e.length];return void(n!==f&&(yield n))}}while(c!==u)}find(t,n,e=0){if((t=+t)!=t||(n=+n)!=n)return-1;const r=e;let i;for(;(i=this._step(e,t,n))>=0&&i!==e&&i!==r;)e=i;return i}_step(t,n,e){const{inedges:r,hull:i,_hullIndex:o,halfedges:a,triangles:u,points:c}=this;if(-1===r[t]||!c.length)return(t+1)%(c.length>>1);let f=t,s=Iu(n-c[2*t],2)+Iu(e-c[2*t+1],2);const l=r[t];let h=l;do{let r=u[h];const l=Iu(n-c[2*r],2)+Iu(e-c[2*r+1],2);if(l<s&&(s=l,f=r),h=h%3==2?h-2:h+1,u[h]!==t)break;if(h=a[h],-1===h){if(h=i[(o[t]+1)%i.length],h!==r&&Iu(n-c[2*h],2)+Iu(e-c[2*h+1],2)<s)return h;break}}while(h!==l);return f}render(t){const n=null==t?t=new Ru:void 0,{points:e,halfedges:r,triangles:i}=this;for(let n=0,o=r.length;n<o;++n){const o=r[n];if(o<n)continue;const a=2*i[n],u=2*i[o];t.moveTo(e[a],e[a+1]),t.lineTo(e[u],e[u+1])}return this.renderHull(t),n&&n.value()}renderPoints(t,n){void 0!==n||t&&"function"==typeof t.moveTo||(n=t,t=null),n=null==n?2:+n;const e=null==t?t=new Ru:void 0,{points:r}=this;for(let e=0,i=r.length;e<i;e+=2){const i=r[e],o=r[e+1];t.moveTo(i+n,o),t.arc(i,o,n,0,Uu)}return e&&e.value()}renderHull(t){const n=null==t?t=new Ru:void 0,{hull:e,points:r}=this,i=2*e[0],o=e.length;t.moveTo(r[i],r[i+1]);for(let n=1;n<o;++n){const i=2*e[n];t.lineTo(r[i],r[i+1])}return t.closePath(),n&&n.value()}hullPolygon(){const t=new Fu;return this.renderHull(t),t.value()}renderTriangle(t,n){const e=null==n?n=new Ru:void 0,{points:r,triangles:i}=this,o=2*i[t*=3],a=2*i[t+1],u=2*i[t+2];return n.moveTo(r[o],r[o+1]),n.lineTo(r[a],r[a+1]),n.lineTo(r[u],r[u+1]),n.closePath(),e&&e.value()}*trianglePolygons(){const{triangles:t}=this;for(let n=0,e=t.length/3;n<e;++n)yield this.trianglePolygon(n)}trianglePolygon(t){const n=new Fu;return this.renderTriangle(t,n),n.value()}}var ju={},Hu={},Xu=34,Gu=10,Vu=13;function Wu(t){return new Function("d","return {"+t.map((function(t,n){return JSON.stringify(t)+": d["+n+'] || ""'})).join(",")+"}")}function Zu(t){var n=Object.create(null),e=[];return t.forEach((function(t){for(var r in t)r in n||e.push(n[r]=r)})),e}function Ku(t,n){var e=t+"",r=e.length;return r<n?new Array(n-r+1).join(0)+e:e}function Qu(t){var n,e=t.getUTCHours(),r=t.getUTCMinutes(),i=t.getUTCSeconds(),o=t.getUTCMilliseconds();return isNaN(t)?"Invalid Date":((n=t.getUTCFullYear())<0?"-"+Ku(-n,6):n>9999?"+"+Ku(n,6):Ku(n,4))+"-"+Ku(t.getUTCMonth()+1,2)+"-"+Ku(t.getUTCDate(),2)+(o?"T"+Ku(e,2)+":"+Ku(r,2)+":"+Ku(i,2)+"."+Ku(o,3)+"Z":i?"T"+Ku(e,2)+":"+Ku(r,2)+":"+Ku(i,2)+"Z":r||e?"T"+Ku(e,2)+":"+Ku(r,2)+"Z":"")}function Ju(t){var n=new RegExp('["'+t+"\n\r]"),e=t.charCodeAt(0);function r(t,n){var r,i=[],o=t.length,a=0,u=0,c=o<=0,f=!1;function s(){if(c)return Hu;if(f)return f=!1,ju;var n,r,i=a;if(t.charCodeAt(i)===Xu){for(;a++<o&&t.charCodeAt(a)!==Xu||t.charCodeAt(++a)===Xu;);return(n=a)>=o?c=!0:(r=t.charCodeAt(a++))===Gu?f=!0:r===Vu&&(f=!0,t.charCodeAt(a)===Gu&&++a),t.slice(i+1,n-1).replace(/""/g,'"')}for(;a<o;){if((r=t.charCodeAt(n=a++))===Gu)f=!0;else if(r===Vu)f=!0,t.charCodeAt(a)===Gu&&++a;else if(r!==e)continue;return t.slice(i,n)}return c=!0,t.slice(i,o)}for(t.charCodeAt(o-1)===Gu&&--o,t.charCodeAt(o-1)===Vu&&--o;(r=s())!==Hu;){for(var l=[];r!==ju&&r!==Hu;)l.push(r),r=s();n&&null==(l=n(l,u++))||i.push(l)}return i}function i(n,e){return n.map((function(n){return e.map((function(t){return a(n[t])})).join(t)}))}function o(n){return n.map(a).join(t)}function a(t){return null==t?"":t instanceof Date?Qu(t):n.test(t+="")?'"'+t.replace(/"/g,'""')+'"':t}return{parse:function(t,n){var e,i,o=r(t,(function(t,r){if(e)return e(t,r-1);i=t,e=n?function(t,n){var e=Wu(t);return function(r,i){return n(e(r),i,t)}}(t,n):Wu(t)}));return o.columns=i||[],o},parseRows:r,format:function(n,e){return null==e&&(e=Zu(n)),[e.map(a).join(t)].concat(i(n,e)).join("\n")},formatBody:function(t,n){return null==n&&(n=Zu(t)),i(t,n).join("\n")},formatRows:function(t){return t.map(o).join("\n")},formatRow:o,formatValue:a}}var tc=Ju(","),nc=tc.parse,ec=tc.parseRows,rc=tc.format,ic=tc.formatBody,oc=tc.formatRows,ac=tc.formatRow,uc=tc.formatValue,cc=Ju("\t"),fc=cc.parse,sc=cc.parseRows,lc=cc.format,hc=cc.formatBody,dc=cc.formatRows,pc=cc.formatRow,gc=cc.formatValue;const yc=new Date("2019-01-01T00:00").getHours()||new Date("2019-07-01T00:00").getHours();function vc(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.blob()}function _c(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.arrayBuffer()}function bc(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.text()}function mc(t,n){return fetch(t,n).then(bc)}function xc(t){return function(n,e,r){return 2===arguments.length&&"function"==typeof e&&(r=e,e=void 0),mc(n,e).then((function(n){return t(n,r)}))}}var wc=xc(nc),Mc=xc(fc);function Tc(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);if(204!==t.status&&205!==t.status)return t.json()}function Ac(t){return(n,e)=>mc(n,e).then((n=>(new DOMParser).parseFromString(n,t)))}var Sc=Ac("application/xml"),Ec=Ac("text/html"),Nc=Ac("image/svg+xml");function kc(t,n,e,r){if(isNaN(n)||isNaN(e))return t;var i,o,a,u,c,f,s,l,h,d=t._root,p={data:r},g=t._x0,y=t._y0,v=t._x1,_=t._y1;if(!d)return t._root=p,t;for(;d.length;)if((f=n>=(o=(g+v)/2))?g=o:v=o,(s=e>=(a=(y+_)/2))?y=a:_=a,i=d,!(d=d[l=s<<1|f]))return i[l]=p,t;if(u=+t._x.call(null,d.data),c=+t._y.call(null,d.data),n===u&&e===c)return p.next=d,i?i[l]=p:t._root=p,t;do{i=i?i[l]=new Array(4):t._root=new Array(4),(f=n>=(o=(g+v)/2))?g=o:v=o,(s=e>=(a=(y+_)/2))?y=a:_=a}while((l=s<<1|f)==(h=(c>=a)<<1|u>=o));return i[h]=d,i[l]=p,t}function Cc(t,n,e,r,i){this.node=t,this.x0=n,this.y0=e,this.x1=r,this.y1=i}function Pc(t){return t[0]}function zc(t){return t[1]}function $c(t,n,e){var r=new Dc(null==n?Pc:n,null==e?zc:e,NaN,NaN,NaN,NaN);return null==t?r:r.addAll(t)}function Dc(t,n,e,r,i,o){this._x=t,this._y=n,this._x0=e,this._y0=r,this._x1=i,this._y1=o,this._root=void 0}function Rc(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}var Fc=$c.prototype=Dc.prototype;function qc(t){return function(){return t}}function Uc(t){return 1e-6*(t()-.5)}function Ic(t){return t.x+t.vx}function Oc(t){return t.y+t.vy}function Bc(t){return t.index}function Yc(t,n){var e=t.get(n);if(!e)throw new Error("node not found: "+n);return e}Fc.copy=function(){var t,n,e=new Dc(this._x,this._y,this._x0,this._y0,this._x1,this._y1),r=this._root;if(!r)return e;if(!r.length)return e._root=Rc(r),e;for(t=[{source:r,target:e._root=new Array(4)}];r=t.pop();)for(var i=0;i<4;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(4)}):r.target[i]=Rc(n));return e},Fc.add=function(t){const n=+this._x.call(null,t),e=+this._y.call(null,t);return kc(this.cover(n,e),n,e,t)},Fc.addAll=function(t){var n,e,r,i,o=t.length,a=new Array(o),u=new Array(o),c=1/0,f=1/0,s=-1/0,l=-1/0;for(e=0;e<o;++e)isNaN(r=+this._x.call(null,n=t[e]))||isNaN(i=+this._y.call(null,n))||(a[e]=r,u[e]=i,r<c&&(c=r),r>s&&(s=r),i<f&&(f=i),i>l&&(l=i));if(c>s||f>l)return this;for(this.cover(c,f).cover(s,l),e=0;e<o;++e)kc(this,a[e],u[e],t[e]);return this},Fc.cover=function(t,n){if(isNaN(t=+t)||isNaN(n=+n))return this;var e=this._x0,r=this._y0,i=this._x1,o=this._y1;if(isNaN(e))i=(e=Math.floor(t))+1,o=(r=Math.floor(n))+1;else{for(var a,u,c=i-e||1,f=this._root;e>t||t>=i||r>n||n>=o;)switch(u=(n<r)<<1|t<e,(a=new Array(4))[u]=f,f=a,c*=2,u){case 0:i=e+c,o=r+c;break;case 1:e=i-c,o=r+c;break;case 2:i=e+c,r=o-c;break;case 3:e=i-c,r=o-c}this._root&&this._root.length&&(this._root=f)}return this._x0=e,this._y0=r,this._x1=i,this._y1=o,this},Fc.data=function(){var t=[];return this.visit((function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)})),t},Fc.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]},Fc.find=function(t,n,e){var r,i,o,a,u,c,f,s=this._x0,l=this._y0,h=this._x1,d=this._y1,p=[],g=this._root;for(g&&p.push(new Cc(g,s,l,h,d)),null==e?e=1/0:(s=t-e,l=n-e,h=t+e,d=n+e,e*=e);c=p.pop();)if(!(!(g=c.node)||(i=c.x0)>h||(o=c.y0)>d||(a=c.x1)<s||(u=c.y1)<l))if(g.length){var y=(i+a)/2,v=(o+u)/2;p.push(new Cc(g[3],y,v,a,u),new Cc(g[2],i,v,y,u),new Cc(g[1],y,o,a,v),new Cc(g[0],i,o,y,v)),(f=(n>=v)<<1|t>=y)&&(c=p[p.length-1],p[p.length-1]=p[p.length-1-f],p[p.length-1-f]=c)}else{var _=t-+this._x.call(null,g.data),b=n-+this._y.call(null,g.data),m=_*_+b*b;if(m<e){var x=Math.sqrt(e=m);s=t-x,l=n-x,h=t+x,d=n+x,r=g.data}}return r},Fc.remove=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(a=+this._y.call(null,t)))return this;var n,e,r,i,o,a,u,c,f,s,l,h,d=this._root,p=this._x0,g=this._y0,y=this._x1,v=this._y1;if(!d)return this;if(d.length)for(;;){if((f=o>=(u=(p+y)/2))?p=u:y=u,(s=a>=(c=(g+v)/2))?g=c:v=c,n=d,!(d=d[l=s<<1|f]))return this;if(!d.length)break;(n[l+1&3]||n[l+2&3]||n[l+3&3])&&(e=n,h=l)}for(;d.data!==t;)if(r=d,!(d=d.next))return this;return(i=d.next)&&delete d.next,r?(i?r.next=i:delete r.next,this):n?(i?n[l]=i:delete n[l],(d=n[0]||n[1]||n[2]||n[3])&&d===(n[3]||n[2]||n[1]||n[0])&&!d.length&&(e?e[h]=d:this._root=d),this):(this._root=i,this)},Fc.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},Fc.root=function(){return this._root},Fc.size=function(){var t=0;return this.visit((function(n){if(!n.length)do{++t}while(n=n.next)})),t},Fc.visit=function(t){var n,e,r,i,o,a,u=[],c=this._root;for(c&&u.push(new Cc(c,this._x0,this._y0,this._x1,this._y1));n=u.pop();)if(!t(c=n.node,r=n.x0,i=n.y0,o=n.x1,a=n.y1)&&c.length){var f=(r+o)/2,s=(i+a)/2;(e=c[3])&&u.push(new Cc(e,f,s,o,a)),(e=c[2])&&u.push(new Cc(e,r,s,f,a)),(e=c[1])&&u.push(new Cc(e,f,i,o,s)),(e=c[0])&&u.push(new Cc(e,r,i,f,s))}return this},Fc.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new Cc(this._root,this._x0,this._y0,this._x1,this._y1));n=e.pop();){var i=n.node;if(i.length){var o,a=n.x0,u=n.y0,c=n.x1,f=n.y1,s=(a+c)/2,l=(u+f)/2;(o=i[0])&&e.push(new Cc(o,a,u,s,l)),(o=i[1])&&e.push(new Cc(o,s,u,c,l)),(o=i[2])&&e.push(new Cc(o,a,l,s,f)),(o=i[3])&&e.push(new Cc(o,s,l,c,f))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.x1,n.y1);return this},Fc.x=function(t){return arguments.length?(this._x=t,this):this._x},Fc.y=function(t){return arguments.length?(this._y=t,this):this._y};const Lc=1664525,jc=1013904223,Hc=4294967296;function Xc(t){return t.x}function Gc(t){return t.y}var Vc=Math.PI*(3-Math.sqrt(5));function Wc(t,n){if((e=(t=n?t.toExponential(n-1):t.toExponential()).indexOf("e"))<0)return null;var e,r=t.slice(0,e);return[r.length>1?r[0]+r.slice(2):r,+t.slice(e+1)]}function Zc(t){return(t=Wc(Math.abs(t)))?t[1]:NaN}var Kc,Qc=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function Jc(t){if(!(n=Qc.exec(t)))throw new Error("invalid format: "+t);var n;return new tf({fill:n[1],align:n[2],sign:n[3],symbol:n[4],zero:n[5],width:n[6],comma:n[7],precision:n[8]&&n[8].slice(1),trim:n[9],type:n[10]})}function tf(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function nf(t,n){var e=Wc(t,n);if(!e)return t+"";var r=e[0],i=e[1];return i<0?"0."+new Array(-i).join("0")+r:r.length>i+1?r.slice(0,i+1)+"."+r.slice(i+1):r+new Array(i-r.length+2).join("0")}Jc.prototype=tf.prototype,tf.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var ef={"%":(t,n)=>(100*t).toFixed(n),b:t=>Math.round(t).toString(2),c:t=>t+"",d:function(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)},e:(t,n)=>t.toExponential(n),f:(t,n)=>t.toFixed(n),g:(t,n)=>t.toPrecision(n),o:t=>Math.round(t).toString(8),p:(t,n)=>nf(100*t,n),r:nf,s:function(t,n){var e=Wc(t,n);if(!e)return t+"";var r=e[0],i=e[1],o=i-(Kc=3*Math.max(-8,Math.min(8,Math.floor(i/3))))+1,a=r.length;return o===a?r:o>a?r+new Array(o-a+1).join("0"):o>0?r.slice(0,o)+"."+r.slice(o):"0."+new Array(1-o).join("0")+Wc(t,Math.max(0,n+o-1))[0]},X:t=>Math.round(t).toString(16).toUpperCase(),x:t=>Math.round(t).toString(16)};function rf(t){return t}var of,af=Array.prototype.map,uf=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function cf(t){var n,e,r=void 0===t.grouping||void 0===t.thousands?rf:(n=af.call(t.grouping,Number),e=t.thousands+"",function(t,r){for(var i=t.length,o=[],a=0,u=n[0],c=0;i>0&&u>0&&(c+u+1>r&&(u=Math.max(1,r-c)),o.push(t.substring(i-=u,i+u)),!((c+=u+1)>r));)u=n[a=(a+1)%n.length];return o.reverse().join(e)}),i=void 0===t.currency?"":t.currency[0]+"",o=void 0===t.currency?"":t.currency[1]+"",a=void 0===t.decimal?".":t.decimal+"",u=void 0===t.numerals?rf:function(t){return function(n){return n.replace(/[0-9]/g,(function(n){return t[+n]}))}}(af.call(t.numerals,String)),c=void 0===t.percent?"%":t.percent+"",f=void 0===t.minus?"−":t.minus+"",s=void 0===t.nan?"NaN":t.nan+"";function l(t){var n=(t=Jc(t)).fill,e=t.align,l=t.sign,h=t.symbol,d=t.zero,p=t.width,g=t.comma,y=t.precision,v=t.trim,_=t.type;"n"===_?(g=!0,_="g"):ef[_]||(void 0===y&&(y=12),v=!0,_="g"),(d||"0"===n&&"="===e)&&(d=!0,n="0",e="=");var b="$"===h?i:"#"===h&&/[boxX]/.test(_)?"0"+_.toLowerCase():"",m="$"===h?o:/[%p]/.test(_)?c:"",x=ef[_],w=/[defgprs%]/.test(_);function M(t){var i,o,c,h=b,M=m;if("c"===_)M=x(t)+M,t="";else{var T=(t=+t)<0||1/t<0;if(t=isNaN(t)?s:x(Math.abs(t),y),v&&(t=function(t){t:for(var n,e=t.length,r=1,i=-1;r<e;++r)switch(t[r]){case".":i=n=r;break;case"0":0===i&&(i=r),n=r;break;default:if(!+t[r])break t;i>0&&(i=0)}return i>0?t.slice(0,i)+t.slice(n+1):t}(t)),T&&0==+t&&"+"!==l&&(T=!1),h=(T?"("===l?l:f:"-"===l||"("===l?"":l)+h,M=("s"===_?uf[8+Kc/3]:"")+M+(T&&"("===l?")":""),w)for(i=-1,o=t.length;++i<o;)if(48>(c=t.charCodeAt(i))||c>57){M=(46===c?a+t.slice(i+1):t.slice(i))+M,t=t.slice(0,i);break}}g&&!d&&(t=r(t,1/0));var A=h.length+t.length+M.length,S=A<p?new Array(p-A+1).join(n):"";switch(g&&d&&(t=r(S+t,S.length?p-M.length:1/0),S=""),e){case"<":t=h+t+M+S;break;case"=":t=h+S+t+M;break;case"^":t=S.slice(0,A=S.length>>1)+h+t+M+S.slice(A);break;default:t=S+h+t+M}return u(t)}return y=void 0===y?6:/[gprs]/.test(_)?Math.max(1,Math.min(21,y)):Math.max(0,Math.min(20,y)),M.toString=function(){return t+""},M}return{format:l,formatPrefix:function(t,n){var e=l(((t=Jc(t)).type="f",t)),r=3*Math.max(-8,Math.min(8,Math.floor(Zc(n)/3))),i=Math.pow(10,-r),o=uf[8+r/3];return function(t){return e(i*t)+o}}}}function ff(n){return of=cf(n),t.format=of.format,t.formatPrefix=of.formatPrefix,of}function sf(t){return Math.max(0,-Zc(Math.abs(t)))}function lf(t,n){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(Zc(n)/3)))-Zc(Math.abs(t)))}function hf(t,n){return t=Math.abs(t),n=Math.abs(n)-t,Math.max(0,Zc(n)-Zc(t))+1}t.format=void 0,t.formatPrefix=void 0,ff({thousands:",",grouping:[3],currency:["$",""]});var df=1e-6,pf=1e-12,gf=Math.PI,yf=gf/2,vf=gf/4,_f=2*gf,bf=180/gf,mf=gf/180,xf=Math.abs,wf=Math.atan,Mf=Math.atan2,Tf=Math.cos,Af=Math.ceil,Sf=Math.exp,Ef=Math.hypot,Nf=Math.log,kf=Math.pow,Cf=Math.sin,Pf=Math.sign||function(t){return t>0?1:t<0?-1:0},zf=Math.sqrt,$f=Math.tan;function Df(t){return t>1?0:t<-1?gf:Math.acos(t)}function Rf(t){return t>1?yf:t<-1?-yf:Math.asin(t)}function Ff(t){return(t=Cf(t/2))*t}function qf(){}function Uf(t,n){t&&Of.hasOwnProperty(t.type)&&Of[t.type](t,n)}var If={Feature:function(t,n){Uf(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)Uf(e[r].geometry,n)}},Of={Sphere:function(t,n){n.sphere()},Point:function(t,n){t=t.coordinates,n.point(t[0],t[1],t[2])},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)t=e[r],n.point(t[0],t[1],t[2])},LineString:function(t,n){Bf(t.coordinates,n,0)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)Bf(e[r],n,0)},Polygon:function(t,n){Yf(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)Yf(e[r],n)},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)Uf(e[r],n)}};function Bf(t,n,e){var r,i=-1,o=t.length-e;for(n.lineStart();++i<o;)r=t[i],n.point(r[0],r[1],r[2]);n.lineEnd()}function Yf(t,n){var e=-1,r=t.length;for(n.polygonStart();++e<r;)Bf(t[e],n,1);n.polygonEnd()}function Lf(t,n){t&&If.hasOwnProperty(t.type)?If[t.type](t,n):Uf(t,n)}var jf,Hf,Xf,Gf,Vf,Wf,Zf,Kf,Qf,Jf,ts,ns,es,rs,is,os,as=new T,us=new T,cs={point:qf,lineStart:qf,lineEnd:qf,polygonStart:function(){as=new T,cs.lineStart=fs,cs.lineEnd=ss},polygonEnd:function(){var t=+as;us.add(t<0?_f+t:t),this.lineStart=this.lineEnd=this.point=qf},sphere:function(){us.add(_f)}};function fs(){cs.point=ls}function ss(){hs(jf,Hf)}function ls(t,n){cs.point=hs,jf=t,Hf=n,Xf=t*=mf,Gf=Tf(n=(n*=mf)/2+vf),Vf=Cf(n)}function hs(t,n){var e=(t*=mf)-Xf,r=e>=0?1:-1,i=r*e,o=Tf(n=(n*=mf)/2+vf),a=Cf(n),u=Vf*a,c=Gf*o+u*Tf(i),f=u*r*Cf(i);as.add(Mf(f,c)),Xf=t,Gf=o,Vf=a}function ds(t){return[Mf(t[1],t[0]),Rf(t[2])]}function ps(t){var n=t[0],e=t[1],r=Tf(e);return[r*Tf(n),r*Cf(n),Cf(e)]}function gs(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function ys(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function vs(t,n){t[0]+=n[0],t[1]+=n[1],t[2]+=n[2]}function _s(t,n){return[t[0]*n,t[1]*n,t[2]*n]}function bs(t){var n=zf(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=n,t[1]/=n,t[2]/=n}var ms,xs,ws,Ms,Ts,As,Ss,Es,Ns,ks,Cs,Ps,zs,$s,Ds,Rs,Fs={point:qs,lineStart:Is,lineEnd:Os,polygonStart:function(){Fs.point=Bs,Fs.lineStart=Ys,Fs.lineEnd=Ls,rs=new T,cs.polygonStart()},polygonEnd:function(){cs.polygonEnd(),Fs.point=qs,Fs.lineStart=Is,Fs.lineEnd=Os,as<0?(Wf=-(Kf=180),Zf=-(Qf=90)):rs>df?Qf=90:rs<-df&&(Zf=-90),os[0]=Wf,os[1]=Kf},sphere:function(){Wf=-(Kf=180),Zf=-(Qf=90)}};function qs(t,n){is.push(os=[Wf=t,Kf=t]),n<Zf&&(Zf=n),n>Qf&&(Qf=n)}function Us(t,n){var e=ps([t*mf,n*mf]);if(es){var r=ys(es,e),i=ys([r[1],-r[0],0],r);bs(i),i=ds(i);var o,a=t-Jf,u=a>0?1:-1,c=i[0]*bf*u,f=xf(a)>180;f^(u*Jf<c&&c<u*t)?(o=i[1]*bf)>Qf&&(Qf=o):f^(u*Jf<(c=(c+360)%360-180)&&c<u*t)?(o=-i[1]*bf)<Zf&&(Zf=o):(n<Zf&&(Zf=n),n>Qf&&(Qf=n)),f?t<Jf?js(Wf,t)>js(Wf,Kf)&&(Kf=t):js(t,Kf)>js(Wf,Kf)&&(Wf=t):Kf>=Wf?(t<Wf&&(Wf=t),t>Kf&&(Kf=t)):t>Jf?js(Wf,t)>js(Wf,Kf)&&(Kf=t):js(t,Kf)>js(Wf,Kf)&&(Wf=t)}else is.push(os=[Wf=t,Kf=t]);n<Zf&&(Zf=n),n>Qf&&(Qf=n),es=e,Jf=t}function Is(){Fs.point=Us}function Os(){os[0]=Wf,os[1]=Kf,Fs.point=qs,es=null}function Bs(t,n){if(es){var e=t-Jf;rs.add(xf(e)>180?e+(e>0?360:-360):e)}else ts=t,ns=n;cs.point(t,n),Us(t,n)}function Ys(){cs.lineStart()}function Ls(){Bs(ts,ns),cs.lineEnd(),xf(rs)>df&&(Wf=-(Kf=180)),os[0]=Wf,os[1]=Kf,es=null}function js(t,n){return(n-=t)<0?n+360:n}function Hs(t,n){return t[0]-n[0]}function Xs(t,n){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}var Gs={sphere:qf,point:Vs,lineStart:Zs,lineEnd:Js,polygonStart:function(){Gs.lineStart=tl,Gs.lineEnd=nl},polygonEnd:function(){Gs.lineStart=Zs,Gs.lineEnd=Js}};function Vs(t,n){t*=mf;var e=Tf(n*=mf);Ws(e*Tf(t),e*Cf(t),Cf(n))}function Ws(t,n,e){++ms,ws+=(t-ws)/ms,Ms+=(n-Ms)/ms,Ts+=(e-Ts)/ms}function Zs(){Gs.point=Ks}function Ks(t,n){t*=mf;var e=Tf(n*=mf);$s=e*Tf(t),Ds=e*Cf(t),Rs=Cf(n),Gs.point=Qs,Ws($s,Ds,Rs)}function Qs(t,n){t*=mf;var e=Tf(n*=mf),r=e*Tf(t),i=e*Cf(t),o=Cf(n),a=Mf(zf((a=Ds*o-Rs*i)*a+(a=Rs*r-$s*o)*a+(a=$s*i-Ds*r)*a),$s*r+Ds*i+Rs*o);xs+=a,As+=a*($s+($s=r)),Ss+=a*(Ds+(Ds=i)),Es+=a*(Rs+(Rs=o)),Ws($s,Ds,Rs)}function Js(){Gs.point=Vs}function tl(){Gs.point=el}function nl(){rl(Ps,zs),Gs.point=Vs}function el(t,n){Ps=t,zs=n,t*=mf,n*=mf,Gs.point=rl;var e=Tf(n);$s=e*Tf(t),Ds=e*Cf(t),Rs=Cf(n),Ws($s,Ds,Rs)}function rl(t,n){t*=mf;var e=Tf(n*=mf),r=e*Tf(t),i=e*Cf(t),o=Cf(n),a=Ds*o-Rs*i,u=Rs*r-$s*o,c=$s*i-Ds*r,f=Ef(a,u,c),s=Rf(f),l=f&&-s/f;Ns.add(l*a),ks.add(l*u),Cs.add(l*c),xs+=s,As+=s*($s+($s=r)),Ss+=s*(Ds+(Ds=i)),Es+=s*(Rs+(Rs=o)),Ws($s,Ds,Rs)}function il(t){return function(){return t}}function ol(t,n){function e(e,r){return e=t(e,r),n(e[0],e[1])}return t.invert&&n.invert&&(e.invert=function(e,r){return(e=n.invert(e,r))&&t.invert(e[0],e[1])}),e}function al(t,n){return xf(t)>gf&&(t-=Math.round(t/_f)*_f),[t,n]}function ul(t,n,e){return(t%=_f)?n||e?ol(fl(t),sl(n,e)):fl(t):n||e?sl(n,e):al}function cl(t){return function(n,e){return xf(n+=t)>gf&&(n-=Math.round(n/_f)*_f),[n,e]}}function fl(t){var n=cl(t);return n.invert=cl(-t),n}function sl(t,n){var e=Tf(t),r=Cf(t),i=Tf(n),o=Cf(n);function a(t,n){var a=Tf(n),u=Tf(t)*a,c=Cf(t)*a,f=Cf(n),s=f*e+u*r;return[Mf(c*i-s*o,u*e-f*r),Rf(s*i+c*o)]}return a.invert=function(t,n){var a=Tf(n),u=Tf(t)*a,c=Cf(t)*a,f=Cf(n),s=f*i-c*o;return[Mf(c*i+f*o,u*e+s*r),Rf(s*e-u*r)]},a}function ll(t){function n(n){return(n=t(n[0]*mf,n[1]*mf))[0]*=bf,n[1]*=bf,n}return t=ul(t[0]*mf,t[1]*mf,t.length>2?t[2]*mf:0),n.invert=function(n){return(n=t.invert(n[0]*mf,n[1]*mf))[0]*=bf,n[1]*=bf,n},n}function hl(t,n,e,r,i,o){if(e){var a=Tf(n),u=Cf(n),c=r*e;null==i?(i=n+r*_f,o=n-c/2):(i=dl(a,i),o=dl(a,o),(r>0?i<o:i>o)&&(i+=r*_f));for(var f,s=i;r>0?s>o:s<o;s-=c)f=ds([a,-u*Tf(s),-u*Cf(s)]),t.point(f[0],f[1])}}function dl(t,n){(n=ps(n))[0]-=t,bs(n);var e=Df(-n[1]);return((-n[2]<0?-e:e)+_f-df)%_f}function pl(){var t,n=[];return{point:function(n,e,r){t.push([n,e,r])},lineStart:function(){n.push(t=[])},lineEnd:qf,rejoin:function(){n.length>1&&n.push(n.pop().concat(n.shift()))},result:function(){var e=n;return n=[],t=null,e}}}function gl(t,n){return xf(t[0]-n[0])<df&&xf(t[1]-n[1])<df}function yl(t,n,e,r){this.x=t,this.z=n,this.o=e,this.e=r,this.v=!1,this.n=this.p=null}function vl(t,n,e,r,i){var o,a,u=[],c=[];if(t.forEach((function(t){if(!((n=t.length-1)<=0)){var n,e,r=t[0],a=t[n];if(gl(r,a)){if(!r[2]&&!a[2]){for(i.lineStart(),o=0;o<n;++o)i.point((r=t[o])[0],r[1]);return void i.lineEnd()}a[0]+=2*df}u.push(e=new yl(r,t,null,!0)),c.push(e.o=new yl(r,null,e,!1)),u.push(e=new yl(a,t,null,!1)),c.push(e.o=new yl(a,null,e,!0))}})),u.length){for(c.sort(n),_l(u),_l(c),o=0,a=c.length;o<a;++o)c[o].e=e=!e;for(var f,s,l=u[0];;){for(var h=l,d=!0;h.v;)if((h=h.n)===l)return;f=h.z,i.lineStart();do{if(h.v=h.o.v=!0,h.e){if(d)for(o=0,a=f.length;o<a;++o)i.point((s=f[o])[0],s[1]);else r(h.x,h.n.x,1,i);h=h.n}else{if(d)for(f=h.p.z,o=f.length-1;o>=0;--o)i.point((s=f[o])[0],s[1]);else r(h.x,h.p.x,-1,i);h=h.p}f=(h=h.o).z,d=!d}while(!h.v);i.lineEnd()}}}function _l(t){if(n=t.length){for(var n,e,r=0,i=t[0];++r<n;)i.n=e=t[r],e.p=i,i=e;i.n=e=t[0],e.p=i}}function bl(t){return xf(t[0])<=gf?t[0]:Pf(t[0])*((xf(t[0])+gf)%_f-gf)}function ml(t,n){var e=bl(n),r=n[1],i=Cf(r),o=[Cf(e),-Tf(e),0],a=0,u=0,c=new T;1===i?r=yf+df:-1===i&&(r=-yf-df);for(var f=0,s=t.length;f<s;++f)if(h=(l=t[f]).length)for(var l,h,d=l[h-1],p=bl(d),g=d[1]/2+vf,y=Cf(g),v=Tf(g),_=0;_<h;++_,p=m,y=w,v=M,d=b){var b=l[_],m=bl(b),x=b[1]/2+vf,w=Cf(x),M=Tf(x),A=m-p,S=A>=0?1:-1,E=S*A,N=E>gf,k=y*w;if(c.add(Mf(k*S*Cf(E),v*M+k*Tf(E))),a+=N?A+S*_f:A,N^p>=e^m>=e){var C=ys(ps(d),ps(b));bs(C);var P=ys(o,C);bs(P);var z=(N^A>=0?-1:1)*Rf(P[2]);(r>z||r===z&&(C[0]||C[1]))&&(u+=N^A>=0?1:-1)}}return(a<-df||a<df&&c<-pf)^1&u}function xl(t,n,e,r){return function(i){var o,a,u,c=n(i),f=pl(),s=n(f),l=!1,h={point:d,lineStart:g,lineEnd:y,polygonStart:function(){h.point=v,h.lineStart=_,h.lineEnd=b,a=[],o=[]},polygonEnd:function(){h.point=d,h.lineStart=g,h.lineEnd=y,a=ft(a);var t=ml(o,r);a.length?(l||(i.polygonStart(),l=!0),vl(a,Ml,t,e,i)):t&&(l||(i.polygonStart(),l=!0),i.lineStart(),e(null,null,1,i),i.lineEnd()),l&&(i.polygonEnd(),l=!1),a=o=null},sphere:function(){i.polygonStart(),i.lineStart(),e(null,null,1,i),i.lineEnd(),i.polygonEnd()}};function d(n,e){t(n,e)&&i.point(n,e)}function p(t,n){c.point(t,n)}function g(){h.point=p,c.lineStart()}function y(){h.point=d,c.lineEnd()}function v(t,n){u.push([t,n]),s.point(t,n)}function _(){s.lineStart(),u=[]}function b(){v(u[0][0],u[0][1]),s.lineEnd();var t,n,e,r,c=s.clean(),h=f.result(),d=h.length;if(u.pop(),o.push(u),u=null,d)if(1&c){if((n=(e=h[0]).length-1)>0){for(l||(i.polygonStart(),l=!0),i.lineStart(),t=0;t<n;++t)i.point((r=e[t])[0],r[1]);i.lineEnd()}}else d>1&&2&c&&h.push(h.pop().concat(h.shift())),a.push(h.filter(wl))}return h}}function wl(t){return t.length>1}function Ml(t,n){return((t=t.x)[0]<0?t[1]-yf-df:yf-t[1])-((n=n.x)[0]<0?n[1]-yf-df:yf-n[1])}al.invert=al;var Tl=xl((function(){return!0}),(function(t){var n,e=NaN,r=NaN,i=NaN;return{lineStart:function(){t.lineStart(),n=1},point:function(o,a){var u=o>0?gf:-gf,c=xf(o-e);xf(c-gf)<df?(t.point(e,r=(r+a)/2>0?yf:-yf),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(u,r),t.point(o,r),n=0):i!==u&&c>=gf&&(xf(e-i)<df&&(e-=i*df),xf(o-u)<df&&(o-=u*df),r=function(t,n,e,r){var i,o,a=Cf(t-e);return xf(a)>df?wf((Cf(n)*(o=Tf(r))*Cf(e)-Cf(r)*(i=Tf(n))*Cf(t))/(i*o*a)):(n+r)/2}(e,r,o,a),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(u,r),n=0),t.point(e=o,r=a),i=u},lineEnd:function(){t.lineEnd(),e=r=NaN},clean:function(){return 2-n}}}),(function(t,n,e,r){var i;if(null==t)i=e*yf,r.point(-gf,i),r.point(0,i),r.point(gf,i),r.point(gf,0),r.point(gf,-i),r.point(0,-i),r.point(-gf,-i),r.point(-gf,0),r.point(-gf,i);else if(xf(t[0]-n[0])>df){var o=t[0]<n[0]?gf:-gf;i=e*o/2,r.point(-o,i),r.point(0,i),r.point(o,i)}else r.point(n[0],n[1])}),[-gf,-yf]);function Al(t){var n=Tf(t),e=2*mf,r=n>0,i=xf(n)>df;function o(t,e){return Tf(t)*Tf(e)>n}function a(t,e,r){var i=[1,0,0],o=ys(ps(t),ps(e)),a=gs(o,o),u=o[0],c=a-u*u;if(!c)return!r&&t;var f=n*a/c,s=-n*u/c,l=ys(i,o),h=_s(i,f);vs(h,_s(o,s));var d=l,p=gs(h,d),g=gs(d,d),y=p*p-g*(gs(h,h)-1);if(!(y<0)){var v=zf(y),_=_s(d,(-p-v)/g);if(vs(_,h),_=ds(_),!r)return _;var b,m=t[0],x=e[0],w=t[1],M=e[1];x<m&&(b=m,m=x,x=b);var T=x-m,A=xf(T-gf)<df;if(!A&&M<w&&(b=w,w=M,M=b),A||T<df?A?w+M>0^_[1]<(xf(_[0]-m)<df?w:M):w<=_[1]&&_[1]<=M:T>gf^(m<=_[0]&&_[0]<=x)){var S=_s(d,(-p+v)/g);return vs(S,h),[_,ds(S)]}}}function u(n,e){var i=r?t:gf-t,o=0;return n<-i?o|=1:n>i&&(o|=2),e<-i?o|=4:e>i&&(o|=8),o}return xl(o,(function(t){var n,e,c,f,s;return{lineStart:function(){f=c=!1,s=1},point:function(l,h){var d,p=[l,h],g=o(l,h),y=r?g?0:u(l,h):g?u(l+(l<0?gf:-gf),h):0;if(!n&&(f=c=g)&&t.lineStart(),g!==c&&(!(d=a(n,p))||gl(n,d)||gl(p,d))&&(p[2]=1),g!==c)s=0,g?(t.lineStart(),d=a(p,n),t.point(d[0],d[1])):(d=a(n,p),t.point(d[0],d[1],2),t.lineEnd()),n=d;else if(i&&n&&r^g){var v;y&e||!(v=a(p,n,!0))||(s=0,r?(t.lineStart(),t.point(v[0][0],v[0][1]),t.point(v[1][0],v[1][1]),t.lineEnd()):(t.point(v[1][0],v[1][1]),t.lineEnd(),t.lineStart(),t.point(v[0][0],v[0][1],3)))}!g||n&&gl(n,p)||t.point(p[0],p[1]),n=p,c=g,e=y},lineEnd:function(){c&&t.lineEnd(),n=null},clean:function(){return s|(f&&c)<<1}}}),(function(n,r,i,o){hl(o,t,e,i,n,r)}),r?[0,-t]:[-gf,t-gf])}var Sl,El,Nl,kl,Cl=1e9,Pl=-Cl;function zl(t,n,e,r){function i(i,o){return t<=i&&i<=e&&n<=o&&o<=r}function o(i,o,u,f){var s=0,l=0;if(null==i||(s=a(i,u))!==(l=a(o,u))||c(i,o)<0^u>0)do{f.point(0===s||3===s?t:e,s>1?r:n)}while((s=(s+u+4)%4)!==l);else f.point(o[0],o[1])}function a(r,i){return xf(r[0]-t)<df?i>0?0:3:xf(r[0]-e)<df?i>0?2:1:xf(r[1]-n)<df?i>0?1:0:i>0?3:2}function u(t,n){return c(t.x,n.x)}function c(t,n){var e=a(t,1),r=a(n,1);return e!==r?e-r:0===e?n[1]-t[1]:1===e?t[0]-n[0]:2===e?t[1]-n[1]:n[0]-t[0]}return function(a){var c,f,s,l,h,d,p,g,y,v,_,b=a,m=pl(),x={point:w,lineStart:function(){x.point=M,f&&f.push(s=[]);v=!0,y=!1,p=g=NaN},lineEnd:function(){c&&(M(l,h),d&&y&&m.rejoin(),c.push(m.result()));x.point=w,y&&b.lineEnd()},polygonStart:function(){b=m,c=[],f=[],_=!0},polygonEnd:function(){var n=function(){for(var n=0,e=0,i=f.length;e<i;++e)for(var o,a,u=f[e],c=1,s=u.length,l=u[0],h=l[0],d=l[1];c<s;++c)o=h,a=d,h=(l=u[c])[0],d=l[1],a<=r?d>r&&(h-o)*(r-a)>(d-a)*(t-o)&&++n:d<=r&&(h-o)*(r-a)<(d-a)*(t-o)&&--n;return n}(),e=_&&n,i=(c=ft(c)).length;(e||i)&&(a.polygonStart(),e&&(a.lineStart(),o(null,null,1,a),a.lineEnd()),i&&vl(c,u,n,o,a),a.polygonEnd());b=a,c=f=s=null}};function w(t,n){i(t,n)&&b.point(t,n)}function M(o,a){var u=i(o,a);if(f&&s.push([o,a]),v)l=o,h=a,d=u,v=!1,u&&(b.lineStart(),b.point(o,a));else if(u&&y)b.point(o,a);else{var c=[p=Math.max(Pl,Math.min(Cl,p)),g=Math.max(Pl,Math.min(Cl,g))],m=[o=Math.max(Pl,Math.min(Cl,o)),a=Math.max(Pl,Math.min(Cl,a))];!function(t,n,e,r,i,o){var a,u=t[0],c=t[1],f=0,s=1,l=n[0]-u,h=n[1]-c;if(a=e-u,l||!(a>0)){if(a/=l,l<0){if(a<f)return;a<s&&(s=a)}else if(l>0){if(a>s)return;a>f&&(f=a)}if(a=i-u,l||!(a<0)){if(a/=l,l<0){if(a>s)return;a>f&&(f=a)}else if(l>0){if(a<f)return;a<s&&(s=a)}if(a=r-c,h||!(a>0)){if(a/=h,h<0){if(a<f)return;a<s&&(s=a)}else if(h>0){if(a>s)return;a>f&&(f=a)}if(a=o-c,h||!(a<0)){if(a/=h,h<0){if(a>s)return;a>f&&(f=a)}else if(h>0){if(a<f)return;a<s&&(s=a)}return f>0&&(t[0]=u+f*l,t[1]=c+f*h),s<1&&(n[0]=u+s*l,n[1]=c+s*h),!0}}}}}(c,m,t,n,e,r)?u&&(b.lineStart(),b.point(o,a),_=!1):(y||(b.lineStart(),b.point(c[0],c[1])),b.point(m[0],m[1]),u||b.lineEnd(),_=!1)}p=o,g=a,y=u}return x}}var $l={sphere:qf,point:qf,lineStart:function(){$l.point=Rl,$l.lineEnd=Dl},lineEnd:qf,polygonStart:qf,polygonEnd:qf};function Dl(){$l.point=$l.lineEnd=qf}function Rl(t,n){El=t*=mf,Nl=Cf(n*=mf),kl=Tf(n),$l.point=Fl}function Fl(t,n){t*=mf;var e=Cf(n*=mf),r=Tf(n),i=xf(t-El),o=Tf(i),a=r*Cf(i),u=kl*e-Nl*r*o,c=Nl*e+kl*r*o;Sl.add(Mf(zf(a*a+u*u),c)),El=t,Nl=e,kl=r}function ql(t){return Sl=new T,Lf(t,$l),+Sl}var Ul=[null,null],Il={type:"LineString",coordinates:Ul};function Ol(t,n){return Ul[0]=t,Ul[1]=n,ql(Il)}var Bl={Feature:function(t,n){return Ll(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)if(Ll(e[r].geometry,n))return!0;return!1}},Yl={Sphere:function(){return!0},Point:function(t,n){return jl(t.coordinates,n)},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(jl(e[r],n))return!0;return!1},LineString:function(t,n){return Hl(t.coordinates,n)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(Hl(e[r],n))return!0;return!1},Polygon:function(t,n){return Xl(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(Xl(e[r],n))return!0;return!1},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)if(Ll(e[r],n))return!0;return!1}};function Ll(t,n){return!(!t||!Yl.hasOwnProperty(t.type))&&Yl[t.type](t,n)}function jl(t,n){return 0===Ol(t,n)}function Hl(t,n){for(var e,r,i,o=0,a=t.length;o<a;o++){if(0===(r=Ol(t[o],n)))return!0;if(o>0&&(i=Ol(t[o],t[o-1]))>0&&e<=i&&r<=i&&(e+r-i)*(1-Math.pow((e-r)/i,2))<pf*i)return!0;e=r}return!1}function Xl(t,n){return!!ml(t.map(Gl),Vl(n))}function Gl(t){return(t=t.map(Vl)).pop(),t}function Vl(t){return[t[0]*mf,t[1]*mf]}function Wl(t,n,e){var r=lt(t,n-df,e).concat(n);return function(t){return r.map((function(n){return[t,n]}))}}function Zl(t,n,e){var r=lt(t,n-df,e).concat(n);return function(t){return r.map((function(n){return[n,t]}))}}function Kl(){var t,n,e,r,i,o,a,u,c,f,s,l,h=10,d=h,p=90,g=360,y=2.5;function v(){return{type:"MultiLineString",coordinates:_()}}function _(){return lt(Af(r/p)*p,e,p).map(s).concat(lt(Af(u/g)*g,a,g).map(l)).concat(lt(Af(n/h)*h,t,h).filter((function(t){return xf(t%p)>df})).map(c)).concat(lt(Af(o/d)*d,i,d).filter((function(t){return xf(t%g)>df})).map(f))}return v.lines=function(){return _().map((function(t){return{type:"LineString",coordinates:t}}))},v.outline=function(){return{type:"Polygon",coordinates:[s(r).concat(l(a).slice(1),s(e).reverse().slice(1),l(u).reverse().slice(1))]}},v.extent=function(t){return arguments.length?v.extentMajor(t).extentMinor(t):v.extentMinor()},v.extentMajor=function(t){return arguments.length?(r=+t[0][0],e=+t[1][0],u=+t[0][1],a=+t[1][1],r>e&&(t=r,r=e,e=t),u>a&&(t=u,u=a,a=t),v.precision(y)):[[r,u],[e,a]]},v.extentMinor=function(e){return arguments.length?(n=+e[0][0],t=+e[1][0],o=+e[0][1],i=+e[1][1],n>t&&(e=n,n=t,t=e),o>i&&(e=o,o=i,i=e),v.precision(y)):[[n,o],[t,i]]},v.step=function(t){return arguments.length?v.stepMajor(t).stepMinor(t):v.stepMinor()},v.stepMajor=function(t){return arguments.length?(p=+t[0],g=+t[1],v):[p,g]},v.stepMinor=function(t){return arguments.length?(h=+t[0],d=+t[1],v):[h,d]},v.precision=function(h){return arguments.length?(y=+h,c=Wl(o,i,90),f=Zl(n,t,y),s=Wl(u,a,90),l=Zl(r,e,y),v):y},v.extentMajor([[-180,-90+df],[180,90-df]]).extentMinor([[-180,-80-df],[180,80+df]])}var Ql,Jl,th,nh,eh=t=>t,rh=new T,ih=new T,oh={point:qf,lineStart:qf,lineEnd:qf,polygonStart:function(){oh.lineStart=ah,oh.lineEnd=fh},polygonEnd:function(){oh.lineStart=oh.lineEnd=oh.point=qf,rh.add(xf(ih)),ih=new T},result:function(){var t=rh/2;return rh=new T,t}};function ah(){oh.point=uh}function uh(t,n){oh.point=ch,Ql=th=t,Jl=nh=n}function ch(t,n){ih.add(nh*t-th*n),th=t,nh=n}function fh(){ch(Ql,Jl)}var sh=oh,lh=1/0,hh=lh,dh=-lh,ph=dh,gh={point:function(t,n){t<lh&&(lh=t);t>dh&&(dh=t);n<hh&&(hh=n);n>ph&&(ph=n)},lineStart:qf,lineEnd:qf,polygonStart:qf,polygonEnd:qf,result:function(){var t=[[lh,hh],[dh,ph]];return dh=ph=-(hh=lh=1/0),t}};var yh,vh,_h,bh,mh=gh,xh=0,wh=0,Mh=0,Th=0,Ah=0,Sh=0,Eh=0,Nh=0,kh=0,Ch={point:Ph,lineStart:zh,lineEnd:Rh,polygonStart:function(){Ch.lineStart=Fh,Ch.lineEnd=qh},polygonEnd:function(){Ch.point=Ph,Ch.lineStart=zh,Ch.lineEnd=Rh},result:function(){var t=kh?[Eh/kh,Nh/kh]:Sh?[Th/Sh,Ah/Sh]:Mh?[xh/Mh,wh/Mh]:[NaN,NaN];return xh=wh=Mh=Th=Ah=Sh=Eh=Nh=kh=0,t}};function Ph(t,n){xh+=t,wh+=n,++Mh}function zh(){Ch.point=$h}function $h(t,n){Ch.point=Dh,Ph(_h=t,bh=n)}function Dh(t,n){var e=t-_h,r=n-bh,i=zf(e*e+r*r);Th+=i*(_h+t)/2,Ah+=i*(bh+n)/2,Sh+=i,Ph(_h=t,bh=n)}function Rh(){Ch.point=Ph}function Fh(){Ch.point=Uh}function qh(){Ih(yh,vh)}function Uh(t,n){Ch.point=Ih,Ph(yh=_h=t,vh=bh=n)}function Ih(t,n){var e=t-_h,r=n-bh,i=zf(e*e+r*r);Th+=i*(_h+t)/2,Ah+=i*(bh+n)/2,Sh+=i,Eh+=(i=bh*t-_h*n)*(_h+t),Nh+=i*(bh+n),kh+=3*i,Ph(_h=t,bh=n)}var Oh=Ch;function Bh(t){this._context=t}Bh.prototype={_radius:4.5,pointRadius:function(t){return this._radius=t,this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._context.closePath(),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._context.moveTo(t,n),this._point=1;break;case 1:this._context.lineTo(t,n);break;default:this._context.moveTo(t+this._radius,n),this._context.arc(t,n,this._radius,0,_f)}},result:qf};var Yh,Lh,jh,Hh,Xh,Gh=new T,Vh={point:qf,lineStart:function(){Vh.point=Wh},lineEnd:function(){Yh&&Zh(Lh,jh),Vh.point=qf},polygonStart:function(){Yh=!0},polygonEnd:function(){Yh=null},result:function(){var t=+Gh;return Gh=new T,t}};function Wh(t,n){Vh.point=Zh,Lh=Hh=t,jh=Xh=n}function Zh(t,n){Hh-=t,Xh-=n,Gh.add(zf(Hh*Hh+Xh*Xh)),Hh=t,Xh=n}var Kh=Vh;let Qh,Jh,td,nd;class ed{constructor(t){this._append=null==t?rd:function(t){const n=Math.floor(t);if(!(n>=0))throw new RangeError(`invalid digits: ${t}`);if(n>15)return rd;if(n!==Qh){const t=10**n;Qh=n,Jh=function(n){let e=1;this._+=n[0];for(const r=n.length;e<r;++e)this._+=Math.round(arguments[e]*t)/t+n[e]}}return Jh}(t),this._radius=4.5,this._=""}pointRadius(t){return this._radius=+t,this}polygonStart(){this._line=0}polygonEnd(){this._line=NaN}lineStart(){this._point=0}lineEnd(){0===this._line&&(this._+="Z"),this._point=NaN}point(t,n){switch(this._point){case 0:this._append`M${t},${n}`,this._point=1;break;case 1:this._append`L${t},${n}`;break;default:if(this._append`M${t},${n}`,this._radius!==td||this._append!==Jh){const t=this._radius,n=this._;this._="",this._append`m0,${t}a${t},${t} 0 1,1 0,${-2*t}a${t},${t} 0 1,1 0,${2*t}z`,td=t,Jh=this._append,nd=this._,this._=n}this._+=nd}}result(){const t=this._;return this._="",t.length?t:null}}function rd(t){let n=1;this._+=t[0];for(const e=t.length;n<e;++n)this._+=arguments[n]+t[n]}function id(t){return function(n){var e=new od;for(var r in t)e[r]=t[r];return e.stream=n,e}}function od(){}function ad(t,n,e){var r=t.clipExtent&&t.clipExtent();return t.scale(150).translate([0,0]),null!=r&&t.clipExtent(null),Lf(e,t.stream(mh)),n(mh.result()),null!=r&&t.clipExtent(r),t}function ud(t,n,e){return ad(t,(function(e){var r=n[1][0]-n[0][0],i=n[1][1]-n[0][1],o=Math.min(r/(e[1][0]-e[0][0]),i/(e[1][1]-e[0][1])),a=+n[0][0]+(r-o*(e[1][0]+e[0][0]))/2,u=+n[0][1]+(i-o*(e[1][1]+e[0][1]))/2;t.scale(150*o).translate([a,u])}),e)}function cd(t,n,e){return ud(t,[[0,0],n],e)}function fd(t,n,e){return ad(t,(function(e){var r=+n,i=r/(e[1][0]-e[0][0]),o=(r-i*(e[1][0]+e[0][0]))/2,a=-i*e[0][1];t.scale(150*i).translate([o,a])}),e)}function sd(t,n,e){return ad(t,(function(e){var r=+n,i=r/(e[1][1]-e[0][1]),o=-i*e[0][0],a=(r-i*(e[1][1]+e[0][1]))/2;t.scale(150*i).translate([o,a])}),e)}od.prototype={constructor:od,point:function(t,n){this.stream.point(t,n)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}};var ld=16,hd=Tf(30*mf);function dd(t,n){return+n?function(t,n){function e(r,i,o,a,u,c,f,s,l,h,d,p,g,y){var v=f-r,_=s-i,b=v*v+_*_;if(b>4*n&&g--){var m=a+h,x=u+d,w=c+p,M=zf(m*m+x*x+w*w),T=Rf(w/=M),A=xf(xf(w)-1)<df||xf(o-l)<df?(o+l)/2:Mf(x,m),S=t(A,T),E=S[0],N=S[1],k=E-r,C=N-i,P=_*k-v*C;(P*P/b>n||xf((v*k+_*C)/b-.5)>.3||a*h+u*d+c*p<hd)&&(e(r,i,o,a,u,c,E,N,A,m/=M,x/=M,w,g,y),y.point(E,N),e(E,N,A,m,x,w,f,s,l,h,d,p,g,y))}}return function(n){var r,i,o,a,u,c,f,s,l,h,d,p,g={point:y,lineStart:v,lineEnd:b,polygonStart:function(){n.polygonStart(),g.lineStart=m},polygonEnd:function(){n.polygonEnd(),g.lineStart=v}};function y(e,r){e=t(e,r),n.point(e[0],e[1])}function v(){s=NaN,g.point=_,n.lineStart()}function _(r,i){var o=ps([r,i]),a=t(r,i);e(s,l,f,h,d,p,s=a[0],l=a[1],f=r,h=o[0],d=o[1],p=o[2],ld,n),n.point(s,l)}function b(){g.point=y,n.lineEnd()}function m(){v(),g.point=x,g.lineEnd=w}function x(t,n){_(r=t,n),i=s,o=l,a=h,u=d,c=p,g.point=_}function w(){e(s,l,f,h,d,p,i,o,r,a,u,c,ld,n),g.lineEnd=b,b()}return g}}(t,n):function(t){return id({point:function(n,e){n=t(n,e),this.stream.point(n[0],n[1])}})}(t)}var pd=id({point:function(t,n){this.stream.point(t*mf,n*mf)}});function gd(t,n,e,r,i,o){if(!o)return function(t,n,e,r,i){function o(o,a){return[n+t*(o*=r),e-t*(a*=i)]}return o.invert=function(o,a){return[(o-n)/t*r,(e-a)/t*i]},o}(t,n,e,r,i);var a=Tf(o),u=Cf(o),c=a*t,f=u*t,s=a/t,l=u/t,h=(u*e-a*n)/t,d=(u*n+a*e)/t;function p(t,o){return[c*(t*=r)-f*(o*=i)+n,e-f*t-c*o]}return p.invert=function(t,n){return[r*(s*t-l*n+h),i*(d-l*t-s*n)]},p}function yd(t){return vd((function(){return t}))()}function vd(t){var n,e,r,i,o,a,u,c,f,s,l=150,h=480,d=250,p=0,g=0,y=0,v=0,_=0,b=0,m=1,x=1,w=null,M=Tl,T=null,A=eh,S=.5;function E(t){return c(t[0]*mf,t[1]*mf)}function N(t){return(t=c.invert(t[0],t[1]))&&[t[0]*bf,t[1]*bf]}function k(){var t=gd(l,0,0,m,x,b).apply(null,n(p,g)),r=gd(l,h-t[0],d-t[1],m,x,b);return e=ul(y,v,_),u=ol(n,r),c=ol(e,u),a=dd(u,S),C()}function C(){return f=s=null,E}return E.stream=function(t){return f&&s===t?f:f=pd(function(t){return id({point:function(n,e){var r=t(n,e);return this.stream.point(r[0],r[1])}})}(e)(M(a(A(s=t)))))},E.preclip=function(t){return arguments.length?(M=t,w=void 0,C()):M},E.postclip=function(t){return arguments.length?(A=t,T=r=i=o=null,C()):A},E.clipAngle=function(t){return arguments.length?(M=+t?Al(w=t*mf):(w=null,Tl),C()):w*bf},E.clipExtent=function(t){return arguments.length?(A=null==t?(T=r=i=o=null,eh):zl(T=+t[0][0],r=+t[0][1],i=+t[1][0],o=+t[1][1]),C()):null==T?null:[[T,r],[i,o]]},E.scale=function(t){return arguments.length?(l=+t,k()):l},E.translate=function(t){return arguments.length?(h=+t[0],d=+t[1],k()):[h,d]},E.center=function(t){return arguments.length?(p=t[0]%360*mf,g=t[1]%360*mf,k()):[p*bf,g*bf]},E.rotate=function(t){return arguments.length?(y=t[0]%360*mf,v=t[1]%360*mf,_=t.length>2?t[2]%360*mf:0,k()):[y*bf,v*bf,_*bf]},E.angle=function(t){return arguments.length?(b=t%360*mf,k()):b*bf},E.reflectX=function(t){return arguments.length?(m=t?-1:1,k()):m<0},E.reflectY=function(t){return arguments.length?(x=t?-1:1,k()):x<0},E.precision=function(t){return arguments.length?(a=dd(u,S=t*t),C()):zf(S)},E.fitExtent=function(t,n){return ud(E,t,n)},E.fitSize=function(t,n){return cd(E,t,n)},E.fitWidth=function(t,n){return fd(E,t,n)},E.fitHeight=function(t,n){return sd(E,t,n)},function(){return n=t.apply(this,arguments),E.invert=n.invert&&N,k()}}function _d(t){var n=0,e=gf/3,r=vd(t),i=r(n,e);return i.parallels=function(t){return arguments.length?r(n=t[0]*mf,e=t[1]*mf):[n*bf,e*bf]},i}function bd(t,n){var e=Cf(t),r=(e+Cf(n))/2;if(xf(r)<df)return function(t){var n=Tf(t);function e(t,e){return[t*n,Cf(e)/n]}return e.invert=function(t,e){return[t/n,Rf(e*n)]},e}(t);var i=1+e*(2*r-e),o=zf(i)/r;function a(t,n){var e=zf(i-2*r*Cf(n))/r;return[e*Cf(t*=r),o-e*Tf(t)]}return a.invert=function(t,n){var e=o-n,a=Mf(t,xf(e))*Pf(e);return e*r<0&&(a-=gf*Pf(t)*Pf(e)),[a/r,Rf((i-(t*t+e*e)*r*r)/(2*r))]},a}function md(){return _d(bd).scale(155.424).center([0,33.6442])}function xd(){return md().parallels([29.5,45.5]).scale(1070).translate([480,250]).rotate([96,0]).center([-.6,38.7])}function wd(t){return function(n,e){var r=Tf(n),i=Tf(e),o=t(r*i);return o===1/0?[2,0]:[o*i*Cf(n),o*Cf(e)]}}function Md(t){return function(n,e){var r=zf(n*n+e*e),i=t(r),o=Cf(i),a=Tf(i);return[Mf(n*o,r*a),Rf(r&&e*o/r)]}}var Td=wd((function(t){return zf(2/(1+t))}));Td.invert=Md((function(t){return 2*Rf(t/2)}));var Ad=wd((function(t){return(t=Df(t))&&t/Cf(t)}));function Sd(t,n){return[t,Nf($f((yf+n)/2))]}function Ed(t){var n,e,r,i=yd(t),o=i.center,a=i.scale,u=i.translate,c=i.clipExtent,f=null;function s(){var o=gf*a(),u=i(ll(i.rotate()).invert([0,0]));return c(null==f?[[u[0]-o,u[1]-o],[u[0]+o,u[1]+o]]:t===Sd?[[Math.max(u[0]-o,f),n],[Math.min(u[0]+o,e),r]]:[[f,Math.max(u[1]-o,n)],[e,Math.min(u[1]+o,r)]])}return i.scale=function(t){return arguments.length?(a(t),s()):a()},i.translate=function(t){return arguments.length?(u(t),s()):u()},i.center=function(t){return arguments.length?(o(t),s()):o()},i.clipExtent=function(t){return arguments.length?(null==t?f=n=e=r=null:(f=+t[0][0],n=+t[0][1],e=+t[1][0],r=+t[1][1]),s()):null==f?null:[[f,n],[e,r]]},s()}function Nd(t){return $f((yf+t)/2)}function kd(t,n){var e=Tf(t),r=t===n?Cf(t):Nf(e/Tf(n))/Nf(Nd(n)/Nd(t)),i=e*kf(Nd(t),r)/r;if(!r)return Sd;function o(t,n){i>0?n<-yf+df&&(n=-yf+df):n>yf-df&&(n=yf-df);var e=i/kf(Nd(n),r);return[e*Cf(r*t),i-e*Tf(r*t)]}return o.invert=function(t,n){var e=i-n,o=Pf(r)*zf(t*t+e*e),a=Mf(t,xf(e))*Pf(e);return e*r<0&&(a-=gf*Pf(t)*Pf(e)),[a/r,2*wf(kf(i/o,1/r))-yf]},o}function Cd(t,n){return[t,n]}function Pd(t,n){var e=Tf(t),r=t===n?Cf(t):(e-Tf(n))/(n-t),i=e/r+t;if(xf(r)<df)return Cd;function o(t,n){var e=i-n,o=r*t;return[e*Cf(o),i-e*Tf(o)]}return o.invert=function(t,n){var e=i-n,o=Mf(t,xf(e))*Pf(e);return e*r<0&&(o-=gf*Pf(t)*Pf(e)),[o/r,i-Pf(r)*zf(t*t+e*e)]},o}Ad.invert=Md((function(t){return t})),Sd.invert=function(t,n){return[t,2*wf(Sf(n))-yf]},Cd.invert=Cd;var zd=1.340264,$d=-.081106,Dd=893e-6,Rd=.003796,Fd=zf(3)/2;function qd(t,n){var e=Rf(Fd*Cf(n)),r=e*e,i=r*r*r;return[t*Tf(e)/(Fd*(zd+3*$d*r+i*(7*Dd+9*Rd*r))),e*(zd+$d*r+i*(Dd+Rd*r))]}function Ud(t,n){var e=Tf(n),r=Tf(t)*e;return[e*Cf(t)/r,Cf(n)/r]}function Id(t,n){var e=n*n,r=e*e;return[t*(.8707-.131979*e+r*(r*(.003971*e-.001529*r)-.013791)),n*(1.007226+e*(.015085+r*(.028874*e-.044475-.005916*r)))]}function Od(t,n){return[Tf(n)*Cf(t),Cf(n)]}function Bd(t,n){var e=Tf(n),r=1+Tf(t)*e;return[e*Cf(t)/r,Cf(n)/r]}function Yd(t,n){return[Nf($f((yf+n)/2)),-t]}function Ld(t,n){return t.parent===n.parent?1:2}function jd(t,n){return t+n.x}function Hd(t,n){return Math.max(t,n.y)}function Xd(t){var n=0,e=t.children,r=e&&e.length;if(r)for(;--r>=0;)n+=e[r].value;else n=1;t.value=n}function Gd(t,n){t instanceof Map?(t=[void 0,t],void 0===n&&(n=Wd)):void 0===n&&(n=Vd);for(var e,r,i,o,a,u=new Qd(t),c=[u];e=c.pop();)if((i=n(e.data))&&(a=(i=Array.from(i)).length))for(e.children=i,o=a-1;o>=0;--o)c.push(r=i[o]=new Qd(i[o])),r.parent=e,r.depth=e.depth+1;return u.eachBefore(Kd)}function Vd(t){return t.children}function Wd(t){return Array.isArray(t)?t[1]:null}function Zd(t){void 0!==t.data.value&&(t.value=t.data.value),t.data=t.data.data}function Kd(t){var n=0;do{t.height=n}while((t=t.parent)&&t.height<++n)}function Qd(t){this.data=t,this.depth=this.height=0,this.parent=null}function Jd(t){return null==t?null:tp(t)}function tp(t){if("function"!=typeof t)throw new Error;return t}function np(){return 0}function ep(t){return function(){return t}}qd.invert=function(t,n){for(var e,r=n,i=r*r,o=i*i*i,a=0;a<12&&(o=(i=(r-=e=(r*(zd+$d*i+o*(Dd+Rd*i))-n)/(zd+3*$d*i+o*(7*Dd+9*Rd*i)))*r)*i*i,!(xf(e)<pf));++a);return[Fd*t*(zd+3*$d*i+o*(7*Dd+9*Rd*i))/Tf(r),Rf(Cf(r)/Fd)]},Ud.invert=Md(wf),Id.invert=function(t,n){var e,r=n,i=25;do{var o=r*r,a=o*o;r-=e=(r*(1.007226+o*(.015085+a*(.028874*o-.044475-.005916*a)))-n)/(1.007226+o*(.045255+a*(.259866*o-.311325-.005916*11*a)))}while(xf(e)>df&&--i>0);return[t/(.8707+(o=r*r)*(o*(o*o*o*(.003971-.001529*o)-.013791)-.131979)),r]},Od.invert=Md(Rf),Bd.invert=Md((function(t){return 2*wf(t)})),Yd.invert=function(t,n){return[-n,2*wf(Sf(t))-yf]},Qd.prototype=Gd.prototype={constructor:Qd,count:function(){return this.eachAfter(Xd)},each:function(t,n){let e=-1;for(const r of this)t.call(n,r,++e,this);return this},eachAfter:function(t,n){for(var e,r,i,o=this,a=[o],u=[],c=-1;o=a.pop();)if(u.push(o),e=o.children)for(r=0,i=e.length;r<i;++r)a.push(e[r]);for(;o=u.pop();)t.call(n,o,++c,this);return this},eachBefore:function(t,n){for(var e,r,i=this,o=[i],a=-1;i=o.pop();)if(t.call(n,i,++a,this),e=i.children)for(r=e.length-1;r>=0;--r)o.push(e[r]);return this},find:function(t,n){let e=-1;for(const r of this)if(t.call(n,r,++e,this))return r},sum:function(t){return this.eachAfter((function(n){for(var e=+t(n.data)||0,r=n.children,i=r&&r.length;--i>=0;)e+=r[i].value;n.value=e}))},sort:function(t){return this.eachBefore((function(n){n.children&&n.children.sort(t)}))},path:function(t){for(var n=this,e=function(t,n){if(t===n)return t;var e=t.ancestors(),r=n.ancestors(),i=null;t=e.pop(),n=r.pop();for(;t===n;)i=t,t=e.pop(),n=r.pop();return i}(n,t),r=[n];n!==e;)n=n.parent,r.push(n);for(var i=r.length;t!==e;)r.splice(i,0,t),t=t.parent;return r},ancestors:function(){for(var t=this,n=[t];t=t.parent;)n.push(t);return n},descendants:function(){return Array.from(this)},leaves:function(){var t=[];return this.eachBefore((function(n){n.children||t.push(n)})),t},links:function(){var t=this,n=[];return t.each((function(e){e!==t&&n.push({source:e.parent,target:e})})),n},copy:function(){return Gd(this).eachBefore(Zd)},[Symbol.iterator]:function*(){var t,n,e,r,i=this,o=[i];do{for(t=o.reverse(),o=[];i=t.pop();)if(yield i,n=i.children)for(e=0,r=n.length;e<r;++e)o.push(n[e])}while(o.length)}};const rp=1664525,ip=1013904223,op=4294967296;function ap(){let t=1;return()=>(t=(rp*t+ip)%op)/op}function up(t,n){for(var e,r,i=0,o=(t=function(t,n){let e,r,i=t.length;for(;i;)r=n()*i--|0,e=t[i],t[i]=t[r],t[r]=e;return t}(Array.from(t),n)).length,a=[];i<o;)e=t[i],r&&sp(r,e)?++i:(r=hp(a=cp(a,e)),i=0);return r}function cp(t,n){var e,r;if(lp(n,t))return[n];for(e=0;e<t.length;++e)if(fp(n,t[e])&&lp(dp(t[e],n),t))return[t[e],n];for(e=0;e<t.length-1;++e)for(r=e+1;r<t.length;++r)if(fp(dp(t[e],t[r]),n)&&fp(dp(t[e],n),t[r])&&fp(dp(t[r],n),t[e])&&lp(pp(t[e],t[r],n),t))return[t[e],t[r],n];throw new Error}function fp(t,n){var e=t.r-n.r,r=n.x-t.x,i=n.y-t.y;return e<0||e*e<r*r+i*i}function sp(t,n){var e=t.r-n.r+1e-9*Math.max(t.r,n.r,1),r=n.x-t.x,i=n.y-t.y;return e>0&&e*e>r*r+i*i}function lp(t,n){for(var e=0;e<n.length;++e)if(!sp(t,n[e]))return!1;return!0}function hp(t){switch(t.length){case 1:return function(t){return{x:t.x,y:t.y,r:t.r}}(t[0]);case 2:return dp(t[0],t[1]);case 3:return pp(t[0],t[1],t[2])}}function dp(t,n){var e=t.x,r=t.y,i=t.r,o=n.x,a=n.y,u=n.r,c=o-e,f=a-r,s=u-i,l=Math.sqrt(c*c+f*f);return{x:(e+o+c/l*s)/2,y:(r+a+f/l*s)/2,r:(l+i+u)/2}}function pp(t,n,e){var r=t.x,i=t.y,o=t.r,a=n.x,u=n.y,c=n.r,f=e.x,s=e.y,l=e.r,h=r-a,d=r-f,p=i-u,g=i-s,y=c-o,v=l-o,_=r*r+i*i-o*o,b=_-a*a-u*u+c*c,m=_-f*f-s*s+l*l,x=d*p-h*g,w=(p*m-g*b)/(2*x)-r,M=(g*y-p*v)/x,T=(d*b-h*m)/(2*x)-i,A=(h*v-d*y)/x,S=M*M+A*A-1,E=2*(o+w*M+T*A),N=w*w+T*T-o*o,k=-(Math.abs(S)>1e-6?(E+Math.sqrt(E*E-4*S*N))/(2*S):N/E);return{x:r+w+M*k,y:i+T+A*k,r:k}}function gp(t,n,e){var r,i,o,a,u=t.x-n.x,c=t.y-n.y,f=u*u+c*c;f?(i=n.r+e.r,i*=i,a=t.r+e.r,i>(a*=a)?(r=(f+a-i)/(2*f),o=Math.sqrt(Math.max(0,a/f-r*r)),e.x=t.x-r*u-o*c,e.y=t.y-r*c+o*u):(r=(f+i-a)/(2*f),o=Math.sqrt(Math.max(0,i/f-r*r)),e.x=n.x+r*u-o*c,e.y=n.y+r*c+o*u)):(e.x=n.x+e.r,e.y=n.y)}function yp(t,n){var e=t.r+n.r-1e-6,r=n.x-t.x,i=n.y-t.y;return e>0&&e*e>r*r+i*i}function vp(t){var n=t._,e=t.next._,r=n.r+e.r,i=(n.x*e.r+e.x*n.r)/r,o=(n.y*e.r+e.y*n.r)/r;return i*i+o*o}function _p(t){this._=t,this.next=null,this.previous=null}function bp(t,n){if(!(o=(t=function(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}(t)).length))return 0;var e,r,i,o,a,u,c,f,s,l,h;if((e=t[0]).x=0,e.y=0,!(o>1))return e.r;if(r=t[1],e.x=-r.r,r.x=e.r,r.y=0,!(o>2))return e.r+r.r;gp(r,e,i=t[2]),e=new _p(e),r=new _p(r),i=new _p(i),e.next=i.previous=r,r.next=e.previous=i,i.next=r.previous=e;t:for(c=3;c<o;++c){gp(e._,r._,i=t[c]),i=new _p(i),f=r.next,s=e.previous,l=r._.r,h=e._.r;do{if(l<=h){if(yp(f._,i._)){r=f,e.next=r,r.previous=e,--c;continue t}l+=f._.r,f=f.next}else{if(yp(s._,i._)){(e=s).next=r,r.previous=e,--c;continue t}h+=s._.r,s=s.previous}}while(f!==s.next);for(i.previous=e,i.next=r,e.next=r.previous=r=i,a=vp(e);(i=i.next)!==r;)(u=vp(i))<a&&(e=i,a=u);r=e.next}for(e=[r._],i=r;(i=i.next)!==r;)e.push(i._);for(i=up(e,n),c=0;c<o;++c)(e=t[c]).x-=i.x,e.y-=i.y;return i.r}function mp(t){return Math.sqrt(t.value)}function xp(t){return function(n){n.children||(n.r=Math.max(0,+t(n)||0))}}function wp(t,n,e){return function(r){if(i=r.children){var i,o,a,u=i.length,c=t(r)*n||0;if(c)for(o=0;o<u;++o)i[o].r+=c;if(a=bp(i,e),c)for(o=0;o<u;++o)i[o].r-=c;r.r=a+c}}}function Mp(t){return function(n){var e=n.parent;n.r*=t,e&&(n.x=e.x+t*n.x,n.y=e.y+t*n.y)}}function Tp(t){t.x0=Math.round(t.x0),t.y0=Math.round(t.y0),t.x1=Math.round(t.x1),t.y1=Math.round(t.y1)}function Ap(t,n,e,r,i){for(var o,a=t.children,u=-1,c=a.length,f=t.value&&(r-n)/t.value;++u<c;)(o=a[u]).y0=e,o.y1=i,o.x0=n,o.x1=n+=o.value*f}var Sp={depth:-1},Ep={},Np={};function kp(t){return t.id}function Cp(t){return t.parentId}function Pp(t){let n=t.length;if(n<2)return"";for(;--n>1&&!zp(t,n););return t.slice(0,n)}function zp(t,n){if("/"===t[n]){let e=0;for(;n>0&&"\\"===t[--n];)++e;if(!(1&e))return!0}return!1}function $p(t,n){return t.parent===n.parent?1:2}function Dp(t){var n=t.children;return n?n[0]:t.t}function Rp(t){var n=t.children;return n?n[n.length-1]:t.t}function Fp(t,n,e){var r=e/(n.i-t.i);n.c-=r,n.s+=e,t.c+=r,n.z+=e,n.m+=e}function qp(t,n,e){return t.a.parent===n.parent?t.a:e}function Up(t,n){this._=t,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=n}function Ip(t,n,e,r,i){for(var o,a=t.children,u=-1,c=a.length,f=t.value&&(i-e)/t.value;++u<c;)(o=a[u]).x0=n,o.x1=r,o.y0=e,o.y1=e+=o.value*f}Up.prototype=Object.create(Qd.prototype);var Op=(1+Math.sqrt(5))/2;function Bp(t,n,e,r,i,o){for(var a,u,c,f,s,l,h,d,p,g,y,v=[],_=n.children,b=0,m=0,x=_.length,w=n.value;b<x;){c=i-e,f=o-r;do{s=_[m++].value}while(!s&&m<x);for(l=h=s,y=s*s*(g=Math.max(f/c,c/f)/(w*t)),p=Math.max(h/y,y/l);m<x;++m){if(s+=u=_[m].value,u<l&&(l=u),u>h&&(h=u),y=s*s*g,(d=Math.max(h/y,y/l))>p){s-=u;break}p=d}v.push(a={value:s,dice:c<f,children:_.slice(b,m)}),a.dice?Ap(a,e,r,i,w?r+=f*s/w:o):Ip(a,e,r,w?e+=c*s/w:i,o),w-=s,b=m}return v}var Yp=function t(n){function e(t,e,r,i,o){Bp(n,t,e,r,i,o)}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(Op);var Lp=function t(n){function e(t,e,r,i,o){if((a=t._squarify)&&a.ratio===n)for(var a,u,c,f,s,l=-1,h=a.length,d=t.value;++l<h;){for(c=(u=a[l]).children,f=u.value=0,s=c.length;f<s;++f)u.value+=c[f].value;u.dice?Ap(u,e,r,i,d?r+=(o-r)*u.value/d:o):Ip(u,e,r,d?e+=(i-e)*u.value/d:i,o),d-=u.value}else t._squarify=a=Bp(n,t,e,r,i,o),a.ratio=n}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(Op);function jp(t,n,e){return(n[0]-t[0])*(e[1]-t[1])-(n[1]-t[1])*(e[0]-t[0])}function Hp(t,n){return t[0]-n[0]||t[1]-n[1]}function Xp(t){const n=t.length,e=[0,1];let r,i=2;for(r=2;r<n;++r){for(;i>1&&jp(t[e[i-2]],t[e[i-1]],t[r])<=0;)--i;e[i++]=r}return e.slice(0,i)}var Gp=Math.random,Vp=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,1===arguments.length?(e=t,t=0):e-=t,function(){return n()*e+t}}return e.source=t,e}(Gp),Wp=function t(n){function e(t,e){return arguments.length<2&&(e=t,t=0),t=Math.floor(t),e=Math.floor(e)-t,function(){return Math.floor(n()*e+t)}}return e.source=t,e}(Gp),Zp=function t(n){function e(t,e){var r,i;return t=null==t?0:+t,e=null==e?1:+e,function(){var o;if(null!=r)o=r,r=null;else do{r=2*n()-1,o=2*n()-1,i=r*r+o*o}while(!i||i>1);return t+e*o*Math.sqrt(-2*Math.log(i)/i)}}return e.source=t,e}(Gp),Kp=function t(n){var e=Zp.source(n);function r(){var t=e.apply(this,arguments);return function(){return Math.exp(t())}}return r.source=t,r}(Gp),Qp=function t(n){function e(t){return(t=+t)<=0?()=>0:function(){for(var e=0,r=t;r>1;--r)e+=n();return e+r*n()}}return e.source=t,e}(Gp),Jp=function t(n){var e=Qp.source(n);function r(t){if(0==(t=+t))return n;var r=e(t);return function(){return r()/t}}return r.source=t,r}(Gp),tg=function t(n){function e(t){return function(){return-Math.log1p(-n())/t}}return e.source=t,e}(Gp),ng=function t(n){function e(t){if((t=+t)<0)throw new RangeError("invalid alpha");return t=1/-t,function(){return Math.pow(1-n(),t)}}return e.source=t,e}(Gp),eg=function t(n){function e(t){if((t=+t)<0||t>1)throw new RangeError("invalid p");return function(){return Math.floor(n()+t)}}return e.source=t,e}(Gp),rg=function t(n){function e(t){if((t=+t)<0||t>1)throw new RangeError("invalid p");return 0===t?()=>1/0:1===t?()=>1:(t=Math.log1p(-t),function(){return 1+Math.floor(Math.log1p(-n())/t)})}return e.source=t,e}(Gp),ig=function t(n){var e=Zp.source(n)();function r(t,r){if((t=+t)<0)throw new RangeError("invalid k");if(0===t)return()=>0;if(r=null==r?1:+r,1===t)return()=>-Math.log1p(-n())*r;var i=(t<1?t+1:t)-1/3,o=1/(3*Math.sqrt(i)),a=t<1?()=>Math.pow(n(),1/t):()=>1;return function(){do{do{var t=e(),u=1+o*t}while(u<=0);u*=u*u;var c=1-n()}while(c>=1-.0331*t*t*t*t&&Math.log(c)>=.5*t*t+i*(1-u+Math.log(u)));return i*u*a()*r}}return r.source=t,r}(Gp),og=function t(n){var e=ig.source(n);function r(t,n){var r=e(t),i=e(n);return function(){var t=r();return 0===t?0:t/(t+i())}}return r.source=t,r}(Gp),ag=function t(n){var e=rg.source(n),r=og.source(n);function i(t,n){return t=+t,(n=+n)>=1?()=>t:n<=0?()=>0:function(){for(var i=0,o=t,a=n;o*a>16&&o*(1-a)>16;){var u=Math.floor((o+1)*a),c=r(u,o-u+1)();c<=a?(i+=u,o-=u,a=(a-c)/(1-c)):(o=u-1,a/=c)}for(var f=a<.5,s=e(f?a:1-a),l=s(),h=0;l<=o;++h)l+=s();return i+(f?h:o-h)}}return i.source=t,i}(Gp),ug=function t(n){function e(t,e,r){var i;return 0==(t=+t)?i=t=>-Math.log(t):(t=1/t,i=n=>Math.pow(n,t)),e=null==e?0:+e,r=null==r?1:+r,function(){return e+r*i(-Math.log1p(-n()))}}return e.source=t,e}(Gp),cg=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,function(){return t+e*Math.tan(Math.PI*n())}}return e.source=t,e}(Gp),fg=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,function(){var r=n();return t+e*Math.log(r/(1-r))}}return e.source=t,e}(Gp),sg=function t(n){var e=ig.source(n),r=ag.source(n);function i(t){return function(){for(var i=0,o=t;o>16;){var a=Math.floor(.875*o),u=e(a)();if(u>o)return i+r(a-1,o/u)();i+=a,o-=u}for(var c=-Math.log1p(-n()),f=0;c<=o;++f)c-=Math.log1p(-n());return i+f}}return i.source=t,i}(Gp);const lg=1/4294967296;function hg(t,n){switch(arguments.length){case 0:break;case 1:this.range(t);break;default:this.range(n).domain(t)}return this}function dg(t,n){switch(arguments.length){case 0:break;case 1:"function"==typeof t?this.interpolator(t):this.range(t);break;default:this.domain(t),"function"==typeof n?this.interpolator(n):this.range(n)}return this}const pg=Symbol("implicit");function gg(){var t=new InternMap,n=[],e=[],r=pg;function i(i){let o=t.get(i);if(void 0===o){if(r!==pg)return r;t.set(i,o=n.push(i)-1)}return e[o%e.length]}return i.domain=function(e){if(!arguments.length)return n.slice();n=[],t=new InternMap;for(const r of e)t.has(r)||t.set(r,n.push(r)-1);return i},i.range=function(t){return arguments.length?(e=Array.from(t),i):e.slice()},i.unknown=function(t){return arguments.length?(r=t,i):r},i.copy=function(){return gg(n,e).unknown(r)},hg.apply(i,arguments),i}function yg(){var t,n,e=gg().unknown(void 0),r=e.domain,i=e.range,o=0,a=1,u=!1,c=0,f=0,s=.5;function l(){var e=r().length,l=a<o,h=l?a:o,d=l?o:a;t=(d-h)/Math.max(1,e-c+2*f),u&&(t=Math.floor(t)),h+=(d-h-t*(e-c))*s,n=t*(1-c),u&&(h=Math.round(h),n=Math.round(n));var p=lt(e).map((function(n){return h+t*n}));return i(l?p.reverse():p)}return delete e.unknown,e.domain=function(t){return arguments.length?(r(t),l()):r()},e.range=function(t){return arguments.length?([o,a]=t,o=+o,a=+a,l()):[o,a]},e.rangeRound=function(t){return[o,a]=t,o=+o,a=+a,u=!0,l()},e.bandwidth=function(){return n},e.step=function(){return t},e.round=function(t){return arguments.length?(u=!!t,l()):u},e.padding=function(t){return arguments.length?(c=Math.min(1,f=+t),l()):c},e.paddingInner=function(t){return arguments.length?(c=Math.min(1,t),l()):c},e.paddingOuter=function(t){return arguments.length?(f=+t,l()):f},e.align=function(t){return arguments.length?(s=Math.max(0,Math.min(1,t)),l()):s},e.copy=function(){return yg(r(),[o,a]).round(u).paddingInner(c).paddingOuter(f).align(s)},hg.apply(l(),arguments)}function vg(t){var n=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return vg(n())},t}function _g(t){return+t}var bg=[0,1];function mg(t){return t}function xg(t,n){return(n-=t=+t)?function(e){return(e-t)/n}:function(t){return function(){return t}}(isNaN(n)?NaN:.5)}function wg(t,n,e){var r=t[0],i=t[1],o=n[0],a=n[1];return i<r?(r=xg(i,r),o=e(a,o)):(r=xg(r,i),o=e(o,a)),function(t){return o(r(t))}}function Mg(t,n,e){var r=Math.min(t.length,n.length)-1,i=new Array(r),o=new Array(r),a=-1;for(t[r]<t[0]&&(t=t.slice().reverse(),n=n.slice().reverse());++a<r;)i[a]=xg(t[a],t[a+1]),o[a]=e(n[a],n[a+1]);return function(n){var e=s(t,n,1,r)-1;return o[e](i[e](n))}}function Tg(t,n){return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown())}function Ag(){var t,n,e,r,i,o,a=bg,u=bg,c=Gr,f=mg;function s(){var t=Math.min(a.length,u.length);return f!==mg&&(f=function(t,n){var e;return t>n&&(e=t,t=n,n=e),function(e){return Math.max(t,Math.min(n,e))}}(a[0],a[t-1])),r=t>2?Mg:wg,i=o=null,l}function l(n){return null==n||isNaN(n=+n)?e:(i||(i=r(a.map(t),u,c)))(t(f(n)))}return l.invert=function(e){return f(n((o||(o=r(u,a.map(t),Yr)))(e)))},l.domain=function(t){return arguments.length?(a=Array.from(t,_g),s()):a.slice()},l.range=function(t){return arguments.length?(u=Array.from(t),s()):u.slice()},l.rangeRound=function(t){return u=Array.from(t),c=Vr,s()},l.clamp=function(t){return arguments.length?(f=!!t||mg,s()):f!==mg},l.interpolate=function(t){return arguments.length?(c=t,s()):c},l.unknown=function(t){return arguments.length?(e=t,l):e},function(e,r){return t=e,n=r,s()}}function Sg(){return Ag()(mg,mg)}function Eg(n,e,r,i){var o,a=W(n,e,r);switch((i=Jc(null==i?",f":i)).type){case"s":var u=Math.max(Math.abs(n),Math.abs(e));return null!=i.precision||isNaN(o=lf(a,u))||(i.precision=o),t.formatPrefix(i,u);case"":case"e":case"g":case"p":case"r":null!=i.precision||isNaN(o=hf(a,Math.max(Math.abs(n),Math.abs(e))))||(i.precision=o-("e"===i.type));break;case"f":case"%":null!=i.precision||isNaN(o=sf(a))||(i.precision=o-2*("%"===i.type))}return t.format(i)}function Ng(t){var n=t.domain;return t.ticks=function(t){var e=n();return G(e[0],e[e.length-1],null==t?10:t)},t.tickFormat=function(t,e){var r=n();return Eg(r[0],r[r.length-1],null==t?10:t,e)},t.nice=function(e){null==e&&(e=10);var r,i,o=n(),a=0,u=o.length-1,c=o[a],f=o[u],s=10;for(f<c&&(i=c,c=f,f=i,i=a,a=u,u=i);s-- >0;){if((i=V(c,f,e))===r)return o[a]=c,o[u]=f,n(o);if(i>0)c=Math.floor(c/i)*i,f=Math.ceil(f/i)*i;else{if(!(i<0))break;c=Math.ceil(c*i)/i,f=Math.floor(f*i)/i}r=i}return t},t}function kg(t,n){var e,r=0,i=(t=t.slice()).length-1,o=t[r],a=t[i];return a<o&&(e=r,r=i,i=e,e=o,o=a,a=e),t[r]=n.floor(o),t[i]=n.ceil(a),t}function Cg(t){return Math.log(t)}function Pg(t){return Math.exp(t)}function zg(t){return-Math.log(-t)}function $g(t){return-Math.exp(-t)}function Dg(t){return isFinite(t)?+("1e"+t):t<0?0:t}function Rg(t){return(n,e)=>-t(-n,e)}function Fg(n){const e=n(Cg,Pg),r=e.domain;let i,o,a=10;function u(){return i=function(t){return t===Math.E?Math.log:10===t&&Math.log10||2===t&&Math.log2||(t=Math.log(t),n=>Math.log(n)/t)}(a),o=function(t){return 10===t?Dg:t===Math.E?Math.exp:n=>Math.pow(t,n)}(a),r()[0]<0?(i=Rg(i),o=Rg(o),n(zg,$g)):n(Cg,Pg),e}return e.base=function(t){return arguments.length?(a=+t,u()):a},e.domain=function(t){return arguments.length?(r(t),u()):r()},e.ticks=t=>{const n=r();let e=n[0],u=n[n.length-1];const c=u<e;c&&([e,u]=[u,e]);let f,s,l=i(e),h=i(u);const d=null==t?10:+t;let p=[];if(!(a%1)&&h-l<d){if(l=Math.floor(l),h=Math.ceil(h),e>0){for(;l<=h;++l)for(f=1;f<a;++f)if(s=l<0?f/o(-l):f*o(l),!(s<e)){if(s>u)break;p.push(s)}}else for(;l<=h;++l)for(f=a-1;f>=1;--f)if(s=l>0?f/o(-l):f*o(l),!(s<e)){if(s>u)break;p.push(s)}2*p.length<d&&(p=G(e,u,d))}else p=G(l,h,Math.min(h-l,d)).map(o);return c?p.reverse():p},e.tickFormat=(n,r)=>{if(null==n&&(n=10),null==r&&(r=10===a?"s":","),"function"!=typeof r&&(a%1||null!=(r=Jc(r)).precision||(r.trim=!0),r=t.format(r)),n===1/0)return r;const u=Math.max(1,a*n/e.ticks().length);return t=>{let n=t/o(Math.round(i(t)));return n*a<a-.5&&(n*=a),n<=u?r(t):""}},e.nice=()=>r(kg(r(),{floor:t=>o(Math.floor(i(t))),ceil:t=>o(Math.ceil(i(t)))})),e}function qg(t){return function(n){return Math.sign(n)*Math.log1p(Math.abs(n/t))}}function Ug(t){return function(n){return Math.sign(n)*Math.expm1(Math.abs(n))*t}}function Ig(t){var n=1,e=t(qg(n),Ug(n));return e.constant=function(e){return arguments.length?t(qg(n=+e),Ug(n)):n},Ng(e)}function Og(t){return function(n){return n<0?-Math.pow(-n,t):Math.pow(n,t)}}function Bg(t){return t<0?-Math.sqrt(-t):Math.sqrt(t)}function Yg(t){return t<0?-t*t:t*t}function Lg(t){var n=t(mg,mg),e=1;return n.exponent=function(n){return arguments.length?1===(e=+n)?t(mg,mg):.5===e?t(Bg,Yg):t(Og(e),Og(1/e)):e},Ng(n)}function jg(){var t=Lg(Ag());return t.copy=function(){return Tg(t,jg()).exponent(t.exponent())},hg.apply(t,arguments),t}function Hg(t){return Math.sign(t)*t*t}const Xg=new Date,Gg=new Date;function Vg(t,n,e,r){function i(n){return t(n=0===arguments.length?new Date:new Date(+n)),n}return i.floor=n=>(t(n=new Date(+n)),n),i.ceil=e=>(t(e=new Date(e-1)),n(e,1),t(e),e),i.round=t=>{const n=i(t),e=i.ceil(t);return t-n<e-t?n:e},i.offset=(t,e)=>(n(t=new Date(+t),null==e?1:Math.floor(e)),t),i.range=(e,r,o)=>{const a=[];if(e=i.ceil(e),o=null==o?1:Math.floor(o),!(e<r&&o>0))return a;let u;do{a.push(u=new Date(+e)),n(e,o),t(e)}while(u<e&&e<r);return a},i.filter=e=>Vg((n=>{if(n>=n)for(;t(n),!e(n);)n.setTime(n-1)}),((t,r)=>{if(t>=t)if(r<0)for(;++r<=0;)for(;n(t,-1),!e(t););else for(;--r>=0;)for(;n(t,1),!e(t););})),e&&(i.count=(n,r)=>(Xg.setTime(+n),Gg.setTime(+r),t(Xg),t(Gg),Math.floor(e(Xg,Gg))),i.every=t=>(t=Math.floor(t),isFinite(t)&&t>0?t>1?i.filter(r?n=>r(n)%t==0:n=>i.count(0,n)%t==0):i:null)),i}const Wg=Vg((()=>{}),((t,n)=>{t.setTime(+t+n)}),((t,n)=>n-t));Wg.every=t=>(t=Math.floor(t),isFinite(t)&&t>0?t>1?Vg((n=>{n.setTime(Math.floor(n/t)*t)}),((n,e)=>{n.setTime(+n+e*t)}),((n,e)=>(e-n)/t)):Wg:null);const Zg=Wg.range,Kg=1e3,Qg=6e4,Jg=36e5,ty=864e5,ny=6048e5,ey=2592e6,ry=31536e6,iy=Vg((t=>{t.setTime(t-t.getMilliseconds())}),((t,n)=>{t.setTime(+t+n*Kg)}),((t,n)=>(n-t)/Kg),(t=>t.getUTCSeconds())),oy=iy.range,ay=Vg((t=>{t.setTime(t-t.getMilliseconds()-t.getSeconds()*Kg)}),((t,n)=>{t.setTime(+t+n*Qg)}),((t,n)=>(n-t)/Qg),(t=>t.getMinutes())),uy=ay.range,cy=Vg((t=>{t.setUTCSeconds(0,0)}),((t,n)=>{t.setTime(+t+n*Qg)}),((t,n)=>(n-t)/Qg),(t=>t.getUTCMinutes())),fy=cy.range,sy=Vg((t=>{t.setTime(t-t.getMilliseconds()-t.getSeconds()*Kg-t.getMinutes()*Qg)}),((t,n)=>{t.setTime(+t+n*Jg)}),((t,n)=>(n-t)/Jg),(t=>t.getHours())),ly=sy.range,hy=Vg((t=>{t.setUTCMinutes(0,0,0)}),((t,n)=>{t.setTime(+t+n*Jg)}),((t,n)=>(n-t)/Jg),(t=>t.getUTCHours())),dy=hy.range,py=Vg((t=>t.setHours(0,0,0,0)),((t,n)=>t.setDate(t.getDate()+n)),((t,n)=>(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*Qg)/ty),(t=>t.getDate()-1)),gy=py.range,yy=Vg((t=>{t.setUTCHours(0,0,0,0)}),((t,n)=>{t.setUTCDate(t.getUTCDate()+n)}),((t,n)=>(n-t)/ty),(t=>t.getUTCDate()-1)),vy=yy.range,_y=Vg((t=>{t.setUTCHours(0,0,0,0)}),((t,n)=>{t.setUTCDate(t.getUTCDate()+n)}),((t,n)=>(n-t)/ty),(t=>Math.floor(t/ty))),by=_y.range;function my(t){return Vg((n=>{n.setDate(n.getDate()-(n.getDay()+7-t)%7),n.setHours(0,0,0,0)}),((t,n)=>{t.setDate(t.getDate()+7*n)}),((t,n)=>(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*Qg)/ny))}const xy=my(0),wy=my(1),My=my(2),Ty=my(3),Ay=my(4),Sy=my(5),Ey=my(6),Ny=xy.range,ky=wy.range,Cy=My.range,Py=Ty.range,zy=Ay.range,$y=Sy.range,Dy=Ey.range;function Ry(t){return Vg((n=>{n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-t)%7),n.setUTCHours(0,0,0,0)}),((t,n)=>{t.setUTCDate(t.getUTCDate()+7*n)}),((t,n)=>(n-t)/ny))}const Fy=Ry(0),qy=Ry(1),Uy=Ry(2),Iy=Ry(3),Oy=Ry(4),By=Ry(5),Yy=Ry(6),Ly=Fy.range,jy=qy.range,Hy=Uy.range,Xy=Iy.range,Gy=Oy.range,Vy=By.range,Wy=Yy.range,Zy=Vg((t=>{t.setDate(1),t.setHours(0,0,0,0)}),((t,n)=>{t.setMonth(t.getMonth()+n)}),((t,n)=>n.getMonth()-t.getMonth()+12*(n.getFullYear()-t.getFullYear())),(t=>t.getMonth())),Ky=Zy.range,Qy=Vg((t=>{t.setUTCDate(1),t.setUTCHours(0,0,0,0)}),((t,n)=>{t.setUTCMonth(t.getUTCMonth()+n)}),((t,n)=>n.getUTCMonth()-t.getUTCMonth()+12*(n.getUTCFullYear()-t.getUTCFullYear())),(t=>t.getUTCMonth())),Jy=Qy.range,tv=Vg((t=>{t.setMonth(0,1),t.setHours(0,0,0,0)}),((t,n)=>{t.setFullYear(t.getFullYear()+n)}),((t,n)=>n.getFullYear()-t.getFullYear()),(t=>t.getFullYear()));tv.every=t=>isFinite(t=Math.floor(t))&&t>0?Vg((n=>{n.setFullYear(Math.floor(n.getFullYear()/t)*t),n.setMonth(0,1),n.setHours(0,0,0,0)}),((n,e)=>{n.setFullYear(n.getFullYear()+e*t)})):null;const nv=tv.range,ev=Vg((t=>{t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)}),((t,n)=>{t.setUTCFullYear(t.getUTCFullYear()+n)}),((t,n)=>n.getUTCFullYear()-t.getUTCFullYear()),(t=>t.getUTCFullYear()));ev.every=t=>isFinite(t=Math.floor(t))&&t>0?Vg((n=>{n.setUTCFullYear(Math.floor(n.getUTCFullYear()/t)*t),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)}),((n,e)=>{n.setUTCFullYear(n.getUTCFullYear()+e*t)})):null;const rv=ev.range;function iv(t,n,e,i,o,a){const u=[[iy,1,Kg],[iy,5,5e3],[iy,15,15e3],[iy,30,3e4],[a,1,Qg],[a,5,3e5],[a,15,9e5],[a,30,18e5],[o,1,Jg],[o,3,108e5],[o,6,216e5],[o,12,432e5],[i,1,ty],[i,2,1728e5],[e,1,ny],[n,1,ey],[n,3,7776e6],[t,1,ry]];function c(n,e,i){const o=Math.abs(e-n)/i,a=r((([,,t])=>t)).right(u,o);if(a===u.length)return t.every(W(n/ry,e/ry,i));if(0===a)return Wg.every(Math.max(W(n,e,i),1));const[c,f]=u[o/u[a-1][2]<u[a][2]/o?a-1:a];return c.every(f)}return[function(t,n,e){const r=n<t;r&&([t,n]=[n,t]);const i=e&&"function"==typeof e.range?e:c(t,n,e),o=i?i.range(t,+n+1):[];return r?o.reverse():o},c]}const[ov,av]=iv(ev,Qy,Fy,_y,hy,cy),[uv,cv]=iv(tv,Zy,xy,py,sy,ay);function fv(t){if(0<=t.y&&t.y<100){var n=new Date(-1,t.m,t.d,t.H,t.M,t.S,t.L);return n.setFullYear(t.y),n}return new Date(t.y,t.m,t.d,t.H,t.M,t.S,t.L)}function sv(t){if(0<=t.y&&t.y<100){var n=new Date(Date.UTC(-1,t.m,t.d,t.H,t.M,t.S,t.L));return n.setUTCFullYear(t.y),n}return new Date(Date.UTC(t.y,t.m,t.d,t.H,t.M,t.S,t.L))}function lv(t,n,e){return{y:t,m:n,d:e,H:0,M:0,S:0,L:0}}function hv(t){var n=t.dateTime,e=t.date,r=t.time,i=t.periods,o=t.days,a=t.shortDays,u=t.months,c=t.shortMonths,f=mv(i),s=xv(i),l=mv(o),h=xv(o),d=mv(a),p=xv(a),g=mv(u),y=xv(u),v=mv(c),_=xv(c),b={a:function(t){return a[t.getDay()]},A:function(t){return o[t.getDay()]},b:function(t){return c[t.getMonth()]},B:function(t){return u[t.getMonth()]},c:null,d:Yv,e:Yv,f:Gv,g:i_,G:a_,H:Lv,I:jv,j:Hv,L:Xv,m:Vv,M:Wv,p:function(t){return i[+(t.getHours()>=12)]},q:function(t){return 1+~~(t.getMonth()/3)},Q:k_,s:C_,S:Zv,u:Kv,U:Qv,V:t_,w:n_,W:e_,x:null,X:null,y:r_,Y:o_,Z:u_,"%":N_},m={a:function(t){return a[t.getUTCDay()]},A:function(t){return o[t.getUTCDay()]},b:function(t){return c[t.getUTCMonth()]},B:function(t){return u[t.getUTCMonth()]},c:null,d:c_,e:c_,f:d_,g:T_,G:S_,H:f_,I:s_,j:l_,L:h_,m:p_,M:g_,p:function(t){return i[+(t.getUTCHours()>=12)]},q:function(t){return 1+~~(t.getUTCMonth()/3)},Q:k_,s:C_,S:y_,u:v_,U:__,V:m_,w:x_,W:w_,x:null,X:null,y:M_,Y:A_,Z:E_,"%":N_},x={a:function(t,n,e){var r=d.exec(n.slice(e));return r?(t.w=p.get(r[0].toLowerCase()),e+r[0].length):-1},A:function(t,n,e){var r=l.exec(n.slice(e));return r?(t.w=h.get(r[0].toLowerCase()),e+r[0].length):-1},b:function(t,n,e){var r=v.exec(n.slice(e));return r?(t.m=_.get(r[0].toLowerCase()),e+r[0].length):-1},B:function(t,n,e){var r=g.exec(n.slice(e));return r?(t.m=y.get(r[0].toLowerCase()),e+r[0].length):-1},c:function(t,e,r){return T(t,n,e,r)},d:zv,e:zv,f:Uv,g:Nv,G:Ev,H:Dv,I:Dv,j:$v,L:qv,m:Pv,M:Rv,p:function(t,n,e){var r=f.exec(n.slice(e));return r?(t.p=s.get(r[0].toLowerCase()),e+r[0].length):-1},q:Cv,Q:Ov,s:Bv,S:Fv,u:Mv,U:Tv,V:Av,w:wv,W:Sv,x:function(t,n,r){return T(t,e,n,r)},X:function(t,n,e){return T(t,r,n,e)},y:Nv,Y:Ev,Z:kv,"%":Iv};function w(t,n){return function(e){var r,i,o,a=[],u=-1,c=0,f=t.length;for(e instanceof Date||(e=new Date(+e));++u<f;)37===t.charCodeAt(u)&&(a.push(t.slice(c,u)),null!=(i=pv[r=t.charAt(++u)])?r=t.charAt(++u):i="e"===r?" ":"0",(o=n[r])&&(r=o(e,i)),a.push(r),c=u+1);return a.push(t.slice(c,u)),a.join("")}}function M(t,n){return function(e){var r,i,o=lv(1900,void 0,1);if(T(o,t,e+="",0)!=e.length)return null;if("Q"in o)return new Date(o.Q);if("s"in o)return new Date(1e3*o.s+("L"in o?o.L:0));if(n&&!("Z"in o)&&(o.Z=0),"p"in o&&(o.H=o.H%12+12*o.p),void 0===o.m&&(o.m="q"in o?o.q:0),"V"in o){if(o.V<1||o.V>53)return null;"w"in o||(o.w=1),"Z"in o?(i=(r=sv(lv(o.y,0,1))).getUTCDay(),r=i>4||0===i?qy.ceil(r):qy(r),r=yy.offset(r,7*(o.V-1)),o.y=r.getUTCFullYear(),o.m=r.getUTCMonth(),o.d=r.getUTCDate()+(o.w+6)%7):(i=(r=fv(lv(o.y,0,1))).getDay(),r=i>4||0===i?wy.ceil(r):wy(r),r=py.offset(r,7*(o.V-1)),o.y=r.getFullYear(),o.m=r.getMonth(),o.d=r.getDate()+(o.w+6)%7)}else("W"in o||"U"in o)&&("w"in o||(o.w="u"in o?o.u%7:"W"in o?1:0),i="Z"in o?sv(lv(o.y,0,1)).getUTCDay():fv(lv(o.y,0,1)).getDay(),o.m=0,o.d="W"in o?(o.w+6)%7+7*o.W-(i+5)%7:o.w+7*o.U-(i+6)%7);return"Z"in o?(o.H+=o.Z/100|0,o.M+=o.Z%100,sv(o)):fv(o)}}function T(t,n,e,r){for(var i,o,a=0,u=n.length,c=e.length;a<u;){if(r>=c)return-1;if(37===(i=n.charCodeAt(a++))){if(i=n.charAt(a++),!(o=x[i in pv?n.charAt(a++):i])||(r=o(t,e,r))<0)return-1}else if(i!=e.charCodeAt(r++))return-1}return r}return b.x=w(e,b),b.X=w(r,b),b.c=w(n,b),m.x=w(e,m),m.X=w(r,m),m.c=w(n,m),{format:function(t){var n=w(t+="",b);return n.toString=function(){return t},n},parse:function(t){var n=M(t+="",!1);return n.toString=function(){return t},n},utcFormat:function(t){var n=w(t+="",m);return n.toString=function(){return t},n},utcParse:function(t){var n=M(t+="",!0);return n.toString=function(){return t},n}}}var dv,pv={"-":"",_:" ",0:"0"},gv=/^\s*\d+/,yv=/^%/,vv=/[\\^$*+?|[\]().{}]/g;function _v(t,n,e){var r=t<0?"-":"",i=(r?-t:t)+"",o=i.length;return r+(o<e?new Array(e-o+1).join(n)+i:i)}function bv(t){return t.replace(vv,"\\$&")}function mv(t){return new RegExp("^(?:"+t.map(bv).join("|")+")","i")}function xv(t){return new Map(t.map(((t,n)=>[t.toLowerCase(),n])))}function wv(t,n,e){var r=gv.exec(n.slice(e,e+1));return r?(t.w=+r[0],e+r[0].length):-1}function Mv(t,n,e){var r=gv.exec(n.slice(e,e+1));return r?(t.u=+r[0],e+r[0].length):-1}function Tv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.U=+r[0],e+r[0].length):-1}function Av(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.V=+r[0],e+r[0].length):-1}function Sv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.W=+r[0],e+r[0].length):-1}function Ev(t,n,e){var r=gv.exec(n.slice(e,e+4));return r?(t.y=+r[0],e+r[0].length):-1}function Nv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.y=+r[0]+(+r[0]>68?1900:2e3),e+r[0].length):-1}function kv(t,n,e){var r=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(n.slice(e,e+6));return r?(t.Z=r[1]?0:-(r[2]+(r[3]||"00")),e+r[0].length):-1}function Cv(t,n,e){var r=gv.exec(n.slice(e,e+1));return r?(t.q=3*r[0]-3,e+r[0].length):-1}function Pv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.m=r[0]-1,e+r[0].length):-1}function zv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.d=+r[0],e+r[0].length):-1}function $v(t,n,e){var r=gv.exec(n.slice(e,e+3));return r?(t.m=0,t.d=+r[0],e+r[0].length):-1}function Dv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.H=+r[0],e+r[0].length):-1}function Rv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.M=+r[0],e+r[0].length):-1}function Fv(t,n,e){var r=gv.exec(n.slice(e,e+2));return r?(t.S=+r[0],e+r[0].length):-1}function qv(t,n,e){var r=gv.exec(n.slice(e,e+3));return r?(t.L=+r[0],e+r[0].length):-1}function Uv(t,n,e){var r=gv.exec(n.slice(e,e+6));return r?(t.L=Math.floor(r[0]/1e3),e+r[0].length):-1}function Iv(t,n,e){var r=yv.exec(n.slice(e,e+1));return r?e+r[0].length:-1}function Ov(t,n,e){var r=gv.exec(n.slice(e));return r?(t.Q=+r[0],e+r[0].length):-1}function Bv(t,n,e){var r=gv.exec(n.slice(e));return r?(t.s=+r[0],e+r[0].length):-1}function Yv(t,n){return _v(t.getDate(),n,2)}function Lv(t,n){return _v(t.getHours(),n,2)}function jv(t,n){return _v(t.getHours()%12||12,n,2)}function Hv(t,n){return _v(1+py.count(tv(t),t),n,3)}function Xv(t,n){return _v(t.getMilliseconds(),n,3)}function Gv(t,n){return Xv(t,n)+"000"}function Vv(t,n){return _v(t.getMonth()+1,n,2)}function Wv(t,n){return _v(t.getMinutes(),n,2)}function Zv(t,n){return _v(t.getSeconds(),n,2)}function Kv(t){var n=t.getDay();return 0===n?7:n}function Qv(t,n){return _v(xy.count(tv(t)-1,t),n,2)}function Jv(t){var n=t.getDay();return n>=4||0===n?Ay(t):Ay.ceil(t)}function t_(t,n){return t=Jv(t),_v(Ay.count(tv(t),t)+(4===tv(t).getDay()),n,2)}function n_(t){return t.getDay()}function e_(t,n){return _v(wy.count(tv(t)-1,t),n,2)}function r_(t,n){return _v(t.getFullYear()%100,n,2)}function i_(t,n){return _v((t=Jv(t)).getFullYear()%100,n,2)}function o_(t,n){return _v(t.getFullYear()%1e4,n,4)}function a_(t,n){var e=t.getDay();return _v((t=e>=4||0===e?Ay(t):Ay.ceil(t)).getFullYear()%1e4,n,4)}function u_(t){var n=t.getTimezoneOffset();return(n>0?"-":(n*=-1,"+"))+_v(n/60|0,"0",2)+_v(n%60,"0",2)}function c_(t,n){return _v(t.getUTCDate(),n,2)}function f_(t,n){return _v(t.getUTCHours(),n,2)}function s_(t,n){return _v(t.getUTCHours()%12||12,n,2)}function l_(t,n){return _v(1+yy.count(ev(t),t),n,3)}function h_(t,n){return _v(t.getUTCMilliseconds(),n,3)}function d_(t,n){return h_(t,n)+"000"}function p_(t,n){return _v(t.getUTCMonth()+1,n,2)}function g_(t,n){return _v(t.getUTCMinutes(),n,2)}function y_(t,n){return _v(t.getUTCSeconds(),n,2)}function v_(t){var n=t.getUTCDay();return 0===n?7:n}function __(t,n){return _v(Fy.count(ev(t)-1,t),n,2)}function b_(t){var n=t.getUTCDay();return n>=4||0===n?Oy(t):Oy.ceil(t)}function m_(t,n){return t=b_(t),_v(Oy.count(ev(t),t)+(4===ev(t).getUTCDay()),n,2)}function x_(t){return t.getUTCDay()}function w_(t,n){return _v(qy.count(ev(t)-1,t),n,2)}function M_(t,n){return _v(t.getUTCFullYear()%100,n,2)}function T_(t,n){return _v((t=b_(t)).getUTCFullYear()%100,n,2)}function A_(t,n){return _v(t.getUTCFullYear()%1e4,n,4)}function S_(t,n){var e=t.getUTCDay();return _v((t=e>=4||0===e?Oy(t):Oy.ceil(t)).getUTCFullYear()%1e4,n,4)}function E_(){return"+0000"}function N_(){return"%"}function k_(t){return+t}function C_(t){return Math.floor(+t/1e3)}function P_(n){return dv=hv(n),t.timeFormat=dv.format,t.timeParse=dv.parse,t.utcFormat=dv.utcFormat,t.utcParse=dv.utcParse,dv}t.timeFormat=void 0,t.timeParse=void 0,t.utcFormat=void 0,t.utcParse=void 0,P_({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});var z_="%Y-%m-%dT%H:%M:%S.%LZ";var $_=Date.prototype.toISOString?function(t){return t.toISOString()}:t.utcFormat(z_),D_=$_;var R_=+new Date("2000-01-01T00:00:00.000Z")?function(t){var n=new Date(t);return isNaN(n)?null:n}:t.utcParse(z_),F_=R_;function q_(t){return new Date(t)}function U_(t){return t instanceof Date?+t:+new Date(+t)}function I_(t,n,e,r,i,o,a,u,c,f){var s=Sg(),l=s.invert,h=s.domain,d=f(".%L"),p=f(":%S"),g=f("%I:%M"),y=f("%I %p"),v=f("%a %d"),_=f("%b %d"),b=f("%B"),m=f("%Y");function x(t){return(c(t)<t?d:u(t)<t?p:a(t)<t?g:o(t)<t?y:r(t)<t?i(t)<t?v:_:e(t)<t?b:m)(t)}return s.invert=function(t){return new Date(l(t))},s.domain=function(t){return arguments.length?h(Array.from(t,U_)):h().map(q_)},s.ticks=function(n){var e=h();return t(e[0],e[e.length-1],null==n?10:n)},s.tickFormat=function(t,n){return null==n?x:f(n)},s.nice=function(t){var e=h();return t&&"function"==typeof t.range||(t=n(e[0],e[e.length-1],null==t?10:t)),t?h(kg(e,t)):s},s.copy=function(){return Tg(s,I_(t,n,e,r,i,o,a,u,c,f))},s}function O_(){var t,n,e,r,i,o=0,a=1,u=mg,c=!1;function f(n){return null==n||isNaN(n=+n)?i:u(0===e?.5:(n=(r(n)-t)*e,c?Math.max(0,Math.min(1,n)):n))}function s(t){return function(n){var e,r;return arguments.length?([e,r]=n,u=t(e,r),f):[u(0),u(1)]}}return f.domain=function(i){return arguments.length?([o,a]=i,t=r(o=+o),n=r(a=+a),e=t===n?0:1/(n-t),f):[o,a]},f.clamp=function(t){return arguments.length?(c=!!t,f):c},f.interpolator=function(t){return arguments.length?(u=t,f):u},f.range=s(Gr),f.rangeRound=s(Vr),f.unknown=function(t){return arguments.length?(i=t,f):i},function(i){return r=i,t=i(o),n=i(a),e=t===n?0:1/(n-t),f}}function B_(t,n){return n.domain(t.domain()).interpolator(t.interpolator()).clamp(t.clamp()).unknown(t.unknown())}function Y_(){var t=Lg(O_());return t.copy=function(){return B_(t,Y_()).exponent(t.exponent())},dg.apply(t,arguments)}function L_(){var t,n,e,r,i,o,a,u=0,c=.5,f=1,s=1,l=mg,h=!1;function d(t){return isNaN(t=+t)?a:(t=.5+((t=+o(t))-n)*(s*t<s*n?r:i),l(h?Math.max(0,Math.min(1,t)):t))}function p(t){return function(n){var e,r,i;return arguments.length?([e,r,i]=n,l=di(t,[e,r,i]),d):[l(0),l(.5),l(1)]}}return d.domain=function(a){return arguments.length?([u,c,f]=a,t=o(u=+u),n=o(c=+c),e=o(f=+f),r=t===n?0:.5/(n-t),i=n===e?0:.5/(e-n),s=n<t?-1:1,d):[u,c,f]},d.clamp=function(t){return arguments.length?(h=!!t,d):h},d.interpolator=function(t){return arguments.length?(l=t,d):l},d.range=p(Gr),d.rangeRound=p(Vr),d.unknown=function(t){return arguments.length?(a=t,d):a},function(a){return o=a,t=a(u),n=a(c),e=a(f),r=t===n?0:.5/(n-t),i=n===e?0:.5/(e-n),s=n<t?-1:1,d}}function j_(){var t=Lg(L_());return t.copy=function(){return B_(t,j_()).exponent(t.exponent())},dg.apply(t,arguments)}function H_(t){for(var n=t.length/6|0,e=new Array(n),r=0;r<n;)e[r]="#"+t.slice(6*r,6*++r);return e}var X_=H_("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"),G_=H_("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666"),V_=H_("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666"),W_=H_("4269d0efb118ff725c6cc5b03ca951ff8ab7a463f297bbf59c6b4e9498a0"),Z_=H_("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928"),K_=H_("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2"),Q_=H_("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc"),J_=H_("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999"),tb=H_("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3"),nb=H_("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f"),eb=H_("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab"),rb=t=>Fr(t[t.length-1]),ib=new Array(3).concat("d8b365f5f5f55ab4ac","a6611adfc27d80cdc1018571","a6611adfc27df5f5f580cdc1018571","8c510ad8b365f6e8c3c7eae55ab4ac01665e","8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e","8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e","8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e","5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30","5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30").map(H_),ob=rb(ib),ab=new Array(3).concat("af8dc3f7f7f77fbf7b","7b3294c2a5cfa6dba0008837","7b3294c2a5cff7f7f7a6dba0008837","762a83af8dc3e7d4e8d9f0d37fbf7b1b7837","762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837","762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837","762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837","40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b","40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b").map(H_),ub=rb(ab),cb=new Array(3).concat("e9a3c9f7f7f7a1d76a","d01c8bf1b6dab8e1864dac26","d01c8bf1b6daf7f7f7b8e1864dac26","c51b7de9a3c9fde0efe6f5d0a1d76a4d9221","c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221","c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221","c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221","8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419","8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419").map(H_),fb=rb(cb),sb=new Array(3).concat("998ec3f7f7f7f1a340","5e3c99b2abd2fdb863e66101","5e3c99b2abd2f7f7f7fdb863e66101","542788998ec3d8daebfee0b6f1a340b35806","542788998ec3d8daebf7f7f7fee0b6f1a340b35806","5427888073acb2abd2d8daebfee0b6fdb863e08214b35806","5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806","2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08","2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08").map(H_),lb=rb(sb),hb=new Array(3).concat("ef8a62f7f7f767a9cf","ca0020f4a58292c5de0571b0","ca0020f4a582f7f7f792c5de0571b0","b2182bef8a62fddbc7d1e5f067a9cf2166ac","b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac","b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac","b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac","67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061","67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061").map(H_),db=rb(hb),pb=new Array(3).concat("ef8a62ffffff999999","ca0020f4a582bababa404040","ca0020f4a582ffffffbababa404040","b2182bef8a62fddbc7e0e0e09999994d4d4d","b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d","b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d","b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d","67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a","67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a").map(H_),gb=rb(pb),yb=new Array(3).concat("fc8d59ffffbf91bfdb","d7191cfdae61abd9e92c7bb6","d7191cfdae61ffffbfabd9e92c7bb6","d73027fc8d59fee090e0f3f891bfdb4575b4","d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4","d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4","d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4","a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695","a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695").map(H_),vb=rb(yb),_b=new Array(3).concat("fc8d59ffffbf91cf60","d7191cfdae61a6d96a1a9641","d7191cfdae61ffffbfa6d96a1a9641","d73027fc8d59fee08bd9ef8b91cf601a9850","d73027fc8d59fee08bffffbfd9ef8b91cf601a9850","d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850","d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850","a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837","a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837").map(H_),bb=rb(_b),mb=new Array(3).concat("fc8d59ffffbf99d594","d7191cfdae61abdda42b83ba","d7191cfdae61ffffbfabdda42b83ba","d53e4ffc8d59fee08be6f59899d5943288bd","d53e4ffc8d59fee08bffffbfe6f59899d5943288bd","d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd","d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd","9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2","9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2").map(H_),xb=rb(mb),wb=new Array(3).concat("e5f5f999d8c92ca25f","edf8fbb2e2e266c2a4238b45","edf8fbb2e2e266c2a42ca25f006d2c","edf8fbccece699d8c966c2a42ca25f006d2c","edf8fbccece699d8c966c2a441ae76238b45005824","f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824","f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b").map(H_),Mb=rb(wb),Tb=new Array(3).concat("e0ecf49ebcda8856a7","edf8fbb3cde38c96c688419d","edf8fbb3cde38c96c68856a7810f7c","edf8fbbfd3e69ebcda8c96c68856a7810f7c","edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b","f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b","f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b").map(H_),Ab=rb(Tb),Sb=new Array(3).concat("e0f3dba8ddb543a2ca","f0f9e8bae4bc7bccc42b8cbe","f0f9e8bae4bc7bccc443a2ca0868ac","f0f9e8ccebc5a8ddb57bccc443a2ca0868ac","f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e","f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e","f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081").map(H_),Eb=rb(Sb),Nb=new Array(3).concat("fee8c8fdbb84e34a33","fef0d9fdcc8afc8d59d7301f","fef0d9fdcc8afc8d59e34a33b30000","fef0d9fdd49efdbb84fc8d59e34a33b30000","fef0d9fdd49efdbb84fc8d59ef6548d7301f990000","fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000","fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000").map(H_),kb=rb(Nb),Cb=new Array(3).concat("ece2f0a6bddb1c9099","f6eff7bdc9e167a9cf02818a","f6eff7bdc9e167a9cf1c9099016c59","f6eff7d0d1e6a6bddb67a9cf1c9099016c59","f6eff7d0d1e6a6bddb67a9cf3690c002818a016450","fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450","fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636").map(H_),Pb=rb(Cb),zb=new Array(3).concat("ece7f2a6bddb2b8cbe","f1eef6bdc9e174a9cf0570b0","f1eef6bdc9e174a9cf2b8cbe045a8d","f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d","f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b","fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b","fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858").map(H_),$b=rb(zb),Db=new Array(3).concat("e7e1efc994c7dd1c77","f1eef6d7b5d8df65b0ce1256","f1eef6d7b5d8df65b0dd1c77980043","f1eef6d4b9dac994c7df65b0dd1c77980043","f1eef6d4b9dac994c7df65b0e7298ace125691003f","f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f","f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f").map(H_),Rb=rb(Db),Fb=new Array(3).concat("fde0ddfa9fb5c51b8a","feebe2fbb4b9f768a1ae017e","feebe2fbb4b9f768a1c51b8a7a0177","feebe2fcc5c0fa9fb5f768a1c51b8a7a0177","feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177","fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177","fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a").map(H_),qb=rb(Fb),Ub=new Array(3).concat("edf8b17fcdbb2c7fb8","ffffcca1dab441b6c4225ea8","ffffcca1dab441b6c42c7fb8253494","ffffccc7e9b47fcdbb41b6c42c7fb8253494","ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84","ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84","ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58").map(H_),Ib=rb(Ub),Ob=new Array(3).concat("f7fcb9addd8e31a354","ffffccc2e69978c679238443","ffffccc2e69978c67931a354006837","ffffccd9f0a3addd8e78c67931a354006837","ffffccd9f0a3addd8e78c67941ab5d238443005a32","ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32","ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529").map(H_),Bb=rb(Ob),Yb=new Array(3).concat("fff7bcfec44fd95f0e","ffffd4fed98efe9929cc4c02","ffffd4fed98efe9929d95f0e993404","ffffd4fee391fec44ffe9929d95f0e993404","ffffd4fee391fec44ffe9929ec7014cc4c028c2d04","ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04","ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506").map(H_),Lb=rb(Yb),jb=new Array(3).concat("ffeda0feb24cf03b20","ffffb2fecc5cfd8d3ce31a1c","ffffb2fecc5cfd8d3cf03b20bd0026","ffffb2fed976feb24cfd8d3cf03b20bd0026","ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026","ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026","ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026").map(H_),Hb=rb(jb),Xb=new Array(3).concat("deebf79ecae13182bd","eff3ffbdd7e76baed62171b5","eff3ffbdd7e76baed63182bd08519c","eff3ffc6dbef9ecae16baed63182bd08519c","eff3ffc6dbef9ecae16baed64292c62171b5084594","f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594","f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b").map(H_),Gb=rb(Xb),Vb=new Array(3).concat("e5f5e0a1d99b31a354","edf8e9bae4b374c476238b45","edf8e9bae4b374c47631a354006d2c","edf8e9c7e9c0a1d99b74c47631a354006d2c","edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32","f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32","f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b").map(H_),Wb=rb(Vb),Zb=new Array(3).concat("f0f0f0bdbdbd636363","f7f7f7cccccc969696525252","f7f7f7cccccc969696636363252525","f7f7f7d9d9d9bdbdbd969696636363252525","f7f7f7d9d9d9bdbdbd969696737373525252252525","fffffff0f0f0d9d9d9bdbdbd969696737373525252252525","fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000").map(H_),Kb=rb(Zb),Qb=new Array(3).concat("efedf5bcbddc756bb1","f2f0f7cbc9e29e9ac86a51a3","f2f0f7cbc9e29e9ac8756bb154278f","f2f0f7dadaebbcbddc9e9ac8756bb154278f","f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486","fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486","fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d").map(H_),Jb=rb(Qb),tm=new Array(3).concat("fee0d2fc9272de2d26","fee5d9fcae91fb6a4acb181d","fee5d9fcae91fb6a4ade2d26a50f15","fee5d9fcbba1fc9272fb6a4ade2d26a50f15","fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d","fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d","fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d").map(H_),nm=rb(tm),em=new Array(3).concat("fee6cefdae6be6550d","feeddefdbe85fd8d3cd94701","feeddefdbe85fd8d3ce6550da63603","feeddefdd0a2fdae6bfd8d3ce6550da63603","feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04","fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04","fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704").map(H_),rm=rb(em);var im=hi(Tr(300,.5,0),Tr(-240,.5,1)),om=hi(Tr(-100,.75,.35),Tr(80,1.5,.8)),am=hi(Tr(260,.75,.35),Tr(80,1.5,.8)),um=Tr();var cm=Fe(),fm=Math.PI/3,sm=2*Math.PI/3;function lm(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}}var hm=lm(H_("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725")),dm=lm(H_("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf")),pm=lm(H_("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4")),gm=lm(H_("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));function ym(t){return function(){return t}}const vm=Math.abs,_m=Math.atan2,bm=Math.cos,mm=Math.max,xm=Math.min,wm=Math.sin,Mm=Math.sqrt,Tm=1e-12,Am=Math.PI,Sm=Am/2,Em=2*Am;function Nm(t){return t>=1?Sm:t<=-1?-Sm:Math.asin(t)}function km(t){let n=3;return t.digits=function(e){if(!arguments.length)return n;if(null==e)n=null;else{const t=Math.floor(e);if(!(t>=0))throw new RangeError(`invalid digits: ${e}`);n=t}return t},()=>new Ua(n)}function Cm(t){return t.innerRadius}function Pm(t){return t.outerRadius}function zm(t){return t.startAngle}function $m(t){return t.endAngle}function Dm(t){return t&&t.padAngle}function Rm(t,n,e,r,i,o,a){var u=t-e,c=n-r,f=(a?o:-o)/Mm(u*u+c*c),s=f*c,l=-f*u,h=t+s,d=n+l,p=e+s,g=r+l,y=(h+p)/2,v=(d+g)/2,_=p-h,b=g-d,m=_*_+b*b,x=i-o,w=h*g-p*d,M=(b<0?-1:1)*Mm(mm(0,x*x*m-w*w)),T=(w*b-_*M)/m,A=(-w*_-b*M)/m,S=(w*b+_*M)/m,E=(-w*_+b*M)/m,N=T-y,k=A-v,C=S-y,P=E-v;return N*N+k*k>C*C+P*P&&(T=S,A=E),{cx:T,cy:A,x01:-s,y01:-l,x11:T*(i/x-1),y11:A*(i/x-1)}}var Fm=Array.prototype.slice;function qm(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function Um(t){this._context=t}function Im(t){return new Um(t)}function Om(t){return t[0]}function Bm(t){return t[1]}function Ym(t,n){var e=ym(!0),r=null,i=Im,o=null,a=km(u);function u(u){var c,f,s,l=(u=qm(u)).length,h=!1;for(null==r&&(o=i(s=a())),c=0;c<=l;++c)!(c<l&&e(f=u[c],c,u))===h&&((h=!h)?o.lineStart():o.lineEnd()),h&&o.point(+t(f,c,u),+n(f,c,u));if(s)return o=null,s+""||null}return t="function"==typeof t?t:void 0===t?Om:ym(t),n="function"==typeof n?n:void 0===n?Bm:ym(n),u.x=function(n){return arguments.length?(t="function"==typeof n?n:ym(+n),u):t},u.y=function(t){return arguments.length?(n="function"==typeof t?t:ym(+t),u):n},u.defined=function(t){return arguments.length?(e="function"==typeof t?t:ym(!!t),u):e},u.curve=function(t){return arguments.length?(i=t,null!=r&&(o=i(r)),u):i},u.context=function(t){return arguments.length?(null==t?r=o=null:o=i(r=t),u):r},u}function Lm(t,n,e){var r=null,i=ym(!0),o=null,a=Im,u=null,c=km(f);function f(f){var s,l,h,d,p,g=(f=qm(f)).length,y=!1,v=new Array(g),_=new Array(g);for(null==o&&(u=a(p=c())),s=0;s<=g;++s){if(!(s<g&&i(d=f[s],s,f))===y)if(y=!y)l=s,u.areaStart(),u.lineStart();else{for(u.lineEnd(),u.lineStart(),h=s-1;h>=l;--h)u.point(v[h],_[h]);u.lineEnd(),u.areaEnd()}y&&(v[s]=+t(d,s,f),_[s]=+n(d,s,f),u.point(r?+r(d,s,f):v[s],e?+e(d,s,f):_[s]))}if(p)return u=null,p+""||null}function s(){return Ym().defined(i).curve(a).context(o)}return t="function"==typeof t?t:void 0===t?Om:ym(+t),n="function"==typeof n?n:ym(void 0===n?0:+n),e="function"==typeof e?e:void 0===e?Bm:ym(+e),f.x=function(n){return arguments.length?(t="function"==typeof n?n:ym(+n),r=null,f):t},f.x0=function(n){return arguments.length?(t="function"==typeof n?n:ym(+n),f):t},f.x1=function(t){return arguments.length?(r=null==t?null:"function"==typeof t?t:ym(+t),f):r},f.y=function(t){return arguments.length?(n="function"==typeof t?t:ym(+t),e=null,f):n},f.y0=function(t){return arguments.length?(n="function"==typeof t?t:ym(+t),f):n},f.y1=function(t){return arguments.length?(e=null==t?null:"function"==typeof t?t:ym(+t),f):e},f.lineX0=f.lineY0=function(){return s().x(t).y(n)},f.lineY1=function(){return s().x(t).y(e)},f.lineX1=function(){return s().x(r).y(n)},f.defined=function(t){return arguments.length?(i="function"==typeof t?t:ym(!!t),f):i},f.curve=function(t){return arguments.length?(a=t,null!=o&&(u=a(o)),f):a},f.context=function(t){return arguments.length?(null==t?o=u=null:u=a(o=t),f):o},f}function jm(t,n){return n<t?-1:n>t?1:n>=t?0:NaN}function Hm(t){return t}Um.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._context.lineTo(t,n)}}};var Xm=Vm(Im);function Gm(t){this._curve=t}function Vm(t){function n(n){return new Gm(t(n))}return n._curve=t,n}function Wm(t){var n=t.curve;return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t.curve=function(t){return arguments.length?n(Vm(t)):n()._curve},t}function Zm(){return Wm(Ym().curve(Xm))}function Km(){var t=Lm().curve(Xm),n=t.curve,e=t.lineX0,r=t.lineX1,i=t.lineY0,o=t.lineY1;return t.angle=t.x,delete t.x,t.startAngle=t.x0,delete t.x0,t.endAngle=t.x1,delete t.x1,t.radius=t.y,delete t.y,t.innerRadius=t.y0,delete t.y0,t.outerRadius=t.y1,delete t.y1,t.lineStartAngle=function(){return Wm(e())},delete t.lineX0,t.lineEndAngle=function(){return Wm(r())},delete t.lineX1,t.lineInnerRadius=function(){return Wm(i())},delete t.lineY0,t.lineOuterRadius=function(){return Wm(o())},delete t.lineY1,t.curve=function(t){return arguments.length?n(Vm(t)):n()._curve},t}function Qm(t,n){return[(n=+n)*Math.cos(t-=Math.PI/2),n*Math.sin(t)]}Gm.prototype={areaStart:function(){this._curve.areaStart()},areaEnd:function(){this._curve.areaEnd()},lineStart:function(){this._curve.lineStart()},lineEnd:function(){this._curve.lineEnd()},point:function(t,n){this._curve.point(n*Math.sin(t),n*-Math.cos(t))}};class Jm{constructor(t,n){this._context=t,this._x=n}areaStart(){this._line=0}areaEnd(){this._line=NaN}lineStart(){this._point=0}lineEnd(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line}point(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._x?this._context.bezierCurveTo(this._x0=(this._x0+t)/2,this._y0,this._x0,n,t,n):this._context.bezierCurveTo(this._x0,this._y0=(this._y0+n)/2,t,this._y0,t,n)}this._x0=t,this._y0=n}}class tx{constructor(t){this._context=t}lineStart(){this._point=0}lineEnd(){}point(t,n){if(t=+t,n=+n,0===this._point)this._point=1;else{const e=Qm(this._x0,this._y0),r=Qm(this._x0,this._y0=(this._y0+n)/2),i=Qm(t,this._y0),o=Qm(t,n);this._context.moveTo(...e),this._context.bezierCurveTo(...r,...i,...o)}this._x0=t,this._y0=n}}function nx(t){return new Jm(t,!0)}function ex(t){return new Jm(t,!1)}function rx(t){return new tx(t)}function ix(t){return t.source}function ox(t){return t.target}function ax(t){let n=ix,e=ox,r=Om,i=Bm,o=null,a=null,u=km(c);function c(){let c;const f=Fm.call(arguments),s=n.apply(this,f),l=e.apply(this,f);if(null==o&&(a=t(c=u())),a.lineStart(),f[0]=s,a.point(+r.apply(this,f),+i.apply(this,f)),f[0]=l,a.point(+r.apply(this,f),+i.apply(this,f)),a.lineEnd(),c)return a=null,c+""||null}return c.source=function(t){return arguments.length?(n=t,c):n},c.target=function(t){return arguments.length?(e=t,c):e},c.x=function(t){return arguments.length?(r="function"==typeof t?t:ym(+t),c):r},c.y=function(t){return arguments.length?(i="function"==typeof t?t:ym(+t),c):i},c.context=function(n){return arguments.length?(null==n?o=a=null:a=t(o=n),c):o},c}const ux=Mm(3);var cx={draw(t,n){const e=.59436*Mm(n+xm(n/28,.75)),r=e/2,i=r*ux;t.moveTo(0,e),t.lineTo(0,-e),t.moveTo(-i,-r),t.lineTo(i,r),t.moveTo(-i,r),t.lineTo(i,-r)}},fx={draw(t,n){const e=Mm(n/Am);t.moveTo(e,0),t.arc(0,0,e,0,Em)}},sx={draw(t,n){const e=Mm(n/5)/2;t.moveTo(-3*e,-e),t.lineTo(-e,-e),t.lineTo(-e,-3*e),t.lineTo(e,-3*e),t.lineTo(e,-e),t.lineTo(3*e,-e),t.lineTo(3*e,e),t.lineTo(e,e),t.lineTo(e,3*e),t.lineTo(-e,3*e),t.lineTo(-e,e),t.lineTo(-3*e,e),t.closePath()}};const lx=Mm(1/3),hx=2*lx;var dx={draw(t,n){const e=Mm(n/hx),r=e*lx;t.moveTo(0,-e),t.lineTo(r,0),t.lineTo(0,e),t.lineTo(-r,0),t.closePath()}},px={draw(t,n){const e=.62625*Mm(n);t.moveTo(0,-e),t.lineTo(e,0),t.lineTo(0,e),t.lineTo(-e,0),t.closePath()}},gx={draw(t,n){const e=.87559*Mm(n-xm(n/7,2));t.moveTo(-e,0),t.lineTo(e,0),t.moveTo(0,e),t.lineTo(0,-e)}},yx={draw(t,n){const e=Mm(n),r=-e/2;t.rect(r,r,e,e)}},vx={draw(t,n){const e=.4431*Mm(n);t.moveTo(e,e),t.lineTo(e,-e),t.lineTo(-e,-e),t.lineTo(-e,e),t.closePath()}};const _x=wm(Am/10)/wm(7*Am/10),bx=wm(Em/10)*_x,mx=-bm(Em/10)*_x;var xx={draw(t,n){const e=Mm(.8908130915292852*n),r=bx*e,i=mx*e;t.moveTo(0,-e),t.lineTo(r,i);for(let n=1;n<5;++n){const o=Em*n/5,a=bm(o),u=wm(o);t.lineTo(u*e,-a*e),t.lineTo(a*r-u*i,u*r+a*i)}t.closePath()}};const wx=Mm(3);var Mx={draw(t,n){const e=-Mm(n/(3*wx));t.moveTo(0,2*e),t.lineTo(-wx*e,-e),t.lineTo(wx*e,-e),t.closePath()}};const Tx=Mm(3);var Ax={draw(t,n){const e=.6824*Mm(n),r=e/2,i=e*Tx/2;t.moveTo(0,-e),t.lineTo(i,r),t.lineTo(-i,r),t.closePath()}};const Sx=-.5,Ex=Mm(3)/2,Nx=1/Mm(12),kx=3*(Nx/2+1);var Cx={draw(t,n){const e=Mm(n/kx),r=e/2,i=e*Nx,o=r,a=e*Nx+e,u=-o,c=a;t.moveTo(r,i),t.lineTo(o,a),t.lineTo(u,c),t.lineTo(Sx*r-Ex*i,Ex*r+Sx*i),t.lineTo(Sx*o-Ex*a,Ex*o+Sx*a),t.lineTo(Sx*u-Ex*c,Ex*u+Sx*c),t.lineTo(Sx*r+Ex*i,Sx*i-Ex*r),t.lineTo(Sx*o+Ex*a,Sx*a-Ex*o),t.lineTo(Sx*u+Ex*c,Sx*c-Ex*u),t.closePath()}},Px={draw(t,n){const e=.6189*Mm(n-xm(n/6,1.7));t.moveTo(-e,-e),t.lineTo(e,e),t.moveTo(-e,e),t.lineTo(e,-e)}};const zx=[fx,sx,dx,yx,xx,Mx,Cx],$x=[fx,gx,Px,Ax,cx,vx,px];function Dx(){}function Rx(t,n,e){t._context.bezierCurveTo((2*t._x0+t._x1)/3,(2*t._y0+t._y1)/3,(t._x0+2*t._x1)/3,(t._y0+2*t._y1)/3,(t._x0+4*t._x1+n)/6,(t._y0+4*t._y1+e)/6)}function Fx(t){this._context=t}function qx(t){this._context=t}function Ux(t){this._context=t}function Ix(t,n){this._basis=new Fx(t),this._beta=n}Fx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){switch(this._point){case 3:Rx(this,this._x1,this._y1);case 2:this._context.lineTo(this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,this._context.lineTo((5*this._x0+this._x1)/6,(5*this._y0+this._y1)/6);default:Rx(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},qx.prototype={areaStart:Dx,areaEnd:Dx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._y0=this._y1=this._y2=this._y3=this._y4=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x2,this._y2),this._context.closePath();break;case 2:this._context.moveTo((this._x2+2*this._x3)/3,(this._y2+2*this._y3)/3),this._context.lineTo((this._x3+2*this._x2)/3,(this._y3+2*this._y2)/3),this._context.closePath();break;case 3:this.point(this._x2,this._y2),this.point(this._x3,this._y3),this.point(this._x4,this._y4)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x2=t,this._y2=n;break;case 1:this._point=2,this._x3=t,this._y3=n;break;case 2:this._point=3,this._x4=t,this._y4=n,this._context.moveTo((this._x0+4*this._x1+t)/6,(this._y0+4*this._y1+n)/6);break;default:Rx(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},Ux.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3;var e=(this._x0+4*this._x1+t)/6,r=(this._y0+4*this._y1+n)/6;this._line?this._context.lineTo(e,r):this._context.moveTo(e,r);break;case 3:this._point=4;default:Rx(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},Ix.prototype={lineStart:function(){this._x=[],this._y=[],this._basis.lineStart()},lineEnd:function(){var t=this._x,n=this._y,e=t.length-1;if(e>0)for(var r,i=t[0],o=n[0],a=t[e]-i,u=n[e]-o,c=-1;++c<=e;)r=c/e,this._basis.point(this._beta*t[c]+(1-this._beta)*(i+r*a),this._beta*n[c]+(1-this._beta)*(o+r*u));this._x=this._y=null,this._basis.lineEnd()},point:function(t,n){this._x.push(+t),this._y.push(+n)}};var Ox=function t(n){function e(t){return 1===n?new Fx(t):new Ix(t,n)}return e.beta=function(n){return t(+n)},e}(.85);function Bx(t,n,e){t._context.bezierCurveTo(t._x1+t._k*(t._x2-t._x0),t._y1+t._k*(t._y2-t._y0),t._x2+t._k*(t._x1-n),t._y2+t._k*(t._y1-e),t._x2,t._y2)}function Yx(t,n){this._context=t,this._k=(1-n)/6}Yx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:Bx(this,this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2,this._x1=t,this._y1=n;break;case 2:this._point=3;default:Bx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Lx=function t(n){function e(t){return new Yx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function jx(t,n){this._context=t,this._k=(1-n)/6}jx.prototype={areaStart:Dx,areaEnd:Dx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:Bx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Hx=function t(n){function e(t){return new jx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function Xx(t,n){this._context=t,this._k=(1-n)/6}Xx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:Bx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Gx=function t(n){function e(t){return new Xx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function Vx(t,n,e){var r=t._x1,i=t._y1,o=t._x2,a=t._y2;if(t._l01_a>Tm){var u=2*t._l01_2a+3*t._l01_a*t._l12_a+t._l12_2a,c=3*t._l01_a*(t._l01_a+t._l12_a);r=(r*u-t._x0*t._l12_2a+t._x2*t._l01_2a)/c,i=(i*u-t._y0*t._l12_2a+t._y2*t._l01_2a)/c}if(t._l23_a>Tm){var f=2*t._l23_2a+3*t._l23_a*t._l12_a+t._l12_2a,s=3*t._l23_a*(t._l23_a+t._l12_a);o=(o*f+t._x1*t._l23_2a-n*t._l12_2a)/s,a=(a*f+t._y1*t._l23_2a-e*t._l12_2a)/s}t._context.bezierCurveTo(r,i,o,a,t._x2,t._y2)}function Wx(t,n){this._context=t,this._alpha=n}Wx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:this.point(this._x2,this._y2)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3;default:Vx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Zx=function t(n){function e(t){return n?new Wx(t,n):new Yx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function Kx(t,n){this._context=t,this._alpha=n}Kx.prototype={areaStart:Dx,areaEnd:Dx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:Vx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Qx=function t(n){function e(t){return n?new Kx(t,n):new jx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function Jx(t,n){this._context=t,this._alpha=n}Jx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:Vx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var tw=function t(n){function e(t){return n?new Jx(t,n):new Xx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function nw(t){this._context=t}function ew(t){return t<0?-1:1}function rw(t,n,e){var r=t._x1-t._x0,i=n-t._x1,o=(t._y1-t._y0)/(r||i<0&&-0),a=(e-t._y1)/(i||r<0&&-0),u=(o*i+a*r)/(r+i);return(ew(o)+ew(a))*Math.min(Math.abs(o),Math.abs(a),.5*Math.abs(u))||0}function iw(t,n){var e=t._x1-t._x0;return e?(3*(t._y1-t._y0)/e-n)/2:n}function ow(t,n,e){var r=t._x0,i=t._y0,o=t._x1,a=t._y1,u=(o-r)/3;t._context.bezierCurveTo(r+u,i+u*n,o-u,a-u*e,o,a)}function aw(t){this._context=t}function uw(t){this._context=new cw(t)}function cw(t){this._context=t}function fw(t){this._context=t}function sw(t){var n,e,r=t.length-1,i=new Array(r),o=new Array(r),a=new Array(r);for(i[0]=0,o[0]=2,a[0]=t[0]+2*t[1],n=1;n<r-1;++n)i[n]=1,o[n]=4,a[n]=4*t[n]+2*t[n+1];for(i[r-1]=2,o[r-1]=7,a[r-1]=8*t[r-1]+t[r],n=1;n<r;++n)e=i[n]/o[n-1],o[n]-=e,a[n]-=e*a[n-1];for(i[r-1]=a[r-1]/o[r-1],n=r-2;n>=0;--n)i[n]=(a[n]-i[n+1])/o[n];for(o[r-1]=(t[r]+i[r-1])/2,n=0;n<r-1;++n)o[n]=2*t[n+1]-i[n+1];return[i,o]}function lw(t,n){this._context=t,this._t=n}function hw(t,n){if((i=t.length)>1)for(var e,r,i,o=1,a=t[n[0]],u=a.length;o<i;++o)for(r=a,a=t[n[o]],e=0;e<u;++e)a[e][1]+=a[e][0]=isNaN(r[e][1])?r[e][0]:r[e][1]}function dw(t){for(var n=t.length,e=new Array(n);--n>=0;)e[n]=n;return e}function pw(t,n){return t[n]}function gw(t){const n=[];return n.key=t,n}function yw(t){var n=t.map(vw);return dw(t).sort((function(t,e){return n[t]-n[e]}))}function vw(t){for(var n,e=-1,r=0,i=t.length,o=-1/0;++e<i;)(n=+t[e][1])>o&&(o=n,r=e);return r}function _w(t){var n=t.map(bw);return dw(t).sort((function(t,e){return n[t]-n[e]}))}function bw(t){for(var n,e=0,r=-1,i=t.length;++r<i;)(n=+t[r][1])&&(e+=n);return e}nw.prototype={areaStart:Dx,areaEnd:Dx,lineStart:function(){this._point=0},lineEnd:function(){this._point&&this._context.closePath()},point:function(t,n){t=+t,n=+n,this._point?this._context.lineTo(t,n):(this._point=1,this._context.moveTo(t,n))}},aw.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:ow(this,this._t0,iw(this,this._t0))}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){var e=NaN;if(n=+n,(t=+t)!==this._x1||n!==this._y1){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,ow(this,iw(this,e=rw(this,t,n)),e);break;default:ow(this,this._t0,e=rw(this,t,n))}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n,this._t0=e}}},(uw.prototype=Object.create(aw.prototype)).point=function(t,n){aw.prototype.point.call(this,n,t)},cw.prototype={moveTo:function(t,n){this._context.moveTo(n,t)},closePath:function(){this._context.closePath()},lineTo:function(t,n){this._context.lineTo(n,t)},bezierCurveTo:function(t,n,e,r,i,o){this._context.bezierCurveTo(n,t,r,e,o,i)}},fw.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var t=this._x,n=this._y,e=t.length;if(e)if(this._line?this._context.lineTo(t[0],n[0]):this._context.moveTo(t[0],n[0]),2===e)this._context.lineTo(t[1],n[1]);else for(var r=sw(t),i=sw(n),o=0,a=1;a<e;++o,++a)this._context.bezierCurveTo(r[0][o],i[0][o],r[1][o],i[1][o],t[a],n[a]);(this._line||0!==this._line&&1===e)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(t,n){this._x.push(+t),this._y.push(+n)}},lw.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&2===this._point&&this._context.lineTo(this._x,this._y),(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:if(this._t<=0)this._context.lineTo(this._x,n),this._context.lineTo(t,n);else{var e=this._x*(1-this._t)+t*this._t;this._context.lineTo(e,this._y),this._context.lineTo(e,n)}}this._x=t,this._y=n}};var mw=t=>()=>t;function xw(t,{sourceEvent:n,target:e,transform:r,dispatch:i}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},target:{value:e,enumerable:!0,configurable:!0},transform:{value:r,enumerable:!0,configurable:!0},_:{value:i}})}function ww(t,n,e){this.k=t,this.x=n,this.y=e}ww.prototype={constructor:ww,scale:function(t){return 1===t?this:new ww(this.k*t,this.x,this.y)},translate:function(t,n){return 0===t&0===n?this:new ww(this.k,this.x+this.k*t,this.y+this.k*n)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var Mw=new ww(1,0,0);function Tw(t){for(;!t.__zoom;)if(!(t=t.parentNode))return Mw;return t.__zoom}function Aw(t){t.stopImmediatePropagation()}function Sw(t){t.preventDefault(),t.stopImmediatePropagation()}function Ew(t){return!(t.ctrlKey&&"wheel"!==t.type||t.button)}function Nw(){var t=this;return t instanceof SVGElement?(t=t.ownerSVGElement||t).hasAttribute("viewBox")?[[(t=t.viewBox.baseVal).x,t.y],[t.x+t.width,t.y+t.height]]:[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]:[[0,0],[t.clientWidth,t.clientHeight]]}function kw(){return this.__zoom||Mw}function Cw(t){return-t.deltaY*(1===t.deltaMode?.05:t.deltaMode?1:.002)*(t.ctrlKey?10:1)}function Pw(){return navigator.maxTouchPoints||"ontouchstart"in this}function zw(t,n,e){var r=t.invertX(n[0][0])-e[0][0],i=t.invertX(n[1][0])-e[1][0],o=t.invertY(n[0][1])-e[0][1],a=t.invertY(n[1][1])-e[1][1];return t.translate(i>r?(r+i)/2:Math.min(0,r)||Math.max(0,i),a>o?(o+a)/2:Math.min(0,o)||Math.max(0,a))}Tw.prototype=ww.prototype,t.Adder=T,t.Delaunay=Lu,t.FormatSpecifier=tf,t.InternMap=InternMap,t.InternSet=InternSet,t.Node=Qd,t.Path=Ua,t.Voronoi=qu,t.ZoomTransform=ww,t.active=function(t,n){var e,r,i=t.__transition;if(i)for(r in n=null==n?null:n+"",i)if((e=i[r]).state>qi&&e.name===n)return new po([[t]],Zo,n,+r);return null},t.arc=function(){var t=Cm,n=Pm,e=ym(0),r=null,i=zm,o=$m,a=Dm,u=null,c=km(f);function f(){var f,s,l=+t.apply(this,arguments),h=+n.apply(this,arguments),d=i.apply(this,arguments)-Sm,p=o.apply(this,arguments)-Sm,g=vm(p-d),y=p>d;if(u||(u=f=c()),h<l&&(s=h,h=l,l=s),h>Tm)if(g>Em-Tm)u.moveTo(h*bm(d),h*wm(d)),u.arc(0,0,h,d,p,!y),l>Tm&&(u.moveTo(l*bm(p),l*wm(p)),u.arc(0,0,l,p,d,y));else{var v,_,b=d,m=p,x=d,w=p,M=g,T=g,A=a.apply(this,arguments)/2,S=A>Tm&&(r?+r.apply(this,arguments):Mm(l*l+h*h)),E=xm(vm(h-l)/2,+e.apply(this,arguments)),N=E,k=E;if(S>Tm){var C=Nm(S/l*wm(A)),P=Nm(S/h*wm(A));(M-=2*C)>Tm?(x+=C*=y?1:-1,w-=C):(M=0,x=w=(d+p)/2),(T-=2*P)>Tm?(b+=P*=y?1:-1,m-=P):(T=0,b=m=(d+p)/2)}var z=h*bm(b),$=h*wm(b),D=l*bm(w),R=l*wm(w);if(E>Tm){var F,q=h*bm(m),U=h*wm(m),I=l*bm(x),O=l*wm(x);if(g<Am)if(F=function(t,n,e,r,i,o,a,u){var c=e-t,f=r-n,s=a-i,l=u-o,h=l*c-s*f;if(!(h*h<Tm))return[t+(h=(s*(n-o)-l*(t-i))/h)*c,n+h*f]}(z,$,I,O,q,U,D,R)){var B=z-F[0],Y=$-F[1],L=q-F[0],j=U-F[1],H=1/wm(function(t){return t>1?0:t<-1?Am:Math.acos(t)}((B*L+Y*j)/(Mm(B*B+Y*Y)*Mm(L*L+j*j)))/2),X=Mm(F[0]*F[0]+F[1]*F[1]);N=xm(E,(l-X)/(H-1)),k=xm(E,(h-X)/(H+1))}else N=k=0}T>Tm?k>Tm?(v=Rm(I,O,z,$,h,k,y),_=Rm(q,U,D,R,h,k,y),u.moveTo(v.cx+v.x01,v.cy+v.y01),k<E?u.arc(v.cx,v.cy,k,_m(v.y01,v.x01),_m(_.y01,_.x01),!y):(u.arc(v.cx,v.cy,k,_m(v.y01,v.x01),_m(v.y11,v.x11),!y),u.arc(0,0,h,_m(v.cy+v.y11,v.cx+v.x11),_m(_.cy+_.y11,_.cx+_.x11),!y),u.arc(_.cx,_.cy,k,_m(_.y11,_.x11),_m(_.y01,_.x01),!y))):(u.moveTo(z,$),u.arc(0,0,h,b,m,!y)):u.moveTo(z,$),l>Tm&&M>Tm?N>Tm?(v=Rm(D,R,q,U,l,-N,y),_=Rm(z,$,I,O,l,-N,y),u.lineTo(v.cx+v.x01,v.cy+v.y01),N<E?u.arc(v.cx,v.cy,N,_m(v.y01,v.x01),_m(_.y01,_.x01),!y):(u.arc(v.cx,v.cy,N,_m(v.y01,v.x01),_m(v.y11,v.x11),!y),u.arc(0,0,l,_m(v.cy+v.y11,v.cx+v.x11),_m(_.cy+_.y11,_.cx+_.x11),y),u.arc(_.cx,_.cy,N,_m(_.y11,_.x11),_m(_.y01,_.x01),!y))):u.arc(0,0,l,w,x,y):u.lineTo(D,R)}else u.moveTo(0,0);if(u.closePath(),f)return u=null,f+""||null}return f.centroid=function(){var e=(+t.apply(this,arguments)+ +n.apply(this,arguments))/2,r=(+i.apply(this,arguments)+ +o.apply(this,arguments))/2-Am/2;return[bm(r)*e,wm(r)*e]},f.innerRadius=function(n){return arguments.length?(t="function"==typeof n?n:ym(+n),f):t},f.outerRadius=function(t){return arguments.length?(n="function"==typeof t?t:ym(+t),f):n},f.cornerRadius=function(t){return arguments.length?(e="function"==typeof t?t:ym(+t),f):e},f.padRadius=function(t){return arguments.length?(r=null==t?null:"function"==typeof t?t:ym(+t),f):r},f.startAngle=function(t){return arguments.length?(i="function"==typeof t?t:ym(+t),f):i},f.endAngle=function(t){return arguments.length?(o="function"==typeof t?t:ym(+t),f):o},f.padAngle=function(t){return arguments.length?(a="function"==typeof t?t:ym(+t),f):a},f.context=function(t){return arguments.length?(u=null==t?null:t,f):u},f},t.area=Lm,t.areaRadial=Km,t.ascending=n,t.autoType=function(t){for(var n in t){var e,r,i=t[n].trim();if(i)if("true"===i)i=!0;else if("false"===i)i=!1;else if("NaN"===i)i=NaN;else if(isNaN(e=+i)){if(!(r=i.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)))continue;yc&&r[4]&&!r[7]&&(i=i.replace(/-/g,"/").replace(/T/," ")),i=new Date(i)}else i=e;else i=null;t[n]=i}return t},t.axisBottom=function(t){return Pt(Mt,t)},t.axisLeft=function(t){return Pt(Tt,t)},t.axisRight=function(t){return Pt(wt,t)},t.axisTop=function(t){return Pt(xt,t)},t.bin=Q,t.bisect=s,t.bisectCenter=f,t.bisectLeft=c,t.bisectRight=u,t.bisector=r,t.blob=function(t,n){return fetch(t,n).then(vc)},t.blur=function(t,n){if(!((n=+n)>=0))throw new RangeError("invalid r");let e=t.length;if(!((e=Math.floor(e))>=0))throw new RangeError("invalid length");if(!e||!n)return t;const r=y(n),i=t.slice();return r(t,i,0,e,1),r(i,t,0,e,1),r(t,i,0,e,1),t},t.blur2=l,t.blurImage=h,t.brush=function(){return wa(la)},t.brushSelection=function(t){var n=t.__brush;return n?n.dim.output(n.selection):null},t.brushX=function(){return wa(fa)},t.brushY=function(){return wa(sa)},t.buffer=function(t,n){return fetch(t,n).then(_c)},t.chord=function(){return za(!1,!1)},t.chordDirected=function(){return za(!0,!1)},t.chordTranspose=function(){return za(!1,!0)},t.cluster=function(){var t=Ld,n=1,e=1,r=!1;function i(i){var o,a=0;i.eachAfter((function(n){var e=n.children;e?(n.x=function(t){return t.reduce(jd,0)/t.length}(e),n.y=function(t){return 1+t.reduce(Hd,0)}(e)):(n.x=o?a+=t(n,o):0,n.y=0,o=n)}));var u=function(t){for(var n;n=t.children;)t=n[0];return t}(i),c=function(t){for(var n;n=t.children;)t=n[n.length-1];return t}(i),f=u.x-t(u,c)/2,s=c.x+t(c,u)/2;return i.eachAfter(r?function(t){t.x=(t.x-i.x)*n,t.y=(i.y-t.y)*e}:function(t){t.x=(t.x-f)/(s-f)*n,t.y=(1-(i.y?t.y/i.y:1))*e})}return i.separation=function(n){return arguments.length?(t=n,i):t},i.size=function(t){return arguments.length?(r=!1,n=+t[0],e=+t[1],i):r?null:[n,e]},i.nodeSize=function(t){return arguments.length?(r=!0,n=+t[0],e=+t[1],i):r?[n,e]:null},i},t.color=ze,t.contourDensity=function(){var t=fu,n=su,e=lu,r=960,i=500,o=20,a=2,u=3*o,c=r+2*u>>a,f=i+2*u>>a,s=Qa(20);function h(r){var i=new Float32Array(c*f),s=Math.pow(2,-a),h=-1;for(const o of r){var d=(t(o,++h,r)+u)*s,p=(n(o,h,r)+u)*s,g=+e(o,h,r);if(g&&d>=0&&d<c&&p>=0&&p<f){var y=Math.floor(d),v=Math.floor(p),_=d-y-.5,b=p-v-.5;i[y+v*c]+=(1-_)*(1-b)*g,i[y+1+v*c]+=_*(1-b)*g,i[y+1+(v+1)*c]+=_*b*g,i[y+(v+1)*c]+=(1-_)*b*g}}return l({data:i,width:c,height:f},o*s),i}function d(t){var n=h(t),e=s(n),r=Math.pow(2,2*a);return Array.isArray(e)||(e=G(Number.MIN_VALUE,J(n)/r,e)),iu().size([c,f]).thresholds(e.map((t=>t*r)))(n).map(((t,n)=>(t.value=+e[n],p(t))))}function p(t){return t.coordinates.forEach(g),t}function g(t){t.forEach(y)}function y(t){t.forEach(v)}function v(t){t[0]=t[0]*Math.pow(2,a)-u,t[1]=t[1]*Math.pow(2,a)-u}function _(){return c=r+2*(u=3*o)>>a,f=i+2*u>>a,d}return d.contours=function(t){var n=h(t),e=iu().size([c,f]),r=Math.pow(2,2*a),i=t=>{t=+t;var i=p(e.contour(n,t*r));return i.value=t,i};return Object.defineProperty(i,"max",{get:()=>J(n)/r}),i},d.x=function(n){return arguments.length?(t="function"==typeof n?n:Qa(+n),d):t},d.y=function(t){return arguments.length?(n="function"==typeof t?t:Qa(+t),d):n},d.weight=function(t){return arguments.length?(e="function"==typeof t?t:Qa(+t),d):e},d.size=function(t){if(!arguments.length)return[r,i];var n=+t[0],e=+t[1];if(!(n>=0&&e>=0))throw new Error("invalid size");return r=n,i=e,_()},d.cellSize=function(t){if(!arguments.length)return 1<<a;if(!((t=+t)>=1))throw new Error("invalid cell size");return a=Math.floor(Math.log(t)/Math.LN2),_()},d.thresholds=function(t){return arguments.length?(s="function"==typeof t?t:Array.isArray(t)?Qa(Za.call(t)):Qa(t),d):s},d.bandwidth=function(t){if(!arguments.length)return Math.sqrt(o*(o+1));if(!((t=+t)>=0))throw new Error("invalid bandwidth");return o=(Math.sqrt(4*t*t+1)-1)/2,_()},d},t.contours=iu,t.count=v,t.create=function(t){return Zn(Yt(t).call(document.documentElement))},t.creator=Yt,t.cross=function(...t){const n="function"==typeof t[t.length-1]&&function(t){return n=>t(...n)}(t.pop()),e=(t=t.map(m)).map(_),r=t.length-1,i=new Array(r+1).fill(0),o=[];if(r<0||e.some(b))return o;for(;;){o.push(i.map(((n,e)=>t[e][n])));let a=r;for(;++i[a]===e[a];){if(0===a)return n?o.map(n):o;i[a--]=0}}},t.csv=wc,t.csvFormat=rc,t.csvFormatBody=ic,t.csvFormatRow=ac,t.csvFormatRows=oc,t.csvFormatValue=uc,t.csvParse=nc,t.csvParseRows=ec,t.cubehelix=Tr,t.cumsum=function(t,n){var e=0,r=0;return Float64Array.from(t,void 0===n?t=>e+=+t||0:i=>e+=+n(i,r++,t)||0)},t.curveBasis=function(t){return new Fx(t)},t.curveBasisClosed=function(t){return new qx(t)},t.curveBasisOpen=function(t){return new Ux(t)},t.curveBumpX=nx,t.curveBumpY=ex,t.curveBundle=Ox,t.curveCardinal=Lx,t.curveCardinalClosed=Hx,t.curveCardinalOpen=Gx,t.curveCatmullRom=Zx,t.curveCatmullRomClosed=Qx,t.curveCatmullRomOpen=tw,t.curveLinear=Im,t.curveLinearClosed=function(t){return new nw(t)},t.curveMonotoneX=function(t){return new aw(t)},t.curveMonotoneY=function(t){return new uw(t)},t.curveNatural=function(t){return new fw(t)},t.curveStep=function(t){return new lw(t,.5)},t.curveStepAfter=function(t){return new lw(t,1)},t.curveStepBefore=function(t){return new lw(t,0)},t.descending=e,t.deviation=w,t.difference=function(t,...n){t=new InternSet(t);for(const e of n)for(const n of e)t.delete(n);return t},t.disjoint=function(t,n){const e=n[Symbol.iterator](),r=new InternSet;for(const n of t){if(r.has(n))return!1;let t,i;for(;({value:t,done:i}=e.next())&&!i;){if(Object.is(n,t))return!1;r.add(t)}}return!0},t.dispatch=$t,t.drag=function(){var t,n,e,r,i=se,o=le,a=he,u=de,c={},f=$t("start","drag","end"),s=0,l=0;function h(t){t.on("mousedown.drag",d).filter(u).on("touchstart.drag",y).on("touchmove.drag",v,ee).on("touchend.drag touchcancel.drag",_).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function d(a,u){if(!r&&i.call(this,a,u)){var c=b(this,o.call(this,a,u),a,u,"mouse");c&&(Zn(a.view).on("mousemove.drag",p,re).on("mouseup.drag",g,re),ae(a.view),ie(a),e=!1,t=a.clientX,n=a.clientY,c("start",a))}}function p(r){if(oe(r),!e){var i=r.clientX-t,o=r.clientY-n;e=i*i+o*o>l}c.mouse("drag",r)}function g(t){Zn(t.view).on("mousemove.drag mouseup.drag",null),ue(t.view,e),oe(t),c.mouse("end",t)}function y(t,n){if(i.call(this,t,n)){var e,r,a=t.changedTouches,u=o.call(this,t,n),c=a.length;for(e=0;e<c;++e)(r=b(this,u,t,n,a[e].identifier,a[e]))&&(ie(t),r("start",t,a[e]))}}function v(t){var n,e,r=t.changedTouches,i=r.length;for(n=0;n<i;++n)(e=c[r[n].identifier])&&(oe(t),e("drag",t,r[n]))}function _(t){var n,e,i=t.changedTouches,o=i.length;for(r&&clearTimeout(r),r=setTimeout((function(){r=null}),500),n=0;n<o;++n)(e=c[i[n].identifier])&&(ie(t),e("end",t,i[n]))}function b(t,n,e,r,i,o){var u,l,d,p=f.copy(),g=ne(o||e,n);if(null!=(d=a.call(t,new fe("beforestart",{sourceEvent:e,target:h,identifier:i,active:s,x:g[0],y:g[1],dx:0,dy:0,dispatch:p}),r)))return u=d.x-g[0]||0,l=d.y-g[1]||0,function e(o,a,f){var y,v=g;switch(o){case"start":c[i]=e,y=s++;break;case"end":delete c[i],--s;case"drag":g=ne(f||a,n),y=s}p.call(o,t,new fe(o,{sourceEvent:a,subject:d,target:h,identifier:i,active:y,x:g[0]+u,y:g[1]+l,dx:g[0]-v[0],dy:g[1]-v[1],dispatch:p}),r)}}return h.filter=function(t){return arguments.length?(i="function"==typeof t?t:ce(!!t),h):i},h.container=function(t){return arguments.length?(o="function"==typeof t?t:ce(t),h):o},h.subject=function(t){return arguments.length?(a="function"==typeof t?t:ce(t),h):a},h.touchable=function(t){return arguments.length?(u="function"==typeof t?t:ce(!!t),h):u},h.on=function(){var t=f.on.apply(f,arguments);return t===f?h:t},h.clickDistance=function(t){return arguments.length?(l=(t=+t)*t,h):Math.sqrt(l)},h},t.dragDisable=ae,t.dragEnable=ue,t.dsv=function(t,n,e,r){3===arguments.length&&"function"==typeof e&&(r=e,e=void 0);var i=Ju(t);return mc(n,e).then((function(t){return i.parse(t,r)}))},t.dsvFormat=Ju,t.easeBack=Lo,t.easeBackIn=Bo,t.easeBackInOut=Lo,t.easeBackOut=Yo,t.easeBounce=Io,t.easeBounceIn=function(t){return 1-Io(1-t)},t.easeBounceInOut=function(t){return((t*=2)<=1?1-Io(1-t):Io(t-1)+1)/2},t.easeBounceOut=Io,t.easeCircle=No,t.easeCircleIn=function(t){return 1-Math.sqrt(1-t*t)},t.easeCircleInOut=No,t.easeCircleOut=function(t){return Math.sqrt(1- --t*t)},t.easeCubic=bo,t.easeCubicIn=function(t){return t*t*t},t.easeCubicInOut=bo,t.easeCubicOut=function(t){return--t*t*t+1},t.easeElastic=Xo,t.easeElasticIn=Ho,t.easeElasticInOut=Go,t.easeElasticOut=Xo,t.easeExp=Eo,t.easeExpIn=function(t){return So(1-+t)},t.easeExpInOut=Eo,t.easeExpOut=function(t){return 1-So(t)},t.easeLinear=t=>+t,t.easePoly=wo,t.easePolyIn=mo,t.easePolyInOut=wo,t.easePolyOut=xo,t.easeQuad=_o,t.easeQuadIn=function(t){return t*t},t.easeQuadInOut=_o,t.easeQuadOut=function(t){return t*(2-t)},t.easeSin=Ao,t.easeSinIn=function(t){return 1==+t?1:1-Math.cos(t*To)},t.easeSinInOut=Ao,t.easeSinOut=function(t){return Math.sin(t*To)},t.every=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");let e=-1;for(const r of t)if(!n(r,++e,t))return!1;return!0},t.extent=M,t.fcumsum=function(t,n){const e=new T;let r=-1;return Float64Array.from(t,void 0===n?t=>e.add(+t||0):i=>e.add(+n(i,++r,t)||0))},t.filter=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");const e=[];let r=-1;for(const i of t)n(i,++r,t)&&e.push(i);return e},t.flatGroup=function(t,...n){return z(P(t,...n),n)},t.flatRollup=function(t,n,...e){return z(D(t,n,...e),e)},t.forceCenter=function(t,n){var e,r=1;function i(){var i,o,a=e.length,u=0,c=0;for(i=0;i<a;++i)u+=(o=e[i]).x,c+=o.y;for(u=(u/a-t)*r,c=(c/a-n)*r,i=0;i<a;++i)(o=e[i]).x-=u,o.y-=c}return null==t&&(t=0),null==n&&(n=0),i.initialize=function(t){e=t},i.x=function(n){return arguments.length?(t=+n,i):t},i.y=function(t){return arguments.length?(n=+t,i):n},i.strength=function(t){return arguments.length?(r=+t,i):r},i},t.forceCollide=function(t){var n,e,r,i=1,o=1;function a(){for(var t,a,c,f,s,l,h,d=n.length,p=0;p<o;++p)for(a=$c(n,Ic,Oc).visitAfter(u),t=0;t<d;++t)c=n[t],l=e[c.index],h=l*l,f=c.x+c.vx,s=c.y+c.vy,a.visit(g);function g(t,n,e,o,a){var u=t.data,d=t.r,p=l+d;if(!u)return n>f+p||o<f-p||e>s+p||a<s-p;if(u.index>c.index){var g=f-u.x-u.vx,y=s-u.y-u.vy,v=g*g+y*y;v<p*p&&(0===g&&(v+=(g=Uc(r))*g),0===y&&(v+=(y=Uc(r))*y),v=(p-(v=Math.sqrt(v)))/v*i,c.vx+=(g*=v)*(p=(d*=d)/(h+d)),c.vy+=(y*=v)*p,u.vx-=g*(p=1-p),u.vy-=y*p)}}}function u(t){if(t.data)return t.r=e[t.data.index];for(var n=t.r=0;n<4;++n)t[n]&&t[n].r>t.r&&(t.r=t[n].r)}function c(){if(n){var r,i,o=n.length;for(e=new Array(o),r=0;r<o;++r)i=n[r],e[i.index]=+t(i,r,n)}}return"function"!=typeof t&&(t=qc(null==t?1:+t)),a.initialize=function(t,e){n=t,r=e,c()},a.iterations=function(t){return arguments.length?(o=+t,a):o},a.strength=function(t){return arguments.length?(i=+t,a):i},a.radius=function(n){return arguments.length?(t="function"==typeof n?n:qc(+n),c(),a):t},a},t.forceLink=function(t){var n,e,r,i,o,a,u=Bc,c=function(t){return 1/Math.min(i[t.source.index],i[t.target.index])},f=qc(30),s=1;function l(r){for(var i=0,u=t.length;i<s;++i)for(var c,f,l,h,d,p,g,y=0;y<u;++y)f=(c=t[y]).source,h=(l=c.target).x+l.vx-f.x-f.vx||Uc(a),d=l.y+l.vy-f.y-f.vy||Uc(a),h*=p=((p=Math.sqrt(h*h+d*d))-e[y])/p*r*n[y],d*=p,l.vx-=h*(g=o[y]),l.vy-=d*g,f.vx+=h*(g=1-g),f.vy+=d*g}function h(){if(r){var a,c,f=r.length,s=t.length,l=new Map(r.map(((t,n)=>[u(t,n,r),t])));for(a=0,i=new Array(f);a<s;++a)(c=t[a]).index=a,"object"!=typeof c.source&&(c.source=Yc(l,c.source)),"object"!=typeof c.target&&(c.target=Yc(l,c.target)),i[c.source.index]=(i[c.source.index]||0)+1,i[c.target.index]=(i[c.target.index]||0)+1;for(a=0,o=new Array(s);a<s;++a)c=t[a],o[a]=i[c.source.index]/(i[c.source.index]+i[c.target.index]);n=new Array(s),d(),e=new Array(s),p()}}function d(){if(r)for(var e=0,i=t.length;e<i;++e)n[e]=+c(t[e],e,t)}function p(){if(r)for(var n=0,i=t.length;n<i;++n)e[n]=+f(t[n],n,t)}return null==t&&(t=[]),l.initialize=function(t,n){r=t,a=n,h()},l.links=function(n){return arguments.length?(t=n,h(),l):t},l.id=function(t){return arguments.length?(u=t,l):u},l.iterations=function(t){return arguments.length?(s=+t,l):s},l.strength=function(t){return arguments.length?(c="function"==typeof t?t:qc(+t),d(),l):c},l.distance=function(t){return arguments.length?(f="function"==typeof t?t:qc(+t),p(),l):f},l},t.forceManyBody=function(){var t,n,e,r,i,o=qc(-30),a=1,u=1/0,c=.81;function f(e){var i,o=t.length,a=$c(t,Xc,Gc).visitAfter(l);for(r=e,i=0;i<o;++i)n=t[i],a.visit(h)}function s(){if(t){var n,e,r=t.length;for(i=new Array(r),n=0;n<r;++n)e=t[n],i[e.index]=+o(e,n,t)}}function l(t){var n,e,r,o,a,u=0,c=0;if(t.length){for(r=o=a=0;a<4;++a)(n=t[a])&&(e=Math.abs(n.value))&&(u+=n.value,c+=e,r+=e*n.x,o+=e*n.y);t.x=r/c,t.y=o/c}else{(n=t).x=n.data.x,n.y=n.data.y;do{u+=i[n.data.index]}while(n=n.next)}t.value=u}function h(t,o,f,s){if(!t.value)return!0;var l=t.x-n.x,h=t.y-n.y,d=s-o,p=l*l+h*h;if(d*d/c<p)return p<u&&(0===l&&(p+=(l=Uc(e))*l),0===h&&(p+=(h=Uc(e))*h),p<a&&(p=Math.sqrt(a*p)),n.vx+=l*t.value*r/p,n.vy+=h*t.value*r/p),!0;if(!(t.length||p>=u)){(t.data!==n||t.next)&&(0===l&&(p+=(l=Uc(e))*l),0===h&&(p+=(h=Uc(e))*h),p<a&&(p=Math.sqrt(a*p)));do{t.data!==n&&(d=i[t.data.index]*r/p,n.vx+=l*d,n.vy+=h*d)}while(t=t.next)}}return f.initialize=function(n,r){t=n,e=r,s()},f.strength=function(t){return arguments.length?(o="function"==typeof t?t:qc(+t),s(),f):o},f.distanceMin=function(t){return arguments.length?(a=t*t,f):Math.sqrt(a)},f.distanceMax=function(t){return arguments.length?(u=t*t,f):Math.sqrt(u)},f.theta=function(t){return arguments.length?(c=t*t,f):Math.sqrt(c)},f},t.forceRadial=function(t,n,e){var r,i,o,a=qc(.1);function u(t){for(var a=0,u=r.length;a<u;++a){var c=r[a],f=c.x-n||1e-6,s=c.y-e||1e-6,l=Math.sqrt(f*f+s*s),h=(o[a]-l)*i[a]*t/l;c.vx+=f*h,c.vy+=s*h}}function c(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)o[n]=+t(r[n],n,r),i[n]=isNaN(o[n])?0:+a(r[n],n,r)}}return"function"!=typeof t&&(t=qc(+t)),null==n&&(n=0),null==e&&(e=0),u.initialize=function(t){r=t,c()},u.strength=function(t){return arguments.length?(a="function"==typeof t?t:qc(+t),c(),u):a},u.radius=function(n){return arguments.length?(t="function"==typeof n?n:qc(+n),c(),u):t},u.x=function(t){return arguments.length?(n=+t,u):n},u.y=function(t){return arguments.length?(e=+t,u):e},u},t.forceSimulation=function(t){var n,e=1,r=.001,i=1-Math.pow(r,1/300),o=0,a=.6,u=new Map,c=Ni(l),f=$t("tick","end"),s=function(){let t=1;return()=>(t=(Lc*t+jc)%Hc)/Hc}();function l(){h(),f.call("tick",n),e<r&&(c.stop(),f.call("end",n))}function h(r){var c,f,s=t.length;void 0===r&&(r=1);for(var l=0;l<r;++l)for(e+=(o-e)*i,u.forEach((function(t){t(e)})),c=0;c<s;++c)null==(f=t[c]).fx?f.x+=f.vx*=a:(f.x=f.fx,f.vx=0),null==f.fy?f.y+=f.vy*=a:(f.y=f.fy,f.vy=0);return n}function d(){for(var n,e=0,r=t.length;e<r;++e){if((n=t[e]).index=e,null!=n.fx&&(n.x=n.fx),null!=n.fy&&(n.y=n.fy),isNaN(n.x)||isNaN(n.y)){var i=10*Math.sqrt(.5+e),o=e*Vc;n.x=i*Math.cos(o),n.y=i*Math.sin(o)}(isNaN(n.vx)||isNaN(n.vy))&&(n.vx=n.vy=0)}}function p(n){return n.initialize&&n.initialize(t,s),n}return null==t&&(t=[]),d(),n={tick:h,restart:function(){return c.restart(l),n},stop:function(){return c.stop(),n},nodes:function(e){return arguments.length?(t=e,d(),u.forEach(p),n):t},alpha:function(t){return arguments.length?(e=+t,n):e},alphaMin:function(t){return arguments.length?(r=+t,n):r},alphaDecay:function(t){return arguments.length?(i=+t,n):+i},alphaTarget:function(t){return arguments.length?(o=+t,n):o},velocityDecay:function(t){return arguments.length?(a=1-t,n):1-a},randomSource:function(t){return arguments.length?(s=t,u.forEach(p),n):s},force:function(t,e){return arguments.length>1?(null==e?u.delete(t):u.set(t,p(e)),n):u.get(t)},find:function(n,e,r){var i,o,a,u,c,f=0,s=t.length;for(null==r?r=1/0:r*=r,f=0;f<s;++f)(a=(i=n-(u=t[f]).x)*i+(o=e-u.y)*o)<r&&(c=u,r=a);return c},on:function(t,e){return arguments.length>1?(f.on(t,e),n):f.on(t)}}},t.forceX=function(t){var n,e,r,i=qc(.1);function o(t){for(var i,o=0,a=n.length;o<a;++o)(i=n[o]).vx+=(r[o]-i.x)*e[o]*t}function a(){if(n){var o,a=n.length;for(e=new Array(a),r=new Array(a),o=0;o<a;++o)e[o]=isNaN(r[o]=+t(n[o],o,n))?0:+i(n[o],o,n)}}return"function"!=typeof t&&(t=qc(null==t?0:+t)),o.initialize=function(t){n=t,a()},o.strength=function(t){return arguments.length?(i="function"==typeof t?t:qc(+t),a(),o):i},o.x=function(n){return arguments.length?(t="function"==typeof n?n:qc(+n),a(),o):t},o},t.forceY=function(t){var n,e,r,i=qc(.1);function o(t){for(var i,o=0,a=n.length;o<a;++o)(i=n[o]).vy+=(r[o]-i.y)*e[o]*t}function a(){if(n){var o,a=n.length;for(e=new Array(a),r=new Array(a),o=0;o<a;++o)e[o]=isNaN(r[o]=+t(n[o],o,n))?0:+i(n[o],o,n)}}return"function"!=typeof t&&(t=qc(null==t?0:+t)),o.initialize=function(t){n=t,a()},o.strength=function(t){return arguments.length?(i="function"==typeof t?t:qc(+t),a(),o):i},o.y=function(n){return arguments.length?(t="function"==typeof n?n:qc(+n),a(),o):t},o},t.formatDefaultLocale=ff,t.formatLocale=cf,t.formatSpecifier=Jc,t.fsum=function(t,n){const e=new T;if(void 0===n)for(let n of t)(n=+n)&&e.add(n);else{let r=-1;for(let i of t)(i=+n(i,++r,t))&&e.add(i)}return+e},t.geoAlbers=xd,t.geoAlbersUsa=function(){var t,n,e,r,i,o,a=xd(),u=md().rotate([154,0]).center([-2,58.5]).parallels([55,65]),c=md().rotate([157,0]).center([-3,19.9]).parallels([8,18]),f={point:function(t,n){o=[t,n]}};function s(t){var n=t[0],a=t[1];return o=null,e.point(n,a),o||(r.point(n,a),o)||(i.point(n,a),o)}function l(){return t=n=null,s}return s.invert=function(t){var n=a.scale(),e=a.translate(),r=(t[0]-e[0])/n,i=(t[1]-e[1])/n;return(i>=.12&&i<.234&&r>=-.425&&r<-.214?u:i>=.166&&i<.234&&r>=-.214&&r<-.115?c:a).invert(t)},s.stream=function(e){return t&&n===e?t:(r=[a.stream(n=e),u.stream(e),c.stream(e)],i=r.length,t={point:function(t,n){for(var e=-1;++e<i;)r[e].point(t,n)},sphere:function(){for(var t=-1;++t<i;)r[t].sphere()},lineStart:function(){for(var t=-1;++t<i;)r[t].lineStart()},lineEnd:function(){for(var t=-1;++t<i;)r[t].lineEnd()},polygonStart:function(){for(var t=-1;++t<i;)r[t].polygonStart()},polygonEnd:function(){for(var t=-1;++t<i;)r[t].polygonEnd()}});var r,i},s.precision=function(t){return arguments.length?(a.precision(t),u.precision(t),c.precision(t),l()):a.precision()},s.scale=function(t){return arguments.length?(a.scale(t),u.scale(.35*t),c.scale(t),s.translate(a.translate())):a.scale()},s.translate=function(t){if(!arguments.length)return a.translate();var n=a.scale(),o=+t[0],s=+t[1];return e=a.translate(t).clipExtent([[o-.455*n,s-.238*n],[o+.455*n,s+.238*n]]).stream(f),r=u.translate([o-.307*n,s+.201*n]).clipExtent([[o-.425*n+df,s+.12*n+df],[o-.214*n-df,s+.234*n-df]]).stream(f),i=c.translate([o-.205*n,s+.212*n]).clipExtent([[o-.214*n+df,s+.166*n+df],[o-.115*n-df,s+.234*n-df]]).stream(f),l()},s.fitExtent=function(t,n){return ud(s,t,n)},s.fitSize=function(t,n){return cd(s,t,n)},s.fitWidth=function(t,n){return fd(s,t,n)},s.fitHeight=function(t,n){return sd(s,t,n)},s.scale(1070)},t.geoArea=function(t){return us=new T,Lf(t,cs),2*us},t.geoAzimuthalEqualArea=function(){return yd(Td).scale(124.75).clipAngle(179.999)},t.geoAzimuthalEqualAreaRaw=Td,t.geoAzimuthalEquidistant=function(){return yd(Ad).scale(79.4188).clipAngle(179.999)},t.geoAzimuthalEquidistantRaw=Ad,t.geoBounds=function(t){var n,e,r,i,o,a,u;if(Qf=Kf=-(Wf=Zf=1/0),is=[],Lf(t,Fs),e=is.length){for(is.sort(Hs),n=1,o=[r=is[0]];n<e;++n)Xs(r,(i=is[n])[0])||Xs(r,i[1])?(js(r[0],i[1])>js(r[0],r[1])&&(r[1]=i[1]),js(i[0],r[1])>js(r[0],r[1])&&(r[0]=i[0])):o.push(r=i);for(a=-1/0,n=0,r=o[e=o.length-1];n<=e;r=i,++n)i=o[n],(u=js(r[1],i[0]))>a&&(a=u,Wf=i[0],Kf=r[1])}return is=os=null,Wf===1/0||Zf===1/0?[[NaN,NaN],[NaN,NaN]]:[[Wf,Zf],[Kf,Qf]]},t.geoCentroid=function(t){ms=xs=ws=Ms=Ts=As=Ss=Es=0,Ns=new T,ks=new T,Cs=new T,Lf(t,Gs);var n=+Ns,e=+ks,r=+Cs,i=Ef(n,e,r);return i<pf&&(n=As,e=Ss,r=Es,xs<df&&(n=ws,e=Ms,r=Ts),(i=Ef(n,e,r))<pf)?[NaN,NaN]:[Mf(e,n)*bf,Rf(r/i)*bf]},t.geoCircle=function(){var t,n,e=il([0,0]),r=il(90),i=il(2),o={point:function(e,r){t.push(e=n(e,r)),e[0]*=bf,e[1]*=bf}};function a(){var a=e.apply(this,arguments),u=r.apply(this,arguments)*mf,c=i.apply(this,arguments)*mf;return t=[],n=ul(-a[0]*mf,-a[1]*mf,0).invert,hl(o,u,c,1),a={type:"Polygon",coordinates:[t]},t=n=null,a}return a.center=function(t){return arguments.length?(e="function"==typeof t?t:il([+t[0],+t[1]]),a):e},a.radius=function(t){return arguments.length?(r="function"==typeof t?t:il(+t),a):r},a.precision=function(t){return arguments.length?(i="function"==typeof t?t:il(+t),a):i},a},t.geoClipAntimeridian=Tl,t.geoClipCircle=Al,t.geoClipExtent=function(){var t,n,e,r=0,i=0,o=960,a=500;return e={stream:function(e){return t&&n===e?t:t=zl(r,i,o,a)(n=e)},extent:function(u){return arguments.length?(r=+u[0][0],i=+u[0][1],o=+u[1][0],a=+u[1][1],t=n=null,e):[[r,i],[o,a]]}}},t.geoClipRectangle=zl,t.geoConicConformal=function(){return _d(kd).scale(109.5).parallels([30,30])},t.geoConicConformalRaw=kd,t.geoConicEqualArea=md,t.geoConicEqualAreaRaw=bd,t.geoConicEquidistant=function(){return _d(Pd).scale(131.154).center([0,13.9389])},t.geoConicEquidistantRaw=Pd,t.geoContains=function(t,n){return(t&&Bl.hasOwnProperty(t.type)?Bl[t.type]:Ll)(t,n)},t.geoDistance=Ol,t.geoEqualEarth=function(){return yd(qd).scale(177.158)},t.geoEqualEarthRaw=qd,t.geoEquirectangular=function(){return yd(Cd).scale(152.63)},t.geoEquirectangularRaw=Cd,t.geoGnomonic=function(){return yd(Ud).scale(144.049).clipAngle(60)},t.geoGnomonicRaw=Ud,t.geoGraticule=Kl,t.geoGraticule10=function(){return Kl()()},t.geoIdentity=function(){var t,n,e,r,i,o,a,u=1,c=0,f=0,s=1,l=1,h=0,d=null,p=1,g=1,y=id({point:function(t,n){var e=b([t,n]);this.stream.point(e[0],e[1])}}),v=eh;function _(){return p=u*s,g=u*l,o=a=null,b}function b(e){var r=e[0]*p,i=e[1]*g;if(h){var o=i*t-r*n;r=r*t+i*n,i=o}return[r+c,i+f]}return b.invert=function(e){var r=e[0]-c,i=e[1]-f;if(h){var o=i*t+r*n;r=r*t-i*n,i=o}return[r/p,i/g]},b.stream=function(t){return o&&a===t?o:o=y(v(a=t))},b.postclip=function(t){return arguments.length?(v=t,d=e=r=i=null,_()):v},b.clipExtent=function(t){return arguments.length?(v=null==t?(d=e=r=i=null,eh):zl(d=+t[0][0],e=+t[0][1],r=+t[1][0],i=+t[1][1]),_()):null==d?null:[[d,e],[r,i]]},b.scale=function(t){return arguments.length?(u=+t,_()):u},b.translate=function(t){return arguments.length?(c=+t[0],f=+t[1],_()):[c,f]},b.angle=function(e){return arguments.length?(n=Cf(h=e%360*mf),t=Tf(h),_()):h*bf},b.reflectX=function(t){return arguments.length?(s=t?-1:1,_()):s<0},b.reflectY=function(t){return arguments.length?(l=t?-1:1,_()):l<0},b.fitExtent=function(t,n){return ud(b,t,n)},b.fitSize=function(t,n){return cd(b,t,n)},b.fitWidth=function(t,n){return fd(b,t,n)},b.fitHeight=function(t,n){return sd(b,t,n)},b},t.geoInterpolate=function(t,n){var e=t[0]*mf,r=t[1]*mf,i=n[0]*mf,o=n[1]*mf,a=Tf(r),u=Cf(r),c=Tf(o),f=Cf(o),s=a*Tf(e),l=a*Cf(e),h=c*Tf(i),d=c*Cf(i),p=2*Rf(zf(Ff(o-r)+a*c*Ff(i-e))),g=Cf(p),y=p?function(t){var n=Cf(t*=p)/g,e=Cf(p-t)/g,r=e*s+n*h,i=e*l+n*d,o=e*u+n*f;return[Mf(i,r)*bf,Mf(o,zf(r*r+i*i))*bf]}:function(){return[e*bf,r*bf]};return y.distance=p,y},t.geoLength=ql,t.geoMercator=function(){return Ed(Sd).scale(961/_f)},t.geoMercatorRaw=Sd,t.geoNaturalEarth1=function(){return yd(Id).scale(175.295)},t.geoNaturalEarth1Raw=Id,t.geoOrthographic=function(){return yd(Od).scale(249.5).clipAngle(90+df)},t.geoOrthographicRaw=Od,t.geoPath=function(t,n){let e,r,i=3,o=4.5;function a(t){return t&&("function"==typeof o&&r.pointRadius(+o.apply(this,arguments)),Lf(t,e(r))),r.result()}return a.area=function(t){return Lf(t,e(sh)),sh.result()},a.measure=function(t){return Lf(t,e(Kh)),Kh.result()},a.bounds=function(t){return Lf(t,e(mh)),mh.result()},a.centroid=function(t){return Lf(t,e(Oh)),Oh.result()},a.projection=function(n){return arguments.length?(e=null==n?(t=null,eh):(t=n).stream,a):t},a.context=function(t){return arguments.length?(r=null==t?(n=null,new ed(i)):new Bh(n=t),"function"!=typeof o&&r.pointRadius(o),a):n},a.pointRadius=function(t){return arguments.length?(o="function"==typeof t?t:(r.pointRadius(+t),+t),a):o},a.digits=function(t){if(!arguments.length)return i;if(null==t)i=null;else{const n=Math.floor(t);if(!(n>=0))throw new RangeError(`invalid digits: ${t}`);i=n}return null===n&&(r=new ed(i)),a},a.projection(t).digits(i).context(n)},t.geoProjection=yd,t.geoProjectionMutator=vd,t.geoRotation=ll,t.geoStereographic=function(){return yd(Bd).scale(250).clipAngle(142)},t.geoStereographicRaw=Bd,t.geoStream=Lf,t.geoTransform=function(t){return{stream:id(t)}},t.geoTransverseMercator=function(){var t=Ed(Yd),n=t.center,e=t.rotate;return t.center=function(t){return arguments.length?n([-t[1],t[0]]):[(t=n())[1],-t[0]]},t.rotate=function(t){return arguments.length?e([t[0],t[1],t.length>2?t[2]+90:90]):[(t=e())[0],t[1],t[2]-90]},e([0,0,90]).scale(159.155)},t.geoTransverseMercatorRaw=Yd,t.gray=function(t,n){return new ur(t,0,0,null==n?1:n)},t.greatest=ot,t.greatestIndex=function(t,e=n){if(1===e.length)return tt(t,e);let r,i=-1,o=-1;for(const n of t)++o,(i<0?0===e(n,n):e(n,r)>0)&&(r=n,i=o);return i},t.group=C,t.groupSort=function(t,e,r){return(2!==e.length?U($(t,e,r),(([t,e],[r,i])=>n(e,i)||n(t,r))):U(C(t,r),(([t,r],[i,o])=>e(r,o)||n(t,i)))).map((([t])=>t))},t.groups=P,t.hcl=dr,t.hierarchy=Gd,t.histogram=Q,t.hsl=He,t.html=Ec,t.image=function(t,n){return new Promise((function(e,r){var i=new Image;for(var o in n)i[o]=n[o];i.onerror=r,i.onload=function(){e(i)},i.src=t}))},t.index=function(t,...n){return F(t,k,R,n)},t.indexes=function(t,...n){return F(t,Array.from,R,n)},t.interpolate=Gr,t.interpolateArray=function(t,n){return(Ir(n)?Ur:Or)(t,n)},t.interpolateBasis=Er,t.interpolateBasisClosed=Nr,t.interpolateBlues=Gb,t.interpolateBrBG=ob,t.interpolateBuGn=Mb,t.interpolateBuPu=Ab,t.interpolateCividis=function(t){return t=Math.max(0,Math.min(1,t)),"rgb("+Math.max(0,Math.min(255,Math.round(-4.54-t*(35.34-t*(2381.73-t*(6402.7-t*(7024.72-2710.57*t)))))))+", "+Math.max(0,Math.min(255,Math.round(32.49+t*(170.73+t*(52.82-t*(131.46-t*(176.58-67.37*t)))))))+", "+Math.max(0,Math.min(255,Math.round(81.24+t*(442.36-t*(2482.43-t*(6167.24-t*(6614.94-2475.67*t)))))))+")"},t.interpolateCool=am,t.interpolateCubehelix=li,t.interpolateCubehelixDefault=im,t.interpolateCubehelixLong=hi,t.interpolateDate=Br,t.interpolateDiscrete=function(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}},t.interpolateGnBu=Eb,t.interpolateGreens=Wb,t.interpolateGreys=Kb,t.interpolateHcl=ci,t.interpolateHclLong=fi,t.interpolateHsl=oi,t.interpolateHslLong=ai,t.interpolateHue=function(t,n){var e=Pr(+t,+n);return function(t){var n=e(t);return n-360*Math.floor(n/360)}},t.interpolateInferno=pm,t.interpolateLab=function(t,n){var e=$r((t=ar(t)).l,(n=ar(n)).l),r=$r(t.a,n.a),i=$r(t.b,n.b),o=$r(t.opacity,n.opacity);return function(n){return t.l=e(n),t.a=r(n),t.b=i(n),t.opacity=o(n),t+""}},t.interpolateMagma=dm,t.interpolateNumber=Yr,t.interpolateNumberArray=Ur,t.interpolateObject=Lr,t.interpolateOrRd=kb,t.interpolateOranges=rm,t.interpolatePRGn=ub,t.interpolatePiYG=fb,t.interpolatePlasma=gm,t.interpolatePuBu=$b,t.interpolatePuBuGn=Pb,t.interpolatePuOr=lb,t.interpolatePuRd=Rb,t.interpolatePurples=Jb,t.interpolateRainbow=function(t){(t<0||t>1)&&(t-=Math.floor(t));var n=Math.abs(t-.5);return um.h=360*t-100,um.s=1.5-1.5*n,um.l=.8-.9*n,um+""},t.interpolateRdBu=db,t.interpolateRdGy=gb,t.interpolateRdPu=qb,t.interpolateRdYlBu=vb,t.interpolateRdYlGn=bb,t.interpolateReds=nm,t.interpolateRgb=Dr,t.interpolateRgbBasis=Fr,t.interpolateRgbBasisClosed=qr,t.interpolateRound=Vr,t.interpolateSinebow=function(t){var n;return t=(.5-t)*Math.PI,cm.r=255*(n=Math.sin(t))*n,cm.g=255*(n=Math.sin(t+fm))*n,cm.b=255*(n=Math.sin(t+sm))*n,cm+""},t.interpolateSpectral=xb,t.interpolateString=Xr,t.interpolateTransformCss=ti,t.interpolateTransformSvg=ni,t.interpolateTurbo=function(t){return t=Math.max(0,Math.min(1,t)),"rgb("+Math.max(0,Math.min(255,Math.round(34.61+t*(1172.33-t*(10793.56-t*(33300.12-t*(38394.49-14825.05*t)))))))+", "+Math.max(0,Math.min(255,Math.round(23.31+t*(557.33+t*(1225.33-t*(3574.96-t*(1073.77+707.56*t)))))))+", "+Math.max(0,Math.min(255,Math.round(27.2+t*(3211.1-t*(15327.97-t*(27814-t*(22569.18-6838.66*t)))))))+")"},t.interpolateViridis=hm,t.interpolateWarm=om,t.interpolateYlGn=Bb,t.interpolateYlGnBu=Ib,t.interpolateYlOrBr=Lb,t.interpolateYlOrRd=Hb,t.interpolateZoom=ri,t.interrupt=Gi,t.intersection=function(t,...n){t=new InternSet(t),n=n.map(vt);t:for(const e of t)for(const r of n)if(!r.has(e)){t.delete(e);continue t}return t},t.interval=function(t,n,e){var r=new Ei,i=n;return null==n?(r.restart(t,n,e),r):(r._restart=r.restart,r.restart=function(t,n,e){n=+n,e=null==e?Ai():+e,r._restart((function o(a){a+=i,r._restart(o,i+=n,e),t(a)}),n,e)},r.restart(t,n,e),r)},t.isoFormat=D_,t.isoParse=F_,t.json=function(t,n){return fetch(t,n).then(Tc)},t.lab=ar,t.lch=function(t,n,e,r){return 1===arguments.length?hr(t):new pr(e,n,t,null==r?1:r)},t.least=function(t,e=n){let r,i=!1;if(1===e.length){let o;for(const a of t){const t=e(a);(i?n(t,o)<0:0===n(t,t))&&(r=a,o=t,i=!0)}}else for(const n of t)(i?e(n,r)<0:0===e(n,n))&&(r=n,i=!0);return r},t.leastIndex=ht,t.line=Ym,t.lineRadial=Zm,t.link=ax,t.linkHorizontal=function(){return ax(nx)},t.linkRadial=function(){const t=ax(rx);return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t},t.linkVertical=function(){return ax(ex)},t.local=Qn,t.map=function(t,n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");if("function"!=typeof n)throw new TypeError("mapper is not a function");return Array.from(t,((e,r)=>n(e,r,t)))},t.matcher=Vt,t.max=J,t.maxIndex=tt,t.mean=function(t,n){let e=0,r=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(++e,r+=n);else{let i=-1;for(let o of t)null!=(o=n(o,++i,t))&&(o=+o)>=o&&(++e,r+=o)}if(e)return r/e},t.median=function(t,n){return at(t,.5,n)},t.medianIndex=function(t,n){return ct(t,.5,n)},t.merge=ft,t.min=nt,t.minIndex=et,t.mode=function(t,n){const e=new InternMap;if(void 0===n)for(let n of t)null!=n&&n>=n&&e.set(n,(e.get(n)||0)+1);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&i>=i&&e.set(i,(e.get(i)||0)+1)}let r,i=0;for(const[t,n]of e)n>i&&(i=n,r=t);return r},t.namespace=It,t.namespaces=Ut,t.nice=Z,t.now=Ai,t.pack=function(){var t=null,n=1,e=1,r=np;function i(i){const o=ap();return i.x=n/2,i.y=e/2,t?i.eachBefore(xp(t)).eachAfter(wp(r,.5,o)).eachBefore(Mp(1)):i.eachBefore(xp(mp)).eachAfter(wp(np,1,o)).eachAfter(wp(r,i.r/Math.min(n,e),o)).eachBefore(Mp(Math.min(n,e)/(2*i.r))),i}return i.radius=function(n){return arguments.length?(t=Jd(n),i):t},i.size=function(t){return arguments.length?(n=+t[0],e=+t[1],i):[n,e]},i.padding=function(t){return arguments.length?(r="function"==typeof t?t:ep(+t),i):r},i},t.packEnclose=function(t){return up(t,ap())},t.packSiblings=function(t){return bp(t,ap()),t},t.pairs=function(t,n=st){const e=[];let r,i=!1;for(const o of t)i&&e.push(n(r,o)),r=o,i=!0;return e},t.partition=function(){var t=1,n=1,e=0,r=!1;function i(i){var o=i.height+1;return i.x0=i.y0=e,i.x1=t,i.y1=n/o,i.eachBefore(function(t,n){return function(r){r.children&&Ap(r,r.x0,t*(r.depth+1)/n,r.x1,t*(r.depth+2)/n);var i=r.x0,o=r.y0,a=r.x1-e,u=r.y1-e;a<i&&(i=a=(i+a)/2),u<o&&(o=u=(o+u)/2),r.x0=i,r.y0=o,r.x1=a,r.y1=u}}(n,o)),r&&i.eachBefore(Tp),i}return i.round=function(t){return arguments.length?(r=!!t,i):r},i.size=function(e){return arguments.length?(t=+e[0],n=+e[1],i):[t,n]},i.padding=function(t){return arguments.length?(e=+t,i):e},i},t.path=Ia,t.pathRound=function(t=3){return new Ua(+t)},t.permute=q,t.pie=function(){var t=Hm,n=jm,e=null,r=ym(0),i=ym(Em),o=ym(0);function a(a){var u,c,f,s,l,h=(a=qm(a)).length,d=0,p=new Array(h),g=new Array(h),y=+r.apply(this,arguments),v=Math.min(Em,Math.max(-Em,i.apply(this,arguments)-y)),_=Math.min(Math.abs(v)/h,o.apply(this,arguments)),b=_*(v<0?-1:1);for(u=0;u<h;++u)(l=g[p[u]=u]=+t(a[u],u,a))>0&&(d+=l);for(null!=n?p.sort((function(t,e){return n(g[t],g[e])})):null!=e&&p.sort((function(t,n){return e(a[t],a[n])})),u=0,f=d?(v-h*b)/d:0;u<h;++u,y=s)c=p[u],s=y+((l=g[c])>0?l*f:0)+b,g[c]={data:a[c],index:u,value:l,startAngle:y,endAngle:s,padAngle:_};return g}return a.value=function(n){return arguments.length?(t="function"==typeof n?n:ym(+n),a):t},a.sortValues=function(t){return arguments.length?(n=t,e=null,a):n},a.sort=function(t){return arguments.length?(e=t,n=null,a):e},a.startAngle=function(t){return arguments.length?(r="function"==typeof t?t:ym(+t),a):r},a.endAngle=function(t){return arguments.length?(i="function"==typeof t?t:ym(+t),a):i},a.padAngle=function(t){return arguments.length?(o="function"==typeof t?t:ym(+t),a):o},a},t.piecewise=di,t.pointRadial=Qm,t.pointer=ne,t.pointers=function(t,n){return t.target&&(t=te(t),void 0===n&&(n=t.currentTarget),t=t.touches||[t]),Array.from(t,(t=>ne(t,n)))},t.polygonArea=function(t){for(var n,e=-1,r=t.length,i=t[r-1],o=0;++e<r;)n=i,i=t[e],o+=n[1]*i[0]-n[0]*i[1];return o/2},t.polygonCentroid=function(t){for(var n,e,r=-1,i=t.length,o=0,a=0,u=t[i-1],c=0;++r<i;)n=u,u=t[r],c+=e=n[0]*u[1]-u[0]*n[1],o+=(n[0]+u[0])*e,a+=(n[1]+u[1])*e;return[o/(c*=3),a/c]},t.polygonContains=function(t,n){for(var e,r,i=t.length,o=t[i-1],a=n[0],u=n[1],c=o[0],f=o[1],s=!1,l=0;l<i;++l)e=(o=t[l])[0],(r=o[1])>u!=f>u&&a<(c-e)*(u-r)/(f-r)+e&&(s=!s),c=e,f=r;return s},t.polygonHull=function(t){if((e=t.length)<3)return null;var n,e,r=new Array(e),i=new Array(e);for(n=0;n<e;++n)r[n]=[+t[n][0],+t[n][1],n];for(r.sort(Hp),n=0;n<e;++n)i[n]=[r[n][0],-r[n][1]];var o=Xp(r),a=Xp(i),u=a[0]===o[0],c=a[a.length-1]===o[o.length-1],f=[];for(n=o.length-1;n>=0;--n)f.push(t[r[o[n]][2]]);for(n=+u;n<a.length-c;++n)f.push(t[r[a[n]][2]]);return f},t.polygonLength=function(t){for(var n,e,r=-1,i=t.length,o=t[i-1],a=o[0],u=o[1],c=0;++r<i;)n=a,e=u,n-=a=(o=t[r])[0],e-=u=o[1],c+=Math.hypot(n,e);return c},t.precisionFixed=sf,t.precisionPrefix=lf,t.precisionRound=hf,t.quadtree=$c,t.quantile=at,t.quantileIndex=ct,t.quantileSorted=ut,t.quantize=function(t,n){for(var e=new Array(n),r=0;r<n;++r)e[r]=t(r/(n-1));return e},t.quickselect=rt,t.radialArea=Km,t.radialLine=Zm,t.randomBates=Jp,t.randomBernoulli=eg,t.randomBeta=og,t.randomBinomial=ag,t.randomCauchy=cg,t.randomExponential=tg,t.randomGamma=ig,t.randomGeometric=rg,t.randomInt=Wp,t.randomIrwinHall=Qp,t.randomLcg=function(t=Math.random()){let n=0|(0<=t&&t<1?t/lg:Math.abs(t));return()=>(n=1664525*n+1013904223|0,lg*(n>>>0))},t.randomLogNormal=Kp,t.randomLogistic=fg,t.randomNormal=Zp,t.randomPareto=ng,t.randomPoisson=sg,t.randomUniform=Vp,t.randomWeibull=ug,t.range=lt,t.rank=function(t,e=n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");let r=Array.from(t);const i=new Float64Array(r.length);2!==e.length&&(r=r.map(e),e=n);const o=(t,n)=>e(r[t],r[n]);let a,u;return(t=Uint32Array.from(r,((t,n)=>n))).sort(e===n?(t,n)=>O(r[t],r[n]):I(o)),t.forEach(((t,n)=>{const e=o(t,void 0===a?t:a);e>=0?((void 0===a||e>0)&&(a=t,u=n),i[t]=u):i[t]=NaN})),i},t.reduce=function(t,n,e){if("function"!=typeof n)throw new TypeError("reducer is not a function");const r=t[Symbol.iterator]();let i,o,a=-1;if(arguments.length<3){if(({done:i,value:e}=r.next()),i)return;++a}for(;({done:i,value:o}=r.next()),!i;)e=n(e,o,++a,t);return e},t.reverse=function(t){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");return Array.from(t).reverse()},t.rgb=Fe,t.ribbon=function(){return Wa()},t.ribbonArrow=function(){return Wa(Va)},t.rollup=$,t.rollups=D,t.scaleBand=yg,t.scaleDiverging=function t(){var n=Ng(L_()(mg));return n.copy=function(){return B_(n,t())},dg.apply(n,arguments)},t.scaleDivergingLog=function t(){var n=Fg(L_()).domain([.1,1,10]);return n.copy=function(){return B_(n,t()).base(n.base())},dg.apply(n,arguments)},t.scaleDivergingPow=j_,t.scaleDivergingSqrt=function(){return j_.apply(null,arguments).exponent(.5)},t.scaleDivergingSymlog=function t(){var n=Ig(L_());return n.copy=function(){return B_(n,t()).constant(n.constant())},dg.apply(n,arguments)},t.scaleIdentity=function t(n){var e;function r(t){return null==t||isNaN(t=+t)?e:t}return r.invert=r,r.domain=r.range=function(t){return arguments.length?(n=Array.from(t,_g),r):n.slice()},r.unknown=function(t){return arguments.length?(e=t,r):e},r.copy=function(){return t(n).unknown(e)},n=arguments.length?Array.from(n,_g):[0,1],Ng(r)},t.scaleImplicit=pg,t.scaleLinear=function t(){var n=Sg();return n.copy=function(){return Tg(n,t())},hg.apply(n,arguments),Ng(n)},t.scaleLog=function t(){const n=Fg(Ag()).domain([1,10]);return n.copy=()=>Tg(n,t()).base(n.base()),hg.apply(n,arguments),n},t.scaleOrdinal=gg,t.scalePoint=function(){return vg(yg.apply(null,arguments).paddingInner(1))},t.scalePow=jg,t.scaleQuantile=function t(){var e,r=[],i=[],o=[];function a(){var t=0,n=Math.max(1,i.length);for(o=new Array(n-1);++t<n;)o[t-1]=ut(r,t/n);return u}function u(t){return null==t||isNaN(t=+t)?e:i[s(o,t)]}return u.invertExtent=function(t){var n=i.indexOf(t);return n<0?[NaN,NaN]:[n>0?o[n-1]:r[0],n<o.length?o[n]:r[r.length-1]]},u.domain=function(t){if(!arguments.length)return r.slice();r=[];for(let n of t)null==n||isNaN(n=+n)||r.push(n);return r.sort(n),a()},u.range=function(t){return arguments.length?(i=Array.from(t),a()):i.slice()},u.unknown=function(t){return arguments.length?(e=t,u):e},u.quantiles=function(){return o.slice()},u.copy=function(){return t().domain(r).range(i).unknown(e)},hg.apply(u,arguments)},t.scaleQuantize=function t(){var n,e=0,r=1,i=1,o=[.5],a=[0,1];function u(t){return null!=t&&t<=t?a[s(o,t,0,i)]:n}function c(){var t=-1;for(o=new Array(i);++t<i;)o[t]=((t+1)*r-(t-i)*e)/(i+1);return u}return u.domain=function(t){return arguments.length?([e,r]=t,e=+e,r=+r,c()):[e,r]},u.range=function(t){return arguments.length?(i=(a=Array.from(t)).length-1,c()):a.slice()},u.invertExtent=function(t){var n=a.indexOf(t);return n<0?[NaN,NaN]:n<1?[e,o[0]]:n>=i?[o[i-1],r]:[o[n-1],o[n]]},u.unknown=function(t){return arguments.length?(n=t,u):u},u.thresholds=function(){return o.slice()},u.copy=function(){return t().domain([e,r]).range(a).unknown(n)},hg.apply(Ng(u),arguments)},t.scaleRadial=function t(){var n,e=Sg(),r=[0,1],i=!1;function o(t){var r=function(t){return Math.sign(t)*Math.sqrt(Math.abs(t))}(e(t));return isNaN(r)?n:i?Math.round(r):r}return o.invert=function(t){return e.invert(Hg(t))},o.domain=function(t){return arguments.length?(e.domain(t),o):e.domain()},o.range=function(t){return arguments.length?(e.range((r=Array.from(t,_g)).map(Hg)),o):r.slice()},o.rangeRound=function(t){return o.range(t).round(!0)},o.round=function(t){return arguments.length?(i=!!t,o):i},o.clamp=function(t){return arguments.length?(e.clamp(t),o):e.clamp()},o.unknown=function(t){return arguments.length?(n=t,o):n},o.copy=function(){return t(e.domain(),r).round(i).clamp(e.clamp()).unknown(n)},hg.apply(o,arguments),Ng(o)},t.scaleSequential=function t(){var n=Ng(O_()(mg));return n.copy=function(){return B_(n,t())},dg.apply(n,arguments)},t.scaleSequentialLog=function t(){var n=Fg(O_()).domain([1,10]);return n.copy=function(){return B_(n,t()).base(n.base())},dg.apply(n,arguments)},t.scaleSequentialPow=Y_,t.scaleSequentialQuantile=function t(){var e=[],r=mg;function i(t){if(null!=t&&!isNaN(t=+t))return r((s(e,t,1)-1)/(e.length-1))}return i.domain=function(t){if(!arguments.length)return e.slice();e=[];for(let n of t)null==n||isNaN(n=+n)||e.push(n);return e.sort(n),i},i.interpolator=function(t){return arguments.length?(r=t,i):r},i.range=function(){return e.map(((t,n)=>r(n/(e.length-1))))},i.quantiles=function(t){return Array.from({length:t+1},((n,r)=>at(e,r/t)))},i.copy=function(){return t(r).domain(e)},dg.apply(i,arguments)},t.scaleSequentialSqrt=function(){return Y_.apply(null,arguments).exponent(.5)},t.scaleSequentialSymlog=function t(){var n=Ig(O_());return n.copy=function(){return B_(n,t()).constant(n.constant())},dg.apply(n,arguments)},t.scaleSqrt=function(){return jg.apply(null,arguments).exponent(.5)},t.scaleSymlog=function t(){var n=Ig(Ag());return n.copy=function(){return Tg(n,t()).constant(n.constant())},hg.apply(n,arguments)},t.scaleThreshold=function t(){var n,e=[.5],r=[0,1],i=1;function o(t){return null!=t&&t<=t?r[s(e,t,0,i)]:n}return o.domain=function(t){return arguments.length?(e=Array.from(t),i=Math.min(e.length,r.length-1),o):e.slice()},o.range=function(t){return arguments.length?(r=Array.from(t),i=Math.min(e.length,r.length-1),o):r.slice()},o.invertExtent=function(t){var n=r.indexOf(t);return[e[n-1],e[n]]},o.unknown=function(t){return arguments.length?(n=t,o):n},o.copy=function(){return t().domain(e).range(r).unknown(n)},hg.apply(o,arguments)},t.scaleTime=function(){return hg.apply(I_(uv,cv,tv,Zy,xy,py,sy,ay,iy,t.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)},t.scaleUtc=function(){return hg.apply(I_(ov,av,ev,Qy,Fy,yy,hy,cy,iy,t.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)]),arguments)},t.scan=function(t,n){const e=ht(t,n);return e<0?void 0:e},t.schemeAccent=G_,t.schemeBlues=Xb,t.schemeBrBG=ib,t.schemeBuGn=wb,t.schemeBuPu=Tb,t.schemeCategory10=X_,t.schemeDark2=V_,t.schemeGnBu=Sb,t.schemeGreens=Vb,t.schemeGreys=Zb,t.schemeObservable10=W_,t.schemeOrRd=Nb,t.schemeOranges=em,t.schemePRGn=ab,t.schemePaired=Z_,t.schemePastel1=K_,t.schemePastel2=Q_,t.schemePiYG=cb,t.schemePuBu=zb,t.schemePuBuGn=Cb,t.schemePuOr=sb,t.schemePuRd=Db,t.schemePurples=Qb,t.schemeRdBu=hb,t.schemeRdGy=pb,t.schemeRdPu=Fb,t.schemeRdYlBu=yb,t.schemeRdYlGn=_b,t.schemeReds=tm,t.schemeSet1=J_,t.schemeSet2=tb,t.schemeSet3=nb,t.schemeSpectral=mb,t.schemeTableau10=eb,t.schemeYlGn=Ob,t.schemeYlGnBu=Ub,t.schemeYlOrBr=Yb,t.schemeYlOrRd=jb,t.select=Zn,t.selectAll=function(t){return"string"==typeof t?new Vn([document.querySelectorAll(t)],[document.documentElement]):new Vn([Ht(t)],Gn)},t.selection=Wn,t.selector=jt,t.selectorAll=Gt,t.shuffle=dt,t.shuffler=pt,t.some=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");let e=-1;for(const r of t)if(n(r,++e,t))return!0;return!1},t.sort=U,t.stack=function(){var t=ym([]),n=dw,e=hw,r=pw;function i(i){var o,a,u=Array.from(t.apply(this,arguments),gw),c=u.length,f=-1;for(const t of i)for(o=0,++f;o<c;++o)(u[o][f]=[0,+r(t,u[o].key,f,i)]).data=t;for(o=0,a=qm(n(u));o<c;++o)u[a[o]].index=o;return e(u,a),u}return i.keys=function(n){return arguments.length?(t="function"==typeof n?n:ym(Array.from(n)),i):t},i.value=function(t){return arguments.length?(r="function"==typeof t?t:ym(+t),i):r},i.order=function(t){return arguments.length?(n=null==t?dw:"function"==typeof t?t:ym(Array.from(t)),i):n},i.offset=function(t){return arguments.length?(e=null==t?hw:t,i):e},i},t.stackOffsetDiverging=function(t,n){if((u=t.length)>0)for(var e,r,i,o,a,u,c=0,f=t[n[0]].length;c<f;++c)for(o=a=0,e=0;e<u;++e)(i=(r=t[n[e]][c])[1]-r[0])>0?(r[0]=o,r[1]=o+=i):i<0?(r[1]=a,r[0]=a+=i):(r[0]=0,r[1]=i)},t.stackOffsetExpand=function(t,n){if((r=t.length)>0){for(var e,r,i,o=0,a=t[0].length;o<a;++o){for(i=e=0;e<r;++e)i+=t[e][o][1]||0;if(i)for(e=0;e<r;++e)t[e][o][1]/=i}hw(t,n)}},t.stackOffsetNone=hw,t.stackOffsetSilhouette=function(t,n){if((e=t.length)>0){for(var e,r=0,i=t[n[0]],o=i.length;r<o;++r){for(var a=0,u=0;a<e;++a)u+=t[a][r][1]||0;i[r][1]+=i[r][0]=-u/2}hw(t,n)}},t.stackOffsetWiggle=function(t,n){if((i=t.length)>0&&(r=(e=t[n[0]]).length)>0){for(var e,r,i,o=0,a=1;a<r;++a){for(var u=0,c=0,f=0;u<i;++u){for(var s=t[n[u]],l=s[a][1]||0,h=(l-(s[a-1][1]||0))/2,d=0;d<u;++d){var p=t[n[d]];h+=(p[a][1]||0)-(p[a-1][1]||0)}c+=l,f+=h*l}e[a-1][1]+=e[a-1][0]=o,c&&(o-=f/c)}e[a-1][1]+=e[a-1][0]=o,hw(t,n)}},t.stackOrderAppearance=yw,t.stackOrderAscending=_w,t.stackOrderDescending=function(t){return _w(t).reverse()},t.stackOrderInsideOut=function(t){var n,e,r=t.length,i=t.map(bw),o=yw(t),a=0,u=0,c=[],f=[];for(n=0;n<r;++n)e=o[n],a<u?(a+=i[e],c.push(e)):(u+=i[e],f.push(e));return f.reverse().concat(c)},t.stackOrderNone=dw,t.stackOrderReverse=function(t){return dw(t).reverse()},t.stratify=function(){var t,n=kp,e=Cp;function r(r){var i,o,a,u,c,f,s,l,h=Array.from(r),d=n,p=e,g=new Map;if(null!=t){const n=h.map(((n,e)=>function(t){t=`${t}`;let n=t.length;zp(t,n-1)&&!zp(t,n-2)&&(t=t.slice(0,-1));return"/"===t[0]?t:`/${t}`}(t(n,e,r)))),e=n.map(Pp),i=new Set(n).add("");for(const t of e)i.has(t)||(i.add(t),n.push(t),e.push(Pp(t)),h.push(Np));d=(t,e)=>n[e],p=(t,n)=>e[n]}for(a=0,i=h.length;a<i;++a)o=h[a],f=h[a]=new Qd(o),null!=(s=d(o,a,r))&&(s+="")&&(l=f.id=s,g.set(l,g.has(l)?Ep:f)),null!=(s=p(o,a,r))&&(s+="")&&(f.parent=s);for(a=0;a<i;++a)if(s=(f=h[a]).parent){if(!(c=g.get(s)))throw new Error("missing: "+s);if(c===Ep)throw new Error("ambiguous: "+s);c.children?c.children.push(f):c.children=[f],f.parent=c}else{if(u)throw new Error("multiple roots");u=f}if(!u)throw new Error("no root");if(null!=t){for(;u.data===Np&&1===u.children.length;)u=u.children[0],--i;for(let t=h.length-1;t>=0&&(f=h[t]).data===Np;--t)f.data=null}if(u.parent=Sp,u.eachBefore((function(t){t.depth=t.parent.depth+1,--i})).eachBefore(Kd),u.parent=null,i>0)throw new Error("cycle");return u}return r.id=function(t){return arguments.length?(n=Jd(t),r):n},r.parentId=function(t){return arguments.length?(e=Jd(t),r):e},r.path=function(n){return arguments.length?(t=Jd(n),r):t},r},t.style=_n,t.subset=function(t,n){return _t(n,t)},t.sum=function(t,n){let e=0;if(void 0===n)for(let n of t)(n=+n)&&(e+=n);else{let r=-1;for(let i of t)(i=+n(i,++r,t))&&(e+=i)}return e},t.superset=_t,t.svg=Nc,t.symbol=function(t,n){let e=null,r=km(i);function i(){let i;if(e||(e=i=r()),t.apply(this,arguments).draw(e,+n.apply(this,arguments)),i)return e=null,i+""||null}return t="function"==typeof t?t:ym(t||fx),n="function"==typeof n?n:ym(void 0===n?64:+n),i.type=function(n){return arguments.length?(t="function"==typeof n?n:ym(n),i):t},i.size=function(t){return arguments.length?(n="function"==typeof t?t:ym(+t),i):n},i.context=function(t){return arguments.length?(e=null==t?null:t,i):e},i},t.symbolAsterisk=cx,t.symbolCircle=fx,t.symbolCross=sx,t.symbolDiamond=dx,t.symbolDiamond2=px,t.symbolPlus=gx,t.symbolSquare=yx,t.symbolSquare2=vx,t.symbolStar=xx,t.symbolTimes=Px,t.symbolTriangle=Mx,t.symbolTriangle2=Ax,t.symbolWye=Cx,t.symbolX=Px,t.symbols=zx,t.symbolsFill=zx,t.symbolsStroke=$x,t.text=mc,t.thresholdFreedmanDiaconis=function(t,n,e){const r=v(t),i=at(t,.75)-at(t,.25);return r&&i?Math.ceil((e-n)/(2*i*Math.pow(r,-1/3))):1},t.thresholdScott=function(t,n,e){const r=v(t),i=w(t);return r&&i?Math.ceil((e-n)*Math.cbrt(r)/(3.49*i)):1},t.thresholdSturges=K,t.tickFormat=Eg,t.tickIncrement=V,t.tickStep=W,t.ticks=G,t.timeDay=py,t.timeDays=gy,t.timeFormatDefaultLocale=P_,t.timeFormatLocale=hv,t.timeFriday=Sy,t.timeFridays=$y,t.timeHour=sy,t.timeHours=ly,t.timeInterval=Vg,t.timeMillisecond=Wg,t.timeMilliseconds=Zg,t.timeMinute=ay,t.timeMinutes=uy,t.timeMonday=wy,t.timeMondays=ky,t.timeMonth=Zy,t.timeMonths=Ky,t.timeSaturday=Ey,t.timeSaturdays=Dy,t.timeSecond=iy,t.timeSeconds=oy,t.timeSunday=xy,t.timeSundays=Ny,t.timeThursday=Ay,t.timeThursdays=zy,t.timeTickInterval=cv,t.timeTicks=uv,t.timeTuesday=My,t.timeTuesdays=Cy,t.timeWednesday=Ty,t.timeWednesdays=Py,t.timeWeek=xy,t.timeWeeks=Ny,t.timeYear=tv,t.timeYears=nv,t.timeout=$i,t.timer=Ni,t.timerFlush=ki,t.transition=go,t.transpose=gt,t.tree=function(){var t=$p,n=1,e=1,r=null;function i(i){var c=function(t){for(var n,e,r,i,o,a=new Up(t,0),u=[a];n=u.pop();)if(r=n._.children)for(n.children=new Array(o=r.length),i=o-1;i>=0;--i)u.push(e=n.children[i]=new Up(r[i],i)),e.parent=n;return(a.parent=new Up(null,0)).children=[a],a}(i);if(c.eachAfter(o),c.parent.m=-c.z,c.eachBefore(a),r)i.eachBefore(u);else{var f=i,s=i,l=i;i.eachBefore((function(t){t.x<f.x&&(f=t),t.x>s.x&&(s=t),t.depth>l.depth&&(l=t)}));var h=f===s?1:t(f,s)/2,d=h-f.x,p=n/(s.x+h+d),g=e/(l.depth||1);i.eachBefore((function(t){t.x=(t.x+d)*p,t.y=t.depth*g}))}return i}function o(n){var e=n.children,r=n.parent.children,i=n.i?r[n.i-1]:null;if(e){!function(t){for(var n,e=0,r=0,i=t.children,o=i.length;--o>=0;)(n=i[o]).z+=e,n.m+=e,e+=n.s+(r+=n.c)}(n);var o=(e[0].z+e[e.length-1].z)/2;i?(n.z=i.z+t(n._,i._),n.m=n.z-o):n.z=o}else i&&(n.z=i.z+t(n._,i._));n.parent.A=function(n,e,r){if(e){for(var i,o=n,a=n,u=e,c=o.parent.children[0],f=o.m,s=a.m,l=u.m,h=c.m;u=Rp(u),o=Dp(o),u&&o;)c=Dp(c),(a=Rp(a)).a=n,(i=u.z+l-o.z-f+t(u._,o._))>0&&(Fp(qp(u,n,r),n,i),f+=i,s+=i),l+=u.m,f+=o.m,h+=c.m,s+=a.m;u&&!Rp(a)&&(a.t=u,a.m+=l-s),o&&!Dp(c)&&(c.t=o,c.m+=f-h,r=n)}return r}(n,i,n.parent.A||r[0])}function a(t){t._.x=t.z+t.parent.m,t.m+=t.parent.m}function u(t){t.x*=n,t.y=t.depth*e}return i.separation=function(n){return arguments.length?(t=n,i):t},i.size=function(t){return arguments.length?(r=!1,n=+t[0],e=+t[1],i):r?null:[n,e]},i.nodeSize=function(t){return arguments.length?(r=!0,n=+t[0],e=+t[1],i):r?[n,e]:null},i},t.treemap=function(){var t=Yp,n=!1,e=1,r=1,i=[0],o=np,a=np,u=np,c=np,f=np;function s(t){return t.x0=t.y0=0,t.x1=e,t.y1=r,t.eachBefore(l),i=[0],n&&t.eachBefore(Tp),t}function l(n){var e=i[n.depth],r=n.x0+e,s=n.y0+e,l=n.x1-e,h=n.y1-e;l<r&&(r=l=(r+l)/2),h<s&&(s=h=(s+h)/2),n.x0=r,n.y0=s,n.x1=l,n.y1=h,n.children&&(e=i[n.depth+1]=o(n)/2,r+=f(n)-e,s+=a(n)-e,(l-=u(n)-e)<r&&(r=l=(r+l)/2),(h-=c(n)-e)<s&&(s=h=(s+h)/2),t(n,r,s,l,h))}return s.round=function(t){return arguments.length?(n=!!t,s):n},s.size=function(t){return arguments.length?(e=+t[0],r=+t[1],s):[e,r]},s.tile=function(n){return arguments.length?(t=tp(n),s):t},s.padding=function(t){return arguments.length?s.paddingInner(t).paddingOuter(t):s.paddingInner()},s.paddingInner=function(t){return arguments.length?(o="function"==typeof t?t:ep(+t),s):o},s.paddingOuter=function(t){return arguments.length?s.paddingTop(t).paddingRight(t).paddingBottom(t).paddingLeft(t):s.paddingTop()},s.paddingTop=function(t){return arguments.length?(a="function"==typeof t?t:ep(+t),s):a},s.paddingRight=function(t){return arguments.length?(u="function"==typeof t?t:ep(+t),s):u},s.paddingBottom=function(t){return arguments.length?(c="function"==typeof t?t:ep(+t),s):c},s.paddingLeft=function(t){return arguments.length?(f="function"==typeof t?t:ep(+t),s):f},s},t.treemapBinary=function(t,n,e,r,i){var o,a,u=t.children,c=u.length,f=new Array(c+1);for(f[0]=a=o=0;o<c;++o)f[o+1]=a+=u[o].value;!function t(n,e,r,i,o,a,c){if(n>=e-1){var s=u[n];return s.x0=i,s.y0=o,s.x1=a,void(s.y1=c)}var l=f[n],h=r/2+l,d=n+1,p=e-1;for(;d<p;){var g=d+p>>>1;f[g]<h?d=g+1:p=g}h-f[d-1]<f[d]-h&&n+1<d&&--d;var y=f[d]-l,v=r-y;if(a-i>c-o){var _=r?(i*v+a*y)/r:a;t(n,d,y,i,o,_,c),t(d,e,v,_,o,a,c)}else{var b=r?(o*v+c*y)/r:c;t(n,d,y,i,o,a,b),t(d,e,v,i,b,a,c)}}(0,c,t.value,n,e,r,i)},t.treemapDice=Ap,t.treemapResquarify=Lp,t.treemapSlice=Ip,t.treemapSliceDice=function(t,n,e,r,i){(1&t.depth?Ip:Ap)(t,n,e,r,i)},t.treemapSquarify=Yp,t.tsv=Mc,t.tsvFormat=lc,t.tsvFormatBody=hc,t.tsvFormatRow=pc,t.tsvFormatRows=dc,t.tsvFormatValue=gc,t.tsvParse=fc,t.tsvParseRows=sc,t.union=function(...t){const n=new InternSet;for(const e of t)for(const t of e)n.add(t);return n},t.unixDay=_y,t.unixDays=by,t.utcDay=yy,t.utcDays=vy,t.utcFriday=By,t.utcFridays=Vy,t.utcHour=hy,t.utcHours=dy,t.utcMillisecond=Wg,t.utcMilliseconds=Zg,t.utcMinute=cy,t.utcMinutes=fy,t.utcMonday=qy,t.utcMondays=jy,t.utcMonth=Qy,t.utcMonths=Jy,t.utcSaturday=Yy,t.utcSaturdays=Wy,t.utcSecond=iy,t.utcSeconds=oy,t.utcSunday=Fy,t.utcSundays=Ly,t.utcThursday=Oy,t.utcThursdays=Gy,t.utcTickInterval=av,t.utcTicks=ov,t.utcTuesday=Uy,t.utcTuesdays=Hy,t.utcWednesday=Iy,t.utcWednesdays=Xy,t.utcWeek=Fy,t.utcWeeks=Ly,t.utcYear=ev,t.utcYears=rv,t.variance=x,t.version="7.9.0",t.window=pn,t.xml=Sc,t.zip=function(){return gt(arguments)},t.zoom=function(){var t,n,e,r=Ew,i=Nw,o=zw,a=Cw,u=Pw,c=[0,1/0],f=[[-1/0,-1/0],[1/0,1/0]],s=250,l=ri,h=$t("start","zoom","end"),d=500,p=150,g=0,y=10;function v(t){t.property("__zoom",kw).on("wheel.zoom",T,{passive:!1}).on("mousedown.zoom",A).on("dblclick.zoom",S).filter(u).on("touchstart.zoom",E).on("touchmove.zoom",N).on("touchend.zoom touchcancel.zoom",k).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function _(t,n){return(n=Math.max(c[0],Math.min(c[1],n)))===t.k?t:new ww(n,t.x,t.y)}function b(t,n,e){var r=n[0]-e[0]*t.k,i=n[1]-e[1]*t.k;return r===t.x&&i===t.y?t:new ww(t.k,r,i)}function m(t){return[(+t[0][0]+ +t[1][0])/2,(+t[0][1]+ +t[1][1])/2]}function x(t,n,e,r){t.on("start.zoom",(function(){w(this,arguments).event(r).start()})).on("interrupt.zoom end.zoom",(function(){w(this,arguments).event(r).end()})).tween("zoom",(function(){var t=this,o=arguments,a=w(t,o).event(r),u=i.apply(t,o),c=null==e?m(u):"function"==typeof e?e.apply(t,o):e,f=Math.max(u[1][0]-u[0][0],u[1][1]-u[0][1]),s=t.__zoom,h="function"==typeof n?n.apply(t,o):n,d=l(s.invert(c).concat(f/s.k),h.invert(c).concat(f/h.k));return function(t){if(1===t)t=h;else{var n=d(t),e=f/n[2];t=new ww(e,c[0]-n[0]*e,c[1]-n[1]*e)}a.zoom(null,t)}}))}function w(t,n,e){return!e&&t.__zooming||new M(t,n)}function M(t,n){this.that=t,this.args=n,this.active=0,this.sourceEvent=null,this.extent=i.apply(t,n),this.taps=0}function T(t,...n){if(r.apply(this,arguments)){var e=w(this,n).event(t),i=this.__zoom,u=Math.max(c[0],Math.min(c[1],i.k*Math.pow(2,a.apply(this,arguments)))),s=ne(t);if(e.wheel)e.mouse[0][0]===s[0]&&e.mouse[0][1]===s[1]||(e.mouse[1]=i.invert(e.mouse[0]=s)),clearTimeout(e.wheel);else{if(i.k===u)return;e.mouse=[s,i.invert(s)],Gi(this),e.start()}Sw(t),e.wheel=setTimeout((function(){e.wheel=null,e.end()}),p),e.zoom("mouse",o(b(_(i,u),e.mouse[0],e.mouse[1]),e.extent,f))}}function A(t,...n){if(!e&&r.apply(this,arguments)){var i=t.currentTarget,a=w(this,n,!0).event(t),u=Zn(t.view).on("mousemove.zoom",(function(t){if(Sw(t),!a.moved){var n=t.clientX-s,e=t.clientY-l;a.moved=n*n+e*e>g}a.event(t).zoom("mouse",o(b(a.that.__zoom,a.mouse[0]=ne(t,i),a.mouse[1]),a.extent,f))}),!0).on("mouseup.zoom",(function(t){u.on("mousemove.zoom mouseup.zoom",null),ue(t.view,a.moved),Sw(t),a.event(t).end()}),!0),c=ne(t,i),s=t.clientX,l=t.clientY;ae(t.view),Aw(t),a.mouse=[c,this.__zoom.invert(c)],Gi(this),a.start()}}function S(t,...n){if(r.apply(this,arguments)){var e=this.__zoom,a=ne(t.changedTouches?t.changedTouches[0]:t,this),u=e.invert(a),c=e.k*(t.shiftKey?.5:2),l=o(b(_(e,c),a,u),i.apply(this,n),f);Sw(t),s>0?Zn(this).transition().duration(s).call(x,l,a,t):Zn(this).call(v.transform,l,a,t)}}function E(e,...i){if(r.apply(this,arguments)){var o,a,u,c,f=e.touches,s=f.length,l=w(this,i,e.changedTouches.length===s).event(e);for(Aw(e),a=0;a<s;++a)c=[c=ne(u=f[a],this),this.__zoom.invert(c),u.identifier],l.touch0?l.touch1||l.touch0[2]===c[2]||(l.touch1=c,l.taps=0):(l.touch0=c,o=!0,l.taps=1+!!t);t&&(t=clearTimeout(t)),o&&(l.taps<2&&(n=c[0],t=setTimeout((function(){t=null}),d)),Gi(this),l.start())}}function N(t,...n){if(this.__zooming){var e,r,i,a,u=w(this,n).event(t),c=t.changedTouches,s=c.length;for(Sw(t),e=0;e<s;++e)i=ne(r=c[e],this),u.touch0&&u.touch0[2]===r.identifier?u.touch0[0]=i:u.touch1&&u.touch1[2]===r.identifier&&(u.touch1[0]=i);if(r=u.that.__zoom,u.touch1){var l=u.touch0[0],h=u.touch0[1],d=u.touch1[0],p=u.touch1[1],g=(g=d[0]-l[0])*g+(g=d[1]-l[1])*g,y=(y=p[0]-h[0])*y+(y=p[1]-h[1])*y;r=_(r,Math.sqrt(g/y)),i=[(l[0]+d[0])/2,(l[1]+d[1])/2],a=[(h[0]+p[0])/2,(h[1]+p[1])/2]}else{if(!u.touch0)return;i=u.touch0[0],a=u.touch0[1]}u.zoom("touch",o(b(r,i,a),u.extent,f))}}function k(t,...r){if(this.__zooming){var i,o,a=w(this,r).event(t),u=t.changedTouches,c=u.length;for(Aw(t),e&&clearTimeout(e),e=setTimeout((function(){e=null}),d),i=0;i<c;++i)o=u[i],a.touch0&&a.touch0[2]===o.identifier?delete a.touch0:a.touch1&&a.touch1[2]===o.identifier&&delete a.touch1;if(a.touch1&&!a.touch0&&(a.touch0=a.touch1,delete a.touch1),a.touch0)a.touch0[1]=this.__zoom.invert(a.touch0[0]);else if(a.end(),2===a.taps&&(o=ne(o,this),Math.hypot(n[0]-o[0],n[1]-o[1])<y)){var f=Zn(this).on("dblclick.zoom");f&&f.apply(this,arguments)}}}return v.transform=function(t,n,e,r){var i=t.selection?t.selection():t;i.property("__zoom",kw),t!==i?x(t,n,e,r):i.interrupt().each((function(){w(this,arguments).event(r).start().zoom(null,"function"==typeof n?n.apply(this,arguments):n).end()}))},v.scaleBy=function(t,n,e,r){v.scaleTo(t,(function(){return this.__zoom.k*("function"==typeof n?n.apply(this,arguments):n)}),e,r)},v.scaleTo=function(t,n,e,r){v.transform(t,(function(){var t=i.apply(this,arguments),r=this.__zoom,a=null==e?m(t):"function"==typeof e?e.apply(this,arguments):e,u=r.invert(a),c="function"==typeof n?n.apply(this,arguments):n;return o(b(_(r,c),a,u),t,f)}),e,r)},v.translateBy=function(t,n,e,r){v.transform(t,(function(){return o(this.__zoom.translate("function"==typeof n?n.apply(this,arguments):n,"function"==typeof e?e.apply(this,arguments):e),i.apply(this,arguments),f)}),null,r)},v.translateTo=function(t,n,e,r,a){v.transform(t,(function(){var t=i.apply(this,arguments),a=this.__zoom,u=null==r?m(t):"function"==typeof r?r.apply(this,arguments):r;return o(Mw.translate(u[0],u[1]).scale(a.k).translate("function"==typeof n?-n.apply(this,arguments):-n,"function"==typeof e?-e.apply(this,arguments):-e),t,f)}),r,a)},M.prototype={event:function(t){return t&&(this.sourceEvent=t),this},start:function(){return 1==++this.active&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(t,n){return this.mouse&&"mouse"!==t&&(this.mouse[1]=n.invert(this.mouse[0])),this.touch0&&"touch"!==t&&(this.touch0[1]=n.invert(this.touch0[0])),this.touch1&&"touch"!==t&&(this.touch1[1]=n.invert(this.touch1[0])),this.that.__zoom=n,this.emit("zoom"),this},end:function(){return 0==--this.active&&(delete this.that.__zooming,this.emit("end")),this},emit:function(t){var n=Zn(this.that).datum();h.call(t,this.that,new xw(t,{sourceEvent:this.sourceEvent,target:v,type:t,transform:this.that.__zoom,dispatch:h}),n)}},v.wheelDelta=function(t){return arguments.length?(a="function"==typeof t?t:mw(+t),v):a},v.filter=function(t){return arguments.length?(r="function"==typeof t?t:mw(!!t),v):r},v.touchable=function(t){return arguments.length?(u="function"==typeof t?t:mw(!!t),v):u},v.extent=function(t){return arguments.length?(i="function"==typeof t?t:mw([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),v):i},v.scaleExtent=function(t){return arguments.length?(c[0]=+t[0],c[1]=+t[1],v):[c[0],c[1]]},v.translateExtent=function(t){return arguments.length?(f[0][0]=+t[0][0],f[1][0]=+t[1][0],f[0][1]=+t[0][1],f[1][1]=+t[1][1],v):[[f[0][0],f[0][1]],[f[1][0],f[1][1]]]},v.constrain=function(t){return arguments.length?(o=t,v):o},v.duration=function(t){return arguments.length?(s=+t,v):s},v.interpolate=function(t){return arguments.length?(l=t,v):l},v.on=function(){var t=h.on.apply(h,arguments);return t===h?v:t},v.clickDistance=function(t){return arguments.length?(g=(t=+t)*t,v):Math.sqrt(g)},v.tapDistance=function(t){return arguments.length?(y=+t,v):y},v},t.zoomIdentity=Mw,t.zoomTransform=Tw}));
/**
 * @popperjs/core v2.11.8 - MIT License
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Popper={})}(this,(function(e){"use strict";function t(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function n(e){return e instanceof t(e).Element||e instanceof Element}function r(e){return e instanceof t(e).HTMLElement||e instanceof HTMLElement}function o(e){return"undefined"!=typeof ShadowRoot&&(e instanceof t(e).ShadowRoot||e instanceof ShadowRoot)}var i=Math.max,a=Math.min,s=Math.round;function f(){var e=navigator.userAgentData;return null!=e&&e.brands&&Array.isArray(e.brands)?e.brands.map((function(e){return e.brand+"/"+e.version})).join(" "):navigator.userAgent}function c(){return!/^((?!chrome|android).)*safari/i.test(f())}function p(e,o,i){void 0===o&&(o=!1),void 0===i&&(i=!1);var a=e.getBoundingClientRect(),f=1,p=1;o&&r(e)&&(f=e.offsetWidth>0&&s(a.width)/e.offsetWidth||1,p=e.offsetHeight>0&&s(a.height)/e.offsetHeight||1);var u=(n(e)?t(e):window).visualViewport,l=!c()&&i,d=(a.left+(l&&u?u.offsetLeft:0))/f,h=(a.top+(l&&u?u.offsetTop:0))/p,m=a.width/f,v=a.height/p;return{width:m,height:v,top:h,right:d+m,bottom:h+v,left:d,x:d,y:h}}function u(e){var n=t(e);return{scrollLeft:n.pageXOffset,scrollTop:n.pageYOffset}}function l(e){return e?(e.nodeName||"").toLowerCase():null}function d(e){return((n(e)?e.ownerDocument:e.document)||window.document).documentElement}function h(e){return p(d(e)).left+u(e).scrollLeft}function m(e){return t(e).getComputedStyle(e)}function v(e){var t=m(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function y(e,n,o){void 0===o&&(o=!1);var i,a,f=r(n),c=r(n)&&function(e){var t=e.getBoundingClientRect(),n=s(t.width)/e.offsetWidth||1,r=s(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(n),m=d(n),y=p(e,c,o),g={scrollLeft:0,scrollTop:0},b={x:0,y:0};return(f||!f&&!o)&&(("body"!==l(n)||v(m))&&(g=(i=n)!==t(i)&&r(i)?{scrollLeft:(a=i).scrollLeft,scrollTop:a.scrollTop}:u(i)),r(n)?((b=p(n,!0)).x+=n.clientLeft,b.y+=n.clientTop):m&&(b.x=h(m))),{x:y.left+g.scrollLeft-b.x,y:y.top+g.scrollTop-b.y,width:y.width,height:y.height}}function g(e){var t=p(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function b(e){return"html"===l(e)?e:e.assignedSlot||e.parentNode||(o(e)?e.host:null)||d(e)}function x(e){return["html","body","#document"].indexOf(l(e))>=0?e.ownerDocument.body:r(e)&&v(e)?e:x(b(e))}function w(e,n){var r;void 0===n&&(n=[]);var o=x(e),i=o===(null==(r=e.ownerDocument)?void 0:r.body),a=t(o),s=i?[a].concat(a.visualViewport||[],v(o)?o:[]):o,f=n.concat(s);return i?f:f.concat(w(b(s)))}function O(e){return["table","td","th"].indexOf(l(e))>=0}function j(e){return r(e)&&"fixed"!==m(e).position?e.offsetParent:null}function E(e){for(var n=t(e),i=j(e);i&&O(i)&&"static"===m(i).position;)i=j(i);return i&&("html"===l(i)||"body"===l(i)&&"static"===m(i).position)?n:i||function(e){var t=/firefox/i.test(f());if(/Trident/i.test(f())&&r(e)&&"fixed"===m(e).position)return null;var n=b(e);for(o(n)&&(n=n.host);r(n)&&["html","body"].indexOf(l(n))<0;){var i=m(n);if("none"!==i.transform||"none"!==i.perspective||"paint"===i.contain||-1!==["transform","perspective"].indexOf(i.willChange)||t&&"filter"===i.willChange||t&&i.filter&&"none"!==i.filter)return n;n=n.parentNode}return null}(e)||n}var D="top",A="bottom",L="right",P="left",M="auto",k=[D,A,L,P],W="start",B="end",H="viewport",T="popper",R=k.reduce((function(e,t){return e.concat([t+"-"+W,t+"-"+B])}),[]),S=[].concat(k,[M]).reduce((function(e,t){return e.concat([t,t+"-"+W,t+"-"+B])}),[]),V=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function q(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function C(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&o(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function N(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function I(e,r,o){return r===H?N(function(e,n){var r=t(e),o=d(e),i=r.visualViewport,a=o.clientWidth,s=o.clientHeight,f=0,p=0;if(i){a=i.width,s=i.height;var u=c();(u||!u&&"fixed"===n)&&(f=i.offsetLeft,p=i.offsetTop)}return{width:a,height:s,x:f+h(e),y:p}}(e,o)):n(r)?function(e,t){var n=p(e,!1,"fixed"===t);return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}(r,o):N(function(e){var t,n=d(e),r=u(e),o=null==(t=e.ownerDocument)?void 0:t.body,a=i(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),s=i(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),f=-r.scrollLeft+h(e),c=-r.scrollTop;return"rtl"===m(o||n).direction&&(f+=i(n.clientWidth,o?o.clientWidth:0)-a),{width:a,height:s,x:f,y:c}}(d(e)))}function _(e,t,o,s){var f="clippingParents"===t?function(e){var t=w(b(e)),o=["absolute","fixed"].indexOf(m(e).position)>=0&&r(e)?E(e):e;return n(o)?t.filter((function(e){return n(e)&&C(e,o)&&"body"!==l(e)})):[]}(e):[].concat(t),c=[].concat(f,[o]),p=c[0],u=c.reduce((function(t,n){var r=I(e,n,s);return t.top=i(r.top,t.top),t.right=a(r.right,t.right),t.bottom=a(r.bottom,t.bottom),t.left=i(r.left,t.left),t}),I(e,p,s));return u.width=u.right-u.left,u.height=u.bottom-u.top,u.x=u.left,u.y=u.top,u}function F(e){return e.split("-")[0]}function U(e){return e.split("-")[1]}function z(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function X(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?F(o):null,a=o?U(o):null,s=n.x+n.width/2-r.width/2,f=n.y+n.height/2-r.height/2;switch(i){case D:t={x:s,y:n.y-r.height};break;case A:t={x:s,y:n.y+n.height};break;case L:t={x:n.x+n.width,y:f};break;case P:t={x:n.x-r.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?z(i):null;if(null!=c){var p="y"===c?"height":"width";switch(a){case W:t[c]=t[c]-(n[p]/2-r[p]/2);break;case B:t[c]=t[c]+(n[p]/2-r[p]/2)}}return t}function Y(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function G(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}function J(e,t){void 0===t&&(t={});var r=t,o=r.placement,i=void 0===o?e.placement:o,a=r.strategy,s=void 0===a?e.strategy:a,f=r.boundary,c=void 0===f?"clippingParents":f,u=r.rootBoundary,l=void 0===u?H:u,h=r.elementContext,m=void 0===h?T:h,v=r.altBoundary,y=void 0!==v&&v,g=r.padding,b=void 0===g?0:g,x=Y("number"!=typeof b?b:G(b,k)),w=m===T?"reference":T,O=e.rects.popper,j=e.elements[y?w:m],E=_(n(j)?j:j.contextElement||d(e.elements.popper),c,l,s),P=p(e.elements.reference),M=X({reference:P,element:O,strategy:"absolute",placement:i}),W=N(Object.assign({},O,M)),B=m===T?W:P,R={top:E.top-B.top+x.top,bottom:B.bottom-E.bottom+x.bottom,left:E.left-B.left+x.left,right:B.right-E.right+x.right},S=e.modifiersData.offset;if(m===T&&S){var V=S[i];Object.keys(R).forEach((function(e){var t=[L,A].indexOf(e)>=0?1:-1,n=[D,A].indexOf(e)>=0?"y":"x";R[e]+=V[n]*t}))}return R}var K={placement:"bottom",modifiers:[],strategy:"absolute"};function Q(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"==typeof e.getBoundingClientRect)}))}function Z(e){void 0===e&&(e={});var t=e,r=t.defaultModifiers,o=void 0===r?[]:r,i=t.defaultOptions,a=void 0===i?K:i;return function(e,t,r){void 0===r&&(r=a);var i,s,f={placement:"bottom",orderedModifiers:[],options:Object.assign({},K,a),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},c=[],p=!1,u={state:f,setOptions:function(r){var i="function"==typeof r?r(f.options):r;l(),f.options=Object.assign({},a,f.options,i),f.scrollParents={reference:n(e)?w(e):e.contextElement?w(e.contextElement):[],popper:w(t)};var s,p,d=function(e){var t=q(e);return V.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(o,f.options.modifiers),p=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(p).map((function(e){return p[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,o=e.effect;if("function"==typeof o){var i=o({state:f,name:t,instance:u,options:r}),a=function(){};c.push(i||a)}})),u.update()},forceUpdate:function(){if(!p){var e=f.elements,t=e.reference,n=e.popper;if(Q(t,n)){f.rects={reference:y(t,E(n),"fixed"===f.options.strategy),popper:g(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<f.orderedModifiers.length;r++)if(!0!==f.reset){var o=f.orderedModifiers[r],i=o.fn,a=o.options,s=void 0===a?{}:a,c=o.name;"function"==typeof i&&(f=i({state:f,options:s,name:c,instance:u})||f)}else f.reset=!1,r=-1}}},update:(i=function(){return new Promise((function(e){u.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(i())}))}))),s}),destroy:function(){l(),p=!0}};if(!Q(e,t))return u;function l(){c.forEach((function(e){return e()})),c=[]}return u.setOptions(r).then((function(e){!p&&r.onFirstUpdate&&r.onFirstUpdate(e)})),u}}var $={passive:!0};var ee={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var n=e.state,r=e.instance,o=e.options,i=o.scroll,a=void 0===i||i,s=o.resize,f=void 0===s||s,c=t(n.elements.popper),p=[].concat(n.scrollParents.reference,n.scrollParents.popper);return a&&p.forEach((function(e){e.addEventListener("scroll",r.update,$)})),f&&c.addEventListener("resize",r.update,$),function(){a&&p.forEach((function(e){e.removeEventListener("scroll",r.update,$)})),f&&c.removeEventListener("resize",r.update,$)}},data:{}};var te={name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=X({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},ne={top:"auto",right:"auto",bottom:"auto",left:"auto"};function re(e){var n,r=e.popper,o=e.popperRect,i=e.placement,a=e.variation,f=e.offsets,c=e.position,p=e.gpuAcceleration,u=e.adaptive,l=e.roundOffsets,h=e.isFixed,v=f.x,y=void 0===v?0:v,g=f.y,b=void 0===g?0:g,x="function"==typeof l?l({x:y,y:b}):{x:y,y:b};y=x.x,b=x.y;var w=f.hasOwnProperty("x"),O=f.hasOwnProperty("y"),j=P,M=D,k=window;if(u){var W=E(r),H="clientHeight",T="clientWidth";if(W===t(r)&&"static"!==m(W=d(r)).position&&"absolute"===c&&(H="scrollHeight",T="scrollWidth"),W=W,i===D||(i===P||i===L)&&a===B)M=A,b-=(h&&W===k&&k.visualViewport?k.visualViewport.height:W[H])-o.height,b*=p?1:-1;if(i===P||(i===D||i===A)&&a===B)j=L,y-=(h&&W===k&&k.visualViewport?k.visualViewport.width:W[T])-o.width,y*=p?1:-1}var R,S=Object.assign({position:c},u&&ne),V=!0===l?function(e,t){var n=e.x,r=e.y,o=t.devicePixelRatio||1;return{x:s(n*o)/o||0,y:s(r*o)/o||0}}({x:y,y:b},t(r)):{x:y,y:b};return y=V.x,b=V.y,p?Object.assign({},S,((R={})[M]=O?"0":"",R[j]=w?"0":"",R.transform=(k.devicePixelRatio||1)<=1?"translate("+y+"px, "+b+"px)":"translate3d("+y+"px, "+b+"px, 0)",R)):Object.assign({},S,((n={})[M]=O?b+"px":"",n[j]=w?y+"px":"",n.transform="",n))}var oe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:F(t.placement),variation:U(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,re(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,re(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}};var ie={name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},o=t.attributes[e]||{},i=t.elements[e];r(i)&&l(i)&&(Object.assign(i.style,n),Object.keys(o).forEach((function(e){var t=o[e];!1===t?i.removeAttribute(e):i.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var o=t.elements[e],i=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});r(o)&&l(o)&&(Object.assign(o.style,a),Object.keys(i).forEach((function(e){o.removeAttribute(e)})))}))}},requires:["computeStyles"]};var ae={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=S.reduce((function(e,n){return e[n]=function(e,t,n){var r=F(e),o=[P,D].indexOf(r)>=0?-1:1,i="function"==typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[P,L].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],f=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=f,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},se={left:"right",right:"left",bottom:"top",top:"bottom"};function fe(e){return e.replace(/left|right|bottom|top/g,(function(e){return se[e]}))}var ce={start:"end",end:"start"};function pe(e){return e.replace(/start|end/g,(function(e){return ce[e]}))}function ue(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?S:f,p=U(r),u=p?s?R:R.filter((function(e){return U(e)===p})):k,l=u.filter((function(e){return c.indexOf(e)>=0}));0===l.length&&(l=u);var d=l.reduce((function(t,n){return t[n]=J(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[F(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}var le={name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.flipVariations,h=void 0===d||d,m=n.allowedAutoPlacements,v=t.options.placement,y=F(v),g=f||(y===v||!h?[fe(v)]:function(e){if(F(e)===M)return[];var t=fe(e);return[pe(e),t,pe(t)]}(v)),b=[v].concat(g).reduce((function(e,n){return e.concat(F(n)===M?ue(t,{placement:n,boundary:p,rootBoundary:u,padding:c,flipVariations:h,allowedAutoPlacements:m}):n)}),[]),x=t.rects.reference,w=t.rects.popper,O=new Map,j=!0,E=b[0],k=0;k<b.length;k++){var B=b[k],H=F(B),T=U(B)===W,R=[D,A].indexOf(H)>=0,S=R?"width":"height",V=J(t,{placement:B,boundary:p,rootBoundary:u,altBoundary:l,padding:c}),q=R?T?L:P:T?A:D;x[S]>w[S]&&(q=fe(q));var C=fe(q),N=[];if(i&&N.push(V[H]<=0),s&&N.push(V[q]<=0,V[C]<=0),N.every((function(e){return e}))){E=B,j=!1;break}O.set(B,N)}if(j)for(var I=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return E=t,"break"},_=h?3:1;_>0;_--){if("break"===I(_))break}t.placement!==E&&(t.modifiersData[r]._skip=!0,t.placement=E,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}};function de(e,t,n){return i(e,a(t,n))}var he={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,s=void 0===o||o,f=n.altAxis,c=void 0!==f&&f,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.padding,h=n.tether,m=void 0===h||h,v=n.tetherOffset,y=void 0===v?0:v,b=J(t,{boundary:p,rootBoundary:u,padding:d,altBoundary:l}),x=F(t.placement),w=U(t.placement),O=!w,j=z(x),M="x"===j?"y":"x",k=t.modifiersData.popperOffsets,B=t.rects.reference,H=t.rects.popper,T="function"==typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,R="number"==typeof T?{mainAxis:T,altAxis:T}:Object.assign({mainAxis:0,altAxis:0},T),S=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,V={x:0,y:0};if(k){if(s){var q,C="y"===j?D:P,N="y"===j?A:L,I="y"===j?"height":"width",_=k[j],X=_+b[C],Y=_-b[N],G=m?-H[I]/2:0,K=w===W?B[I]:H[I],Q=w===W?-H[I]:-B[I],Z=t.elements.arrow,$=m&&Z?g(Z):{width:0,height:0},ee=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},te=ee[C],ne=ee[N],re=de(0,B[I],$[I]),oe=O?B[I]/2-G-re-te-R.mainAxis:K-re-te-R.mainAxis,ie=O?-B[I]/2+G+re+ne+R.mainAxis:Q+re+ne+R.mainAxis,ae=t.elements.arrow&&E(t.elements.arrow),se=ae?"y"===j?ae.clientTop||0:ae.clientLeft||0:0,fe=null!=(q=null==S?void 0:S[j])?q:0,ce=_+ie-fe,pe=de(m?a(X,_+oe-fe-se):X,_,m?i(Y,ce):Y);k[j]=pe,V[j]=pe-_}if(c){var ue,le="x"===j?D:P,he="x"===j?A:L,me=k[M],ve="y"===M?"height":"width",ye=me+b[le],ge=me-b[he],be=-1!==[D,P].indexOf(x),xe=null!=(ue=null==S?void 0:S[M])?ue:0,we=be?ye:me-B[ve]-H[ve]-xe+R.altAxis,Oe=be?me+B[ve]+H[ve]-xe-R.altAxis:ge,je=m&&be?function(e,t,n){var r=de(e,t,n);return r>n?n:r}(we,me,Oe):de(m?we:ye,me,m?Oe:ge);k[M]=je,V[M]=je-me}t.modifiersData[r]=V}},requiresIfExists:["offset"]};var me={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=F(n.placement),f=z(s),c=[P,L].indexOf(s)>=0?"height":"width";if(i&&a){var p=function(e,t){return Y("number"!=typeof(e="function"==typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:G(e,k))}(o.padding,n),u=g(i),l="y"===f?D:P,d="y"===f?A:L,h=n.rects.reference[c]+n.rects.reference[f]-a[f]-n.rects.popper[c],m=a[f]-n.rects.reference[f],v=E(i),y=v?"y"===f?v.clientHeight||0:v.clientWidth||0:0,b=h/2-m/2,x=p[l],w=y-u[c]-p[d],O=y/2-u[c]/2+b,j=de(x,O,w),M=f;n.modifiersData[r]=((t={})[M]=j,t.centerOffset=j-O,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&C(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ve(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function ye(e){return[D,L,A,P].some((function(t){return e[t]>=0}))}var ge={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=J(t,{elementContext:"reference"}),s=J(t,{altBoundary:!0}),f=ve(a,r),c=ve(s,o,i),p=ye(f),u=ye(c);t.modifiersData[n]={referenceClippingOffsets:f,popperEscapeOffsets:c,isReferenceHidden:p,hasPopperEscaped:u},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":p,"data-popper-escaped":u})}},be=Z({defaultModifiers:[ee,te,oe,ie]}),xe=[ee,te,oe,ie,ae,le,he,me,ge],we=Z({defaultModifiers:xe});e.applyStyles=ie,e.arrow=me,e.computeStyles=oe,e.createPopper=we,e.createPopperLite=be,e.defaultModifiers=xe,e.detectOverflow=J,e.eventListeners=ee,e.flip=le,e.hide=ge,e.offset=ae,e.popperGenerator=Z,e.popperOffsets=te,e.preventOverflow=he,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=popper.min.js.map
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("d3-selection"),require("d3-color"),require("d3"),require("d3-fetch")):"function"==typeof define&&define.amd?define(["d3-selection","d3-color","d3","d3-fetch"],e):(t="undefined"!=typeof globalThis?globalThis:t||self).CalHeatmap=e(t.d3,t.d3,t.d3,t.d3)}(this,(function(t,e,n,r){"use strict";function i(){i=function(){return t};var t={},e=Object.prototype,n=e.hasOwnProperty,r=Object.defineProperty||function(t,e,n){t[e]=n.value},o="function"==typeof Symbol?Symbol:{},a=o.iterator||"@@iterator",u=o.asyncIterator||"@@asyncIterator",s=o.toStringTag||"@@toStringTag";function c(t,e,n){return Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{c({},"")}catch(t){c=function(t,e,n){return t[e]=n}}function l(t,e,n,i){var o=e&&e.prototype instanceof d?e:d,a=Object.create(o.prototype),u=new _(i||[]);return r(a,"_invoke",{value:O(t,n,u)}),a}function f(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=l;var h={};function d(){}function p(){}function v(){}var y={};c(y,a,(function(){return this}));var m=Object.getPrototypeOf,g=m&&m(m(M([])));g&&g!==e&&n.call(g,a)&&(y=g);var b=v.prototype=d.prototype=Object.create(y);function w(t){["next","throw","return"].forEach((function(e){c(t,e,(function(t){return this._invoke(e,t)}))}))}function x(t,e){function i(r,o,a,u){var s=f(t[r],t,o);if("throw"!==s.type){var c=s.arg,l=c.value;return l&&"object"==typeof l&&n.call(l,"__await")?e.resolve(l.__await).then((function(t){i("next",t,a,u)}),(function(t){i("throw",t,a,u)})):e.resolve(l).then((function(t){c.value=t,a(c)}),(function(t){return i("throw",t,a,u)}))}u(s.arg)}var o;r(this,"_invoke",{value:function(t,n){function r(){return new e((function(e,r){i(t,n,e,r)}))}return o=o?o.then(r,r):r()}})}function O(t,e,n){var r="suspendedStart";return function(i,o){if("executing"===r)throw new Error("Generator is already running");if("completed"===r){if("throw"===i)throw o;return D()}for(n.method=i,n.arg=o;;){var a=n.delegate;if(a){var u=k(a,n);if(u){if(u===h)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===r)throw r="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r="executing";var s=f(t,e,n);if("normal"===s.type){if(r=n.done?"completed":"suspendedYield",s.arg===h)continue;return{value:s.arg,done:n.done}}"throw"===s.type&&(r="completed",n.method="throw",n.arg=s.arg)}}}function k(t,e){var n=e.method,r=t.iterator[n];if(void 0===r)return e.delegate=null,"throw"===n&&t.iterator.return&&(e.method="return",e.arg=void 0,k(t,e),"throw"===e.method)||"return"!==n&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+n+"' method")),h;var i=f(r,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,h;var o=i.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,h):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,h)}function S(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function j(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(S,this),this.reset(!0)}function M(t){if(t){var e=t[a];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function e(){for(;++r<t.length;)if(n.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=void 0,e.done=!0,e};return i.next=i}}return{next:D}}function D(){return{value:void 0,done:!0}}return p.prototype=v,r(b,"constructor",{value:v,configurable:!0}),r(v,"constructor",{value:p,configurable:!0}),p.displayName=c(v,s,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===p||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,v):(t.__proto__=v,c(t,s,"GeneratorFunction")),t.prototype=Object.create(b),t},t.awrap=function(t){return{__await:t}},w(x.prototype),c(x.prototype,u,(function(){return this})),t.AsyncIterator=x,t.async=function(e,n,r,i,o){void 0===o&&(o=Promise);var a=new x(l(e,n,r,i),o);return t.isGeneratorFunction(n)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},w(b),c(b,s,"Generator"),c(b,a,(function(){return this})),c(b,"toString",(function(){return"[object Generator]"})),t.keys=function(t){var e=Object(t),n=[];for(var r in e)n.push(r);return n.reverse(),function t(){for(;n.length;){var r=n.pop();if(r in e)return t.value=r,t.done=!1,t}return t.done=!0,t}},t.values=M,_.prototype={constructor:_,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(j),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(n,r){return a.type="throw",a.arg=t,e.next=n,r&&(e.method="next",e.arg=void 0),!!r}for(var i=this.tryEntries.length-1;i>=0;--i){var o=this.tryEntries[i],a=o.completion;if("root"===o.tryLoc)return r("end");if(o.tryLoc<=this.prev){var u=n.call(o,"catchLoc"),s=n.call(o,"finallyLoc");if(u&&s){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(u){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return r(o.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var i=this.tryEntries[r];if(i.tryLoc<=this.prev&&n.call(i,"finallyLoc")&&this.prev<i.finallyLoc){var o=i;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,h):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),h},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),j(n),h}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var i=r.arg;j(n)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:M(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),h}},t}function o(t){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o(t)}function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function u(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,d(r.key),r)}}function s(t,e,n){return e&&u(t.prototype,e),n&&u(t,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function c(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,i,o,a,u=[],s=!0,c=!1;try{if(o=(n=n.call(t)).next,0===e){if(Object(n)!==n)return;s=!1}else for(;!(s=(r=o.call(n)).done)&&(u.push(r.value),u.length!==e);s=!0);}catch(t){c=!0,i=t}finally{try{if(!s&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(c)throw i}}return u}}(t,e)||f(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(t){return function(t){if(Array.isArray(t))return h(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||f(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(t,e){if(t){if("string"==typeof t)return h(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?h(t,e):void 0}}function h(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function d(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var r=n.call(t,e||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}var p="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function v(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var y=function(t){return t&&t.Math===Math&&t},m=y("object"==typeof globalThis&&globalThis)||y("object"==typeof window&&window)||y("object"==typeof self&&self)||y("object"==typeof p&&p)||y("object"==typeof p&&p)||function(){return this}()||Function("return this")(),g={exports:{}},b=m,w=Object.defineProperty,x=function(t,e){try{w(b,t,{value:e,configurable:!0,writable:!0})}catch(n){b[t]=e}return e},O=x,k="__core-js_shared__",S=m[k]||O(k,{}),j=S;(g.exports=function(t,e){return j[t]||(j[t]=void 0!==e?e:{})})("versions",[]).push({version:"3.34.0",mode:"global",copyright:"© 2014-2023 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.34.0/LICENSE",source:"https://github.com/zloirock/core-js"});var _,M,D=g.exports,P=function(t){try{return!!t()}catch(t){return!0}},$=!P((function(){var t=function(){}.bind();return"function"!=typeof t||t.hasOwnProperty("prototype")})),E=$,L=Function.prototype,T=L.call,C=E&&L.bind.bind(T,T),A=E?C:function(t){return function(){return T.apply(t,arguments)}},R=function(t){return null==t},I=R,N=TypeError,W=function(t){if(I(t))throw new N("Can't call method on "+t);return t},Y=W,z=Object,F=function(t){return z(Y(t))},H=F,B=A({}.hasOwnProperty),G=Object.hasOwn||function(t,e){return B(H(t),e)},U=A,q=0,V=Math.random(),K=U(1..toString),Z=function(t){return"Symbol("+(void 0===t?"":t)+")_"+K(++q+V,36)},Q="undefined"!=typeof navigator&&String(navigator.userAgent)||"",J=m,X=Q,tt=J.process,et=J.Deno,nt=tt&&tt.versions||et&&et.version,rt=nt&&nt.v8;rt&&(M=(_=rt.split("."))[0]>0&&_[0]<4?1:+(_[0]+_[1])),!M&&X&&(!(_=X.match(/Edge\/(\d+)/))||_[1]>=74)&&(_=X.match(/Chrome\/(\d+)/))&&(M=+_[1]);var it=M,ot=it,at=P,ut=m.String,st=!!Object.getOwnPropertySymbols&&!at((function(){var t=Symbol("symbol detection");return!ut(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&ot&&ot<41})),ct=st&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,lt=D,ft=G,ht=Z,dt=st,pt=ct,vt=m.Symbol,yt=lt("wks"),mt=pt?vt.for||vt:vt&&vt.withoutSetter||ht,gt=function(t){return ft(yt,t)||(yt[t]=dt&&ft(vt,t)?vt[t]:mt("Symbol."+t)),yt[t]},bt={};bt[gt("toStringTag")]="z";var wt="[object z]"===String(bt),xt="object"==typeof document&&document.all,Ot={all:xt,IS_HTMLDDA:void 0===xt&&void 0!==xt},kt=Ot.all,St=Ot.IS_HTMLDDA?function(t){return"function"==typeof t||t===kt}:function(t){return"function"==typeof t},jt={},_t=!P((function(){return 7!==Object.defineProperty({},1,{get:function(){return 7}})[1]})),Mt=St,Dt=Ot.all,Pt=Ot.IS_HTMLDDA?function(t){return"object"==typeof t?null!==t:Mt(t)||t===Dt}:function(t){return"object"==typeof t?null!==t:Mt(t)},$t=Pt,Et=m.document,Lt=$t(Et)&&$t(Et.createElement),Tt=function(t){return Lt?Et.createElement(t):{}},Ct=Tt,At=!_t&&!P((function(){return 7!==Object.defineProperty(Ct("div"),"a",{get:function(){return 7}}).a})),Rt=_t&&P((function(){return 42!==Object.defineProperty((function(){}),"prototype",{value:42,writable:!1}).prototype})),It=Pt,Nt=String,Wt=TypeError,Yt=function(t){if(It(t))return t;throw new Wt(Nt(t)+" is not an object")},zt=$,Ft=Function.prototype.call,Ht=zt?Ft.bind(Ft):function(){return Ft.apply(Ft,arguments)},Bt=m,Gt=St,Ut=function(t,e){return arguments.length<2?(n=Bt[t],Gt(n)?n:void 0):Bt[t]&&Bt[t][e];var n},qt=A({}.isPrototypeOf),Vt=Ut,Kt=St,Zt=qt,Qt=Object,Jt=ct?function(t){return"symbol"==typeof t}:function(t){var e=Vt("Symbol");return Kt(e)&&Zt(e.prototype,Qt(t))},Xt=String,te=function(t){try{return Xt(t)}catch(t){return"Object"}},ee=St,ne=te,re=TypeError,ie=function(t){if(ee(t))return t;throw new re(ne(t)+" is not a function")},oe=ie,ae=R,ue=function(t,e){var n=t[e];return ae(n)?void 0:oe(n)},se=Ht,ce=St,le=Pt,fe=TypeError,he=Ht,de=Pt,pe=Jt,ve=ue,ye=function(t,e){var n,r;if("string"===e&&ce(n=t.toString)&&!le(r=se(n,t)))return r;if(ce(n=t.valueOf)&&!le(r=se(n,t)))return r;if("string"!==e&&ce(n=t.toString)&&!le(r=se(n,t)))return r;throw new fe("Can't convert object to primitive value")},me=TypeError,ge=gt("toPrimitive"),be=function(t,e){if(!de(t)||pe(t))return t;var n,r=ve(t,ge);if(r){if(void 0===e&&(e="default"),n=he(r,t,e),!de(n)||pe(n))return n;throw new me("Can't convert object to primitive value")}return void 0===e&&(e="number"),ye(t,e)},we=Jt,xe=function(t){var e=be(t,"string");return we(e)?e:e+""},Oe=_t,ke=At,Se=Rt,je=Yt,_e=xe,Me=TypeError,De=Object.defineProperty,Pe=Object.getOwnPropertyDescriptor,$e="enumerable",Ee="configurable",Le="writable";jt.f=Oe?Se?function(t,e,n){if(je(t),e=_e(e),je(n),"function"==typeof t&&"prototype"===e&&"value"in n&&Le in n&&!n[Le]){var r=Pe(t,e);r&&r[Le]&&(t[e]=n.value,n={configurable:Ee in n?n[Ee]:r[Ee],enumerable:$e in n?n[$e]:r[$e],writable:!1})}return De(t,e,n)}:De:function(t,e,n){if(je(t),e=_e(e),je(n),ke)try{return De(t,e,n)}catch(t){}if("get"in n||"set"in n)throw new Me("Accessors not supported");return"value"in n&&(t[e]=n.value),t};var Te={exports:{}},Ce=_t,Ae=G,Re=Function.prototype,Ie=Ce&&Object.getOwnPropertyDescriptor,Ne=Ae(Re,"name"),We={EXISTS:Ne,PROPER:Ne&&"something"===function(){}.name,CONFIGURABLE:Ne&&(!Ce||Ce&&Ie(Re,"name").configurable)},Ye=St,ze=S,Fe=A(Function.toString);Ye(ze.inspectSource)||(ze.inspectSource=function(t){return Fe(t)});var He,Be,Ge,Ue=ze.inspectSource,qe=St,Ve=m.WeakMap,Ke=qe(Ve)&&/native code/.test(String(Ve)),Ze=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}},Qe=jt,Je=Ze,Xe=_t?function(t,e,n){return Qe.f(t,e,Je(1,n))}:function(t,e,n){return t[e]=n,t},tn=Z,en=D("keys"),nn=function(t){return en[t]||(en[t]=tn(t))},rn={},on=Ke,an=m,un=Pt,sn=Xe,cn=G,ln=S,fn=nn,hn=rn,dn="Object already initialized",pn=an.TypeError,vn=an.WeakMap;if(on||ln.state){var yn=ln.state||(ln.state=new vn);yn.get=yn.get,yn.has=yn.has,yn.set=yn.set,He=function(t,e){if(yn.has(t))throw new pn(dn);return e.facade=t,yn.set(t,e),e},Be=function(t){return yn.get(t)||{}},Ge=function(t){return yn.has(t)}}else{var mn=fn("state");hn[mn]=!0,He=function(t,e){if(cn(t,mn))throw new pn(dn);return e.facade=t,sn(t,mn,e),e},Be=function(t){return cn(t,mn)?t[mn]:{}},Ge=function(t){return cn(t,mn)}}var gn={set:He,get:Be,has:Ge,enforce:function(t){return Ge(t)?Be(t):He(t,{})},getterFor:function(t){return function(e){var n;if(!un(e)||(n=Be(e)).type!==t)throw new pn("Incompatible receiver, "+t+" required");return n}}},bn=A,wn=P,xn=St,On=G,kn=_t,Sn=We.CONFIGURABLE,jn=Ue,_n=gn.enforce,Mn=gn.get,Dn=String,Pn=Object.defineProperty,$n=bn("".slice),En=bn("".replace),Ln=bn([].join),Tn=kn&&!wn((function(){return 8!==Pn((function(){}),"length",{value:8}).length})),Cn=String(String).split("String"),An=Te.exports=function(t,e,n){"Symbol("===$n(Dn(e),0,7)&&(e="["+En(Dn(e),/^Symbol\(([^)]*)\)/,"$1")+"]"),n&&n.getter&&(e="get "+e),n&&n.setter&&(e="set "+e),(!On(t,"name")||Sn&&t.name!==e)&&(kn?Pn(t,"name",{value:e,configurable:!0}):t.name=e),Tn&&n&&On(n,"arity")&&t.length!==n.arity&&Pn(t,"length",{value:n.arity});try{n&&On(n,"constructor")&&n.constructor?kn&&Pn(t,"prototype",{writable:!1}):t.prototype&&(t.prototype=void 0)}catch(t){}var r=_n(t);return On(r,"source")||(r.source=Ln(Cn,"string"==typeof e?e:"")),t};Function.prototype.toString=An((function(){return xn(this)&&Mn(this).source||jn(this)}),"toString");var Rn=Te.exports,In=St,Nn=jt,Wn=Rn,Yn=x,zn=function(t,e,n,r){r||(r={});var i=r.enumerable,o=void 0!==r.name?r.name:e;if(In(n)&&Wn(n,o,r),r.global)i?t[e]=n:Yn(e,n);else{try{r.unsafe?t[e]&&(i=!0):delete t[e]}catch(t){}i?t[e]=n:Nn.f(t,e,{value:n,enumerable:!1,configurable:!r.nonConfigurable,writable:!r.nonWritable})}return t},Fn=A,Hn=Fn({}.toString),Bn=Fn("".slice),Gn=function(t){return Bn(Hn(t),8,-1)},Un=wt,qn=St,Vn=Gn,Kn=gt("toStringTag"),Zn=Object,Qn="Arguments"===Vn(function(){return arguments}()),Jn=Un?Vn:function(t){var e,n,r;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Zn(t),Kn))?n:Qn?Vn(e):"Object"===(r=Vn(e))&&qn(e.callee)?"Arguments":r},Xn=Jn,tr=wt?{}.toString:function(){return"[object "+Xn(this)+"]"};wt||zn(Object.prototype,"toString",tr,{unsafe:!0});var er={},nr={},rr={}.propertyIsEnumerable,ir=Object.getOwnPropertyDescriptor,or=ir&&!rr.call({1:2},1);nr.f=or?function(t){var e=ir(this,t);return!!e&&e.enumerable}:rr;var ar=P,ur=Gn,sr=Object,cr=A("".split),lr=ar((function(){return!sr("z").propertyIsEnumerable(0)}))?function(t){return"String"===ur(t)?cr(t,""):sr(t)}:sr,fr=lr,hr=W,dr=function(t){return fr(hr(t))},pr=_t,vr=Ht,yr=nr,mr=Ze,gr=dr,br=xe,wr=G,xr=At,Or=Object.getOwnPropertyDescriptor;er.f=pr?Or:function(t,e){if(t=gr(t),e=br(e),xr)try{return Or(t,e)}catch(t){}if(wr(t,e))return mr(!vr(yr.f,t,e),t[e])};var kr={},Sr=Math.ceil,jr=Math.floor,_r=Math.trunc||function(t){var e=+t;return(e>0?jr:Sr)(e)},Mr=function(t){var e=+t;return e!=e||0===e?0:_r(e)},Dr=Mr,Pr=Math.max,$r=Math.min,Er=function(t,e){var n=Dr(t);return n<0?Pr(n+e,0):$r(n,e)},Lr=Mr,Tr=Math.min,Cr=function(t){return t>0?Tr(Lr(t),9007199254740991):0},Ar=Cr,Rr=function(t){return Ar(t.length)},Ir=dr,Nr=Er,Wr=Rr,Yr=function(t){return function(e,n,r){var i,o=Ir(e),a=Wr(o),u=Nr(r,a);if(t&&n!=n){for(;a>u;)if((i=o[u++])!=i)return!0}else for(;a>u;u++)if((t||u in o)&&o[u]===n)return t||u||0;return!t&&-1}},zr={includes:Yr(!0),indexOf:Yr(!1)},Fr=G,Hr=dr,Br=zr.indexOf,Gr=rn,Ur=A([].push),qr=function(t,e){var n,r=Hr(t),i=0,o=[];for(n in r)!Fr(Gr,n)&&Fr(r,n)&&Ur(o,n);for(;e.length>i;)Fr(r,n=e[i++])&&(~Br(o,n)||Ur(o,n));return o},Vr=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Kr=qr,Zr=Vr.concat("length","prototype");kr.f=Object.getOwnPropertyNames||function(t){return Kr(t,Zr)};var Qr={};Qr.f=Object.getOwnPropertySymbols;var Jr=Ut,Xr=kr,ti=Qr,ei=Yt,ni=A([].concat),ri=Jr("Reflect","ownKeys")||function(t){var e=Xr.f(ei(t)),n=ti.f;return n?ni(e,n(t)):e},ii=G,oi=ri,ai=er,ui=jt,si=P,ci=St,li=/#|\.prototype\./,fi=function(t,e){var n=di[hi(t)];return n===vi||n!==pi&&(ci(e)?si(e):!!e)},hi=fi.normalize=function(t){return String(t).replace(li,".").toLowerCase()},di=fi.data={},pi=fi.NATIVE="N",vi=fi.POLYFILL="P",yi=fi,mi=m,gi=er.f,bi=Xe,wi=zn,xi=x,Oi=function(t,e,n){for(var r=oi(e),i=ui.f,o=ai.f,a=0;a<r.length;a++){var u=r[a];ii(t,u)||n&&ii(n,u)||i(t,u,o(e,u))}},ki=yi,Si=function(t,e){var n,r,i,o,a,u=t.target,s=t.global,c=t.stat;if(n=s?mi:c?mi[u]||xi(u,{}):(mi[u]||{}).prototype)for(r in e){if(o=e[r],i=t.dontCallGetSet?(a=gi(n,r))&&a.value:n[r],!ki(s?r:u+(c?".":"#")+r,t.forced)&&void 0!==i){if(typeof o==typeof i)continue;Oi(o,i)}(t.sham||i&&i.sham)&&bi(o,"sham",!0),wi(n,r,o,t)}},ji="process"===Gn(m.process),_i=A,Mi=ie,Di=St,Pi=String,$i=TypeError,Ei=function(t,e,n){try{return _i(Mi(Object.getOwnPropertyDescriptor(t,e)[n]))}catch(t){}},Li=Yt,Ti=function(t){if("object"==typeof t||Di(t))return t;throw new $i("Can't set "+Pi(t)+" as a prototype")},Ci=Object.setPrototypeOf||("__proto__"in{}?function(){var t,e=!1,n={};try{(t=Ei(Object.prototype,"__proto__","set"))(n,[]),e=n instanceof Array}catch(t){}return function(n,r){return Li(n),Ti(r),e?t(n,r):n.__proto__=r,n}}():void 0),Ai=jt.f,Ri=G,Ii=gt("toStringTag"),Ni=function(t,e,n){t&&!n&&(t=t.prototype),t&&!Ri(t,Ii)&&Ai(t,Ii,{configurable:!0,value:e})},Wi=Rn,Yi=jt,zi=function(t,e,n){return n.get&&Wi(n.get,e,{getter:!0}),n.set&&Wi(n.set,e,{setter:!0}),Yi.f(t,e,n)},Fi=Ut,Hi=zi,Bi=_t,Gi=gt("species"),Ui=function(t){var e=Fi(t);Bi&&e&&!e[Gi]&&Hi(e,Gi,{configurable:!0,get:function(){return this}})},qi=qt,Vi=TypeError,Ki=function(t,e){if(qi(e,t))return t;throw new Vi("Incorrect invocation")},Zi=A,Qi=P,Ji=St,Xi=Jn,to=Ue,eo=function(){},no=[],ro=Ut("Reflect","construct"),io=/^\s*(?:class|function)\b/,oo=Zi(io.exec),ao=!io.test(eo),uo=function(t){if(!Ji(t))return!1;try{return ro(eo,no,t),!0}catch(t){return!1}},so=function(t){if(!Ji(t))return!1;switch(Xi(t)){case"AsyncFunction":case"GeneratorFunction":case"AsyncGeneratorFunction":return!1}try{return ao||!!oo(io,to(t))}catch(t){return!0}};so.sham=!0;var co,lo,fo,ho,po=!ro||Qi((function(){var t;return uo(uo.call)||!uo(Object)||!uo((function(){t=!0}))||t}))?so:uo,vo=po,yo=te,mo=TypeError,go=Yt,bo=function(t){if(vo(t))return t;throw new mo(yo(t)+" is not a constructor")},wo=R,xo=gt("species"),Oo=$,ko=Function.prototype,So=ko.apply,jo=ko.call,_o="object"==typeof Reflect&&Reflect.apply||(Oo?jo.bind(So):function(){return jo.apply(So,arguments)}),Mo=Gn,Do=A,Po=function(t){if("Function"===Mo(t))return Do(t)},$o=ie,Eo=$,Lo=Po(Po.bind),To=function(t,e){return $o(t),void 0===e?t:Eo?Lo(t,e):function(){return t.apply(e,arguments)}},Co=Ut("document","documentElement"),Ao=A([].slice),Ro=TypeError,Io=/(?:ipad|iphone|ipod).*applewebkit/i.test(Q),No=m,Wo=_o,Yo=To,zo=St,Fo=G,Ho=P,Bo=Co,Go=Ao,Uo=Tt,qo=function(t,e){if(t<e)throw new Ro("Not enough arguments");return t},Vo=Io,Ko=ji,Zo=No.setImmediate,Qo=No.clearImmediate,Jo=No.process,Xo=No.Dispatch,ta=No.Function,ea=No.MessageChannel,na=No.String,ra=0,ia={},oa="onreadystatechange";Ho((function(){co=No.location}));var aa=function(t){if(Fo(ia,t)){var e=ia[t];delete ia[t],e()}},ua=function(t){return function(){aa(t)}},sa=function(t){aa(t.data)},ca=function(t){No.postMessage(na(t),co.protocol+"//"+co.host)};Zo&&Qo||(Zo=function(t){qo(arguments.length,1);var e=zo(t)?t:ta(t),n=Go(arguments,1);return ia[++ra]=function(){Wo(e,void 0,n)},lo(ra),ra},Qo=function(t){delete ia[t]},Ko?lo=function(t){Jo.nextTick(ua(t))}:Xo&&Xo.now?lo=function(t){Xo.now(ua(t))}:ea&&!Vo?(ho=(fo=new ea).port2,fo.port1.onmessage=sa,lo=Yo(ho.postMessage,ho)):No.addEventListener&&zo(No.postMessage)&&!No.importScripts&&co&&"file:"!==co.protocol&&!Ho(ca)?(lo=ca,No.addEventListener("message",sa,!1)):lo=oa in Uo("script")?function(t){Bo.appendChild(Uo("script"))[oa]=function(){Bo.removeChild(this),aa(t)}}:function(t){setTimeout(ua(t),0)});var la={set:Zo,clear:Qo},fa=function(){this.head=null,this.tail=null};fa.prototype={add:function(t){var e={item:t,next:null},n=this.tail;n?n.next=e:this.head=e,this.tail=e},get:function(){var t=this.head;if(t)return null===(this.head=t.next)&&(this.tail=null),t.item}};var ha,da,pa,va,ya,ma=fa,ga=/ipad|iphone|ipod/i.test(Q)&&"undefined"!=typeof Pebble,ba=/web0s(?!.*chrome)/i.test(Q),wa=m,xa=To,Oa=er.f,ka=la.set,Sa=ma,ja=Io,_a=ga,Ma=ba,Da=ji,Pa=wa.MutationObserver||wa.WebKitMutationObserver,$a=wa.document,Ea=wa.process,La=wa.Promise,Ta=Oa(wa,"queueMicrotask"),Ca=Ta&&Ta.value;if(!Ca){var Aa=new Sa,Ra=function(){var t,e;for(Da&&(t=Ea.domain)&&t.exit();e=Aa.get();)try{e()}catch(t){throw Aa.head&&ha(),t}t&&t.enter()};ja||Da||Ma||!Pa||!$a?!_a&&La&&La.resolve?((va=La.resolve(void 0)).constructor=La,ya=xa(va.then,va),ha=function(){ya(Ra)}):Da?ha=function(){Ea.nextTick(Ra)}:(ka=xa(ka,wa),ha=function(){ka(Ra)}):(da=!0,pa=$a.createTextNode(""),new Pa(Ra).observe(pa,{characterData:!0}),ha=function(){pa.data=da=!da}),Ca=function(t){Aa.head||ha(),Aa.add(t)}}var Ia=Ca,Na=function(t){try{return{error:!1,value:t()}}catch(t){return{error:!0,value:t}}},Wa=m.Promise,Ya="object"==typeof Deno&&Deno&&"object"==typeof Deno.version,za=!Ya&&!ji&&"object"==typeof window&&"object"==typeof document,Fa=m,Ha=Wa,Ba=St,Ga=yi,Ua=Ue,qa=gt,Va=za,Ka=Ya,Za=it;Ha&&Ha.prototype;var Qa=qa("species"),Ja=!1,Xa=Ba(Fa.PromiseRejectionEvent),tu=Ga("Promise",(function(){var t=Ua(Ha),e=t!==String(Ha);if(!e&&66===Za)return!0;if(!Za||Za<51||!/native code/.test(t)){var n=new Ha((function(t){t(1)})),r=function(t){t((function(){}),(function(){}))};if((n.constructor={})[Qa]=r,!(Ja=n.then((function(){}))instanceof r))return!0}return!e&&(Va||Ka)&&!Xa})),eu={CONSTRUCTOR:tu,REJECTION_EVENT:Xa,SUBCLASSING:Ja},nu={},ru=ie,iu=TypeError,ou=function(t){var e,n;this.promise=new t((function(t,r){if(void 0!==e||void 0!==n)throw new iu("Bad Promise constructor");e=t,n=r})),this.resolve=ru(e),this.reject=ru(n)};nu.f=function(t){return new ou(t)};var au,uu,su,cu=Si,lu=ji,fu=m,hu=Ht,du=zn,pu=Ci,vu=Ni,yu=Ui,mu=ie,gu=St,bu=Pt,wu=Ki,xu=function(t,e){var n,r=go(t).constructor;return void 0===r||wo(n=go(r)[xo])?e:bo(n)},Ou=la.set,ku=Ia,Su=function(t,e){try{1===arguments.length?console.error(t):console.error(t,e)}catch(t){}},ju=Na,_u=ma,Mu=gn,Du=Wa,Pu=nu,$u="Promise",Eu=eu.CONSTRUCTOR,Lu=eu.REJECTION_EVENT,Tu=eu.SUBCLASSING,Cu=Mu.getterFor($u),Au=Mu.set,Ru=Du&&Du.prototype,Iu=Du,Nu=Ru,Wu=fu.TypeError,Yu=fu.document,zu=fu.process,Fu=Pu.f,Hu=Fu,Bu=!!(Yu&&Yu.createEvent&&fu.dispatchEvent),Gu="unhandledrejection",Uu=function(t){var e;return!(!bu(t)||!gu(e=t.then))&&e},qu=function(t,e){var n,r,i,o=e.value,a=1===e.state,u=a?t.ok:t.fail,s=t.resolve,c=t.reject,l=t.domain;try{u?(a||(2===e.rejection&&Ju(e),e.rejection=1),!0===u?n=o:(l&&l.enter(),n=u(o),l&&(l.exit(),i=!0)),n===t.promise?c(new Wu("Promise-chain cycle")):(r=Uu(n))?hu(r,n,s,c):s(n)):c(o)}catch(t){l&&!i&&l.exit(),c(t)}},Vu=function(t,e){t.notified||(t.notified=!0,ku((function(){for(var n,r=t.reactions;n=r.get();)qu(n,t);t.notified=!1,e&&!t.rejection&&Zu(t)})))},Ku=function(t,e,n){var r,i;Bu?((r=Yu.createEvent("Event")).promise=e,r.reason=n,r.initEvent(t,!1,!0),fu.dispatchEvent(r)):r={promise:e,reason:n},!Lu&&(i=fu["on"+t])?i(r):t===Gu&&Su("Unhandled promise rejection",n)},Zu=function(t){hu(Ou,fu,(function(){var e,n=t.facade,r=t.value;if(Qu(t)&&(e=ju((function(){lu?zu.emit("unhandledRejection",r,n):Ku(Gu,n,r)})),t.rejection=lu||Qu(t)?2:1,e.error))throw e.value}))},Qu=function(t){return 1!==t.rejection&&!t.parent},Ju=function(t){hu(Ou,fu,(function(){var e=t.facade;lu?zu.emit("rejectionHandled",e):Ku("rejectionhandled",e,t.value)}))},Xu=function(t,e,n){return function(r){t(e,r,n)}},ts=function(t,e,n){t.done||(t.done=!0,n&&(t=n),t.value=e,t.state=2,Vu(t,!0))},es=function(t,e,n){if(!t.done){t.done=!0,n&&(t=n);try{if(t.facade===e)throw new Wu("Promise can't be resolved itself");var r=Uu(e);r?ku((function(){var n={done:!1};try{hu(r,e,Xu(es,n,t),Xu(ts,n,t))}catch(e){ts(n,e,t)}})):(t.value=e,t.state=1,Vu(t,!1))}catch(e){ts({done:!1},e,t)}}};if(Eu&&(Nu=(Iu=function(t){wu(this,Nu),mu(t),hu(au,this);var e=Cu(this);try{t(Xu(es,e),Xu(ts,e))}catch(t){ts(e,t)}}).prototype,(au=function(t){Au(this,{type:$u,done:!1,notified:!1,parent:!1,reactions:new _u,rejection:!1,state:0,value:void 0})}).prototype=du(Nu,"then",(function(t,e){var n=Cu(this),r=Fu(xu(this,Iu));return n.parent=!0,r.ok=!gu(t)||t,r.fail=gu(e)&&e,r.domain=lu?zu.domain:void 0,0===n.state?n.reactions.add(r):ku((function(){qu(r,n)})),r.promise})),uu=function(){var t=new au,e=Cu(t);this.promise=t,this.resolve=Xu(es,e),this.reject=Xu(ts,e)},Pu.f=Fu=function(t){return t===Iu||undefined===t?new uu(t):Hu(t)},gu(Du)&&Ru!==Object.prototype)){su=Ru.then,Tu||du(Ru,"then",(function(t,e){var n=this;return new Iu((function(t,e){hu(su,n,t,e)})).then(t,e)}),{unsafe:!0});try{delete Ru.constructor}catch(t){}pu&&pu(Ru,Nu)}cu({global:!0,constructor:!0,wrap:!0,forced:Eu},{Promise:Iu}),vu(Iu,$u,!1),yu($u);var ns={},rs=ns,is=gt("iterator"),os=Array.prototype,as=function(t){return void 0!==t&&(rs.Array===t||os[is]===t)},us=Jn,ss=ue,cs=R,ls=ns,fs=gt("iterator"),hs=function(t){if(!cs(t))return ss(t,fs)||ss(t,"@@iterator")||ls[us(t)]},ds=Ht,ps=ie,vs=Yt,ys=te,ms=hs,gs=TypeError,bs=function(t,e){var n=arguments.length<2?ms(t):e;if(ps(n))return vs(ds(n,t));throw new gs(ys(t)+" is not iterable")},ws=Ht,xs=Yt,Os=ue,ks=function(t,e,n){var r,i;xs(t);try{if(!(r=Os(t,"return"))){if("throw"===e)throw n;return n}r=ws(r,t)}catch(t){i=!0,r=t}if("throw"===e)throw n;if(i)throw r;return xs(r),n},Ss=To,js=Ht,_s=Yt,Ms=te,Ds=as,Ps=Rr,$s=qt,Es=bs,Ls=hs,Ts=ks,Cs=TypeError,As=function(t,e){this.stopped=t,this.result=e},Rs=As.prototype,Is=function(t,e,n){var r,i,o,a,u,s,c,l=n&&n.that,f=!(!n||!n.AS_ENTRIES),h=!(!n||!n.IS_RECORD),d=!(!n||!n.IS_ITERATOR),p=!(!n||!n.INTERRUPTED),v=Ss(e,l),y=function(t){return r&&Ts(r,"normal",t),new As(!0,t)},m=function(t){return f?(_s(t),p?v(t[0],t[1],y):v(t[0],t[1])):p?v(t,y):v(t)};if(h)r=t.iterator;else if(d)r=t;else{if(!(i=Ls(t)))throw new Cs(Ms(t)+" is not iterable");if(Ds(i)){for(o=0,a=Ps(t);a>o;o++)if((u=m(t[o]))&&$s(Rs,u))return u;return new As(!1)}r=Es(t,i)}for(s=h?t.next:r.next;!(c=js(s,r)).done;){try{u=m(c.value)}catch(t){Ts(r,"throw",t)}if("object"==typeof u&&u&&$s(Rs,u))return u}return new As(!1)},Ns=gt("iterator"),Ws=!1;try{var Ys=0,zs={next:function(){return{done:!!Ys++}},return:function(){Ws=!0}};zs[Ns]=function(){return this},Array.from(zs,(function(){throw 2}))}catch(t){}var Fs=function(t,e){try{if(!e&&!Ws)return!1}catch(t){return!1}var n=!1;try{var r={};r[Ns]=function(){return{next:function(){return{done:n=!0}}}},t(r)}catch(t){}return n},Hs=Wa,Bs=eu.CONSTRUCTOR||!Fs((function(t){Hs.all(t).then(void 0,(function(){}))})),Gs=Ht,Us=ie,qs=nu,Vs=Na,Ks=Is;Si({target:"Promise",stat:!0,forced:Bs},{all:function(t){var e=this,n=qs.f(e),r=n.resolve,i=n.reject,o=Vs((function(){var n=Us(e.resolve),o=[],a=0,u=1;Ks(t,(function(t){var s=a++,c=!1;u++,Gs(n,e,t).then((function(t){c||(c=!0,o[s]=t,--u||r(o))}),i)})),--u||r(o)}));return o.error&&i(o.value),n.promise}});var Zs=Si,Qs=eu.CONSTRUCTOR,Js=Wa,Xs=Ut,tc=St,ec=zn,nc=Js&&Js.prototype;if(Zs({target:"Promise",proto:!0,forced:Qs,real:!0},{catch:function(t){return this.then(void 0,t)}}),tc(Js)){var rc=Xs("Promise").prototype.catch;nc.catch!==rc&&ec(nc,"catch",rc,{unsafe:!0})}var ic=Ht,oc=ie,ac=nu,uc=Na,sc=Is;Si({target:"Promise",stat:!0,forced:Bs},{race:function(t){var e=this,n=ac.f(e),r=n.reject,i=uc((function(){var i=oc(e.resolve);sc(t,(function(t){ic(i,e,t).then(n.resolve,r)}))}));return i.error&&r(i.value),n.promise}});var cc=Ht,lc=nu;Si({target:"Promise",stat:!0,forced:eu.CONSTRUCTOR},{reject:function(t){var e=lc.f(this);return cc(e.reject,void 0,t),e.promise}});var fc=Yt,hc=Pt,dc=nu,pc=Si,vc=eu.CONSTRUCTOR,yc=function(t,e){if(fc(t),hc(e)&&e.constructor===t)return e;var n=dc.f(t);return(0,n.resolve)(e),n.promise};Ut("Promise"),pc({target:"Promise",stat:!0,forced:vc},{resolve:function(t){return yc(this,t)}});var mc={},gc=qr,bc=Vr,wc=Object.keys||function(t){return gc(t,bc)},xc=_t,Oc=Rt,kc=jt,Sc=Yt,jc=dr,_c=wc;mc.f=xc&&!Oc?Object.defineProperties:function(t,e){Sc(t);for(var n,r=jc(e),i=_c(e),o=i.length,a=0;o>a;)kc.f(t,n=i[a++],r[n]);return t};var Mc,Dc=Yt,Pc=mc,$c=Vr,Ec=rn,Lc=Co,Tc=Tt,Cc="prototype",Ac="script",Rc=nn("IE_PROTO"),Ic=function(){},Nc=function(t){return"<"+Ac+">"+t+"</"+Ac+">"},Wc=function(t){t.write(Nc("")),t.close();var e=t.parentWindow.Object;return t=null,e},Yc=function(){try{Mc=new ActiveXObject("htmlfile")}catch(t){}var t,e,n;Yc="undefined"!=typeof document?document.domain&&Mc?Wc(Mc):(e=Tc("iframe"),n="java"+Ac+":",e.style.display="none",Lc.appendChild(e),e.src=String(n),(t=e.contentWindow.document).open(),t.write(Nc("document.F=Object")),t.close(),t.F):Wc(Mc);for(var r=$c.length;r--;)delete Yc[Cc][$c[r]];return Yc()};Ec[Rc]=!0;var zc=Object.create||function(t,e){var n;return null!==t?(Ic[Cc]=Dc(t),n=new Ic,Ic[Cc]=null,n[Rc]=t):n=Yc(),void 0===e?n:Pc.f(n,e)},Fc=gt,Hc=zc,Bc=jt.f,Gc=Fc("unscopables"),Uc=Array.prototype;void 0===Uc[Gc]&&Bc(Uc,Gc,{configurable:!0,value:Hc(null)});var qc,Vc,Kc,Zc=function(t){Uc[Gc][t]=!0},Qc=!P((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype})),Jc=G,Xc=St,tl=F,el=Qc,nl=nn("IE_PROTO"),rl=Object,il=rl.prototype,ol=el?rl.getPrototypeOf:function(t){var e=tl(t);if(Jc(e,nl))return e[nl];var n=e.constructor;return Xc(n)&&e instanceof n?n.prototype:e instanceof rl?il:null},al=P,ul=St,sl=Pt,cl=ol,ll=zn,fl=gt("iterator"),hl=!1;[].keys&&("next"in(Kc=[].keys())?(Vc=cl(cl(Kc)))!==Object.prototype&&(qc=Vc):hl=!0);var dl=!sl(qc)||al((function(){var t={};return qc[fl].call(t)!==t}));dl&&(qc={}),ul(qc[fl])||ll(qc,fl,(function(){return this}));var pl={IteratorPrototype:qc,BUGGY_SAFARI_ITERATORS:hl},vl=pl.IteratorPrototype,yl=zc,ml=Ze,gl=Ni,bl=ns,wl=function(){return this},xl=Si,Ol=Ht,kl=St,Sl=function(t,e,n,r){var i=e+" Iterator";return t.prototype=yl(vl,{next:ml(+!r,n)}),gl(t,i,!1),bl[i]=wl,t},jl=ol,_l=Ci,Ml=Ni,Dl=Xe,Pl=zn,$l=ns,El=We.PROPER,Ll=We.CONFIGURABLE,Tl=pl.IteratorPrototype,Cl=pl.BUGGY_SAFARI_ITERATORS,Al=gt("iterator"),Rl="keys",Il="values",Nl="entries",Wl=function(){return this},Yl=function(t,e,n,r,i,o,a){Sl(n,e,r);var u,s,c,l=function(t){if(t===i&&v)return v;if(!Cl&&t&&t in d)return d[t];switch(t){case Rl:case Il:case Nl:return function(){return new n(this,t)}}return function(){return new n(this)}},f=e+" Iterator",h=!1,d=t.prototype,p=d[Al]||d["@@iterator"]||i&&d[i],v=!Cl&&p||l(i),y="Array"===e&&d.entries||p;if(y&&(u=jl(y.call(new t)))!==Object.prototype&&u.next&&(jl(u)!==Tl&&(_l?_l(u,Tl):kl(u[Al])||Pl(u,Al,Wl)),Ml(u,f,!0)),El&&i===Il&&p&&p.name!==Il&&(Ll?Dl(d,"name",Il):(h=!0,v=function(){return Ol(p,this)})),i)if(s={values:l(Il),keys:o?v:l(Rl),entries:l(Nl)},a)for(c in s)(Cl||h||!(c in d))&&Pl(d,c,s[c]);else xl({target:e,proto:!0,forced:Cl||h},s);return d[Al]!==v&&Pl(d,Al,v,{name:i}),$l[e]=v,s},zl=function(t,e){return{value:t,done:e}},Fl=dr,Hl=Zc,Bl=ns,Gl=gn,Ul=jt.f,ql=Yl,Vl=zl,Kl=_t,Zl="Array Iterator",Ql=Gl.set,Jl=Gl.getterFor(Zl),Xl=ql(Array,"Array",(function(t,e){Ql(this,{type:Zl,target:Fl(t),index:0,kind:e})}),(function(){var t=Jl(this),e=t.target,n=t.index++;if(!e||n>=e.length)return t.target=void 0,Vl(void 0,!0);switch(t.kind){case"keys":return Vl(n,!1);case"values":return Vl(e[n],!1)}return Vl([n,e[n]],!1)}),"values"),tf=Bl.Arguments=Bl.Array;if(Hl("keys"),Hl("values"),Hl("entries"),Kl&&"values"!==tf.name)try{Ul(tf,"name",{value:"values"})}catch(t){}var ef=Ht,nf=ie,rf=nu,of=Na,af=Is;Si({target:"Promise",stat:!0,forced:Bs},{allSettled:function(t){var e=this,n=rf.f(e),r=n.resolve,i=n.reject,o=of((function(){var n=nf(e.resolve),i=[],o=0,a=1;af(t,(function(t){var u=o++,s=!1;a++,ef(n,e,t).then((function(t){s||(s=!0,i[u]={status:"fulfilled",value:t},--a||r(i))}),(function(t){s||(s=!0,i[u]={status:"rejected",reason:t},--a||r(i))}))})),--a||r(i)}));return o.error&&i(o.value),n.promise}});var uf=Jn,sf=String,cf=function(t){if("Symbol"===uf(t))throw new TypeError("Cannot convert a Symbol value to a string");return sf(t)},lf=A,ff=Mr,hf=cf,df=W,pf=lf("".charAt),vf=lf("".charCodeAt),yf=lf("".slice),mf=function(t){return function(e,n){var r,i,o=hf(df(e)),a=ff(n),u=o.length;return a<0||a>=u?t?"":void 0:(r=vf(o,a))<55296||r>56319||a+1===u||(i=vf(o,a+1))<56320||i>57343?t?pf(o,a):r:t?yf(o,a,a+2):i-56320+(r-55296<<10)+65536}},gf={codeAt:mf(!1),charAt:mf(!0)},bf=gf.charAt,wf=cf,xf=gn,Of=Yl,kf=zl,Sf="String Iterator",jf=xf.set,_f=xf.getterFor(Sf);Of(String,"String",(function(t){jf(this,{type:Sf,string:wf(t),index:0})}),(function(){var t,e=_f(this),n=e.string,r=e.index;return r>=n.length?kf(void 0,!0):(t=bf(n,r),e.index+=t.length,kf(t,!1))}));var Mf={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},Df=Tt("span").classList,Pf=Df&&Df.constructor&&Df.constructor.prototype,$f=Pf===Object.prototype?void 0:Pf,Ef=m,Lf=Mf,Tf=$f,Cf=Xl,Af=Xe,Rf=Ni,If=gt("iterator"),Nf=Cf.values,Wf=function(t,e){if(t){if(t[If]!==Nf)try{Af(t,If,Nf)}catch(e){t[If]=Nf}if(Rf(t,e,!0),Lf[e])for(var n in Cf)if(t[n]!==Cf[n])try{Af(t,n,Cf[n])}catch(e){t[n]=Cf[n]}}};for(var Yf in Lf)Wf(Ef[Yf]&&Ef[Yf].prototype,Yf);Wf(Tf,"DOMTokenList");var zf=F,Ff=Er,Hf=Rr,Bf=function(t){for(var e=zf(this),n=Hf(e),r=arguments.length,i=Ff(r>1?arguments[1]:void 0,n),o=r>2?arguments[2]:void 0,a=void 0===o?n:Ff(o,n);a>i;)e[i++]=t;return e},Gf=Zc;Si({target:"Array",proto:!0},{fill:Bf}),Gf("fill");var Uf=Gn,qf=Array.isArray||function(t){return"Array"===Uf(t)},Vf=xe,Kf=jt,Zf=Ze,Qf=function(t,e,n){var r=Vf(e);r in t?Kf.f(t,r,Zf(0,n)):t[r]=n},Jf=P,Xf=it,th=gt("species"),eh=function(t){return Xf>=51||!Jf((function(){var e=[];return(e.constructor={})[th]=function(){return{foo:1}},1!==e[t](Boolean).foo}))},nh=Si,rh=qf,ih=po,oh=Pt,ah=Er,uh=Rr,sh=dr,ch=Qf,lh=gt,fh=Ao,hh=eh("slice"),dh=lh("species"),ph=Array,vh=Math.max;function yh(t,e,n,r){return new(n||(n=Promise))((function(i,o){function a(t){try{s(r.next(t))}catch(t){o(t)}}function u(t){try{s(r.throw(t))}catch(t){o(t)}}function s(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(a,u)}s((r=r.apply(t,e||[])).next())}))}function mh(t,e,n,r){if("a"===n&&!r)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof e?t!==e||!r:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===n?r:"a"===n?r.call(t):r?r.value:e.get(t)}nh({target:"Array",proto:!0,forced:!hh},{slice:function(t,e){var n,r,i,o=sh(this),a=uh(o),u=ah(t,a),s=ah(void 0===e?a:e,a);if(rh(o)&&(n=o.constructor,(ih(n)&&(n===ph||rh(n.prototype))||oh(n)&&null===(n=n[dh]))&&(n=void 0),n===ph||void 0===n))return fh(o,u,s);for(r=new(void 0===n?ph:n)(vh(s-u,0)),i=0;u<s;u++,i++)u in o&&ch(r,i,o[u]);return r.length=i,r}});var gh={exports:{}};!function(t){var e=Object.prototype.hasOwnProperty,n="~";function r(){}function i(t,e,n){this.fn=t,this.context=e,this.once=n||!1}function o(t,e,r,o,a){if("function"!=typeof r)throw new TypeError("The listener must be a function");var u=new i(r,o||t,a),s=n?n+e:e;return t._events[s]?t._events[s].fn?t._events[s]=[t._events[s],u]:t._events[s].push(u):(t._events[s]=u,t._eventsCount++),t}function a(t,e){0==--t._eventsCount?t._events=new r:delete t._events[e]}function u(){this._events=new r,this._eventsCount=0}Object.create&&(r.prototype=Object.create(null),(new r).__proto__||(n=!1)),u.prototype.eventNames=function(){var t,r,i=[];if(0===this._eventsCount)return i;for(r in t=this._events)e.call(t,r)&&i.push(n?r.slice(1):r);return Object.getOwnPropertySymbols?i.concat(Object.getOwnPropertySymbols(t)):i},u.prototype.listeners=function(t){var e=n?n+t:t,r=this._events[e];if(!r)return[];if(r.fn)return[r.fn];for(var i=0,o=r.length,a=new Array(o);i<o;i++)a[i]=r[i].fn;return a},u.prototype.listenerCount=function(t){var e=n?n+t:t,r=this._events[e];return r?r.fn?1:r.length:0},u.prototype.emit=function(t,e,r,i,o,a){var u=n?n+t:t;if(!this._events[u])return!1;var s,c,l=this._events[u],f=arguments.length;if(l.fn){switch(l.once&&this.removeListener(t,l.fn,void 0,!0),f){case 1:return l.fn.call(l.context),!0;case 2:return l.fn.call(l.context,e),!0;case 3:return l.fn.call(l.context,e,r),!0;case 4:return l.fn.call(l.context,e,r,i),!0;case 5:return l.fn.call(l.context,e,r,i,o),!0;case 6:return l.fn.call(l.context,e,r,i,o,a),!0}for(c=1,s=new Array(f-1);c<f;c++)s[c-1]=arguments[c];l.fn.apply(l.context,s)}else{var h,d=l.length;for(c=0;c<d;c++)switch(l[c].once&&this.removeListener(t,l[c].fn,void 0,!0),f){case 1:l[c].fn.call(l[c].context);break;case 2:l[c].fn.call(l[c].context,e);break;case 3:l[c].fn.call(l[c].context,e,r);break;case 4:l[c].fn.call(l[c].context,e,r,i);break;default:if(!s)for(h=1,s=new Array(f-1);h<f;h++)s[h-1]=arguments[h];l[c].fn.apply(l[c].context,s)}}return!0},u.prototype.on=function(t,e,n){return o(this,t,e,n,!1)},u.prototype.once=function(t,e,n){return o(this,t,e,n,!0)},u.prototype.removeListener=function(t,e,r,i){var o=n?n+t:t;if(!this._events[o])return this;if(!e)return a(this,o),this;var u=this._events[o];if(u.fn)u.fn!==e||i&&!u.once||r&&u.context!==r||a(this,o);else{for(var s=0,c=[],l=u.length;s<l;s++)(u[s].fn!==e||i&&!u[s].once||r&&u[s].context!==r)&&c.push(u[s]);c.length?this._events[o]=1===c.length?c[0]:c:a(this,o)}return this},u.prototype.removeAllListeners=function(t){var e;return t?(e=n?n+t:t,this._events[e]&&a(this,e)):(this._events=new r,this._eventsCount=0),this},u.prototype.off=u.prototype.removeListener,u.prototype.addListener=u.prototype.on,u.prefixed=n,u.EventEmitter=u,t.exports=u}(gh);var bh=v(gh.exports),wh=Array.isArray;function xh(){if(!arguments.length)return[];var t=arguments[0];return wh(t)?t:[t]}var Oh=qf,kh=po,Sh=Pt,jh=gt("species"),_h=Array,Mh=function(t){var e;return Oh(t)&&(e=t.constructor,(kh(e)&&(e===_h||Oh(e.prototype))||Sh(e)&&null===(e=e[jh]))&&(e=void 0)),void 0===e?_h:e},Dh=function(t,e){return new(Mh(t))(0===e?0:e)},Ph=To,$h=lr,Eh=F,Lh=Rr,Th=Dh,Ch=A([].push),Ah=function(t){var e=1===t,n=2===t,r=3===t,i=4===t,o=6===t,a=7===t,u=5===t||o;return function(s,c,l,f){for(var h,d,p=Eh(s),v=$h(p),y=Lh(v),m=Ph(c,l),g=0,b=f||Th,w=e?b(s,y):n||a?b(s,0):void 0;y>g;g++)if((u||g in v)&&(d=m(h=v[g],g,p),t))if(e)w[g]=d;else if(d)switch(t){case 3:return!0;case 5:return h;case 6:return g;case 2:Ch(w,h)}else switch(t){case 4:return!1;case 7:Ch(w,h)}return o?-1:r||i?i:w}},Rh={forEach:Ah(0),map:Ah(1),filter:Ah(2),some:Ah(3),every:Ah(4),find:Ah(5),findIndex:Ah(6),filterReject:Ah(7)},Ih=Rh.map;Si({target:"Array",proto:!0,forced:!eh("map")},{map:function(t){return Ih(this,t,arguments.length>1?arguments[1]:void 0)}});var Nh=_t,Wh=A,Yh=Ht,zh=P,Fh=wc,Hh=Qr,Bh=nr,Gh=F,Uh=lr,qh=Object.assign,Vh=Object.defineProperty,Kh=Wh([].concat),Zh=!qh||zh((function(){if(Nh&&1!==qh({b:1},qh(Vh({},"a",{enumerable:!0,get:function(){Vh(this,"b",{value:3,enumerable:!1})}}),{b:2})).b)return!0;var t={},e={},n=Symbol("assign detection"),r="abcdefghijklmnopqrst";return t[n]=7,r.split("").forEach((function(t){e[t]=t})),7!==qh({},t)[n]||Fh(qh({},e)).join("")!==r}))?function(t,e){for(var n=Gh(t),r=arguments.length,i=1,o=Hh.f,a=Bh.f;r>i;)for(var u,s=Uh(arguments[i++]),c=o?Kh(Fh(s),o(s)):Fh(s),l=c.length,f=0;l>f;)u=c[f++],Nh&&!Yh(a,s,u)||(n[u]=s[u]);return n}:qh,Qh=Zh;Si({target:"Object",stat:!0,arity:2,forced:Object.assign!==Qh},{assign:Qh});var Jh={exports:{}},Xh={},td=Er,ed=Rr,nd=Qf,rd=Array,id=Math.max,od=function(t,e,n){for(var r=ed(t),i=td(e,r),o=td(void 0===n?r:n,r),a=rd(id(o-i,0)),u=0;i<o;i++,u++)nd(a,u,t[i]);return a.length=u,a},ad=Gn,ud=dr,sd=kr.f,cd=od,ld="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];Xh.f=function(t){return ld&&"Window"===ad(t)?function(t){try{return sd(t)}catch(t){return cd(ld)}}(t):sd(ud(t))};var fd=P((function(){if("function"==typeof ArrayBuffer){var t=new ArrayBuffer(8);Object.isExtensible(t)&&Object.defineProperty(t,"a",{value:8})}})),hd=P,dd=Pt,pd=Gn,vd=fd,yd=Object.isExtensible,md=hd((function(){yd(1)}))||vd?function(t){return!!dd(t)&&((!vd||"ArrayBuffer"!==pd(t))&&(!yd||yd(t)))}:yd,gd=!P((function(){return Object.isExtensible(Object.preventExtensions({}))})),bd=Si,wd=A,xd=rn,Od=Pt,kd=G,Sd=jt.f,jd=kr,_d=Xh,Md=md,Dd=gd,Pd=!1,$d=Z("meta"),Ed=0,Ld=function(t){Sd(t,$d,{value:{objectID:"O"+Ed++,weakData:{}}})},Td=Jh.exports={enable:function(){Td.enable=function(){},Pd=!0;var t=jd.f,e=wd([].splice),n={};n[$d]=1,t(n).length&&(jd.f=function(n){for(var r=t(n),i=0,o=r.length;i<o;i++)if(r[i]===$d){e(r,i,1);break}return r},bd({target:"Object",stat:!0,forced:!0},{getOwnPropertyNames:_d.f}))},fastKey:function(t,e){if(!Od(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!kd(t,$d)){if(!Md(t))return"F";if(!e)return"E";Ld(t)}return t[$d].objectID},getWeakData:function(t,e){if(!kd(t,$d)){if(!Md(t))return!0;if(!e)return!1;Ld(t)}return t[$d].weakData},onFreeze:function(t){return Dd&&Pd&&Md(t)&&!kd(t,$d)&&Ld(t),t}};xd[$d]=!0;var Cd=Jh.exports,Ad=St,Rd=Pt,Id=Ci,Nd=Si,Wd=m,Yd=A,zd=yi,Fd=zn,Hd=Cd,Bd=Is,Gd=Ki,Ud=St,qd=R,Vd=Pt,Kd=P,Zd=Fs,Qd=Ni,Jd=function(t,e,n){var r,i;return Id&&Ad(r=e.constructor)&&r!==n&&Rd(i=r.prototype)&&i!==n.prototype&&Id(t,i),t},Xd=function(t,e,n){var r=-1!==t.indexOf("Map"),i=-1!==t.indexOf("Weak"),o=r?"set":"add",a=Wd[t],u=a&&a.prototype,s=a,c={},l=function(t){var e=Yd(u[t]);Fd(u,t,"add"===t?function(t){return e(this,0===t?0:t),this}:"delete"===t?function(t){return!(i&&!Vd(t))&&e(this,0===t?0:t)}:"get"===t?function(t){return i&&!Vd(t)?void 0:e(this,0===t?0:t)}:"has"===t?function(t){return!(i&&!Vd(t))&&e(this,0===t?0:t)}:function(t,n){return e(this,0===t?0:t,n),this})};if(zd(t,!Ud(a)||!(i||u.forEach&&!Kd((function(){(new a).entries().next()})))))s=n.getConstructor(e,t,r,o),Hd.enable();else if(zd(t,!0)){var f=new s,h=f[o](i?{}:-0,1)!==f,d=Kd((function(){f.has(1)})),p=Zd((function(t){new a(t)})),v=!i&&Kd((function(){for(var t=new a,e=5;e--;)t[o](e,e);return!t.has(-0)}));p||((s=e((function(t,e){Gd(t,u);var n=Jd(new a,t,s);return qd(e)||Bd(e,n[o],{that:n,AS_ENTRIES:r}),n}))).prototype=u,u.constructor=s),(d||v)&&(l("delete"),l("has"),r&&l("get")),(v||h)&&l(o),i&&u.clear&&delete u.clear}return c[t]=s,Nd({global:!0,constructor:!0,forced:s!==a},c),Qd(s,t),i||n.setStrong(s,t,r),s},tp=zn,ep=function(t,e,n){for(var r in e)tp(t,r,e[r],n);return t},np=A,rp=ep,ip=Cd.getWeakData,op=Ki,ap=Yt,up=R,sp=Pt,cp=Is,lp=G,fp=gn.set,hp=gn.getterFor,dp=Rh.find,pp=Rh.findIndex,vp=np([].splice),yp=0,mp=function(t){return t.frozen||(t.frozen=new gp)},gp=function(){this.entries=[]},bp=function(t,e){return dp(t.entries,(function(t){return t[0]===e}))};gp.prototype={get:function(t){var e=bp(this,t);if(e)return e[1]},has:function(t){return!!bp(this,t)},set:function(t,e){var n=bp(this,t);n?n[1]=e:this.entries.push([t,e])},delete:function(t){var e=pp(this.entries,(function(e){return e[0]===t}));return~e&&vp(this.entries,e,1),!!~e}};var wp,xp,Op={getConstructor:function(t,e,n,r){var i=t((function(t,i){op(t,o),fp(t,{type:e,id:yp++,frozen:void 0}),up(i)||cp(i,t[r],{that:t,AS_ENTRIES:n})})),o=i.prototype,a=hp(e),u=function(t,e,n){var r=a(t),i=ip(ap(e),!0);return!0===i?mp(r).set(e,n):i[r.id]=n,t};return rp(o,{delete:function(t){var e=a(this);if(!sp(t))return!1;var n=ip(t);return!0===n?mp(e).delete(t):n&&lp(n,e.id)&&delete n[e.id]},has:function(t){var e=a(this);if(!sp(t))return!1;var n=ip(t);return!0===n?mp(e).has(t):n&&lp(n,e.id)}}),rp(o,n?{get:function(t){var e=a(this);if(sp(t)){var n=ip(t);return!0===n?mp(e).get(t):n?n[e.id]:void 0}},set:function(t,e){return u(this,t,e)}}:{add:function(t){return u(this,t,!0)}}),i}};Xd("WeakSet",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),Op),function(t){t[t.SCROLL_NONE=0]="SCROLL_NONE",t[t.SCROLL_BACKWARD=1]="SCROLL_BACKWARD",t[t.SCROLL_FORWARD=2]="SCROLL_FORWARD"}(wp||(wp={})),function(t){t[t.TOP=0]="TOP",t[t.RIGHT=1]="RIGHT",t[t.BOTTOM=2]="BOTTOM",t[t.LEFT=3]="LEFT"}(xp||(xp={}));var kp,Sp,jp,_p="red",Mp=[0,100],Dp=function(){function t(e){a(this,t),kp.add(this),this.calendar=e,this.maxDomainReached=!1,this.minDomainReached=!1}return s(t,[{key:"loadNewDomains",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:wp.SCROLL_NONE,r=this.calendar.options.options,i=this.calendar.templateCollection,o=r.date.min?i.get(r.domain.type).extractUnit(+r.date.min):void 0,a=r.date.max?i.get(r.domain.type).extractUnit(+r.date.max):void 0,u=this.calendar.domainCollection;return mh(this,kp,"m",Sp).call(this,t,o,a,n)?wp.SCROLL_NONE:(n!==wp.SCROLL_NONE&&t.clamp(o,a).slice(r.range,n===wp.SCROLL_FORWARD),u.merge(t,r.range,(function(n,o){var a=null;return a=t.at(o+1)?t.at(o+1):e.calendar.dateHelper.intervals(r.domain.type,n,2).pop(),i.get(r.subDomain.type).mapping(n,a).map((function(t){return Object.assign(Object.assign({},t),{v:r.data.defaultValue})}))})),mh(this,kp,"m",jp).call(this,u.min,u.max,o,a),n===wp.SCROLL_BACKWARD?this.calendar.eventEmitter.emit("domainsLoaded",[u.min]):n===wp.SCROLL_FORWARD&&this.calendar.eventEmitter.emit("domainsLoaded",[u.max]),n)}},{key:"jumpTo",value:function(t,e){var n=this.calendar,r=n.domainCollection,i=n.options,o=new Date(r.min),a=new Date(r.max);return t<o?this.loadNewDomains(this.calendar.createDomainCollection(t,o,!1),wp.SCROLL_BACKWARD):e?this.loadNewDomains(this.calendar.createDomainCollection(t,i.options.range),o<t?wp.SCROLL_FORWARD:wp.SCROLL_BACKWARD):t>a?this.loadNewDomains(this.calendar.createDomainCollection(a,t,!1),wp.SCROLL_FORWARD):wp.SCROLL_NONE}}]),t}();kp=new WeakSet,Sp=function(t,e,n,r){return!!(n&&t.max>=n&&this.maxDomainReached&&r===wp.SCROLL_FORWARD)||!!(e&&t.min<=e&&this.minDomainReached&&r===wp.SCROLL_BACKWARD)},jp=function(t,e,n,r){if(n){var i=t<=n;this.calendar.eventEmitter.emit(i?"minDateReached":"minDateNotReached"),this.minDomainReached=i}if(r){var o=e>=r;this.calendar.eventEmitter.emit(o?"maxDateReached":"maxDateNotReached"),this.maxDomainReached=o}};var Pp=TypeError,$p=Si,Ep=P,Lp=qf,Tp=Pt,Cp=F,Ap=Rr,Rp=function(t){if(t>9007199254740991)throw Pp("Maximum allowed index exceeded");return t},Ip=Qf,Np=Dh,Wp=eh,Yp=it,zp=gt("isConcatSpreadable"),Fp=Yp>=51||!Ep((function(){var t=[];return t[zp]=!1,t.concat()[0]!==t})),Hp=function(t){if(!Tp(t))return!1;var e=t[zp];return void 0!==e?!!e:Lp(t)};$p({target:"Array",proto:!0,arity:1,forced:!Fp||!Wp("concat")},{concat:function(t){var e,n,r,i,o,a=Cp(this),u=Np(a,0),s=0;for(e=-1,r=arguments.length;e<r;e++)if(Hp(o=-1===e?a:arguments[e]))for(i=Ap(o),Rp(s+i),n=0;n<i;n++,s++)n in o&&Ip(u,s,o[n]);else Rp(s+1),Ip(u,s++,o);return u.length=s,u}});var Bp=P,Gp=function(t,e){var n=[][t];return!!n&&Bp((function(){n.call(null,e||function(){return 1},1)}))},Up=Si,qp=lr,Vp=dr,Kp=Gp,Zp=A([].join);Up({target:"Array",proto:!0,forced:qp!==Object||!Kp("join",",")},{join:function(t){return Zp(Vp(this),void 0===t?",":t)}});var Qp=zc,Jp=zi,Xp=ep,tv=To,ev=Ki,nv=R,rv=Is,iv=Yl,ov=zl,av=Ui,uv=_t,sv=Cd.fastKey,cv=gn.set,lv=gn.getterFor,fv={getConstructor:function(t,e,n,r){var i=t((function(t,i){ev(t,o),cv(t,{type:e,index:Qp(null),first:void 0,last:void 0,size:0}),uv||(t.size=0),nv(i)||rv(i,t[r],{that:t,AS_ENTRIES:n})})),o=i.prototype,a=lv(e),u=function(t,e,n){var r,i,o=a(t),u=s(t,e);return u?u.value=n:(o.last=u={index:i=sv(e,!0),key:e,value:n,previous:r=o.last,next:void 0,removed:!1},o.first||(o.first=u),r&&(r.next=u),uv?o.size++:t.size++,"F"!==i&&(o.index[i]=u)),t},s=function(t,e){var n,r=a(t),i=sv(e);if("F"!==i)return r.index[i];for(n=r.first;n;n=n.next)if(n.key===e)return n};return Xp(o,{clear:function(){for(var t=a(this),e=t.index,n=t.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete e[n.index],n=n.next;t.first=t.last=void 0,uv?t.size=0:this.size=0},delete:function(t){var e=this,n=a(e),r=s(e,t);if(r){var i=r.next,o=r.previous;delete n.index[r.index],r.removed=!0,o&&(o.next=i),i&&(i.previous=o),n.first===r&&(n.first=i),n.last===r&&(n.last=o),uv?n.size--:e.size--}return!!r},forEach:function(t){for(var e,n=a(this),r=tv(t,arguments.length>1?arguments[1]:void 0);e=e?e.next:n.first;)for(r(e.value,e.key,this);e&&e.removed;)e=e.previous},has:function(t){return!!s(this,t)}}),Xp(o,n?{get:function(t){var e=s(this,t);return e&&e.value},set:function(t,e){return u(this,0===t?0:t,e)}}:{add:function(t){return u(this,t=0===t?0:t,t)}}),uv&&Jp(o,"size",{configurable:!0,get:function(){return a(this).size}}),i},setStrong:function(t,e,n){var r=e+" Iterator",i=lv(e),o=lv(r);iv(t,e,(function(t,e){cv(this,{type:r,target:t,state:i(t),kind:e,last:void 0})}),(function(){for(var t=o(this),e=t.kind,n=t.last;n&&n.removed;)n=n.previous;return t.target&&(t.last=n=n?n.next:t.state.first)?ov("keys"===e?n.key:"values"===e?n.value:[n.key,n.value],!1):(t.target=void 0,ov(void 0,!0))}),n?"entries":"values",!n,!0),av(e)}};Xd("Map",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),fv);var hv=te,dv=TypeError,pv=od,vv=Math.floor,yv=function(t,e){var n=t.length,r=vv(n/2);return n<8?mv(t,e):gv(t,yv(pv(t,0,r),e),yv(pv(t,r),e),e)},mv=function(t,e){for(var n,r,i=t.length,o=1;o<i;){for(r=o,n=t[o];r&&e(t[r-1],n)>0;)t[r]=t[--r];r!==o++&&(t[r]=n)}return t},gv=function(t,e,n,r){for(var i=e.length,o=n.length,a=0,u=0;a<i||u<o;)t[a+u]=a<i&&u<o?r(e[a],n[u])<=0?e[a++]:n[u++]:a<i?e[a++]:n[u++];return t},bv=yv,wv=Q.match(/firefox\/(\d+)/i),xv=!!wv&&+wv[1],Ov=/MSIE|Trident/.test(Q),kv=Q.match(/AppleWebKit\/(\d+)\./),Sv=!!kv&&+kv[1],jv=Si,_v=A,Mv=ie,Dv=F,Pv=Rr,$v=function(t,e){if(!delete t[e])throw new dv("Cannot delete property "+hv(e)+" of "+hv(t))},Ev=cf,Lv=P,Tv=bv,Cv=Gp,Av=xv,Rv=Ov,Iv=it,Nv=Sv,Wv=[],Yv=_v(Wv.sort),zv=_v(Wv.push),Fv=Lv((function(){Wv.sort(void 0)})),Hv=Lv((function(){Wv.sort(null)})),Bv=Cv("sort"),Gv=!Lv((function(){if(Iv)return Iv<70;if(!(Av&&Av>3)){if(Rv)return!0;if(Nv)return Nv<603;var t,e,n,r,i="";for(t=65;t<76;t++){switch(e=String.fromCharCode(t),t){case 66:case 69:case 70:case 72:n=3;break;case 68:case 71:n=4;break;default:n=2}for(r=0;r<47;r++)Wv.push({k:e+r,v:n})}for(Wv.sort((function(t,e){return e.v-t.v})),r=0;r<Wv.length;r++)e=Wv[r].k.charAt(0),i.charAt(i.length-1)!==e&&(i+=e);return"DGBEFHACIJK"!==i}}));jv({target:"Array",proto:!0,forced:Fv||!Hv||!Bv||!Gv},{sort:function(t){void 0!==t&&Mv(t);var e=Dv(this);if(Gv)return void 0===t?Yv(e):Yv(e,t);var n,r,i=[],o=Pv(e);for(r=0;r<o;r++)r in e&&zv(i,e[r]);for(Tv(i,function(t){return function(e,n){return void 0===n?-1:void 0===e?1:void 0!==t?+t(e,n)||0:Ev(e)>Ev(n)?1:-1}}(t)),n=Pv(i),r=0;r<n;)e[r]=i[r++];for(;r<o;)$v(e,r++);return e}});var Uv,qv,Vv,Kv=Rh.forEach,Zv=Gp("forEach")?[].forEach:function(t){return Kv(this,t,arguments.length>1?arguments[1]:void 0)},Qv=m,Jv=Mf,Xv=$f,ty=Zv,ey=Xe,ny=function(t){if(t&&t.forEach!==ty)try{ey(t,"forEach",ty)}catch(e){t.forEach=ty}};for(var ry in Jv)Jv[ry]&&ny(Qv[ry]&&Qv[ry].prototype);function iy(t){return"top"===t||"bottom"===t}function oy(t){return t[xp.LEFT]+t[xp.RIGHT]}function ay(t){return t[xp.TOP]+t[xp.BOTTOM]}ny(Xv);var uy,sy,cy=function(){function t(e,n){a(this,t),Uv.add(this),this.calendar=e,this.domainPainter=n,this.collection=new Map,this.scrollDirection=wp.SCROLL_FORWARD}return s(t,[{key:"get",value:function(t){return this.collection.get(t)}},{key:"update",value:function(t,e){var n=this,r=this.calendar.options.options,i=r.verticalOrientation,o=r.domain;this.scrollDirection=e;var a={width:0,height:0},u=0,s=e===wp.SCROLL_FORWARD?-1:1,c=t.keys;return"desc"===this.calendar.options.options.domain.sort&&(c.reverse(),s*=-1),t.yankedDomains.forEach((function(t){u+=n.collection.get(t)[i?"height":"width"]})),t.yankedDomains.forEach((function(t){var e=n.collection.get(t);n.collection.set(t,Object.assign(Object.assign({},e),{x:i?e.x:e.x+u*s,y:i?e.y+u*s:e.y}))})),c.forEach((function(t){var e=mh(n,Uv,"m",qv).call(n,t),r=mh(n,Uv,"m",Vv).call(n,t);i?(a.height+=r,a.width=Math.max(e,a.width)):(a.width+=e,a.height=Math.max(r,a.height));var c=a.width-e,l=a.height-r;n.collection.set(t,Object.assign(Object.assign({},n.collection.get(t)),{x:i?0:c,y:i?l:0,pre_x:i?c:c-u*s,pre_y:i?l-u*s:l,width:e,height:r,inner_width:e-(i?0:o.gutter),inner_height:r-(i?o.gutter:0)}))})),a}}]),t}();Uv=new WeakSet,qv=function(t){var e=this.calendar.options.options,n=e.domain,r=e.subDomain,i=e.x,o=e.verticalOrientation,a=this.calendar.templateCollection.get(r.type).columnsCount(t),u=(r.width+r.gutter)*a-r.gutter;return oy(n.padding)+i.domainHorizontalLabelWidth+(o?0:n.gutter)+u},Vv=function(t){var e=this.calendar.options.options,n=e.domain,r=e.subDomain,i=e.x,o=e.verticalOrientation,a=this.calendar.templateCollection.get(r.type).rowsCount(t),u=(r.height+r.gutter)*a-r.gutter;return ay(n.padding)+u+(o?n.gutter:0)+i.domainVerticalLabelHeight};var ly=".ch-domain",fy=function(){function t(e){a(this,t),uy.add(this),this.calendar=e,this.coordinates=new cy(e,this),this.root=null,this.dimensions={width:0,height:0}}return s(t,[{key:"paint",value:function(t,e){var n=this,r=this.calendar.options.options.animationDuration,i=e.transition().duration(r),o=this.coordinates;this.dimensions=o.update(this.calendar.domainCollection,t);var a=[];return this.root=e.selectAll(ly).data(this.calendar.domainCollection.keys,(function(t){return t})).join((function(t){return t.append("svg").attr("x",(function(t){return o.get(t).pre_x})).attr("y",(function(t){return o.get(t).pre_y})).attr("width",(function(t){return o.get(t).inner_width})).attr("height",(function(t){return o.get(t).inner_height})).attr("class",(function(t){return mh(n,uy,"m",sy).call(n,t)})).call((function(t){return t.append("rect").attr("width",(function(t){return o.get(t).inner_width})).attr("height",(function(t){return o.get(t).inner_height})).attr("class","".concat(ly.slice(1),"-bg"))})).call((function(t){return a.push(t.transition(i).attr("x",(function(t){return o.get(t).x})).attr("y",(function(t){return o.get(t).y})).end())}))}),(function(t){return t.call((function(t){return a.push(t.transition(i).attr("x",(function(t){return o.get(t).x})).attr("y",(function(t){return o.get(t).y})).attr("width",(function(t){return o.get(t).inner_width})).attr("height",(function(t){return o.get(t).inner_height})).end())})).call((function(t){return a.push(t.selectAll("".concat(ly,"-bg")).transition(i).attr("width",(function(t){return o.get(t).inner_width})).attr("height",(function(t){return o.get(t).inner_height})).end())}))}),(function(t){return t.call((function(t){return a.push(t.transition(i).attr("x",(function(t){return o.get(t).x})).attr("y",(function(t){return o.get(t).y})).remove().end())}))})),a}}]),t}();uy=new WeakSet,sy=function(t){var e=ly.slice(1),n=this.calendar.dateHelper.date(t);switch(this.calendar.options.options.domain.type){case"hour":e+=" h_".concat(n.hour());break;case"day":e+=" d_".concat(n.date()," dy_").concat(n.format("d")+1);break;case"week":e+=" w_".concat(n.week());break;case"month":e+=" m_".concat(n.month()+1);break;case"year":e+=" y_".concat(n.year())}return e};var hy=zr.includes,dy=Zc;Si({target:"Array",proto:!0,forced:P((function(){return!Array(1).includes()}))},{includes:function(t){return hy(this,t,arguments.length>1?arguments[1]:void 0)}}),dy("includes");var py=Rh.filter;Si({target:"Array",proto:!0,forced:!eh("filter")},{filter:function(t){return py(this,t,arguments.length>1?arguments[1]:void 0)}});var vy,yy,my,gy,by=Yt,wy=ks,xy=To,Oy=Ht,ky=F,Sy=function(t,e,n,r){try{return r?e(by(n)[0],n[1]):e(n)}catch(e){wy(t,"throw",e)}},jy=as,_y=po,My=Rr,Dy=Qf,Py=bs,$y=hs,Ey=Array,Ly=function(t){var e=ky(t),n=_y(this),r=arguments.length,i=r>1?arguments[1]:void 0,o=void 0!==i;o&&(i=xy(i,r>2?arguments[2]:void 0));var a,u,s,c,l,f,h=$y(e),d=0;if(!h||this===Ey&&jy(h))for(a=My(e),u=n?new this(a):Ey(a);a>d;d++)f=o?i(e[d],d):e[d],Dy(u,d,f);else for(l=(c=Py(e,h)).next,u=n?new this:[];!(s=Oy(l,c)).done;d++)f=o?Sy(c,i,[s.value,d],!0):s.value,Dy(u,d,f);return u.length=d,u};Si({target:"Array",stat:!0,forced:!Fs((function(t){Array.from(t)}))},{from:Ly});var Ty,Cy,Ay,Ry,Iy,Ny,Wy,Yy={year:"YYYY",month:"MMMM",week:"wo [week] YYYY",xDay:"Do MMM",ghDay:"Do MMM",day:"Do MMM",hour:"HH:00",minute:"HH:mm"},zy=function(){function t(e,n,r,i){var o=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(a(this,t),vy.add(this),this.collection=new Map,this.dateHelper=e,n&&r&&i){var u=this.dateHelper.intervals(n,r,i,o).map((function(t){return xh(t)}));this.collection=new Map(u)}this.min=0,this.max=0,this.keys=[],this.yankedDomains=[],this.collection.size>0&&mh(this,vy,"m",gy).call(this)}return s(t,[{key:"has",value:function(t){return this.collection.has(t)}},{key:"get",value:function(t){return this.collection.get(t)}},{key:"forEach",value:function(t){return this.collection.forEach(t)}},{key:"at",value:function(t){return this.keys[t]}},{key:"clamp",value:function(t,e){var n=this;return t&&this.min<t&&this.keys.filter((function(e){return e<t})).forEach((function(t){return n.collection.delete(t)})),e&&this.max>e&&this.keys.filter((function(t){return t>e})).forEach((function(t){return n.collection.delete(t)})),mh(this,vy,"m",gy).call(this),this}},{key:"merge",value:function(t,e,n){var r=this;this.yankedDomains=[],t.keys.forEach((function(t,i){if(!r.has(t)){if(r.collection.size>=e){var o=r.max;t>r.max&&(o=r.min),o&&r.collection.delete(o)&&r.yankedDomains.push(o)}r.collection.set(t,n(t,i)),mh(r,vy,"m",gy).call(r)}})),this.yankedDomains=this.yankedDomains.sort((function(t,e){return t-e}))}},{key:"slice",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.keys.length>e&&((n?this.keys.slice(0,-e):this.keys.slice(e)).forEach((function(e){t.collection.delete(e)})),mh(this,vy,"m",gy).call(this));return this}},{key:"fill",value:function(t,e,n){var r=this,i=e.x,o=e.y,a=e.groupY,u=e.defaultValue,s=this.groupRecords(t,i,n);this.keys.forEach((function(t){var e=s.get(t)||{};mh(r,vy,"m",yy).call(r,t,e,o,a,u)}))}},{key:"groupRecords",value:function(t,e,n){var r=this,i=new Map,o=new Map;return this.keys.forEach((function(t){r.get(t).forEach((function(e){o.set(e.t,t)}))})),t.forEach((function(t){var a=r.extractTimestamp(t,e,n);if(o.has(a)){var u=o.get(a),s=i.get(u)||{};s[a]||(s[a]=[]),s[a].push(t),i.set(u,s)}})),i}},{key:"groupValues",value:function(t,e){var n=t.filter((function(t){return null!==t}));if("string"==typeof e){if(n.every((function(t){return"number"==typeof t})))switch(e){case"sum":return n.reduce((function(t,e){return t+e}),0);case"count":return n.length;case"min":return Math.min.apply(Math,l(n))||null;case"max":return Math.max.apply(Math,l(n))||null;case"average":return n.length>0?n.reduce((function(t,e){return t+e}),0)/n.length:null;default:return null}return"count"===e?n.length:null}return"function"==typeof e?e(n):null}},{key:"extractTimestamp",value:function(t,e,n){var r="function"==typeof e?e(t):t[e];return"string"==typeof r&&(r=+new Date(r)),n(r)}}]),t}();vy=new WeakSet,yy=function(t,e,n,r,i){var o=this;this.get(t).forEach((function(a,u){var s=i;e.hasOwnProperty(a.t)&&(s=o.groupValues(mh(o,vy,"m",my).call(o,e[a.t],n),r)),o.get(t)[u].v=s}))},my=function(t,e){return t.map((function(t){return"function"==typeof e?e(t):t[e]}))},gy=function(){this.keys=Array.from(this.collection.keys()).map((function(t){return parseInt(t,10)})).sort((function(t,e){return t-e}));var t=this.keys;return this.min=t[0],this.max=t[t.length-1],this.keys};var Fy=".ch-domain-text",Hy=function(){function t(e){a(this,t),Ty.add(this),this.calendar=e}return s(t,[{key:"paint",value:function(t){var e=this,n=this.calendar.options.options.domain,r=n.label,i=n.type,o=this.calendar.dateHelper,a=r.text;null!==a&&""!==a&&(void 0===a&&(a=Yy[i]),t.selectAll(Fy).data((function(t){return[t]}),(function(t){return t})).join((function(t){return t.append("text").attr("class",Fy.slice(1)).attr("x",(function(t){return mh(e,Ty,"m",Ay).call(e,t)})).attr("y",(function(t){return mh(e,Ty,"m",Ry).call(e,t)})).attr("text-anchor",r.textAlign).attr("dominant-baseline",(function(){return mh(e,Ty,"m",Cy).call(e)})).text((function(t,e,n){return o.format(t,a,n[e])})).call((function(t){return mh(e,Ty,"m",Wy).call(e,t)}))}),(function(t){t.attr("x",(function(t){return mh(e,Ty,"m",Ay).call(e,t)})).attr("y",(function(t){return mh(e,Ty,"m",Ry).call(e,t)})).attr("text-anchor",r.textAlign).attr("dominant-baseline",(function(){return mh(e,Ty,"m",Cy).call(e)})).text((function(t,e,n){return o.format(t,a,n[e])})).call((function(t){return mh(e,Ty,"m",Wy).call(e,t)}))})))}}]),t}();Ty=new WeakSet,Cy=function(){var t=this.calendar.options.options.domain.label,e=t.position,n=t.rotate;return iy(e)?"middle":"left"===n&&"left"===e||"right"===n&&"right"===e?"bottom":"hanging"},Ay=function(t){var e=this.calendar.options.options.domain,n=e.padding,r=e.label,i=r.position,o=r.textAlign,a=r.offset,u=this.calendar.options.options.x.domainHorizontalLabelWidth,s=n[xp.LEFT];return"right"===i&&(s+=mh(this,Ty,"m",Iy).call(this,t)),"middle"===o&&(["top","bottom"].includes(i)?s+=mh(this,Ty,"m",Iy).call(this,t)/2:s+=u/2),"end"===o&&(iy(i)?s+=mh(this,Ty,"m",Iy).call(this,t):s+=u),s+a.x},Ry=function(t){var e=this.calendar.options.options,n=e.domain,r=n.label,i=r.position,o=r.offset,a=n.padding,u=e.x,s=a[xp.TOP]+u.domainVerticalLabelHeight/2;return"bottom"===i&&(s+=mh(this,Ty,"m",Ny).call(this,t)),s+o.y},Iy=function(t){var e=this.calendar.options.options,n=e.domain.padding,r=e.x.domainHorizontalLabelWidth;return this.calendar.calendarPainter.domainsContainerPainter.domainPainter.coordinates.get(t).inner_width-r-oy(n)},Ny=function(t){var e=this.calendar.options.options,n=e.x.domainVerticalLabelHeight,r=e.domain.padding;return this.calendar.calendarPainter.domainsContainerPainter.domainPainter.coordinates.get(t).inner_height-n-ay(r)},Wy=function(t){var e=this,n=this.calendar.options.options,r=n.domain.label,i=r.rotate,o=r.textAlign,a=r.position,u=n.x.domainHorizontalLabelWidth;switch(i){case"right":t.attr("transform",(function(t){var n=mh(e,Ty,"m",Iy).call(e,t),r=mh(e,Ty,"m",Ny).call(e,t),i=["rotate(90, ".concat("right"===a?n:u,", 0)")];switch(a){case"right":"middle"===o?i.push("translate(".concat(r/2-u/2,")")):"end"===o&&i.push("translate(".concat(r-u,")"));break;case"left":"start"===o?i.push("translate(".concat(u,")")):"middle"===o?i.push("translate(".concat(u/2+r/2,")")):"end"===o&&i.push("translate(".concat(r,")"))}return i.join(",")}));break;case"left":t.attr("transform",(function(t){var n=mh(e,Ty,"m",Iy).call(e,t),r=mh(e,Ty,"m",Ny).call(e,t),i=["rotate(270, ".concat("right"===a?n:u,", 0)")];switch(a){case"right":"start"===o?i.push("translate(-".concat(r,")")):"middle"===o?i.push("translate(-".concat(r/2+u/2,")")):"end"===o&&i.push("translate(-".concat(u,")"));break;case"left":"start"===o?i.push("translate(".concat(u-r,")")):"middle"===o&&i.push("translate(".concat(u/2-r/2,")"))}return i.join(",")}))}};var By,Gy,Uy,qy,Vy,Ky,Zy,Qy="\t\n\v\f\r                　\u2028\u2029\ufeff",Jy=W,Xy=cf,tm=Qy,em=A("".replace),nm=RegExp("^["+tm+"]+"),rm=RegExp("(^|[^"+tm+"])["+tm+"]+$"),im=function(t){return function(e){var n=Xy(Jy(e));return 1&t&&(n=em(n,nm,"")),2&t&&(n=em(n,rm,"$1")),n}},om={start:im(1),end:im(2),trim:im(3)},am=We.PROPER,um=P,sm=Qy,cm=om.trim;Si({target:"String",proto:!0,forced:function(t){return um((function(){return!!sm[t]()||"​᠎"!=="​᠎"[t]()||am&&sm[t].name!==t}))}("trim")},{trim:function(){return cm(this)}});var lm,fm,hm,dm,pm=".ch-subdomain",vm=function(){function t(e){a(this,t),By.add(this),this.calendar=e,this.root=null}return s(t,[{key:"paint",value:function(t){var e=this;this.root=t||this.root;var n="".concat(pm,"-container"),r=this.root.selectAll(n).data((function(t){return[t]}),(function(t){return t})).join((function(t){return t.append("svg").call((function(t){return mh(e,By,"m",Gy).call(e,t)})).attr("class",n.slice(1))}),(function(t){return t.call((function(t){return mh(e,By,"m",Gy).call(e,t)}))})),i=this.calendar.options.options.subDomain,o=i.radius,a=i.width,u=i.height,s=i.sort,c=this.calendar.eventEmitter;r.selectAll("g").data((function(t){var n=e.calendar.domainCollection.get(t);if("desc"===s){var r=Math.max.apply(Math,l(n.map((function(t){return t.x}))));n.forEach((function(t,e){n[e].x=Math.abs(t.x-r)}))}return n})).join((function(t){return t.append("g").call((function(t){return t.insert("rect").attr("class",(function(t){return mh(e,By,"m",Uy).call(e,t.t,"".concat(pm.slice(1),"-bg"))})).attr("width",a).attr("height",u).attr("x",(function(t){return mh(e,By,"m",Ky).call(e,t)})).attr("y",(function(t){return mh(e,By,"m",Zy).call(e,t)})).on("click",(function(t,e){return c.emit("click",t,e.t,e.v)})).on("mouseover",(function(t,e){return c.emit("mouseover",t,e.t,e.v)})).on("mouseout",(function(t,e){return c.emit("mouseout",t,e.t,e.v)})).attr("rx",o>0?o:null).attr("ry",o>0?o:null)})).call((function(t){return mh(e,By,"m",qy).call(e,t)}))}),(function(t){return t.selectAll("rect").attr("class",(function(t){return mh(e,By,"m",Uy).call(e,t.t,"".concat(pm.slice(1),"-bg"))})).attr("width",a).attr("height",u).attr("x",(function(t){return mh(e,By,"m",Ky).call(e,t)})).attr("y",(function(t){return mh(e,By,"m",Zy).call(e,t)})).attr("rx",o).attr("ry",o)}))}}]),t}();By=new WeakSet,Gy=function(t){var e=this.calendar.options.options,n=e.domain,r=n.padding,i=n.label.position;t.attr("x",(function(){var t=r[xp.LEFT];return"left"===i&&(t+=e.x.domainHorizontalLabelWidth),t})).attr("y",(function(){var t=r[xp.TOP];return"top"===i&&(t+=e.x.domainVerticalLabelHeight),t}))},Uy=function(t){var e=this,n=this.calendar.options.options,r=n.date.highlight,i=n.subDomain.type,o="";r.length>0&&r.forEach((function(n){var r=e.calendar.templateCollection.get(i).extractUnit;r(+n)===r(t)&&(o="highlight")}));for(var a=arguments.length,u=new Array(a>1?a-1:0),s=1;s<a;s++)u[s-1]=arguments[s];return[o].concat(u).join(" ").trim()},qy=function(t){var e=this,n=this.calendar.options.options.subDomain,r=n.width,i=n.height,o=n.label;return o?t.append("text").attr("class",(function(t){return mh(e,By,"m",Uy).call(e,t.t,"".concat(pm.slice(1),"-text"))})).attr("x",(function(t){return mh(e,By,"m",Ky).call(e,t)+r/2})).attr("y",(function(t){return mh(e,By,"m",Zy).call(e,t)+i/2})).attr("text-anchor","middle").attr("dominant-baseline","central").text((function(t,n,r){return e.calendar.dateHelper.format(t.t,o,t.v,r[n])})):null},Vy=function(t,e){var n=this.calendar.options.options.subDomain;return e[t]*(n["x"===t?"width":"height"]+n.gutter)},Ky=function(t){return mh(this,By,"m",Vy).call(this,"x",t)},Zy=function(t){return mh(this,By,"m",Vy).call(this,"y",t)};var ym=".ch-domain-container",mm="in-transition",gm=function(){function e(t){a(this,e),lm.add(this),this.calendar=t,this.domainPainter=new fy(t),this.subDomainPainter=new vm(t),this.domainLabelPainter=new Hy(t),this.dimensions={width:0,height:0},this.transitionsQueueCount=0}return s(e,[{key:"setup",value:function(){this.root=this.calendar.calendarPainter.root.attr("x",0).attr("y",0).append("svg").attr("class",ym.slice(1)).append("svg").attr("class","".concat(ym.slice(1),"-animation-wrapper"))}},{key:"paint",value:function(t){var e=this;mh(this,lm,"m",fm).call(this);var n=this.domainPainter.paint(t,this.root);return this.subDomainPainter.paint(this.domainPainter.root),this.domainLabelPainter.paint(this.domainPainter.root),mh(this,lm,"m",dm).call(this),Promise.allSettled(n).then((function(){mh(e,lm,"m",hm).call(e)})),n}},{key:"updatePosition",value:function(){var e;if(!(null===(e=this.root)||void 0===e?void 0:e.node()))return Promise.resolve();var n=this.calendar.options.options.animationDuration,r=this.calendar.pluginManager.getHeightFromPosition("top"),i=this.calendar.pluginManager.getWidthFromPosition("left");return[t.select(this.root.node().parentNode).transition().duration(n).call((function(t){t.attr("x",i).attr("y",r)})).end()]}},{key:"width",value:function(){return this.dimensions.width}},{key:"height",value:function(){return this.dimensions.height}},{key:"destroy",value:function(){return mh(this,lm,"m",fm).call(this),Promise.resolve()}}]),e}();lm=new WeakSet,fm=function(){var e;(null===(e=this.root)||void 0===e?void 0:e.node())&&(this.transitionsQueueCount+=1,t.select(this.root.node().parentNode).classed(mm,!0))},hm=function(){var e;(null===(e=this.root)||void 0===e?void 0:e.node())&&(this.transitionsQueueCount-=1,0===this.transitionsQueueCount&&t.select(this.root.node().parentNode).classed(mm,!1))},dm=function(){var t=this.calendar.options.options,e=t.animationDuration,n=t.verticalOrientation,r=t.domain.gutter,i=this.domainPainter.dimensions;this.dimensions={width:i.width-(n?0:r),height:i.height-(n?r:0)},this.root.transition().duration(e).attr("width",this.dimensions.width).attr("height",this.dimensions.height)};var bm,wm,xm,Om,km=function(){function t(e){a(this,t),this.calendar=e}return s(t,[{key:"paint",value:function(){var t=[];return t=(t=t.concat(this.calendar.pluginManager.paintAll())).concat(this.setPluginsPosition())}},{key:"setPluginsPosition",value:function(){var t=this.calendar.pluginManager,e=this.calendar.options.options.animationDuration,n=this.calendar.calendarPainter.domainsContainerPainter,r=t.getFromPosition("top"),i=t.getFromPosition("right"),o=t.getFromPosition("bottom"),a=t.getFromPosition("left"),u=t.getHeightFromPosition("top"),s=t.getWidthFromPosition("left"),c=[],l=0;r.forEach((function(t){c.push(t.root.transition().duration(e).attr("y",l).attr("x",s).end()),l+=t.options.dimensions.height}));var f=0;return a.forEach((function(t){c.push(t.root.transition().duration(e).attr("x",f).attr("y",u).end()),f+=t.options.dimensions.width})),o.forEach((function(t){c.push(t.root.transition().duration(e).attr("x",s).attr("y",u+n.height()).end())})),f+=n.width(),i.forEach((function(t){c.push(t.root.transition().duration(e).attr("x",f).attr("y",u).end()),f+=t.options.dimensions.width})),c}},{key:"insideWidth",value:function(){return this.calendar.pluginManager.getWidthFromPosition("left")+this.calendar.pluginManager.getWidthFromPosition("right")}},{key:"insideHeight",value:function(){return this.calendar.pluginManager.getHeightFromPosition("top")+this.calendar.pluginManager.getHeightFromPosition("bottom")}}]),t}(),Sm=function(){function e(t){a(this,e),bm.add(this),this.calendar=t,this.dimensions={width:0,height:0},this.root=null,this.domainsContainerPainter=new gm(t),this.pluginPainter=new km(t)}return s(e,[{key:"setup",value:function(){var e=this.calendar.options.options,n=e.itemSelector,r=e.theme;return this.root||(this.root=t.select(n).append("svg").attr("data-theme",r).attr("class",".ch-container".slice(1)),this.domainsContainerPainter.setup()),this.calendar.pluginManager.setupAll(),!0}},{key:"paint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:wp.SCROLL_NONE,e=this.domainsContainerPainter.paint(t).concat(this.pluginPainter.paint()).concat(this.domainsContainerPainter.updatePosition());return mh(this,bm,"m",Om).call(this),Promise.allSettled(e)}},{key:"destroy",value:function(){var t=this.calendar.pluginManager.destroyAll().concat(this.domainsContainerPainter.destroy());return this.root?(t.push(this.root.transition().duration(this.calendar.options.options.animationDuration).attr("width",0).attr("height",0).remove().end()),Promise.allSettled(t)):Promise.allSettled(t)}}]),e}();bm=new WeakSet,wm=function(){return this.domainsContainerPainter.height()+this.pluginPainter.insideHeight()},xm=function(){return this.domainsContainerPainter.width()+this.pluginPainter.insideWidth()},Om=function(){var t=this.calendar.options.options,e=mh(this,bm,"m",xm).call(this),n=mh(this,bm,"m",wm).call(this);this.root.transition().duration(t.animationDuration).attr("width",e).attr("height",n),e===this.dimensions.width&&n===this.dimensions.height||this.calendar.eventEmitter.emit("resize",e,n,this.dimensions.width,this.dimensions.height),this.dimensions={width:e,height:n}};var jm="object"==typeof global&&global&&global.Object===Object&&global,_m="object"==typeof self&&self&&self.Object===Object&&self,Mm=jm||_m||Function("return this")(),Dm=Mm.Symbol,Pm=Object.prototype,$m=Pm.hasOwnProperty,Em=Pm.toString,Lm=Dm?Dm.toStringTag:void 0;var Tm=Object.prototype.toString;var Cm="[object Null]",Am="[object Undefined]",Rm=Dm?Dm.toStringTag:void 0;function Im(t){return null==t?void 0===t?Am:Cm:Rm&&Rm in Object(t)?function(t){var e=$m.call(t,Lm),n=t[Lm];try{t[Lm]=void 0;var r=!0}catch(t){}var i=Em.call(t);return r&&(e?t[Lm]=n:delete t[Lm]),i}(t):function(t){return Tm.call(t)}(t)}function Nm(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var Wm="[object AsyncFunction]",Ym="[object Function]",zm="[object GeneratorFunction]",Fm="[object Proxy]";function Hm(t){if(!Nm(t))return!1;var e=Im(t);return e==Ym||e==zm||e==Wm||e==Fm}var Bm=F,Gm=wc;Si({target:"Object",stat:!0,forced:P((function(){Gm(1)}))},{keys:function(t){return Gm(Bm(t))}});var Um,qm=Pt,Vm=Gn,Km=gt("match"),Zm=function(t){var e;return qm(t)&&(void 0!==(e=t[Km])?!!e:"RegExp"===Vm(t))},Qm=TypeError,Jm=function(t){if(Zm(t))throw new Qm("The method doesn't accept regular expressions");return t},Xm=gt("match"),tg=function(t){var e=/./;try{"/./"[t](e)}catch(n){try{return e[Xm]=!1,"/./"[t](e)}catch(t){}}return!1},eg=Si,ng=Po,rg=er.f,ig=Cr,og=cf,ag=Jm,ug=W,sg=tg,cg=ng("".startsWith),lg=ng("".slice),fg=Math.min,hg=sg("startsWith");eg({target:"String",proto:!0,forced:!!(hg||(Um=rg(String.prototype,"startsWith"),!Um||Um.writable))&&!hg},{startsWith:function(t){var e=og(ug(this));ag(t);var n=ig(fg(arguments.length>1?arguments[1]:void 0,e.length)),r=og(t);return cg?cg(e,r,n):lg(e,n,n+r.length)===r}});var dg=_t,pg=P,vg=A,yg=ol,mg=wc,gg=dr,bg=vg(nr.f),wg=vg([].push),xg=dg&&pg((function(){var t=Object.create(null);return t[2]=2,!bg(t,2)})),Og=function(t){return function(e){for(var n,r=gg(e),i=mg(r),o=xg&&null===yg(r),a=i.length,u=0,s=[];a>u;)n=i[u++],dg&&!(o?n in r:bg(r,n))||wg(s,t?[n,r[n]]:r[n]);return s}},kg={entries:Og(!0),values:Og(!1)}.entries;function Sg(t){return null!=t&&!Number.isNaN(t)}function jg(t,e){return+Sg(e)-+Sg(t)||n.ascending(t,e)}function _g(t){return isFinite(t)?t:NaN}function Mg(t){return t>0&&isFinite(t)?t:NaN}function Dg(t){return t<0&&isFinite(t)?t:NaN}Si({target:"Object",stat:!0},{entries:function(t){return kg(t)}});const Pg=/^(?:[-+]\d{2})?\d{4}(?:-\d{2}(?:-\d{2})?)?(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[-+]\d{2}:?\d{2})?)?$/;function $g(t,e){return Pg.test(t+="")?new Date(t):"function"==typeof e?e(t):e}const Eg=new Map([["second",n.timeSecond],["minute",n.timeMinute],["hour",n.timeHour],["day",n.timeDay],["week",n.timeWeek],["month",n.timeMonth],["quarter",n.timeMonth.every(3)],["half",n.timeMonth.every(6)],["year",n.timeYear],["monday",n.timeMonday],["tuesday",n.timeTuesday],["wednesday",n.timeWednesday],["thursday",n.timeThursday],["friday",n.timeFriday],["saturday",n.timeSaturday],["sunday",n.timeSunday]]),Lg=new Map([["second",n.utcSecond],["minute",n.utcMinute],["hour",n.utcHour],["day",n.utcDay],["week",n.utcWeek],["month",n.utcMonth],["quarter",n.utcMonth.every(3)],["half",n.utcMonth.every(6)],["year",n.utcYear],["monday",n.utcMonday],["tuesday",n.utcTuesday],["wednesday",n.utcWednesday],["thursday",n.utcThursday],["friday",n.utcFriday],["saturday",n.utcSaturday],["sunday",n.utcSunday]]);function Tg(t){const e=Eg.get(`${t}`.toLowerCase());if(!e)throw new Error(`unknown interval: ${t}`);return e}function Cg(t){const e=Lg.get(`${t}`.toLowerCase());if(!e)throw new Error(`unknown interval: ${t}`);return e}const Ag=Object.getPrototypeOf(Uint8Array),Rg=Object.prototype.toString,Ig=t=>()=>t;function Ng(t){return t instanceof Ag?t:Hg(t,Wg,Float64Array)}function Wg(t){return null==t?NaN:Number(t)}function Yg(t){return Hg(t,zg)}function zg(t){return t instanceof Date&&!isNaN(t)?t:"string"==typeof t?$g(t):null==t||isNaN(t=+t)?void 0:new Date(t)}function Fg(t){return null==t||t instanceof Array||t instanceof Ag?t:Array.from(t)}function Hg(t,e,n=Array){return null==t?t:t instanceof n?t.map(e):n.from(t,e)}function Bg(t,e=Array){return t instanceof e?t.slice():e.from(t)}function Gg(t){return function(t){return t?.toString===Rg}(t)&&(void 0!==t.type||void 0!==t.domain)}function Ug(t,e){if(null!=t){if("number"==typeof t){0<t&&t<1&&Number.isInteger(1/t)&&(t=-1/t);const e=Math.abs(t);return t<0?{floor:t=>Math.floor(t*e)/e,offset:t=>(t*e+1)/e,range:(t,r)=>n.range(Math.ceil(t*e),r*e).map((t=>t/e))}:{floor:t=>Math.floor(t/e)*e,offset:t=>t+e,range:(t,r)=>n.range(Math.ceil(t/e),r/e).map((t=>t*e))}}if("string"==typeof t)return("time"===e?Tg:Cg)(t);if("function"!=typeof t.floor)throw new Error("invalid interval; missing floor method");if("function"!=typeof t.offset)throw new Error("invalid interval; missing offset method");return t}}function qg(t,e){if((t=Ug(t,e))&&"function"!=typeof t.range)throw new Error("invalid interval: missing range method");return t}function Vg(t){for(const e of t){if(null==e)continue;const t=typeof e;return"string"===t||"boolean"===t}}function Kg(t){for(const e of t)if(null!=e)return e instanceof Date}function Zg(t){for(const e of t)if(null!=e)return"string"==typeof e&&isNaN(e)&&$g(e)}function Qg(t){for(const e of t)if(null!=e){if("string"!=typeof e)return!1;if(e.trim())return!isNaN(e)}}function Jg(t){if(null==t)return;const e=t[0],r=t[t.length-1];return n.descending(e,r)}const Xg=Symbol("position"),tb=Symbol("color"),eb=Symbol("radius"),nb=Symbol("length"),rb=Symbol("opacity"),ib=Symbol("symbol"),ob=new Map([["x",Xg],["y",Xg],["fx",Xg],["fy",Xg],["r",eb],["color",tb],["opacity",rb],["symbol",ib],["length",nb]]),ab=2/Math.sqrt(3),ub={draw(t,e){const n=Math.sqrt(e/Math.PI),r=n*ab,i=r/2;t.moveTo(0,r),t.lineTo(n,i),t.lineTo(n,-i),t.lineTo(0,-r),t.lineTo(-n,-i),t.lineTo(-n,i),t.closePath()}},sb=new Map([["asterisk",n.symbolAsterisk],["circle",n.symbolCircle],["cross",n.symbolCross],["diamond",n.symbolDiamond],["diamond2",n.symbolDiamond2],["hexagon",ub],["plus",n.symbolPlus],["square",n.symbolSquare],["square2",n.symbolSquare2],["star",n.symbolStar],["times",n.symbolTimes],["triangle",n.symbolTriangle],["triangle2",n.symbolTriangle2],["wye",n.symbolWye]]);function cb(t){if(null==t||function(t){return t&&"function"==typeof t.draw}(t))return t;const e=sb.get(`${t}`.toLowerCase());if(e)return e;throw new Error(`invalid symbol: ${t}`)}function lb(t){console.warn(t)}const fb=new Map([["accent",n.schemeAccent],["category10",n.schemeCategory10],["dark2",n.schemeDark2],["paired",n.schemePaired],["pastel1",n.schemePastel1],["pastel2",n.schemePastel2],["set1",n.schemeSet1],["set2",n.schemeSet2],["set3",n.schemeSet3],["tableau10",n.schemeTableau10],["brbg",db(n.schemeBrBG,n.interpolateBrBG)],["prgn",db(n.schemePRGn,n.interpolatePRGn)],["piyg",db(n.schemePiYG,n.interpolatePiYG)],["puor",db(n.schemePuOr,n.interpolatePuOr)],["rdbu",db(n.schemeRdBu,n.interpolateRdBu)],["rdgy",db(n.schemeRdGy,n.interpolateRdGy)],["rdylbu",db(n.schemeRdYlBu,n.interpolateRdYlBu)],["rdylgn",db(n.schemeRdYlGn,n.interpolateRdYlGn)],["spectral",db(n.schemeSpectral,n.interpolateSpectral)],["burd",pb(n.schemeRdBu,n.interpolateRdBu)],["buylrd",pb(n.schemeRdYlBu,n.interpolateRdYlBu)],["blues",hb(n.schemeBlues,n.interpolateBlues)],["greens",hb(n.schemeGreens,n.interpolateGreens)],["greys",hb(n.schemeGreys,n.interpolateGreys)],["oranges",hb(n.schemeOranges,n.interpolateOranges)],["purples",hb(n.schemePurples,n.interpolatePurples)],["reds",hb(n.schemeReds,n.interpolateReds)],["turbo",vb(n.interpolateTurbo)],["viridis",vb(n.interpolateViridis)],["magma",vb(n.interpolateMagma)],["inferno",vb(n.interpolateInferno)],["plasma",vb(n.interpolatePlasma)],["cividis",vb(n.interpolateCividis)],["cubehelix",vb(n.interpolateCubehelixDefault)],["warm",vb(n.interpolateWarm)],["cool",vb(n.interpolateCool)],["bugn",hb(n.schemeBuGn,n.interpolateBuGn)],["bupu",hb(n.schemeBuPu,n.interpolateBuPu)],["gnbu",hb(n.schemeGnBu,n.interpolateGnBu)],["orrd",hb(n.schemeOrRd,n.interpolateOrRd)],["pubu",hb(n.schemePuBu,n.interpolatePuBu)],["pubugn",hb(n.schemePuBuGn,n.interpolatePuBuGn)],["purd",hb(n.schemePuRd,n.interpolatePuRd)],["rdpu",hb(n.schemeRdPu,n.interpolateRdPu)],["ylgn",hb(n.schemeYlGn,n.interpolateYlGn)],["ylgnbu",hb(n.schemeYlGnBu,n.interpolateYlGnBu)],["ylorbr",hb(n.schemeYlOrBr,n.interpolateYlOrBr)],["ylorrd",hb(n.schemeYlOrRd,n.interpolateYlOrRd)],["rainbow",yb(n.interpolateRainbow)],["sinebow",yb(n.interpolateSinebow)]]);function hb(t,e){return({length:r})=>1===r?[t[3][1]]:2===r?[t[3][1],t[3][2]]:(r=Math.max(3,Math.floor(r)))>9?n.quantize(e,r):t[r]}function db(t,e){return({length:r})=>2===r?[t[3][0],t[3][2]]:(r=Math.max(3,Math.floor(r)))>11?n.quantize(e,r):t[r]}function pb(t,e){return({length:r})=>2===r?[t[3][2],t[3][0]]:(r=Math.max(3,Math.floor(r)))>11?n.quantize((t=>e(1-t)),r):t[r].slice().reverse()}function vb(t){return({length:e})=>n.quantize(t,Math.max(2,Math.floor(e)))}function yb(t){return({length:e})=>n.quantize(t,Math.floor(e)+1).slice(0,-1)}function mb(t){const e=`${t}`.toLowerCase();if(!fb.has(e))throw new Error(`unknown ordinal scheme: ${e}`);return fb.get(e)}function gb(t,e){const n=mb(t),r="function"==typeof n?n({length:e}):n;return r.length!==e?r.slice(0,e):r}const bb=new Map([["brbg",n.interpolateBrBG],["prgn",n.interpolatePRGn],["piyg",n.interpolatePiYG],["puor",n.interpolatePuOr],["rdbu",n.interpolateRdBu],["rdgy",n.interpolateRdGy],["rdylbu",n.interpolateRdYlBu],["rdylgn",n.interpolateRdYlGn],["spectral",n.interpolateSpectral],["burd",t=>n.interpolateRdBu(1-t)],["buylrd",t=>n.interpolateRdYlBu(1-t)],["blues",n.interpolateBlues],["greens",n.interpolateGreens],["greys",n.interpolateGreys],["purples",n.interpolatePurples],["reds",n.interpolateReds],["oranges",n.interpolateOranges],["turbo",n.interpolateTurbo],["viridis",n.interpolateViridis],["magma",n.interpolateMagma],["inferno",n.interpolateInferno],["plasma",n.interpolatePlasma],["cividis",n.interpolateCividis],["cubehelix",n.interpolateCubehelixDefault],["warm",n.interpolateWarm],["cool",n.interpolateCool],["bugn",n.interpolateBuGn],["bupu",n.interpolateBuPu],["gnbu",n.interpolateGnBu],["orrd",n.interpolateOrRd],["pubugn",n.interpolatePuBuGn],["pubu",n.interpolatePuBu],["purd",n.interpolatePuRd],["rdpu",n.interpolateRdPu],["ylgnbu",n.interpolateYlGnBu],["ylgn",n.interpolateYlGn],["ylorbr",n.interpolateYlOrBr],["ylorrd",n.interpolateYlOrRd],["rainbow",n.interpolateRainbow],["sinebow",n.interpolateSinebow]]);function wb(t){const e=`${t}`.toLowerCase();if(!bb.has(e))throw new Error(`unknown quantitative scheme: ${e}`);return bb.get(e)}const xb=new Set(["brbg","prgn","piyg","puor","rdbu","rdgy","rdylbu","rdylgn","spectral","burd","buylrd"]);function Ob(t){return null!=t&&xb.has(`${t}`.toLowerCase())}const kb=t=>e=>t(1-e),Sb=[0,1],jb=new Map([["number",n.interpolateNumber],["rgb",n.interpolateRgb],["hsl",n.interpolateHsl],["hcl",n.interpolateHcl],["lab",n.interpolateLab]]);function _b(t){const e=`${t}`.toLowerCase();if(!jb.has(e))throw new Error(`unknown interpolator: ${e}`);return jb.get(e)}function Mb(t,e,r,{type:i,nice:o,clamp:a,zero:u,domain:s=Eb(t,r),unknown:c,round:l,scheme:f,interval:h,range:d=(ob.get(t)===eb?Tb(r,s):ob.get(t)===nb?Cb(r,s):ob.get(t)===rb?Sb:void 0),interpolate:p=(ob.get(t)===tb?null==f&&void 0!==d?n.interpolateRgb:wb(void 0!==f?f:"cyclical"===i?"rainbow":"turbo"):l?n.interpolateRound:n.interpolateNumber),reverse:v}){if(h=qg(h,i),"cyclical"!==i&&"sequential"!==i||(i="linear"),v=!!v,"function"!=typeof p&&(p=_b(p)),1===p.length?(v&&(p=kb(p),v=!1),void 0===d&&2===(d=Float64Array.from(s,((t,e)=>e/(s.length-1)))).length&&(d=Sb),e.interpolate((d===Sb?Ig:Ib)(p))):e.interpolate(p),u){const[t,e]=n.extent(s);(t>0||e<0)&&(Jg(s=Bg(s))!==Math.sign(t)?s[s.length-1]=0:s[0]=0)}return v&&(s=n.reverse(s)),e.domain(s).unknown(c),o&&(e.nice(function(t,e){return!0===t?void 0:"number"==typeof t?t:function(t,e){if((t=qg(t,e))&&"function"!=typeof t.ceil)throw new Error("invalid interval: missing ceil method");return t}(t,e)}(o,i)),s=e.domain()),void 0!==d&&e.range(d),a&&e.clamp(a),{type:i,domain:s,range:d,scale:e,interpolate:p,interval:h}}function Db(t,e,{exponent:r=1,...i}){return Mb(t,n.scalePow().exponent(r),e,{...i,type:"pow"})}function Pb(t,e,{domain:r=[0],unknown:i,scheme:o="rdylbu",interpolate:a,range:u=(void 0!==a?n.quantize(a,r.length+1):ob.get(t)===tb?gb(o,r.length+1):void 0),reverse:s}){const c=Jg(r=Fg(r));if(!isNaN(c)&&!function(t,e){for(let r=1,i=t.length,o=t[0];r<i;++r){const i=n.descending(o,o=t[r]);if(0!==i&&i!==e)return!1}return!0}(r,c))throw new Error(`the ${t} scale has a non-monotonic domain`);return s&&(u=n.reverse(u)),{type:"threshold",scale:n.scaleThreshold(c<0?n.reverse(r):r,void 0===u?[]:u).unknown(i),domain:r,range:u}}function $b(t,e=_g){return t.length?[n.min(t,(({value:t})=>void 0===t?t:n.min(t,e))),n.max(t,(({value:t})=>void 0===t?t:n.max(t,e)))]:[0,1]}function Eb(t,e){const n=ob.get(t);return(n===eb||n===rb||n===nb?Lb:$b)(e)}function Lb(t){return[0,t.length?n.max(t,(({value:t})=>void 0===t?t:n.max(t,_g))):1]}function Tb(t,e){const r=t.find((({radius:t})=>void 0!==t));if(void 0!==r)return[0,r.radius];const i=n.quantile(t,.5,(({value:t})=>void 0===t?NaN:n.quantile(t,.25,Mg))),o=e.map((t=>3*Math.sqrt(t/i))),a=30/n.max(o);return a<1?o.map((t=>t*a)):o}function Cb(t,e){const r=n.median(t,(({value:t})=>void 0===t?NaN:n.median(t,Math.abs))),i=e.map((t=>12*t/r)),o=60/n.max(i);return o<1?i.map((t=>t*o)):i}function Ab(t){for(const{value:e}of t)if(void 0!==e)for(let n of e){if(n>0)return $b(t,Mg);if(n<0)return $b(t,Dg)}return[1,10]}function Rb(t){const e=[];for(const{value:n}of t)if(void 0!==n)for(const t of n)e.push(t);return e}function Ib(t){return(e,n)=>r=>t(e+r*(n-e))}function Nb(t,e,r,i,{type:o,nice:a,clamp:u,domain:s=$b(i),unknown:c,pivot:l=0,scheme:f,range:h,symmetric:d=!0,interpolate:p=(ob.get(t)===tb?null==f&&void 0!==h?n.interpolateRgb:wb(void 0!==f?f:"rdbu"):n.interpolateNumber),reverse:v}){l=+l;let[y,m]=s;if(n.descending(y,m)<0&&([y,m]=[m,y],v=!v),y=Math.min(y,l),m=Math.max(m,l),"function"!=typeof p&&(p=_b(p)),void 0!==h&&(p=1===p.length?Ib(p)(...h):n.piecewise(p,h)),v&&(p=kb(p)),d){const t=r.apply(l),e=t-r.apply(y),n=r.apply(m)-t;e<n?y=r.invert(t-n):e>n&&(m=r.invert(t+e))}return e.domain([y,l,m]).unknown(c).interpolator(p),u&&e.clamp(u),a&&e.nice(a),{type:o,domain:[y,m],pivot:l,interpolate:p,scale:e}}function Wb(t,e,{exponent:r=1,...i}){return Nb(t,n.scaleDivergingPow().exponent(r=+r),function(t){return.5===t?Hb:{apply:e=>Math.sign(e)*Math.pow(Math.abs(e),t),invert:e=>Math.sign(e)*Math.pow(Math.abs(e),1/t)}}(r),e,{...i,type:"diverging-pow"})}function Yb(t,e,{constant:r=1,...i}){return Nb(t,n.scaleDivergingSymlog().constant(r=+r),function(t){return{apply:e=>Math.sign(e)*Math.log1p(Math.abs(e/t)),invert:e=>Math.sign(e)*Math.expm1(Math.abs(e))*t}}(r),e,i)}const zb={apply:t=>t,invert:t=>t},Fb={apply:Math.log,invert:Math.exp},Hb={apply:t=>Math.sign(t)*Math.sqrt(Math.abs(t)),invert:t=>Math.sign(t)*(t*t)};function Bb(t,e,n,r){return Mb(t,e,n,r)}const Gb=Symbol("ordinal");function Ub(t,e,r,{type:i,interval:o,domain:a,range:u,reverse:s,hint:c}){return o=qg(o,i),void 0===a&&(a=Kb(r,o,t)),"categorical"!==i&&i!==Gb||(i="ordinal"),s&&(a=n.reverse(a)),e.domain(a),void 0!==u&&("function"==typeof u&&(u=u(a)),e.range(u)),{type:i,domain:a,range:u,scale:e,hint:c,interval:o}}function qb(t,e,{type:r,interval:i,domain:o,range:a,scheme:u,unknown:s,...c}){let l;if(i=qg(i,r),void 0===o&&(o=Kb(e,i,t)),ob.get(t)===ib)l=function(t){return{fill:Zb(t,"fill"),stroke:Zb(t,"stroke")}}(e),a=void 0===a?function(t){return e=t.fill,null==e||function(t){return/^\s*none\s*$/i.test(t)}(e)?n.symbolsStroke:n.symbolsFill;var e}(l):Hg(a,cb);else if(ob.get(t)===tb&&(void 0!==a||"ordinal"!==r&&r!==Gb||(a=function(t,e="greys"){const n=new Set,[r,i]=gb(e,2);for(const e of t)if(null!=e)if(!0===e)n.add(i);else{if(!1!==e)return;n.add(r)}return[...n]}(o,u),void 0!==a&&(u=void 0)),void 0===u&&void 0===a&&(u="ordinal"===r?"turbo":"tableau10"),void 0!==u))if(void 0!==a){const t=wb(u),e=a[0],r=a[1]-a[0];a=({length:i})=>n.quantize((n=>t(e+r*n)),i)}else a=mb(u);if(s===n.scaleImplicit)throw new Error(`implicit unknown on ${t} scale is not supported`);return Ub(t,n.scaleOrdinal().unknown(s),e,{...c,type:r,domain:o,range:a,hint:l})}function Vb(t,e,n,r){let{round:i}=n;return void 0!==i&&t.round(i=!!i),(t=Ub(r,t,e,n)).round=i,t}function Kb(t,e,r){const i=new n.InternSet;for(const{value:e,domain:n}of t){if(void 0!==n)return n();if(void 0!==e)for(const t of e)i.add(t)}if(void 0!==e){const[t,r]=n.extent(i).map(e.floor,e);return e.range(t,e.offset(r))}if(i.size>1e4&&ob.get(r)===Xg)throw new Error(`implicit ordinal domain of ${r} scale has more than 10,000 values`);return n.sort(i,jg)}function Zb(t,e){let n;for(const{hint:r}of t){const t=r?.[e];if(void 0!==t)if(void 0===n)n=t;else if(n!==t)return}return n}function Qb(t,e,r){return function(t,e=[],r={}){const i=function(t,e,{type:n,domain:r,range:i,scheme:o,pivot:a,projection:u}){if("fx"===t||"fy"===t)return"band";"x"!==t&&"y"!==t||null==u||(n=Xb);for(const{type:t}of e)if(void 0!==t)if(void 0===n)n=t;else if(n!==t)throw new Error(`scale incompatible with channel: ${n} !== ${t}`);if(n===Xb)return;if(void 0!==n)return n;if(void 0===r&&!e.some((({value:t})=>void 0!==t)))return;const s=ob.get(t);if(s===eb)return"sqrt";if(s===rb||s===nb)return"linear";if(s===ib)return"ordinal";if((r||i||[]).length>2)return tw(s);if(void 0!==r)return Vg(r)?tw(s):Kg(r)?"utc":s!==tb||null==a&&!Ob(o)?"linear":"diverging";const c=e.map((({value:t})=>t)).filter((t=>void 0!==t));return c.some(Vg)?tw(s):c.some(Kg)?"utc":s!==tb||null==a&&!Ob(o)?"linear":"diverging"}(t,e,r);if(void 0===r.type&&void 0===r.domain&&void 0===r.range&&null==r.interval&&"fx"!==t&&"fy"!==t&&function({type:t}){return"ordinal"===t||"point"===t||"band"===t||t===Gb}({type:i})){const n=e.map((({value:t})=>t)).filter((t=>void 0!==t));n.some(Kg)?lb(`Warning: some data associated with the ${t} scale are dates. Dates are typically associated with a "utc" or "time" scale rather than a "${Jb(i)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can specify the interval of the ${t} scale (e.g., d3.utcDay), or you can suppress this warning by setting the type of the ${t} scale to "${Jb(i)}".`):n.some(Zg)?lb(`Warning: some data associated with the ${t} scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "${Jb(i)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the ${t} scale to "${Jb(i)}".`):n.some(Qg)&&lb(`Warning: some data associated with the ${t} scale are strings that appear to be numbers. If these strings represent numbers, you should parse or coerce them to numbers. Numbers are typically associated with a "linear" scale rather than a "${Jb(i)}" scale. If you want to treat this data as ordinal, you can specify the interval of the ${t} scale (e.g., 1 for integers), or you can suppress this warning by setting the type of the ${t} scale to "${Jb(i)}".`)}switch(r.type=i,i){case"diverging":case"diverging-sqrt":case"diverging-pow":case"diverging-log":case"diverging-symlog":case"cyclical":case"sequential":case"linear":case"sqrt":case"threshold":case"quantile":case"pow":case"log":case"symlog":r=ew(e,r,Ng);break;case"identity":switch(ob.get(t)){case Xg:r=ew(e,r,Ng);break;case ib:r=ew(e,r,nw)}break;case"utc":case"time":r=ew(e,r,Yg)}switch(i){case"diverging":return function(t,e,r){return Nb(t,n.scaleDiverging(),zb,e,r)}(t,e,r);case"diverging-sqrt":return function(t,e,n){return Wb(t,e,{...n,exponent:.5})}(t,e,r);case"diverging-pow":return Wb(t,e,r);case"diverging-log":return function(t,e,{base:r=10,pivot:i=1,domain:o=$b(e,i<0?Dg:Mg),...a}){return Nb(t,n.scaleDivergingLog().base(r=+r),Fb,e,{domain:o,pivot:i,...a})}(t,e,r);case"diverging-symlog":return Yb(t,e,r);case"categorical":case"ordinal":case Gb:return qb(t,e,r);case"cyclical":case"sequential":case"linear":return function(t,e,r){return Mb(t,n.scaleLinear(),e,r)}(t,e,r);case"sqrt":return function(t,e,n){return Db(t,e,{...n,exponent:.5})}(t,e,r);case"threshold":return Pb(t,0,r);case"quantile":return function(t,e,{range:r,quantiles:i=(void 0===r?5:(r=[...r]).length),n:o=i,scheme:a="rdylbu",domain:u=Rb(e),unknown:s,interpolate:c,reverse:l}){return void 0===r&&(r=void 0!==c?n.quantize(c,o):ob.get(t)===tb?gb(a,o):void 0),u.length>0&&(u=n.scaleQuantile(u,void 0===r?{length:o}:r).quantiles()),Pb(t,0,{domain:u,range:r,reverse:l,unknown:s})}(t,e,r);case"quantize":return function(t,e,{range:r,n:i=(void 0===r?5:(r=[...r]).length),scheme:o="rdylbu",domain:a=Eb(t,e),unknown:u,interpolate:s,reverse:c}){const[l,f]=n.extent(a);let h;return void 0===r?(h=n.ticks(l,f,i),h[0]<=l&&h.splice(0,1),h[h.length-1]>=f&&h.pop(),i=h.length+1,r=void 0!==s?n.quantize(s,i):ob.get(t)===tb?gb(o,i):void 0):(h=n.quantize(n.interpolateNumber(l,f),i+1).slice(1,-1),l instanceof Date&&(h=h.map((t=>new Date(t))))),Jg(Fg(a))<0&&h.reverse(),Pb(t,0,{domain:h,range:r,reverse:c,unknown:u})}(t,e,r);case"pow":return Db(t,e,r);case"log":return function(t,e,{base:r=10,domain:i=Ab(e),...o}){return Mb(t,n.scaleLog().base(r),e,{...o,domain:i})}(t,e,r);case"symlog":return function(t,e,{constant:r=1,...i}){return Mb(t,n.scaleSymlog().constant(r),e,i)}(t,e,r);case"utc":return function(t,e,r){return Bb(t,n.scaleUtc(),e,r)}(t,e,r);case"time":return function(t,e,r){return Bb(t,n.scaleTime(),e,r)}(t,e,r);case"point":return function(t,e,{align:r=.5,padding:i=.5,...o}){return Vb(n.scalePoint().align(r).padding(i),e,o,t)}(t,e,r);case"band":return function(t,e,{align:r=.5,padding:i=.1,paddingInner:o=i,paddingOuter:a=("fx"===t||"fy"===t?0:i),...u}){return Vb(n.scaleBand().align(r).paddingInner(o).paddingOuter(a),e,u,t)}(t,e,r);case"identity":return ob.get(t)===Xg?{type:"identity",scale:n.scaleIdentity()}:{type:"identity"};case void 0:return;default:throw new Error(`unknown scale type: ${i}`)}}(t,void 0===r?void 0:[{hint:r}],{...e})}function Jb(t){return"symbol"==typeof t?t.description:t}const Xb={toString:()=>"projection"};function tw(t){switch(t){case Xg:return"point";case tb:return Gb;default:return"ordinal"}}function ew(t,{domain:e,...n},r){for(const e of t)void 0!==e.value&&(e.value=r(e.value));return{domain:void 0===e?e:r(e),...n}}function nw(t){return Hg(t,cb)}function rw({scale:t,type:e,domain:n,range:r,interpolate:i,interval:o,transform:a,percent:u,pivot:s}){if("identity"===e)return{type:"identity",apply:t=>t,invert:t=>t};const c=t.unknown?t.unknown():void 0;return{type:e,domain:Bg(n),...void 0!==r&&{range:Bg(r)},...void 0!==a&&{transform:a},...u&&{percent:u},...void 0!==c&&{unknown:c},...void 0!==o&&{interval:o},...void 0!==i&&{interpolate:i},...t.clamp&&{clamp:t.clamp()},...void 0!==s&&{pivot:s,symmetric:!1},...t.base&&{base:t.base()},...t.exponent&&{exponent:t.exponent()},...t.constant&&{constant:t.constant()},...t.align&&{align:t.align(),round:t.round()},...t.padding&&(t.paddingInner?{paddingInner:t.paddingInner(),paddingOuter:t.paddingOuter()}:{padding:t.padding()}),...t.bandwidth&&{bandwidth:t.bandwidth(),step:t.step()},apply:e=>t(e),...t.invert&&{invert:e=>t.invert(e)}}}function iw(t){try{var e=Object.keys(t)[0];return function(t={}){let e;for(const n in t)if(ob.has(n)&&Gg(t[n])){if(void 0!==e)throw new Error("ambiguous scale definition; multiple scales found");e=rw(Qb(n,t[n]))}if(void 0===e)throw new Error("invalid scale definition; no scale found");return e}((n={},r=e,i=Object.assign(Object.assign({},t[e]),{clamp:!0}),(r=d(r))in n?Object.defineProperty(n,r,{value:i,enumerable:!0,configurable:!0,writable:!0}):n[r]=i,n))}catch(t){return null}var n,r,i}function ow(t,e,n,r){Object.entries(function(t,e){var n={};return e.hasOwnProperty("opacity")?(n.fill=function(){return e.opacity.baseColor||_p},n["fill-opacity"]=function(e){return null==t?void 0:t.apply(e)}):n.fill=function(e){return"string"==typeof e&&(null==e?void 0:e.startsWith("#"))?e:null==t?void 0:t.apply(e)},n}(e,n)).forEach((function(e){var n=c(e,2),i=n[0],o=n[1];return t.style(i,(function(t){return o(r?t[r]:t)}))}))}var aw=function(){function t(e){a(this,t),this.calendar=e}return s(t,[{key:"populate",value:function(){var t=this.calendar,n=t.options.options,r=n.scale,i=n.subDomain,o=iw(r);t.calendarPainter.root.selectAll(".ch-domain").selectAll("svg").selectAll("g").data((function(e){return t.domainCollection.get(e)||[]})).call((function(t){ow(t.select("rect"),o,r,"v")})).call((function(n){n.select("text").attr("style",(function(t){var n=e.hcl(null==o?void 0:o.apply(t.v)).l>60?"#000":"#fff",r=i.color||(t.v?n:null);return Hm(r)&&(r=r(t.t,t.v,null==o?void 0:o.apply(t.v))),r?"fill: ".concat(r,";"):null})).text((function(e,n,r){return t.dateHelper.format(e.t,i.label,e.v,r[n])}))})).call((function(){t.eventEmitter.emit("fill")}))}}]),t}();function uw(t,e){return t===e||t!=t&&e!=e}function sw(t,e){for(var n=t.length;n--;)if(uw(t[n][0],e))return n;return-1}var cw=Array.prototype.splice;function lw(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}lw.prototype.clear=function(){this.__data__=[],this.size=0},lw.prototype.delete=function(t){var e=this.__data__,n=sw(e,t);return!(n<0)&&(n==e.length-1?e.pop():cw.call(e,n,1),--this.size,!0)},lw.prototype.get=function(t){var e=this.__data__,n=sw(e,t);return n<0?void 0:e[n][1]},lw.prototype.has=function(t){return sw(this.__data__,t)>-1},lw.prototype.set=function(t,e){var n=this.__data__,r=sw(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this};var fw=Mm["__core-js_shared__"],hw=function(){var t=/[^.]+$/.exec(fw&&fw.keys&&fw.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();var dw=Function.prototype.toString;function pw(t){if(null!=t){try{return dw.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var vw=/^\[object .+?Constructor\]$/,yw=Function.prototype,mw=Object.prototype,gw=yw.toString,bw=mw.hasOwnProperty,ww=RegExp("^"+gw.call(bw).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function xw(t){return!(!Nm(t)||(e=t,hw&&hw in e))&&(Hm(t)?ww:vw).test(pw(t));var e}function Ow(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return xw(n)?n:void 0}var kw=Ow(Mm,"Map"),Sw=Ow(Object,"create");var jw=Object.prototype.hasOwnProperty;var _w=Object.prototype.hasOwnProperty;function Mw(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function Dw(t,e){var n,r,i=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?i["string"==typeof e?"string":"hash"]:i.map}function Pw(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}Mw.prototype.clear=function(){this.__data__=Sw?Sw(null):{},this.size=0},Mw.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},Mw.prototype.get=function(t){var e=this.__data__;if(Sw){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return jw.call(e,t)?e[t]:void 0},Mw.prototype.has=function(t){var e=this.__data__;return Sw?void 0!==e[t]:_w.call(e,t)},Mw.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=Sw&&void 0===e?"__lodash_hash_undefined__":e,this},Pw.prototype.clear=function(){this.size=0,this.__data__={hash:new Mw,map:new(kw||lw),string:new Mw}},Pw.prototype.delete=function(t){var e=Dw(this,t).delete(t);return this.size-=e?1:0,e},Pw.prototype.get=function(t){return Dw(this,t).get(t)},Pw.prototype.has=function(t){return Dw(this,t).has(t)},Pw.prototype.set=function(t,e){var n=Dw(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this};function $w(t){var e=this.__data__=new lw(t);this.size=e.size}$w.prototype.clear=function(){this.__data__=new lw,this.size=0},$w.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},$w.prototype.get=function(t){return this.__data__.get(t)},$w.prototype.has=function(t){return this.__data__.has(t)},$w.prototype.set=function(t,e){var n=this.__data__;if(n instanceof lw){var r=n.__data__;if(!kw||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new Pw(r)}return n.set(t,e),this.size=n.size,this};var Ew=function(){try{var t=Ow(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),Lw=Ew;function Tw(t,e,n){"__proto__"==e&&Lw?Lw(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n}function Cw(t,e,n){(void 0!==n&&!uw(t[e],n)||void 0===n&&!(e in t))&&Tw(t,e,n)}var Aw,Rw=function(t,e,n){for(var r=-1,i=Object(t),o=n(t),a=o.length;a--;){var u=o[Aw?a:++r];if(!1===e(i[u],u,i))break}return t},Iw=Rw,Nw="object"==typeof exports&&exports&&!exports.nodeType&&exports,Ww=Nw&&"object"==typeof module&&module&&!module.nodeType&&module,Yw=Ww&&Ww.exports===Nw?Mm.Buffer:void 0,zw=Yw?Yw.allocUnsafe:void 0;var Fw=Mm.Uint8Array;function Hw(t,e){var n,r,i=e?(n=t.buffer,r=new n.constructor(n.byteLength),new Fw(r).set(new Fw(n)),r):t.buffer;return new t.constructor(i,t.byteOffset,t.length)}var Bw=Object.create,Gw=function(){function t(){}return function(e){if(!Nm(e))return{};if(Bw)return Bw(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}();function Uw(t,e){return function(n){return t(e(n))}}var qw=Uw(Object.getPrototypeOf,Object),Vw=Object.prototype;function Kw(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||Vw)}function Zw(t){return null!=t&&"object"==typeof t}function Qw(t){return Zw(t)&&"[object Arguments]"==Im(t)}var Jw=Object.prototype,Xw=Jw.hasOwnProperty,tx=Jw.propertyIsEnumerable,ex=Qw(function(){return arguments}())?Qw:function(t){return Zw(t)&&Xw.call(t,"callee")&&!tx.call(t,"callee")},nx=ex,rx=9007199254740991;function ix(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=rx}function ox(t){return null!=t&&ix(t.length)&&!Hm(t)}var ax="object"==typeof exports&&exports&&!exports.nodeType&&exports,ux=ax&&"object"==typeof module&&module&&!module.nodeType&&module,sx=ux&&ux.exports===ax?Mm.Buffer:void 0,cx=(sx?sx.isBuffer:void 0)||function(){return!1},lx="[object Object]",fx=Function.prototype,hx=Object.prototype,dx=fx.toString,px=hx.hasOwnProperty,vx=dx.call(Object);var yx={};yx["[object Float32Array]"]=yx["[object Float64Array]"]=yx["[object Int8Array]"]=yx["[object Int16Array]"]=yx["[object Int32Array]"]=yx["[object Uint8Array]"]=yx["[object Uint8ClampedArray]"]=yx["[object Uint16Array]"]=yx["[object Uint32Array]"]=!0,yx["[object Arguments]"]=yx["[object Array]"]=yx["[object ArrayBuffer]"]=yx["[object Boolean]"]=yx["[object DataView]"]=yx["[object Date]"]=yx["[object Error]"]=yx["[object Function]"]=yx["[object Map]"]=yx["[object Number]"]=yx["[object Object]"]=yx["[object RegExp]"]=yx["[object Set]"]=yx["[object String]"]=yx["[object WeakMap]"]=!1;var mx,gx="object"==typeof exports&&exports&&!exports.nodeType&&exports,bx=gx&&"object"==typeof module&&module&&!module.nodeType&&module,wx=bx&&bx.exports===gx&&jm.process,xx=function(){try{var t=bx&&bx.require&&bx.require("util").types;return t||wx&&wx.binding&&wx.binding("util")}catch(t){}}(),Ox=xx&&xx.isTypedArray,kx=Ox?(mx=Ox,function(t){return mx(t)}):function(t){return Zw(t)&&ix(t.length)&&!!yx[Im(t)]};function Sx(t,e){if(("constructor"!==e||"function"!=typeof t[e])&&"__proto__"!=e)return t[e]}var jx=Object.prototype.hasOwnProperty;function _x(t,e,n){var r=t[e];jx.call(t,e)&&uw(r,n)&&(void 0!==n||e in t)||Tw(t,e,n)}var Mx=9007199254740991,Dx=/^(?:0|[1-9]\d*)$/;function Px(t,e){var n=typeof t;return!!(e=null==e?Mx:e)&&("number"==n||"symbol"!=n&&Dx.test(t))&&t>-1&&t%1==0&&t<e}var $x=Object.prototype.hasOwnProperty;function Ex(t,e){var n=wh(t),r=!n&&nx(t),i=!n&&!r&&cx(t),o=!n&&!r&&!i&&kx(t),a=n||r||i||o,u=a?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],s=u.length;for(var c in t)!e&&!$x.call(t,c)||a&&("length"==c||i&&("offset"==c||"parent"==c)||o&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||Px(c,s))||u.push(c);return u}var Lx=Object.prototype.hasOwnProperty;function Tx(t){if(!Nm(t))return function(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}(t);var e=Kw(t),n=[];for(var r in t)("constructor"!=r||!e&&Lx.call(t,r))&&n.push(r);return n}function Cx(t){return ox(t)?Ex(t,!0):Tx(t)}function Ax(t){return function(t,e,n,r){var i=!n;n||(n={});for(var o=-1,a=e.length;++o<a;){var u=e[o],s=r?r(n[u],t[u],u,n,t):void 0;void 0===s&&(s=t[u]),i?Tw(n,u,s):_x(n,u,s)}return n}(t,Cx(t))}function Rx(t,e,n,r,i,o,a){var u=Sx(t,n),s=Sx(e,n),c=a.get(s);if(c)Cw(t,n,c);else{var l,f=o?o(u,s,n+"",t,e,a):void 0,h=void 0===f;if(h){var d=wh(s),p=!d&&cx(s),v=!d&&!p&&kx(s);f=s,d||p||v?wh(u)?f=u:Zw(l=u)&&ox(l)?f=function(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}(u):p?(h=!1,f=function(t,e){if(e)return t.slice();var n=t.length,r=zw?zw(n):new t.constructor(n);return t.copy(r),r}(s,!0)):v?(h=!1,f=Hw(s,!0)):f=[]:function(t){if(!Zw(t)||Im(t)!=lx)return!1;var e=qw(t);if(null===e)return!0;var n=px.call(e,"constructor")&&e.constructor;return"function"==typeof n&&n instanceof n&&dx.call(n)==vx}(s)||nx(s)?(f=u,nx(u)?f=Ax(u):Nm(u)&&!Hm(u)||(f=function(t){return"function"!=typeof t.constructor||Kw(t)?{}:Gw(qw(t))}(s))):h=!1}h&&(a.set(s,f),i(f,s,r,o,a),a.delete(s)),Cw(t,n,f)}}function Ix(t,e,n,r,i){t!==e&&Iw(e,(function(o,a){if(i||(i=new $w),Nm(o))Rx(t,e,a,n,Ix,r,i);else{var u=r?r(Sx(t,a),o,a+"",t,e,i):void 0;void 0===u&&(u=o),Cw(t,a,u)}}),Cx)}function Nx(t){return t}var Wx=Math.max;var Yx=Lw?function(t,e){return Lw(t,"toString",{configurable:!0,enumerable:!1,value:(n=e,function(){return n}),writable:!0});var n}:Nx,zx=Yx,Fx=Date.now;var Hx=function(t){var e=0,n=0;return function(){var r=Fx(),i=16-(r-n);if(n=r,i>0){if(++e>=800)return arguments[0]}else e=0;return t.apply(void 0,arguments)}}(zx),Bx=Hx;function Gx(t,e){return Bx(function(t,e,n){return e=Wx(void 0===e?t.length-1:e,0),function(){for(var r=arguments,i=-1,o=Wx(r.length-e,0),a=Array(o);++i<o;)a[i]=r[e+i];i=-1;for(var u=Array(e+1);++i<e;)u[i]=r[i];return u[e]=n(a),function(t,e,n){switch(n.length){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}(t,this,u)}}(t,e,Nx),t+"")}var Ux,qx=(Ux=function(t,e,n,r){Ix(t,e,n,r)},Gx((function(t,e){var n=-1,r=e.length,i=r>1?e[r-1]:void 0,o=r>2?e[2]:void 0;for(i=Ux.length>3&&"function"==typeof i?(r--,i):void 0,o&&function(t,e,n){if(!Nm(n))return!1;var r=typeof e;return!!("number"==r?ox(n)&&Px(e,n.length):"string"==r&&e in n)&&uw(n[e],t)}(e[0],e[1],o)&&(i=r<3?void 0:i,r=1),t=Object(t);++n<r;){var a=e[n];a&&Ux(t,a,n,i)}return t}))),Vx=qx;function Kx(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new Pw;++e<n;)this.add(t[e])}function Zx(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}Kx.prototype.add=Kx.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},Kx.prototype.has=function(t){return this.__data__.has(t)};var Qx=1,Jx=2;function Xx(t,e,n,r,i,o){var a=n&Qx,u=t.length,s=e.length;if(u!=s&&!(a&&s>u))return!1;var c=o.get(t),l=o.get(e);if(c&&l)return c==e&&l==t;var f=-1,h=!0,d=n&Jx?new Kx:void 0;for(o.set(t,e),o.set(e,t);++f<u;){var p=t[f],v=e[f];if(r)var y=a?r(v,p,f,e,t,o):r(p,v,f,t,e,o);if(void 0!==y){if(y)continue;h=!1;break}if(d){if(!Zx(e,(function(t,e){if(a=e,!d.has(a)&&(p===t||i(p,t,n,r,o)))return d.push(e);var a}))){h=!1;break}}else if(p!==v&&!i(p,v,n,r,o)){h=!1;break}}return o.delete(t),o.delete(e),h}function tO(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n}function eO(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n}var nO=1,rO=2,iO="[object Boolean]",oO="[object Date]",aO="[object Error]",uO="[object Map]",sO="[object Number]",cO="[object RegExp]",lO="[object Set]",fO="[object String]",hO="[object Symbol]",dO="[object ArrayBuffer]",pO="[object DataView]",vO=Dm?Dm.prototype:void 0,yO=vO?vO.valueOf:void 0;var mO=Object.prototype.propertyIsEnumerable,gO=Object.getOwnPropertySymbols,bO=gO?function(t){return null==t?[]:(t=Object(t),function(t,e){for(var n=-1,r=null==t?0:t.length,i=0,o=[];++n<r;){var a=t[n];e(a,n,t)&&(o[i++]=a)}return o}(gO(t),(function(e){return mO.call(t,e)})))}:function(){return[]},wO=bO,xO=Uw(Object.keys,Object),OO=Object.prototype.hasOwnProperty;function kO(t){return ox(t)?Ex(t):function(t){if(!Kw(t))return xO(t);var e=[];for(var n in Object(t))OO.call(t,n)&&"constructor"!=n&&e.push(n);return e}(t)}function SO(t){return function(t,e,n){var r=e(t);return wh(t)?r:function(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}(r,n(t))}(t,kO,wO)}var jO=1,_O=Object.prototype.hasOwnProperty;var MO=Ow(Mm,"DataView"),DO=Ow(Mm,"Promise"),PO=Ow(Mm,"Set"),$O=Ow(Mm,"WeakMap"),EO="[object Map]",LO="[object Promise]",TO="[object Set]",CO="[object WeakMap]",AO="[object DataView]",RO=pw(MO),IO=pw(kw),NO=pw(DO),WO=pw(PO),YO=pw($O),zO=Im;(MO&&zO(new MO(new ArrayBuffer(1)))!=AO||kw&&zO(new kw)!=EO||DO&&zO(DO.resolve())!=LO||PO&&zO(new PO)!=TO||$O&&zO(new $O)!=CO)&&(zO=function(t){var e=Im(t),n="[object Object]"==e?t.constructor:void 0,r=n?pw(n):"";if(r)switch(r){case RO:return AO;case IO:return EO;case NO:return LO;case WO:return TO;case YO:return CO}return e});var FO=zO,HO=1,BO="[object Arguments]",GO="[object Array]",UO="[object Object]",qO=Object.prototype.hasOwnProperty;function VO(t,e,n,r,i,o){var a=wh(t),u=wh(e),s=a?GO:FO(t),c=u?GO:FO(e),l=(s=s==BO?UO:s)==UO,f=(c=c==BO?UO:c)==UO,h=s==c;if(h&&cx(t)){if(!cx(e))return!1;a=!0,l=!1}if(h&&!l)return o||(o=new $w),a||kx(t)?Xx(t,e,n,r,i,o):function(t,e,n,r,i,o,a){switch(n){case pO:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case dO:return!(t.byteLength!=e.byteLength||!o(new Fw(t),new Fw(e)));case iO:case oO:case sO:return uw(+t,+e);case aO:return t.name==e.name&&t.message==e.message;case cO:case fO:return t==e+"";case uO:var u=tO;case lO:var s=r&nO;if(u||(u=eO),t.size!=e.size&&!s)return!1;var c=a.get(t);if(c)return c==e;r|=rO,a.set(t,e);var l=Xx(u(t),u(e),r,i,o,a);return a.delete(t),l;case hO:if(yO)return yO.call(t)==yO.call(e)}return!1}(t,e,s,n,r,i,o);if(!(n&HO)){var d=l&&qO.call(t,"__wrapped__"),p=f&&qO.call(e,"__wrapped__");if(d||p){var v=d?t.value():t,y=p?e.value():e;return o||(o=new $w),i(v,y,n,r,o)}}return!!h&&(o||(o=new $w),function(t,e,n,r,i,o){var a=n&jO,u=SO(t),s=u.length;if(s!=SO(e).length&&!a)return!1;for(var c=s;c--;){var l=u[c];if(!(a?l in e:_O.call(e,l)))return!1}var f=o.get(t),h=o.get(e);if(f&&h)return f==e&&h==t;var d=!0;o.set(t,e),o.set(e,t);for(var p=a;++c<s;){var v=t[l=u[c]],y=e[l];if(r)var m=a?r(y,v,l,e,t,o):r(v,y,l,t,e,o);if(!(void 0===m?v===y||i(v,y,n,r,o):m)){d=!1;break}p||(p="constructor"==l)}if(d&&!p){var g=t.constructor,b=e.constructor;g==b||!("constructor"in t)||!("constructor"in e)||"function"==typeof g&&g instanceof g&&"function"==typeof b&&b instanceof b||(d=!1)}return o.delete(t),o.delete(e),d}(t,e,n,r,i,o))}function KO(t,e,n,r,i){return t===e||(null==t||null==e||!Zw(t)&&!Zw(e)?t!=t&&e!=e:VO(t,e,n,r,KO,i))}function ZO(t,e){return KO(t,e)}var QO=Object.prototype.hasOwnProperty;function JO(t,e){return null!=t&&QO.call(t,e)}var XO="[object Symbol]";function tk(t){return"symbol"==typeof t||Zw(t)&&Im(t)==XO}var ek=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,nk=/^\w*$/;var rk="Expected a function";function ik(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError(rk);var n=function(){var r=arguments,i=e?e.apply(this,r):r[0],o=n.cache;if(o.has(i))return o.get(i);var a=t.apply(this,r);return n.cache=o.set(i,a)||o,a};return n.cache=new(ik.Cache||Pw),n}ik.Cache=Pw;var ok=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,ak=/\\(\\)?/g,uk=function(t){var e=ik(t,(function(t){return 500===n.size&&n.clear(),t})),n=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(ok,(function(t,n,r,i){e.push(r?i.replace(ak,"$1"):n||t)})),e})),sk=uk;var ck=1/0,lk=Dm?Dm.prototype:void 0,fk=lk?lk.toString:void 0;function hk(t){if("string"==typeof t)return t;if(wh(t))return function(t,e){for(var n=-1,r=null==t?0:t.length,i=Array(r);++n<r;)i[n]=e(t[n],n,t);return i}(t,hk)+"";if(tk(t))return fk?fk.call(t):"";var e=t+"";return"0"==e&&1/t==-ck?"-0":e}function dk(t,e){return wh(t)?t:function(t,e){if(wh(t))return!1;var n=typeof t;return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!tk(t))||nk.test(t)||!ek.test(t)||null!=e&&t in Object(e)}(t,e)?[t]:sk(function(t){return null==t?"":hk(t)}(t))}var pk=1/0;function vk(t){if("string"==typeof t||tk(t))return t;var e=t+"";return"0"==e&&1/t==-pk?"-0":e}function yk(t,e){return null!=t&&function(t,e,n){for(var r=-1,i=(e=dk(e,t)).length,o=!1;++r<i;){var a=vk(e[r]);if(!(o=null!=t&&n(t,a)))break;t=t[a]}return o||++r!=i?o:!!(i=null==t?0:t.length)&&ix(i)&&Px(a,i)&&(wh(t)||nx(t))}(t,e,JO)}function mk(t,e,n){var r=null==t?void 0:function(t,e){for(var n=0,r=(e=dk(e,t)).length;null!=t&&n<r;)t=t[vk(e[n++])];return n&&n==r?t:void 0}(t,e);return void 0===r?n:r}function gk(t,e,n){return null==t?t:function(t,e,n,r){if(!Nm(t))return t;for(var i=-1,o=(e=dk(e,t)).length,a=o-1,u=t;null!=u&&++i<o;){var s=vk(e[i]),c=n;if("__proto__"===s||"constructor"===s||"prototype"===s)return t;if(i!=a){var l=u[s];void 0===(c=r?r(l,s,u):void 0)&&(c=Nm(l)?l:Px(e[i+1])?[]:{})}_x(u,s,c),u=u[s]}return t}(t,e,n)}var bk,wk,xk={range:function(t){return Math.max(+t,1)},"date.highlight":function(t){return xh(t)},"subDomain.label":function(t){return function(t){return"string"==typeof t||!wh(t)&&Zw(t)&&"[object String]"==Im(t)}(t)&&""!==t||Hm(t)?t:null}},Ok=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:xk;a(this,t),this.preProcessors=e,this.options={itemSelector:"#cal-heatmap",range:12,domain:{type:"hour",gutter:4,padding:[0,0,0,0],dynamicDimension:!0,sort:"asc",label:{text:void 0,position:"bottom",textAlign:"middle",offset:{x:0,y:0},rotate:null,width:100,height:25}},subDomain:{type:"minute",width:10,height:10,gutter:2,radius:0,label:null,color:void 0,sort:"asc"},date:{start:new Date,min:void 0,max:void 0,highlight:[],locale:"en",timezone:void 0},verticalOrientation:!1,data:{source:"",type:"json",requestInit:{},x:"",y:"",groupY:"sum",defaultValue:null},scale:void 0,animationDuration:200,theme:"light",x:{domainHorizontalLabelWidth:0,domainVerticalLabelHeight:0}}}return s(t,[{key:"set",value:function(t,e){return!(!yk(this.options,t)||ZO(mk(this.options,t),e))&&(gk(this.options,t,yk(this.preProcessors,t)?mk(this.preProcessors,t)(e):e),!0)}},{key:"init",value:function(t){var e=this;this.options=Object.assign({},Vx(this.options,t,(function(t,e){return Array.isArray(e)?e:void 0})));var n=this.options;Object.keys(this.preProcessors).forEach((function(t){gk(n,t,mk(e.preProcessors,t)(mk(n,t)))})),void 0===n.scale&&this.initScale(),n.x.domainVerticalLabelHeight=n.domain.label.height,"top"===n.domain.label.position||"bottom"===n.domain.label.position?n.x.domainHorizontalLabelWidth=0:(n.x.domainVerticalLabelHeight=0,n.x.domainHorizontalLabelWidth=n.domain.label.width),null!==n.domain.label.text&&""!==n.domain.label.text||(n.x.domainVerticalLabelHeight=0,n.x.domainHorizontalLabelWidth=0)}},{key:"initScale",value:function(){this.options.scale={color:{scheme:"YlOrBr",type:"quantize",domain:Mp}}}}]),t}(),kk=Yt,Sk=P,jk=m.RegExp,_k=Sk((function(){var t=jk("a","y");return t.lastIndex=2,null!==t.exec("abcd")})),Mk=_k||Sk((function(){return!jk("a","y").sticky})),Dk=_k||Sk((function(){var t=jk("^r","gy");return t.lastIndex=2,null!==t.exec("str")})),Pk={BROKEN_CARET:Dk,MISSED_STICKY:Mk,UNSUPPORTED_Y:_k},$k=P,Ek=m.RegExp,Lk=$k((function(){var t=Ek(".","s");return!(t.dotAll&&t.test("\n")&&"s"===t.flags)})),Tk=P,Ck=m.RegExp,Ak=Tk((function(){var t=Ck("(?<a>b)","g");return"b"!==t.exec("b").groups.a||"bc"!=="b".replace(t,"$<a>c")})),Rk=Ht,Ik=A,Nk=cf,Wk=function(){var t=kk(this),e="";return t.hasIndices&&(e+="d"),t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.dotAll&&(e+="s"),t.unicode&&(e+="u"),t.unicodeSets&&(e+="v"),t.sticky&&(e+="y"),e},Yk=Pk,zk=zc,Fk=gn.get,Hk=Lk,Bk=Ak,Gk=D("native-string-replace",String.prototype.replace),Uk=RegExp.prototype.exec,qk=Uk,Vk=Ik("".charAt),Kk=Ik("".indexOf),Zk=Ik("".replace),Qk=Ik("".slice),Jk=(wk=/b*/g,Rk(Uk,bk=/a/,"a"),Rk(Uk,wk,"a"),0!==bk.lastIndex||0!==wk.lastIndex),Xk=Yk.BROKEN_CARET,tS=void 0!==/()??/.exec("")[1];(Jk||tS||Xk||Hk||Bk)&&(qk=function(t){var e,n,r,i,o,a,u,s=this,c=Fk(s),l=Nk(t),f=c.raw;if(f)return f.lastIndex=s.lastIndex,e=Rk(qk,f,l),s.lastIndex=f.lastIndex,e;var h=c.groups,d=Xk&&s.sticky,p=Rk(Wk,s),v=s.source,y=0,m=l;if(d&&(p=Zk(p,"y",""),-1===Kk(p,"g")&&(p+="g"),m=Qk(l,s.lastIndex),s.lastIndex>0&&(!s.multiline||s.multiline&&"\n"!==Vk(l,s.lastIndex-1))&&(v="(?: "+v+")",m=" "+m,y++),n=new RegExp("^(?:"+v+")",p)),tS&&(n=new RegExp("^"+v+"$(?!\\s)",p)),Jk&&(r=s.lastIndex),i=Rk(Uk,d?n:s,m),d?i?(i.input=Qk(i.input,y),i[0]=Qk(i[0],y),i.index=s.lastIndex,s.lastIndex+=i[0].length):s.lastIndex=0:Jk&&i&&(s.lastIndex=s.global?i.index+i[0].length:r),tS&&i&&i.length>1&&Rk(Gk,i[0],n,(function(){for(o=1;o<arguments.length-2;o++)void 0===arguments[o]&&(i[o]=void 0)})),i&&h)for(i.groups=a=zk(null),o=0;o<h.length;o++)a[(u=h[o])[0]]=i[u[1]];return i});var eS=qk;Si({target:"RegExp",proto:!0,forced:/./.exec!==eS},{exec:eS});var nS,rS,iS=Po,oS=zn,aS=eS,uS=P,sS=gt,cS=Xe,lS=sS("species"),fS=RegExp.prototype,hS=gf.charAt,dS=A,pS=F,vS=Math.floor,yS=dS("".charAt),mS=dS("".replace),gS=dS("".slice),bS=/\$([$&'`]|\d{1,2}|<[^>]*>)/g,wS=/\$([$&'`]|\d{1,2})/g,xS=Ht,OS=Yt,kS=St,SS=Gn,jS=eS,_S=TypeError,MS=_o,DS=Ht,PS=A,$S=function(t,e,n,r){var i=sS(t),o=!uS((function(){var e={};return e[i]=function(){return 7},7!==""[t](e)})),a=o&&!uS((function(){var e=!1,n=/a/;return"split"===t&&((n={}).constructor={},n.constructor[lS]=function(){return n},n.flags="",n[i]=/./[i]),n.exec=function(){return e=!0,null},n[i](""),!e}));if(!o||!a||n){var u=iS(/./[i]),s=e(i,""[t],(function(t,e,n,r,i){var a=iS(t),s=e.exec;return s===aS||s===fS.exec?o&&!i?{done:!0,value:u(e,n,r)}:{done:!0,value:a(n,e,r)}:{done:!1}}));oS(String.prototype,t,s[0]),oS(fS,i,s[1])}r&&cS(fS[i],"sham",!0)},ES=P,LS=Yt,TS=St,CS=R,AS=Mr,RS=Cr,IS=cf,NS=W,WS=function(t,e,n){return e+(n?hS(t,e).length:1)},YS=ue,zS=function(t,e,n,r,i,o){var a=n+t.length,u=r.length,s=wS;return void 0!==i&&(i=pS(i),s=bS),mS(o,s,(function(o,s){var c;switch(yS(s,0)){case"$":return"$";case"&":return t;case"`":return gS(e,0,n);case"'":return gS(e,a);case"<":c=i[gS(s,1,-1)];break;default:var l=+s;if(0===l)return o;if(l>u){var f=vS(l/10);return 0===f?o:f<=u?void 0===r[f-1]?yS(s,1):r[f-1]+yS(s,1):o}c=r[l-1]}return void 0===c?"":c}))},FS=function(t,e){var n=t.exec;if(kS(n)){var r=xS(n,t,e);return null!==r&&OS(r),r}if("RegExp"===SS(t))return xS(jS,t,e);throw new _S("RegExp#exec called on incompatible receiver")},HS=gt("replace"),BS=Math.max,GS=Math.min,US=PS([].concat),qS=PS([].push),VS=PS("".indexOf),KS=PS("".slice),ZS="$0"==="a".replace(/./,"$0"),QS=!!/./[HS]&&""===/./[HS]("a","$0"),JS=!ES((function(){var t=/./;return t.exec=function(){var t=[];return t.groups={a:"7"},t},"7"!=="".replace(t,"$<a>")}));$S("replace",(function(t,e,n){var r=QS?"$":"$0";return[function(t,n){var r=NS(this),i=CS(t)?void 0:YS(t,HS);return i?DS(i,t,r,n):DS(e,IS(r),t,n)},function(t,i){var o=LS(this),a=IS(t);if("string"==typeof i&&-1===VS(i,r)&&-1===VS(i,"$<")){var u=n(e,o,a,i);if(u.done)return u.value}var s=TS(i);s||(i=IS(i));var c,l=o.global;l&&(c=o.unicode,o.lastIndex=0);for(var f,h=[];null!==(f=FS(o,a))&&(qS(h,f),l);){""===IS(f[0])&&(o.lastIndex=WS(a,RS(o.lastIndex),c))}for(var d,p="",v=0,y=0;y<h.length;y++){for(var m,g=IS((f=h[y])[0]),b=BS(GS(AS(f.index),a.length),0),w=[],x=1;x<f.length;x++)qS(w,void 0===(d=f[x])?d:String(d));var O=f.groups;if(s){var k=US([g],w,b,a);void 0!==O&&qS(k,O),m=IS(MS(i,void 0,k))}else m=zS(g,a,b,w,O,i);b>=v&&(p+=KS(a,v,b)+m,v=b+g.length)}return p+KS(a,v)}]}),!JS||!ZS||QS);var XS=function(){function t(e){a(this,t),nS.add(this),this.calendar=e}return s(t,[{key:"getDatas",value:function(t,e,n){return yh(this,void 0,void 0,i().mark((function r(){var o;return i().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(!("string"==typeof t&&t.length>0)){r.next=2;break}return r.abrupt("return",mh(this,nS,"m",rS).call(this,t,e,n));case 2:return o=[],Array.isArray(t)&&(o=t),r.abrupt("return",new Promise((function(t){t(o)})));case 5:case"end":return r.stop()}}),r,this)})))}},{key:"parseURI",value:function(t,e,n){var r=this,i=t.replace(/\{\{start=(.*?)\}\}/g,(function(t,n){return r.calendar.dateHelper.date(e).format(n)}));return i=i.replace(/\{\{end=(.*?)\}\}/g,(function(t,e){return r.calendar.dateHelper.date(n).format(e)}))}}]),t}();nS=new WeakSet,rS=function(t,e,n){var i=this.calendar.options.options.data,o=i.type,a=i.requestInit,u=this.parseURI(t,e,n);switch(o){case"json":return r.json(u,a);case"csv":return r.csv(u,a);case"tsv":return r.dsv("\t",u,a);case"txt":return r.text(u,a);default:return new Promise((function(t){t([])}))}};var tj=_t,ej=We.EXISTS,nj=A,rj=zi,ij=Function.prototype,oj=nj(ij.toString),aj=/function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/,uj=nj(aj.exec);tj&&!ej&&rj(ij,"name",{configurable:!0,get:function(){try{return uj(aj,oj(this))[1]}catch(t){return""}}});var sj={exports:{}};!function(t,e){t.exports=function(){var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",o="minute",a="hour",u="day",s="week",c="month",l="quarter",f="year",h="date",d="Invalid Date",p=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,v=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,y={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),o=n-i<0,a=e.clone().add(r+(o?-1:1),c);return+(-(r+(n-i)/(o?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:c,y:f,w:s,d:u,D:h,h:a,m:o,s:i,ms:r,Q:l}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},b="en",w={};w[b]=y;var x="$isDayjsObject",O=function(t){return t instanceof _||!(!t||!t[x])},k=function t(e,n,r){var i;if(!e)return b;if("string"==typeof e){var o=e.toLowerCase();w[o]&&(i=o),n&&(w[o]=n,i=o);var a=e.split("-");if(!i&&a.length>1)return t(a[0])}else{var u=e.name;w[u]=e,i=u}return!r&&i&&(b=i),i||!r&&b},S=function(t,e){if(O(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},j=g;j.l=k,j.i=O,j.w=function(t,e){return S(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function y(t){this.$L=k(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[x]=!0}var m=y.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(j.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(p);if(r){var i=r[2]-1||0,o=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,o)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,o)}}return new Date(e)}(t),this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return j},m.isValid=function(){return!(this.$d.toString()===d)},m.isSame=function(t,e){var n=S(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return S(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<S(t)},m.$g=function(t,e,n){return j.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!j.u(e)||e,l=j.p(t),d=function(t,e){var i=j.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(u)},p=function(t,e){return j.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},v=this.$W,y=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(l){case f:return r?d(1,0):d(31,11);case c:return r?d(1,y):d(0,y+1);case s:var b=this.$locale().weekStart||0,w=(v<b?v+7:v)-b;return d(r?m-w:m+(6-w),y);case u:case h:return p(g+"Hours",0);case a:return p(g+"Minutes",1);case o:return p(g+"Seconds",2);case i:return p(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,s=j.p(t),l="set"+(this.$u?"UTC":""),d=(n={},n[u]=l+"Date",n[h]=l+"Date",n[c]=l+"Month",n[f]=l+"FullYear",n[a]=l+"Hours",n[o]=l+"Minutes",n[i]=l+"Seconds",n[r]=l+"Milliseconds",n)[s],p=s===u?this.$D+(e-this.$W):e;if(s===c||s===f){var v=this.clone().set(h,1);v.$d[d](p),v.init(),this.$d=v.set(h,Math.min(this.$D,v.daysInMonth())).$d}else d&&this.$d[d](p);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[j.p(t)]()},m.add=function(r,l){var h,d=this;r=Number(r);var p=j.p(l),v=function(t){var e=S(d);return j.w(e.date(e.date()+Math.round(t*r)),d)};if(p===c)return this.set(c,this.$M+r);if(p===f)return this.set(f,this.$y+r);if(p===u)return v(1);if(p===s)return v(7);var y=(h={},h[o]=e,h[a]=n,h[i]=t,h)[p]||1,m=this.$d.getTime()+r*y;return j.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||d;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=j.z(this),o=this.$H,a=this.$m,u=this.$M,s=n.weekdays,c=n.months,l=n.meridiem,f=function(t,n,i,o){return t&&(t[n]||t(e,r))||i[n].slice(0,o)},h=function(t){return j.s(o%12||12,t,"0")},p=l||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(v,(function(t,r){return r||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return j.s(e.$y,4,"0");case"M":return u+1;case"MM":return j.s(u+1,2,"0");case"MMM":return f(n.monthsShort,u,c,3);case"MMMM":return f(c,u);case"D":return e.$D;case"DD":return j.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return f(n.weekdaysMin,e.$W,s,2);case"ddd":return f(n.weekdaysShort,e.$W,s,3);case"dddd":return s[e.$W];case"H":return String(o);case"HH":return j.s(o,2,"0");case"h":return h(1);case"hh":return h(2);case"a":return p(o,a,!0);case"A":return p(o,a,!1);case"m":return String(a);case"mm":return j.s(a,2,"0");case"s":return String(e.$s);case"ss":return j.s(e.$s,2,"0");case"SSS":return j.s(e.$ms,3,"0");case"Z":return i}return null}(t)||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,h,d){var p,v=this,y=j.p(h),m=S(r),g=(m.utcOffset()-this.utcOffset())*e,b=this-m,w=function(){return j.m(v,m)};switch(y){case f:p=w()/12;break;case c:p=w();break;case l:p=w()/3;break;case s:p=(b-g)/6048e5;break;case u:p=(b-g)/864e5;break;case a:p=b/n;break;case o:p=b/e;break;case i:p=b/t;break;default:p=b}return d?p:j.a(p)},m.daysInMonth=function(){return this.endOf(c).$D},m.$locale=function(){return w[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=k(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return j.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},y}(),M=_.prototype;return S.prototype=M,[["$ms",r],["$s",i],["$m",o],["$H",a],["$W",u],["$M",c],["$y",f],["$D",h]].forEach((function(t){M[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),S.extend=function(t,e){return t.$i||(t(e,_,S),t.$i=!0),S},S.locale=k,S.isDayjs=O,S.unix=function(t){return S(1e3*t)},S.en=w[b],S.Ls=w,S.p={},S}()}(sj);var cj=v(sj.exports),lj={exports:{}};!function(t,e){var n,r;t.exports=(n="week",r="year",function(t,e,i){var o=e.prototype;o.week=function(t){if(void 0===t&&(t=null),null!==t)return this.add(7*(t-this.week()),"day");var e=this.$locale().yearStart||1;if(11===this.month()&&this.date()>25){var o=i(this).startOf(r).add(1,r).date(e),a=i(this).endOf(n);if(o.isBefore(a))return 1}var u=i(this).startOf(r).date(e).startOf(n).subtract(1,"millisecond"),s=this.diff(u,n,!0);return s<0?i(this).startOf("week").week():Math.ceil(s)},o.weeks=function(t){return void 0===t&&(t=null),this.week(t)}})}(lj);var fj=v(lj.exports),hj={exports:{}};!function(t,e){t.exports=function(t,e,n){e.prototype.dayOfYear=function(t){var e=Math.round((n(this).startOf("day")-n(this).startOf("year"))/864e5)+1;return null==t?e:this.add(t-e,"day")}}}(hj);var dj=v(hj.exports),pj={exports:{}};!function(t,e){t.exports=function(t,e){e.prototype.weekday=function(t){var e=this.$locale().weekStart||0,n=this.$W,r=(n<e?n+7:n)-e;return this.$utils().u(t)?r:this.subtract(r,"day").add(t,"day")}}}(pj);var vj=v(pj.exports),yj={exports:{}};!function(t,e){t.exports=function(t,e,n){var r=function(t,e){if(!e||!e.length||1===e.length&&!e[0]||1===e.length&&Array.isArray(e[0])&&!e[0].length)return null;var n;1===e.length&&e[0].length>0&&(e=e[0]),n=(e=e.filter((function(t){return t})))[0];for(var r=1;r<e.length;r+=1)e[r].isValid()&&!e[r][t](n)||(n=e[r]);return n};n.max=function(){var t=[].slice.call(arguments,0);return r("isAfter",t)},n.min=function(){var t=[].slice.call(arguments,0);return r("isBefore",t)}}}(yj);var mj=v(yj.exports),gj={exports:{}};!function(t,e){t.exports=function(t,e){e.prototype.isoWeeksInYear=function(){var t=this.isLeapYear(),e=this.endOf("y").day();return 4===e||t&&5===e?53:52}}}(gj);var bj=v(gj.exports),wj={exports:{}};!function(t,e){var n;t.exports=(n="day",function(t,e,r){var i=function(t){return t.add(4-t.isoWeekday(),n)},o=e.prototype;o.isoWeekYear=function(){return i(this).year()},o.isoWeek=function(t){if(!this.$utils().u(t))return this.add(7*(t-this.isoWeek()),n);var e,o,a,u=i(this),s=(e=this.isoWeekYear(),a=4-(o=(this.$u?r.utc:r)().year(e).startOf("year")).isoWeekday(),o.isoWeekday()>4&&(a+=7),o.add(a,n));return u.diff(s,"week")+1},o.isoWeekday=function(t){return this.$utils().u(t)?this.day()||7:this.day(this.day()%7?t:t-7)};var a=o.startOf;o.startOf=function(t,e){var n=this.$utils(),r=!!n.u(e)||e;return"isoweek"===n.p(t)?r?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):a.bind(this)(t,e)}})}(wj);var xj=v(wj.exports),Oj={exports:{}};!function(t,e){t.exports=function(t,e){e.prototype.isLeapYear=function(){return this.$y%4==0&&this.$y%100!=0||this.$y%400==0}}}(Oj);var kj=v(Oj.exports),Sj={exports:{}};!function(t,e){t.exports=function(t,e){var n=e.prototype,r=n.format;n.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return r.bind(this)(t);var i=this.$utils(),o=(t||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(t){switch(t){case"Q":return Math.ceil((e.$M+1)/3);case"Do":return n.ordinal(e.$D);case"gggg":return e.weekYear();case"GGGG":return e.isoWeekYear();case"wo":return n.ordinal(e.week(),"W");case"w":case"ww":return i.s(e.week(),"w"===t?1:2,"0");case"W":case"WW":return i.s(e.isoWeek(),"W"===t?1:2,"0");case"k":case"kk":return i.s(String(0===e.$H?24:e.$H),"k"===t?1:2,"0");case"X":return Math.floor(e.$d.getTime()/1e3);case"x":return e.$d.getTime();case"z":return"["+e.offsetName()+"]";case"zzz":return"["+e.offsetName("long")+"]";default:return t}}));return r.bind(this)(o)}}}(Sj);var jj=v(Sj.exports),_j={exports:{}};!function(t,e){var n,r,i;t.exports=(n="minute",r=/[+-]\d\d(?::?\d\d)?/g,i=/([+-]|\d\d)/g,function(t,e,o){var a=e.prototype;o.utc=function(t){return new e({date:t,utc:!0,args:arguments})},a.utc=function(t){var e=o(this.toDate(),{locale:this.$L,utc:!0});return t?e.add(this.utcOffset(),n):e},a.local=function(){return o(this.toDate(),{locale:this.$L,utc:!1})};var u=a.parse;a.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),u.call(this,t)};var s=a.init;a.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds()}else s.call(this)};var c=a.utcOffset;a.utcOffset=function(t,e){var o=this.$utils().u;if(o(t))return this.$u?0:o(this.$offset)?c.call(this):this.$offset;if("string"==typeof t&&(t=function(t){void 0===t&&(t="");var e=t.match(r);if(!e)return null;var n=(""+e[0]).match(i)||["-",0,0],o=n[0],a=60*+n[1]+ +n[2];return 0===a?0:"+"===o?a:-a}(t),null===t))return this;var a=Math.abs(t)<=16?60*t:t,u=this;if(e)return u.$offset=a,u.$u=0===t,u;if(0!==t){var s=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(u=this.local().add(a+s,n)).$offset=a,u.$x.$localOffset=s}else u=this.utc();return u};var l=a.format;a.format=function(t){var e=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return l.call(this,e)},a.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*t},a.isUTC=function(){return!!this.$u},a.toISOString=function(){return this.toDate().toISOString()},a.toString=function(){return this.toDate().toUTCString()};var f=a.toDate;a.toDate=function(t){return"s"===t&&this.$offset?o(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():f.call(this)};var h=a.diff;a.diff=function(t,e,n){if(t&&this.$u===t.$u)return h.call(this,t,e,n);var r=this.local(),i=o(t).local();return h.call(r,i,e,n)}})}(_j);var Mj=v(_j.exports),Dj={exports:{}};!function(t,e){var n,r;t.exports=(n={year:0,month:1,day:2,hour:3,minute:4,second:5},r={},function(t,e,i){var o,a=function(t,e,n){void 0===n&&(n={});var i=new Date(t),o=function(t,e){void 0===e&&(e={});var n=e.timeZoneName||"short",i=t+"|"+n,o=r[i];return o||(o=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",timeZoneName:n}),r[i]=o),o}(e,n);return o.formatToParts(i)},u=function(t,e){for(var r=a(t,e),o=[],u=0;u<r.length;u+=1){var s=r[u],c=s.type,l=s.value,f=n[c];f>=0&&(o[f]=parseInt(l,10))}var h=o[3],d=24===h?0:h,p=o[0]+"-"+o[1]+"-"+o[2]+" "+d+":"+o[4]+":"+o[5]+":000",v=+t;return(i.utc(p).valueOf()-(v-=v%1e3))/6e4},s=e.prototype;s.tz=function(t,e){void 0===t&&(t=o);var n=this.utcOffset(),r=this.toDate(),a=r.toLocaleString("en-US",{timeZone:t}),u=Math.round((r-new Date(a))/1e3/60),s=i(a,{locale:this.$L}).$set("millisecond",this.$ms).utcOffset(15*-Math.round(r.getTimezoneOffset()/15)-u,!0);if(e){var c=s.utcOffset();s=s.add(n-c,"minute")}return s.$x.$timezone=t,s},s.offsetName=function(t){var e=this.$x.$timezone||i.tz.guess(),n=a(this.valueOf(),e,{timeZoneName:t}).find((function(t){return"timezonename"===t.type.toLowerCase()}));return n&&n.value};var c=s.startOf;s.startOf=function(t,e){if(!this.$x||!this.$x.$timezone)return c.call(this,t,e);var n=i(this.format("YYYY-MM-DD HH:mm:ss:SSS"),{locale:this.$L});return c.call(n,t,e).tz(this.$x.$timezone,!0)},i.tz=function(t,e,n){var r=n&&e,a=n||e||o,s=u(+i(),a);if("string"!=typeof t)return i(t).tz(a);var c=function(t,e,n){var r=t-60*e*1e3,i=u(r,n);if(e===i)return[r,e];var o=u(r-=60*(i-e)*1e3,n);return i===o?[r,i]:[t-60*Math.min(i,o)*1e3,Math.max(i,o)]}(i.utc(t,r).valueOf(),s,a),l=c[0],f=c[1],h=i(l).utcOffset(f);return h.$x.$timezone=a,h},i.tz.guess=function(){return Intl.DateTimeFormat().resolvedOptions().timeZone},i.tz.setDefault=function(t){o=t}})}(Dj);var Pj=v(Dj.exports),$j={exports:{}};!function(t,e){t.exports=function(t,e,n){var r=e.prototype,i=function(t){return t&&(t.indexOf?t:t.s)},o=function(t,e,n,r,o){var a=t.name?t:t.$locale(),u=i(a[e]),s=i(a[n]),c=u||s.map((function(t){return t.slice(0,r)}));if(!o)return c;var l=a.weekStart;return c.map((function(t,e){return c[(e+(l||0))%7]}))},a=function(){return n.Ls[n.locale()]},u=function(t,e){return t.formats[e]||function(t){return t.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,n){return e||n.slice(1)}))}(t.formats[e.toUpperCase()])},s=function(){var t=this;return{months:function(e){return e?e.format("MMMM"):o(t,"months")},monthsShort:function(e){return e?e.format("MMM"):o(t,"monthsShort","months",3)},firstDayOfWeek:function(){return t.$locale().weekStart||0},weekdays:function(e){return e?e.format("dddd"):o(t,"weekdays")},weekdaysMin:function(e){return e?e.format("dd"):o(t,"weekdaysMin","weekdays",2)},weekdaysShort:function(e){return e?e.format("ddd"):o(t,"weekdaysShort","weekdays",3)},longDateFormat:function(e){return u(t.$locale(),e)},meridiem:this.$locale().meridiem,ordinal:this.$locale().ordinal}};r.localeData=function(){return s.bind(this)()},n.localeData=function(){var t=a();return{firstDayOfWeek:function(){return t.weekStart||0},weekdays:function(){return n.weekdays()},weekdaysShort:function(){return n.weekdaysShort()},weekdaysMin:function(){return n.weekdaysMin()},months:function(){return n.months()},monthsShort:function(){return n.monthsShort()},longDateFormat:function(e){return u(t,e)},meridiem:t.meridiem,ordinal:t.ordinal}},n.months=function(){return o(a(),"months")},n.monthsShort=function(){return o(a(),"monthsShort","months",3)},n.weekdays=function(t){return o(a(),"weekdays",null,null,t)},n.weekdaysShort=function(t){return o(a(),"weekdaysShort","weekdays",3,t)},n.weekdaysMin=function(t){return o(a(),"weekdaysMin","weekdays",2,t)}}}($j);var Ej=v($j.exports),Lj={exports:{}};!function(t,e){var n;t.exports=(n={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},function(t,e,r){var i=e.prototype,o=i.format;r.en.formats=n,i.format=function(t){void 0===t&&(t="YYYY-MM-DDTHH:mm:ssZ");var e=this.$locale().formats,r=function(t,e){return t.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,r,i){var o=i&&i.toUpperCase();return r||e[i]||n[i]||e[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,n){return e||n.slice(1)}))}))}(t,void 0===e?{}:e);return o.call(this,r)}})}(Lj);var Tj=v(Lj.exports),Cj={exports:{}};!function(t,e){t.exports=function(t,e,n){n.updateLocale=function(t,e){var r=n.Ls[t];if(r)return(e?Object.keys(e):[]).forEach((function(t){r[t]=e[t]})),r}}}(Cj);var Aj=v(Cj.exports);cj.extend(fj),cj.extend(bj),cj.extend(xj),cj.extend(kj),cj.extend(dj),cj.extend(vj),cj.extend(mj),cj.extend(jj),cj.extend(Mj),cj.extend(Pj),cj.extend(Ej),cj.extend(Tj),cj.extend(Aj);var Rj="en",Ij=function(){function t(){var e;a(this,t),this.locale=Rj,this.timezone=cj.tz.guess(),"object"===("undefined"==typeof window?"undefined":o(window))&&((e=window).dayjs||(e.dayjs=cj))}return s(t,[{key:"setup",value:function(t){var e=t.options;return yh(this,void 0,void 0,i().mark((function t(){var n,r;return i().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.timezone=e.date.timezone||cj.tz.guess(),"string"!=typeof(n=e.date.locale)||n===Rj){t.next=17;break}if("object"!==("undefined"==typeof window?"undefined":o(window))){t.next=12;break}if(t.t0=window["dayjs_locale_".concat(n)],t.t0){t.next=9;break}return t.next=8,this.loadBrowserLocale(n);case 8:t.t0=t.sent;case 9:r=t.t0,t.next=15;break;case 12:return t.next=14,this.loadNodeLocale(n);case 14:r=t.sent;case 15:cj.locale(n),this.locale=r;case 17:"object"===o(n)&&(n.hasOwnProperty("name")?(cj.locale(n.name,n),this.locale=n):this.locale=cj.updateLocale(Rj,n));case 18:case"end":return t.stop()}}),t,this)})))}},{key:"extend",value:function(t){return cj.extend(t)}},{key:"getMonthWeekNumber",value:function(t){var e=this.date(t),n=e.startOf("day"),r=e.startOf("month").endOf("week");return n<=r?1:Math.ceil(n.diff(r,"weeks",!0))+1}},{key:"getWeeksCountInMonth",value:function(t){var e=this.date(t);return this.getLastWeekOfMonth(e).diff(this.getFirstWeekOfMonth(e),"week")+1}},{key:"getFirstWeekOfMonth",value:function(t){var e=this.date(t).startOf("month"),n=e.startOf("week");return e.weekday()>4&&(n=n.add(1,"week")),n}},{key:"getLastWeekOfMonth",value:function(t){var e=this.date(t).endOf("month"),n=e.endOf("week");return e.weekday()<4&&(n=n.subtract(1,"week")),n}},{key:"date",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Date;return cj.isDayjs(t)?t:cj(t).tz(this.timezone).utcOffset(0).locale(this.locale)}},{key:"format",value:function(t,e){if("function"==typeof e){for(var n=arguments.length,r=new Array(n>2?n-2:0),i=2;i<n;i++)r[i-2]=arguments[i];return e.apply(void 0,[t].concat(r))}return"string"==typeof e?this.date(t).format(e):null}},{key:"intervals",value:function(t,e,n){var r,i=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],o=this.date(e);r="number"==typeof n?o.add(n,t):cj.isDayjs(n)?n:this.date(n),o=o.startOf(t),r=r.startOf(t);var a=cj.min(o,r);r=cj.max(o,r);var u=[];i||(r=r.add(1,"second"));do{u.push(+a),a=a.add(1,t)}while(a<r);return u}},{key:"loadBrowserLocale",value:function(t){return new Promise((function(e,n){var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/".concat(t,".js"),r.onerror=function(t){n(t)},r.onload=function(){e(window["dayjs_locale_".concat(t)])},document.head.appendChild(r)}))}},{key:"loadNodeLocale",value:function(t){return import("dayjs/locale/".concat(t,".js"))}}]),t}(),Nj=Si,Wj=Jm,Yj=W,zj=cf,Fj=tg,Hj=A("".indexOf);Nj({target:"String",proto:!0,forced:!Fj("includes")},{includes:function(t){return!!~Hj(zj(Yj(this)),zj(Wj(t)),arguments.length>1?arguments[1]:void 0)}});var Bj=["json","csv","tsv","txt"];function Gj(t,e){var n=e.domain,r=e.subDomain,i=e.data,o=n.type,a=r.type;if(!t.has(o))throw new Error("'".concat(o,"' is not a valid domain type'"));if(!t.has(a))throw new Error("'".concat(a,"' is not a valid subDomain type'"));if(i.type&&!Bj.includes(i.type))throw new Error("The data type '".concat(i.type,"' is not valid data type"));if(!(t.get(a).allowedDomainType||[]).includes(o))throw new Error("The subDomain.type '".concat(a,"' can not be used together ")+"with the domain type ".concat(o));return!0}Xd("Set",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),fv);var Uj=function(){function t(e){a(this,t),this.calendar=e,this.settings=new Map,this.plugins=new Map,this.pendingPaint=new Set}return s(t,[{key:"add",value:function(t){var e=this;t.forEach((function(t){var n,r,i=c(t,2),o=i[0],a=i[1],u=function(t,e){return"".concat((new t).name).concat((null==e?void 0:e.key)||"")}(o,a);e.plugins.get(u)&&e.settings.get(u)&&ZO(e.settings.get(u).options,a)||(e.settings.set(u,{options:a,dirty:!0}),e.plugins.has(u)||e.plugins.set(u,(n=o,r=e.calendar,new n(r))),e.pendingPaint.add(e.plugins.get(u)))}))}},{key:"setupAll",value:function(){var t=this;this.plugins.forEach((function(e,n){var r=t.settings.get(n);void 0!==r&&r.dirty&&(e.setup(r.options),r.dirty=!1,t.settings.set(n,r))}))}},{key:"paintAll",value:function(){return Array.from(this.pendingPaint.values()).map((function(t){return t.paint()}))}},{key:"destroyAll",value:function(){return this.allPlugins().map((function(t){return t.destroy()}))}},{key:"getFromPosition",value:function(t){return this.allPlugins().filter((function(e){var n;return(null===(n=e.options)||void 0===n?void 0:n.position)===t}))}},{key:"getHeightFromPosition",value:function(t){return this.getFromPosition(t).map((function(t){return t.options.dimensions.height})).reduce((function(t,e){return t+e}),0)}},{key:"getWidthFromPosition",value:function(t){return this.getFromPosition(t).map((function(t){return t.options.dimensions.width})).reduce((function(t,e){return t+e}),0)}},{key:"allPlugins",value:function(){return Array.from(this.plugins.values())}}]),t}(),qj=[function(t){return{name:"minute",allowedDomainType:["day","hour"],rowsCount:function(){return 10},columnsCount:function(){return 6},mapping:function(e,n){return t.intervals("minute",e,t.date(n)).map((function(t,e){return{t:t,x:Math.floor(e/10),y:e%10}}))},extractUnit:function(e){return t.date(e).startOf("minute").valueOf()}}},function(t,e){var n=e.domain;return{name:"hour",allowedDomainType:["month","week","day"],rowsCount:function(){return 6},columnsCount:function(e){switch(n.type){case"week":return 28;case"month":return 4*(n.dynamicDimension?t.date(e).daysInMonth():31);default:return 4}},mapping:function(e,r){return t.intervals("hour",e,t.date(r)).map((function(e){var r=t.date(e),i=r.hour(),o=r.date(),a=Math.floor(i/6);return"month"===n.type&&(a+=4*(o-1)),"week"===n.type&&(a+=4*+r.format("d")),{t:e,x:a,y:Math.floor(i%6)}}))},extractUnit:function(e){return t.date(e).startOf("hour").valueOf()}}},function(t,e){var n=e.domain,r=e.verticalOrientation;return{name:"day",allowedDomainType:["year","month","week"],rowsCount:function(){return"week"===n.type?1:7},columnsCount:function(e){switch(n.type){case"month":return Math.ceil(n.dynamicDimension&&!r?t.getMonthWeekNumber(t.date(e).endOf("month")):6);case"year":return Math.ceil(n.dynamicDimension?t.date(e).endOf("year").dayOfYear()/7:54);default:return 7}},mapping:function(e,r){var i=0,o=-1;return t.intervals("day",e,t.date(r)).map((function(e){var r=t.date(e);switch(n.type){case"month":o=t.getMonthWeekNumber(e)-1;break;case"year":i!==r.week()&&(i=r.week(),o+=1);break;case"week":o=r.weekday()}return{t:e,x:o,y:"week"===n.type?0:r.weekday()}}))},extractUnit:function(e){return t.date(e).startOf("day").valueOf()}}},function(t,e){var n=e.domain,r=e.verticalOrientation;return{name:"xDay",allowedDomainType:["year","month","week"],rowsCount:function(e){switch(n.type){case"month":return Math.ceil(n.dynamicDimension&&!r?t.getMonthWeekNumber(t.date(e).endOf("month")):6);case"year":return Math.ceil(n.dynamicDimension?t.date(e).endOf("year").dayOfYear()/7:54);default:return 7}},columnsCount:function(){return"week"===n.type?1:7},mapping:function(e,r){return t.intervals("day",e,t.date(r)).map((function(e){var r=t.date(e),i=r.endOf("year").week(),o=0;switch(n.type){case"month":o=t.getMonthWeekNumber(e)-1;break;case"year":1===i&&r.week()===i&&(o=r.subtract(1,"week").week()+1),o=r.week()-1;break;case"week":o=r.weekday()}return{t:e,y:o,x:"week"===n.type?0:r.weekday()}}))},extractUnit:function(e){return t.date(e).startOf("day").valueOf()}}},function(t){return{name:"ghDay",allowedDomainType:["month"],rowsCount:function(){return 7},columnsCount:function(e){return t.getWeeksCountInMonth(e)},mapping:function(e,n){var r=t.getFirstWeekOfMonth(e),i=t.getFirstWeekOfMonth(n),o=-1,a=r.weekday();return t.intervals("day",r,i).map((function(e){var n=t.date(e).weekday();return n===a&&(o+=1),{t:e,x:o,y:n}}))},extractUnit:function(e){return t.date(e).startOf("day").valueOf()}}},function(t,e){var n=e.domain;return{name:"week",allowedDomainType:["year","month"],rowsCount:function(){return 1},columnsCount:function(e){switch(n.type){case"year":return n.dynamicDimension?t.date(e).endOf("year").isoWeeksInYear():53;case"month":return n.dynamicDimension?t.getWeeksCountInMonth(e):5;default:return 1}},mapping:function(e,n){var r=t.getFirstWeekOfMonth(e),i=t.getFirstWeekOfMonth(n);return t.intervals("week",r,i).map((function(t,e){return{t:t,x:e,y:0}}))},extractUnit:function(e){return t.date(e).startOf("week").valueOf()}}},function(t){return{name:"month",allowedDomainType:["year"],rowsCount:function(){return 1},columnsCount:function(){return 12},mapping:function(e,n){return t.intervals("month",e,t.date(n)).map((function(e){return{t:e,x:t.date(e).month(),y:0}}))},extractUnit:function(e){return t.date(e).startOf("month").valueOf()}}},function(t){return{name:"year",allowedDomainType:[],rowsCount:function(){return 1},columnsCount:function(){return 1},mapping:function(e,n){return t.intervals("year",e,t.date(n)).map((function(t,e){return{t:t,x:e,y:0}}))},extractUnit:function(e){return t.date(e).startOf("year").valueOf()}}}],Vj=function(){function t(e,n){a(this,t),this.settings=new Map,this.dateHelper=e,this.options=n,this.initiated=!1}return s(t,[{key:"get",value:function(t){return this.settings.get(t)}},{key:"has",value:function(t){return this.settings.has(t)}},{key:"init",value:function(){this.initiated||(this.initiated=!0,this.add(qj))}},{key:"add",value:function(t){var e=this;this.init();var n=[];xh(t).forEach((function(t){var r=t(e.dateHelper,e.options.options);e.settings.set(r.name,r),r.hasOwnProperty("parent")&&n.push(r.name)})),n.forEach((function(t){var n=e.settings.get(e.settings.get(t).parent);n&&e.settings.set(t,Object.assign(Object.assign({},n),e.settings.get(t)))}))}}]),t}(),Kj=function(){function t(){a(this,t),this.options=new Ok,this.dateHelper=new Ij,this.templateCollection=new Vj(this.dateHelper,this.options),this.dataFetcher=new XS(this),this.navigator=new Dp(this),this.populator=new aw(this),this.calendarPainter=new Sm(this),this.eventEmitter=new bh,this.pluginManager=new Uj(this)}return s(t,[{key:"createDomainCollection",value:function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return new zy(this.dateHelper,this.options.options.domain.type,t,e,n)}},{key:"paint",value:function(t,e){return yh(this,void 0,void 0,i().mark((function n(){return i().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return this.options.init(t),n.next=3,this.dateHelper.setup(this.options);case 3:this.templateCollection.init(),n.prev=4,Gj(this.templateCollection,this.options.options),n.next=11;break;case 8:return n.prev=8,n.t0=n.catch(4),n.abrupt("return",Promise.reject(n.t0));case 11:return e&&this.pluginManager.add(xh(e)),this.calendarPainter.setup(),this.domainCollection=new zy(this.dateHelper),this.navigator.loadNewDomains(this.createDomainCollection(this.options.options.date.start,this.options.options.range)),n.abrupt("return",Promise.allSettled([this.calendarPainter.paint(),this.fill()]));case 16:case"end":return n.stop()}}),n,this,[[4,8]])})))}},{key:"addTemplates",value:function(t){this.templateCollection.add(t)}},{key:"next",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,e=this.navigator.loadNewDomains(this.createDomainCollection(this.domainCollection.max,t+1).slice(t),wp.SCROLL_FORWARD);return Promise.allSettled([this.calendarPainter.paint(e),this.fill()])}},{key:"previous",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,e=this.navigator.loadNewDomains(this.createDomainCollection(this.domainCollection.min,-t),wp.SCROLL_BACKWARD);return Promise.allSettled([this.calendarPainter.paint(e),this.fill()])}},{key:"jumpTo",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return Promise.allSettled([this.calendarPainter.paint(this.navigator.jumpTo(t,e)),this.fill()])}},{key:"fill",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.options.options.data.source,n=this.options.options,r=this.templateCollection,i=this.dateHelper.intervals(n.domain.type,this.domainCollection.max,2)[1],o=this.dataFetcher.getDatas(e,this.domainCollection.min,i);return new Promise((function(e,i){o.then((function(i){t.domainCollection.fill(i,n.data,r.get(n.subDomain.type).extractUnit),t.populator.populate(),e(null)}),(function(t){i(t)}))}))}},{key:"on",value:function(t,e){this.eventEmitter.on(t,e)}},{key:"dimensions",value:function(){return this.calendarPainter.dimensions}},{key:"destroy",value:function(){return this.calendarPainter.destroy()}},{key:"extendDayjs",value:function(t){return this.dateHelper.extend(t)}}]),t}();return Kj.VERSION="4.2.4",Kj}));//# sourceMappingURL=cal-heatmap.min.js.map
!function(t, e) {
	"object" == typeof exports && "undefined" != typeof module ? module.exports = e(require("@popperjs/core")) : "function" == typeof define && define.amd ? define(["@popperjs/core"], e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).Tooltip = e(t.Popper)
}(this, (function(t) {
	"use strict";
	function e(t, e) {
			for (var n = 0; n < e.length; n++) {
					var r = e[n];
					r.enumerable = r.enumerable || !1,
					r.configurable = !0,
					"value"in r && (r.writable = !0),
					Object.defineProperty(t, (o = r.key,
					i = void 0,
					"symbol" == typeof (i = function(t, e) {
							if ("object" != typeof t || null === t)
									return t;
							var n = t[Symbol.toPrimitive];
							if (void 0 !== n) {
									var r = n.call(t, e || "default");
									if ("object" != typeof r)
											return r;
									throw new TypeError("@@toPrimitive must return a primitive value.")
							}
							return ("string" === e ? String : Number)(t)
					}(o, "string")) ? i : String(i)), r)
			}
			var o, i
	}
	function n(t) {
			return function(t) {
					if (Array.isArray(t))
							return r(t)
			}(t) || function(t) {
					if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"])
							return Array.from(t)
			}(t) || function(t, e) {
					if (!t)
							return;
					if ("string" == typeof t)
							return r(t, e);
					var n = Object.prototype.toString.call(t).slice(8, -1);
					"Object" === n && t.constructor && (n = t.constructor.name);
					if ("Map" === n || "Set" === n)
							return Array.from(t);
					if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
							return r(t, e)
			}(t) || function() {
					throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
			}()
	}
	function r(t, e) {
			(null == e || e > t.length) && (e = t.length);
			for (var n = 0, r = new Array(e); n < e; n++)
					r[n] = t[n];
			return r
	}
	var o = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}
		, i = function(t) {
			return t && t.Math == Math && t
	}
		, c = i("object" == typeof globalThis && globalThis) || i("object" == typeof window && window) || i("object" == typeof self && self) || i("object" == typeof o && o) || function() {
			return this
	}() || o || Function("return this")()
		, u = {}
		, a = function(t) {
			try {
					return !!t()
			} catch (t) {
					return !0
			}
	}
		, f = !a((function() {
			return 7 != Object.defineProperty({}, 1, {
					get: function() {
							return 7
					}
			})[1]
	}
	))
		, s = !a((function() {
			var t = function() {}
			.bind();
			return "function" != typeof t || t.hasOwnProperty("prototype")
	}
	))
		, l = s
		, p = Function.prototype.call
		, h = l ? p.bind(p) : function() {
			return p.apply(p, arguments)
	}
		, v = {}
		, d = {}.propertyIsEnumerable
		, y = Object.getOwnPropertyDescriptor
		, b = y && !d.call({
			1: 2
	}, 1);
	v.f = b ? function(t) {
			var e = y(this, t);
			return !!e && e.enumerable
	}
	: d;
	var g, m, O = function(t, e) {
			return {
					enumerable: !(1 & t),
					configurable: !(2 & t),
					writable: !(4 & t),
					value: e
			}
	}, w = s, S = Function.prototype, j = S.call, T = w && S.bind.bind(j, j), E = w ? T : function(t) {
			return function() {
					return j.apply(t, arguments)
			}
	}
	, P = E, A = P({}.toString), C = P("".slice), I = function(t) {
			return C(A(t), 8, -1)
	}, x = a, L = I, R = Object, k = E("".split), M = x((function() {
			return !R("z").propertyIsEnumerable(0)
	}
	)) ? function(t) {
			return "String" == L(t) ? k(t, "") : R(t)
	}
	: R, N = function(t) {
			return null == t
	}, _ = N, D = TypeError, F = function(t) {
			if (_(t))
					throw D("Can't call method on " + t);
			return t
	}, B = M, G = F, U = function(t) {
			return B(G(t))
	}, z = "object" == typeof document && document.all, W = {
			all: z,
			IS_HTMLDDA: void 0 === z && void 0 !== z
	}, H = W.all, V = W.IS_HTMLDDA ? function(t) {
			return "function" == typeof t || t === H
	}
	: function(t) {
			return "function" == typeof t
	}
	, q = V, J = W.all, K = W.IS_HTMLDDA ? function(t) {
			return "object" == typeof t ? null !== t : q(t) || t === J
	}
	: function(t) {
			return "object" == typeof t ? null !== t : q(t)
	}
	, X = c, Y = V, $ = function(t, e) {
			return arguments.length < 2 ? (n = X[t],
			Y(n) ? n : void 0) : X[t] && X[t][e];
			var n
	}, Q = E({}.isPrototypeOf), Z = "undefined" != typeof navigator && String(navigator.userAgent) || "", tt = c, et = Z, nt = tt.process, rt = tt.Deno, ot = nt && nt.versions || rt && rt.version, it = ot && ot.v8;
	it && (m = (g = it.split("."))[0] > 0 && g[0] < 4 ? 1 : +(g[0] + g[1])),
	!m && et && (!(g = et.match(/Edge\/(\d+)/)) || g[1] >= 74) && (g = et.match(/Chrome\/(\d+)/)) && (m = +g[1]);
	var ct = m
		, ut = ct
		, at = a
		, ft = c.String
		, st = !!Object.getOwnPropertySymbols && !at((function() {
			var t = Symbol();
			return !ft(t) || !(Object(t)instanceof Symbol) || !Symbol.sham && ut && ut < 41
	}
	))
		, lt = st && !Symbol.sham && "symbol" == typeof Symbol.iterator
		, pt = $
		, ht = V
		, vt = Q
		, dt = Object
		, yt = lt ? function(t) {
			return "symbol" == typeof t
	}
	: function(t) {
			var e = pt("Symbol");
			return ht(e) && vt(e.prototype, dt(t))
	}
		, bt = String
		, gt = function(t) {
			try {
					return bt(t)
			} catch (t) {
					return "Object"
			}
	}
		, mt = V
		, Ot = gt
		, wt = TypeError
		, St = function(t) {
			if (mt(t))
					return t;
			throw wt(Ot(t) + " is not a function")
	}
		, jt = St
		, Tt = N
		, Et = function(t, e) {
			var n = t[e];
			return Tt(n) ? void 0 : jt(n)
	}
		, Pt = h
		, At = V
		, Ct = K
		, It = TypeError
		, xt = {
			exports: {}
	}
		, Lt = c
		, Rt = Object.defineProperty
		, kt = function(t, e) {
			try {
					Rt(Lt, t, {
							value: e,
							configurable: !0,
							writable: !0
					})
			} catch (n) {
					Lt[t] = e
			}
			return e
	}
		, Mt = kt
		, Nt = "__core-js_shared__"
		, _t = c[Nt] || Mt(Nt, {})
		, Dt = _t;
	(xt.exports = function(t, e) {
			return Dt[t] || (Dt[t] = void 0 !== e ? e : {})
	}
	)("versions", []).push({
			version: "3.30.2",
			mode: "global",
			copyright: "© 2014-2023 Denis Pushkarev (zloirock.ru)",
			license: "https://github.com/zloirock/core-js/blob/v3.30.2/LICENSE",
			source: "https://github.com/zloirock/core-js"
	});
	var Ft = xt.exports
		, Bt = F
		, Gt = Object
		, Ut = function(t) {
			return Gt(Bt(t))
	}
		, zt = Ut
		, Wt = E({}.hasOwnProperty)
		, Ht = Object.hasOwn || function(t, e) {
			return Wt(zt(t), e)
	}
		, Vt = E
		, qt = 0
		, Jt = Math.random()
		, Kt = Vt(1..toString)
		, Xt = function(t) {
			return "Symbol(" + (void 0 === t ? "" : t) + ")_" + Kt(++qt + Jt, 36)
	}
		, Yt = Ft
		, $t = Ht
		, Qt = Xt
		, Zt = st
		, te = lt
		, ee = c.Symbol
		, ne = Yt("wks")
		, re = te ? ee.for || ee : ee && ee.withoutSetter || Qt
		, oe = function(t) {
			return $t(ne, t) || (ne[t] = Zt && $t(ee, t) ? ee[t] : re("Symbol." + t)),
			ne[t]
	}
		, ie = h
		, ce = K
		, ue = yt
		, ae = Et
		, fe = function(t, e) {
			var n, r;
			if ("string" === e && At(n = t.toString) && !Ct(r = Pt(n, t)))
					return r;
			if (At(n = t.valueOf) && !Ct(r = Pt(n, t)))
					return r;
			if ("string" !== e && At(n = t.toString) && !Ct(r = Pt(n, t)))
					return r;
			throw It("Can't convert object to primitive value")
	}
		, se = TypeError
		, le = oe("toPrimitive")
		, pe = function(t, e) {
			if (!ce(t) || ue(t))
					return t;
			var n, r = ae(t, le);
			if (r) {
					if (void 0 === e && (e = "default"),
					n = ie(r, t, e),
					!ce(n) || ue(n))
							return n;
					throw se("Can't convert object to primitive value")
			}
			return void 0 === e && (e = "number"),
			fe(t, e)
	}
		, he = yt
		, ve = function(t) {
			var e = pe(t, "string");
			return he(e) ? e : e + ""
	}
		, de = K
		, ye = c.document
		, be = de(ye) && de(ye.createElement)
		, ge = function(t) {
			return be ? ye.createElement(t) : {}
	}
		, me = ge
		, Oe = !f && !a((function() {
			return 7 != Object.defineProperty(me("div"), "a", {
					get: function() {
							return 7
					}
			}).a
	}
	))
		, we = f
		, Se = h
		, je = v
		, Te = O
		, Ee = U
		, Pe = ve
		, Ae = Ht
		, Ce = Oe
		, Ie = Object.getOwnPropertyDescriptor;
	u.f = we ? Ie : function(t, e) {
			if (t = Ee(t),
			e = Pe(e),
			Ce)
					try {
							return Ie(t, e)
					} catch (t) {}
			if (Ae(t, e))
					return Te(!Se(je.f, t, e), t[e])
	}
	;
	var xe = {}
		, Le = f && a((function() {
			return 42 != Object.defineProperty((function() {}
			), "prototype", {
					value: 42,
					writable: !1
			}).prototype
	}
	))
		, Re = K
		, ke = String
		, Me = TypeError
		, Ne = function(t) {
			if (Re(t))
					return t;
			throw Me(ke(t) + " is not an object")
	}
		, _e = f
		, De = Oe
		, Fe = Le
		, Be = Ne
		, Ge = ve
		, Ue = TypeError
		, ze = Object.defineProperty
		, We = Object.getOwnPropertyDescriptor
		, He = "enumerable"
		, Ve = "configurable"
		, qe = "writable";
	xe.f = _e ? Fe ? function(t, e, n) {
			if (Be(t),
			e = Ge(e),
			Be(n),
			"function" == typeof t && "prototype" === e && "value"in n && qe in n && !n[qe]) {
					var r = We(t, e);
					r && r[qe] && (t[e] = n.value,
					n = {
							configurable: Ve in n ? n[Ve] : r[Ve],
							enumerable: He in n ? n[He] : r[He],
							writable: !1
					})
			}
			return ze(t, e, n)
	}
	: ze : function(t, e, n) {
			if (Be(t),
			e = Ge(e),
			Be(n),
			De)
					try {
							return ze(t, e, n)
					} catch (t) {}
			if ("get"in n || "set"in n)
					throw Ue("Accessors not supported");
			return "value"in n && (t[e] = n.value),
			t
	}
	;
	var Je = xe
		, Ke = O
		, Xe = f ? function(t, e, n) {
			return Je.f(t, e, Ke(1, n))
	}
	: function(t, e, n) {
			return t[e] = n,
			t
	}
		, Ye = {
			exports: {}
	}
		, $e = f
		, Qe = Ht
		, Ze = Function.prototype
		, tn = $e && Object.getOwnPropertyDescriptor
		, en = Qe(Ze, "name")
		, nn = {
			EXISTS: en,
			PROPER: en && "something" === function() {}
			.name,
			CONFIGURABLE: en && (!$e || $e && tn(Ze, "name").configurable)
	}
		, rn = V
		, on = _t
		, cn = E(Function.toString);
	rn(on.inspectSource) || (on.inspectSource = function(t) {
			return cn(t)
	}
	);
	var un, an, fn, sn = on.inspectSource, ln = V, pn = c.WeakMap, hn = ln(pn) && /native code/.test(String(pn)), vn = Xt, dn = Ft("keys"), yn = function(t) {
			return dn[t] || (dn[t] = vn(t))
	}, bn = {}, gn = hn, mn = c, On = K, wn = Xe, Sn = Ht, jn = _t, Tn = yn, En = bn, Pn = "Object already initialized", An = mn.TypeError, Cn = mn.WeakMap;
	if (gn || jn.state) {
			var In = jn.state || (jn.state = new Cn);
			In.get = In.get,
			In.has = In.has,
			In.set = In.set,
			un = function(t, e) {
					if (In.has(t))
							throw An(Pn);
					return e.facade = t,
					In.set(t, e),
					e
			}
			,
			an = function(t) {
					return In.get(t) || {}
			}
			,
			fn = function(t) {
					return In.has(t)
			}
	} else {
			var xn = Tn("state");
			En[xn] = !0,
			un = function(t, e) {
					if (Sn(t, xn))
							throw An(Pn);
					return e.facade = t,
					wn(t, xn, e),
					e
			}
			,
			an = function(t) {
					return Sn(t, xn) ? t[xn] : {}
			}
			,
			fn = function(t) {
					return Sn(t, xn)
			}
	}
	var Ln = {
			set: un,
			get: an,
			has: fn,
			enforce: function(t) {
					return fn(t) ? an(t) : un(t, {})
			},
			getterFor: function(t) {
					return function(e) {
							var n;
							if (!On(e) || (n = an(e)).type !== t)
									throw An("Incompatible receiver, " + t + " required");
							return n
					}
			}
	}
		, Rn = E
		, kn = a
		, Mn = V
		, Nn = Ht
		, _n = f
		, Dn = nn.CONFIGURABLE
		, Fn = sn
		, Bn = Ln.enforce
		, Gn = Ln.get
		, Un = String
		, zn = Object.defineProperty
		, Wn = Rn("".slice)
		, Hn = Rn("".replace)
		, Vn = Rn([].join)
		, qn = _n && !kn((function() {
			return 8 !== zn((function() {}
			), "length", {
					value: 8
			}).length
	}
	))
		, Jn = String(String).split("String")
		, Kn = Ye.exports = function(t, e, n) {
			"Symbol(" === Wn(Un(e), 0, 7) && (e = "[" + Hn(Un(e), /^Symbol\(([^)]*)\)/, "$1") + "]"),
			n && n.getter && (e = "get " + e),
			n && n.setter && (e = "set " + e),
			(!Nn(t, "name") || Dn && t.name !== e) && (_n ? zn(t, "name", {
					value: e,
					configurable: !0
			}) : t.name = e),
			qn && n && Nn(n, "arity") && t.length !== n.arity && zn(t, "length", {
					value: n.arity
			});
			try {
					n && Nn(n, "constructor") && n.constructor ? _n && zn(t, "prototype", {
							writable: !1
					}) : t.prototype && (t.prototype = void 0)
			} catch (t) {}
			var r = Bn(t);
			return Nn(r, "source") || (r.source = Vn(Jn, "string" == typeof e ? e : "")),
			t
	}
	;
	Function.prototype.toString = Kn((function() {
			return Mn(this) && Gn(this).source || Fn(this)
	}
	), "toString");
	var Xn = Ye.exports
		, Yn = V
		, $n = xe
		, Qn = Xn
		, Zn = kt
		, tr = function(t, e, n, r) {
			r || (r = {});
			var o = r.enumerable
				, i = void 0 !== r.name ? r.name : e;
			if (Yn(n) && Qn(n, i, r),
			r.global)
					o ? t[e] = n : Zn(e, n);
			else {
					try {
							r.unsafe ? t[e] && (o = !0) : delete t[e]
					} catch (t) {}
					o ? t[e] = n : $n.f(t, e, {
							value: n,
							enumerable: !1,
							configurable: !r.nonConfigurable,
							writable: !r.nonWritable
					})
			}
			return t
	}
		, er = {}
		, nr = Math.ceil
		, rr = Math.floor
		, or = Math.trunc || function(t) {
			var e = +t;
			return (e > 0 ? rr : nr)(e)
	}
		, ir = function(t) {
			var e = +t;
			return e != e || 0 === e ? 0 : or(e)
	}
		, cr = ir
		, ur = Math.max
		, ar = Math.min
		, fr = function(t, e) {
			var n = cr(t);
			return n < 0 ? ur(n + e, 0) : ar(n, e)
	}
		, sr = ir
		, lr = Math.min
		, pr = function(t) {
			return t > 0 ? lr(sr(t), 9007199254740991) : 0
	}
		, hr = function(t) {
			return pr(t.length)
	}
		, vr = U
		, dr = fr
		, yr = hr
		, br = function(t) {
			return function(e, n, r) {
					var o, i = vr(e), c = yr(i), u = dr(r, c);
					if (t && n != n) {
							for (; c > u; )
									if ((o = i[u++]) != o)
											return !0
					} else
							for (; c > u; u++)
									if ((t || u in i) && i[u] === n)
											return t || u || 0;
					return !t && -1
			}
	}
		, gr = {
			includes: br(!0),
			indexOf: br(!1)
	}
		, mr = Ht
		, Or = U
		, wr = gr.indexOf
		, Sr = bn
		, jr = E([].push)
		, Tr = function(t, e) {
			var n, r = Or(t), o = 0, i = [];
			for (n in r)
					!mr(Sr, n) && mr(r, n) && jr(i, n);
			for (; e.length > o; )
					mr(r, n = e[o++]) && (~wr(i, n) || jr(i, n));
			return i
	}
		, Er = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"]
		, Pr = Tr
		, Ar = Er.concat("length", "prototype");
	er.f = Object.getOwnPropertyNames || function(t) {
			return Pr(t, Ar)
	}
	;
	var Cr = {};
	Cr.f = Object.getOwnPropertySymbols;
	var Ir = $
		, xr = er
		, Lr = Cr
		, Rr = Ne
		, kr = E([].concat)
		, Mr = Ir("Reflect", "ownKeys") || function(t) {
			var e = xr.f(Rr(t))
				, n = Lr.f;
			return n ? kr(e, n(t)) : e
	}
		, Nr = Ht
		, _r = Mr
		, Dr = u
		, Fr = xe
		, Br = a
		, Gr = V
		, Ur = /#|\.prototype\./
		, zr = function(t, e) {
			var n = Hr[Wr(t)];
			return n == qr || n != Vr && (Gr(e) ? Br(e) : !!e)
	}
		, Wr = zr.normalize = function(t) {
			return String(t).replace(Ur, ".").toLowerCase()
	}
		, Hr = zr.data = {}
		, Vr = zr.NATIVE = "N"
		, qr = zr.POLYFILL = "P"
		, Jr = zr
		, Kr = c
		, Xr = u.f
		, Yr = Xe
		, $r = tr
		, Qr = kt
		, Zr = function(t, e, n) {
			for (var r = _r(e), o = Fr.f, i = Dr.f, c = 0; c < r.length; c++) {
					var u = r[c];
					Nr(t, u) || n && Nr(n, u) || o(t, u, i(e, u))
			}
	}
		, to = Jr
		, eo = function(t, e) {
			var n, r, o, i, c, u = t.target, a = t.global, f = t.stat;
			if (n = a ? Kr : f ? Kr[u] || Qr(u, {}) : (Kr[u] || {}).prototype)
					for (r in e) {
							if (i = e[r],
							o = t.dontCallGetSet ? (c = Xr(n, r)) && c.value : n[r],
							!to(a ? r : u + (f ? "." : "#") + r, t.forced) && void 0 !== o) {
									if (typeof i == typeof o)
											continue;
									Zr(i, o)
							}
							(t.sham || o && o.sham) && Yr(i, "sham", !0),
							$r(n, r, i, t)
					}
	}
		, no = I
		, ro = Array.isArray || function(t) {
			return "Array" == no(t)
	}
		, oo = TypeError
		, io = ve
		, co = xe
		, uo = O
		, ao = function(t, e, n) {
			var r = io(e);
			r in t ? co.f(t, r, uo(0, n)) : t[r] = n
	}
		, fo = {};
	fo[oe("toStringTag")] = "z";
	var so = "[object z]" === String(fo)
		, lo = so
		, po = V
		, ho = I
		, vo = oe("toStringTag")
		, yo = Object
		, bo = "Arguments" == ho(function() {
			return arguments
	}())
		, go = lo ? ho : function(t) {
			var e, n, r;
			return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof (n = function(t, e) {
					try {
							return t[e]
					} catch (t) {}
			}(e = yo(t), vo)) ? n : bo ? ho(e) : "Object" == (r = ho(e)) && po(e.callee) ? "Arguments" : r
	}
		, mo = E
		, Oo = a
		, wo = V
		, So = go
		, jo = sn
		, To = function() {}
		, Eo = []
		, Po = $("Reflect", "construct")
		, Ao = /^\s*(?:class|function)\b/
		, Co = mo(Ao.exec)
		, Io = !Ao.exec(To)
		, xo = function(t) {
			if (!wo(t))
					return !1;
			try {
					return Po(To, Eo, t),
					!0
			} catch (t) {
					return !1
			}
	}
		, Lo = function(t) {
			if (!wo(t))
					return !1;
			switch (So(t)) {
			case "AsyncFunction":
			case "GeneratorFunction":
			case "AsyncGeneratorFunction":
					return !1
			}
			try {
					return Io || !!Co(Ao, jo(t))
			} catch (t) {
					return !0
			}
	};
	Lo.sham = !0;
	var Ro = !Po || Oo((function() {
			var t;
			return xo(xo.call) || !xo(Object) || !xo((function() {
					t = !0
			}
			)) || t
	}
	)) ? Lo : xo
		, ko = ro
		, Mo = Ro
		, No = K
		, _o = oe("species")
		, Do = Array
		, Fo = function(t) {
			var e;
			return ko(t) && (e = t.constructor,
			(Mo(e) && (e === Do || ko(e.prototype)) || No(e) && null === (e = e[_o])) && (e = void 0)),
			void 0 === e ? Do : e
	}
		, Bo = function(t, e) {
			return new (Fo(t))(0 === e ? 0 : e)
	}
		, Go = a
		, Uo = ct
		, zo = oe("species")
		, Wo = eo
		, Ho = a
		, Vo = ro
		, qo = K
		, Jo = Ut
		, Ko = hr
		, Xo = function(t) {
			if (t > 9007199254740991)
					throw oo("Maximum allowed index exceeded");
			return t
	}
		, Yo = ao
		, $o = Bo
		, Qo = function(t) {
			return Uo >= 51 || !Go((function() {
					var e = [];
					return (e.constructor = {})[zo] = function() {
							return {
									foo: 1
							}
					}
					,
					1 !== e[t](Boolean).foo
			}
			))
	}
		, Zo = ct
		, ti = oe("isConcatSpreadable")
		, ei = Zo >= 51 || !Ho((function() {
			var t = [];
			return t[ti] = !1,
			t.concat()[0] !== t
	}
	))
		, ni = function(t) {
			if (!qo(t))
					return !1;
			var e = t[ti];
			return void 0 !== e ? !!e : Vo(t)
	};
	Wo({
			target: "Array",
			proto: !0,
			arity: 1,
			forced: !ei || !Qo("concat")
	}, {
			concat: function(t) {
					var e, n, r, o, i, c = Jo(this), u = $o(c, 0), a = 0;
					for (e = -1,
					r = arguments.length; e < r; e++)
							if (ni(i = -1 === e ? c : arguments[e]))
									for (o = Ko(i),
									Xo(a + o),
									n = 0; n < o; n++,
									a++)
											n in i && Yo(u, a, i[n]);
							else
									Xo(a + 1),
									Yo(u, a++, i);
					return u.length = a,
					u
			}
	});
	var ri = Xn
		, oi = xe
		, ii = function(t, e, n) {
			return n.get && ri(n.get, e, {
					getter: !0
			}),
			n.set && ri(n.set, e, {
					setter: !0
			}),
			oi.f(t, e, n)
	}
		, ci = f
		, ui = nn.EXISTS
		, ai = E
		, fi = ii
		, si = Function.prototype
		, li = ai(si.toString)
		, pi = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/
		, hi = ai(pi.exec);
	ci && !ui && fi(si, "name", {
			configurable: !0,
			get: function() {
					try {
							return hi(pi, li(this))[1]
					} catch (t) {
							return ""
					}
			}
	});
	var vi = Tr
		, di = Er
		, yi = Object.keys || function(t) {
			return vi(t, di)
	}
		, bi = f
		, gi = E
		, mi = h
		, Oi = a
		, wi = yi
		, Si = Cr
		, ji = v
		, Ti = Ut
		, Ei = M
		, Pi = Object.assign
		, Ai = Object.defineProperty
		, Ci = gi([].concat)
		, Ii = !Pi || Oi((function() {
			if (bi && 1 !== Pi({
					b: 1
			}, Pi(Ai({}, "a", {
					enumerable: !0,
					get: function() {
							Ai(this, "b", {
									value: 3,
									enumerable: !1
							})
					}
			}), {
					b: 2
			})).b)
					return !0;
			var t = {}
				, e = {}
				, n = Symbol()
				, r = "abcdefghijklmnopqrst";
			return t[n] = 7,
			r.split("").forEach((function(t) {
					e[t] = t
			}
			)),
			7 != Pi({}, t)[n] || wi(Pi({}, e)).join("") != r
	}
	)) ? function(t, e) {
			for (var n = Ti(t), r = arguments.length, o = 1, i = Si.f, c = ji.f; r > o; )
					for (var u, a = Ei(arguments[o++]), f = i ? Ci(wi(a), i(a)) : wi(a), s = f.length, l = 0; s > l; )
							u = f[l++],
							bi && !mi(c, a, u) || (n[u] = a[u]);
			return n
	}
	: Pi
		, xi = Ii;
	eo({
			target: "Object",
			stat: !0,
			arity: 2,
			forced: Object.assign !== xi
	}, {
			assign: xi
	});
	var Li = go
		, Ri = so ? {}.toString : function() {
			return "[object " + Li(this) + "]"
	}
	;
	so || tr(Object.prototype, "toString", Ri, {
			unsafe: !0
	});
	var ki, Mi, Ni, _i, Di = "undefined" != typeof process && "process" == I(process), Fi = E, Bi = St, Gi = V, Ui = String, zi = TypeError, Wi = function(t, e, n) {
			try {
					return Fi(Bi(Object.getOwnPropertyDescriptor(t, e)[n]))
			} catch (t) {}
	}, Hi = Ne, Vi = function(t) {
			if ("object" == typeof t || Gi(t))
					return t;
			throw zi("Can't set " + Ui(t) + " as a prototype")
	}, qi = Object.setPrototypeOf || ("__proto__"in {} ? function() {
			var t, e = !1, n = {};
			try {
					(t = Wi(Object.prototype, "__proto__", "set"))(n, []),
					e = n instanceof Array
			} catch (t) {}
			return function(n, r) {
					return Hi(n),
					Vi(r),
					e ? t(n, r) : n.__proto__ = r,
					n
			}
	}() : void 0), Ji = xe.f, Ki = Ht, Xi = oe("toStringTag"), Yi = function(t, e, n) {
			t && !n && (t = t.prototype),
			t && !Ki(t, Xi) && Ji(t, Xi, {
					configurable: !0,
					value: e
			})
	}, $i = $, Qi = ii, Zi = f, tc = oe("species"), ec = Q, nc = TypeError, rc = function(t, e) {
			if (ec(e, t))
					return t;
			throw nc("Incorrect invocation")
	}, oc = Ro, ic = gt, cc = TypeError, uc = Ne, ac = function(t) {
			if (oc(t))
					return t;
			throw cc(ic(t) + " is not a constructor")
	}, fc = N, sc = oe("species"), lc = s, pc = Function.prototype, hc = pc.apply, vc = pc.call, dc = "object" == typeof Reflect && Reflect.apply || (lc ? vc.bind(hc) : function() {
			return vc.apply(hc, arguments)
	}
	), yc = I, bc = E, gc = function(t) {
			if ("Function" === yc(t))
					return bc(t)
	}, mc = St, Oc = s, wc = gc(gc.bind), Sc = function(t, e) {
			return mc(t),
			void 0 === e ? t : Oc ? wc(t, e) : function() {
					return t.apply(e, arguments)
			}
	}, jc = $("document", "documentElement"), Tc = E([].slice), Ec = TypeError, Pc = /(?:ipad|iphone|ipod).*applewebkit/i.test(Z), Ac = c, Cc = dc, Ic = Sc, xc = V, Lc = Ht, Rc = a, kc = jc, Mc = Tc, Nc = ge, _c = function(t, e) {
			if (t < e)
					throw Ec("Not enough arguments");
			return t
	}, Dc = Pc, Fc = Di, Bc = Ac.setImmediate, Gc = Ac.clearImmediate, Uc = Ac.process, zc = Ac.Dispatch, Wc = Ac.Function, Hc = Ac.MessageChannel, Vc = Ac.String, qc = 0, Jc = {}, Kc = "onreadystatechange";
	Rc((function() {
			ki = Ac.location
	}
	));
	var Xc = function(t) {
			if (Lc(Jc, t)) {
					var e = Jc[t];
					delete Jc[t],
					e()
			}
	}
		, Yc = function(t) {
			return function() {
					Xc(t)
			}
	}
		, $c = function(t) {
			Xc(t.data)
	}
		, Qc = function(t) {
			Ac.postMessage(Vc(t), ki.protocol + "//" + ki.host)
	};
	Bc && Gc || (Bc = function(t) {
			_c(arguments.length, 1);
			var e = xc(t) ? t : Wc(t)
				, n = Mc(arguments, 1);
			return Jc[++qc] = function() {
					Cc(e, void 0, n)
			}
			,
			Mi(qc),
			qc
	}
	,
	Gc = function(t) {
			delete Jc[t]
	}
	,
	Fc ? Mi = function(t) {
			Uc.nextTick(Yc(t))
	}
	: zc && zc.now ? Mi = function(t) {
			zc.now(Yc(t))
	}
	: Hc && !Dc ? (_i = (Ni = new Hc).port2,
	Ni.port1.onmessage = $c,
	Mi = Ic(_i.postMessage, _i)) : Ac.addEventListener && xc(Ac.postMessage) && !Ac.importScripts && ki && "file:" !== ki.protocol && !Rc(Qc) ? (Mi = Qc,
	Ac.addEventListener("message", $c, !1)) : Mi = Kc in Nc("script") ? function(t) {
			kc.appendChild(Nc("script"))[Kc] = function() {
					kc.removeChild(this),
					Xc(t)
			}
	}
	: function(t) {
			setTimeout(Yc(t), 0)
	}
	);
	var Zc = {
			set: Bc,
			clear: Gc
	}
		, tu = function() {
			this.head = null,
			this.tail = null
	};
	tu.prototype = {
			add: function(t) {
					var e = {
							item: t,
							next: null
					}
						, n = this.tail;
					n ? n.next = e : this.head = e,
					this.tail = e
			},
			get: function() {
					var t = this.head;
					if (t)
							return null === (this.head = t.next) && (this.tail = null),
							t.item
			}
	};
	var eu, nu, ru, ou, iu, cu = tu, uu = /ipad|iphone|ipod/i.test(Z) && "undefined" != typeof Pebble, au = /web0s(?!.*chrome)/i.test(Z), fu = c, su = Sc, lu = u.f, pu = Zc.set, hu = cu, vu = Pc, du = uu, yu = au, bu = Di, gu = fu.MutationObserver || fu.WebKitMutationObserver, mu = fu.document, Ou = fu.process, wu = fu.Promise, Su = lu(fu, "queueMicrotask"), ju = Su && Su.value;
	if (!ju) {
			var Tu = new hu
				, Eu = function() {
					var t, e;
					for (bu && (t = Ou.domain) && t.exit(); e = Tu.get(); )
							try {
									e()
							} catch (t) {
									throw Tu.head && eu(),
									t
							}
					t && t.enter()
			};
			vu || bu || yu || !gu || !mu ? !du && wu && wu.resolve ? ((ou = wu.resolve(void 0)).constructor = wu,
			iu = su(ou.then, ou),
			eu = function() {
					iu(Eu)
			}
			) : bu ? eu = function() {
					Ou.nextTick(Eu)
			}
			: (pu = su(pu, fu),
			eu = function() {
					pu(Eu)
			}
			) : (nu = !0,
			ru = mu.createTextNode(""),
			new gu(Eu).observe(ru, {
					characterData: !0
			}),
			eu = function() {
					ru.data = nu = !nu
			}
			),
			ju = function(t) {
					Tu.head || eu(),
					Tu.add(t)
			}
	}
	var Pu = ju
		, Au = function(t) {
			try {
					return {
							error: !1,
							value: t()
					}
			} catch (t) {
					return {
							error: !0,
							value: t
					}
			}
	}
		, Cu = c.Promise
		, Iu = "object" == typeof Deno && Deno && "object" == typeof Deno.version
		, xu = !Iu && !Di && "object" == typeof window && "object" == typeof document
		, Lu = c
		, Ru = Cu
		, ku = V
		, Mu = Jr
		, Nu = sn
		, _u = oe
		, Du = xu
		, Fu = Iu
		, Bu = ct;
	Ru && Ru.prototype;
	var Gu = _u("species")
		, Uu = !1
		, zu = ku(Lu.PromiseRejectionEvent)
		, Wu = Mu("Promise", (function() {
			var t = Nu(Ru)
				, e = t !== String(Ru);
			if (!e && 66 === Bu)
					return !0;
			if (!Bu || Bu < 51 || !/native code/.test(t)) {
					var n = new Ru((function(t) {
							t(1)
					}
					))
						, r = function(t) {
							t((function() {}
							), (function() {}
							))
					};
					if ((n.constructor = {})[Gu] = r,
					!(Uu = n.then((function() {}
					))instanceof r))
							return !0
			}
			return !e && (Du || Fu) && !zu
	}
	))
		, Hu = {
			CONSTRUCTOR: Wu,
			REJECTION_EVENT: zu,
			SUBCLASSING: Uu
	}
		, Vu = {}
		, qu = St
		, Ju = TypeError
		, Ku = function(t) {
			var e, n;
			this.promise = new t((function(t, r) {
					if (void 0 !== e || void 0 !== n)
							throw Ju("Bad Promise constructor");
					e = t,
					n = r
			}
			)),
			this.resolve = qu(e),
			this.reject = qu(n)
	};
	Vu.f = function(t) {
			return new Ku(t)
	}
	;
	var Xu, Yu, $u, Qu = eo, Zu = Di, ta = c, ea = h, na = tr, ra = qi, oa = Yi, ia = function(t) {
			var e = $i(t);
			Zi && e && !e[tc] && Qi(e, tc, {
					configurable: !0,
					get: function() {
							return this
					}
			})
	}, ca = St, ua = V, aa = K, fa = rc, sa = function(t, e) {
			var n, r = uc(t).constructor;
			return void 0 === r || fc(n = uc(r)[sc]) ? e : ac(n)
	}, la = Zc.set, pa = Pu, ha = function(t, e) {
			try {
					1 == arguments.length ? console.error(t) : console.error(t, e)
			} catch (t) {}
	}, va = Au, da = cu, ya = Ln, ba = Cu, ga = Vu, ma = "Promise", Oa = Hu.CONSTRUCTOR, wa = Hu.REJECTION_EVENT, Sa = Hu.SUBCLASSING, ja = ya.getterFor(ma), Ta = ya.set, Ea = ba && ba.prototype, Pa = ba, Aa = Ea, Ca = ta.TypeError, Ia = ta.document, xa = ta.process, La = ga.f, Ra = La, ka = !!(Ia && Ia.createEvent && ta.dispatchEvent), Ma = "unhandledrejection", Na = function(t) {
			var e;
			return !(!aa(t) || !ua(e = t.then)) && e
	}, _a = function(t, e) {
			var n, r, o, i = e.value, c = 1 == e.state, u = c ? t.ok : t.fail, a = t.resolve, f = t.reject, s = t.domain;
			try {
					u ? (c || (2 === e.rejection && Ua(e),
					e.rejection = 1),
					!0 === u ? n = i : (s && s.enter(),
					n = u(i),
					s && (s.exit(),
					o = !0)),
					n === t.promise ? f(Ca("Promise-chain cycle")) : (r = Na(n)) ? ea(r, n, a, f) : a(n)) : f(i)
			} catch (t) {
					s && !o && s.exit(),
					f(t)
			}
	}, Da = function(t, e) {
			t.notified || (t.notified = !0,
			pa((function() {
					for (var n, r = t.reactions; n = r.get(); )
							_a(n, t);
					t.notified = !1,
					e && !t.rejection && Ba(t)
			}
			)))
	}, Fa = function(t, e, n) {
			var r, o;
			ka ? ((r = Ia.createEvent("Event")).promise = e,
			r.reason = n,
			r.initEvent(t, !1, !0),
			ta.dispatchEvent(r)) : r = {
					promise: e,
					reason: n
			},
			!wa && (o = ta["on" + t]) ? o(r) : t === Ma && ha("Unhandled promise rejection", n)
	}, Ba = function(t) {
			ea(la, ta, (function() {
					var e, n = t.facade, r = t.value;
					if (Ga(t) && (e = va((function() {
							Zu ? xa.emit("unhandledRejection", r, n) : Fa(Ma, n, r)
					}
					)),
					t.rejection = Zu || Ga(t) ? 2 : 1,
					e.error))
							throw e.value
			}
			))
	}, Ga = function(t) {
			return 1 !== t.rejection && !t.parent
	}, Ua = function(t) {
			ea(la, ta, (function() {
					var e = t.facade;
					Zu ? xa.emit("rejectionHandled", e) : Fa("rejectionhandled", e, t.value)
			}
			))
	}, za = function(t, e, n) {
			return function(r) {
					t(e, r, n)
			}
	}, Wa = function(t, e, n) {
			t.done || (t.done = !0,
			n && (t = n),
			t.value = e,
			t.state = 2,
			Da(t, !0))
	}, Ha = function(t, e, n) {
			if (!t.done) {
					t.done = !0,
					n && (t = n);
					try {
							if (t.facade === e)
									throw Ca("Promise can't be resolved itself");
							var r = Na(e);
							r ? pa((function() {
									var n = {
											done: !1
									};
									try {
											ea(r, e, za(Ha, n, t), za(Wa, n, t))
									} catch (e) {
											Wa(n, e, t)
									}
							}
							)) : (t.value = e,
							t.state = 1,
							Da(t, !1))
					} catch (e) {
							Wa({
									done: !1
							}, e, t)
					}
			}
	};
	if (Oa && (Aa = (Pa = function(t) {
			fa(this, Aa),
			ca(t),
			ea(Xu, this);
			var e = ja(this);
			try {
					t(za(Ha, e), za(Wa, e))
			} catch (t) {
					Wa(e, t)
			}
	}
	).prototype,
	(Xu = function(t) {
			Ta(this, {
					type: ma,
					done: !1,
					notified: !1,
					parent: !1,
					reactions: new da,
					rejection: !1,
					state: 0,
					value: void 0
			})
	}
	).prototype = na(Aa, "then", (function(t, e) {
			var n = ja(this)
				, r = La(sa(this, Pa));
			return n.parent = !0,
			r.ok = !ua(t) || t,
			r.fail = ua(e) && e,
			r.domain = Zu ? xa.domain : void 0,
			0 == n.state ? n.reactions.add(r) : pa((function() {
					_a(r, n)
			}
			)),
			r.promise
	}
	)),
	Yu = function() {
			var t = new Xu
				, e = ja(t);
			this.promise = t,
			this.resolve = za(Ha, e),
			this.reject = za(Wa, e)
	}
	,
	ga.f = La = function(t) {
			return t === Pa || undefined === t ? new Yu(t) : Ra(t)
	}
	,
	ua(ba) && Ea !== Object.prototype)) {
			$u = Ea.then,
			Sa || na(Ea, "then", (function(t, e) {
					var n = this;
					return new Pa((function(t, e) {
							ea($u, n, t, e)
					}
					)).then(t, e)
			}
			), {
					unsafe: !0
			});
			try {
					delete Ea.constructor
			} catch (t) {}
			ra && ra(Ea, Aa)
	}
	Qu({
			global: !0,
			constructor: !0,
			wrap: !0,
			forced: Oa
	}, {
			Promise: Pa
	}),
	oa(Pa, ma, !1),
	ia(ma);
	var Va = {}
		, qa = Va
		, Ja = oe("iterator")
		, Ka = Array.prototype
		, Xa = go
		, Ya = Et
		, $a = N
		, Qa = Va
		, Za = oe("iterator")
		, tf = function(t) {
			if (!$a(t))
					return Ya(t, Za) || Ya(t, "@@iterator") || Qa[Xa(t)]
	}
		, ef = h
		, nf = St
		, rf = Ne
		, of = gt
		, cf = tf
		, uf = TypeError
		, af = h
		, ff = Ne
		, sf = Et
		, lf = Sc
		, pf = h
		, hf = Ne
		, vf = gt
		, df = function(t) {
			return void 0 !== t && (qa.Array === t || Ka[Ja] === t)
	}
		, yf = hr
		, bf = Q
		, gf = function(t, e) {
			var n = arguments.length < 2 ? cf(t) : e;
			if (nf(n))
					return rf(ef(n, t));
			throw uf(of(t) + " is not iterable")
	}
		, mf = tf
		, Of = function(t, e, n) {
			var r, o;
			ff(t);
			try {
					if (!(r = sf(t, "return"))) {
							if ("throw" === e)
									throw n;
							return n
					}
					r = af(r, t)
			} catch (t) {
					o = !0,
					r = t
			}
			if ("throw" === e)
					throw n;
			if (o)
					throw r;
			return ff(r),
			n
	}
		, wf = TypeError
		, Sf = function(t, e) {
			this.stopped = t,
			this.result = e
	}
		, jf = Sf.prototype
		, Tf = function(t, e, n) {
			var r, o, i, c, u, a, f, s = n && n.that, l = !(!n || !n.AS_ENTRIES), p = !(!n || !n.IS_RECORD), h = !(!n || !n.IS_ITERATOR), v = !(!n || !n.INTERRUPTED), d = lf(e, s), y = function(t) {
					return r && Of(r, "normal", t),
					new Sf(!0,t)
			}, b = function(t) {
					return l ? (hf(t),
					v ? d(t[0], t[1], y) : d(t[0], t[1])) : v ? d(t, y) : d(t)
			};
			if (p)
					r = t.iterator;
			else if (h)
					r = t;
			else {
					if (!(o = mf(t)))
							throw wf(vf(t) + " is not iterable");
					if (df(o)) {
							for (i = 0,
							c = yf(t); c > i; i++)
									if ((u = b(t[i])) && bf(jf, u))
											return u;
							return new Sf(!1)
					}
					r = gf(t, o)
			}
			for (a = p ? t.next : r.next; !(f = pf(a, r)).done; ) {
					try {
							u = b(f.value)
					} catch (t) {
							Of(r, "throw", t)
					}
					if ("object" == typeof u && u && bf(jf, u))
							return u
			}
			return new Sf(!1)
	}
		, Ef = oe("iterator")
		, Pf = !1;
	try {
			var Af = 0
				, Cf = {
					next: function() {
							return {
									done: !!Af++
							}
					},
					return: function() {
							Pf = !0
					}
			};
			Cf[Ef] = function() {
					return this
			}
			,
			Array.from(Cf, (function() {
					throw 2
			}
			))
	} catch (t) {}
	var If = function(t, e) {
			if (!e && !Pf)
					return !1;
			var n = !1;
			try {
					var r = {};
					r[Ef] = function() {
							return {
									next: function() {
											return {
													done: n = !0
											}
									}
							}
					}
					,
					t(r)
			} catch (t) {}
			return n
	}
		, xf = Cu
		, Lf = Hu.CONSTRUCTOR || !If((function(t) {
			xf.all(t).then(void 0, (function() {}
			))
	}
	))
		, Rf = h
		, kf = St
		, Mf = Vu
		, Nf = Au
		, _f = Tf;
	eo({
			target: "Promise",
			stat: !0,
			forced: Lf
	}, {
			all: function(t) {
					var e = this
						, n = Mf.f(e)
						, r = n.resolve
						, o = n.reject
						, i = Nf((function() {
							var n = kf(e.resolve)
								, i = []
								, c = 0
								, u = 1;
							_f(t, (function(t) {
									var a = c++
										, f = !1;
									u++,
									Rf(n, e, t).then((function(t) {
											f || (f = !0,
											i[a] = t,
											--u || r(i))
									}
									), o)
							}
							)),
							--u || r(i)
					}
					));
					return i.error && o(i.value),
					n.promise
			}
	});
	var Df = eo
		, Ff = Hu.CONSTRUCTOR
		, Bf = Cu
		, Gf = $
		, Uf = V
		, zf = tr
		, Wf = Bf && Bf.prototype;
	if (Df({
			target: "Promise",
			proto: !0,
			forced: Ff,
			real: !0
	}, {
			catch: function(t) {
					return this.then(void 0, t)
			}
	}),
	Uf(Bf)) {
			var Hf = Gf("Promise").prototype.catch;
			Wf.catch !== Hf && zf(Wf, "catch", Hf, {
					unsafe: !0
			})
	}
	var Vf = h
		, qf = St
		, Jf = Vu
		, Kf = Au
		, Xf = Tf;
	eo({
			target: "Promise",
			stat: !0,
			forced: Lf
	}, {
			race: function(t) {
					var e = this
						, n = Jf.f(e)
						, r = n.reject
						, o = Kf((function() {
							var o = qf(e.resolve);
							Xf(t, (function(t) {
									Vf(o, e, t).then(n.resolve, r)
							}
							))
					}
					));
					return o.error && r(o.value),
					n.promise
			}
	});
	var Yf = h
		, $f = Vu;
	eo({
			target: "Promise",
			stat: !0,
			forced: Hu.CONSTRUCTOR
	}, {
			reject: function(t) {
					var e = $f.f(this);
					return Yf(e.reject, void 0, t),
					e.promise
			}
	});
	var Qf = Ne
		, Zf = K
		, ts = Vu
		, es = eo
		, ns = Hu.CONSTRUCTOR
		, rs = function(t, e) {
			if (Qf(t),
			Zf(e) && e.constructor === t)
					return e;
			var n = ts.f(t);
			return (0,
			n.resolve)(e),
			n.promise
	};
	$("Promise"),
	es({
			target: "Promise",
			stat: !0,
			forced: ns
	}, {
			resolve: function(t) {
					return rs(this, t)
			}
	});
	var os = {}
		, is = f
		, cs = Le
		, us = xe
		, as = Ne
		, fs = U
		, ss = yi;
	os.f = is && !cs ? Object.defineProperties : function(t, e) {
			as(t);
			for (var n, r = fs(e), o = ss(e), i = o.length, c = 0; i > c; )
					us.f(t, n = o[c++], r[n]);
			return t
	}
	;
	var ls, ps = Ne, hs = os, vs = Er, ds = bn, ys = jc, bs = ge, gs = "prototype", ms = "script", Os = yn("IE_PROTO"), ws = function() {}, Ss = function(t) {
			return "<" + ms + ">" + t + "</" + ms + ">"
	}, js = function(t) {
			t.write(Ss("")),
			t.close();
			var e = t.parentWindow.Object;
			return t = null,
			e
	}, Ts = function() {
			try {
					ls = new ActiveXObject("htmlfile")
			} catch (t) {}
			var t, e, n;
			Ts = "undefined" != typeof document ? document.domain && ls ? js(ls) : (e = bs("iframe"),
			n = "java" + ms + ":",
			e.style.display = "none",
			ys.appendChild(e),
			e.src = String(n),
			(t = e.contentWindow.document).open(),
			t.write(Ss("document.F=Object")),
			t.close(),
			t.F) : js(ls);
			for (var r = vs.length; r--; )
					delete Ts[gs][vs[r]];
			return Ts()
	};
	ds[Os] = !0;
	var Es = Object.create || function(t, e) {
			var n;
			return null !== t ? (ws[gs] = ps(t),
			n = new ws,
			ws[gs] = null,
			n[Os] = t) : n = Ts(),
			void 0 === e ? n : hs.f(n, e)
	}
		, Ps = oe
		, As = Es
		, Cs = xe.f
		, Is = Ps("unscopables")
		, xs = Array.prototype;
	null == xs[Is] && Cs(xs, Is, {
			configurable: !0,
			value: As(null)
	});
	var Ls, Rs, ks, Ms = !a((function() {
			function t() {}
			return t.prototype.constructor = null,
			Object.getPrototypeOf(new t) !== t.prototype
	}
	)), Ns = Ht, _s = V, Ds = Ut, Fs = Ms, Bs = yn("IE_PROTO"), Gs = Object, Us = Gs.prototype, zs = Fs ? Gs.getPrototypeOf : function(t) {
			var e = Ds(t);
			if (Ns(e, Bs))
					return e[Bs];
			var n = e.constructor;
			return _s(n) && e instanceof n ? n.prototype : e instanceof Gs ? Us : null
	}
	, Ws = a, Hs = V, Vs = K, qs = zs, Js = tr, Ks = oe("iterator"), Xs = !1;
	[].keys && ("next"in (ks = [].keys()) ? (Rs = qs(qs(ks))) !== Object.prototype && (Ls = Rs) : Xs = !0);
	var Ys = !Vs(Ls) || Ws((function() {
			var t = {};
			return Ls[Ks].call(t) !== t
	}
	));
	Ys && (Ls = {}),
	Hs(Ls[Ks]) || Js(Ls, Ks, (function() {
			return this
	}
	));
	var $s = {
			IteratorPrototype: Ls,
			BUGGY_SAFARI_ITERATORS: Xs
	}
		, Qs = $s.IteratorPrototype
		, Zs = Es
		, tl = O
		, el = Yi
		, nl = Va
		, rl = function() {
			return this
	}
		, ol = eo
		, il = h
		, cl = V
		, ul = function(t, e, n, r) {
			var o = e + " Iterator";
			return t.prototype = Zs(Qs, {
					next: tl(+!r, n)
			}),
			el(t, o, !1),
			nl[o] = rl,
			t
	}
		, al = zs
		, fl = qi
		, sl = Yi
		, ll = Xe
		, pl = tr
		, hl = Va
		, vl = nn.PROPER
		, dl = nn.CONFIGURABLE
		, yl = $s.IteratorPrototype
		, bl = $s.BUGGY_SAFARI_ITERATORS
		, gl = oe("iterator")
		, ml = "keys"
		, Ol = "values"
		, wl = "entries"
		, Sl = function() {
			return this
	}
		, jl = function(t, e, n, r, o, i, c) {
			ul(n, e, r);
			var u, a, f, s = function(t) {
					if (t === o && d)
							return d;
					if (!bl && t in h)
							return h[t];
					switch (t) {
					case ml:
					case Ol:
					case wl:
							return function() {
									return new n(this,t)
							}
					}
					return function() {
							return new n(this)
					}
			}, l = e + " Iterator", p = !1, h = t.prototype, v = h[gl] || h["@@iterator"] || o && h[o], d = !bl && v || s(o), y = "Array" == e && h.entries || v;
			if (y && (u = al(y.call(new t))) !== Object.prototype && u.next && (al(u) !== yl && (fl ? fl(u, yl) : cl(u[gl]) || pl(u, gl, Sl)),
			sl(u, l, !0)),
			vl && o == Ol && v && v.name !== Ol && (dl ? ll(h, "name", Ol) : (p = !0,
			d = function() {
					return il(v, this)
			}
			)),
			o)
					if (a = {
							values: s(Ol),
							keys: i ? d : s(ml),
							entries: s(wl)
					},
					c)
							for (f in a)
									(bl || p || !(f in h)) && pl(h, f, a[f]);
					else
							ol({
									target: e,
									proto: !0,
									forced: bl || p
							}, a);
			return h[gl] !== d && pl(h, gl, d, {
					name: o
			}),
			hl[e] = d,
			a
	}
		, Tl = function(t, e) {
			return {
					value: t,
					done: e
			}
	}
		, El = U
		, Pl = function(t) {
			xs[Is][t] = !0
	}
		, Al = Va
		, Cl = Ln
		, Il = xe.f
		, xl = jl
		, Ll = Tl
		, Rl = f
		, kl = "Array Iterator"
		, Ml = Cl.set
		, Nl = Cl.getterFor(kl)
		, _l = xl(Array, "Array", (function(t, e) {
			Ml(this, {
					type: kl,
					target: El(t),
					index: 0,
					kind: e
			})
	}
	), (function() {
			var t = Nl(this)
				, e = t.target
				, n = t.kind
				, r = t.index++;
			return !e || r >= e.length ? (t.target = void 0,
			Ll(void 0, !0)) : Ll("keys" == n ? r : "values" == n ? e[r] : [r, e[r]], !1)
	}
	), "values")
		, Dl = Al.Arguments = Al.Array;
	if (Pl("keys"),
	Pl("values"),
	Pl("entries"),
	Rl && "values" !== Dl.name)
			try {
					Il(Dl, "name", {
							value: "values"
					})
			} catch (t) {}
	var Fl = go
		, Bl = String
		, Gl = function(t) {
			if ("Symbol" === Fl(t))
					throw TypeError("Cannot convert a Symbol value to a string");
			return Bl(t)
	}
		, Ul = E
		, zl = ir
		, Wl = Gl
		, Hl = F
		, Vl = Ul("".charAt)
		, ql = Ul("".charCodeAt)
		, Jl = Ul("".slice)
		, Kl = function(t) {
			return function(e, n) {
					var r, o, i = Wl(Hl(e)), c = zl(n), u = i.length;
					return c < 0 || c >= u ? t ? "" : void 0 : (r = ql(i, c)) < 55296 || r > 56319 || c + 1 === u || (o = ql(i, c + 1)) < 56320 || o > 57343 ? t ? Vl(i, c) : r : t ? Jl(i, c, c + 2) : o - 56320 + (r - 55296 << 10) + 65536
			}
	}
		, Xl = {
			codeAt: Kl(!1),
			charAt: Kl(!0)
	}.charAt
		, Yl = Gl
		, $l = Ln
		, Ql = jl
		, Zl = Tl
		, tp = "String Iterator"
		, ep = $l.set
		, np = $l.getterFor(tp);
	Ql(String, "String", (function(t) {
			ep(this, {
					type: tp,
					string: Yl(t),
					index: 0
			})
	}
	), (function() {
			var t, e = np(this), n = e.string, r = e.index;
			return r >= n.length ? Zl(void 0, !0) : (t = Xl(n, r),
			e.index += t.length,
			Zl(t, !1))
	}
	));
	var rp = {
			exports: {}
	}
		, op = {}
		, ip = fr
		, cp = hr
		, up = ao
		, ap = Array
		, fp = Math.max
		, sp = I
		, lp = U
		, pp = er.f
		, hp = function(t, e, n) {
			for (var r = cp(t), o = ip(e, r), i = ip(void 0 === n ? r : n, r), c = ap(fp(i - o, 0)), u = 0; o < i; o++,
			u++)
					up(c, u, t[o]);
			return c.length = u,
			c
	}
		, vp = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
	op.f = function(t) {
			return vp && "Window" == sp(t) ? function(t) {
					try {
							return pp(t)
					} catch (t) {
							return hp(vp)
					}
			}(t) : pp(lp(t))
	}
	;
	var dp = a((function() {
			if ("function" == typeof ArrayBuffer) {
					var t = new ArrayBuffer(8);
					Object.isExtensible(t) && Object.defineProperty(t, "a", {
							value: 8
					})
			}
	}
	))
		, yp = a
		, bp = K
		, gp = I
		, mp = dp
		, Op = Object.isExtensible
		, wp = yp((function() {
			Op(1)
	}
	)) || mp ? function(t) {
			return !!bp(t) && ((!mp || "ArrayBuffer" != gp(t)) && (!Op || Op(t)))
	}
	: Op
		, Sp = !a((function() {
			return Object.isExtensible(Object.preventExtensions({}))
	}
	))
		, jp = eo
		, Tp = E
		, Ep = bn
		, Pp = K
		, Ap = Ht
		, Cp = xe.f
		, Ip = er
		, xp = op
		, Lp = wp
		, Rp = Sp
		, kp = !1
		, Mp = Xt("meta")
		, Np = 0
		, _p = function(t) {
			Cp(t, Mp, {
					value: {
							objectID: "O" + Np++,
							weakData: {}
					}
			})
	}
		, Dp = rp.exports = {
			enable: function() {
					Dp.enable = function() {}
					,
					kp = !0;
					var t = Ip.f
						, e = Tp([].splice)
						, n = {};
					n[Mp] = 1,
					t(n).length && (Ip.f = function(n) {
							for (var r = t(n), o = 0, i = r.length; o < i; o++)
									if (r[o] === Mp) {
											e(r, o, 1);
											break
									}
							return r
					}
					,
					jp({
							target: "Object",
							stat: !0,
							forced: !0
					}, {
							getOwnPropertyNames: xp.f
					}))
			},
			fastKey: function(t, e) {
					if (!Pp(t))
							return "symbol" == typeof t ? t : ("string" == typeof t ? "S" : "P") + t;
					if (!Ap(t, Mp)) {
							if (!Lp(t))
									return "F";
							if (!e)
									return "E";
							_p(t)
					}
					return t[Mp].objectID
			},
			getWeakData: function(t, e) {
					if (!Ap(t, Mp)) {
							if (!Lp(t))
									return !0;
							if (!e)
									return !1;
							_p(t)
					}
					return t[Mp].weakData
			},
			onFreeze: function(t) {
					return Rp && kp && Lp(t) && !Ap(t, Mp) && _p(t),
					t
			}
	};
	Ep[Mp] = !0;
	var Fp = rp.exports
		, Bp = V
		, Gp = K
		, Up = qi
		, zp = eo
		, Wp = c
		, Hp = E
		, Vp = Jr
		, qp = tr
		, Jp = Fp
		, Kp = Tf
		, Xp = rc
		, Yp = V
		, $p = N
		, Qp = K
		, Zp = a
		, th = If
		, eh = Yi
		, nh = function(t, e, n) {
			var r, o;
			return Up && Bp(r = e.constructor) && r !== n && Gp(o = r.prototype) && o !== n.prototype && Up(t, o),
			t
	}
		, rh = tr
		, oh = Sc
		, ih = M
		, ch = Ut
		, uh = hr
		, ah = Bo
		, fh = E([].push)
		, sh = function(t) {
			var e = 1 == t
				, n = 2 == t
				, r = 3 == t
				, o = 4 == t
				, i = 6 == t
				, c = 7 == t
				, u = 5 == t || i;
			return function(a, f, s, l) {
					for (var p, h, v = ch(a), d = ih(v), y = oh(f, s), b = uh(d), g = 0, m = l || ah, O = e ? m(a, b) : n || c ? m(a, 0) : void 0; b > g; g++)
							if ((u || g in d) && (h = y(p = d[g], g, v),
							t))
									if (e)
											O[g] = h;
									else if (h)
											switch (t) {
											case 3:
													return !0;
											case 5:
													return p;
											case 6:
													return g;
											case 2:
													fh(O, p)
											}
									else
											switch (t) {
											case 4:
													return !1;
											case 7:
													fh(O, p)
											}
					return i ? -1 : r || o ? o : O
			}
	}
		, lh = {
			forEach: sh(0),
			map: sh(1),
			filter: sh(2),
			some: sh(3),
			every: sh(4),
			find: sh(5),
			findIndex: sh(6),
			filterReject: sh(7)
	}
		, ph = E
		, hh = function(t, e, n) {
			for (var r in e)
					rh(t, r, e[r], n);
			return t
	}
		, vh = Fp.getWeakData
		, dh = rc
		, yh = Ne
		, bh = N
		, gh = K
		, mh = Tf
		, Oh = Ht
		, wh = Ln.set
		, Sh = Ln.getterFor
		, jh = lh.find
		, Th = lh.findIndex
		, Eh = ph([].splice)
		, Ph = 0
		, Ah = function(t) {
			return t.frozen || (t.frozen = new Ch)
	}
		, Ch = function() {
			this.entries = []
	}
		, Ih = function(t, e) {
			return jh(t.entries, (function(t) {
					return t[0] === e
			}
			))
	};
	Ch.prototype = {
			get: function(t) {
					var e = Ih(this, t);
					if (e)
							return e[1]
			},
			has: function(t) {
					return !!Ih(this, t)
			},
			set: function(t, e) {
					var n = Ih(this, t);
					n ? n[1] = e : this.entries.push([t, e])
			},
			delete: function(t) {
					var e = Th(this.entries, (function(e) {
							return e[0] === t
					}
					));
					return ~e && Eh(this.entries, e, 1),
					!!~e
			}
	};
	var xh = {
			getConstructor: function(t, e, n, r) {
					var o = t((function(t, o) {
							dh(t, i),
							wh(t, {
									type: e,
									id: Ph++,
									frozen: void 0
							}),
							bh(o) || mh(o, t[r], {
									that: t,
									AS_ENTRIES: n
							})
					}
					))
						, i = o.prototype
						, c = Sh(e)
						, u = function(t, e, n) {
							var r = c(t)
								, o = vh(yh(e), !0);
							return !0 === o ? Ah(r).set(e, n) : o[r.id] = n,
							t
					};
					return hh(i, {
							delete: function(t) {
									var e = c(this);
									if (!gh(t))
											return !1;
									var n = vh(t);
									return !0 === n ? Ah(e).delete(t) : n && Oh(n, e.id) && delete n[e.id]
							},
							has: function(t) {
									var e = c(this);
									if (!gh(t))
											return !1;
									var n = vh(t);
									return !0 === n ? Ah(e).has(t) : n && Oh(n, e.id)
							}
					}),
					hh(i, n ? {
							get: function(t) {
									var e = c(this);
									if (gh(t)) {
											var n = vh(t);
											return !0 === n ? Ah(e).get(t) : n ? n[e.id] : void 0
									}
							},
							set: function(t, e) {
									return u(this, t, e)
							}
					} : {
							add: function(t) {
									return u(this, t, !0)
							}
					}),
					o
			}
	};
	(function(t, e, n) {
			var r = -1 !== t.indexOf("Map")
				, o = -1 !== t.indexOf("Weak")
				, i = r ? "set" : "add"
				, c = Wp[t]
				, u = c && c.prototype
				, a = c
				, f = {}
				, s = function(t) {
					var e = Hp(u[t]);
					qp(u, t, "add" == t ? function(t) {
							return e(this, 0 === t ? 0 : t),
							this
					}
					: "delete" == t ? function(t) {
							return !(o && !Qp(t)) && e(this, 0 === t ? 0 : t)
					}
					: "get" == t ? function(t) {
							return o && !Qp(t) ? void 0 : e(this, 0 === t ? 0 : t)
					}
					: "has" == t ? function(t) {
							return !(o && !Qp(t)) && e(this, 0 === t ? 0 : t)
					}
					: function(t, n) {
							return e(this, 0 === t ? 0 : t, n),
							this
					}
					)
			};
			if (Vp(t, !Yp(c) || !(o || u.forEach && !Zp((function() {
					(new c).entries().next()
			}
			)))))
					a = n.getConstructor(e, t, r, i),
					Jp.enable();
			else if (Vp(t, !0)) {
					var l = new a
						, p = l[i](o ? {} : -0, 1) != l
						, h = Zp((function() {
							l.has(1)
					}
					))
						, v = th((function(t) {
							new c(t)
					}
					))
						, d = !o && Zp((function() {
							for (var t = new c, e = 5; e--; )
									t[i](e, e);
							return !t.has(-0)
					}
					));
					v || ((a = e((function(t, e) {
							Xp(t, u);
							var n = nh(new c, t, a);
							return $p(e) || Kp(e, n[i], {
									that: n,
									AS_ENTRIES: r
							}),
							n
					}
					))).prototype = u,
					u.constructor = a),
					(h || d) && (s("delete"),
					s("has"),
					r && s("get")),
					(d || p) && s(i),
					o && u.clear && delete u.clear
			}
			f[t] = a,
			zp({
					global: !0,
					constructor: !0,
					forced: a != c
			}, f),
			eh(a, t),
			o || n.setStrong(a, t, r)
	}
	)("WeakSet", (function(t) {
			return function() {
					return t(this, arguments.length ? arguments[0] : void 0)
			}
	}
	), xh);
	var Lh, Rh, kh, Mh = ge("span").classList, Nh = Mh && Mh.constructor && Mh.constructor.prototype, _h = Nh === Object.prototype ? void 0 : Nh, Dh = c, Fh = {
			CSSRuleList: 0,
			CSSStyleDeclaration: 0,
			CSSValueList: 0,
			ClientRectList: 0,
			DOMRectList: 0,
			DOMStringList: 0,
			DOMTokenList: 1,
			DataTransferItemList: 0,
			FileList: 0,
			HTMLAllCollection: 0,
			HTMLCollection: 0,
			HTMLFormElement: 0,
			HTMLSelectElement: 0,
			MediaList: 0,
			MimeTypeArray: 0,
			NamedNodeMap: 0,
			NodeList: 1,
			PaintRequestList: 0,
			Plugin: 0,
			PluginArray: 0,
			SVGLengthList: 0,
			SVGNumberList: 0,
			SVGPathSegList: 0,
			SVGPointList: 0,
			SVGStringList: 0,
			SVGTransformList: 0,
			SourceBufferList: 0,
			StyleSheetList: 0,
			TextTrackCueList: 0,
			TextTrackList: 0,
			TouchList: 0
	}, Bh = _h, Gh = _l, Uh = Xe, zh = oe, Wh = zh("iterator"), Hh = zh("toStringTag"), Vh = Gh.values, qh = function(t, e) {
			if (t) {
					if (t[Wh] !== Vh)
							try {
									Uh(t, Wh, Vh)
							} catch (e) {
									t[Wh] = Vh
							}
					if (t[Hh] || Uh(t, Hh, e),
					Fh[e])
							for (var n in Gh)
									if (t[n] !== Gh[n])
											try {
													Uh(t, n, Gh[n])
											} catch (e) {
													t[n] = Gh[n]
											}
			}
	};
	for (var Jh in Fh)
			qh(Dh[Jh] && Dh[Jh].prototype, Jh);
	function Kh(t, e, n, r) {
			if ("a" === n && !r)
					throw new TypeError("Private accessor was defined without a getter");
			if ("function" == typeof e ? t !== e || !r : !e.has(t))
					throw new TypeError("Cannot read private member from an object whose class did not declare it");
			return "m" === n ? r : "a" === n ? r.call(t) : r ? r.value : e.get(t)
	}
	qh(Bh, "DOMTokenList");
	var Xh = "#ch-tooltip"
		, Yh = {
			enabled: !0,
			text: function(t, e, n) {
					return "".concat(e, " - ").concat(n.format("LLLL"))
			}
	}
		, $h = {
			placement: "top",
			modifiers: [{
					name: "offset",
					options: {
							offset: [0, 8]
					}
			}]
	}
		, Qh = {
			getBoundingClientRect: function() {
					var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
						, e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
					return {
							width: 0,
							height: 0,
							top: e,
							right: t,
							bottom: e,
							left: t,
							x: t,
							y: e,
							toJSON: function() {}
					}
			}
	}
		, Zh = function() {
			function n(t) {
					!function(t, e) {
							if (!(t instanceof e))
									throw new TypeError("Cannot call a class as a function")
					}(this, n),
					Lh.add(this),
					this.name = "Tooltip",
					this.calendar = t,
					this.root = null,
					this.popperInstance = null,
					this.options = Yh,
					this.listenerAttached = !1
			}
			var r, o, i;
			return r = n,
			(o = [{
					key: "setup",
					value: function(e) {
							this.options = Object.assign(Object.assign({}, Yh), e);
							var n = this.calendar.eventEmitter;
							if (!this.options.enabled)
									return this.listenerAttached && (n.off("mouseover", this.mouseOverCallback, this),
									n.off("mouseout", this.mouseOutCallback, this),
									this.listenerAttached = !1),
									void this.destroy();
							if (this.popperOptions = Object.assign(Object.assign({}, $h), this.options),
							this.root = document.getElementById(Xh.slice(1)),
							!this.root) {
									var r = document.createElement("div");
									r.setAttribute("id", Xh.slice(1)),
									r.setAttribute("role", "tooltip"),
									r.innerHTML = '<div id="'.concat(Xh.slice(1), '-arrow" data-popper-arrow="true"></div>') + '<span id="'.concat(Xh.slice(1), '-body"></span>'),
									this.root = document.body.appendChild(r)
							}
							this.root.setAttribute("data-theme", this.calendar.options.options.theme),
							this.popperInstance = t.createPopper(Qh, this.root, this.popperOptions),
							this.listenerAttached || (n.on("mouseover", this.mouseOverCallback, this),
							n.on("mouseout", this.mouseOutCallback, this),
							this.listenerAttached = !0)
					}
			}, {
					key: "mouseOverCallback",
					value: function(t, e, n) {
							Kh(this, Lh, "m", Rh).call(this, t.target, e, n)
					}
			}, {
					key: "mouseOutCallback",
					value: function() {
							Kh(this, Lh, "m", kh).call(this)
					}
			}, {
					key: "paint",
					value: function() {
							return Promise.resolve()
					}
			}, {
					key: "destroy",
					value: function() {
							return this.root && this.root.remove(),
							Promise.resolve()
					}
			}]) && e(r.prototype, o),
			i && e(r, i),
			Object.defineProperty(r, "prototype", {
					writable: !1
			}),
			n
	}();
	return Lh = new WeakSet,
	Rh = function(t, e, r) {
			var o = this
				, i = this.options.text
				, c = i ? i(e, r, this.calendar.dateHelper.date(e)) : null;
			c && (Qh.getBoundingClientRect = function() {
					return t.getBoundingClientRect()
			}
			,
			document.getElementById("".concat(Xh.slice(1), "-body")).innerHTML = c,
			this.popperInstance.setOptions((function() {
					return Object.assign(Object.assign({}, o.popperOptions), {
							modifiers: [].concat(n(o.popperOptions.modifiers), [{
									name: "eventListeners",
									enabled: !0
							}])
					})
			}
			)),
			this.popperInstance.update(),
			this.root.setAttribute("data-show", "1"))
	}
	,
	kh = function() {
			var t = this;
			this.root.removeAttribute("data-show"),
			this.popperInstance.setOptions((function() {
					return Object.assign(Object.assign({}, t.popperOptions), {
							modifiers: [].concat(n(t.popperOptions.modifiers), [{
									name: "eventListeners",
									enabled: !1
							}])
					})
			}
			))
	}
	,
	Zh
}
));
//# sourceMappingURL=Tooltip.min.js.map


//-------- -------- -------- --------
//-------- included js libs end
//-------- -------- -------- --------