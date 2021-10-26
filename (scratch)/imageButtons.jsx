// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/*written by Nicolas Dufresne
http://www.duduf.net

*/

function addImageButton(container, text, image, helpTip, imageOver, imgFolder){
    if(!imgFolder) imgFolder = '';
  if (!container) return null;
  if (!text) text = '';
  if (!image) {
    image = '';
  } else {
    image = imgFolder + image;
  }
   if (!helpTip) helpTip = '';
  if (!imageOver) {
    imageOver = '';
  } else {
    imageOver = imgFolder + imageOver;
  }

  if (text === '' && image === '') return null;

  var imageButton = {};

  imageButton.standardImage = image;
  imageButton.imageOver = imageOver;
  imageButton.onClick = function () {};

  var group = container.add('group');
  group.orientation = 'row';
  group.margins = 0;
  group.spacing = 2;
  group.alignment = ['fill','fill'];
  imageButton.group = group;


  if (text !== ''){
    var label = group.add('statictext',undefined,text);
    label.helpTip = helpTip;
    label.alignment = ['center','center'];
    imageButton.label = label;
  }

  if (image !== ''){
    var icon = group.add('image',undefined, image);
    icon.alignment = ['center','center'];
    icon.helpTip = helpTip;
    imageButton.image = icon;
  }

  function clicked(e){
    imageButton.onClick();
  }
  function mouseOver(e){
    if (icon) if (imageButton.imageOver !== '') icon.image = imageButton.imageOver;
  }
  function mouseOut(e){
    if (icon) if (imageButton.standardImage !== '') icon.image = imageButton.standardImage;
  }

  group.addEventListener("mousedown",clicked,true);
  group.addEventListener("mouseover",mouseOver);
  group.addEventListener("mouseout",mouseOut);

  return imageButton;
}

function addImageCheckBox(container,text,image,helpTip,imageChecked,imageOver){
  if (!container) return null;
  if (!text) text = '';
  if (!image) {
    image = '';
  } else {
    image = imgFolder + image;
  }
  if (!helpTip) helpTip = '';
  if (!imageChecked) imageChecked = '';
  if (!imageOver) {if (imageChecked !== ''){ imageOver = imgFolder + imageChecked;} else {imageOver = '';}}
    else {imageOver = imgFolder + imageOver;}
  if (text === '' && image === '') return null;

  var imageButton = {};

  imageButton.standardImage = image;
  imageButton.imageOver = imageOver;
  imageButton.imageChecked = imageChecked;
  imageButton.onClick = function () {};
  imageButton.checked = false;

  var group = container.add('group');
  group.orientation = 'row';
  group.margins = 0;
  group.spacing = 2;
  group.alignment = ['fill','fill'];
  imageButton.group = group;


  if (text !== ''){
    if (image !== ''){
      var label = group.add('statictext',undefined,text);
      label.helpTip = helpTip;
      label.alignment = ['center','center'];
      imageButton.label = label;
    }
    else
    {
      var label = group.add('checkbox',undefined,text);
      label.helpTip = helpTip;
      label.alignment = ['center','center'];
      imageButton.label = label;
    }

  }

  if (image !== ''){
    var icon = group.add('image',undefined,image);
    icon.alignment = ['center','center'];
    icon.helpTip = helpTip;
    imageButton.image = icon;
  }

  imageButton.setChecked = function (c){
    imageButton.checked = c;
    if (imageButton.imageChecked !== ''){
      if (imageButton.checked){
        if (icon) if (imageButton.imageChecked !== '') icon.image = imageButton.imageChecked;
      }
      else
      {
        if (icon) if (imageButton.standardImage !== '') icon.image = imageButton.standardImage;
      }
    }
  };

  imageButton.clicked = function (e){
    if (imageButton.imageChecked !== ''){
      if (imageButton.checked){
        if (icon) if (imageButton.standardImage !== '') icon.image = imageButton.standardImage;
        imageButton.checked = false;
      }
      else
      {
        if (icon) if (imageButton.imageChecked !== '') icon.image = imageButton.imageChecked;
        imageButton.checked = true;
      }
    }
    imageButton.onClick();
  };
  imageButton.mouseOver = function (e){
    if (icon) if (imageButton.imageOver !== '') icon.image = imageButton.imageOver;
  };
  imageButton.mouseOut = function (e){
    if (imageButton.checked){
      if (icon) if (imageButton.imageChecked !== '') icon.image = imageButton.imageChecked;
    }
    else
    {
      if (icon) if (imageButton.standardImage !== '') icon.image = imageButton.standardImage;
    }
  };

  group.addEventListener("mousedown",imageButton.clicked,true);
  group.addEventListener("mouseover",imageButton.mouseOver);
  group.addEventListener("mouseout",imageButton.mouseOut);

  return imageButton;
}

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
