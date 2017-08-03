<div class="wrap">
	<div class="row">
		<div class="col-xs-12">
			<h3 class="m-b-20"><?php echo get_admin_page_title(); ?></h3>
		</div>
		<div class="col-xs-12 col-md-8">
			<div class="form-group m-b-20">
				<div class="input-group">
					<div class="input-group-addon">http://vk.com/</div>
					<input class="form-control" type="text" placeholder="<?php _e('enter page domain', 'import-vk'); ?>" id="vk-domain">
					<div class="input-group-btn">
						<button type="button" class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="<?php _e('Get page data', 'import-vk'); ?>" id="get-profile-btn">
							<span class="glyphicon glyphicon-menu-right"></span>
						</button>
					</div>
				</div>
			</div>
			<div class="panel panel-default" id="vk-profile">
				<div class="panel-body">
					<div class="row">
						<div class="col-xs-4">
							<img class="img-thumbnail" src="">
						</div>
						<div class="col-xs-8">
							<h4><a target="_blanc" href="#"></a> <sup class="label label-primary"></sup></h4>
							<hr>
							<p></p>
							<hr>
							<div id="posts-filter" class="btn-group btn-group-justified">
								<a class="btn btn-default active"><?php _e('All posts', 'import-vk'); ?></a>
								<a class="btn btn-default no-left-border no-right-border"><?php _e('Own posts', 'import-vk'); ?></a>
								<a class="btn btn-default"><?php _e('Other posts', 'import-vk'); ?></a>
							</div>
							<br>
							<div class="panel panel-default">
								<div class="panel-body">
									<div class="input-group">
										<input type="text" class="form-control text-center datetimepicker" readonly="readonly" id="vk-first-post-date">
										<div class="input-group-addon no-left-border no-right-border">&mdash;</div>
										<input type="text" class="form-control text-center datetimepicker" readonly="readonly" id="vk-last-post-date">
									</div>
									<br>
									<div class="input-group">
										<input type="text" class="form-control text-center" readonly="readonly" id="vk-first-post-num">
										<div class="input-group-addon no-left-border no-right-border">&mdash;</div>
										<input type="text" class="form-control text-center" readonly="readonly" id="vk-last-post-num">
									</div>
									<br>
									<div class="slider"></div>
								</div>
							</div>
							<div class="input-group">
								<div class="input-group-addon"><?php _e('Chosen', 'import-vk'); ?></div>
								<input type="text" class="form-control text-center" readonly="readonly" id="records-count">
								<input type="hidden" id="vk-profile-domain">
								<div class="input-group-btn">
									<button class="btn btn-primary" type="button" id="import-posts-btn"><?php _e('Import', 'import-vk'); ?></button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="panel panel-default">
				<div class="panel-body">
					<p class="text-justify">
						<?php _e('The plugin allows you to import posts from any <b>VKontakte</b> wall', 'import-vk'); ?>:
					</p>
					<ol class="no-margin-bottom">
						<li><?php _e('Enter <i>vk.com</i> page address to load data', 'import-vk'); ?></li>
						<li><?php _e('Choose posts range to import', 'import-vk'); ?></li>
						<li><?php _e('You can also set the target records type (post, page) and their initial state (draft, publish)', 'import-vk'); ?></li>
						<li><?php _e('Finally, click the <i><b>Import</b></i> button and wait untill the end of operation', 'import-vk'); ?></li>
					</ol>
				</div>
			</div>
			<div class="modal fade" id="get-profile-modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" disabled="disabled">&times;</button>
							<h4 class="modal-title"><?php _e('Loading profile data', 'import-vk'); ?></h4>
						</div>
						<div class="modal-body">
							<div class="progress">
								<div class="progress-bar progress-bar-striped active"><?php _e('preparing', 'import-vk'); ?></div>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary" data-dismiss="modal" disabled="disabled"><?php _e('Close', 'import-vk'); ?></button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade" id="import-posts-modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" disabled="disabled">&times;</button>
							<h4 class="modal-title"><?php _e('Importing records to WordPress', 'import-vk'); ?></h4>
						</div>
						<div class="modal-body" id="import-info">
							<div class="progress">
								<div class="progress-bar progress-bar-striped active"><?php _e('preparing', 'import-vk'); ?></div>
							</div>
						</div>
						<div class="modal-footer">
							<a class="btn btn-primary" href="#" target="_blank" id="browse-btn" disabled="disabled"><?php _e('Browse', 'import-vk'); ?></a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-xs-6 col-md-4">
			<div class="panel panel-default">
				<div class="panel-heading">
					<span class="h3 panel-title"><?php _e('Settings', 'import-vk'); ?></span>
					<span class="glyphicon glyphicon-ok text-success m-l-5 hidden" id="import-settings-msg"></span>
				</div>
				<div class="panel-body">
					<form action="options.php" method="post" id="import-settings-form">
						<?php settings_fields('import-vk-option-group'); ?>
						<div class="form-group">
							<label for="post-type-sel"><?php _e('Post type', 'import-vk'); ?></label>
							<select id="post-type-sel" class="form-control" name="<?php echo self::$optionName; ?>[post_type]">
								<option value="post"<?php selected(get_option(self::$optionName)['post_type'], 'post'); ?>><?php _e('post', 'import-vk'); ?></option>
								<option value="page"<?php selected(get_option(self::$optionName)['post_type'], 'page'); ?>><?php _e('page', 'import-vk'); ?></option>
							</select>
						</div>
						<div class="form-group">
							<label for="post-status-sel"><?php _e('Post status', 'import-vk'); ?></label>
							<select id="post-status-sel" class="form-control" name="<?php echo self::$optionName; ?>[post_status]">
								<option value="draft"<?php selected(get_option(self::$optionName)['post_status'], 'draft'); ?>><?php _e('draft', 'import-vk'); ?></option>
								<option value="publish"<?php selected(get_option(self::$optionName)['post_status'], 'publish'); ?>><?php _e('publish', 'import-vk'); ?></option>
							</select>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>