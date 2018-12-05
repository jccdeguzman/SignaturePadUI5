sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	var canvas,
		context,
		disableSave,
		pixels,
		cpixels,
		xyLast,
		xyAddLast,
		calculate;
	var me;
	return Controller.extend("com.test.SignatureSample.controller.App", {
		onInit: function () {
			this.getView().byId("html").setContent("<canvas id='signature-pad' height='200' class='signature-pad'></canvas>");
		},

		/******************Signature Pad Draw************************/

		onSign: function (oEvent) {
			me = this;
			canvas = document.getElementById("signature-pad");
			context = canvas.getContext("2d");
			canvas.width = 276;
			canvas.height = 180;
			context.fillStyle = "#fff";
			context.strokeStyle = "#444";
			context.lineWidth = 1.5;
			context.lineCap = "round";
			context.fillRect(0, 0, canvas.width, canvas.height);
			disableSave = true;
			pixels = [];
			cpixels = [];
			xyLast = {};
			xyAddLast = {};
			calculate = false;
			canvas.addEventListener('touchstart', me.on_mousedown, false);
			canvas.addEventListener('mousedown', me.on_mousedown, false);

		},

		/***********Download the Signature Pad********************/

		saveButton: function (oEvent) {
			var canvas = document.getElementById("signature-pad");
			var link = document.createElement('a');
			var link2 = document.createElement('a');

			/* Test only*/
			var doc = new jsPDF();
			doc.text(20, 20, 'hello, I am PDF.');
			doc.text(20, 30, 'i was created in the browser using javascript.');
			doc.text(20, 40, 'i can also be created from node.js');
			doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 15, 40, 180, 160);

			/* Optional - set properties on the document */
			doc.setProperties({
				title: 'A sample document created by pdf.js',
				subject: 'PDFs are kinda cool, i guess',
				author: 'JC',
				keywords: 'JC',
				creator: 'jsPDF'
			});

			doc.addPage();
			doc.setFontSize(22);
			doc.text(20, 20, 'This is a title');
			doc.setFontSize(16);
			doc.text(20, 30, 'This is some normal sized text underneath.');

			var fileName = "testFile" + new Date().getSeconds() + ".pdf";
			var pdfAsDataURI = doc.output('datauri', {
				"fileName": fileName
			});
			
			
			link.href = pdfAsDataURI;
			link.download = 'sign.pdf';
			link.click();
			
			link2.href = canvas.toDataURL('image/jpeg');
			link2.download = 'sign.jpeg';
			link2.click();
			
			
			// var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
			// 	backgroundColor: '#ffffff',
			// 	penColor: 'rgb(0, 0, 0)'
			// })
		},

		/************Clear Signature Pad**************************/

		clearButton: function (oEvent) {
			var canvas = document.getElementById("signature-pad");
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#ffffff',
				penColor: 'rgb(0, 0, 0)',
				penWidth: '1'
			})
		},

		remove_event_listeners: function () {
			canvas.removeEventListener('mousemove', me.on_mousemove, false);
			canvas.removeEventListener('mouseup', me.on_mouseup, false);
			canvas.removeEventListener('touchmove', me.on_mousemove, false);
			canvas.removeEventListener('touchend', me.on_mouseup, false);

			document.body.removeEventListener('mouseup', me.on_mouseup, false);
			document.body.removeEventListener('touchend', me.on_mouseup, false);
		},

		get_coords: function (e) {
			var x, y;

			if (e.changedTouches && e.changedTouches[0]) {
				var offsety = canvas.offsetTop || 0;
				var offsetx = canvas.offsetLeft || 0;

				x = e.changedTouches[0].pageX - offsetx;
				y = e.changedTouches[0].pageY - offsety;
			} else if (e.layerX || 0 == e.layerX) {
				x = e.layerX;
				y = e.layerY;
			} else if (e.offsetX || 0 == e.offsetX) {
				x = e.offsetX;
				y = e.offsetY;
			}

			return {
				x: x,
				y: y
			};
		},

		on_mousedown: function (e) {
			e.preventDefault();
			e.stopPropagation();

			canvas.addEventListener('mouseup', me.on_mouseup, false);
			canvas.addEventListener('mousemove', me.on_mousemove, false);
			canvas.addEventListener('touchend', me.on_mouseup, false);
			canvas.addEventListener('touchmove', me.on_mousemove, false);
			document.body.addEventListener('mouseup', me.on_mouseup, false);
			document.body.addEventListener('touchend', me.on_mouseup, false);

			var empty = false;
			var xy = me.get_coords(e);
			context.beginPath();
			pixels.push('moveStart');
			context.moveTo(xy.x, xy.y);
			pixels.push(xy.x, xy.y);
			xyLast = xy;
		},

		on_mousemove: function (e, finish) {
			e.preventDefault();
			e.stopPropagation();

			var xy = me.get_coords(e);
			var xyAdd = {
				x: (xyLast.x + xy.x) / 2,
				y: (xyLast.y + xy.y) / 2
			};

			if (calculate) {
				var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
				var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
				pixels.push(xLast, yLast);
			} else {
				calculate = true;
			}

			context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
			pixels.push(xyAdd.x, xyAdd.y);
			context.stroke();
			context.beginPath();
			context.moveTo(xyAdd.x, xyAdd.y);
			xyAddLast = xyAdd;
			xyLast = xy;

		},

		on_mouseup: function (e) {
			me.remove_event_listeners();
			disableSave = false;
			context.stroke();
			pixels.push('e');
			calculate = false;
		}
	});
});