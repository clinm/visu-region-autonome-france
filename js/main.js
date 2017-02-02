jQuery(function($) {

	

	//smooth scroll
	$('.navbar-nav > li.anchor').click(function(event) {
		//event.preventDefault();
		var target = $(this).find('>a').prop('hash');

		$('#navbar .active').removeClass('active');

		$(this).addClass('active');
		$('html, body').animate({
			scrollTop: $(target).offset().top
		}, 500);
	});


	//scrollspy
	$('[data-spy="scroll"]').each(function () {
		var $spy = $(this).scrollspy('refresh')
	});

	 $(function() {
        $(".navbar-btn").click(function() {
          	$("#options").toggle();
			$(".navbar-btn .glyphicon").toggleClass("glyphicon-plus")
				.toggleClass("glyphicon-minus");
        });
    });
});