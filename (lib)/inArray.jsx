// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/*
 * @function
 * @name Object.prototype.inArray
 * @description Extend Object prototype within inArray function
 *
 * @param {mix}    needle       - Search-able needle
 * @param {bool}   searchInKey  - Search needle in keys?
 *
 */
Object.defineProperty(Object.prototype, 'inArray',{
    value: function(needle, searchInKey){

        var object = this;

        if( Object.prototype.toString.call(needle) === '[object Object]' ||
            Object.prototype.toString.call(needle) === '[object Array]'){
            needle = JSON.stringify(needle);
        }

        return Object.keys(object).some(function(key){

            var value = object[key];

            if( Object.prototype.toString.call(value) === '[object Object]' ||
                Object.prototype.toString.call(value) === '[object Array]'){
                value = JSON.stringify(value);
            }

            if(searchInKey){
                if(value === needle || key === needle){
                return true;
                }
            }else{
                if(value === needle){
                    return true;
                }
            }
        });
    },
    writable: true,
    configurable: true,
    enumerable: false
});

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
