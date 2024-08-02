<?php
/*
  Template Name: Blog
  Template Post Type: page
 */

global $more;
$more = 0;
$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;

get_header();
?>

<div class="container">

    <?php
    if (get_field('show_sidebar')) {
        get_sidebar('post');
    }
    ?>

    <div id="content">

        <?php breadcrumb_trail('echo=1&separator=/'); ?>

        <div class="title">

            <?php am_the_custom_title('h1'); ?>

        </div>

        <?php query_posts('post_type=post&paged=' . $paged); ?>

        <div class="entry">

            <?php if (have_posts()) : ?>

                <div class="row-post">

                    <?php while (have_posts()) : the_post(); ?>

                        <?php get_template_part('template-parts/content', 'post'); ?>

                    <?php endwhile; ?>

                </div>

                <?php get_template_part('template-parts/pagination', 'post'); ?>

            <?php else : ?>

                <?php get_template_part('template-parts/content', 'none'); ?>

            <?php endif;
            wp_reset_query();
            ?>

        </div>

    </div>

</div>

<?php get_footer(); ?>