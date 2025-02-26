<?php
global $am_option;

$am_option['shortname'] = "am";
$am_option['textdomain'] = "am";

// Functions
require get_parent_theme_file_path('/includes/fn-core.php');
require get_parent_theme_file_path('/includes/fn-custom.php');

// Extensions
require get_parent_theme_file_path('/includes/extensions/breadcrumb-trail.php');
require get_parent_theme_file_path('/includes/extensions/shortcodes/shortcodes.php');

/* Theme Init */
require get_parent_theme_file_path('/includes/theme-widgets.php');
require get_parent_theme_file_path('/includes/theme-init.php');
require get_parent_theme_file_path('/includes/theme-cpt.php');
require get_parent_theme_file_path('/includes/theme-tax.php');
require get_parent_theme_file_path('/includes/theme-shortcodes.php');

// Enqueue the email search script and other necessary scripts
function theme_enqueue_scripts() {
    if (is_page('email-search')) {
        wp_enqueue_style('bootstrap-css', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
        wp_enqueue_script('bootstrap-js', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js', array('jquery'), null, true);
    }
    
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
    wp_enqueue_style('datatables-css', 'https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css');
    // Uncomment and load custom styles *after* DataTables
    wp_enqueue_style('custom-style', get_template_directory_uri() . '/style.css', array('datatables-css'), '1.0.0');

    wp_enqueue_script('jquery');
    wp_enqueue_script('popper-js', 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js', array('jquery'), null, true);
    wp_enqueue_script('moment-js', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js', array('jquery'), null, true);
    wp_enqueue_script('chart-js', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js', array('jquery'), null, true);
    wp_enqueue_script('datatables-js', 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js', array('jquery'), null, true);
    wp_enqueue_script('email-search', get_template_directory_uri() . '/wp-assets/js/email-search.js', array('jquery'), null, true);
    
    wp_localize_script('email-search', 'ajax_object', array('ajaxurl' => admin_url('admin-ajax.php')));
}
add_action('wp_enqueue_scripts', 'theme_enqueue_scripts');

?>

