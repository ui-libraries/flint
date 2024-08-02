<?php
/*
  Template Name: Test HTML page
  Template Post Type: page
 */
?>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
    rel="stylesheet"
    />

<style>
    * {
        box-sizing: border-box;
    }
    html {
        padding: env(safe-area-inset);
    }
    html,
    body {
        height: 100%;
        padding: 0;
        margin: 0;
    }
    body {
        color: #161613;
        font: 400 17px/150% "Inter", sans-serif;
        min-width: 320px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    @media (max-width: 767px) {
        body {
            font-size: 15px;
        }
    }
    .section {
        padding-block: clamp(60px, 15vh, 120px);
    }
    .headline {
        margin-bottom: 1.6em;
    }
    .headline p {
        margin: 0 0 1.6em;
    }
    .headline p:last-child {
        margin-bottom: 0;
    }
    .headline-title {
        font-weight: 700;
        font-size: 1.4117em;
        line-height: 1.3;
        margin: 0 0 15px;
    }
    .container {
        max-width: 1200px;
        padding: 0 25px;
        margin-inline: auto;
    }
    .dev-links {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .dev-links li {
        margin-bottom: 1.1em;
    }
    .dev-links li:last-child {
        margin-bottom: 0;
    }
</style>

<section class="section">
    <div class="container">
        <div class="content-holder">

            <?php
            $markup_templates_suffix = '/markup-template/markup';
            $markup_templates_folder = get_template_directory() . $markup_templates_suffix;
            $html_files = glob("$markup_templates_folder/*.{html,htm}", GLOB_BRACE);
            ?>

            <?php if ($html_files) : ?>
                <div class="headline">
                    <h2 class="headline-title"><?php echo get_bloginfo('name'); ?></h2>
                    <p>
                        Below you'll find a list of links to view the HTML for each page
                        of your project. When viewing these pages, remember this is just
                        the HTML so many links, buttons, etc. will not be clickable yet.
                        If your project includes WordPress, all links, buttons, etc. will
                        work properly after the WordPress integration is complete.
                    </p>
                    <p>
                        If you're checking for updates, please remember to clear your
                        cache and refresh before reviewing any changes.
                    </p>
                </div>
                <ul class="dev-links">

                    <?php foreach ($html_files as $test_link_path) : ?>

                        <?php $test_link_path_basename = basename($test_link_path); ?>

                        <?php
                        if ( in_array($test_link_path_basename, ['00-test.html', 'dev_wp-test-blog-page.html', 'dev_wp-test-page.html']) ) {
                            continue;
                        }
                        ?>

                        <?php $test_link = get_template_directory_uri() . $markup_templates_suffix . '/' . $test_link_path_basename; ?>

                        <li>
                            <a href="<?php echo $test_link; ?>" target="_blank"><?php echo $test_link; ?></a>
                        </li>

                    <?php endforeach; ?>

                </ul>

            <?php endif; ?>

        </div>
    </div>
</section>