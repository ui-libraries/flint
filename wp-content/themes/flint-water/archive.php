<?php get_header(); ?>

	<div class="container">
	
		<?php get_sidebar('post'); ?>
		
		<div id="content">
				
			<div class="title">

				<?php
					the_archive_title( '<h1 class="page-title">', '</h1>' );
					the_archive_description( '<div class="taxonomy-description">', '</div>' );
				?>

			</div>

			<div class="entry">
			
				<?php if (have_posts()) : ?>

					<div class="row-post">

						<?php while (have_posts()) : the_post(); ?>

							<?php get_template_part( 'template-parts/content', 'post' ); ?>

						<?php endwhile;  ?>
				
					</div>

					<?php get_template_part( 'template-parts/pagination', 'post' ); ?>
					
				<?php else : ?>
					
					<?php get_template_part( 'template-parts/content', 'none' ); ?>

				<?php endif; ?>

			</div>

		</div>

	</div>

<?php get_footer(); ?>