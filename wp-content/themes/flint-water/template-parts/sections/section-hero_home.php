<section class="hero _pt-md _pb-0 bg-black" id="<?php am_the_section_id(); ?>">
    <div class="hero_content _translateX-sm" data-aos="fade-up">
        <div class="container _width-830">
            <div class="box text-center">
                <?php am_the_sub_field('title', '<h1>', '</h1>'); ?>
                <?php am_the_sub_field('subtitle', '<div class="box_text _mb-40"><p>', '</p></div>'); ?>

                <?php if ($button = get_sub_field('button')) { ?>
                    <?php am_the_link($button, ['class' => 'button']); ?>
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