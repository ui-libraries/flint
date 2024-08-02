<section  id="<?php am_the_section_id(); ?>">
    <?php if ($image = get_sub_field('image')) { ?>
        <div class="image">
            <?php am_the_fly_img($image, ['width' => 768, 'height' => 290]); ?>
        </div>
    <?php } ?>
</section>
