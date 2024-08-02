<?php $calendar_heatmap = get_sub_field('calendar_heatmap'); ?>

<?php
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

<section class="section">
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
                                <input type="text" placeholder="Search Email Chart">
                                <button class="button">Search</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container">

        <div class="info" data-aos="fade-up">
            <div class="info_head">
                <div class="info_box">
                    <?php if (!empty($calendar_heatmap['subtitle'])) { ?>
                        <span class="info_label">
                            <span><?php echo $calendar_heatmap['subtitle']; ?></span>
                        </span>
                    <?php } ?>

                    <?php if (!empty($calendar_heatmap['title'])) { ?>
                        <h2 class="info_title"><?php echo $calendar_heatmap['title']; ?></h2>
                    <?php } ?>
                </div>
                <div class="info_box">
                    <select>
                        <option value="" disabled="" selected="">Date</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                    </select>
                </div>
            </div>
            <div class="info_body">
                <div>
                    <div class="heatmap" data-dates='<?php echo json_encode($sample_heatmap_data); ?>'>
                        <div class="heatmap_row">
                            <div class="heatmap_nav">
                                <button class="heatmap_nav-button _prev" type="button">Previous</button>
                                <button class="heatmap_nav-button _next" type="button">Next</button>
                            </div>
                            <p class="heatmap_info">Click/hover on a cell to see the 'clicked' event in action!</p>
                        </div>
                        <div class="heatmap_holder">
                            <div id="heatmap"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</section>
