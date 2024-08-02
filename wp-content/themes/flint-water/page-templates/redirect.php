<?php
/*
Template Name: Redirect
Template Post Type: page, post
*/

/* 

USAGE INSTRUCTIONS:

1. Create a new page in WordPress
2. Add a title to the page (e.g. Amixstudio)
3. Add an URL to the content of the page (e.g. http://www.amixstudio.com OR amixstudio.com OR www.amixstudio.com)
4. Publish!

*/

if (have_posts()) : 

	the_post();
	
	$url = get_field('url'); 
	
	if($url){
		$url = esc_url_raw($url);
		wp_redirect($url, 301);
		exit;
	}
endif;
?>