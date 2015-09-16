/*
 * Please see the included README.md file for license terms and conditions.
 */


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false, app:false, dev:false */
/*global myEventHandler:false, cordova:false, device:false */



window.app = window.app || {}; // there should only be one of these...



// Set to "true" if you want the console.log messages to appear.

app.LOG = true;

app.consoleLog = function () { // only emits console.log messages if app.LOG != false
	if (app.LOG) {
		var args = Array.prototype.slice.call(arguments, 0);
		console.log.apply(console, args);
	}
};



// App init point (runs on custom app.Ready event from init-dev.js).
// Runs after underlying device native code and webview/browser is ready.
// Where you should "kick off" your application by initializing app events, etc.

// NOTE: Customize this function to initialize your application, as needed.

app.initEvents = function () {
	"use strict";
	var fName = "app.initEvents():";
	app.consoleLog(fName, "entry");
	init();
	// NOTE: initialize your third-party libraries and event handlers

	// initThirdPartyLibraryNumberOne() ;
	// initThirdPartyLibraryNumberTwo() ;
	// initThirdPartyLibraryNumberEtc() ;

	// NOTE: initialize your application code

	// initMyAppCodeNumberOne() ;
	// initMyAppCodeNumberTwo() ;
	// initMyAppCodeNumberEtc() ;

	// NOTE: initialize your app event handlers, see app.js for a simple event handler example

	// TODO: configure following to work with both touch and click events (mouse + touch)
	// see http://msopentech.com/blog/2013/09/16/add-pinch-pointer-events-apache-cordova-phonegap-app/

	//...overly simple example...
	//    var el, evt ;
	//
	//    if( navigator.msPointerEnabled || !('ontouchend' in window))    // if on Win 8 machine or no touch
	//        evt = "click" ;                                             // let touch become a click event
	//    else                                                            // else, assume touch events available
	//        evt = "touchend" ;                                          // not optimum, but works
	//
	//    el = document.getElementById("id_btnHello") ;
	//    el.addEventListener(evt, myEventHandler, false) ;

	// NOTE: ...you can put other miscellaneous init stuff in this function...
	// NOTE: ...and add whatever else you want to do now that the app has started...

	app.initDebug(); // just for debug, not required; keep it if you want it or get rid of it
	//app.hideSplashScreen() ;    // after init is good time to remove splash screen; using a splash screen is optional

	// app initialization is done
	// app event handlers are ready
	// exit to idle state and wait for app events...

	app.consoleLog(fName, "exit");
};
document.addEventListener("app.Ready", app.initEvents, false);



// Just a bunch of useful debug console.log() messages.
// Runs after underlying device native code and webview/browser is ready.
// The following is just for debug, not required; keep it if you want or get rid of it.

app.initDebug = function () {
	"use strict";
	var fName = "app.initDebug():";
	app.consoleLog(fName, "entry");

	if (window.device && device.cordova) { // old Cordova 2.x version detection
		app.consoleLog("device.version: " + device.cordova); // print the cordova version string...
		app.consoleLog("device.model: " + device.model);
		app.consoleLog("device.platform: " + device.platform);
		app.consoleLog("device.version: " + device.version);
	}

	if (window.cordova && cordova.version) { // only works in Cordova 3.x
		app.consoleLog("cordova.version: " + cordova.version); // print new Cordova 3.x version string...

		if (cordova.require) { // print included cordova plugins
			app.consoleLog(JSON.stringify(cordova.require('cordova/plugin_list').metadata, null, 1));
		}
	}
	try {
		StatusBar.hide(); //Turns off web view overlay.
	} catch (e) {}
	app.consoleLog(fName, "exit");
};
document.addEventListener("app.Ready", app.initDebug, false);



// Using a splash screen is optional. This function will not fail if none is present.
// This is also a simple study in the art of multi-platform device API detection.

app.hideSplashScreen = function () {
	"use strict";
	var fName = "app.hideSplashScreen():";
	app.consoleLog(fName, "entry");

	// see https://github.com/01org/appframework/blob/master/documentation/detail/%24.ui.launch.md
	// Do the following if you disabled App Framework autolaunch (in index.html, for example)
	// $.ui.launch() ;

	if (navigator.splashscreen && navigator.splashscreen.hide) { // Cordova API detected
		navigator.splashscreen.hide();
	}
	if (window.intel && intel.xdk && intel.xdk.device) { // Intel XDK device API detected, but...
		if (intel.xdk.device.hideSplashScreen) // ...hideSplashScreen() is inside the base plugin
			intel.xdk.device.hideSplashScreen();
	}

	app.consoleLog(fName, "exit");

};


/* @license 
 * jQuery.print, version 1.2.0
 *  (c) Sathvik Ponangi, Doers' Guild
 * Licence: CC-By (http://creativecommons.org/licenses/by/3.0/)
 *--------------------------------------------------------------------------*/

(function ($) {
	"use strict";
	// A nice closure for our definitions

	function getjQueryObject(string) {
		// Make string a vaild jQuery thing
		var jqObj = $("");
		try {
			jqObj = $(string).clone();
		} catch (e) {
			jqObj = $("<span />").html(string);
		}
		return jqObj;
	}

	function isNode(o) {
		/* http://stackoverflow.com/a/384380/937891 */
		return !!(typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
	}


	$.print = $.fn.print = function () {
		// Print a given set of elements

		var options, $this, self = this;

		// console.log("Printing", this, arguments);

		if (self instanceof $) {
			// Get the node if it is a jQuery object
			self = self.get(0);
		}

		if (isNode(self)) {
			// If `this` is a HTML element, i.e. for
			// $(selector).print()
			$this = $(self);
			if (arguments.length > 0) {
				options = arguments[0];
			}
		} else {
			if (arguments.length > 0) {
				// $.print(selector,options)
				$this = $(arguments[0]);
				if (isNode($this[0])) {
					if (arguments.length > 1) {
						options = arguments[1];
					}
				} else {
					// $.print(options)
					options = arguments[0];
					$this = $("html");
				}
			} else {
				// $.print()
				$this = $("html");
			}
		}

		// Default options
		var defaults = {
			globalStyles: true,
			mediaPrint: false,
			stylesheet: null,
			noPrintSelector: ".no-print",
			iframe: true,
			append: null,
			prepend: null
		};
		// Merge with user-options
		options = $.extend({}, defaults, (options || {}));

		var $styles = $("");
		if (options.globalStyles) {
			// Apply the stlyes from the current sheet to the printed page
			$styles = $("style, link, meta, title");
		} else if (options.mediaPrint) {
			// Apply the media-print stylesheet
			$styles = $("link[media=print]");
		}
		if (options.stylesheet) {
			// Add a custom stylesheet if given
			$styles = $.merge($styles, $('<link rel="stylesheet" href="' + options.stylesheet + '">'));
		}

		// Create a copy of the element to print
		var copy = $this.clone();
		// Wrap it in a span to get the HTML markup string
		copy = $("<span/>").append(copy);
		// Remove unwanted elements
		copy.find(options.noPrintSelector).remove();
		// Add in the styles
		copy.append($styles.clone());
		// Appedned content
		copy.append(getjQueryObject(options.append));
		// Prepended content
		copy.prepend(getjQueryObject(options.prepend));
		// Get the HTML markup string
		var content = copy.html();
		// Destroy the copy
		copy.remove();

		var w, wdoc;
		if (options.iframe) {
			// Use an iframe for printing
			try {
				var $iframe = $(options.iframe + "");
				var iframeCount = $iframe.length;
				if (iframeCount === 0) {
					// Create a new iFrame if none is given
					$iframe = $('<iframe height="0" width="0" border="0" wmode="Opaque"/>').prependTo('body').css({
						"position": "absolute",
						"top": -999,
						"left": -999
					});
				}
				w = $iframe.get(0);
				w = w.contentWindow || w.contentDocument || w;
				wdoc = w.document || w.contentDocument || w;
				wdoc.open();
				wdoc.write(content);
				wdoc.close();
				setTimeout(function () {
					// Fix for IE : Allow it to render the iframe
					w.focus();
					try {
						// Fix for IE11 - printng the whole page instead of the iframe content
						if (!w.document.execCommand('print', false, null)) {
							// document.execCommand returns false if it failed -http://stackoverflow.com/a/21336448/937891
							w.print();
						}
					} catch (e) {
						w.print();
					}
					setTimeout(function () {
						// Fix for IE
						if (iframeCount === 0) {
							// Destroy the iframe if created here
							$iframe.remove();
						}
					}, 100);
				}, 250);
			} catch (e) {
				// Use the pop-up method if iframe fails for some reason
				console.error("Failed to print from iframe", e.stack, e.message);
				w = window.open();
				w.document.write(content);
				w.document.close();
				w.focus();
				w.print();
				w.close();
			}
		} else {
			// Use a new window for printing
			w = window.open();
			w.document.write(content);
			w.document.close();
			w.focus();
			w.print();
			w.close();
		}
		return this;
	};

})(jQuery);