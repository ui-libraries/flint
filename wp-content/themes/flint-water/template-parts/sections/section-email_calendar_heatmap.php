<?php
date_default_timezone_set('UTC'); // Set default timezone to UTC

// Initialize an array to hold counts per date
$date_counts = array();

// Define the years and months to fetch data for
$years = range(2010, 2016); // From 2010 to 2016

foreach ($years as $year) {
    for ($month = 1; $month <= 12; $month++) {
        // Calculate the start and end timestamps for the month in UTC
        $start_timestamp = gmmktime(0, 0, 0, $month, 1, $year);
        $end_day = gmdate('t', $start_timestamp); // Number of days in the month
        $end_timestamp = gmmktime(23, 59, 59, $month, $end_day, $year);

        // Build the API URL with filter parameters
        $api_url = 'https://fwcpublicarchive.lib.uiowa.edu/api/api.php/records/emails?columns=timestamp&filter=timestamp,bt,' . $start_timestamp . ',' . $end_timestamp . '&transform=1';

        // Fetch data from API
        $api_response = file_get_contents($api_url);

        // Check if the response is false
        if ($api_response === FALSE) {
            // Handle error gracefully
            error_log('Error fetching data from API for ' . gmdate('F Y', $start_timestamp));
            continue; // Skip to the next month
        }

        // Decode JSON response
        $data = json_decode($api_response, true);

        // Check if decoding was successful
        if ($data === NULL) {
            error_log('Error decoding JSON data for ' . gmdate('F Y', $start_timestamp));
            continue; // Skip to the next month
        }

        // Process the data
        if (isset($data['records'])) {
            foreach ($data['records'] as $record) {
                $timestamp = $record['timestamp'];
                $date = gmdate('Y-m-d', $timestamp); // Use gmdate() for UTC

                // Increment count for this date
                if (isset($date_counts[$date])) {
                    $date_counts[$date]++;
                } else {
                    $date_counts[$date] = 1;
                }
            }
        }
    }
}

// Now, build the $sample_heatmap_data array
$sample_heatmap_data = array();

foreach ($date_counts as $date => $count) {
    $sample_heatmap_data[] = array('date' => $date, 'value' => $count);
}
?>


<section class="section">
    <div class="section_head" data-aos="fade-up">
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
                    <?php am_the_sub_field('subtitle', '<div class="box_label">', '</div>'); ?>
                    <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                    <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>
                    <select id="heatmap_year">
                        <option value="" disabled="" selected="">Date</option>
                        <option value="2010">2010</option>
                        <option value="2011">2011</option>
                        <option value="2012">2012</option>
                        <option value="2013">2013</option>
                        <option value="2014">2014</option>
                        <option value="2015">2015</option>
                        <option value="2016">2016</option>
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

        <!-- Add the table container for displaying emails -->
        <div id="email-table-container"></div>
    </div>

</section>
