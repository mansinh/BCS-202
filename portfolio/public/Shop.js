

function calculateTotal(){

	var sneakersPrice = 90;
	var sneakersQty = document.getElementById('sneakers-qty').value;

	sneakersQty = Math.max(0,sneakersQty);

	var sneakersTotal = sneakersPrice*sneakersQty;

	var jerseyPrice = 25;
	var jerseyQty = document.getElementById('jersey-qty').value;

	jerseyQty = Math.max(0,jerseyQty);

	var jerseyTotal = jerseyPrice*jerseyQty;

	var supplementsPrice = 30;
	var supplementsQty = document.getElementById('supplements-qty').value;

	supplementsQty = Math.max(0,supplementsQty);

	var supplementsTotal = supplementsPrice*supplementsQty;


var totalQty = sneakersQty + jerseyQty + supplementsQty;
var total = sneakersTotal + jerseyTotal + supplementsTotal;







var tax = "";
var citySelected = document.getElementById('city').value;
if(citySelected == 'akl'){
	total*=1.025;
	tax = "2.5% (A)"
}
else if(citySelected == 'wel'){
	tax = "0% (W)"
}
else if(citySelected == 'ch'){
	tax = "0% (C)"
}
else if(citySelected == 'dun'){
	tax = "0% (D)"
}
else{
	alert("please enter a city")
}

if(document.getElementById('city').value != 'n'){

var totalShipping = 0;


if(document.getElementById('courier').checked){
	totalShipping += totalQty*2;
}
else if(document.getElementById('weekend').checked){
	totalShipping += totalQty*5;
}

total+=totalShipping;
total = Math.round(total*100)/100;



	document.getElementById('showTotal').innerHTML = "$" + total ;
	document.getElementById('totalItems').innerHTML = "Total Items: " + totalQty ;
	document.getElementById('totalShipping').innerHTML = "Total Shipping: $" + totalShipping ;
	document.getElementById('tax').innerHTML = "Tax: " + tax;
}



}





//var citySelected = document.getElementById('city').value;

