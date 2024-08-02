<section class="section bg-black" id="<?php am_the_section_id(); ?>">
    <div class="container _width-1070">
        <div class="section_cols">
            <div class="section_col">
                <div class="box">
                    <?php am_the_sub_field('title', '<h2 class="mb-20">', '</h2>'); ?>
                    <?php am_the_sub_field('subtitle', '<div class="box_text _mb-70"><p>', '</p></div>'); ?>
                    <?php if ($link = get_sub_field('link')) { ?>
                        <?php am_the_link($link, ['class' => 'button']); ?>
                    <?php } ?>
                </div>
            </div>
            <div class="section_col _align-end">
                <div class="section_img">
                    <?php if ($image = get_sub_field('image')) { ?>
                        <?php am_the_fly_img($image, ['width' => 768]); ?>
                    <?php } ?>
                </div>
            </div>
        </div>
    </div>
    <div class="section_bg">
        <img src="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture-2.png" alt="" srcset="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/texture-2@2x.png 2x">
    </div>
</section>