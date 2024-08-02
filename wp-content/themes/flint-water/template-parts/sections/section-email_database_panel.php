<?php
$frequency_chart = get_sub_field('frequency_chart');
$calendar_heatmap = get_sub_field('calendar_heatmap');
$cta = get_sub_field('cta');

$sample_heatmap_data = [
    [
        'date' => '2024-01-12',
        'value' => 40
    ],
    [
        'date' => '2024-01-16',
        'value' => 5
    ],
    [
        'date' => '2024-01-18',
        'value' => 90
    ],
    [
        'date' => '2024-01-21',
        'value' => 50
    ],
    [
        'date' => '2024-01-23',
        'value' => 5
    ],
    [
        'date' => '2024-01-25',
        'value' => 130
    ],
    [
        'date' => '2024-01-29',
        'value' => 160
    ],
    [
        'date' => '2024-02-12',
        'value' => 40
    ],
    [
        'date' => '2024-02-16',
        'value' => 5
    ],
    [
        'date' => '2024-02-18',
        'value' => 90
    ],
    [
        'date' => '2024-02-21',
        'value' => 50
    ],
    [
        'date' => '2024-02-23',
        'value' => 5
    ],
    [
        'date' => '2024-02-25',
        'value' => 130
    ],
    [
        'date' => '2024-02-29',
        'value' => 160
    ],
    [
        'date' => '2024-03-12',
        'value' => 40
    ],
    [
        'date' => '2024-03-16',
        'value' => 5
    ],
    [
        'date' => '2024-03-18',
        'value' => 90
    ],
    [
        'date' => '2024-03-21',
        'value' => 50
    ],
    [
        'date' => '2024-03-23',
        'value' => 5
    ],
    [
        'date' => '2024-03-25',
        'value' => 130
    ],
    [
        'date' => '2024-03-29',
        'value' => 160
    ],
    [
        'date' => '2024-04-12',
        'value' => 40
    ],
    [
        'date' => '2024-04-16',
        'value' => 5
    ],
    [
        'date' => '2024-04-18',
        'value' => 90
    ],
    [
        'date' => '2024-04-21',
        'value' => 50
    ],
    [
        'date' => '2024-04-23',
        'value' => 5
    ],
    [
        'date' => '2024-04-25',
        'value' => 130
    ],
    [
        'date' => '2024-04-29',
        'value' => 160
    ],
    [
        'date' => '2024-05-16',
        'value' => 5
    ],
    [
        'date' => '2024-05-18',
        'value' => 90
    ],
    [
        'date' => '2024-05-21',
        'value' => 50
    ],
    [
        'date' => '2024-05-23',
        'value' => 5
    ],
    [
        'date' => '2024-05-25',
        'value' => 130
    ],
    [
        'date' => '2024-04-29',
        'value' => 160
    ],
];
?>

<section class="section" id="<?php am_the_section_id(); ?>">
    <div class="section_head" data-aos="fade-up">
        <div class="container _width-830">
            <div class="box text-center">
<?php am_the_sub_field('subtitle', '<div class="box_label">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>

                <div class="box_search">
                    <div class="search-form">
                        <form>
                            <div class="search-form_box">
                                <input type="text" placeholder="Search  Email">
                                <button class="search-form_button" type="submit">
                                    <span class="sr-only">Search</span>
                                    <svg>
                                    <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#search">
                                    </use>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="section_row">
            <div class="info-row">
                <div class="info-col" data-aos="fade-up">
                    <div class="info">
                        <div class="info_head">
                            <div class="info_box">
                                <a class="info_label" href="<?php echo!empty($frequency_chart['link']) ? $frequency_chart['link'] : '#'; ?>">
<?php if (!empty($frequency_chart['subtitle'])) { ?>
                                        <span><?php echo $frequency_chart['subtitle']; ?></span>
                                    <?php } ?>
                                    <span class="icon-arrow-box">
                                        <svg>
                                        <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#arrow-right-long"></use>
                                        </svg>
                                    </span>
                                </a>
<?php if (!empty($frequency_chart['title'])) { ?>
                                    <h2 class="info_title"><?php echo $frequency_chart['title']; ?></h2>
                                <?php } ?>
                            </div>
                        </div>
                        <div class="info_body _chart">
                            <div>
                                <div class="info-chart-holder">
                                    <canvas id="monthlyBarChart" class="chart"data-months="[
                                            { &quot;month&quot;: &quot;Jan&quot;, &quot;emails&quot;: 95 },
                                            { &quot;month&quot;: &quot;Feb&quot;, &quot;emails&quot;: 60 },
                                            { &quot;month&quot;: &quot;Mar&quot;, &quot;emails&quot;: 40 },
                                            { &quot;month&quot;: &quot;Apr&quot;, &quot;emails&quot;: 70 },
                                            { &quot;month&quot;: &quot;May&quot;, &quot;emails&quot;: 30 },
                                            { &quot;month&quot;: &quot;Jun&quot;, &quot;emails&quot;: 110 }
                                            ]"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="info-col" data-aos="fade-up">
                    <div class="info">
                        <div class="info_head">
                            <div class="info_box">
                                <a class="info_label" href="<?php echo!empty($calendar_heatmap['link']) ? $calendar_heatmap['link'] : '#'; ?>">
<?php if (!empty($calendar_heatmap['subtitle'])) { ?>
                                        <span><?php echo $calendar_heatmap['subtitle']; ?></span>
                                    <?php } ?>
                                    <span class="icon-arrow-box">
                                        <svg>
                                        <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#arrow-right-long"></use>
                                        </svg>
                                    </span>
                                </a>
<?php if (!empty($calendar_heatmap['title'])) { ?>
                                    <h2 class="info_title"><?php echo $calendar_heatmap['title']; ?></h2>
                                <?php } ?>
                            </div>
                        </div>
                        <div class="info_body">
                            <div class="heatmap" data-dates='<?php echo json_encode($sample_heatmap_data); ?>'>
                                <div class="heatmap_row">
                                    <div class="heatmap_nav">
                                        <button class="heatmap_nav-button _prev" type="button">Previous</button>
                                        <button class="heatmap_nav-button _next" type="button">Next</button>
                                    </div>
                                    <p class="heatmap_info">Click/hover on a cell to see the 'clicked' event in action!</p>
                                </div>
                                <div class="heatmap_holder">
                                    <div id="heatmap" data-range="5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="section_row">
            <div class="cta">
                <div class="cta_box">
<?php if (!empty($cta['title'])) { ?>
                        <h2 class="cta_title"><?php echo $cta['title']; ?></h2>
                    <?php } ?>
                    <?php if (!empty($cta['subtitle'])) { ?>
                        <div class="cta_text">
                            <p><?php echo $cta['subtitle']; ?></p>
                        </div>
<?php } ?>
                </div>
                <div class="cta_box">
                    <div class="search-form">
                        <form>
                            <div class="search-form_box">
                                <input type="text" placeholder="Search for Email Address">
                                <button class="button">Search</button>
                            </div>
                        </form>
                    </div>
                    <p class="cta_info">
                        <svg class="cta_info-icon">
                        <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#exclamation-mark">
                        </use>
                        </svg>
<?php if (!empty($cta['form_description'])) { ?>
                            <span class="cta_info-text">
                            <?php echo $cta['form_description']; ?>
                            </span>
                            <?php } ?>
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>