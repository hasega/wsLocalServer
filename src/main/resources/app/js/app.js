/*
 * Please see the included README.md file for license terms and conditions.
 */
/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */
// This file contains your event handlers, the center of your application.
// See app.initEvents() in init-app.js for event initialization.
// function myEventHandler() {
//     "use strict" ;
// // ...event handler code here...
// }S
// ...additional event handlers here...

var properties = eval('(' + loadAsync('js/properties.json') + ')');


var protocol = properties.protocol; //"https"
var server = properties.server; // "app.odebrechtambiental.com";
var port = properties.port; //"8443";
var serviceBase = properties.serviceBase; // "tsOneServices/rest/avServices";
var urlMaster = protocol + "://" + server + ':' + port + "/" + serviceBase;
//var local_url = 'http://192.168.1.100:8080';
var local_protocol = properties.localprotocol
var local_url = local_protocol + '://' + properties.localserver + ":" + properties.localport;
var local_service_url = local_url + '/services';


var is_menu = false;
var is_login = false;
var sitefSuport = true;


var sitefCodes = {};

var default_doc = properties.default_doc; //'69351139115'; //'04923065168';//; 57509085772 + 26014624856 + 43423965800
var default_cdc = properties.default_cdc; // '229306';// '1';//;  116 + 20525 + 105


var idleTime = 0;
var countdown = 10;
var idlemin = 50;
var idlemax = 60;

var remoteStorage = {
	setItem: function (k, v) {
		var call = [local_service_url, 'sitef', "setItem", k, v];
		var h = call.join('/');
		loadAsync(h);
	},
	getItem: function (k) {
		var call = [local_service_url, 'sitef', "getItem", k];
		var h = call.join('/');
		return loadAsync(h);
	},
	removeItem: function (k, v) {
		var call = [local_service_url, 'sitef', "removeItem", k];
		var h = call.join('/');
		return loadAsync(h);
	}
}

function getRemoteStorage() {
	return remoteStorage;
}
var menu = {};
menu.items = new Array();

var props = {};




function checkConnection() {
	try {
		var networkState = navigator.connection.type;
		var states = {};
		states[Connection.UNKNOWN] = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI] = 'WiFi connection';
		states[Connection.CELL_2G] = 'Cell 2G connection';
		states[Connection.CELL_3G] = 'Cell 3G connection';
		states[Connection.CELL_4G] = 'Cell 4G connection';
		states[Connection.CELL] = 'Cell generic connection';
		states[Connection.NONE] = 'No network connection';

		if (networkState == Connection.NONE) {
			window.af.ui.hideMask();
			showMessage('É preciso estar conectado a internet para utilizar este aplicativo!');
			return false;
		}
	} catch (e) {}
	return true;
}


function validLatLong(v) {
	return !(v === "");
	//var reg = new RegExp("^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}");
	//if (reg.exec(v)) {
	//	return true;
	//	} else {
	//		return false
	//	}
}



//var cliente = 'foz';
//var cliente_label = 'Foz Águas 5';
//var cliente_cor = '#00B7D1';

//var cliente = 'Saneaqua';
//var cliente_label = 'Saneaqua Mairinque';
//var cliente_cor = '#02A4BE';

//var cliente = 'oa';
//var cliente_label = 'Odebrecht Ambiental';
//var cliente_cor = '#E41F2B';




var cliente = properties.cliente;
var cliente_label = properties.cliente_label;
var cliente_cor = properties.cliente_cor;



function isTotem() {
	return properties.presentation == 'totem';
	try {
		if (intel.xdk.isBrowser == undefined) {
			var windowWidth = window.screen.width < window.outerWidth ?
				window.screen.width : window.outerWidth;
			return windowWidth > 500;
		} else {
			return !intel.xdk.isphone; // && false;
		}
	} catch (e) {

	}
	var windowWidth = window.screen.width < window.outerWidth ?
		window.screen.width : window.outerWidth;
	return windowWidth > 500;
}

/*
//Activate :active state
document.addEventListener("touchstart", function (e) {
	e.preventDefault();
}, false);

document.addEventListener("touchmove", function (e) {
	e.preventDefault();
}, false);
*/

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

document.addEventListener("deviceready", onDeviceReady, false);


function Application() {}

Application.prototype = {
	run: function (url, id) {
		window.af.ui.showMask();

		var pdfFileName = "fatura" + id + ".pdf"; // urlA[urlA.length];
		var samplePdfUrl;
		var dir = "";
		if (window.navigator.simulator === true) {
			alert("Not Supported in Simulator.");
		} else {
			if (device.platform.toLowerCase() === "android") {
				dir = 'file:///storage/emulated/0/Android/data/agencia_virtual/faturas/';
				//dir = cordova.file.applicationStorageDirectory;
			}
			if (device.platform.toLowerCase() === "ios") {
				//dir = 'file:///var/mobile/Applications/agencia_virtual/faturas/'; 							//cordova.file.dataDirectory
				dir = cordova.file.applicationStorageDirectory + '/Documents/';


			}
			// Directory has to be public, for the default pdf viewer to read it.
			samplePdfUrl = dir + pdfFileName;
			//showMessage(samplePdfUrl);

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
				fileSystem.root.getFile(samplePdfUrl, {
					create: true,
					exclusive: false
				}, function (fileEntry) {
					var localPath = fileEntry.fullPath,
						fileTransfer = new FileTransfer();
					showMessage(localPath);
					//fileEntry.delete();
					fileTransfer.download(url, samplePdfUrl, loadPdfFromFileEntry, downloadError);
				}, downloadError1);


				// Check whether the sample PDF file exists.
				window.resolveLocalFileSystemURL(
					samplePdfUrl,
					loadPdfFromFileEntry,
					function (error) {
						copyFile(
							url,
							samplePdfUrl,
							loadPdfFromFileEntry,
							downloadError4);
					});



			}, downloadError2);



			//}
		}
	},
}


function downloadError4(error) {
	//window.af.ui.hideMask();
	//	showMessage("Error 4: " + JSON.stringify(error, null, 4));
}


function downloadError(error) {
	//	window.af.ui.hideMask();
	//	showMessage("Error: " + JSON.stringify(error, null, 4));
}

function downloadError1(error) {
	//window.af.ui.hideMask();
	//	showMessage("Error 1: " + JSON.stringify(error, null, 4));
}

function downloadError2(error) {
	//window.af.ui.hideMask();
	//showMessage("Error 2: " + JSON.stringify(error, null, 4));
}


function loadPdf(targetUrl) {
	//var infoDiv = document.getElementById("infoField"),
	windowTarget = device.platform.toLowerCase() === "ios" ? "_blank" : "_system";

	//infoDiv.textContent = targetUrl;
	//console.log("Loading PDF file from: " + targetUrl);
	window.af.ui.hideMask();

	window.open(targetUrl, windowTarget, "location=no,closebuttoncaption=Close,enableViewportScale=yes");
	window.af.ui.hideMask();
}

function loadPdfFromFileEntry(fileEntry) {
	loadPdf(fileEntry.toURL());
}

function copyFile(sourceUri, targetUri, successFunction, errorFunction) {
	var fileTransfer = new FileTransfer();

	//alert("Copying PDF file from: " + sourceUri + " to: " + targetUri);

	fileTransfer.download(
		encodeURI(sourceUri),
		encodeURI(targetUri),
		successFunction,
		errorFunction);
}


sitefCodes.ERRO = -1;

sitefCodes.WARNING = -2;

sitefCodes.CHECK_TICKET = -3;

sitefCodes.PRINT_TICKET = -4;

sitefCodes.DADOS_TRANSACAO = -5;
/**
 * Está devolvendo um valor para, se desejado, ser armazenado pela automação.
 */
sitefCodes.ARMAZENAR = 0;

/**
 * Mensagem para visor do eperador.
 */
sitefCodes.MENSAGEM_OPERADOR = 1;

/**
 * Mensagem para visor do cliente.
 */
sitefCodes.MENSAGEM_CLIENTE = 2;

/**
 * Mensagem para os dois visores.
 */
sitefCodes.MENSAGEM_TODOS = 3;

/**
 * Texto que deverá ser utilizado como cabeçalho na apresentação do menu( Comando 21 ).
 */
sitefCodes.CABECALHO_MENU = 4;

/**
 * Deve remover a mensagem apresentada no visor do operador.
 */
sitefCodes.REMOVER_MESAGEM_OPERADOR = 11

/**
 * Deve remover a mensagem apresentada no visor do cliente.
 */
sitefCodes.REMOVER_MESAGEM_CLIENTE = 12;

/**
 * Deve remover a mensagem apresentada no visor do operador e do cliente.
 */
sitefCodes.REMOVER_MESAGEM_TODOS = 13;

/**
 * Deve remover o texto utilizado como cabeçalho na apresentação do menu.
 */
sitefCodes.REMOVER_CABECALHO_MENU = 14;

/**
 * Cabeçalho a ser apresentado pela aplicação.
 */
sitefCodes.CABECALHO = 15;

/**
 * Remover cabeçalho.
 */
sitefCodes.REMOVER_CABECALHO = 16;

/**
 * Deve obter uma resposta do tipo SIM/NÂO. No retorno o primenro carácter presente em Buffer deve conter 0 se confirma e 1 se cancela.
 */
sitefCodes.RETORNAR_CONFIRMACAO = 20;

/**
 * Deve apresentar um menu de opções e permitir que o usuário selecione uma delas. Na chamada o parâmetro Buffer contém as opções da forma que ele desejar (não sendo necessário incluir os índices 1,2,...) e após a seleção feira pelo usuário,
 * retornar em Buffer o índice i escolhido pelo operador ( em ASCII )
 */
sitefCodes.MOSTRAR_MENU = 21;

/**
 * Deve aquardar uma tecla do operador. É utilizada quando se deseja que o operador seja avisado de alguma mensagem apresentada na tela.
 */
sitefCodes.AGUADAR_TECLA_OPERADOR = 22;

/**
 * Este comando indica que a rotina está perguntando para a aplicação se ele deseja interromper o processo de coleta de dados ou não. Esse código ocorre quando a DLL está acessando algum periférico e permite que a automação interrompa esse acesso
 * (por exemplo: aquardando a passagem de um cartão pela lietora ou a difitração de senha pelo cliente)
 */
sitefCodes.CONFIRMAR_IMTERRUPSAO = 23;

/**
 * Deve ser lido um campo cujo tamanho está entre Tamanho Minimo e Tamanho Máximo. O campo lido de ser devolvido em Buffer
 */
sitefCodes.LER_CAMPO = 30;

/**
 * Deve ser lido o número de um cheque. A coleta pode ser feita via leitura de CMC-7 ou pela digutação da primeira linha do cheque. No retorno deve ser devolvido em Buffer "0:" ou "1:" seguido do número coletado manualmente ou pela leitura do
 * CMC-7, respectivamente. Quando o número for coletado manualmente o formato é o sequinte: Compensação (3), Banco (3), Agencia(4), C1 (1), Conta Conrrente (10), C2 (1), Número do cheque (6), e C3(1), nesta ordem. Notar que estes campos são os
 * que estão na parte superior de um cheque e na ordem apresentada.
 */
// Sugerimos que na coleta seja apresentada uma interface que perminta ao operador indentificar
// e digitar adequadamente estas informações de forma que a consulta não seja feita com dados errados,
// retornando como bom um cheque com problemas.
sitefCodes.LER_CHEQUE = 31;

/**
 * Deve ser lido um campo monetário ou seja, aceita o delimitador de centavos e devolvido no parâmetro Buffer.
 */
sitefCodes.LER_VALOR = 34;

/**
 * Deve ser lido um código em barras ou o mesmo deve ser coletado manualmente. No retorno Buffer deve conter "0:" ou "1:" sequido do código em barras coletado manualmente ou pela leitora, respectivamente
 */
sitefCodes.LER_CODIGO_DE_BARRAS = 35;
sitefCodes.FIM = 100;
sitefCodes.CANCELOU_ABERTA = 99;
sitefCodes.DATA_FISCAL = 98;





var pagas = {};
var hsg = {};
var interval;
var back_store = {};
String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

Number.prototype.padLeft = function (base, chr) {
	var len = (String(base || 10).length - String(this).length) + 1;
	return len > 0 ? new Array(len).join(chr || '0') + this : this;
}


hsg.divControl = function () {
	if (this.index % 2)
		return '</div> <br> <div class ="div-table-row "> '
	else
		return '';
	cont++;
}

hsg.getFullDate = function () {

	var d = new Date,
		dformat = [d.getDate().padLeft(), (d.getMonth() + 1).padLeft(),
            d.getFullYear()
        ].join('/') + ' ' + [d.getHours().padLeft(),
            d.getMinutes().padLeft(),
            d.getSeconds().padLeft()
        ].join(':');
	return dformat;
}
hsg.isEmpty = function (a) {
	if (a && a.length > 0)
		return false;
	else
		return true;
}
hsg.formatMoney = function (v, places, symbol, thousand, decimal) {

	places = !isNaN(places = Math.abs(places)) ? places : 2;
	symbol = symbol !== undefined ? symbol : "$";
	thousand = thousand || ",";
	decimal = decimal || ".";
	var number = Number(v),
		negative = number < 0 ? "-" : "",
		i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");

}
hsg.yearValidation = function yearValidation(year) {
	var text = /^[0-9]+$/;
	if (year != 0) {
		if ((year != "") && (!text.test(year))) {

			showMessage("Digite somente números para o ano");
			return false;
		}

		if (year.length != 4) {
			showMessage("Ano inválido!");
			return false;
		}
		var current_year = new Date().getFullYear();
		if ((year < 1920) || (year > current_year)) {
			showMessage("Ano inválido o ano deve ser menor ou igual ao ano atual!");
			return false;
		}
		return true;
	}
}

function mergeTemplate(t, d) {
	return Mustache.to_html(t, d);
}

function loadjscssfile(filename, filetype) {
	if (filetype == "js") { //if filename is a external JavaScript file
		var fileref = document.createElement('script')
		fileref.setAttribute("type", "text/javascript")
		fileref.setAttribute("src", filename)
	} else if (filetype == "css") { //if filename is an external CSS file
		var fileref = document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}




function getStorage() {
	if (typeof (Storage) !== "undefined") {
		return localStorage;
	} else {
		showMessage('storage not suported');
	}
}


function loadUser() {
	if (getStorage().getItem('avUser') && !isTotem()) {
		$('#nomeCliente').html(jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO.cliente);
		$('#nomeCidade').html(jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO.cidade);
		showMenu();
		window.af.ui.clearHistory();
	} else {
		showLogin();
	}

}


function close() {
	getStorage().removeItem("avUser");
	getStorage().removeItem("avCdc");
	getStorage().removeItem("avDoc");
	getStorage().removeItem("idCidade");
	window.af.ui.clearHistory();
	window.clearInterval(interval);
	idleTime = 0;
	showLogin();
}

function init() {
	window.af.ui.autoLaunch = false;
	window.af.ui.useOSThemes = true; //Change this to false to force a device theme
	window.af.ui.blockPageScroll();
	try {
		$.ui.blockPageScroll();
	} catch (e) {}
	if (window.af.ui.useOSThemes && (window.af.os.android || window.af.os.ieTouch || window.af.os.ie))
		$("#afui").addClass("light");

	if (isTotem()) {
		$("#bt-print").hide();
		$("#bt-sa").hide();
		$("#bt-ua").hide();
		$("#bt-pag").hide();
		$("#bt-val").hide();
		unblockPagamento();
		window.addEventListener('touchstart', function (event) {
			idleTime = 0;
			$('#expireDiv').hide();

		}, false);

		window.addEventListener('click', function (event) {
			idleTime = 0;
			$('#expireDiv').hide();

		}, false);


		//$("#afui").addClass("android");
		//    $("#afui").addClass("light");
	}


	menu.items.push({
		url: 'javascript:showCadastro(this)',
		label: 'Seu Cadastro',
		icon: 'img/ico_meu_cadastro.png'
	});

	menu.items.push({
		url: 'javascript:showFaturas(this)',
		label: '2ª Via de Fatura',
		icon: 'img/ico_2via.png'
	});
	if (sitefSuport) {
		menu.items.push({
			url: 'javascript:showFaturasPagamento(this)',
			label: 'Pagamento',
			icon: 'img/pagamento.png'
		});
	}
	menu.items.push({
		url: 'javascript:showContas(this)',
		label: 'Contas Pagas',
		icon: 'img/ico_contas_pagas.png'
	});
	menu.items.push({
		url: 'javascript:showConsumo(this)',
		label: 'Histórico de Consumo',
		icon: 'img/ico_historico_consumo.png'
	});
	if (isTotem()) {
		menu.items.push({
			url: 'javascript:showDeclaracao(this)',
			label: 'Declaração Negativa de Débitos',
			icon: 'img/ico_dec_neg.png'
		});
		menu.items.push({
			url: 'javascript:showAnual(this)',
			label: 'Declaração Anual de Quitação de Débitos',
			icon: 'img/ico_dec_anu.png'
		});

		menu.items.push({
			url: 'javascript:parcelamento(this)',
			label: 'Histórico de Parcelamentos',
			icon: 'img/historico-parcelamento.png'
		});

		if (false) {
			menu.items.push({
				url: 'javascript:debitoAutomatico(this)',
				label: 'Solicitação de Débito Automático',
				icon: 'img/solicitacao-debito.png'
			});
		}
	}

	menu.items.push({
		url: 'javascript:updateCadastro(this)',
		label: 'Alteração Cadastral',
		icon: 'img/alteracao-cadastral.png'
	});
	menu.items.push({
		url: 'javascript:updateVencimento(this)',
		label: 'Alteração de Data de Vencimento',
		icon: 'img/alteracao-vencimento.png'
	});
	menu.items.push({
		url: 'javascript:faturaEmail(this)',
		label: 'Solicitação de entrega de fatura por email',
		icon: 'img/solicitacao-email.png'
	});


	menu.items.push({
		url: 'javascript:showServicos(this)',
		label: 'Meus Serviços',
		icon: 'img/ico_tabela_servicos.png'
	});
	menu.items.push({
		url: 'javascript:showCronograma(this)',
		label: 'Cronograma de Obras',
		icon: 'img/ico_cronograma_obras.png'
	});
	menu.items.push({
		url: 'javascript:showLocais(this)',
		label: 'Onde Pagar sua Conta',
		icon: 'img/ico_onde_pagar.png'
	});
	menu.items.push({
		url: 'javascript:showContato(this)',
		label: 'Contatos',
		icon: 'img/ico_contatos.png'
	});
	if (false) {
		menu.items.push({
			url: 'javascript:showCustom(this,"BI de Riscos","http://10.156.4.150/bifoz/Dashboards/Indicadores%20de%20Riscos/Vis%C3%A3o%20Global.aspx")',
			label: 'Indicadores',
			icon: 'img/ico_historico_consumo.png'
		});
		menu.items.push({
			url: 'javascript:showCustom(this,"PI","https://foz-pic01-dc.odebrecht.net/Coresight/#/PBDisplays/185")',
			label: 'PI',
			icon: 'img/ico_historico_consumo.png'
		});
		menu.items.push({
			url: 'javascript:showCustom(this,"TSSAN","http://www.tssan.com")',
			label: 'TSSAN',
			icon: 'img/ico_historico_consumo.png'
		});
	}
	loadUser();
}

function showCustom(a, t, u) {
	window.af.ui.showMask();
	$('#title-Tmpl').html(t);
	$('#Tmpl-cont').html("<iframe width='100%' height='768px' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' src='" + u + "'></iframe>");
	$('#Tmpl-cont').css("display", "block");
	jumpTo("#uib_page_Tmpl", a);

}


function printDoc() {


	var t = $('#print');

	if (isTotem()) {
		eval(t[0].attributes.method.nodeValue);

	} else {
		t.print({
			addGlobalStyles: true,
			stylesheet: null,
			rejectWindow: true,
			noPrintSelector: '.no-print',
			iframe: true,
			append: null,
			prepend: null
		});
	}

}

(function ($) {
	$.fn.noClickDelay = function () {
		var $wrapper = this;
		var $target = this;
		var moved = false;
		$wrapper.bind('touchstart mousedown', function (e) {
			e.preventDefault();
			moved = false;
			$target = $(e.target);
			if ($target.nodeType == 3) {
				$target = $($target.parent());
			}
			$target.addClass('pressed');
			$wrapper.bind('touchmove mousemove', function (e) {
				moved = true;
				$target.removeClass('pressed');
			});
			$wrapper.bind('touchend mouseup', function (e) {
				$wrapper.unbind('mousemove touchmove');
				$wrapper.unbind('mouseup touchend');
				if (!moved && $target.length) {
					$target.removeClass('pressed');
					$target.trigger('click');
					$target.focus();
				}
			});
		});
	};
})(jQuery);


var clicked = false;

function jumpTo(href, a) {

	//	if (isTotem()) {

	if (clicked) {
		window.af.ui.hideMask();
		return;
	}
	clicked = true;
	setTimeout(function () {
		clicked = false;
	}, 200);
	//	}

	is_menu = false;
	is_login = false;
	$('.tmp').hide();
	$('.tmp').css("z-index", -100);
	$("#bt-print").hide();

	$("#bt-sa").hide();
	$("#bt-ua").hide();
	$("#bt-pag").hide();
	$("#bt-val").hide();

	back_store = {
		item: href,
		anchor: a
	};
	var ef = 'pop';
	if (isTotem())
		ef = 'slide';

	window.af.ui.loadContent(href, null, 0, ef, a);
	// prevent a second click for 2 seconds. :)
	try {
		//if (isTotem()) {
		$('a').live('click', function (e) {
			$(e.target).click(do_nothing);
			setTimeout(function () {
				$(e.target).unbind('click', do_nothing);
			}, 200);
		});
		//	} else {
		//		$('a').noClickDelay();
		//	}
	} catch (e) {}

	window.af.ui.hideMask();
}

function back_page() {
	showMenu(null);
}

function sitefMessage(m) {
	blockPagamento();
	$("#msg").show();
	$("#msgM").html("");
	idleTime = 0;
	$('#expireDiv').hide();

	$("#msgT").show();
	$("#msgT").html("<b>" + m + "</b>");
	$("#msgC").show();
	if (m.toLowerCase().indexOf('transacao') != -1)
		wait(1000);
	if (m.toLowerCase().indexOf('retire') != -1)
		sitef.lock = true;
	if (m.toLowerCase().indexOf('senha') != -1) {
		sitef.slock = true;
		$("#sitef-voltar").hide();
	}

}


function waitForSocketConnection(socket, callback) {
	setTimeout(
		function () {
			if (socket.readyState === 1) {
				console.log("Connection is made")
				if (callback != null) {
					callback();
				}
				return;

			} else {
				console.log("wait for connection...")
				waitForSocketConnection(socket);
			}

		}, 5); // wait 5 milisecond for the connection...
}

function wait(millis) {
	var date = new Date();
	var curDate = null;
	do {
		curDate = new Date();
	}
	while (curDate - date < millis);
}


var sitef = {
	data: {},
	init: function () {
		$("#msgT").html("");
		$("#msgM").html("");
		//create a new WebSocket object.
		this._ws = new WebSocket(local_url.replace('http://', 'ws://')
			.replace('https://', 'wss://') + "/events/"
		);
		this._ws.onopen = sitef.onopen;
		this._ws.onclose = sitef.onclose;
		this._ws.onmessage = sitef.onmessage;
		this._ws.onerror = sitef.onerror;
		this.data = {};



	},
	onerror: function () {
		//sitef.init();
	},
	onopen: function () {},
	send: function (message) {
		if (this._ws && this._ws.readyState === 1) {
			console.log(message);
			this._ws.send(message);
			return true;

		} else {
			showMessage('Sistema de pagamento desativado, contate o administrador!', unblockPagamento());

		}

		return false;
	},
	onmessage: function (m) {
		$('#sitef-voltar').hide();
		if (m.data) {
			console.debug(m.data);
			var s = m.data.split("§");
			var action = s[0];
			var msg = s[1];
			var code = s[3];
			var size = s[4];


			switch (parseInt(action)) {
			case sitefCodes.ERRO:
				showMessage(msg);
				break;
			case sitefCodes.WARNING:
				showMessage(msg);
				break;
			case sitefCodes.CHECK_TICKET:
				$("#msgC").hide();
				var stt = false;
				//stt = eval(printStatus());
				sitefMessage("AGUARDE A IMPRESSAO DO CUPON");
				stt = eval(printCupom(msg));
				stt = stt && eval(printStatusFinish());

				if (stt) {
					//printText(msg);
					finishSitef();
					getRemoteStorage().removeItem('sitef.cupon');
					getRemoteStorage().removeItem('sitef.data');
					getRemoteStorage().removeItem('sitef.hora');



				} else {
					showMessage('Problemas na impressão do Cupon, contate o administrador!');
					var m = {};
					m.action = "verify";
					m.valor = getRemoteStorage().getItem('sitef.data');
					m.tipo = getRemoteStorage().getItem('sitef.cupon');
					m.valor2 = getRemoteStorage().getItem('sitef.hora');

					sitef.send(JSON.stringify(m));


				}
				break;
			case sitefCodes.PRINT_TICKET:
				alert("print >>>" + msg);
				break;
			case sitefCodes.ARMAZENAR:
				//sendResponse("-0");
				break;
			case sitefCodes.MENSAGEM_OPERADOR:
				//if (msg.toLowerCase().indexOf('transacao'))
				sitefMessage(msg);

				break;
				/**
				 * Mensagem para visor do cliente.
				 */
			case sitefCodes.MENSAGEM_CLIENTE:
				sitefMessage(msg);


				break;
				/**
				 * Mensagem para os dois visores.
				 */
			case sitefCodes.MENSAGEM_TODOS:
				$('#sitef-cancel').hide();
				$('#sitef-voltar').hide();
				sitefMessage(msg);


				break;

			case sitefCodes.CABECALHO_MENU:
				sitefMessage(msg);
				break;


			case sitefCodes.REMOVER_CABECALHO_MENU:
				//$('#msgM').html("");
				break;
				/**
				 * Cabeçalho a ser apresentado pela aplicação.
				 */
			case sitefCodes.CABECALHO:
				sitefMessage(msg);

				break;
				/**
				 * Remover cabeçalho.
				 */
			case sitefCodes.REMOVER_CABECALHO:
				//	$('#msgM').html("");

				break;

				/**
				 * Deve obter uma resposta do tipo SIM/NÂO. No retorno o primenro carácter presente em Buffer deve conter 0 se confirma e 1 se cancela.
				 */
			case sitefCodes.RETORNAR_CONFIRMACAO:
				confirmar(msg, function (e) {
					if (e == "1") {
						sendResponse("sitef-sim");

					} else {
						sendResponse("sitef-nao");
					};

				});
				break;

				/**
				 * Deve apresentar um menu de opções e permitir que o usuário selecione uma delas. Na chamada o parâmetro Buffer contém as opções da forma que ele desejar (não sendo necessário incluir os índices 1,2,...) e após a seleção feira pelo usuário,
				 * retornar em Buffer o índice i escolhido pelo operador ( em ASCII )
				 */
			case sitefCodes.MOSTRAR_MENU:
				$("#msgM").html("");
				var mySplitResult = msg.split(";");

				for (i = 0; i < mySplitResult.length; i++) {
					try {
						var mv = mySplitResult[i].split(":");

						var m = mv[1];
						if (m && m.length > 1) {
							var v = mv[0];
							buildMenu(m, 'sendResponse(' + v + ')');
						}
					} catch (e) {}
				}
				break;

				/**
				 * Deve aquardar uma tecla do operador. É utilizada quando se deseja que o operador seja avisado de alguma mensagem apresentada na tela.
				 */
			case sitefCodes.AGUADAR_TECLA_OPERADOR:
				//hideButtons();
				sitefMessage(msg);
				break;

				/**
				 * Este comando indica que a rotina está perguntando para a aplicação se ele deseja interromper o processo de coleta de dados ou não. Esse código ocorre quando a DLL está acessando algum periférico e permite que a automação interrompa esse acesso
				 * (por exemplo: aquardando a passagem de um cartão pela lietora ou a difitração de senha pelo cliente)
				 */
			case sitefCodes.CONFIRMAR_IMTERRUPSAO:

				if (!sitef.lock) {
					$('#sitef-cancel').show();
					$('#sitef-voltar').show();
				}
				if (sitef.slock)
					$('#sitef-voltar').hide();

				break;

				/**
				 * Deve ser lido um campo cujo tamanho está entre Tamanho Minimo e Tamanho Máximo. O campo lido de ser devolvido em Buffer
				 */
			case sitefCodes.LER_CAMPO:
				$('#msgM').html("");
				sitefMessage(msg);
				$('#msgV').show();

				buildInputMenu(msg, 'text', 'sendResponse(' + v + ')', size);
				buildMenu('Continuar', 'postInputValue()');



				break;
				/**
				 * Deve ser lido o número de um cheque. A coleta pode ser feita via leitura de CMC-7 ou pela digutação da primeira linha do cheque. No retorno deve ser devolvido em Buffer "0:" ou "1:" seguido do número coletado manualmente ou pela leitura do
				 * CMC-7, respectivamente. Quando o número for coletado manualmente o formato é o sequinte: Compensação (3), Banco (3), Agencia(4), C1 (1), Conta Conrrente (10), C2 (1), Número do cheque (6), e C3(1), nesta ordem. Notar que estes campos são os
				 * que estão na parte superior de um cheque e na ordem apresentada.
				 */
				// Sugerimos que na coleta seja apresentada uma interface que perminta ao operador indentificar
				// e digitar adequadamente estas informações de forma que a consulta não seja feita com dados errados,
				// retornando como bom um cheque com problemas.
			case sitefCodes.LER_CHEQUE:
				sitefMessage(msg);
				buildInputMenu(msg, 'barcodereader', 'sendResponse(' + v + ')', size);
				buildMenu('Continuar', 'postInputValue()');

				$('#msgV').show();
				break;

				/**
				 * Deve ser lido um campo monetário ou seja, aceita o delimitador de centavos e devolvido no parâmetro Buffer.
				 */
			case sitefCodes.LER_VALOR:
				sitefMessage(msg);
				buildInputMenu(msg, 'money', 'sendResponse(' + v + ')', size);
				buildMenu('Continuar', 'postInputValue()');
				$('#msgV').show();


				break;
				/**
				 * Deve ser lido um código em barras ou o mesmo deve ser coletado manualmente. No retorno Buffer deve conter "0:" ou "1:" sequido do código em barras coletado manualmente ou pela leitora, respectivamente
				 */
			case sitefCodes.LER_CODIGO_DE_BARRAS:
				sitefMessage(msg);
				buildInputMenu(msg, 'barcodereader', 'sendResponse(' + v + ')', size);
				$('#msgV').show();

				break;

			case sitefCodes.REMOVER_MESAGEM_OPERADOR:
				$("#msgT").html("");
				break;
			case sitefCodes.REMOVER_MESAGEM_TODOS:
				$('#sitef-voltar').hide();
				$('#sitef-cancel').hide();
				$("#msgT").html("");

				break;
			case sitefCodes.REMOVER_MESAGEM_CLIENTE:
				$("#msgT").html("");
				break;
			case sitefCodes.FIM:
				finalizaSitef();
				break;
			case sitefCodes.CANCELOU_ABERTA:
				confirmar('O ultimo pagamento neste terminal não foi finalizado corretamente e por isso foi CANCELADO!', function (e) {
					blockAll();
				});
				//wait(100000000000000);
				break;
			case sitefCodes.DATA_FISCAL:
				var am = msg.split(':')
				if (am[1].trim().length == 0) {
					getRemoteStorage().removeItem(am[0]);
				} else {
					getRemoteStorage().setItem(am[0], am[1]);
				}

				break;
			default:
				unblockPagamento();
				break;
			}

		}
	},
	onclose: function (m) {
		sitef.init();
	}
};

function blockAll() {
	sitefMessage("INSIRA SENHA DE DESBLOQUEIO");

	blockPagamento();
	buildInputMenu(msg, 'money', 'sendResponse(10)', '10');

	buildMenu('OK', 'unlockPass()');
	sitef.block = true;
	$('#sitef-cancel').hide();
}

function postInputValue() {
	sendResponse($("#input_menu").val());

}

function unlockPass() {
	try {
		window.clearInterval(interval);
	} catch (e) {}
	if ($("#input_menu").val() == '12344321') {
		var msg = '\nDESTRUIR ESSE CUPON\nCUPON CANCELADO\nCUPON INVALIDO\nREINICIE O TERMINAL APOS O STATUS\n DA IMPRESSORA ESTIVER OK \n';
		initPrint();
		template = loadTemplate('#zCupomHeaderTmpl');
		var data = {};
		data.msg = msg;
		var html = mergeTemplate(template, data);
		initPrint();
		printAppend(html);

		var mySplitResult = msg.split("\n");
		var x = 29;
		for (i = 0; i < mySplitResult.length; i++) {
			printAppendDirect('^FT0,' + x + '^AFN,26,13^FH\^FD' + mySplitResult[i] + '^FS');
			x = x + 26;
		}

		printAppend('^PQ1,0,1,Y^XZ');
		//printText(msg);
		if (finishPrint())
			unblockPagamento();
		getRemoteStorage().removeItem('sitef.cupon');
		getRemoteStorage().removeItem('sitef.data');
		getRemoteStorage().removeItem('sitef.hora');
		interval = setInterval("timerIncrement()", 1000);

	} else {
		showMessage('Senha inválida!');
	}

}

function buildInputMenu(msg, t, value, size) {
	$("#msgM").show();
	$("#msgC").show();
	$('#sitef-cancel').show();
	$('#sitef-voltar').show();
	var s = "";

	if (size && size.trim().length > 0)
		s = " maxlength=\"" + size + "\" ";

	$("#msgM").prepend("<br><input style=\"width:350px !important;\" id=\"input_menu\" class=\"wide-control\"  " + s + "  type=\"money\">");
	if (t === 'money') {
		numKey("#input_menu", size);
	}
	if (t === 'text') {
		//textKey("#input_menu");
		numKey("#input_menu");

	}
}

function cancelaSitef() {
	//confirmar("Confirma cancelar o pagamento?", function (e) {
	//	if (e == "1") {
	var m = {};
	m.action = "cancel";

	sitef.send(JSON.stringify(m));

	$("#msgT").html("");
	$("#msgM").html("");
	unblockPagamento();
	//	} else {
	//		return;
	//	};

	//	});

}

function finalizaSitef() {
	sitefMessage('Finalizando');
	wait(1000);
	unblockPagamento();
	showFaturasPagamento();

}

function finishSitef() {
	var m = {};
	m.action = "finish";
	m.cupon = sitef.cupon;
	sitef.send(JSON.stringify(m));
	finalizaSitef();
}

function voltarSitef() {
	var m = {};
	m.action = "voltar";
	m.cupon = sitef.cupon;
	sitef.send(JSON.stringify(m));
}

function buildMenu(msg, value) {
	$("#msgM").show();
	$("#msgC").show();
	$('#sitef-cancel').show();
	$('#sitef-voltar').show();


	$("#msgM").append("<br><button class=\"alertify-button alertify-button-cancel\" onclick=\"javascript:eval('" + value + "')\"  style=\"height:50px; width:250px ;margin:5px;padding:10px;\" id=\"alertify-cancel\">" + msg + "</button>");


}


function load(url, c) {
	return loadAuth(url, c);
}
$.postJSON = function (url, data, func) {
	$.post(url, data, func, "json");
}

function loadAuth(url, c) {

	if (!checkConnection()) {
		//alert('Erro de conexao');
		return;
	}
	try {
		// RSA signature generation 
		var sig = new KJUR.crypto.Signature({
			"alg": "SHA256withRSA"
		});


		var kp  =  loadAsync('js/TOTEM.pem')

		sig.init(kp);

		var q = "/" + serviceBase + url.split(serviceBase)[1];
		sig.updateString(q);
		var hSigVal = sig.sign();

		url = url + '?';
		//	req.apikey = isTotem() ? "TOTEM" : "MOBILE";
		//	req.signature = hSigVal;
		//	req.timestamp = new Date().getTime();

		//	req.request(c, function (errorCode) {

		if (true) {
			var k = (isTotem() ? "TOTEM" : "MOBILE");
			url = url +
				'apikey=' + k +
				'&signature=' + hSigVal +
				'&timestamp=' + new Date().getTime();

			$.getJSON(url, c);

			return;
		}
		$.ajax({
			type: 'GET',
			url: url,
			async: false,
			jsonp: 'callback',
			contentType: "application/json",
			crossDomain: true,
			dataType: "jsonp",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
			},
			//			beforeSend: function (xhr, settings) {
			//			self.authenticatedRequest = xhr;
			//			xhr.setRequestHeader('Content-type', 'application/json');
			//			xhr.setRequestHeader('apikey', self.apikey);
			//			xhr.setRequestHeader('signature', self.signature);
			//			xhr.setRequestHeader('timestamp', self.timestamp);
			//		},

			data: {
				'Content-type': 'application/json',
				'apikey': isTotem() ? "TOTEM" : "MOBILE",
				'signature': hSigVal,
				'timestamp': new Date().getTime()
			},
			success: c,
			error: function (e) {

				//alert(e.message);
				$.ajax({
					type: 'GET',
					url: url,
					async: false,
					//	jsonpCallback: 'jsonCallback',
					contentType: "application/json",
					crossDomain: true,
					dataType: "jsonp",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
					},
					//			beforeSend: function (xhr, settings) {
					//			self.authenticatedRequest = xhr;
					//			xhr.setRequestHeader('Content-type', 'application/json');
					//			xhr.setRequestHeader('apikey', self.apikey);
					//			xhr.setRequestHeader('signature', self.signature);
					//			xhr.setRequestHeader('timestamp', self.timestamp);
					//		},

					data: {
						'Content-type': 'application/json',
						'apikey': isTotem() ? "TOTEM" : "MOBILE",
						'signature': hSigVal,
						'timestamp': new Date().getTime()
					},
					success: c,
					error: function (e) {

						alert(e.message);
					}
				});


			}
		});

	} catch (e) {
		alert(e);
	}
}

function loadTemplate(q) {
	var t = '';
	t = $(loadAsync('template.html')).filter(q).html();
	return t.replaceAll('$cliente', cliente);
}

function loadAsync(url) {
	return $.ajax({
		type: "GET",
		url: url,
		cache: false,
		async: false
	}).responseText
}

function onBackKeyDown(ex) {
	//alert('back' + $('.ui-page-active').attr('id'));
	if (is_menu) {
		confirmar("Confirma fechar a Agência Virtual?", function (e) {
			if (e == "1") {
				navigator.app.exitApp();
			} else {
				return;
			};

		});
	} else {

		back_page();
	}
}

function showMenu(a) {
	window.clearTimeout(sitef.timeout);

	$('#expireDiv').css({
		top: 200,
		left: 200
	});
	$('#expireDiv').hide();
	var template = loadTemplate('#menuTmpl');
	var html = mergeTemplate(template, menu);
	$('#menu-cont').html(html);
	jumpTo("#uib_page_menu");
	is_menu = true;
	$(window).scrollTop();

}

function showLogin(a) {

	if (pinpadOk()) {
		var m = {};
		m.action = "verify";
		m.valor = getRemoteStorage().getItem('sitef.data');
		m.tipo = getRemoteStorage().getItem('sitef.cupon');
		m.valor2 = getRemoteStorage().getItem('sitef.hora');

		sitef.send(JSON.stringify(m));
	}


	$('#expireDiv').hide();
	try {
		window.af.ui.clearHistory();
	} catch (e) {}
	var template = loadTemplate('#loginTmpl');
	var d = {};
	d.cliente_label = cliente_label;
	d.default_cdc = default_cdc;
	d.default_doc = default_doc;
	var html = mergeTemplate(template, d);
	$('#login-cont').html(html);
	jumpTo("#loginpage", a);
	numKey('#input_doc');
	numKey('#input_cdc');
	is_menu = true;

}

function textKey(inp) {
	if (isTotem()) {
		$(inp).keyboard({
			//	maxLength: 6,
			restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
			useCombos: false, // don't want A+E to become a ligature
			acceptValid: true,
			//validate: function (keyboard, value, isClosing) {
			// only make valid if input is 6 characters in length
			//	return value.length === 6;
			//}
			position: {
				of: null, // null = attach to input/textarea; use $(sel) to attach elsewhere
				my: 'left top',
				at: 'right top',
				at2: 'right top' // used when "usePreview" is false
			}
		});
	}


	//.keyboard({
	//	layout: 'num',
	//	restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
	//	preventPaste: true, // prevent ctrl-v and right click
	//	autoAccept: true
	//});
	//.addTyping();
}


function foneKey(inp) {
	if (isTotem()) {
		$(inp).keyboard({
			layout: 'custom',
			customLayout: {
				'default': [
				'( - )',
				'7 8 9',
				'4 5 6',
				'1 2 3',
					'0',
				'{bksp} {a} {c}'
			]
			},
			//	maxLength: 6,
			restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
			useCombos: false, // don't want A+E to become a ligature
			acceptValid: true,
			//validate: function (keyboard, value, isClosing) {
			// only make valid if input is 6 characters in length
			//	return value.length === 6;
			//}
			usePreview: false,
			autoAccept: true,
			autoAcceptOnEsc: true,
			position: {
				of: null, // null = attach to input/textarea; use $(sel) to attach elsewhere
				my: 'left top',
				at: 'right top',
				at2: 'right top' // used when "usePreview" is false
			}

		});
	}


	//.keyboard({
	//	layout: 'num',
	//	restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
	//	preventPaste: true, // prevent ctrl-v and right click
	//	autoAccept: true
	//});
	//.addTyping();
}



function emailKey(inp) {
	if (isTotem()) {
		$(inp).keyboard({

			display: {
				'bksp': '\u2190',
				'enter': 'return',
				'default': 'ABC',
				'meta1': '.?123',
				'meta2': '#+=',
				'accept': '\u21d3'
			},

			layout: 'custom',
			customLayout: {
				'default': [
			'q w e r t y u i o p {bksp}',
			'a s d f g h j k l {enter}',
			'{s} z x c v b n m @ . {s}',
			'{meta1} {space} _ - {accept}'
		],
				'shift': [
			'Q W E R T Y U I O P {bksp}',
			'A S D F G H J K L {enter}',
			'{s} Z X C V B N M @ . {s}',
			'{meta1} {space} _ - {accept}'
		],
				'meta1': [
			'1 2 3 4 5 6 7 8 9 0 {bksp}',
			'` | { } % ^ * / \' {enter}',
			'{meta2} $ & ~ # = + . {meta2}',
			'{default} {space} ! ? {accept}'
		],
				'meta2': [
			'[ ] { } \u2039 \u203a ^ * " , {bksp}',
			'\\ | / &lt; &gt; $ \u00a3 \u00a5 \u2022 {enter}',
			'{meta1} \u20ac & ~ # = + . {meta1}',
			'{default} {space} ! ? {accept}'
		]
			},
			usePreview: false,
			autoAccept: true,
			autoAcceptOnEsc: true,
			position: {
				of: null, // null = attach to input/textarea; use $(sel) to attach elsewhere
				my: 'left bottom',
				at: 'right bottom',
				at2: 'right bottom' // used when "usePreview" is false
			}

		});
	}


	//.keyboard({
	//	layout: 'num',
	//	restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
	//	preventPaste: true, // prevent ctrl-v and right click
	//	autoAccept: true
	//});
	//.addTyping();
}



function numKey(inp, s) {
	if (!s)
		s = 100;

	if (isTotem()) {
		$(inp).keyboard({
			layout: 'custom',
			customLayout: {
				'default': [
				'7 8 9',
				'4 5 6',
				'1 2 3',
					'0',
				'{bksp} {a} {c}'
			]
			},
			maxLength: s,
			restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
			useCombos: false, // don't want A+E to become a ligature
			acceptValid: true,
			//validate: function (keyboard, value, isClosing) {
			// only make valid if input is 6 characters in length
			//	return value.length === 6;
			//}
			usePreview: false,
			autoAccept: true,
			autoAcceptOnEsc: true,
			position: {
				of: null, // null = attach to input/textarea; use $(sel) to attach elsewhere
				my: 'left top',
				at: 'right top',
				at2: 'right top' // used when "usePreview" is false
			}


		});
	}


	//.keyboard({
	//	layout: 'num',
	//	restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
	//	preventPaste: true, // prevent ctrl-v and right click
	//	autoAccept: true
	//});
	//.addTyping();
}

function showCadastro(a) {
	window.af.ui.showMask();
	var template = loadTemplate('#cadastroTmpl');
	var html = mergeTemplate(template, jQuery.parseJSON(getStorage().getItem('avUser')));
	$('#title-Tmpl').html('Seu Cadastro');
	$('#Tmpl-cont').html(html);
	jumpTo("#uib_page_Tmpl", a);
}

function showDeclaracao(a) {
	window.af.ui.showMask();
	var template = loadTemplate('#declaracaoTmpl');

	var call = [urlMaster, "getDeclaracaoNegativaDebitos", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
        getStorage().getItem('idCidade')
    ];
	var h = call.join('/');
	load(h, function (data) {
		if (!data.retorno) {
			showMessage(data.mensagem);
			return;
		}

		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Declaração Negativa');
		$('#Tmpl-cont').html(html);

		jumpTo("#uib_page_Tmpl", a);
		$("#bt-print").show();
	});
}

function showAnual(a) {
	alertify.prompt("Digite o Ano de sua Declaração", function (e, str) {
		// str is the input text
		if (e && hsg.yearValidation(str)) {
			window.af.ui.showMask();
			var template = loadTemplate('#anualTmpl');
			var call = [urlMaster, "getDeclaracaoAnualQuitacaoDebitos",
						getStorage().getItem('avCdc'),
						getStorage().getItem('avDoc'),
                getStorage().getItem('idCidade'),
                 str
            ];
			var h = call.join('/');
			load(h, function (data) {
				if (!data.retorno) {
					showMessage(data.mensagem);
					return;
				}
				var d = {};
				d.divControl = hsg.divControl;
				$.extend(d, data, data.declaracaoAnualQuitacaoDebitosDTO[0]);
				d.formatReal = function () {
					return hsg.formatMoney(this.valor, 2, "R$ ", ".", ",")
				}
				var html = mergeTemplate(template, d);
				$('#title-Tmpl').html('Quitação de Débitos');
				$('#Tmpl-cont').html(html);
				jumpTo("#uib_page_Tmpl", a);
				$("#bt-print").show();
			});
		}
	}, new Date().getFullYear() - 1);

	numKey('#alertify-text');
}

//setAlteracaoCadastral

function updateCadastro(a, save) {

	window.af.ui.showMask();
	var dto = jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO
	if (!save) //load presentation page
	{
		var call = [urlMaster, "getAutenticacao", getStorage().getItem('avCdc'), getStorage().getItem('avDoc')];
		var h = call.join('/');
		load(h, function (data) {

			var template = loadTemplate('#updateCadastroTmpl');

			var html = mergeTemplate(template, data);
			$('#title-Tmpl').html('Atualização Cadastral');
			$('#Tmpl-cont').html(html);

			if (data.dadosCadastraisDTO.email) {
				$('#email_cli').val(data.dadosCadastraisDTO.email);
			}
			if (data.dadosCadastraisDTO.foneFixo) {
				$('#ffixo_cli').val(data.dadosCadastraisDTO.foneFixo);
			}
			if (data.dadosCadastraisDTO.foneMovel) {
				$('#fmovel_cli').val(data.dadosCadastraisDTO.foneMovel);
			}
			jumpTo("#uib_page_Tmpl", a);
			foneKey('#ffixo_cli');
			foneKey('#fmovel_cli');
			emailKey('#email_cli');

		});
	} else {
		confirmar("Confirma alterar seu cadastro?", function (e) {
			if (e) {
				if ((hsg.isEmpty($('#ffixo_cli').val()))) {

					showMessage("Digite o telefone fixo!");
					return false;
				}
				if ((hsg.isEmpty($('#fmovel_cli').val()))) {

					showMessage("Digite o telefone móvel!");
					return false;
				}
				if ((hsg.isEmpty($('#email_cli').val()))) {

					showMessage("Digite o email");
					return false;
				}

				var call = [urlMaster, "setAlteracaoCadastral",
				getStorage().getItem('avCdc'),
				getStorage().getItem('avDoc'),
            getStorage().getItem('idCidade'),

            dto.loginProprietario,
            $('#ffixo_cli').val(),
            $('#fmovel_cli').val(),
            $('#email_cli').val()
        ];

				var h = call.join('/');
				load(h, function (data) {
					if (data.retornoDTO.retorno) {
						var template = loadTemplate('#comprovanteCadastroTmpl');

						var c = [urlMaster, "getAutenticacao", getStorage().getItem('avCdc'), getStorage().getItem('avDoc')];
						var h1 = c.join('/');
						var dt = JSON.parse(loadAsync(h1));
						getStorage().setItem('avUser', JSON.stringify(dt));

						var data = {};
						$.extend(data, dt.dadosCadastraisDTO, {});
						data.data = hsg.getFullDate();

						var html = mergeTemplate(template, data);





						$('#title-Tmpl').html('Comprovante de Alteração');
						$('#Tmpl-cont').html(html);
						jumpTo("#uib_page_Tmpl", a);
						$("#bt-print").show();
					} else {
						showMessage(data.retornoDTO.mensagem);
					}



				});

			} else {
				window.af.ui.hideMask();
				return;
			}
		});


	}
}

//setDiaVencimento

function updateVencimento(a, save) {
	window.af.ui.showMask();
	if (!save) //load presentation page
	{

		var template = loadTemplate('#updateVencimentoTmpl');
		var callAtual = [urlMaster, "getDiaVencimentoAtual", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
            getStorage().getItem('idCidade')
        ];
		var h = callAtual.join('/');
		var atual = JSON.parse(loadAsync(h));
		var callArr = [urlMaster, "getDiaOpcaoVencimento",
            getStorage().getItem('idCidade')
        ];
		h = callArr.join('/');
		var arrec = JSON.parse(loadAsync(h));
		var data = {};
		$.extend(data, atual, arrec);

		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Vencimento da Fatura');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
		if (data.vencimentoAtualDTO[0].diaVencimentoPadrao) {
			$('#dia_padrao').val(data.vencimentoAtualDTO[0].diaVencimentoPadrao);

		}
		if (data.vencimentoAtualDTO[0].diaVencimentoExcecao) {
			$('#sel_dia').val(data.vencimentoAtualDTO[0].diaVencimentoExcecao);
		} else {
			$('#sel_dia').val(data.vencimentoAtualDTO[0].diaVencimentoPadrao);
		}

		jumpTo("#uib_page_Tmpl", a);


	} else {
		confirmar("Confirma alterar seu dia de vencimento?", function (e) {
			if (e) {
				if ($('#dia_padrao').val() == $('#sel_dia option:selected').val()) {
					showMessage('Altere seu dia de vencimento para outro diferente do Dia Padrão');
					return;
				}
				var call = [urlMaster, "setDiaVencimento",
       getStorage().getItem('avCdc'),
            getStorage().getItem('avDoc'),
			 getStorage().getItem('idCidade'),
            $('#sel_dia option:selected').val()
        ];

				var h = call.join('/');
				load(h, function (data) {
					if (data.vencimentoRetornoDTO.retorno) {
						var template = loadTemplate('#comprovanteDiaTmpl');
						var atual = jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO;
						var callArr = [urlMaster, "getDiaVencimentoAtual",
                 getStorage().getItem('avCdc'), getStorage().getItem('avDoc'), getStorage().getItem('idCidade')
                ];
						var hv = callArr.join('/');
						var arrec = JSON.parse(loadAsync(hv));
						var data = {};
						$.extend(data, atual, arrec);
						data.data = hsg.getFullDate();
						var html = mergeTemplate(template, data);

						var c = [urlMaster, "getAutenticacao", getStorage().getItem('avCdc'), getStorage().getItem('avDoc')];
						var h1 = c.join('/');
						var dt = JSON.parse(loadAsync(h1));
						getStorage().setItem('avUser', JSON.stringify(dt));


						$('#title-Tmpl').html('Comprovante de Alteração');
						$('#Tmpl-cont').html(html);
						jumpTo("#uib_page_Tmpl", a);
						$("#bt-print").show();
					} else {
						showMessage(data.vencimentoRetornoDTO.mensagem);
					}


				});

			} else {
				window.af.ui.hideMask();
				return;
			}
		});

	}
}

//setInclusaoFaturasEmail
function faturaEmail(a, save) {

	var template = loadTemplate('#faturaEmailTmpl');
	window.af.ui.showMask();
	if (!save) //load presentation page
	{

		var callAtual = [urlMaster, "getEmailFaturaOnline", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
            getStorage().getItem('idCidade')
        ];

		var h = callAtual.join('/');
		var atual = JSON.parse(loadAsync(h));

		var html = mergeTemplate(template, atual);
		$('#title-Tmpl').html('Fatura por Email');
		$('#Tmpl-cont').html(html);

		if (jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO.email) {
			$('#email_fat').val(atual.dadosCadastraisDTO[0].email);
		} else {
			showMessage('Seu e-mail precisa ser cadastrado! Atualize na Atualização Cadastral', window.af.goBack);
			return;
		}
		jumpTo("#uib_page_Tmpl", a);

	} else {
		confirmar("Confirma alterar o envio de sua fatura?", function (e) {
			if (e) {
				if ($('#email_fat').val().trim() == '') {
					showMessage('Digite a e-mail');
					$('#email_fat').focus();
					return;
				}
				if ($('#email_c_fat').val().trim() == '') {
					showMessage('Confirme o e-mail');
					$('#email_c_fat').focus();
					return;
				}
				if ($('#email_c_fat').val().trim() != $('#email_fat').val().trim()) {
					showMessage('E-mail e confirmação não conhecidem');
					$('#email_fat').focus();
					return;
				}
				//

				var call = [urlMaster, "setInclusaoFaturasEmail", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
            getStorage().getItem('idCidade'), $('#email_fat').val()
        ];

				var h = call.join('/');
				load(h, function (data) {
					if (data.retornoDTO.retorno) {
						var template = loadTemplate('#comprovanteFaturaTmpl');
						var atual = jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO;
						var callArr = [urlMaster, "getEmailFaturaOnline", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
                    getStorage().getItem('idCidade')
                ];
						var hv = callArr.join('/');
						var arrec = JSON.parse(loadAsync(hv));
						var data = {};
						$.extend(data, atual, arrec);
						data.data = hsg.getFullDate();
						var html = mergeTemplate(template, data);

						$('#title-Tmpl').html('Comprovante de Alteração');
						$('#Tmpl-cont').html(html);
						jumpTo("#uib_page_Tmpl", a);
						$("#bt-print").show();
					} else {
						showMessage(data.retornoDTO.mensagem);
					}

				});

			} else {
				window.af.ui.hideMask();
				return;
			}
		});

	}
}

//  @Path("setDebitoAutomatico/{idLigacao}/{idCidade}/{idArrecadador}/{codAgencia}/{codConta}")
//getDebitoAutomaticoAtual
function debitoAutomatico(a, save) {
	window.af.ui.showMask();
	if (!save) //load presentation page
	{
		var template = loadTemplate('#debitoAutomaticoTmpl');
		var callAtual = [urlMaster, "getDebitoAutomaticoAtual",
            getStorage().getItem('idCidade'), getStorage().getItem('avCdc')
        ];
		var h = callAtual.join('/');
		var atual = JSON.parse(loadAsync(h));
		var callArr = [urlMaster, "getArrecadadores",
            getStorage().getItem('idCidade')
        ];
		h = callArr.join('/');
		var arrec = JSON.parse(loadAsync(h));
		var data = {};
		$.extend(data, atual, arrec);

		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Débito Automático');
		$('#Tmpl-cont').html(html);
		if (data.debitoAutomaticoDTO[0].codigoArrecadador) {
			$('#sel_arr').val(data.debitoAutomaticoDTO[0].codigoArrecadador);
			$('#age_arr').val(data.debitoAutomaticoDTO[0].codigoAgencia);
			$('#conta_arr').val(data.debitoAutomaticoDTO[0].codigoConta);
		}
		jumpTo("#uib_page_Tmpl", a);

	} else {
		confirmar("Confirma alterar seu débito automático?", function (e) {
			if (e) {
				if ($('#age_arr').val().trim() == '') {
					showMessage('Digite a Agência');
					$('#age_arr').focus();
					return;
				}
				if ($('#conta_arr').val().trim() == '') {
					showMessage('Digite a Conta');
					$('#conta_arr').focus();
					return;
				}
				//

				var call = [urlMaster, "setDebitoAutomatico",
            getStorage().getItem('avCdc'),
            getStorage().getItem('idCidade'), $('#sel_arr option:selected').val(), $('#age_arr').val(), $('#conta_arr').val()
        ];

				var h = call.join('/');
				load(h, function (data) {
					if (data.retornoDTO.retorno) {
						var template = loadTemplate('#comprovanteDebitoTmpl');
						var atual = jQuery.parseJSON(getStorage().getItem('avUser')).dadosCadastraisDTO;
						var callArr = [urlMaster, "getDebitoAutomaticoAtual",
            getStorage().getItem('idCidade'), getStorage().getItem('avCdc')
                 ];
						var hv = callArr.join('/');
						var arrec = JSON.parse(loadAsync(hv));
						var data = {};

						var callArrec = [urlMaster, "getArrecadadores",
            getStorage().getItem('idCidade')
        ];
						var ah = callArrec.join('/');
						var arrecad = JSON.parse(loadAsync(ah));
						var ret = arrec.debitoAutomaticoDTO[0];
						ret.arrecadador = _.filter(arrecad.arrecadadorDTO, function (it) {
							return it.id == ret.codigoArrecadador
						})[0].arrecadador;

						$.extend(data, atual, ret);
						data.data = hsg.getFullDate();
						var html = mergeTemplate(template, data);

						$('#title-Tmpl').html('Comprovante de Solicitação');
						$('#Tmpl-cont').html(html);
						jumpTo("#uib_page_Tmpl", a);
						$("#bt-print").show();
					} else {
						showMessage(data.retornoDTO.retorno);
					}
				});

			} else {
				window.af.ui.hideMask();
				return;
			}
		});
	}


}

function cancelaFaturaEmail(a) {
	confirmar("Confirma cancelar seu envio de fatura por e-mail?", function (e) {
		if (e) {

			var call = [urlMaster, "setCancelamentoFaturasEmail"
						,
        getStorage().getItem('avCdc')
												,
        getStorage().getItem('avDoc'),

        getStorage().getItem('idCidade')
    ];

			var h = call.join('/');
			load(h, function (data) {
				// if(data.retornoDTO.retorno)
				showMessage(data.retornoDTO.mensagem);
			});
		} else {
			window.af.ui.hideMask();
			return;
		}
	});
}

//getParcelamento

function parcelamento(a) {
	window.af.ui.showMask();
	var template = loadTemplate('#parcelamentoTmpl');
	var call = [urlMaster, "getParcelamento", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'), getStorage().getItem('idCidade')];
	var h = call.join('/');
	load(h, function (data) {

		if (data.parcelamentoDTO.length == 0) {
			showMessage('Não existem parcelamentos para sua ligação')
			return;
		}


		data.fAcre = function () {
			return hsg.formatMoney(this.valorAcrescimos, 2, "R$ ", ".", ",")
		}
		data.fDeb = function () {
			return hsg.formatMoney(this.valorAcrescimos, 2, "R$ ", ".", ",")
		}
		data.fEnt = function () {
			return hsg.formatMoney(this.valorEntrada, 2, "R$ ", ".", ",")
		}
		data.fFinan = function () {
			return hsg.formatMoney(this.valorFinanc, 2, "R$ ", ".", ",")
		}
		data.fPago = function () {
			return hsg.formatMoney(this.valorPago, 2, "R$ ", ".", ",")
		}
		data.fParcTot = function () {
			return hsg.formatMoney(this.total, 2, "R$ ", ".", ",")
		}
		data.fParcVal = function () {
			return hsg.formatMoney(this.valorParcela, 2, "R$ ", ".", ",")
		}

		data.fParcDt = function () {
			try {
				var t = formatDate(this.dataVencimento);
				if (t == '')
					return "   -  ";

				return t.toString("dd/MM/yyyy");
			} catch (e) {
				return " - ";
			}
		}

		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Meus Parcelamentos');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});
}






function showFaturas(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getConsultaDebitosSegundaVia", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'), getStorage().getItem('idCidade')];
	var h = call.join('/');

	load(h, function (data) {
		var template = loadTemplate('#segundaViaTmpl');
		data.formatReal = function () {
			return hsg.formatMoney(this.valor, 2, "R$ ", ".", ",")
		}
		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('2ª Via');

		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});



}

function unAll() {
	$('.tilefatura').each(
		function (i, f) {
			var img = $("#ck" + f.id)[0];
			img.src = img.src.replace('img-ck', 'img-un');
			f.checked = false;
		}
	);
	sumAndSet()
}


function sumAndSet() {
	$("#sitef-cancel").show();
	var total = 0;
	var prods = "";
	var faturas = "";
	$('#total_pag').attr('prod', prods);
	$('.tilefatura').each(
		function (i, g) {
			var f = $(g);
			if (g.checked) {
				total += parseFloat(f.attr('valor'));
				faturas = faturas + g.id + ",";
				if (prods.length > 0) {
					prods = prods + ";";
				}
				prods = prods + "[Fatura " + f.attr('ref') + ";" + g.id + ";1;" + hsg.formatMoney(parseFloat(f.attr('valor')), 2, "", ".", ",") + "]";
			}

		}
	);
	$('#total_pag').attr('total', total);
	$('#total_pag').attr('prod', prods);
	$('#total_pag').attr('faturas', faturas);
	//[Fatura 1;1;1;100,00];
	$('#total_pag').html(hsg.formatMoney(total, 2, "R$ ", ".", ","))
}


function selAll() {
	$('.tilefatura').each(
		function (i, f) {
			var img = $("#ck" + f.id)[0];
			img.src = img.src.replace('img-un', 'img-ck');
			f.checked = true;
		}
	);
	sumAndSet();
}

function pagamento() {
	if(properties.idCidade !=getStorage().getItem('idCidade'))
	{
	showMessage('A opção de pagamento so esta disponiveis para clientes desta Unidade!');
		return;
	}
	getRemoteStorage().removeItem('sitef.cupon');
	getRemoteStorage().removeItem('sitef.data');
	getRemoteStorage().removeItem('sitef.hora');
	continua_pagamento();

	if (true)
		return;



	if (getRemoteStorage().getItem('sitef.cupon')) {
		confirmar("Já existe uma transacao aberta, deseja reiniciar agora?", function (e) {
			if (e == "1") {
				getRemoteStorage().removeItem('sitef.cupon');
				getRemoteStorage().removeItem('sitef.data');
				getRemoteStorage().removeItem('sitef.hora');
				continua_pagamento();

			} else {
				continua_pagamento();

			};


		});

	} else {
		continua_pagamento();
	}
}

function continua_pagamento() {
	if ($('#total_pag').attr('prod').length === 0) {
		showMessage('Selecione alguma(s) fatura(s) para iniciar o pagamento!');
		return;
	}

	sitef.lock = false;
	sitef.slock = false;

	var cupon = ""; //getWebserviceCuponTSONe
	var op = 'totemAA';
	var vv = hsg.formatMoney($('#total_pag').attr('total'), 2, "", ".", ","); 

	if (getRemoteStorage().getItem('sitef.cupon')) {
		cupon = getRemoteStorage().getItem('sitef.cupon');
	} else {
		if (properties.dev_mode) {
					vv = Math.random() + '';
			cupon = vv.substring(2, 6);
			vv = vv.substring(0, 4);
			vv = '0.01';

		} else {
				cupon = getCupomFiscal();

		}
	}

	sitef.cupon = cupon;
	getRemoteStorage().setItem('sitef.cupon', cupon);
	var m = {};
	m.action = "iniciar";
	m.valor = vv;
	m.valor2 = $('#total_pag').attr('faturas');
	m.valor3 = getStorage().getItem('idCidade');
	m.cupon = cupon;
	m.produtos = $('#total_pag').attr('prod');
	m.operador = op;




	if (
		sitef.send(JSON.stringify(m))) {

		blockPagamento();
	}



	//
}

function unblockPagamento() {
	$.unblockUI();
	sitef.blocked = false;

}

function blockPagamento() {

	if (!sitef.blocked) {
		// something is displayed with an active overlay, hence stop
		sitef.blocked = true;

		var t = $('<div><div id="msg" style="display:none;"> <div id = "msgT"			style="display:none;" > </div> <div id = "msgM"				style = "display:none;" > </div>					  <div id = "msgC" >				<button class = "alertify-button alertify-button-cancel "				onclick = "javascript:cancelaSitef()"				style ="height:50px;width:250px ;margin:5px;padding:10px;"				id = "sitef-cancel" >Cancelar </button>				</div> <br> <div id = "msgV"				style ="display:none;" >				<button id = "sitef-voltar" class = "alertify-button alertify-button-cancel" onclick = "javascript:voltarSitef()"				style = "height:50px; width:250px;margin:5px;padding:10px;"				id = "sitef-voltar" > Voltar </button> <br>				</div></div>');

		//t.appendTo('#bt-sa');

		$.blockUI({
			message: t,
			baseZ: 1000,
			fadeIn: 0,
			css: {
				top: ($(window).height() - 400) / 2 + "px",
				left: ($(window).width() - 400) / 2 + "px",
				width: "400px"
			}
		});
	}
}

function sendResponse(r) {
	var m = {};
	m.action = "response";
	m.valor = r;
	sitef.send(JSON.stringify(m));


}

function toogleTotal(id, valor) {
	var fat = $("#" + id)[0];
	var img = $("#ck" + id)[0];
	if (fat.checked) {
		img.src = img.src.replace('img-ck', 'img-un');
		fat.checked = false;
	} else {
		img.src = img.src.replace('img-un', 'img-ck');
		fat.checked = true;
	}
	sumAndSet();
}

function showFaturasPagamento(a) {
	window.af.ui.showMask();
	sumAndSet();
	//sitef.init();
	var call = [urlMaster, "getConsultaDebitosSegundaVia", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'), getStorage().getItem('idCidade')];
	var h = call.join('/');

	load(h, function (data) {
		var template = loadTemplate('#segundaViaPagamentoTmpl');
		data.formatReal = function () {
			return hsg.formatMoney(this.valor, 2, "R$ ", ".", ",")
		}
		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Pagamento');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);

		$("#bt-sa").show();
		$("#bt-ua").show();
		$("#bt-pag").show();
		$("#bt-val").show();


	});



}

function pts(event) {
	event.preventDefault();
	//	alert("pts " + pagas.event.targetTouches[0].pageX);
	pagas.event = event;
	idleTime = 0;
	$('#expireDiv').hide();
}

function pte(event) {
	event.preventDefault();
	$('#expireDiv').hide();
	var pos = findIndex(pagas.keys, function (x) {
		return x == pagas.active_page
	});
	var page;


	//alert("pte " + event.changedTouches[0].pageX);

	// If there's exactly one finger inside this element
	if (pagas.event.targetTouches[0].pageX < event.changedTouches[0].pageX) {
		pos--;
	} else { //ir
		pos++;
	}
	//voltar
	if (pagas.keys[pos]) {
		page = '#page' + (pagas.keys[pos]);
	}
	if (page)
		show(page);
};


function showContas(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getHistoricoPagamentos", getStorage().getItem('avCdc'),
				getStorage().getItem('avDoc'), getStorage().getItem('idCidade'), 36];
	var h = call.join('/');

	load(h, function (data) {
		var template = loadTemplate('#contasTmpl');

		var g = _.groupBy(data.historicoPagamentosDTO, function (o) {
			return o.periodo.split('/')[1]
		});
		var k = _.keys(g).slice(-3);
		pagas.keys = k;
		var ar = new Array();
		_.each(k, function (v) {
			var o = {};
			o.data = g[v];
			o.label = v;
			ar.push(o);
		});
		var c = {
			'anos': ar
		};
		c.formatReal = function () {
			return hsg.formatMoney(this.valor, 2, "R$ ", ".", ",")
		}
		var html = mergeTemplate(template, c);
		$('#title-Tmpl').html('Contas Pagas');



		$('#Tmpl-cont').html(html);
		// $('.tab .button').width('32%');

		//var obj = document.getElementById('uib_page_pagas');
		//obj.addEventListener('touchend', pte, false);

		//	obj.addEventListener('touchstart', pts, false);

		//	uib_page_Tmpl
		var obj = document.getElementById('uib_page_Tmpl');
		$('#uib_page_Tmpl').noClickDelay();
		obj.addEventListener('touchstart', pts, false);
		obj.addEventListener('touchend', pte, false);




		jumpTo("#uib_page_Tmpl", a);
		//	if (!isTotem()) {
		var tht = loadTemplate('#contas-H-Tmpl');
		//$('af-header-Tmpl').html(ht);
		var ht = mergeTemplate(tht, c);
		$('.sub').html(ht);
		$('.tmp').show();
		$('.tmp').css("z-index", 100);
		//	}
		show('#page' + _.last(k));
	});
}



function showConsumo(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getHistoricoConsumo", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
        getStorage().getItem('idCidade'), 6
    ];
	var h = call.join('/');
	load(h, function (data) {
		var template = loadTemplate('#consumoTmpl');
		var t = {};

		t.color = cliente_cor;
		t.d = data;

		var html = mergeTemplate(template, t);

		$('#title-Tmpl').html('Consumo');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
		$('table.highchart').highchartTable();
	});
}


function showServicos(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getHistoricoSolicitacao", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'), getStorage().getItem('idCidade'), 10];
	var h = call.join('/');
	load(h, function (data) {
		if (data.historicoSolicitacaoDTO.length == 0) {
			showMessage('Não existem serviços para sua ligação')
			return;
		}
		var template = loadTemplate('#servicosTmpl');
		data.getDataAberturaServico = function (a) {
			if (this.dataAberturaServico)
				return (Date.parse(this.dataAberturaServico)).toString("dd/MM/yyyy HH:mm:ss");
			else
				return '';
		}
		data.getPrazoCliente = function (a) {
			if (this.prazoCliente)
				return (Date.parse(this.prazoCliente)).toString("dd/MM/yyyy HH:mm:ss");
			else
				return '';
		}

		data.getDataTerminoExecucaoServico = function (a) {
			if (this.dataTerminoExecucaoServico)
				return (Date.parse(this.dataTerminoExecucaoServico)).toString("dd/MM/yyyy HH:mm:ss");
			else
				return '';
		}

		data.getDataInicioExecucaoServico = function (a) {
			if (this.dataInicioExecucaoServico) {
				return (Date.parse(this.dataInicioExecucaoServico)).toString("dd/MM/yyyy HH:mm:ss");
			} else
				return '';
		}

		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Meus Serviços');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});
}

function formatDate(d) {
	if (!d) {

		return "";
	}

	var dt = "";
	try {
		dt = Date.parse(d.toString().substring(0, 2) + "/" + d.toString().substring(2, 4) + "/" + d.toString().substring(4, 8));

		if (!dt) {
			dt = Date.parse(d.toString().substring(6, 8) + "/" + d.toString().substring(4, 6) + "/" + d.toString().substring(0, 4));
		}
	} catch (e) {
		dt = Date.parse(d.substring(0, 2) + "/" + d.substring(2, 4) + "/" + d.substring(4, 8));

		if (!dt) {
			dt = Date.parse(d.substring(6, 8) + "/" + d.substring(4, 6) + "/" + d.substring(0, 4));
		}

	}
	return dt;
}



function showCronograma(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getWSCronogramaObra", getStorage().getItem('idCidade')];
	var h = call.join('/');
	load(h, function (data) {
		var template = loadTemplate('#cronogramaTmpl');
		data.dataInicioObra = function (a) {
			try {
				if (this.dataInicioPrevisto) {
					return formatDate(this.dataInicioPrevisto)
						.toString("dd/MM/yyyy HH:mm:ss");
				} else {
					return '';
				}
			} catch (e) {
				return '';

			}
		}
		data.dataFimObra = function (a) {
			try {
				if (this.dataFimPrevisto) {
					return formatDate(this.dataFimPrevisto).toString("dd/MM/yyyy HH:mm:ss");
				} else {
					return '';
				}
			} catch (e) {
				return '';

			}
		}
		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Suas Obras');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});
}


function showLocais(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getWSArrecadador", getStorage().getItem('idCidade')];
	var h = call.join('/');
	load(h, function (data) {
		var template = loadTemplate('#locaisTmpl');
		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Locais para Pagamento');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});
}



function showContato(a) {
	window.af.ui.showMask();
	var call = [urlMaster, "getWSAgenciaAtendimento", getStorage().getItem('idCidade')];
	var h = call.join('/');
	load(h, function (data) {
		var template = loadTemplate('#contatosTmpl');
		var html = mergeTemplate(template, data);
		$('#title-Tmpl').html('Contatos');
		$('#Tmpl-cont').html(html);
		jumpTo("#uib_page_Tmpl", a);
	});
}



function show(p) {
	pagas.active_page = (parseInt(p.replace('#page', '')));
	$('.hide').hide();
	$('.active').removeClass('bred');
	$('.active').removeClass('bsilver');
	$('.active').addClass('bsilver');
	$(p + '_active').addClass('bred');
	// jumpTo("#uib_page_pagas",null);
	$(p).show();
}



var getLocation = function () {
	var suc = function (p) {
		alert("geolocation success");
		if (p.coords.latitude != undefined) {
			currentLatitude = p.coords.latitude;
			currentLongitude = p.coords.longitude;
		}
	};
	var fail = function () {
		alert("geolocation failed");
		getLocation();
	};
	intel.xdk.geolocation.getCurrentPosition(suc, fail);
}


var _map = null;
var _seconds = 30;
var _llbounds = null;
var myLatLng;
var oldLatLng = "";
var boolTripTrack = true;
//Create the google Maps and LatLng object 

function drawMap() {
		//Creates a new google maps object
		var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
		myLatLng = latlng;
		var mapOptions = {
			center: latlng,
			zoom: 7,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.LEFT_TOP
			}
		};
		if (boolTripTrack === true) {
			_map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		}
	}
	//40.7655,-73.97204 = NYC
var currentLatitude = "40.713768";
var currentLongitude = "-73.016696";
var options = {
	timeout: 10000,
	maximumAge: 11000,
	enableHighAccuracy: true
};
//Success callback
var suc = function (p) {

	/*  try {
	      
	      if (device.platform.indexOf("Android") != -1) {
	          intel.xdk.display.useViewport(480, 480);
	          document.getElementById("map_canvas").style.width = "480px";
	      } 
	      else if (device.platform.indexOf("iOS") != -1) {
	          if (device.model.indexOf("iPhone") != -1 || device.model.indexOf("iPod") != -1) {
	              intel.xdk.display.useViewport(320, 320);
	              document.getElementById("map_canvas").style.width = "320px";
	          } else if (device.model.indexOf("iPad") != -1) {
	              intel.xdk.display.useViewport(768, 768);
	              document.getElementById("map_canvas").style.width = "768px";
	          }
	      }
	      if (device.platform.indexOf("Win") != -1) {
	          document.getElementById("map_canvas").style.width = screen.width + "px";
	          document.getElementById("map_canvas").style.height = screen.height + "px";
	      }
	      if (navigator.geolocation !== null) {
	          document.getElementById("map_canvas").style.height = screen.height + "px";
	          navigator.geolocation.watchPosition(suc, fail, options);
	      }
	  } catch (e) {
	  */
	try {
		document.getElementById("map_canvas").style.width = screen.width + "px";
		document.getElementById("map_canvas").style.height = (screen.height - 40) + "px";
	} catch (e) {}
	//}

	console.log("geolocation success", 4);
	//Draws the map initially
	if (_map === null) {
		currentLatitude = p.coords.latitude;
		currentLongitude = p.coords.longitude;
		drawMap();
	} else {
		myLatLng = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
	}
	//Creates a new google maps marker object for using with the pins
	//if ((myLatLng.toString().localeCompare(oldLatLng.toString())) !== 0) {
	//Create a new map marker
	var Marker = new google.maps.Marker({
		position: myLatLng,
		map: _map
	});
	if (_llbounds === null) {
		//Create the rectangle in geographical coordinates
		_llbounds = new google.maps.LatLngBounds(new google.maps.LatLng(p.coords.latitude, p.coords.longitude)); //original
	} else {
		//Extends geographical coordinates rectangle to cover current position
		_llbounds.extend(myLatLng);
	}
	//Sets the viewport to contain the given bounds & triggers the "zoom_changed" event
	_map.setCenter(Marker.getPosition());
	_map.setZoom(50);
	_map.panTo(Marker.position);

	//_map.fitBounds(_llbounds);


	//}
	oldLatLng = myLatLng;
};



var fail = function () {
	console.log("Geolocation failed. \nPlease enable GPS in Settings.", 1);
};
var getLocation = function () {
	console.log("in getLocation", 4);
};
//Execute when the DOM loads  


function showMapa(latitude, longitude, a) {
	if (!validLatLong(latitude) || !validLatLong(longitude)) {
		showMessage('Latitude e Longitude informada incorretas, impossivel localizar no mapa!');
		return;
	}
	_map = null;
	var template = loadTemplate('#mapaTmpl');
	var html = mergeTemplate(template, data);
	$('#title-Tmpl').html('Mapa');
	$('#Tmpl-cont2').html(html);
	jumpTo("#uib_page_Tmpl2", a);


	window.af.ui.showMask();
	var data = {};
	data.coords = {};
	data.coords.latitude = latitude;
	data.coords.longitude = longitude;
	suc(data);
	window.af.ui.hideMask();
}




function generateBarcode(d) {

	var text = d.fatura.codBar;

	var settings = {
		output: 'css',
		bgColor: '#FFFFFF',
		color: '#000000',
		barWidth: 1,
		barHeight: 50,
		moduleSize: 5,
		posX: 0,
		posY: 0,
		addQuietZone: 1
	};


	$("#output").show().barcode(text, 'code128', settings);
	return;

	var elt = 'interleaved2of5';


	// text = '826500000003307238473127700000015367141015164116';
	var altx = null;
	//includecheck
	var opts = 'height=0.5 includetext includecheckintext';
	var bw = new BWIPJS;

	// Convert the options to a dictionary object, so we can pass alttext with
	// spaces.
	var tmp = opts.split(' ');
	opts = {};

	for (var i = 0; i < tmp.length; i++) {
		if (!tmp[i])
			continue;
		var eq = tmp[i].indexOf('=');
		if (eq == -1)
			opts[tmp[i]] = bw.value(true);
		else
			opts[tmp[i].substr(0, eq)] = bw.value(tmp[i].substr(eq + 1));
	}

	// Add the alternate text
	if (altx)
		opts.alttext = bw.value(altx);

	// Add any hard-coded options isEmpty to fix problems in the javascript
	// emulation. 
	// opts.inkspread = bw.value(0.5);
	//if (needyoffset[elt.sym] && !opts.textxalign && !opts.textyalign &&
	//   !opts.alttext && opts.textyoffset === undefined)
	opts.textyoffset = bw.value(-10);

	/*
	    var rot  = 'N';
	    var rots = [ 'rotL', 'rotR', 'rotI' ];
	    for (var i = 0; i < rots.length; i++) {
	        if (document.getElementById(rots[i]).checked) {
	            rot = rots[i].charAt(3);
	            break;
	        }
	    }
	*/
	bw.bitmap(new Bitmap);

	bw.scale(0.6, 2);
	bw.setlinewidth(0.2);

	var div = document.getElementById('output');
	if (div)
		div.innerHTML = '';

	bw.push(text);
	bw.push(opts);

	bw.call(elt);
	var canvas = document.getElementById('canvas');
	bw.bitmap().show('canvas', 'N');
	$('#output').html("<img src='" + canvas.toDataURL() + "'/>");
	$('#canvas').hide();


	return;


}

function getCupomFiscal() {

	var url = urlMaster + '/' + 'getCupom/' + getStorage().getItem('idCidade');
	var t = JSON.parse(loadAsync(url));
	if(t.message)
		showMessage(t.message);
	return t.cupomFiscal;
}

function showFatura(id, anchor, paga) {
	if(paga)
		$('#title-Tmpl').html('Conta Paga');
	else
		$('#title-Tmpl').html('2ª Via de Fatura');
	if (isTotem()) {
		var url = urlMaster + '/' + 'getDadosFatura/' + getStorage().getItem('avCdc') + '/' + getStorage().getItem('avDoc') + '/' + getStorage().getItem('idCidade') + '/' + id
		window.af.ui.showMask();
		var template = loadTemplate('#faturaTmpl');
		var igr = -1;
		var grT = 0;

		load(url, function (data) {
			var sorted = _.sortBy(data.colFaturaDetalhe, function (it) {
				return Math.sin(it.idGrupoReceita);
			});
			sorted = _.filter(sorted, function (it) {
				return it.exibirFatura
			});

			var idfatLast = _.last(sorted);
			data.colFaturaDetalhe = sorted;
			var d = {
				fatura: data
			};
			d.paga = !paga;
			
			d.formatReal = function () {
			this.valorTotalFatura =this.valorTotalFatura.replaceAll(',','.');
				return hsg.formatMoney(this.valorTotalFatura, 2, "R$ ", ".", ",")
			};

			d.formatRealDetalhe = function () {
				return hsg.formatMoney(this.colFaturaDetalhe.valor, 2, "R$ ", ".", ",")
			};


			d.totalGrupoReceita = function () {

				if (igr == -1)
					igr = this.idGrupoReceita;


				if (this.idGrupoReceita != igr) {
					var r = '<div class="div-table-row"                     style="width:7.6cm!important" >                     <div class="div-table-col"                     style="width:100%;text-align:left;"> <div style="width:50%;float:left;text-align:left;">    <b>    TOTAL </b>: </div><div style="width:50%;float:right;text-align:right;"> <b>  ' + hsg.formatMoney(grT, 2, "R$ ", ".", ",") + '</b> </div> </div> </div> <br> ';

					igr = this.idGrupoReceita;
					grT = this.valor;
					return r;


				} else {
					igr = this.idGrupoReceita;
					grT = grT + this.valor;
				}

			};
			d.totalGrupoReceitaLast = function () {



				if (this === idfatLast) {
					//grT = grT+ this.valor;
					var r = '<div class="div-table-row"                     style="width:7.6cm!important" >                     <div class="div-table-col"                     style="width:100%;text-align:left;"> <div style="width:50%;float:left;text-align:left;">                <b>    TOTAL </b>: </div><div style="width:50%;float:right;text-align:right;"> <b>  ' + hsg.formatMoney(grT, 2, "R$ ", ".", ",") + '</b> </div> </div> </div> <br>';
					return r;
				}


			};


			var html = mergeTemplate(template, d);


			
			$('#Tmpl-cont2').html(html);
			jumpTo("#uib_page_Tmpl2", anchor);
			$("#bt-print").show();
			if (!paga)
				generateBarcode(d);
		});




	} else {
		var url = urlMaster + '/' + 'getFatura/' + getStorage().getItem('avCdc') + '/' + getStorage().getItem('avDoc') + '/' + getStorage().getItem('idCidade') + '/' + id
		showPdf(url, id, anchor);
	}
}

function hm(w) {
	window.af.ui.hideMask();
	w.focus();
}

function showPdf(url, idfatura, a) {

	//cordova.exec(success, failure, "OpenFileNative", "openFileNative", [urlMaster + '/' + url]);

	try {
		var app = new Application();
		app.run(url, idfatura);

	} catch (e)

	{
		window.open(url, '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');




	}

	/*

		try {
			intel.xdk.device.showRemoteSite(url, 0, 20, 30, 30);
		} catch (e) {

			try {
				var win = window.open('https://docs.google.com/viewer?print=true&url=' + url, '_blank', 'location=yes');
				window.af.ui.hideMask();
			} catch (e) {
				window.open(urlMaster + '/' + url, '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
			}

	*/
	//win.print();
	//window.af.ui.hideMask();
	//  var success = function () {
	//console.log("success!");
	//}, failure = function (error) {
	//console.log(error);
	//};

	//  return ;



	//}
}

function timerIncrement() {
	idleTime = idleTime + 1;

	// if user has been idle for the idlemin time do this - show warning message.
	if (idleTime >= idlemin && idleTime < idlemax) {

		countdown = (idlemax - idleTime); //use a countdown to show user how long they have 
		$('#currentSeconds').html(countdown);

		// Show the warning along with a countdown timer
		if ($('#expireDiv').css('display') != 'block') {

			// Fade in the Popup and add close button
			$('#expireDiv').fadeIn()

			$('#fade').fadeIn(); // Fade in the fade layer 
			return false;
		}

	} else if (idleTime >= idlemax) {
		// User has been idle too long - they've exceeded idlemax time.
		// so take another action
		// in this example we simply send them back to the homepage with a logout flag
		cancelaSitef();
		sendResponse("0");

		window.location.href = '/?logout';
	}

}


function login() {
	window.af.ui.showMask();

	if ($('#input_doc').val() == "") {
		showMessage('Digite o CPF/CNPJ!', 'Erro', 'OK');
		$('#input_doc').focus();
		window.af.ui.hideMask();
		return;
	}
	if ($('#input_cdc').val() == "") {
		showMessage('Digite o Cdc!', 'Erro', 'OK');
		$('#input_cdc').focus();
		window.af.ui.hideMask();

		return;
	}
	var call = [urlMaster, "getAutenticacao", $('#input_cdc').val(), $('#input_doc').val()];
	var h = call.join('/');
	load(h, function (data) {
		window.af.ui.hideMask();

		if (data.dadosCadastraisDTO.autenticado) {
			if (isTotem()) {
				interval = setInterval("timerIncrement()", 1000);
			}
			getStorage().setItem('avUser', JSON.stringify(data));
			getStorage().setItem('avCdc', $('#input_cdc').val());
			getStorage().setItem('avDoc', $('#input_doc').val());
			getStorage().setItem('idCidade', data.dadosCadastraisDTO.idCidade);
			$('#nomeCliente').html(data.dadosCadastraisDTO.cliente);
			$('#nomeCidade').html(data.dadosCadastraisDTO.cidade);

			if (!validaAtulizacao(data)) {
				confirmar("Seu cadastro esta incompleto, deseja completa-lo agora?", function (e) {
					if (e == "1") {
						updateCadastro(null, false);
					} else {
						showMenu();
					};


				});
			} else {

				showMenu();
			}
		} else {
			showMessage(data.dadosCadastraisDTO.mensagem);
			$('#input_cdc').focus();
			return;
		}
	});
}

function validaAtulizacao(data) {

	if (true)
		return true;

	if (!data.dadosCadastraisDTO.email)
		return false;

	if (!data.dadosCadastraisDTO.foneFixo)
		return false;
	if (!data.dadosCadastraisDTO.foneMovel)
		return false;
	return data.dadosCadastraisDTO.email == '' ||

		data.dadosCadastraisDTO.foneFixo == '' ||

		data.dadosCadastraisDTO.foneMovel == '';

}

function showMessage(m, call) {


	if (m)
		if (m.trim().length == 0)
			return;

	try {
		navigator.notification.alert(m, function () {}, 'Atenção', 'OK');
		navigator.notification.vibrate();


	} catch (e) {
		try {
			var back = function () {
				window.af.ui.hideMask();
			}
			if (call)
				back = call;
			alertify.set({
				buttonReverse: true
			}); // true, false
			alertify.alert(m, function () {});
		} catch (e1) {
			alert(m);

		}
	}
	window.af.ui.hideMask();
}

function confirmar(m, call) {
	window.af.ui.hideMask();
	try {
		//document.addEventListener('intel.xdk.notification.confirm', call, false);
		navigator.notification.confirm(m, call, "Confirme", "Sim,Não");
	} catch (e) {
		if (isTotem()) {
			alertify.set({
				buttonReverse: true
			}); // true, false
			alertify.confirm(m, call);
		} else {
			var r = confirm(m);
			call.call(r, r);
		}
	}
}



function findIndex(arr, cond) {
	var i, x;
	for (i in arr) {
		x = arr[i];
		if (cond(x)) return parseInt(i);
	}
}


function onDeviceReady() {

	window.af.ui.autoLaunch = false;
	window.af.animateHeaders = false;
	window.af.ui.launch();
	document.addEventListener("backbutton", onBackKeyDown, false);
	history.back = onBackKeyDown;




}

function do_nothing() {
	return false;
}

function printAlteracaoVencimento(a, b, c, d, e) {

	initPrint();
	template = loadTemplate('#zCupomHeaderTmpl');
	var data = {};
	var html = mergeTemplate(template, data);
	initPrint();
	printAppend(html);

	var x = 30;
	var inc = 40;

	printAppendDirect('^FT100,' + x + '^A0N,37,36^FH\^FD' + 'COMPROVANTE DE ALTERA_80_C7O' + '^FS');
	x = x + inc;
	printAppendDirect('^FT200,' + x + '^A0N,37,36^FH\^FD' + 'DE VENCIMENTO' + '^FS');
	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;



	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Ligacao:' + '^FS');
	printAppendDirect('^FT140,' + x + '^AFN,26,13^FH\^FD' + a + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Solicitante:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + b + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Data:' + '^FS');
	printAppendDirect('^FT90,' + x + '^AFN,26,13^FH\^FD' + c + '^FS');

	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Data Vencto Padr:' + '^FS');
	printAppendDirect('^FT280,' + x + '^AFN,26,13^FH\^FD' + d + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Data Novo Vencto:' + '^FS');
	printAppendDirect('^FT280,' + x + '^AFN,26,13^FH\^FD' + e + '^FS');

	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'TOTEM AUTOATENDIMENTO' + '^FS');
	printAppend('^PQ1,0,1,Y^XZ');

	finishPrint();


}

function printAlteracaoCadastral(a, b, c, d, e, f) {

	initPrint();
	template = loadTemplate('#zCupomHeaderTmpl');
	var data = {};
	var html = mergeTemplate(template, data);
	initPrint();
	printAppend(html);
	var x = 30;
	var inc = 40;
	printAppendDirect('^FT100,' + x + '^A0N,37,36^FH\^FD' + 'COMPROVANTE DE ALTERA_80_C7O' + '^FS');
	x = x + inc;
	printAppendDirect('^FT200,' + x + '^A0N,37,36^FH\^FD' + 'CADASTRAL' + '^FS');
	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;


	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Ligacao:' + '^FS');
	printAppendDirect('^FT170,' + x + '^AFN,26,13^FH\^FD' + a + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Consumidor:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + b + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Data:' + '^FS');
	printAppendDirect('^FT90,' + x + '^AFN,26,13^FH\^FD' + c + '^FS');

	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Fone Fixo:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + d + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Fone Movel:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + e + '^FS');

	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'E-mail:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + f + '^FS');

	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'TOTEM AUTOATENDIMENTO' + '^FS');
	printAppend('^PQ1,0,1,Y^XZ');

	finishPrint();


}

function printFaturaEmail(a, b, c, d) {

	initPrint();
	template = loadTemplate('#zCupomHeaderTmpl');
	var data = {};
	var html = mergeTemplate(template, data);
	initPrint();
	printAppend(html);
	var x = 30;
	var inc = 40;
	printAppendDirect('^FT50,' + x + '^A0N,37,36^FH\^FD' + 'COMPROVANTE DE SOLICITA_80_C7O' + '^FS');
	x = x + inc;
	printAppendDirect('^FT20,' + x + '^A0N,37,36^FH\^FD' + 'DE ENVIO DE FATURA POR E-MAIL' + '^FS');
	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;

	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Ligacao:' + '^FS');
	printAppendDirect('^FT170,' + x + '^AFN,26,13^FH\^FD' + a + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Consumidor:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + b + '^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'Data:' + '^FS');
	printAppendDirect('^FT90,' + x + '^AFN,26,13^FH\^FD' + c + '^FS');

	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'E-mail:' + '^FS');
	printAppendDirect('^FT200,' + x + '^AFN,26,13^FH\^FD' + d + '^FS');

	x = x + inc;
	printAppendDirect('^FO2,' + x + '^GB620,0,1^FS');
	x = x + inc;
	printAppendDirect('^FT10,' + x + '^AFN,26,13^FH\^FD' + 'TOTEM AUTOATENDIMENTO' + '^FS');
	printAppend('^PQ1,0,1,Y^XZ');

	finishPrint();


}

function printCupom(msg) {
	msg = msg.substring(2);
	initPrint();
	template = loadTemplate('#zCupomHeaderTmpl');
	var data = {};
	data.msg = msg;
	var html = mergeTemplate(template, data);
	initPrint();
	printAppend(html);

	var mySplitResult = msg.split("\n");
	var x = 29;
	for (i = 0; i < mySplitResult.length; i++) {
		printAppendDirect('^FT0,' + x + '^AFN,26,13^FH\^FD' + mySplitResult[i] + '^FS');
		x = x + 26;
	}

	printAppend('^PQ1,0,1,Y^XZ');





	//printText(msg);
	return true;

}

function printFatura(idFatura) {
	initPrint();

	printAppend(loadTemplate('#zDecNegTmpl'));

	return finishPrint();
}


function printDeclaracaoNegativa(id) {


	window.af.ui.showMask();
	var call = [urlMaster, "getDeclaracaoNegativaDebitos", getStorage().getItem('avCdc'), getStorage().getItem('avDoc'),
        getStorage().getItem('idCidade')
    ];


	var template = loadTemplate('#zDecNegTmpl');
	var url = call.join('/');


	load(url, function (data) {

		var html = mergeTemplate(template, data);
		initPrint();
		printAppend(html);
		finishPrint();

	});

}


function printDeclaracaoAnual(id) {
	window.af.ui.showMask();
	var call = [urlMaster, "getDeclaracaoAnualQuitacaoDebitos",
						getStorage().getItem('avCdc'),
						getStorage().getItem('avDoc'),
                getStorage().getItem('idCidade'),
                 id
            ];
	var url = call.join('/');



	var template = loadTemplate('#zDecQuiTmpl');


	load(url, function (data) {
		var d = data.declaracaoAnualQuitacaoDebitosDTO[0];
		d.declaracaoAnualQuitacaoDebitosDTO = data.declaracaoAnualQuitacaoDebitosDTO;

		d.x = 893;
		d.printX = function () {
			return d.x;
		};

		d.addLine = function () {
			d.x = d.x + 35;
		};
		d.addSpace = function () {
			d.x = d.x + 10;
		};

		d.formatMoney = function (vv) {
			return hsg.formatMoney(vv, 2, "R$ ", ".", ",");
		}

		var html = mergeTemplate(template, {
			declaracao: d
		});
		initPrint();
		printAppend(html);
		finishPrint();

	});

}


function printSegundaVia(id,pg) {

	var url = urlMaster + '/' + 'getDadosFatura/' + getStorage().getItem('avCdc') + '/' + getStorage().getItem('avDoc') + '/' + getStorage().getItem('idCidade') + '/' + id
	window.af.ui.showMask();
	var template = loadTemplate('#zFaturaTmpl');
	var igr = -1;
	var grT = 0;

	load(url, function (data) {
		var sorted = _.sortBy(data.colFaturaDetalhe, function (it) {
			return Math.sin(it.idGrupoReceita);
		});
		sorted = _.filter(sorted, function (it) {
			return it.exibirFatura
		});

		var idfatLast = _.last(sorted);
		data.colFaturaDetalhe = sorted;
		var d = {
			fatura: data
		};

		d.paga = pg;
		d.formatReal = function () {
							this.valorTotalFatura =  this.valorTotalFatura.replaceAll(',','.');

			return hsg.formatMoney(this.valorTotalFatura, 2, "R$ ", ".", ",")
		};
		
	
		d.formatRealDetalhe = function () {
			return hsg.formatMoney(this.valor, 2, "R$ ", ".", ",")
		};

		d.totalGrupoReceita = function () {

			if (igr == -1)
				igr = this.idGrupoReceita;


			if (this.idGrupoReceita != igr) {
				var r = 'TOTAL : ' + hsg.formatMoney(grT, 2, "R$ ", ".", ",") ;
				igr = this.idGrupoReceita;
				grT = this.valor;
				return r.trim();
			} else {
				igr = this.idGrupoReceita;
				grT = grT + this.valor;
			}

		};
		d.totalGrupoReceitaLast = function () {

			if (this === idfatLast) {
				//grT = grT+ this.valor;
				var r =  'TOTAL : ' + hsg.formatMoney(grT, 2, "R$ ", ".", ",");
				return r.trim();
			}
		};
		

		
		addZebraServices(d);
		
		var html = mergeTemplate(template, d);
		initPrint();
		printAppend(html);
		finishPrint();

	});

}

function addZebraServices(d)
{
		d.x = 1670;
		d.setX = function(){
		return function(xv,render)
		{
			d.x =  xv;
		}
		}
	
		d.printX = function () {
			return d.x;
		};
		d.addLine = function () {
			d.x = d.x + 35;
		};
		d.addSpace = function () {
			d.x = d.x + 10;
		};
		
				d.printYLB = function()
		{
		return function(v,render)
		{
			return 600 - (12 * v.length);
		};
		}
		d.printYL = function()
		{
		return function(v,render)
		{
			return 600 - (14 * v.length);
		};
		}
		
		d.trunc = function(){
			if(this.rubricaResumida.length > 30)
				this.rubricaResumida = this.rubricaResumida.substring(0,30);
			return this.rubricaResumida;
		
		}
}

function printAppendDirect(s) {

	var call = [local_service_url, 'zebra-print', "append", encodeURIComponent(s)];
	var h = call.join('/');
	loadAsync(h);

}

function printAppend(s) {
	var mySplitResult = s.split("\n");
	for (i = 0; i < mySplitResult.length; i++) {
		try {
			var mv = mySplitResult[i] + "\n"
			printAppendDirect(mv);
		} catch (e) {}
	}



}

function printStatus() {

	var call = [local_service_url, 'zebra-print', "status"];
	var h = call.join('/');
	return loadAsync(h);


}

function printStatusFinish() {

	var call = [local_service_url, 'zebra-print', "statusFinish"];
	var h = call.join('/');
	return loadAsync(h);


}


function initPrint() {

	var call = [local_service_url, 'zebra-print', "initPrint"];
	var h = call.join('/');
	loadAsync(h);
}


function printText(s) {
	var call = [local_service_url, 'zebra-print', "appendText", encodeURIComponent(s)];
	var h = call.join('/');
	loadAsync(h);

}



function finishPrint() {

	var call = [local_service_url, 'zebra-print', "print"];
	var h = call.join('/');
	window.af.ui.hideMask();
	return loadAsync(h);



}

function pinpadOk() {
	if (isTotem() && !sitefSuport) {
		try {
			var call = [local_service_url, 'sitef', "pinpad_test"];
			var h = call.join('/');
			sitefSuport = eval(loadAsync(h));
		} catch (e) {
			sitefSuport = false;
		}
	}
	return sitefSuport;
}

$(document).ready(function () {
	document.addEventListener("deviceready", onDeviceReady, false);
});

document.addEventListener("deviceready", onDeviceReady, false);