<?php
/*
Template Name: Heatmap Emails
*/
get_header();

date_default_timezone_set('UTC');

// Caching: optional for performance
$cache_key = 'fwc_heatmap_data';
$sample_heatmap_data = get_transient($cache_key);

if ($sample_heatmap_data === false) {
    $date_counts = [];
    $years = range(2011, 2016);

    foreach ($years as $year) {
        for ($month = 1; $month <= 12; $month++) {
            $start_timestamp = gmmktime(0, 0, 0, $month, 1, $year);
            $end_day = gmdate('t', $start_timestamp);
            $end_timestamp = gmmktime(23, 59, 59, $month, $end_day, $year);

            $api_url = 'https://fwcpublicarchive.lib.uiowa.edu/api/api.php/records/emails?columns=timestamp&filter=timestamp,bt,' . $start_timestamp . ',' . $end_timestamp . '&transform=1';
            $api_response = file_get_contents($api_url);

            if ($api_response === false) continue;

            $data = json_decode($api_response, true);
            if (!isset($data['records'])) continue;

            foreach ($data['records'] as $record) {
                $date = gmdate('Y-m-d', $record['timestamp']);
                $date_counts[$date] = ($date_counts[$date] ?? 0) + 1;
            }
        }
    }

    $sample_heatmap_data = [];
    foreach ($date_counts as $date => $count) {
        $sample_heatmap_data[] = ['date' => $date, 'value' => $count];
    }

    // Cache for 6 hours
    set_transient($cache_key, $sample_heatmap_data, 6 * HOUR_IN_SECONDS);
}

// Optional: ACF fallback
$calendar_heatmap = get_fields() ?: [];
?>

<section class="section">
    <div class="section_head" data-aos="fade-up"></div>
    <div class="container">
        <div class="info" data-aos="fade-up">
            <div class="info_head">
                <div class="info_box">
                    <?php if (!empty($calendar_heatmap['subtitle'])): ?>
                        <span class="info_label"><span><?= esc_html($calendar_heatmap['subtitle']) ?></span></span>
                    <?php endif ?>
                    <?php if (!empty($calendar_heatmap['title'])): ?>
                        <h2 class="info_title"><?= esc_html($calendar_heatmap['title']) ?></h2>
                    <?php endif ?>
                </div>
                <div class="info_box">
                    <?php am_the_sub_field('subtitle', '<div class="box_label">', '</div>') ?>
                    <?php am_the_sub_field('title', '<h2>', '</h2>') ?>
                    <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>') ?>
                </div>
            </div>
            <div class="info_body">
                <div>
                    <div class="heatmap" data-dates='<?= esc_attr(json_encode($sample_heatmap_data)) ?>'>
                        <div class="heatmap_row">
                            <div class="heatmap_nav">
                                <select id="heatmap_year">
                                    <?php foreach (range(2011, 2016) as $y): ?>
                                        <option value="<?= $y ?>" <?= $y === 2014 ? 'selected' : '' ?>><?= $y ?></option>
                                    <?php endforeach ?>
                                </select>
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
        <div id="email-table-container"></div>
    </div>
</section>

<?php get_footer(); ?>
