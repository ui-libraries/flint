<section class="section">
    <?php if ($image = get_sub_field('image')) { ?>
        <div class="section_image">
            <div class="container">
                <div class="image">
                    <?php am_the_fly_img($image, ['width' => 1024]); ?>
                </div>
            </div>
        </div>
    <?php } ?>
    <div class="container _width-830">
        <div class="box_content">
            <?php am_the_sub_field('title', '<h2 class="mb-35 text-center">', '</h2>'); ?>

            <?php if ($content = get_sub_field('content')) { ?>
                <div class="box_text">
                    <?php echo $content; ?>
                </div>
            <?php } ?>
        </div>
    </div>
</section>