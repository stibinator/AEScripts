/* @target aftereffects */
// @includepath "./(lib)/"
// @include preferences.jsx
/* global Preferences */

var p = new Preferences('test');
var t = "hello";
alert (p.theDate);
p.setPrefs({theDate: t, foo: "bar"});