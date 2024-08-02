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

// Enqueue the email search script and localize ajaxurl
function theme_enqueue_scripts() {
    wp_enqueue_script('email-search', get_template_directory_uri() . '/wp-assets/js/email-search.js', array('jquery'), null, true);
    wp_localize_script('email-search', 'ajax_object', array('ajaxurl' => admin_url('admin-ajax.php')));
}
add_action('wp_enqueue_scripts', 'theme_enqueue_scripts');
?>

