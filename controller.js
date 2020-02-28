
var app = require('electron')
const remote = app.remote;
var playlist = remote.getGlobal('playlist');
var steam = remote.getGlobal('steam');
var trials = remote.getGlobal('trials');
var ipcRenderer = require('electron').ipcRenderer;


function bakc() {
	//document.getElementById('load').style.display="none"

	ipcRenderer.send("goBack");
}


function hide() {
	if (document.getElementById('browserOverlay')) {
		document.getElementById('browserOverlay').style.display = "none";
	}
	ipcRenderer.send("toggle");
}

ipcRenderer.on("toggleView", function (event, trials) {
	hide()
})
/*
ipcRenderer.on("test", function(event,trials){
if (document.getElementById("numTrials")){
document.getElementById("numTrials").innerHTML=String(trials);
if (trials==1){
	document.getElementById("ess").innerHTML="";
}}
});
*/
document.addEventListener("DOMContentLoaded", function () {
	/*
	if (document.querySelector('webview')){
	
	webview=document.querySelector('webview');
	  
		  const loadstart = () => {
			console.log('loadstart');
		  }
	  
		  const loadstop = () => {
		  console.log('loadstop');
		  }
	  
		  webview.addEventListener('did-start-loading', loadstart)
		  webview.addEventListener('did-stop-loading', loadstop)
	
	}
	*/



	if (steam) {

		//console.log('fireeeeeeeed');
		if (document.getElementById('snInput')) {
			document.getElementById('snInput').style.display = "none";
			document.getElementById('purch').style.display = "none";
			document.getElementById('break').style.display = "none";
			document.getElementById('steamFrame').style.display = "flex";

		}
	}



	if (/^win/.test(process.platform)) {
		if (document.getElementById('imag')) {
			document.getElementById('imag').src = "assets/img/win.jpg"
		}
	}

	if (document.getElementById('plat9')) {
		if (/^win/.test(process.platform)) {
			document.getElementById('plat9').innerText = "control (^)"
		} else {
			document.getElementById('plat9').innerText = "command (⌘) "
		}
	}

	if (document.getElementById('scrubbing')) {

		if (/^win/.test(process.platform)) {
			document.getElementById('plat1').innerText = "^"
			document.getElementById('plat2').innerText = "^"
			document.getElementById('plat3').innerText = "^"
			document.getElementById('plat4').innerText = "^"
			document.getElementById('plat5').innerText = "^"
			document.getElementById('plat6').innerText = "^"
			document.getElementById('plat7').innerText = "^"
			//document.getElementById('plat8').innerText="^"
		} else {
			document.getElementById('plat1').innerText = "⌘"
			document.getElementById('plat2').innerText = "⌘"
			document.getElementById('plat3').innerText = "⌘"
			document.getElementById('plat4').innerText = "⌘"
			document.getElementById('plat5').innerText = "⌘"
			document.getElementById('plat6').innerText = "⌘"
			document.getElementById('plat7').innerText = "⌘"
			//document.getElementById('plat8').innerText="⌘"
		}






		if (typeof playlist == 'string') {
			document.getElementById('scrubbing').style.display = "none";
			document.getElementById('ctrls').style.display = "none";
			document.getElementById('togshort').style.display = "block";

		} else {
			document.getElementById('hide').style.display = "none";
			//document.getElementById('show').style.display="none";
			//document.getElementById('kys').style.display="none";
		}

	}
	if (document.getElementById("numTrials")) {
		document.getElementById("numTrials").innerHTML = trials;

		if (trials == 1) {
			document.getElementById("ess").innerHTML = "";
		} else {
			document.getElementById("ess").innerHTML = "s";
		}


	}

});

/*
function openApp(){
ipcRenderer.send("startwfile",null);
   
}

function openBrowser(url){
ipcRenderer.send("openbrowser", url);
}
*/

var enterLicense = function () {
	var email = document.getElementById("email").value
	//var sn=document.getElementById("sn2").value+document.getElementById("sn1").value+document.getElementById("sn3").value
	var sn = document.getElementById("sn1").value + document.getElementById("sn2").value + document.getElementById("sn3").value

	sn = sn.toUpperCase()

	ipcRenderer.send("enterlicense", [email, sn]);

}

ipcRenderer.on("invalid", function (event, trials) {
	alert("Invalid License. Please Re-Check Confirmation Email. Ensure you did not enter your Steam Key, which is separate.");
})
ipcRenderer.on("thx", function (event, trials) {
	alert("Thanks for Purchasing!");
})

ipcRenderer.on("triallimit", function (event, trials) {
	alert("Trial Limit Reached, Please Purchase");
})

var controller = function (param, val) {
	// alert(document.getElementById('vidContainer')) // ??
	// document.getElementById('vidContainer').opacity = .9
	ipcRenderer.send(param, val);

	if (param == "playpause") {
		var ele = document.getElementById("playpauser")

		if (ele.src.includes('ic_play_arrow_black_24px')) {
			ele.src = ele.src.replace(/ic_.+/i, 'ic_pause_black_24px.svg');
		} else {
			ele.src = ele.src.replace(/ic_.+/i, 'ic_play_arrow_black_24px.svg');
		}


	}





}


