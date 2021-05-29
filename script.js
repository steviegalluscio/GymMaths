window.addEventListener('load', function() {
	loadSettings();
	hashChanged();
	document.getElementById('requiredWeight').addEventListener('keyup', function(event) {
		if (event.code === 'Enter')
		{
		findCombos();
		}
	});
});

window.addEventListener('hashchange', hashChanged);

function hashChanged() {
	if(location.hash == '#settings'){
		showSettings(true);
	} else {
		let requiredWeight = Number(location.hash.split('#').pop());
		if (!isNaN(requiredWeight) && requiredWeight > 0) {
			document.getElementById('requiredWeight').value = requiredWeight;
			findCombos();
		}
		showSettings(false);
	}
}


function showSettings(yes){
	if(yes){
		document.getElementById('settings').style.display = 'block';
		document.getElementById('editSettingsBtn').style.display = 'none';
		document.getElementById('app').style.display = 'none';
	} else {
		document.getElementById('settings').style.display = 'none';
		document.getElementById('editSettingsBtn').style.display = 'block';
		document.getElementById('app').style.display = 'block';
	}
		
}

function loadSettings(){
	let gymMathStr = localStorage.getItem('gymMath');
	if(gymMathStr){
		showSettings(false);
		let gymSettings = JSON.parse(gymMathStr).gymSettings;
		document.getElementById('GymName').value = gymSettings.GymName;
		document.getElementsByClassName('subtitle')[0].innerHTML = 'For <strong>'+gymSettings.GymName+'</strong>';
		document.getElementById('BarWeight').value = gymSettings.BarWeight;
		document.getElementById('Weight1').value = gymSettings.Weight1;
		document.getElementById('Weight2').value = gymSettings.Weight2;
		document.getElementById('Weight3').value = gymSettings.Weight3;
		document.getElementById('Weight4').value = gymSettings.Weight4;
		document.getElementById('Weight5').value = gymSettings.Weight5;
		document.getElementById('Weight6').value = gymSettings.Weight6;
	} else {
		location.hash = '#settings';
		showSettings(true);
	}
}

function saveSettings(btn){	
	if(document.getElementById('GymName').value){
		btn.classList.add('is-loading');
		setTimeout(function() {
		document.getElementById('error').style.display = 'none';
		let gymSettings =  {
		"GymName": document.getElementById('GymName').value, 
		"BarWeight": document.getElementById('BarWeight').value, 
		"Weight1": document.getElementById('Weight1').value, 
		"Weight2": document.getElementById('Weight2').value,
		"Weight3": document.getElementById('Weight3').value,
		"Weight4": document.getElementById('Weight4').value,
		"Weight5": document.getElementById('Weight5').value,
		"Weight6": document.getElementById('Weight6').value		
		};
		let gymMath = {
		"gymSettings": gymSettings,
		"plateCombos": []
		};
		gymMath.plateCombos = createWeightComboObjs(platesForOneSide_Lbs(gymSettings));
		localStorage.setItem('gymMath', JSON.stringify(gymMath));
		document.getElementsByClassName('subtitle')[0].innerHTML = 'For <strong>'+gymSettings.GymName+'</strong>';
		btn.classList.remove('is-loading');
		showSettings(false);
		location.hash = document.getElementById('requiredWeight').value;
		}, 0);	
	} else {
		document.getElementById('error').style.display = 'block';
	}
}

//TODO: allow more than 6 weight and allow kg
function platesForOneSide_Lbs(gymSettings){
	let platesForOneSide = [];
	let i = 0;
	for(i = 0; i<gymSettings.Weight1/2;i++){
		platesForOneSide.push('45');
	}
	for(i = 0; i<gymSettings.Weight2/2;i++){
		platesForOneSide.push('35');
	}
	for(i = 0; i<gymSettings.Weight3/2;i++){
		platesForOneSide.push('25');
	}
	for(i = 0; i<gymSettings.Weight4/2;i++){
		platesForOneSide.push('10');
	}
	for(i = 0; i<gymSettings.Weight5/2;i++){
		platesForOneSide.push('5');
	}
	for(i = 0; i<gymSettings.Weight6/2;i++){
		platesForOneSide.push('2.5');
	}
	return platesForOneSide;
}

function weightQuantityBtn(btn,add){
	if(add)
		btn.parentNode.getElementsByClassName("input")[0].value = parseInt(btn.parentNode.getElementsByClassName("input")[0].value) + 2;
	else if(parseInt(btn.parentNode.getElementsByClassName("input")[0].value) >= 2)
		btn.parentNode.getElementsByClassName("input")[0].value = parseInt(btn.parentNode.getElementsByClassName("input")[0].value) - 2;
}

//Input: sorted array (decending) of each weight that can be used one side of the bar
//Output: array of arrays of all distinct combinations of weight plates
function powerSet(weights){
	let n = weights.length;
	let numberOfCombos = Math.pow(2,n);
	let powerSet = new Set();
	let i = 0, j = 0;
	//iterate over every bitmask from no weights to all weights to cover all possible combos of weights 
	for(i = 0; i < numberOfCombos; i++){
		let subSet = "";
		//iterate over the weights
		for(j = 0; j < n; j++){		
			//turn on the bit representing the weight and if the bit is also on in the bitmask it is within a subset
			if(i & (1 << j)) {
				//add the weight to the subset
				subSet += weights[j] + ",";
			}		
		}
		//add the subset to the powerset
		powerSet.add(subSet);
	}
	let combos = Array.from(powerSet);
	//make susbset strings into subset arrays excluding nullset
	for(i = 1; i < combos.length; i++){
		let temp = combos[i].split(",");
		temp.pop();
		combos[i] = temp;
	}
	return combos;
}

//creates a sorted array (acending) with objects of all possible combinations of plates on one side of the bar and their weights
function createWeightComboObjs(weights){
	let weightCombos = [];
	let i = 0, j = 0;
	let powerset = powerSet(weights);
	for(i = 0; i < powerset.length; i++){
		weightCombos[i] = {};
		weightCombos[i].plates = powerset[i];
		let sum = 0;
		for(j = 0; j < powerset[i].length; j++) sum += +powerset[i][j];
		weightCombos[i].weight = sum;
	}
	weightCombos.sort((a, b) => a.weight - b.weight);
	return weightCombos;
}

//Finds combinations of plates that add up to the required total weight
function findCombos(){
	let requiredWeight = document.getElementById('requiredWeight').value;
	location.hash = requiredWeight;
	let BarWeight = +document.getElementById('BarWeight').value;
	if(requiredWeight){	
		let remainder = requiredWeight - BarWeight;
		if(remainder < 0){
			document.getElementById("output").innerHTML = '<div class="notification is-info"><strong class="has-text-dark">The lowest weight you can make is '+BarWeight+'</strong></div>';
		} else if(remainder == 0){
			document.getElementById("output").innerHTML = '<div class="notification is-info"><strong class="has-text-dark">'+BarWeight+' is the bar with no weights on.</strong></div>';
		} else {
			remainder = remainder / 2;
			let weightCombos = JSON.parse(localStorage.getItem('gymMath')).plateCombos;
			if(remainder > weightCombos[weightCombos.length-1].weight){
				document.getElementById("output").innerHTML = '<div class="notification is-info"><strong class="has-text-dark">The largest weight you can make is '+((weightCombos[weightCombos.length-1].weight * 2) + BarWeight)+'</strong></div>';
			} else {			
				let validCombos = weightCombos.filter(combo => combo.weight == remainder);
				if(validCombos.length < 1){
					//look for the alternative combos (closest upper and lower) and output them
					let lower = weightCombos.filter(combo => combo.weight < remainder);
					let upper = weightCombos.filter(combo => combo.weight > remainder);
					let less = (lower[lower.length-1].weight * 2) + BarWeight;
					let greater = (upper[0].weight * 2) + BarWeight;
					document.getElementById("output").innerHTML = '<div class="notification is-info"><strong class="has-text-dark">It is not possible to make exactly '+requiredWeight+' in your gym, would <a href="#'+less+'">'+less+'</a> or <a href="#'+greater+'">'+greater+'</a> be close enough?</strong><div class="has-text-dark"><b>'+less+'</b> is <b>'+Math.abs(less - requiredWeight)+' less</b> than the required weight.</div><div class="has-text-dark"><b>'+greater+'</b> is <b>'+Math.abs(greater - requiredWeight)+' more</b> than the required weight.</div></div>';		
				} else {
					//output all valid combos
					displayCombos(validCombos, requiredWeight);
				}
			}
		}
	} else {
		//handle error ?
	}
}

function displayCombos(combos, requiredWeight){
		let outputElement = document.getElementById("output");
		outputElement.innerHTML = '<strong class="has-text-dark">All possible combinations of plates on one side of the bar to equal '+requiredWeight+':</strong>';
		let i = 0, j = 0;
		for(i = 0; i < combos.length; i++){
			let output = '<div class="notification is-info">';
			for(j = 0; j < combos[i].plates.length; j++){
				switch(combos[i].plates[j]){
					case '45':
						output += '<div class="weight w1"><strong class="has-text-dark">45</strong></div>';
						break;
					case '35':
						output += '<div class="weight w2"><strong class="has-text-dark">35</strong></div>';
						break;
					case '25':
						output += '<div class="weight w3"><strong class="has-text-dark">25</strong></div>';
						break;
					case '10':
						output += '<div class="weight w4"><strong class="has-text-dark">10</strong></div>';
						break;
					case '5':
						output += '<div class="weight w5"><strong class="has-text-dark">5</strong></div>';
						break;
					case '2.5':
						output += '<div class="weight w6"><strong class="has-text-dark">2.5</strong></div>';
						break;
				}
			}
			output += '</div>';
			outputElement.insertAdjacentHTML('beforeend', output)
		}
}

