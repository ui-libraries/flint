<!DOCTYPE html>
<html <?php language_attributes(); ?>>

    <?php
    global $sections;
    $sections = get_field('sections');
    ?>
    <head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="format-detection" content="telephone=no">
        <?php if (is_singular() && pings_open(get_queried_object())) : ?>
            <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
        <?php endif; ?>
        <?php /* <link rel="shortcut icon" type="image/png" href="<?php echo get_template_directory_uri(); ?>/assets/img/favicon.png"> */ ?>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">

        <?php wp_head(); ?>
    </head>


    <?php
    $first_section = false;
    if ($sections) {
        $first_section = $sections[0];
        if (!empty($first_section['acf_fc_layout']) && $first_section['acf_fc_layout'] === 'hero' || $first_section['acf_fc_layout'] === 'hero_home') {
            $wrapper_class = 'wrapper';
        } else {
            $wrapper_class .= 'wrapper _overflow-auto _pt-100';
        }
    }
    ?>

    <body <?php body_class(); ?>>

        <?php if ($after_body_open_snippet = get_field('after_body_open_snippet', 'option')) { ?>
            <?php echo $after_body_open_snippet; ?>
        <?php } ?>
        <div class="<?php echo $wrapper_class; ?>">
            <header class="header">
                <div class="container">

                    <div class="header_container">
                        <a href="<?php echo site_url(); ?>" class="header_logo">
                            <?php if ($header_logo = get_field('header_logo', 'options')) { ?>
                                <?php am_the_fly_img($header_logo); ?>
                            <?php } else { ?>
                                <p><?php bloginfo('description'); ?></p>
                            <?php } ?>
                        </a>
                        <?php if (has_nav_menu('mainmenu')) : ?>
                            <button class="menu-opener">
                                <span></span>
                            </button>
                            <div class="menu-drop">
                                <nav class="menu-drop__wrap">
                                    <?php wp_nav_menu(array('theme_location' => 'mainmenu', 'menu_class' => 'menu', 'menu_id' => '', 'container' => '', 'depth' => 0)); ?>
                                </nav>                           
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </header>
            <main class="main">