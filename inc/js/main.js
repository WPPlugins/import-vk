jQuery(function($){

	$('[data-toggle="tooltip"]').tooltip();

	$('.datetimepicker').datetimepicker({
		locale: 'ru',
		format: 'DD.MM.YYYY HH:mm'
	});

	// Loading profile data state modal
	$('#get-profile-modal').on('hidden.bs.modal', function() {
		$(this).find('.modal-body').html('\
			<div class="progress">\
				<div class="progress-bar progress-bar-striped active">' + scriptParams.progressDefaultText + '</div>\
			</div>\
		');
		$(this).find('button').prop('disabled', true);
	});

	var pageDomain = '';
	var pagePhoto = '';
	var pageType = '';
	var pageId = 0;
	var pageOwner = '';
	var posts = {
		all : {
			count : 0,
			ids : [],
			titles : [],
			dates : []
		},
		owner : {
			count : 0,
			ids : [],
			titles : [],
			dates : []
		},
		others : {
			count : 0,
			ids : [],
			titles : [],
			dates : []
		}
	};
	var postsFilter = 'all';
	var progressValue = 0;
	var postsOffset = 0;
	var postsCount = 0;
	var postsDone = 0;
	var vkAccessToken = '';
	var browseLink = '';

	// Loading profile data
	$('#get-profile-btn').click(function(){
		var verifyWin = window.open('http://vkmate.ru/verify.php', 'verifyWin', 'width=20, height=20, top=10, left=10');
		postsOffset = 0;
		pageDomain = $('#vk-domain').val();
		posts = {
			all: {
				count: 0,
				ids : [],
				titles: [],
				dates: []
			},
			owner: {
				count: 0,
				ids : [],
				titles: [],
				dates: []
			},
			others: {
				count: 0,
				ids : [],
				titles: [],
				dates: []
			}
		};
		setTimeout(function callback(){
			if (verifyWin.closed){
				// Close profile data panel if it has been opened
				$('#vk-profile').hide();
				// Show loading profile data state modal
				$('#get-profile-modal')
					.modal({
						backdrop: 'static'
					})
					.modal('show');
				// Set focus on input field
				$('#vk-domain').focus();
				// Send AJAX-request to script that gets vk.com profile data
				$.ajax({
					url: 'http://vkmate.ru/ajax/get_profile.php',
					type: 'POST',
					data: {'pageDomain': pageDomain},
					dataType: 'json',
					xhrFields: {withCredentials: true},
					crossDomain: true,
					success: function(data){
						// If no errors
						if (typeof data['error'] == 'undefined'){
							// Fill profile data
							pageOwner = data['pageOwner'];
							pagePhoto = data['pagePhoto'];
							pageType = data['pageType'];
							pageId = data['pageId'];
							posts['all']['count'] = data['posts']['all']['count'];
							// Downloading vk.com wall records data
							(function poll() {
								// If all the records haven't been processed
								if (postsOffset < posts['all']['count']){
									$.ajax({
										url: 'http://vkmate.ru/ajax/get_posts.php',
										type: 'POST',
										data: {'pageDomain': pageDomain, 'pageId': pageId, 'postsOffset': postsOffset, 'postsOwnerCount' : posts['owner']['count'], 'postsOthersCount' : posts['others']['count'], 'postTimePrefix': 'at'},
										dataType: 'json',
										xhrFields: {withCredentials: true},
										crossDomain: true,
										success: function(data){
											// Fill records data
											posts['all']['ids'] = posts['all']['ids'].concat(data['posts']['all']['ids']);
											posts['all']['titles'] = posts['all']['titles'].concat(data['posts']['all']['titles']);
											posts['all']['dates'] = posts['all']['dates'].concat(data['posts']['all']['dates']);
											posts['owner']['ids'] = posts['owner']['ids'].concat(data['posts']['owner']['ids']);
											posts['owner']['titles'] = posts['owner']['titles'].concat(data['posts']['owner']['titles']);
											posts['owner']['dates'] = posts['owner']['dates'].concat(data['posts']['owner']['dates']);
											posts['owner']['count'] += data['posts']['owner']['count'];
											posts['others']['ids'] = posts['others']['ids'].concat(data['posts']['others']['ids']);
											posts['others']['titles'] = posts['others']['titles'].concat(data['posts']['others']['titles']);
											posts['others']['dates'] = posts['others']['dates'].concat(data['posts']['others']['dates']);
											posts['others']['count'] += data['posts']['others']['count'];
											// Change the last processed record number
											postsOffset = data['postsOffset'];
											// Change progress bar state
											progressValue = Math.round(postsOffset / posts['all']['count'] * 1000) / 10;
											$('#get-profile-modal .progress-bar').css('width', progressValue + '%').text(progressValue + '%');
										},
										complete: poll
									});
								} else {
									// Showing profile panel
									$('#vk-profile-domain').val(pageDomain);
									$('#vk-profile img').attr('src', pagePhoto);
									$('#vk-profile h4 a').attr('href', 'http://vk.com/' + pageDomain).text(pageOwner);
									if (pageType == 'user'){
										$('#vk-profile .label').text('user');
									} else {
										$('#vk-profile .label').text('group');
									}
									$('#vk-profile p').text('found ' + posts['all']['count'] + ' records from ' + posts['all']['dates'][0].substr(0, 10) + ' to ' + posts['all']['dates'][posts['all']['count'] - 1].substr(0, 10));
									$('#posts-filter a').eq(0).addClass('active').blur().siblings().removeClass('active');
									if (!posts['owner']['count']){
										$('#posts-filter a').eq(1).attr('disabled', 'disabled');
									} else {
										$('#posts-filter a').eq(1).removeAttr('disabled');
									}
									if (!posts['others']['count']){
										$('#posts-filter a').eq(2).attr('disabled', 'disabled');
									} else {
										$('#posts-filter a').eq(2).removeAttr('disabled');
									}
									// Range slider init
									$('.slider')
										.slider({
											min: 1,
											max: posts['all']['count'],
											range: true,
											values: [1, posts['all']['count']]
										})
										.slider('float', {
											labels: posts['all']['titles']
										})
										.on('slide', function(e, ui){
											$('#vk-first-post-num').val(ui.values[0]);
											$('#vk-last-post-num').val(ui.values[1]);
											$('#vk-first-post-date').val(posts['all']['dates'][ui.values[0] - 1]);
											$('#vk-last-post-date').val(posts['all']['dates'][ui.values[1] - 1]);
											$('#records-count').val(ui.values[1] - ui.values[0] + 1);
										});
									$('#records-count').val(posts['all']['count']);
									$('#vk-first-post-num').val(1);
									$('#vk-last-post-num').val(posts['all']['count']);
									$('#vk-first-post-date').val(posts['all']['dates'][0]);
									$('#vk-last-post-date').val(posts['all']['dates'][posts['all']['count'] - 1]);
									// Close loading profile data state modal
									$('#get-profile-modal').modal('hide');
									// Show profile data panel
									$('#vk-profile').slideDown(800);
								}
							})();
						} else {
							// Show error in modal and make close buttons available
							$('#get-profile-modal').find('.modal-body').html('<span class="text-danger"><strong>' + scriptParams.errorWord + '.</strong> ' + data['error'] + '.</span>');
							$('#get-profile-modal button').prop('disabled', false);
						}
					}
				});
			} else {
				setTimeout(callback, 10);
			}
		}, 10);
	});

	// Select records by authorship attribute
	$('#posts-filter a').click(function(e){
		e.preventDefault();
		if ($(this).attr('disabled') != 'disabled'){
			$(this).addClass('active').blur().siblings().removeClass('active');
			switch ($(this).index()) {
				case 0:
					postsFilter = 'all';
					break;
				case 1:
					postsFilter = 'owner';
					break;
				case 2:
					postsFilter = 'others';
					break;
				default:
					// code...
					break;
			}
			$('#vk-profile p').text('found ' + posts[postsFilter]['count'] + ' records from ' + posts[postsFilter]['dates'][0].substr(0, 10) + ' to ' + posts[postsFilter]['dates'][posts[postsFilter]['count'] - 1].substr(0, 10));
			// Range slider init
			$('.slider')
				.slider({
					min: 1,
					max: posts[postsFilter]['count'],
					range: true,
					values: [1, posts[postsFilter]['count']]
				})
				.slider('float', {
					labels: posts[postsFilter]['titles']
				})
				.on('slide', function(e, ui){
					$('#vk-first-post-num').val(ui.values[0]);
					$('#vk-last-post-num').val(ui.values[1]);
					$('#vk-first-post-date').val(posts[postsFilter]['dates'][ui.values[0] - 1]);
					$('#vk-last-post-date').val(posts[postsFilter]['dates'][ui.values[1] - 1]);
					$('#records-count').val(ui.values[1] - ui.values[0] + 1);
				});
			$('#records-count').val(posts[postsFilter]['count']);
			$('#vk-first-post-num').val(1);
			$('#vk-last-post-num').val(posts[postsFilter]['count']);
			$('#vk-first-post-date').val(posts[postsFilter]['dates'][0]);
			$('#vk-last-post-date').val(posts[postsFilter]['dates'][posts[postsFilter]['count'] - 1]);
		}
	});

	// Import posts modal
	$('#import-posts-modal').on('hidden.bs.modal', function() {
		$('#import-info').html('\
			<div class="progress">\
				<div class="progress-bar progress-bar-striped active">' + scriptParams.progressDefaultText + '</div>\
			</div>\
		');
		$(this).find('button').prop('disabled', true);
	});

	// Importing posts from vk.com
	$('#import-posts-btn').click(function(){
		var verifyWin = window.open('http://vkmate.ru/verify.php', 'verifyWin', 'width=20, height=20, top=10, left=10');
		postsOffset = $('.slider').slider('option', 'values')[0] - 1;
		postsCount = $('.slider').slider('option', 'values')[1] - $('.slider').slider('option', 'values')[0] + 1;
		postsDone = 0;
		setTimeout(function callback(){
			if (verifyWin.closed){
				$.ajax({
					url: 'http://vkmate.ru/ajax/get_cookies.php',
					type: 'POST',
					dataType: 'json',
					xhrFields: {withCredentials: true},
					crossDomain: true
				}).then(function(result){
					// Import posts state modal
					$('#import-posts-modal')
						.modal({
							backdrop: 'static'
						})
						.modal('show');
					// Processing records
					(function poll(){
						// If all the records haven't been processed
						if (postsDone < postsCount) {
							console.log(postsCount);
							$.ajax({
								url: scriptParams.ajaxUrl,
								type: 'POST',
								data: {
									'action': 'import_posts',
									'pageDomain': pageDomain,
									'pageId': pageId,
									'postsFilter': postsFilter,
									'postsIds' : posts[postsFilter]['ids'].slice(postsOffset, postsOffset + ((postsCount - postsDone >= 1) ? 1 : (postsCount - postsDone))),
									'postsOffset': postsOffset,
									'postsDone': postsDone,
									'vkAccessToken': result['vkAccessToken']
								},
								dataType: 'json',
								success: function (data) {
									postsOffset = data['postsOffset'];
									postsDone = data['postsDone'];
									// Change progress bar state
									progressValue = Math.round(postsDone / postsCount * 1000) / 10;
									$('#import-posts-modal .progress-bar').css('width', progressValue + '%').text(progressValue + '%');
									// Set browse link
									browseLink = data['browseLink'];
								},
								complete: poll
							});
						} else {
							$('#import-info').html('Import successfully completed.');
							$('#browse-btn').attr('href', browseLink).removeAttr('disabled');
							$('#import-posts-modal button').prop('disabled', false);
						}
					})();
				});
			} else {
				setTimeout(callback, 10);
			}
		}, 10);
	});

	// Change import settings
	$('#import-settings-form select').change(function(){
		var formData = $('#import-settings-form').serialize();
		$('#import-settings-form select').prop('disabled', true);
		$.ajax({
			url: 'options.php',
			type: 'POST',
			data: formData,
			success: function(data){
				$('#import-settings-form select').prop('disabled', false);
				$('#import-settings-msg').removeClass('hidden').show().delay(1000).fadeOut(400);
			}
		});
	});

});