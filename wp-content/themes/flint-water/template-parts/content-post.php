<?php if ( !is_single() ) : ?>
		
	<article <?php post_class('post') ?>>

		<?php if ( has_post_thumbnail() ) : ?>

			<div class="post-img">
				<a href="<?php the_permalink(); ?>">
					<?php am_the_post_img( 'medium_large' ); ?>
				</a>
			</div>

		<?php endif; ?>
		
		<div class="post-content">
			<header class="entry-header">

				<?php if(get_post_type()=='post') : ?>
					<div class="entry-category">
						<span><?php _e('In', 'am'); ?> <?php the_category(', ') ?></span>
					</div>
				<?php endif; ?>

				<div class="entry-title">
					<?php am_the_custom_title( [ 'tag' => 'h3', 'link' => true ] ); ?>
				</div>

				<?php if(get_post_type()=='post') : ?>
					<div class="meta">
						<span><?php _e('by', 'am') ?> <?php the_author_posts_link() ?> <?php _e('on', 'am'); ?> <?php the_time(get_option('date_format')) ?></span>
					</div>
				<?php endif; ?>

			</header>
			<div class="entry-content">
				<?php the_excerpt(); ?>
			</div>
		</div>
	</article>

<?php else : ?>

	<div <?php post_class('post') ?> id="post-<?php the_ID(); ?>">
		
		<header class="entry-header">

			<?php if(get_post_type()=='post') : ?>
				<div class="entry-category">
					<span><?php _e('In', 'am'); ?> <?php the_category(', ') ?></span>
				</div>
			<?php endif; ?>

			<div class="entry-title">
				<?php am_the_custom_title( 'h1' ); ?>
			</div>

			<?php if(get_post_type()=='post') : ?>
				<div class="meta">
					<span><?php _e('by', 'am') ?> <?php the_author_posts_link() ?> <?php _e('on', 'am'); ?> <?php the_time(get_option('date_format')) ?></span>
				</div>
			<?php endif; ?>

		</header>

		<div class="entry-content">
			<?php the_content(__('Read more', 'am')); ?>
			<div class="clear clearfix"></div>
			<?php wp_link_pages( array( 'before' => '<div class="page-link"><span>' . __( 'Pages:', 'am' ) . '</span>', 'after' => '</div>' ) ); ?>
		</div>
		
	</div>

<?php endif; ?>