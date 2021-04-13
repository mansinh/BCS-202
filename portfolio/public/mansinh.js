
window.onresize = function(){headerVisible()}


function inflateHeader(){
	

	if($("#header").is(":visible")){
		$("#header").fadeOut(300);
	}
	else{
		$("#header").fadeIn(300);
	}
	
}

function closeHeader(){
	if($("#header").is(":visible") & $(window).width() < 1000){
		console.log("visible");
		$("#header").fadeOut(300);
	}
}

function headerVisible(){
	if($(window).width() > 800){
		$("#header").show();
	}
}

document.body.addEventListener('click', closeEnlarged, true);


var enlarged = $("#enlarged");
var enlargedImg = $("#enlarged_img");

function onImgClicked(_src){
	  $("#enlarged").fadeIn(200);
	  document.getElementById("enlarged_img").src = _src;
}



function closeEnlarged(){
	 $("#enlarged").fadeOut(200);
}




function onSubmit(){
	

	var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
	var phone = document.getElementById("phone").value;
	var message = document.getElementById("message").value;

	window.location ='#contact';

	var valid = true;

	if(name == ""){
		document.getElementById('nameError').innerHTML = '*please enter your name';
		valid = false;
	
	}
	else{
		if(/^[A-Za-z]+$/.test(name)){
			document.getElementById('nameError').innerHTML = '';

		}
		else{
			document.getElementById('nameError').innerHTML = '*please enter letters only';
			valid = false;
		}
	}
	
	if(email == ""){
		document.getElementById('emailError').innerHTML = '*please enter your email';
		valid = false;
	}
	else{
		if( /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,3})$/.test(email)){
			document.getElementById('emailError').innerHTML = '';

		}
		else{
			document.getElementById('emailError').innerHTML = '*please enter a valid email';
			valid = false;
		}
	}
	
	if(phone == ""){
		document.getElementById('phoneError').innerHTML = '*please enter your phone number';
		valid = false;
	}
	else{
		//valid phone numbers length from 7(landline) to 15(international)
		if(phone.length<=15 && phone.length>=7){
			document.getElementById('phoneError').innerHTML = '';

		}
		else{
			document.getElementById('phoneError').innerHTML = '*please enter a valid phone number';
			valid = false;
		}
	}
	
	if(message == ""){
		document.getElementById('messageError').innerHTML = '*please enter a message';
		valid = false;
	}
	else{
		document.getElementById('messageError').innerHTML = '';
	}

	if(valid){

		var body = 'name: '+name+'\n'+'email: '+email+'\n'+'phone: '+phone+'\n\n'+message+'\n\n\n\n';

		window.open('mailto:manhkwong@gmail.com?subject=folio message&body='+encodeURIComponent(body))
	}
}

