<?php

// Add Shortcode
function project_data_shortcode( $atts , $content = null ) {

    $theme_dir_name = get_template();

    $theme_dir_path = get_template_directory();

    $theme_dir_url = get_template_directory_uri();

    $file_paths = glob($theme_dir_path . '/markup-template/markup/*.html');

    $files = [];

    foreach($file_paths as $path) {
        if( !str_contains( $path, 'dev_wp' ) ) {
            $files[] = [
                'file_name' => ucwords( str_replace ('-', ' ', wp_basename( $path, '.html' ) ) ),
                'file_url' => $theme_dir_url .'/markup-template/markup/'  . wp_basename( $path, '' )
            ];
        }
    }

    $temp_name = empty($files) ? ' - Coming Soon' : '';

    $result = '<h2 class="cmp-title animated ">' . get_bloginfo('name') . $temp_name . '</h2>';

    $result .= '<ol class="comming-soon__list">';
    foreach($files as $file) {
        $result .=
            '<li class="comming-soon__item">
                <div class="comming-soon__page">'. $file['file_name'] . '</div>
                <span class="comming-soon__link">'. $file['file_url'] . '</span>
                <a class="comming-soon__link-preview" href="'. $file['file_url'] . '">'. $file['file_url'] . '</a>
            </li>';
    }
    $result .= '</ol>';

    return $result;

}
add_shortcode( 'project_data', 'project_data_shortcode' );

?>