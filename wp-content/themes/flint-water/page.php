<?php get_header(); ?>

<div class="container">

    <?php get_sidebar(); ?>

    <div id="content" class="col_content">

        <?php breadcrumb_trail('echo=1&separator=/'); ?>

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

                <?php get_template_part('template-parts/content', 'page'); ?>

            <?php endwhile;
        endif; ?>

    </div>
</div>

<?php get_footer(); ?>