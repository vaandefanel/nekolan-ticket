// function sleep(milliseconds) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 1e7; i++) {
//     if ((new Date().getTime() - start) > milliseconds){
//       break;
//     }
//   }
// }





$(document).ready(function($){
	'use strict';

	var stripePublishableKey='pk_test_BLxF2dzLJXgmCpeuHN9LMeff';

	var stripe = new Stripe(stripePublishableKey);
	var elements = stripe.elements();

	var stripe_wrapper=$('#stripe-wrapper');
	var form=$("#payment-form");


	var style = {
			base: {
				color: '#32325d',
				fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
				fontSmoothing: 'antialiased',
				'::placeholder': {
					color: '#aab7c4'
				}
			},
			invalid: {
				color: '#fa755a',
				iconColor: '#fa755a'
			}
		};

	// Create an instance of the card Element
	var card = elements.create('card', {style: style});

	// Add an instance of the card Element into the `card-element` <div>
	card.mount('#card-element');

	card.addEventListener('change', function(event) {
		var displayError = $('#card-errors');
		if (event.error) {
			displayError.html('<div class="alert alert-danger" role="alert">'+event.error.message+'</div>');
		} else {
			displayError.html('');
		}
	});



	function enableInputs() {
		$(form).find("input[type='text'], input[type='email'], input[type='tel']").prop('disable',false);
	}

	function disableInputs() {
		$(form).find("input[type='text'], input[type='email'], input[type='tel']").prop('disable',true);
	}





	function stripeSourceHandler(source) {
		// Insert the token ID into the form so it gets submitted to the server
		//var form = $('#payment-form');

		// var hiddenInput = document.createElement('input');
		// hiddenInput.setAttribute('type', 'hidden');
		// hiddenInput.setAttribute('name', 'stripeToken');
		// hiddenInput.setAttribute('value', token.id);
		// form.appendChild(hiddenInput);

		console.log(source);

		if(source.card.three_d_secure==='required')
		{

			stripe.createSource({
				type: 'three_d_secure',
				amount: 2000,
				currency: "eur",
				three_d_secure: {
					card: source.id
				},
				redirect: {
					return_url: "https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment-test/payment-return-url"
				}
			}).then(function(result) {

				if(result.error)
				{
					console.log('3dsecure-error');
				}
				else
				{
					console.log('3d secure source creation...');
					console.log(result.source);

					$.featherlight({
						iframe: result.source.redirect.url,
						iframeWidth: '800',
						iframeHeight: '600'
					});
				}
				
				// handle result.error or result.source
			});
		}

		// Submit the form
		// $.ajax({method:'POST',
		// 	data:{stripeSource:source.id},
		// 	url:'https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment-test/payment-source',
		// }).done(function(msg) {
		// 	$("main").html('<div class="alert alert-success" role="alert">'+msg+'</div>');
		// })
		// .fail(function(jqXHR, textStatus, errorThrown) {
		// 	console.log(errorThrown);
		// 	$("main").html('<div class="alert alert-danger" role="alert">Désolé, il y a eu un problème !<br/>'+jqXHR.responseText+'</div>');
		// })
		// .always(function(response) {});
	}



	// Listen on the form's 'submit' handler...
	$('#payment-form').submit( function(e) {

		e.preventDefault();

		// Show a loading screen...
		stripe_wrapper.addClass('submitting');

		// Disable all inputs.
		disableInputs();

		// Gather additional customer data we may have collected in our form.
		var name = $(this).find('#field-name');
		var address1 = $(this).find('#field-address');
		var city = $(this).find('#field-city');
		var state = $(this).find('#field-state');
		var zip = $(this).find('#field-zip');
		var additionalData = {
			name: name ? name.value : undefined,
			address_line1: address1 ? address1.value : undefined,
			address_city: city ? city.value : undefined,
			address_state: state ? state.value : undefined,
			address_zip: zip ? zip.value : undefined,
		};

		// Use Stripe.js to create a token. We only need to pass in one Element
		// from the Element group in order to create a token. We can also pass
		// in the additional customer data we collected in our form.
		// stripe.createToken(card, additionalData).then(function(result) {
		// 	// Stop loading!
		// 	stripe_wrapper.removeClass('submitting');

		// 	if(result.error)
		// 	{
		// 		$('#card-errors').html(result.error.message);
		// 		stripe_wrapper.addClass('submitted');
		// 	}
		// 	else
		// 	{
		// 		enableInputs();
		// 		stripeTokenHandler_ajax(result.token);
		// 	}
		// });

		stripe.createSource(card, additionalData).then(function(result) {
			// Stop loading!
			stripe_wrapper.removeClass('submitting');

			if(result.error)
			{
				$('#card-errors').html(result.error.message);
				stripe_wrapper.addClass('submitted');
			}
			else
			{
				enableInputs();
				stripeSourceHandler(result.source);
			}
		});

		return false;
	});

	//old

	// function displayProcessing() {
	// 	$("#processing").css({display : 'block'});

	// 	$("#charge-form").css({display : 'none'});
	// 	$("#result").css({display : 'none'});
	// }

	// function displayResult(resultText) {
	// 	$("#processing").css({display : 'none'});

	// 	$("#charge-form").css({display: 'block'});
	// 	$("#result").css({display:'block'});
	// 	$("#result").html( resultText );
	// }

	// function stripeCardResponseHandler(status, response) {

	// 	console.log(response);

	// 	if (response.error) {
	// 		var message = response.error.message;
	// 		displayResult("Unexpected card source creation response status: " + status + ". Error: " + message);
	// 		return;
	// 	}

	// 	// check if the card supports 3DS
	// 	if (response.card.three_d_secure == 'required') {
	// 		stripe.createsource({
	// 			type: 'three_d_secure',
	// 			amount: 2000,
	// 			currency: "eur",
	// 			three_d_secure: {
	// 				card: response.id
	// 			},
	// 			redirect: {
	// 				return_url: null
	// 			}
	// 		}, stripe3DSecureResponseHandler);
	// 	}
	// 	else
	// 	{

	// 	}

	// }

	// function stripe3DSecureResponseHandler(status, response) {

	// 	console.log(response);

	// 	if (response.error) {
	// 		var message = response.error.message;
	// 		displayResult("Unexpected 3DS source creation response status: " + status + ". Error: " + message);
	// 		return;
	// 	}

	// 	// check the 3DS source's status
	// 	if (response.status == 'chargeable') {
	// 		displayResult("This card does not support 3D Secure authentication, but liability will be shifted to the card issuer.");
	// 		return;
	// 	} else if (response.status != 'pending') {
	// 		displayResult("Unexpected 3D Secure status: " + response.status);
	// 		return;
	// 	}

	// 	// start polling the source (to detect the change from pending
	// 	// to either chargeable or failed)
	// 	Stripe.source.poll(
	// 		response.id,
	// 		response.client_secret,
	// 		stripe3DSStatusChangedHandler
	// 		);

	// 	// open the redirect URL in an iframe
	// 	// (in this example we're using Featherlight for convenience,
	// 	// but this is of course not a requirement)
	// 	$.featherlight({
	// 		iframe: response.redirect.url,
	// 		iframeWidth: '800',
	// 		iframeHeight: '600'
	// 	});
	// }

	// function stripe3DSStatusChangedHandler(status, source) {
	// 	if (source.status == 'chargeable') {
	// 		$.featherlight.current().close();
	// 		var msg = '3D Secure authentication succeeded: ' + source.id + '. In a real app you would send this source ID to your backend to create the charge.';
	// 		displayResult(msg);
	// 	} else if (source.status == 'failed') {
	// 		$.featherlight.current().close();
	// 		var msg = '3D Secure authentication failed.';
	// 		displayResult(msg);
	// 	} else if (source.status != 'pending') {
	// 		$.featherlight.current().close();
	// 		var msg = "Unexpected 3D Secure status: " + source.status;
	// 		displayResult(msg);
	// 	}
	// }


	// var handler = stripe.configure({
	// 		key: stripePublishableKey,
	// 		locale: 'fr',
	// 		token: function(token) {

	// 			stripe.createSource({
	// 				type: 'card',
	// 				token: token.id
	// 			}, stripeCardResponseHandler);

	// 			displayProcessing();

	// 			// $.ajax({method:'POST',
	// 			// 	data:{stripeToken:token.id},
	// 			// 	url:'https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment-test/payment-test',
	// 			// }).done(function(response) {
	// 			// 	$("main").html('<div class="alert alert-success" role="alert">'+response+'</div>');
	// 			// })
	// 			// .fail(function(response) {
	// 			// 	$("main").html('<div class="alert alert-danger" role="alert">Désolé, il y a eu un problème !</div>');
	// 			// })
	// 			// .always(function(response) {
					
	// 			// });
	// 	}
	// });

	// $('#stripe-purchase-button').on('click', function(e) {
	// 	// Open Checkout with further options:
	// 	handler.open({
	// 		name: 'NekoLan',
	// 		description: 'Réservation NekoLAN#3',
	// 		currency: 'eur',
	// 		zipCode: true,
	// 		amount: 2000,
	// 		allowRememberMe: false
	// 	});
	// 	e.preventDefault();
	// });

	// Close Checkout on page navigation:
	// window.addEventListener('popstate', function() {
	// 	handler.close();
	// });

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

	// var fct_charge_client=function(){

	// };


	// $(window).bind('beforeunload', function(){

	// 	var data = $('form').serializeArray();

	// 	$.ajax({type: 'POST',
	// 			url:'https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment/payment?currency=EUR&amount=2000&description=NekoLAN3',
	// 			data: data,
	// 			async: false
	// 	})
	// 	.done(function( result ) {
	// 		$("main").html('<div class="alert alert-success" role="alert">'+result+'</div>');
	// 	})
	// 	.fail(function( xhr, status, errorThrown ) {
	// 		$("main").html('<div class="alert alert-danger" role="alert">Désolé, il y a eu un problème !</div>');
	// 		console.log( "Error: " + errorThrown );
	// 		console.log( "Status: " + status );
	// 		console.dir( xhr );
	// 	});

	// 	return "";

	// });


});
