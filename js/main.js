jQuery(function($) {

	

	//smooth scroll
	$('.navbar-nav > li.anchor').click(function(event) {
		//event.preventDefault();
		var target = $(this).find('>a').prop('hash');
		$('html, body').animate({
			scrollTop: $(target).offset().top
		}, 500);
	});


	//scrollspy
	$('[data-spy="scroll"]').each(function () {
		var $spy = $(this).scrollspy('refresh')
	})

	 $(function() {
        $(".navbar-btn").click(function() {
          $("#options").toggle();
        });
    });
});