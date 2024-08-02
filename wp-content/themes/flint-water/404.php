<?php get_header(); ?>

<div class="container">
    <div id="content" class="col_content">
        <?php breadcrumb_trail('echo=1&separator=/'); ?>
        <div class="post page">
            <div class="title">
                <h2><?php _e('Error 404 - Page not found!', 'am') ?></h2>
            </div><!-- /title -->
            <div class="entry">
                <p><?php _e('The page you trying to reach does not exist, or has been moved. Please use the menus or the search box to find what you are looking for.', 'am') ?></p>
            </div>
            <?php get_search_form(); ?>
        </div>
    </div>
</div>
<?php get_footer(); ?>