<?php
// Do not delete these lines

	if ( post_password_required() ) { ?>
		<p class="nocomments"><?php _e('This post is password protected. Enter the password to view comments.', 'am') ?></p>
	<?php
		return;
	}
?>

<?php //You can start editing here. ?>



<?php comment_form(array(
	'comment_notes_after' => ''
)
); ?>


<?php if ( have_comments() ) : ?>
	<h3 id="comments"><?php comments_number(__('Comments', 'am').' (0)', '1 '.__('Comment', 'am'), '% '.__('Comments', 'am')); ?></h3>

	<div class="commentlist">
		<?php
			wp_list_comments( array(
				'style'       => 'div',
				'type'  => 'comment',
				//'callback'  => 'am_comments',
				'avatar_size' => 34,
			) );
		?>
	</div>

	<?php $paginate_comments_links = paginate_comments_links('echo=0'); ?>
	<?php if(!empty($paginate_comments_links)) : ?>
	<div class="pagination">
		<?php echo $paginate_comments_links; ?>
	</div>
	<?php endif; ?>
<?php endif; ?>