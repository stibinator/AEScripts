// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
(function(){
    this.traversePropertyGroups = function(pGroup, inclusive) {
        // walks through property groups, returning properties
        // if inclusive is true, returns property groups as well
        if (pGroup) {
            var props = [];
            //alert(pGroup.numProperties);
            if (typeof pGroup.numProperties !== 'undefined') {
                if (inclusive) {
                    props.push(pGroup)
                }
                for (var pp = 1; pp <= pGroup.numProperties; pp++) {
                    var newProps = this.traversePropertyGroups(pGroup.property(pp), inclusive);
                    if (newProps.length) {
                        for (var i = 0; i < newProps.length; i++) {
                            props.push(newProps[i]);
                        }
                    }
                }
            } else {
                props.push(pGroup);
            }
            return props;
        }
    }
    this.getPropertiesWithExpressionsFromLayer = function(theLayer, selectedOnly) {
        var props = [];
        //only return selected properties. Kinda trivial but here for ease of use
        if (selectedOnly) {
            for (var j = 0; j < theLayer.selectedProperties.length; j++) {
                if (theLayer.selectedProperties[j].expression) {
                    props.push(theLayer.selectedProperties[j]);
                }
            }
        } else {
            for (var p = 1; p <= theLayer.numProperties; p++) {
                if (theLayer.property(p)) {
                    var propertyGroup = theLayer.property(p);
                    var newProps = this.traversePropertyGroups(propertyGroup, false);
                    if (newProps.length) {
                        for (var i = 0; i < newProps.length; i++) {
                            if (newProps[i].expression) {
                                props.push(newProps[i]);
                            }
                        }
                    }
                }
            }
        }
        return props;
    }
    
    var theComp = app.project.activeItem;
    var theExpressions = [];
    if (theComp ){
        for(var i =1; i <= theComp.numLayers; i++){
            theLayer = theComp.layer(i);
            theExpressions = this.getPropertiesWithExpressionsFromLayer(theLayer);
            for (var x = 0; x<theExpressions.length; x++){
                try{
                    theExpressions[x].selected = true;
                } catch (e){
                    $.writeln(theExpressions[x].name + " " + e);
                }
            }
        }
    }
})()

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
