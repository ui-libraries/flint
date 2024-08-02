<section class="section _pt-40">
    <div class="section_head">
        <div class="container _width-830">
            <div class="box text-center">
                <?php am_the_sub_field('subtitle', '<div class="box_label ' . am_get_accent_text_color_class() . '">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="section_grid">
            <?php if ($content = get_sub_field('content')) { ?>
                <div>
                    <div class="box">
                        <div class="box_text">
                            <?php echo $content; ?>
                        </div>
                    </div>
                </div>
            <?php } ?>
            <?php if ($image = get_sub_field('image')) { ?>
            <div>
                <div class="section_img-holder">
                    <?php am_the_fly_img($image, ['width' => 768]); ?>
                </div>
            </div>
            <?php } ?>
        </div>
    </div>
</section>