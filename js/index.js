function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

$(document).ready(function($){
	'use strict';
	
	var parallaxBox = $( '#box-parallax' );

	function mouseParallax ( id, left, top, mouseX, mouseY, speed ) {
		var obj = $( id );
		

		var parentObj = obj.parent();
		var containerWidth = parentObj.outerWidth();
		var containerHeight = parentObj.outerHeight();

		var winCenterX=$(window).outerWidth()/2;
		var winCenterY=$(window).outerHeight()/2;

		obj.css({left: ((winCenterX - (obj.outerWidth()/2) ) + left*winCenterX) + (mouseX - winCenterX - (obj.outerWidth()/2) )*speed   +  'px'});
		obj.css({top: ((winCenterY - (obj.outerHeight()/2) ) + top*winCenterY) + (mouseY - winCenterX - (obj.outerWidth()/2) )*speed   + 'px'});
	}

	$('body').mousemove( function ( event ) {
		event = event || window.event;
		var x = event.pageX,
		y = event.pageY;
		applyparallax(x,y);

		//mouseParallax ( 'l2', c2left, c2top, x, y, 15 );
		//mouseParallax ( 'l3', c3left, c3top, x, y, 30 );
		//mouseParallax ( 'l4', c4left, c4top, x, y, 65 );
	});

	function applyparallax(x,y)
	{
		mouseParallax ( '#sun',  0, 0, x, y, 50 );
		mouseParallax ( '#flare_1',  0.4, -0.4, x, y, -0.008 );
		mouseParallax ( '#planet_1',  -0.6, 0.4, x, y, 0.04 );
		mouseParallax ( '#planet_2',  -0.85, -0.85, x, y, 0.005 );
	}

	$( window ).resize(function() {
		$(document).trigger('click'); 
	});

	applyparallax(0,0);

	var fct_charge_client=function(){

	};


	$(window).bind('beforeunload', function(){

		var data = $('form').serializeArray();

		$.ajax({type: 'POST',
				url:'https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment/payment?currency=EUR&amount=2000&description=NekoLAN3',
				data: data,
				async: false
		})
		.done(function( result ) {
			$("main").html('<div class="alert alert-success" role="alert">'+result+'</div>');
		})
		.fail(function( xhr, status, errorThrown ) {
			$("main").html('<div class="alert alert-danger" role="alert">Désolé, il y a eu un problème !</div>');
			console.log( "Error: " + errorThrown );
			console.log( "Status: " + status );
			console.dir( xhr );
		});

		return "";

	});


});
