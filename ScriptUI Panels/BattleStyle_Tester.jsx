/** ====== About Script ===========
	Example and testing of ScriptUI style options used in Battle Axe tools.

	Copyright 2017 Adam Plouff

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	   http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
**/
// @target aftereffects
//encapsulate the script in a function to avoid global variables

(function (thisObj) {

	//================ VARIABLES ======================
	var scriptName = 'BattleStyle Tester';
	var scriptVersion = '1.1';

	// minified JSON
	var JSON; JSON || (JSON = {}); (function () { function k(a) { return a < 10 ? "0" + a : a } function o(a) { p.lastIndex = 0; return p.test(a) ? '"' + a.replace(p, function (a) { var c = r[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + a + '"' } function l(a, j) { var c, d, h, m, g = e, f, b = j[a]; b && typeof b === "object" && typeof b.toJSON === "function" && (b = b.toJSON(a)); typeof i === "function" && (b = i.call(j, a, b)); switch (typeof b) { case "string": return o(b); case "number": return isFinite(b) ? String(b) : "null"; case "boolean": case "null": return String(b); case "object": if (!b) return "null"; e += n; f = []; if (Object.prototype.toString.apply(b) === "[object Array]") { m = b.length; for (c = 0; c < m; c += 1)f[c] = l(c, b) || "null"; h = f.length === 0 ? "[]" : e ? "[\n" + e + f.join(",\n" + e) + "\n" + g + "]" : "[" + f.join(",") + "]"; e = g; return h } if (i && typeof i === "object") { m = i.length; for (c = 0; c < m; c += 1)typeof i[c] === "string" && (d = i[c], (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h)) } else for (d in b) Object.prototype.hasOwnProperty.call(b, d) && (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h); h = f.length === 0 ? "{}" : e ? "{\n" + e + f.join(",\n" + e) + "\n" + g + "}" : "{" + f.join(",") + "}"; e = g; return h } } if (typeof Date.prototype.toJSON !== "function") Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + k(this.getUTCMonth() + 1) + "-" + k(this.getUTCDate()) + "T" + k(this.getUTCHours()) + ":" + k(this.getUTCMinutes()) + ":" + k(this.getUTCSeconds()) + "Z" : null }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () { return this.valueOf() }; var q = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, p = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, e, n, r = { "\u0008": "\\b", "\t": "\\t", "\n": "\\n", "\u000c": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, i; if (typeof JSON.stringify !== "function") JSON.stringify = function (a, j, c) { var d; n = e = ""; if (typeof c === "number") for (d = 0; d < c; d += 1)n += " "; else typeof c === "string" && (n = c); if ((i = j) && typeof j !== "function" && (typeof j !== "object" || typeof j.length !== "number")) throw Error("JSON.stringify"); return l("", { "": a }) }; if (typeof JSON.parse !== "function") JSON.parse = function (a, e) { function c(a, d) { var g, f, b = a[d]; if (b && typeof b === "object") for (g in b) Object.prototype.hasOwnProperty.call(b, g) && (f = c(b, g), f !== void 0 ? b[g] = f : delete b[g]); return e.call(a, d, b) } var d, a = String(a); q.lastIndex = 0; q.test(a) && (a = a.replace(q, function (a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) })); if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return d = eval("(" + a + ")"), typeof e === "function" ? c({ "": d }, "") : d; throw new SyntaxError("JSON.parse"); } })();

	var icons = {
		copyPasteB4: [
			{ points: "2.71 14.02 0 16.72 2.64 19.36 5.33 16.68 2.71 14.02", fill: "88CCFF" },
			{ points: "9.2 17.73 6.49 20.43 9.13 23.08 11.82 20.39 9.2 17.73", fill: "8800FF" },
			{ points: "4.28 22.03 1.57 24.73 4.21 27.37 6.9 24.69 4.28 22.03", fill: "00CCFF" },
			{ points: "27.01 14.02 24.3 16.72 26.95 19.36 29.63 16.68 27.01 14.02", fill: "88CC00" },
			{ points: "33.5 17.73 30.8 20.43 33.44 23.08 36.12 20.39 33.5 17.73", fill: "88CC88" },
			{ points: "28.58 22.03 25.88 24.73 28.52 27.37 31.2 24.69 28.58 22.03", fill: "FFFFFF" }]
	};

	/**************************************************************************
* Miscellaneous **********************************************************
**************************************************************************/

	/** convert a #ff00ff color string to a normalized RGBA color array
		@parem {hexString} - string - hex string
	*/
	function hexToArray(hexString) {
		var hexColor = hexString.replace('#', '');
		var r = parseInt(hexColor.slice(0, 2), 16) / 255;
		var g = parseInt(hexColor.slice(2, 4), 16) / 255;
		var b = parseInt(hexColor.slice(4, 6), 16) / 255;
		return [r, g, b, 1];
	}

	/** open url in browser
		@parem {url} - string - url
	*/
	function visitURL(url) {
		if ($.os.indexOf("Windows") != -1) {
			system.callSystem('cmd /c "' + Folder.commonFiles.parent.fsName + "\\Internet Explorer\\iexplore.exe" + '" ' + url);
		} else {
			system.callSystem('open "' + url + '"');
		}
	}

	/**************************************************************************
	 * Text Button ************************************************************
	 **************************************************************************/
	function txtDraw() {
		this.graphics.drawOSControl();
		this.graphics.rectPath(0, 0, this.size[0], this.size[1]);
		this.graphics.fillPath(this.fillBrush);
		if (this.text) {
			this.graphics.drawString(
				this.text,
				this.textPen,
				(this.size[0] - this.graphics.measureString(this.text, this.graphics.font, this.size[0])[0]) / 2,
				(this.size[1] - this.graphics.measureString(this.text, this.graphics.font, this.size[0])[1]) / 1.75,
				this.graphics.font);
		}
	}

	/** draw an text button with a colored background - returns a button object
		@parem {parentObj} - object - ScriptUI panel or group
		@parem {buttonText} - string - button text
		@parem {staticColor} - string - icon color when static
		@parem {hoverColor} - string - icon color when hovered (optional)
	*/
	function buttonColorText(parentObj, buttonText, staticColor, hoverColor) {
		var btn = parentObj.add('button', undefined, '', { name: 'ok' });    // add a basic button to style
		btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, hexToArray(staticColor));
		btn.text = buttonText.toUpperCase();
		btn.textPen = btn.graphics.newPen(btn.graphics.PenType.SOLID_COLOR, hexToArray('#ffffff'), 1);
		btn.onDraw = txtDraw;

		if (hoverColor) {
			try {
				btn.addEventListener("mouseover", function () {
					updateTextButtonOnHover(this, buttonText, hoverColor, "#FFFFFF");
				});
				btn.addEventListener("mouseout", function () {
					updateTextButtonOnHover(this, buttonText, staticColor, "#FFFFFF");
				});
			} catch (err) {
				// fail silently
			}
		}

		return btn;
	}

	function updateTextButtonOnHover(btn, buttonText, backgroundColor, textColor) {
		btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, hexToArray(backgroundColor));
		btn.text = buttonText.toUpperCase();
		btn.textPen = btn.graphics.newPen(btn.graphics.PenType.SOLID_COLOR, hexToArray(textColor), 1);
		btn.onDraw = txtDraw;
		return btn;
	}

	/**************************************************************************
	 * Vector Button **********************************************************
	 **************************************************************************/
	function vecToPoints(vecCoord) {
		var points = [];
		var n;
		for (var i = 0; i < vecCoord.length; i++) {
			var eachNum = vecCoord[i].points.split(/[\s,]/);
			var coordinates = [];
			var sets = [];
			for (var k = 0; k < eachNum.length; k += 2) {
				sets.push(eachNum[k] + "," + eachNum[k + 1]);
			}
			for (var j = 0; j < sets.length; j++) {
				n = sets[j].split(",");
				coordinates[j] = n;
				coordinates[j][0] = (parseFloat(coordinates[j][0]));
				coordinates[j][1] = (parseFloat(coordinates[j][1]));
			}
			points.push(coordinates);
		}
		return points;
	}

	function vecDraw() {
		this.graphics.drawOSControl();
		this.graphics.rectPath(0, 0, this.size[0], this.size[1]);
		this.graphics.fillPath(this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.15]));
		// try {
			for (var c = 0; c < this.coord.length; c++) {
				for (var i = 0; i < this.coord[c].length; i++) {
					var line = this.coord[c][i];
					this.graphics.newPath();
					this.graphics.moveTo(line[0][0] + (this.size[0] / 2 - this.artSize[0] / 2), line[0][1] + (this.size[1] / 2 - this.artSize[1] / 2));
					for (var j = 0; j < line.length; j++) {
						this.graphics.lineTo(line[j][0] + (this.size[0] / 2 - this.artSize[0] / 2), line[j][1] + (this.size[1] / 2 - this.artSize[1] / 2));
					}
					this.graphics.fillPath(this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, hexToArray(this.iconColor)));
				}
			}
		// } catch (e) {

		// }
	}

	/** draw an colored icon button - returns a button object
		@parem {parentObj} - object - ScriptUI panel or group
		@parem {iconVec} - array of strings - SVG coords as string
		@parem {size} - array - icon size
		@parem {staticColor} - string - icon color when static
		@parem {hoverColor} - string - icon color when hovered (optional)
	*/
	function buttonColorVector(parentObj, iconVec, size, staticColor, hoverColor) {
		var btn = parentObj.add("button", [0, 0, size[0], size[1], undefined]);
		btn.coord = [];
		for (var v = 0; v < iconVec.length; v++) {
			btn.coord[v] = vecToPoints(iconVec[v]);
			btn.iconColor = staticColor;
			btn.artSize = size;
		}
		btn.onDraw = vecDraw;

		if (hoverColor) {
			try {
				btn.addEventListener("mouseover", function () {
					updateVectorButtonOnHover(this, iconVec, hoverColor, size);
				});
				btn.addEventListener("mouseout", function () {
					updateVectorButtonOnHover(this, iconVec, staticColor, size);
				});
			}
			catch (err) {
				// fail silently
			}
		}

		return btn;
	}

	function updateVectorButtonOnHover(btn, iconVec, iconColor, size) {
		for (var v = 0; v < iconVec.length; v++) {
			btn.coord[v] = vecToPoints(iconVec[v]);
			btn.iconColor = iconColor;
			btn.artSize = size;
		}
		btn.onDraw = vecDraw;
		return btn;
	}

	/**************************************************************************
	* Setup *******************************************************************
	***************************************************************************/
	var mainPalette = thisObj instanceof Panel ? thisObj : new Window('palette', scriptName, undefined, { resizeable: true });

	//stop if there's no window
	if (mainPalette === null) return;

	// set margins and alignment
	mainPalette.alignChildren = ['fill', 'fill'];
	mainPalette.margins = 5;
	mainPalette.spacing = 2;

	// ============ UI Elements and Metrics =================
	var content = mainPalette.add('group');
	content.alignChildren = ['fill', 'top'];
	content.orientation = 'column';
	content.margins = 2;
	content.spacing = 2;

	var grp_output = content.add('group'); // group to hold refreshed button. group allows for the removal of button element
	grp_output.alignment = ['fill', 'fill'];
	grp_output.alignChildren = ['fill', 'fill'];

	buttonColorVector(grp_output, icons.copyPasteB4, [30, 30], '#baeff6', '#ff0000')
	/**************************************************************************
	 * Button functionality ***************************************************
	 **************************************************************************/
	function updateButton(pGrp) { // draw UI elements
		mainPalette.layout.layout(true); // auto layout
		mainPalette.layout.resize(); // resize everything
	}

	function getCoordString(index) {
		return JSON.stringify(icons[index]);
	}
	updateButton(grp_output);

	mainPalette.onResizing = mainPalette.onResize = function () { mainPalette.layout.resize(); };
	if (!(mainPalette instanceof Panel)) mainPalette.show();

})(this);
