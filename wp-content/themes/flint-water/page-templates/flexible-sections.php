<?php
/*
Template Name: Flexible Sections
Template Post Type: page
*/

get_header();
if (have_posts()) :
    while (have_posts()) : the_post();
        if (post_password_required()) :
            // if your post is password protected
            ?>
            <div class="container">
                <?php echo get_the_password_form(); ?>
            </div>
        <?php
        else :
            if (have_rows('sections')) :
                while (have_rows('sections')) : the_row();
                    get_template_part('template-parts/sections/section', get_row_layout());
                endwhile;
            endif;
        endif;
    endwhile;
endif;
get_footer(); ?>