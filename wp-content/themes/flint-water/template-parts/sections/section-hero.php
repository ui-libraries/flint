<section class="hero" id="<?php am_the_section_id(); ?>">
    <div class="hero_content" data-aos="fade-up">
        <div class="container">
            <div class="box text-center">
                <?php am_the_sub_field('subtitle', '<div class="box_label">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h1 class="h2">', '</h1>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>

                <?php if ($link = get_sub_field('link')) { ?>
                    <a class="arrow-link" href="<?php echo $link['url'] ?? '#'; ?>" target="<?php echo $link['target'] ?? '_self'; ?>">
                        <span><?php echo $link['title'] ?? ''; ?></span>
                        <svg class="arrow-link_arrow">
                        <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#arrow-right"></use>
                        </svg>
                    </a>
                <?php } ?>
            </div>
        </div>
    </div>
    <div class="hero_bg">
        <?php if ($background_image = get_sub_field('background_image')) { ?>
            <?php am_the_fly_img($background_image, ['class' => 'hero_img']); ?>
        <?php } ?>
        <img class="hero_texture" src="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture.png" alt="" srcset="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture@2x.png 2x">
    </div>
</section>