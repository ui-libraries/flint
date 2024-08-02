<?php if ($content = get_sub_field('content')) { ?>
    <section  id="<?php am_the_section_id(); ?>">
        <div class="container">
            <?php echo do_shortcode($content); ?>
        </div>
    </section>
<?php } ?>