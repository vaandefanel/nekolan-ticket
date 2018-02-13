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

	var stripePublishableKey='pk_live_wyBQsaPIw6OJOGcR6ajMRqiN';
	var nekolan_webhookurl='https://wt-928c20363e48533aab7b42b81b5ece88-0.run.webtask.io/stripe-payment';

	var stripe = new Stripe(stripePublishableKey);
	var elements = stripe.elements();

	var stripe_wrapper=$('#stripe-wrapper');
	var form=$("#payment-form");

	var finalmessage=$("#stripe-wrapper .final-message");
	var chargemessage=$("#stripe-wrapper .charge-message");
	var stripeform=stripe_wrapper.find('form');

	function displayError(msg)
	{
		finalmessage.html('<div class="alert alert-danger" role="alert">'+msg+'</div>');
	}

	function displayInformation(msg)
	{
		finalmessage.html('<div class="alert alert-info" role="alert">'+msg+'</div>');
	}

	function displaySuccess(msg)
	{
		finalmessage.html('<div class="alert alert-success" role="alert">'+msg+'</div>');
	}

	/*function displayChargeMessage(msg)
	{
		chargemessage.html('<div class="alert alert-info" role="alert">'+msg+'</div>');
	}*/

	function hideform()
	{
		stripeform.hide();
	}

	function dealWithChargeAsynchronous(){
		hideform();

		displayInformation('Authentication réussie : Vous allez recevoir un email de reçu si le paiement s\'est bien passé.<br/>Dans le cas contraire, vous recevrez un email d\'échec de paiement.<br/>Sinon, contacter l\'incompétent humain qui a codé cette page sur Discord ou Facebook.');

		//displayInformation('Authentication réussie : prélèvement en cours...');

		//chargeClient();
		//setTimeout(pollCharge, 3000, sourceid, clientsecret);
	}

	function dealWithChargeSynchronous(sourceid){
		hideform();

		displayInformation('Prélèvement en cours...');

		console.log('sourceid to charge :');
		console.log(sourceid);

		chargeClient(sourceid);
		//setTimeout(pollCharge, 3000, sourceid, clientsecret);
	}

	function chargeClient(sourceid)
	{
		sleep(1500);

		var name = form.find('#field-name').val();
		var email = form.find('#field-email').val();

		$.ajax({type: 'POST',
	 			url:nekolan_webhookurl+'/charge-now',
	 			contentType: 'application/json', 
    			data: JSON.stringify({name:name, email:email, source:sourceid})
	 	})
	 	.done(function( result ) {
	 		console.log( 'charge ok' );
	 		displaySuccess("Paiement effectué avec succès.");
	 	})
	 	.fail(function( xhr, status, errorThrown ) {

	 		displayError("Échec du paiement, erreur inattendue.");

	 		console.log( "Error: " + errorThrown );
	 		console.log( "Status: " + status );
	 		console.log( xhr );
	 	});
	}

	var style = {
			base: {
				color: '#32325d',
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

	/*$(document).on("keypress", 'form', function (e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			console.log('ahah');
			e.preventDefault();
			return false;
		}
	});*/

	function enableInputs() {
		$(form).find("input[type='text'], input[type='email'], input[type='tel']").prop('disable',false);
	}

	function disableInputs() {
		$(form).find("input[type='text'], input[type='email'], input[type='tel']").prop('disable',true);
	}


	/*function pollCharge(sourceid, clientsecret){

		stripe.retrieveSource({id:sourceid,client_secret: clientsecret}).then(function(result) {

			if(result.source.status=='failed')
			{
				displayError('Card authentication failed.');
			}
			else if(result.source.status=='chargeable')
			{

			}
			else if ( result.source.status != 'pending' )
			{
				displayError("Status de paiement inattendu : " + source.status);
			}
			else
			{
				setTimeout(pollCharge, 3000, sourceid, clientsecret);
			}
		});
	}*/



	function poll3DSource(sourceid, clientsecret){

		stripe.retrieveSource({id:sourceid, client_secret: clientsecret}).then(function(result) {

			if(result.source.status=='failed')
			{
				$.featherlight.current().close();
				displayError('L\'authentication 3d Secure a échouée.');
			}
			else if(result.source.status=='canceled')
			{
				$.featherlight.current().close();
				displayError('L\'authentication 3d Secure a été annulée.');
			}
			else if(result.source.status=='chargeable')
			{
				$.featherlight.current().close();

				dealWithChargeSynchronous(sourceid);
			}
			else if ( result.source.status != 'pending' )
			{
				$.featherlight.current().close();
				displayError("Status 3D Secure inattendu : " + result.source.status);
			}
			else
			{
				setTimeout(poll3DSource, 3000, sourceid, clientsecret);
			}
		});
	}



	function stripeSourceHandler(source) {

		console.log('card source result:');
		console.log(source);

		if(source.card.three_d_secure==='required')
		{
			console.log('create 3d secure source');
			sleep(1000);

			var name = form.find('#field-name').val();
			var address1 = form.find('#field-address').val();
			var city = form.find('#field-city').val();
			var state = form.find('#field-state').val();
			var zip = form.find('#field-zip').val();
			var email = form.find('#field-email').val();

			var additionalData = {
				type: 'three_d_secure',
				amount: 2000,
				currency: "eur",
				
				address_line1: address1 ? address1 : undefined,
				address_city: city ? city : undefined,
				address_state: state ? state : undefined,
				address_zip: zip ? zip : undefined,
				owner: {
					email: email ? email : undefined
				},

				three_d_secure: {
					card: source.id
				},
				redirect: {
					return_url: nekolan_webhookurl+'/payment-return-url'
				}
			};

			stripe.createSource(additionalData).then(function(result) {

				if(result.error)
				{
					console.log('3dsecure-error');
				}
				else
				{
					console.log('3d secure source creation...');
					console.log('status 3d secure (before polling): '+result.source.status);
					console.log(result.source);

					poll3DSource(
						result.source.id,
						result.source.client_secret
					);

					$.featherlight({
						iframe: result.source.redirect.url,
						iframeWidth: '800',
						iframeHeight: '600'
					});
				}
				
				// handle result.error or result.source
			});
		}
		else //cards (visa mastercard ...)
		{
			//charge is done with webhook
			console.log('carte classique détectée');
			dealWithChargeSynchronous(source.id);
		}
	}

	// Listen on the form's 'submit' handler...
 	form.submit( function(e) {

		e.preventDefault();

		// Show a loading screen...
		stripe_wrapper.addClass('submitting');

		// Disable all inputs.
		disableInputs();

		// Gather additional customer data we may have collected in our form.
		var name = form.find('#field-name').val();
		var address1 = form.find('#field-address').val();
		var city = form.find('#field-city').val();
		var state = form.find('#field-state').val();
		var zip = form.find('#field-zip').val();
		var email = form.find('#field-email').val();

		console.log(form);

		var additionalData = {
			amount: 2000,
			currency: "eur",
			
			address_line1: address1 ? address1 : undefined,
			address_city: city ? city : undefined,
			address_state: state ? state : undefined,
			address_zip: zip ? zip : undefined,
			owner: {
				email: email ? email : undefined
			}
		};

		/*owner: {
				email: email ? email : undefined
			}*/

		console.log('create card (classic) source');
		console.log(additionalData);
		stripe.createSource(card, additionalData
			).then(function(result) {
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

});
