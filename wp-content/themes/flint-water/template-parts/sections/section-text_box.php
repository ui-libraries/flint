<section class="section <?php am_the_background_class(); ?>">
    <div class="container _width-1070">
        <div class="box text-center">
            <?php am_the_sub_field('title', '<div class="box_label ' . am_get_accent_text_color_class() . '">', '</div>'); ?>
            <?php am_the_sub_field('description', '<h2 class="fw-400 fs-lg">', '</h2>'); ?>
        </div>
    </div>

    <?php if (get_sub_field('background_color') === 'black') { ?>
        <div class="section_bg">
            <img src="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture-2.png" alt="" srcset="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture-2@2x.png 2x">
        </div>
    <?php } ?>
</section>