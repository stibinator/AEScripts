// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
$._ext = {
    //Evaluate a file and catch the exception.
    evalFile : function(path) {
        try {
            $.evalFile(path);
        } catch (e) {alert("Exception:" + e);}
    },
    // Evaluate all the files in the given folder 
    evalFiles: function(jsxFolderPath) {
        var folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            var jsxFiles = folder.getFiles("*.jsx");
            for (var i = 0; i < jsxFiles.length; i++) {
                var jsxFile = jsxFiles[i];
                $._ext.evalFile(jsxFile);
            }
        }
    }
};

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
