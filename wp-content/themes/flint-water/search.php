<?php get_header(); ?>

	<div class="container">
		<div id="content">
		
			<?php breadcrumb_trail('echo=1&separator=/'); ?>
				
			<h1 class="page-title"><?php _e('Search for: ','am'); echo get_search_query(); ?></h1>

			<div class="entry">
			
				<?php if (have_posts()) : ?>

					<div class="row-post row-col">

						<?php while (have_posts()) : the_post(); ?>

							<?php get_template_part( 'template-parts/content', 'post' ); ?>

						<?php endwhile;  ?>
				
					</div>

					<?php get_template_part( 'template-parts/pagination', 'post' ); ?>
					
				<?php else : ?>
					
					<?php get_template_part( 'template-parts/content', 'none' ); ?>

				<?php endif; wp_reset_query(); ?>

			</div>

		</div>

	</div>

<?php get_footer(); ?>