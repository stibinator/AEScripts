//@target aftereffects
/* global app */

// eslint-disable-next-line no-unused-vars
function makeUniqueCompName(oldSource, prefix, suffix){
    if (oldSource.name){
        if (! suffix) {suffix = ''}
        if (! prefix) {prefix = ''}
        // Create a unique name, given a layer
        // find a serialnumber suffix if one exists e.g. mypic.jpg_1 
        // everyone stand back… 
        // the RE matches any string that doesn't
        // end in a number, followed by a number. eg foo99bar_9 will match
        // (foo99bar_)(9)
        var re = /(.*[^\d])*(\d*)$/;

        var m = oldSource.name.match(re);
        var oldSourceSerial = m[2];
        var oldSourceBaseName = m[1];

        //default serial number
        var newSourceSerial = 1;

        // if no match, then the source doesn't have a serial number. One of these
        // should catch it
        if (typeof(oldSourceSerial) === 'undefined' || oldSourceSerial === '' || isNaN(parseInt(oldSourceSerial, 10))) {
            // since there was no serial we add a separator onto the base name so that it
            // becomes basename_1 etc
            oldSourceBaseName = oldSource.name + '_';
        } else {
            //there was a serial number, so increment it
            newSourceSerial = 1 + parseInt(oldSourceSerial, 10);
        }

        if (!oldSourceBaseName) {
            oldSourceBaseName = oldSource.name;
        } //shouldn't happen, but you know, regex..
        // we need to check to see if a source layer with the new serial number exists,
        // and if it does we keep incrementing the serial until it doesn't
        while (findDuplicateSourceItems('' + oldSourceBaseName + newSourceSerial)) {
            newSourceSerial++;
        }

        return prefix + oldSourceBaseName + suffix + '_' + newSourceSerial;
    } else {
        return false;
    }
}

function findDuplicateSourceItems(theName) {
  var allItems = app.project.items;
  var j;
  for (j = 1; j <= allItems.length; j++) {
    if (app.project.items[j].name === theName) {
      return true;
    }
  }

  return false;
}