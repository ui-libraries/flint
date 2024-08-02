<?php
function am_the_section_class(){
    echo am_get_section_class();
}
function am_get_section_class(){
    return '';
}
function am_gravity_form($form_id) {
    echo do_shortcode('[gravityform id="' . $form_id . '" title="false" description="false" ajax="true"]');
}

function am_get_current_url() {
    global $wp;
    return trim(home_url($wp->request), '/');
}

function am_the_section_id($section_title = '') {
    echo am_get_section_id($section_title);
}

function am_get_section_id($section_title = '') {

    global $am_section_index;

    $section_title = $section_title ? $section_title : 'section';

    $am_section_index = $am_section_index ? $am_section_index + 1 : 1;

    return $section_title . '-' . $am_section_index;
}

function am_the_fly_img($attachment_array, $params = []) {
    echo am_get_fly_img($attachment_array, $params);
}

function am_the_fly_post_img($post_id, $params = []) {
    echo am_get_fly_post_img($post_id, $params);
}

function am_get_fly_post_img($post_id, $params = []) {
    $post_image_id = get_post_thumbnail_id($post_id);
    $post_image_url = get_the_post_thumbnail_url($post_id, 'full');

    if (empty($params['alt'])) {
        $params['alt'] = get_the_title($post_id);
    }

    return am_get_fly_img(['id' => $post_image_id, 'url' => $post_image_url], $params);
}

function am_the_svg($image) {

    if (!is_array($image) && !empty($image)) {
        $image = wp_get_attachment_image_data($image);
    }

    if (!empty($image['id'])) {

        if ((!empty($image['subtype']) && $image['subtype'] === 'svg+xml') || (!empty($image['mimetype']) && $image['mimetype'] === 'image/svg+xml')) {

            $image_content = file_get_contents(get_attached_file($image['id']));

            if (!empty($image_content)) {
                echo $image_content;
            } else {
                echo '';
            }
        }
    } else {
        am_the_fly_img($image);
    }
}

function am_get_fly_img($attachment_array, $params = []) {

    if (!is_array($attachment_array)) {

        $attachment_array = acf_get_attachment($attachment_array);
    }

    if (!function_exists('fly_get_attachment_image_src')) {
        return '';
    }

    if (empty($attachment_array['id'])) {
        return '';
    }

    $width = !empty($params['width']) ? $params['width'] : '';
    $height = !empty($params['height']) ? $params['height'] : '';
    $class = !empty($params['class']) ? $params['class'] : '';

    $crop = !empty($params['crop']);

    $src_array = fly_get_attachment_image_src($attachment_array['id'], [$width, $height], $crop);
    $src_array_2x = fly_get_attachment_image_src($attachment_array['id'], [($width ? $width*2 : ''), ($height ? $height*2 : '')], $crop);
    
    $alt = !empty($params['alt']) ? $params['alt'] : '';
    $alt = $alt ? $alt : $attachment_array['alt'];
    $alt = $alt ? $alt : $attachment_array['title'];
    $alt = $alt ? $alt : 'Image';
    $src = !empty($src_array['src']) ? $src_array['src'] : $attachment_array['url'];

    
    $retina_url = !empty($src_array_2x['src']) ? $src_array_2x['src'] : (!empty($attachment_array['url']) ? $attachment_array['url'] : '');
    $retina_url = $retina_url ? $retina_url : $src;

    $atts_string = !empty($params['atts']) ? $params['atts'] : '';
    
    if (strpos($src, '.svg') !== false) {
        $width = $attachment_array['width'];
        $height = $attachment_array['height'];
        $img = "<img src='$src' alt='$alt' class='$class' width='$width' height='$height' $atts_string />";
    } else {
        $width = $src_array['width'];
        $height = $src_array['height'];
        $img = "<img src='$src' alt='$alt' class='$class' srcset='$retina_url 2x' width='$width' height='$height' $atts_string />";
    }

    return $img;
}

function wp_get_attachment_image_data($id = null) {
    $image = array();

    // Set $id to the post thumbnail image by default
    if (!$id) {
        global $post;
        $id = get_post_thumbnail_id($post->ID);
    }

    // Check if metadata exists
    if (!empty($id) && $meta = get_post($id)) {
        $image['id'] = $id;
        $image['href'] = get_permalink($meta->ID);
        $image['url'] = $meta->guid;
        $image['title'] = $meta->post_title;
        $image['alt'] = ( $alt = get_post_meta($meta->ID, '_wp_attachment_image_alt', true) ) ? $alt : $meta->post_title;
        $image['caption'] = $meta->post_excerpt;
        $image['description'] = $meta->post_content;
        $image['mimetype'] = get_post_mime_type($id);

        // Get all our images sizes
        if ($sizes = get_intermediate_image_sizes()) {
            // Add the full size
            array_unshift($sizes, 'full');

            // Add the available image sizes
            foreach ($sizes as $size) {
                $src = wp_get_attachment_image_src($id, $size);
                $image['sizes'][$size] = $src[0];
                $image['sizes'][$size . '-width'] = $src[1];
                $image['sizes'][$size . '-height'] = $src[2];
            }
        } else {
            $image['sizes'] = null;
        }

        return $image;
    }

    return false;
}

if (function_exists('get_field')) {

    /**
     * this function is wrapper of get_field function and RETURNS formatted value from ACF field with $html_open and $html_close, also you can add $esc (read more am_esc function description);
     * if $post_id will be null it will use current $post
     * you can use this function without checking if value is empty or not
     * EXAMPLE:
     * echo am_get_field('phone_number', '<a href="tel:", '">'.__('Call me', 'am').'</a>', $post->ID 'phone');
     * if field is not empty it will return <a href="tel:+1758422555222">Call me</a>
     * if field is empty it will return empty string
     */
    function am_get_field($field_name, $html_open = '', $html_close = '', $post_id = null, $esc = '') {

        global $post;

        $toReturn = '';

        if (!$post_id) {
            $post_id = $post->ID;
        }

        if ($value = get_field($field_name, $post_id)) {

            $toReturn = $html_open . am_esc($value, $esc) . $html_close;
        }

        return $toReturn;
    }

    /**
     * this function is wrapper of am_get_field function just prints result so am_the_field('phone_number', '<a href="tel:', '">'.__('Call me', 'am').'</a>', $post->ID, 'phone') == echo am_get_field('phone', '<a href="tel:', '">'.__('Call me', 'am').'</a>', $post->ID, 'phone')
     * you can use this function without checking if value is empty or not
     */
    function am_the_field($field_name, $html_open = '', $html_close = '', $post_id = null, $esc = '') {

        echo am_get_field($field_name, $html_open, $html_close, $post_id, $esc);
    }

    /**
     * this function is wrapper of get_sub_field function and RETURNS formatted value from ACF sub field with $html_open and $html_close, also you can add $esc (read more am_esc function description);
     * you can use it in ACF row loop https://www.advancedcustomfields.com/resources/have_rows/
     * you can use this function without checking if value is empty or not
     * EXAMPLE:
     * echo am_get_sub_field('phone_number', '<a href="tel:", '">'.__('Call me', 'am').'</a>', 'phone');
     * if sub field is not empty it will return <a href="tel:+1758422555222">Call me</a>
     * if sub field is empty it will return empty string
     */
    function am_get_sub_field($field_name, $html_open = '', $html_close = '', $esc = '') {

        $toReturn = '';

        if ($value = get_sub_field($field_name)) {

            $toReturn = $html_open . am_esc($value, $esc) . $html_close;
        }

        return $toReturn;
    }

    /**
     * this function is wrapper of am_get_sub_field just prints result so am_the_sub_field('phone_number', '<a href="tel:', '">'.__('Call me', 'am').'</a>', 'phone') == echo am_get_sub_field('phone', '<a href="tel:', '">'.__('Call me', 'am').'</a>', 'phone')
     * you can use this function without checking if value is empty or not
     */
    function am_the_sub_field($field_name, $html_open = '', $html_close = '', $esc = '') {

        echo am_get_sub_field($field_name, $html_open, $html_close, $esc);
    }

    /**
      This function is for creating link with ACF Link field type
      EXMAPLE:

      Default:
     * echo am_get_link($link_array);
      <a href="http://someurl.com">some title</a>

      Short:
     * echo am_get_link($link_array, 'btn');
      <a class="btn" href="http://someurl.com">some title</a>

      Full
     * echo am_get_link($link_array, array('class' => 'btn', 'before' => '<span>Before</span>',  'after' => '<span>After</span>', ));
      <a class="btn" href="http://someurl.com"><span>Before</span>some title<span>After</span></a>

     */
    function am_get_link($link = array(), $args = array(), $attrs = []) {

        $ready_link = '';

        if (!empty($link) && is_array($link) && isset($link['url'])) :

            $ready_attr = '';
            $after = '';
            $before = '';
            $other_attrs = [];

            if ($args) :

                if (is_array($args)) :

                    foreach ($args as $akey => $attr) :

                        if (!in_array($akey, array('after', 'before'))) :

                            $ready_attr .= $akey . '="' . esc_attr($attr) . '" ';

                        endif;

                    endforeach;

                    if (isset($args['before']) && $args['before']) :

                        $before = $args['before'];

                    endif;

                    if (isset($args['after']) && $args['after']) :

                        $after = $args['after'];

                    endif;

                else :

                    $ready_attr = 'class="' . esc_attr($args) . '"';

                endif;

            endif;

            if ($attrs) :
                foreach ($attrs as $attr_name => $attr_value) {
                    $other_attrs[] = $attr_name . '="' . $attr_value . '"';
                }
            endif;

            $ready_link = '<a href="' . esc_url($link['url']) . '" ' . $ready_attr . ' ' . (isset($link['target']) && $link['target'] ? 'target="' . esc_attr($link['target']) . '"' : '') . ' ' . implode(' ', $other_attrs) . '>' . $before . ($link['title'] ? $link['title'] : $link['url']) . $after . '</a>';

        endif;

        return $ready_link;
    }

    /**
     * This function is wrapper of am_get_link just prints result function so am_the_link($link_array, 'btn') == echo am_get_link($image_array, 'btn')
     */
    function am_the_link($link = array(), $args = array(), $attrs = []) {

        echo am_get_link($link, $args, $attrs);
    }

}

/**
 * Function to return post thumbnail if exists
 *
 * @since 1.4.0.7
 *
 * @param string|array $size_in {
 *     Optional. An array of arguments or size string.
 *     Default: 'medium'
 *
 *     @type string $size Thumbnail size. Default 'medium'.
 *     @type string $class Thumbnail size. Default ''.
 *     @type string $alt Thumbnail size. Default post title.
 * }
 * @param int $post_id Post ID.
 *
 * @return string
 */
function am_get_post_img($size_in = array(), $post_id = null, $attrs = []) {

    $thumbnail_html = '';

    // default vars
    $size = 'medium';
    $class = '';
    $alt = '';

    if (is_array($size_in) && $size_in) {
        if (isset($size_in['size']) && $size_in['size']) {
            $size = $size_in['size'];
        }
        if (isset($size_in['alt']) && $size_in['alt']) {
            $alt = $size_in['alt'];
        }
        if (isset($size_in['class']) && $size_in['class']) {
            $class = $size_in['class'];
        }
    } elseif (is_string($size_in) && $size_in) {
        $size = $size_in;
    }

    if (empty($alt)) {
        $alt = get_the_title($post_id);
    }

    if (has_post_thumbnail($post_id)) :
        $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id($post_id), $size, false);
        $thumbnail_html = am_get_retina_img($thumbnail[0], $class, $thumbnail[1], $thumbnail[2], $alt, $attrs);
    endif;

    return $thumbnail_html;
}

/**
 * Wrapper of function am_get_post_img()
 *
 * @since 1.4.0.7
 *
 * @param string|array $size_in {
 *     Optional. An array of arguments or size string.
 *     Default: 'medium'
 *
 *     @type string $size Thumbnail size. Default 'medium'.
 *     @type string $class Thumbnail size. Default ''.
 *     @type string $alt Thumbnail size. Default post title.
 * }
 * @param int $post_id Post ID.
 * 
 */
function am_the_post_img($size_in = array(), $post_id = null, $attrs = []) {

    echo am_get_post_img($size_in, $post_id, $attrs);
}

/**
 * Function, which return custom post title if exist or post title
 *
 * @since 1.4.0.7
 *
 * @param array|string $tag_in {
 *     Optional. An array of arguments.
 *
 *     @type string $tag HTML tag. Default ''.
 *     @type string $class Class name of HTML tag. Default ''.
 *     @type boolean $use_link Adds link. Default false.
 *     @type string $link_class Class name of link. Default ''.
 * }
 * @param int $post_id Post ID.
 *
 * @return string
 * 
 */
function am_get_custom_title($tag_in = array(), $post_id = null) {

    $clean_title = '';

    $title = get_the_title($post_id);
    $custom_title = get_field('custom_title', $post_id);
    if ($custom_title) {
        $title = $custom_title;
    }

    if ($title) {

        // default vars
        $tag = '';
        $class = '';
        $use_link = false;
        $link_class = '';

        if (is_array($tag_in) && $tag_in) {
            if (isset($tag_in['class']) && $tag_in['class']) {
                $class = $tag_in['class'];
            }
            if (isset($tag_in['tag']) && $tag_in['tag']) {
                $tag = $tag_in['tag'];
            }
            if (isset($tag_in['link']) && $tag_in['link']) {
                $use_link = true;
                if (isset($tag_in['link_class']) && $tag_in['link_class']) {
                    $link_class = $tag_in['link_class'];
                }
            }
        } elseif (is_string($tag_in)) {
            $tag = $tag_in;
        }
        $open_tag = '';
        $close_tag = '';

        if ($tag) {
            $open_tag = '<' . $tag . ' ' . ( $class ? 'class="' . esc_attr($class) . '"' : '' ) . '>' . ( $use_link ? '<a href="' . get_permalink($post_id) . '" ' . ( $link_class ? 'class="' . esc_attr($link_class) . '"' : '' ) . '>' : '' );
            $close_tag = ( $use_link ? '</a>' : '' ) . '</' . $tag . '>';
        }

        $clean_title = $open_tag . $title . $close_tag;
    }

    return $clean_title;
}

/**
 * Wrapper of function am_get_custom_title()
 * 
 * @since 1.4.0.7
 *
 * @param array|string $tag_in {
 *     Optional. An array of arguments.
 *
 *     @type string $tag HTML tag. Default ''.
 *     @type string $class Class name of HTML tag. Default ''.
 *     @type boolean $use_link Adds link. Default false.
 *     @type string $link_class Class name of link. Default ''.
 * }
 * @param int $post_id Post ID.
 *
 * @return string
 * 
 */
function am_the_custom_title($tag_in = array(), $post_id = null) {

    echo am_get_custom_title($tag_in, $post_id);
}

/**
 * This function is for escaping strings
 * You can use it everywhere
 * Exmaple:
 * $phone = '+1 (758) 422-555-222';
  <a href="tel:<php echo am_esc($phone, 'phone'); ?>"><php echo $phone; ?></a>
  it will return <a href="tel:+1758422555222">+1 (758) 422-555-222</a>
 */
function am_esc($value, $esc) {
    try {
        switch ($esc) :
            case 'url':
                $toReturn = esc_url($value);
                break;
            case 'attr':
                $toReturn = esc_attr($value);
                break;
            case 'html':
                $toReturn = esc_html($value);
                break;
            case 'email':
                // $hex_encoding = true
                $toReturn = antispambot($value, true);
                break;
            case 'email2':
                $toReturn = antispambot($value, false);
                break;
            case 'phone':
                $toReturn = str_replace(array('(', ')', ' ', '-', '.', ','), '', $value);
                break;
            case '':
                $toReturn = $value;
                break;
            default:
                throw new Exception();
                break;
        endswitch;
        return $toReturn;
    } catch (Exception $e) {
        $trace = $e->getTrace()[0];
        ob_clean();
        printf(
                __("Invalid escaping type (%s) provided for am_esc() in %s on the line %s!", 'am'),
                $esc,
                $trace['file'],
                $trace['line']
        );
        exit();
    }
}

/**
 * This function is for getting value from array with formatting value
 * you can add $esc (read more am_esc function description)
 * EXMAPLE: 
 * echo am_get_array('phone_number', '<a href="tel:', '">'.__('Call me', 'am').'</a>', $array, 'phone');
 * it will use $array['phone_number] and return <a href="tel:+1758422555222">Call me</a>
 * you can use this function without checking if value is empty or not
 */
function am_get_array($array_key, $html_open = '', $html_close = '', $array = array(), $esc = '') {

    $toReturn = '';

    if (is_array($array) && isset($array[$array_key]) && $array[$array_key]) {

        $toReturn = $html_open . am_esc($array[$array_key], $esc) . $html_close;
    }

    return $toReturn;
}

/**
 * This function is wrapper of am_get_array just prints result function so am_the_array('phone_number', '<a href="tel:', '">'.__('Call me', 'am').'</a>', $array, 'phone') == echo am_get_array('phone_number', '<a href="tel:', '">'.__('Call me', 'am').'</a>', $array, 'phone')
 * you can use this function without checking if value is empty or not
 */
function am_the_array($array_key, $html_open = '', $html_close = '', $array = array(), $esc = '') {

    echo am_get_array($array_key, $html_open, $html_close, $array, $esc);
}

/**
 * Retina 2x plugin supprt: get URL
 */
function am_get_retina($url) {
    if (!function_exists('wr2x_get_retina_from_url')) {
        return $url;
    }

    $url_temp = wr2x_get_retina_from_url($url);

    if (!empty($url_temp)) {
        return $url_temp;
    } else {
        if (!empty($url)) {
            $uriPath = parse_url($url, PHP_URL_PATH);
            $info = pathinfo($uriPath);
            $no_extension = basename($uriPath, '.' . $info['extension']);
            $path = $_SERVER['DOCUMENT_ROOT'] . $info['dirname'] . '/' . $no_extension . '@2x' . '.' . $info['extension'];
            if (file_exists($path)) {
                $exploded_path = explode('wp-content', $path);
                if (isset($exploded_path[1]) && $exploded_path[1]) {
                    return content_url() . $exploded_path[1];
                } else {
                    return '';
                }
            } else {
                return $url;
            }
        } else {
            return $url;
        }
    }
}

/**
 * Retina 2x plugin supprt: return IMG
 */
function am_get_retina_img($url_normal, $class = '', $w = '', $h = '', $alt = '', $attrs = []) {
    $url_retina = am_get_retina($url_normal);
    $srcset = '';
    if ($url_retina && $url_normal != $url_retina) {
        $srcset = ' srcset="' . esc_url($url_retina) . ' 2x"';
    }

    $width = '';
    if ($w) {
        $width = ' width="' . esc_attr($w) . '"';
    }
    $height = '';
    if ($h) {
        $height = ' height="' . esc_attr($h) . '"';
    }

    $other_attrs = array();
    if ($attrs) {
        foreach ($attrs as $attr_name => $attr_value) {
            $other_attrs[] = $attr_name . '="' . $attr_value . '"';
        }
    }

    return '<img src="' . esc_url($url_normal) . '"' . $srcset . $width . $height . ' alt="' . esc_attr($alt) . '" ' . ($class ? ' class="' . esc_attr($class) . '" ' : '') . ' ' . implode(' ', $other_attrs) . '>';
}

/**

  This function is wrapper of am_get_retina_img function.
  EXMAPLE:

  Default:
 * am_the_retina_img($image_array);
  <img src="$image_array['url]" srcset="am_get_retina($image_array['url']) 2x" alt="$image_array['alt']" width="$image_array['width']" height="$image_array['height']">

  Short:
 * am_the_retina_img($image_array, 'image_size');
  <img src="$image_array['sizes]['image_size']" srcset="am_get_retina($image_array['sizes]['image_size']) 2x" alt="$image_array['alt']" width="$image_array['sizes]['image_size-width']" height="$image_array['sizes]['image_size-height']">

  Full
 * am_the_retina_img($image_array, array('class' => 'main-image', 'size' => 'image_size',  'any-attr' => 'some_value', ));
  <img src="$image_array['sizes]['image_size']" srcset="am_get_retina($image_array['sizes]['image_size']) 2x" alt="$image_array['alt']" width="$image_array['sizes]['image_size-width']" height="$image_array['sizes]['image_size-height']" class="main-image" any-attr="some_value">

  you can override attrs like width, height, alt trough second parametr $args. For example you can remove attr hegiht by setting 'height' => false
 */
function am_the_retina_img($image = array(), $args = array(), $attrs = []) {

    $ready_img = '';

    $url = '';
    $size = 'url';
    $width = '';
    $height = '';
    $alt = '';
    $class = '';
    if ($image) :

        if (is_string($args) && $args) :
            $size = $args;
        elseif (is_array($args) && isset($args['size']) && $args['size']) :
            $size = $args['size'];
        endif;

        if (is_array($image)) :

            if ($size == 'url' && isset($image['url'])) :
                $url = $image['url'];
            elseif (isset($image['sizes'][$size])) :
                $url = $image['sizes'][$size];
            endif;

        elseif (is_string($image) && $image) :
            $url = $image;
        endif;

        if (is_array($args) && isset($args['width'])) :
            $width = $args['width'];
        elseif (is_array($image) && $size == 'url' && isset($image['width'])) :
            $width = $image['width'];
        elseif (is_array($image) && isset($image['sizes'][$size])) :
            $width = $image['sizes'][$size . '-width'];
        endif;

        if (is_array($args) && isset($args['height'])) :
            $height = $args['height'];
        elseif (is_array($image) && $size == 'url' && isset($image['height'])) :
            $height = $image['height'];
        elseif (is_array($image) && isset($image['sizes'][$size])) :
            $height = $image['sizes'][$size . '-height'];
        endif;

        if (is_array($args) && isset($args['alt'])) :
            $alt = $args['alt'];
        elseif (is_array($image) && isset($image['alt'])) :
            $alt = $image['alt'];
        endif;

        if (is_array($args) && isset($args['class'])) :
            $class = $args['class'];
        endif;

        $ready_img = am_get_retina_img($url, $class, $width, $height, $alt, $attrs);

    endif;

    echo $ready_img;
}

/**
 * Wrapper of function am_get_picture()
 * 
 * @since 1.4.0.7
 *
 * @param array $images {
 *     Required. An array of arguments.
 *
 *     @type array Image settings {
 *        @type array|string Image URL or image array. Required
 *        @type string Image size. Optional
 *        @type string Source media attribute. Optional
 *     }
 * }
 *
 * @return string
 * 
 */
function am_the_picture($images = array()) {

    echo am_get_picture($images);
}

/**
 * Function, which returns picture tag with source and image tags
 * 
 * @since 1.4.0.7
 *
 * @param array $images {
 *     Required. An array of arguments.
 *
 *     @type array Image settings {
 *        @type array|string Image URL or image array. Required
 *        @type string Image size. Optional
 *        @type string Source media attribute. Optional
 *     }
 * }
 *
 * @return string
 * 
 */
function am_get_picture($images = array()) {

    $ready_picture = '';

    $url = '';
    $size = 'url';
    $width = '';
    $height = '';
    $alt = '';
    $class = '';
    if (is_array($images) && !empty($images)) :

        $img = $images[0];

        $sources = '';

        foreach ($images as $source) {
            $soruce_html = '';
            if (is_array($source) && !empty($source)) {

                $source_src = '';

                $source_size = ( isset($source[1]) && $source[1] ) ? $source[1] : '';

                if (is_string($source[0]) && $source[0]) {
                    $source_src = esc_url($source[0]);
                } elseif (is_array($source[0]) && isset($source[0]['sizes'][$source_size])) {
                    $source_src = $source[0]['sizes'][$source_size];
                } elseif (is_array($source[0]) && isset($source[0]['url'])) {
                    $source_src = esc_url($source[0]['url']);
                }

                $media = '';

                if (isset($source[2]) && $source[2]) {
                    $media = 'media="(' . $source[2] . ')"';
                }

                $source_src_retina = am_get_retina($source_src);
                $source_srcset = ( $source_src != $source_src_retina ) ? $source_src . ', ' . $source_src_retina . ' 2x' : $source_src;
                $soruce_html = '<source srcset="' . $source_srcset . '" ' . $media . '>';
            }
            $sources .= $soruce_html;
        }

        $img_html = '';
        if (is_array($img) && !empty($img)) {

            $img_alt = '';
            $img_src = '';

            $img_size = ( isset($img[1]) && $img[1] ) ? $img[1] : '';

            if (is_string($img[0]) && $img[0]) {
                $img_src = esc_url($img[0]);
            } elseif (is_array($img[0]) && isset($img[0]['sizes'][$img_size])) {
                $img_src = $img[0]['sizes'][$img_size];
            } elseif (is_array($img[0]) && isset($img[0]['url'])) {
                $img_src = esc_url($img[0]['url']);
            }

            if (is_array($img[0]) && isset($img[0]['alt'])) {
                $img_alt = $img[0]['alt'];
            }

            $img_html = am_get_retina_img($img_src, '', '', '', $img_alt);
        }

        $ready_picture .= '<picture>';

        $ready_picture .= $sources;

        $ready_picture .= $img_html;

        $ready_picture .= '</picture>';

    endif;

    return $ready_picture;
}

/**

  This function returns image htmlfrom given $image_array. You just need to send as first parametr image array, and as second max midth of image, or array where can be maxwidth (Max width), alt or class. By default $args is 100, so that means that max image width by default is 100;
  EXMAPLE:

  Default:
 * echo am_get_retina_icon($image_array);
  <img src="$image_array['url]" alt="$image_array['alt']" width="lowest ($image_array['width']/ 2) or 100">

  Short:
 * am_get_retina_icon($image_array, 85);
  <img src="$image_array['url]" alt="$image_array['alt']" width="lowest ($image_array['width']/ 2) or 85">

  Full
 * am_get_retina_icon($image_array, array('class' => 'main-image', 'maxwidth' => 85));
  <img src="$image_array['url]" alt="$image_array['alt']" width="lowest ($image_array['width']/ 2) or 85" class="main-image">

  you can override attrs like width, height, alt through second parametr $args. For example you can remove attr height by setting 'height' => false
 */
function am_get_retina_icon($image = array(), $args = array(), $attrs = array()) {
    $max_width = 100;

    $ready_img = '';

    $url = '';
    $alt = '';
    $class = '';
    if ($image && is_array($image)) :

        if (isset($image['url']) && $image['url']) :
            $url = $image['url'];
        endif;

        if (is_array($args) && isset($args['maxwidth']) && $args['maxwidth']) :
            $max_width = $args['maxwidth'];
        elseif (is_array($args) && isset($args['width']) && $args['width']) :
            $max_width = $args['width'];
        elseif ((is_string($args) || is_integer($args)) && $args) :
            $max_width = $args;
        endif;

        if (is_array($args) && isset($args['alt'])) :
            $alt = $args['alt'];
        elseif (is_array($image) && isset($image['alt'])) :
            $alt = $image['alt'];
        endif;

        if (is_array($args) && isset($args['class'])) :
            $class = $args['class'];
        endif;

        $is_svg = $image['subtype'] == 'svg+xml';
        $img_has_size = $image['height'] > 1;
        $divider = $is_svg ? 1 : 2;

        if ($img_has_size || $is_svg) {
            $width = min(round($image['width'] / $divider), $max_width);
        } else {
            $width = $max_width;
        }
        $width_original = $image['width'];
        $height = '';
        if ($img_has_size) {
            $height = round(( ( ( ( $width * 100 ) / $width_original ) / 100 ) * $image['height']), 2);
        }


        $other_attrs = array();
        if ($attrs) {
            foreach ($attrs as $attr_name => $attr_value) {
                $other_attrs[] = $attr_name . '="' . $attr_value . '"';
            }
        }

        $ready_img = '<img src="' . esc_url($url) . '" width="' . $width . '" ' . ($height ? 'height="' . $height . '"' : '' ) . ' ' . ($class ? ' class="' . esc_attr($class) . '" ' : '') . ' alt="' . ($alt ? esc_attr($alt) : '') . '" ' . implode(' ', $other_attrs) . '>';

    endif;

    return $ready_img;
}

/**
 * This function is wrapper of am_get_retina_icon just prints result function so am_the_retina_icon($image_array, 123) == echo am_get_retina_icon($image_array, 123)
 */
function am_the_retina_icon($image = array(), $args = array(), $attrs = array()) {

    echo am_get_retina_icon($image, $args, $attrs);
}

/**
 * Function, which returns background block
 * 
 * @since 1.4.0.7
 *
 * @param string|array $image {
 *     Required. Image URL or array
 *
 *     @type array $image Image URL or Image array. Required.
 *     @type boolean $wrap Need to wrap img tag or not. Default is true.
 *     @type string $wrapper Wrapper tag. Default is 'div'.
 *     @type string $wrapper_class Class name of wrapper. Default is 'bg-stretch'.
 *     @type string $size Size of image. Default is ''.
 *     @type string $class Class name of img tag. Default is ''.
 *     @type string $tag Which tag to use img or another. Default is 'img'.
 * 
 * }
 *
 * @return string
 * 
 */
function am_get_retina_bg($image = array()) {

    $background_html = '';

    if (is_string($image)) {
        $url_retina = am_get_retina($image);
        $background_html = '<span data-srcset="' . $image . (($url_retina && $url_retina != $image) ? ', ' . $url_retina . ' 2x' : '') . '"></span>';
    } elseif (is_array($image) && !empty($image)) {

        $wrapper = '';
        $wrapper_class = '';
        $tag = '';
        $image_html = '';

        $image_class = '';
        if (isset($image['class']) && $image['class']) {
            $image_class = $image['class'];
        }

        $image_src = '';
        $image_width = '';
        $image_height = '';
        $image_alt = '';

        if (isset($image['image']) && is_array($image['image']) && !empty($image['image'])) {

            if (isset($image['size']) && $image['size']) {
                $image_src = $image['image']['sizes'][$image['size']];
                $image_width = $image['image']['sizes'][$image['size'] . '-width'];
                $image_height = $image['image']['sizes'][$image['size'] . '-height'];
            } elseif (isset($image['image']['url']) && $image['image']['url']) {
                $image_src = $image['image']['url'];
                $image_width = $image['image']['width'];
                $image_height = $image['image']['height'];
            }

            if (isset($image['image']['alt']) && $image['image']['alt']) {
                $image_alt = $image['image']['alt'];
            }
        } elseif (isset($image['image']) && is_string($image['image']) && $image['image']) {

            $image_src = esc_url($image['image']);
        }

        if (isset($image['tag']) && $image['tag']) {
            $tag = $image['tag'];
        } else {
            $tag = 'img';
        }

        if (isset($image['wrapper']) && $image['wrapper']) {
            $wrapper = $image['wrapper'];
        } else {
            $wrapper = 'div';
        }

        if (isset($image['wrapper_class']) && $image['wrapper_class']) {
            $wrapper_class = 'class="' . esc_attr($image['wrapper_class']) . '"';
        } else {
            $wrapper_class = 'class="' . esc_attr('bg-stretch') . '"';
            '';
        }

        $wrap = ( isset($image['wrap']) && !$image['wrap'] ) ? false : true;

        if ($image_src) {

            if ($tag == 'img') {
                $image_html = am_get_retina_img($image_src, $image_class, $image_width, $image_height, $image_alt);
            } else {
                $url_retina = am_get_retina($image_src);
                $image_html = '<' . $tag . ' data-srcset="' . $image_src . ( $url_retina != $image_src ? ', ' . $url_retina . ' 2x' : '') . '"></' . $tag . '>';
            }

            $background_html .= $wrap ? '<' . $wrapper . ' ' . $wrapper_class . '>' : '';

            $background_html .= $image_html;

            $background_html .= $wrap ? '</' . $wrapper . '>' : '';
        }
    }

    return $background_html;
}

/**
 * Wrapper of function am_get_retina_bg()
 * 
 * @since 1.4.0.7
 *
 * @param string|array $image {
 *     Required. Image URL or array
 *
 *     @type array $image Image URL or Image array. Required.
 *     @type boolean $wrap Need to wrap img tag or not. Default is true.
 *     @type string $wrapper Wrapper tag. Default is 'div'.
 *     @type string $wrapper_class Class name of wrapper. Default is 'bg-stretch'.
 *     @type string $size Size of image. Default is ''.
 *     @type string $class Class name of img tag. Default is ''.
 *     @type string $tag Which tag to use img or another. Default is 'img'.
 * 
 * }
 *
 * @return string
 * 
 */
function am_the_retina_bg($image = array()) {

    echo am_get_retina_bg($image);
}

/**
 * Function for logging data to /wp-content folder
 * 
 * @since 1.4.0.7
 *
 * @param string|array $log What is need to log. Requred
 * @param string $entry_header Header to indetify log. Optional
 * @param boolean $vardump Set true to use vardump() or leave empty to use print_r
 * 
 */
function am_log($log, $entry_header = 'No header', $vardump = false) {
    $theme = wp_get_theme();
    $template = $theme->template;
    $debug_path = WP_CONTENT_DIR . '/theme-' . $template . '-debug.log';
    $user = wp_get_current_user();
    $user_name = $user ? ( ( $user->first_name && $user->last_name ) ? $user->first_name . ' ' . $user->last_name : $user->user_login ) : 'Undefined User';
    $log_header = $entry_header;
    // Current user name
    error_log("\n\n" . $user_name, 3, $debug_path);
    // Time
    error_log("\n[" . date("l jS \of F Y h:i:s A", time()) . "]", 3, $debug_path);
    // Header
    error_log("\n" . $log_header . "\n", 3, $debug_path);
    // Value
    if (is_array($log) || is_object($log)) {

        if ($vardump) {

            ob_start();
            var_dump($log);
            $log = ob_get_clean();
        } else {

            $log = print_r($log, true);
        }

        error_log($log, 3, $debug_path);
    } else {
        error_log($log, 3, $debug_path);
    }
}

/**
 * Custom comments for single or page templates
 */
function am_comments($comment, $args, $depth) {
    $GLOBALS['comment'] = $comment;
    extract($args, EXTR_SKIP);

    if ('div' == $args['style']) {
        $tag = 'div';
        $add_below = 'comment';
    } else {
        $tag = 'li';
        $add_below = 'div-comment';
    }
    ?>
    <<?php echo $tag ?> <?php comment_class(empty($args['has_children']) ? '' : 'parent') ?> id="comment-<?php comment_ID() ?>">

    <?php if ('div' != $args['style']) : ?>
        <div id="div-comment-<?php comment_ID() ?>" class="comment-body">
    <?php endif; ?>

        <div class="comment-author vcard">
    <?php if ($args['avatar_size'] != 0) echo get_avatar($comment, $args['avatar_size']); ?>
    <?php printf('<cite class="fn">%s</cite> <span class="says">' . __('says:', 'am') . '</span>', get_comment_author_link()) ?>
        </div>

    <?php if ($comment->comment_approved == '0') : ?>
            <em class="comment-awaiting-moderation"><?php _e('Your comment is awaiting moderation.', 'am') ?></em>
            <br />
    <?php endif; ?>

        <div class="comment-meta commentmetadata"><a href="<?php echo htmlspecialchars(get_comment_link($comment->comment_ID)) ?>">
    <?php
    /* translators: 1: date, 2: time */
    printf(__('%1$s at %2$s', 'am'), get_comment_date(), get_comment_time())
    ?></a><?php edit_comment_link(__('(Edit)', 'am'), '  ', '');
    ?>
        </div>

        <div class="entry-comment"><?php comment_text() ?></div>

        <div class="reply">
    <?php comment_reply_link(array_merge($args, array('add_below' => $add_below, 'depth' => $depth, 'max_depth' => $args['max_depth']))) ?>
        </div>
    <?php if ('div' != $args['style']) : ?>
        </div>
    <?php endif; ?>
    <?php
}

/**
 * Browser detection body_class() output
 */
function am_browser_body_class($classes) {

    global $is_lynx, $is_gecko, $is_IE, $is_opera, $is_NS4, $is_safari, $is_chrome, $is_iphone, $is_edge;

    if ($is_lynx)
        $classes[] = 'lynx';
    elseif ($is_gecko)
        $classes[] = 'gecko';
    elseif ($is_opera)
        $classes[] = 'opera';
    elseif ($is_NS4)
        $classes[] = 'ns4';
    elseif ($is_safari)
        $classes[] = 'safari';
    elseif ($is_chrome)
        $classes[] = 'chrome';
    elseif ($is_IE)
        $classes[] = 'ie';
    elseif ($is_edge)
        $classes[] = 'edge';
    else
        $classes[] = 'unknown';

    if (wp_is_mobile())
        $classes[] = 'mobile';
    if ($is_iphone)
        $classes[] = 'iphone';

    return $classes;
}

/**
 * Filter for get_the_excerpt
 */
function am_excerpt_more($more) {
    return '...';
}

/**
 * Show instead time of post instead of empty string
 */
function am_has_title($title) {
    global $post;
    if ($title == '') {
        return get_the_time(get_option('date_format'));
    } else {
        return $title;
    }
}

function am_texturize_shortcode_before($content) {
    $content = preg_replace('/\]\[/im', "]\n[", $content);
    return $content;
}

function am_remove_wpautop($content) {
    $content = do_shortcode(shortcode_unautop($content));
    $content = preg_replace('#^<\/p>|^<br \/>|<p>$#', '', $content);
    return $content;
}

// unregister all default WP Widgets
function am_unregister_default_wp_widgets() {
    unregister_widget('WP_Widget_Pages');
    unregister_widget('WP_Widget_Calendar');
    //unregister_widget('WP_Widget_Archives');
    unregister_widget('WP_Widget_Links');
    unregister_widget('WP_Widget_Meta');
    unregister_widget('WP_Widget_Search');
    unregister_widget('WP_Widget_Text');
    //unregister_widget('WP_Widget_Categories');
    //unregister_widget('WP_Widget_Recent_Posts');
    //unregister_widget('WP_Widget_Recent_Comments');
    //unregister_widget('WP_Widget_RSS');
    //unregister_widget('WP_Widget_Tag_Cloud');
    //unregister_widget('WP_Nav_Menu_Widget');
}

/**
 * Move Comment textarea to the end of the form
 */
function am_move_comment_field_to_bottom($fields) {
    $comment_field = $fields['comment'];
    unset($fields['comment']);
    $fields['comment'] = $comment_field;
    return $fields;
}

/**
 * Get page id by slag
 */
function am_template_page_id($param) {
    $args = array(
        'meta_key' => '_wp_page_template',
        'meta_value' => 'page-templates/' . $param . '.php',
        'post_type' => 'page',
        'post_status' => 'publish'
    );
    $pages = get_pages($args);
    return $pages[0]->ID;
}

/**
 * Return template HTML
 */
function load_template_part($template_name, $part_name = null) {
    ob_start();
    get_template_part($template_name, $part_name);
    $var = ob_get_contents();
    ob_end_clean();
    return $var;
}

/**
 * Add SVG support
 */
function am_mime_types($mimes) {
    $mimes['svg'] = 'image/svg+xml';
    $mimes['svgz'] = 'image/svg+xml';
    return $mimes;
}

/**
 * Add SVG support - CSS part
 */
function am_svg_thumb_display() {
    echo '<style>
	td.media-icon img[src$=".svg"], img[src$=".svg"].attachment-post-thumbnail { 
	 width: 100% !important; 
	 height: auto !important; 
	}
	</style>';
}

/**
 * Add Demo Role for security
 */
/*
function am_demo_role() {
    global $wp_roles;
    if (!isset($wp_roles))
        $wp_roles = new WP_Roles();

    $role_admin = $wp_roles->get_role('administrator');
    //Adding a 'new_role' with all admin caps
    $wp_roles->add_role('demo', __('Demo', 'am'), $role_admin->capabilities);

    $role = get_role('demo');
    $role->remove_cap('edit_themes');
    $role->remove_cap('export');
    $role->remove_cap('list_users');
    $role->remove_cap('promote_users');
    $role->remove_cap('switch_themes');
    $role->remove_cap('remove_users');
    $role->remove_cap('delete_themes');
    $role->remove_cap('delete_plugins');
    $role->remove_cap('edit_plugins');
    $role->remove_cap('edit_users');
    $role->remove_cap('create_users');
    $role->remove_cap('delete_users');
    $role->remove_cap('install_themes');
    $role->remove_cap('install_plugins');
    $role->remove_cap('activate_plugins');
    $role->remove_cap('update_plugin');
    $role->remove_cap('update_themes');
    $role->remove_cap('update_core');
}
 */

/* Since 1.4.1.1 */
add_action('init', function () {
    $user = wp_get_current_user();
    if (isset($user->roles) && in_array('demo', (array) $user->roles)) {
        add_action('updated_option', 'prevent_demo_user_modify_options', 10, 3);
        add_filter('wp_insert_post_empty_content', 'prevent_demo_user_modify_posts', 10, 2);
        add_action('pre_post_update', 'force_prevent_demo_user_modify_posts', 10, 2);
        add_action('wp_update_nav_menu', 'force_prevent_demo_user_modify_menus', 10);
        add_action('wp_create_nav_menu', 'force_prevent_demo_user_create_menus', 10, 2);
        add_action('wp_delete_nav_menu', 'force_prevent_demo_user_delete_menus', 10);
        add_filter('gettext', 'change_error_message_for_not_permitted_post_save', 20, 3);
        add_action('delete_attachment', 'prevent_demo_user_delete_media', 11, 1);
    }
});

function prevent_demo_user_modify_options($option_name, $old_value, $value) {
    remove_action('updated_option', 'prevent_demo_user_modify_options', 10, 3);
    update_option($option_name, $old_value);
    add_action('updated_option', 'prevent_demo_user_modify_options', 10, 3);
}

function force_prevent_demo_user_modify_menus($nav_menu_selected_id) {
    wp_die('Not permitted.');
}

function force_prevent_demo_user_create_menus($term_id, $menu_data) {
    wp_die('Not permitted.');
}

function force_prevent_demo_user_delete_menus($term_id) {
    wp_die('Not permitted.');
}

function force_prevent_demo_user_modify_posts($post_id, $post_data) {
    wp_die('Not permitted.');
}

function prevent_demo_user_modify_posts($maybe_empty, $postarr) {
    $maybe_empty = $postarr['post_type'] == 'attachment';
    return $maybe_empty;
}

function change_error_message_for_not_permitted_post_save($translated_text, $untranslated_text, $domain) {

    if (true) {

        switch ($untranslated_text) {
            case 'Content, title, and excerpt are empty.':
                $translated_text = __('Not permitted.', 'text_domain');
                break;
        }
    }
    return $translated_text;
}

function prevent_demo_user_delete_media($postID) {
    wp_die('Not permitted.');
}

/* End 1.4.1.1 */

/**
 * Change admin logo url
 */
function am_login_logo_url() {
    return home_url('/');
}

// Add Google Map API

function am_acf_google_map_key() {
    $key = get_field('google_map_api', 'option');
    if ($key)
        acf_update_setting('google_api_key', $key);
}

add_action('acf/init', 'am_acf_google_map_key');

/**
 * Theme calls
 */
add_filter('the_title', 'am_has_title');
add_filter('excerpt_more', 'am_excerpt_more');
add_action('login_headerurl', 'am_login_logo_url');
add_filter('comment_form_fields', 'am_move_comment_field_to_bottom');
add_filter('upload_mimes', 'am_mime_types');
add_action('admin_head', 'am_svg_thumb_display');

// create demo user which can not install plugins and themes
//add_action('init', 'am_demo_role');

//disable emoji
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

// This theme uses post thumbnails
add_theme_support('post-thumbnails');

add_theme_support('html5', array('comment-list', 'comment-form', 'search-form', 'gallery', 'caption'));

/*
 * Let WordPress manage the document title.
 * By adding theme support, we declare that this theme does not use a
 * hard-coded <title> tag in the document head, and expect WordPress to
 * provide it for us.
 */
add_theme_support('title-tag');

// Add default posts and comments RSS feed links to head
add_theme_support('automatic-feed-links');

if (class_exists('WooCommerce')) {
    add_theme_support('woocommerce');
}

// Allow Shortcodes in Sidebar Widgets
add_filter('widget_text', 'do_shortcode');

// loads template file to use some set of parameters in it
function am_load_template($template, $slug = '', $params = array(), $echo = true) {
    $html = '';
    $default_tpl_dir = 'template-parts';
    $template = trim($template, '/');
    $temp = get_parent_theme_file_path($default_tpl_dir . '/' . $template);
    if (is_array($params) && count($params)) {
        extract($params);
    }
    $template = '';
    if (!empty($temp)) {
        if (!empty($slug)) {
            $template = "{$temp}-{$slug}.php";
            if (!file_exists($template)) {
                $template = $temp . '.php';
            }
        } else {
            $template = $temp . '.php';
        }
    }
    if (file_exists($template)) {
        ob_start();
        require $template;
        $html = ob_get_clean();
    }
    if ($echo) {
        echo $html;
    } else {
        return $html;
    }
}

function am_get_error_log_rows() {
    $toReturn = new error_parser();
    return $toReturn;
}

class error_parser {

    public $errors_array = array();

    public function __construct() {
        $log_file = $this->autodetect_error_log_file();
        if (!$log_file['error'] && file_exists($log_file['file'])) :
            $this->quantity = 20;
            $this->_parse($log_file['file']);
        endif;
        return true;
    }

    function rfgets($handle) {
        $line = null;
        $n = 0;

        if ($handle) {
            $line = '';

            $started = false;
            $gotline = false;

            while (!$gotline) {
                if (ftell($handle) == 0) {
                    fseek($handle, -1, SEEK_END);
                } else {
                    fseek($handle, -2, SEEK_CUR);
                }

                $readres = ($char = fgetc($handle));

                if (false === $readres) {
                    $gotline = true;
                } elseif ($char == "\n" || $char == "\r") {
                    if ($started)
                        $gotline = true;
                    else
                        $started = true;
                } elseif ($started) {
                    $line .= $char;
                }
            }
        }

        fseek($handle, 1, SEEK_CUR);

        return strrev($line);
    }

    function autodetect_error_log_file() {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        $errorLoggingEnabled = ini_get('log_errors') && (ini_get('log_errors') != 'Off');
        $logFile = ini_get('error_log');
        $toReturn = array();

        if (!$errorLoggingEnabled) {
            $local_log_file = get_home_path() . 'error_log';
            if (file_exists($local_log_file)) {
                $toReturn['error'] = false;
                $toReturn['file'] = $local_log_file;
            } else {
                $toReturn['error'] = true;
            }
        } else {
            $toReturn['error'] = false;
            $toReturn['file'] = $logFile;
        }

        return $toReturn;
    }

    private function _parse($filename = '') {
        $handle = @fopen($filename, 'r');
        if (filesize($filename) > 0) {
            $current_error = 0;
            $empty_lines = 0;
            $i = 0;
            while ($current_error < $this->quantity && $empty_lines < 15) {
                $buffer = $this->rfgets($handle);
                $i++;
                if (!empty($buffer)) {
                    $first_letter = substr($buffer, 0, 1);
                    if ($first_letter == '[') {
                        $current_error++;
                        $empty_lines = 0;
                        $dateArr = array();
                        preg_match('~^\[(.*?)\]~', $buffer, $dateArr);
                        $buffer = str_replace($dateArr[0], "", $buffer);
                        $buffer = trim($buffer);
                        $date = array(
                            "date" => explode(" ", $dateArr[1])[0],
                            "time" => explode(" ", $dateArr[1])[1]
                        );
                        $severity = "";
                        if (strpos($buffer, "PHP Warning") !== false) {
                            $buffer = str_replace("PHP Warning:", "", $buffer);
                            $buffer = trim($buffer);
                            $severity = "WARNING";
                        } elseif (strpos($buffer, "PHP Notice") !== false) {
                            $buffer = str_replace("PHP Notice:", "", $buffer);
                            $buffer = trim($buffer);
                            $severity = "NOTICE";
                        } elseif (strpos($buffer, "PHP Fatal error") !== false) {
                            $buffer = str_replace("PHP Fatal error:", "", $buffer);
                            $buffer = trim($buffer);
                            $severity = "FATAL";
                        } elseif (strpos($buffer, "PHP Parse error") !== false) {
                            $buffer = str_replace("PHP Parse error:", "", $buffer);
                            $buffer = trim($buffer);
                            $severity = "SYNTAX_ERROR";
                        } else {
                            $severity = "UNIDENTIFIED_ERROR";
                        }
                        $message = $buffer;
                        /* Final Array *//* Add nodes while creating them */
                        $finalArray = array(
                            "date" => $date,
                            "severity" => $severity,
                            "message" => $message
                        );
                        array_push($this->errors_array, $finalArray);
                    } else {
                        $empty_lines++;
                    }
                } else {
                    $empty_lines++;
                }
            }
        }
        fclose($handle);
    }

}

/**
 * This function fixes zero width and height for svg files
 * 
 * @since 1.4.1.2
 * 
 */
add_filter('wp_get_attachment_image_src', 'am_wp_get_attachment_image_src', 10, 4);

function am_wp_get_attachment_image_src($image, $attachment_id, $size, $icon) {
    //$image = [ 'url', 'width', 'height' .. ]

    if (!empty($image[0]) && ( empty($image[1]) || empty($image[2]) )) { // check width or height is empty
        $img_url = $image[0];
        $file_type = wp_check_filetype($img_url);

        if ('svg' == $file_type['ext']) {

            $image_meta = wp_get_attachment_metadata($attachment_id);

            if (is_array($image_meta)) {

                $size_array = _wp_get_image_size_from_meta($size, $image_meta); // [0] - width, [1] - height

                if ($size_array) {
                    $size_array[0] && $image[1] = absint($size_array[0]); // width
                    $size_array[1] && $image[2] = absint($size_array[1]); // height
                }
            } else {

                $svg = file_get_contents(wp_get_original_image_path($attachment_id));
                $xmlget = simplexml_load_string($svg);
                $xmlattributes = $xmlget->attributes();
                list($x_start, $y_start, $x_end, $y_end) = explode(' ', $xmlattributes['viewBox']);
                $image[1] = absint($x_end - $x_start); // width
                $image[2] = absint($y_end - $y_start); // height
            }
        }
    }
    return $image;
}

function am_show_acf($show = true) {
    if (!$show) {
        add_filter('acf/settings/show_admin', '__return_false');
    }
}

function am_optimize_website_code() {

    $links = '';

    $optimizations_preload = get_field('optimizations_preload', 'options');
    if ($optimizations_preload) {
        foreach ($optimizations_preload as $item) {
            if ($item['url']) {

                $href = 'href="' . $item['url'] . '"';
                $as = 'as="' . $item['as'] . '"';
                $type = $item['type'] ? 'type="' . $item['type'] . '"' : '';
                $media = $item['media'] ? 'media="' . $item['media'] . '"' : '';
                $enable_cors = $item['enable_cors'] ? 'crossorigin' : '';

                $links .= '<link rel="preload" ' . $href . ' ' . $as . ' ' . $type . ' ' . $media . ' ' . $enable_cors . '>';
            }
        }
    }

    $enable_preconnect_google_fonts = get_field('enable_preconnect_google_fonts', 'options');
    if ($enable_preconnect_google_fonts) {
        $links .= '<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>';
    }
    print $links;
}
