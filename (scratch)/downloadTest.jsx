// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
/* 
 * @method : either "POST" or "GET" 
 * @endpoint:  a string representing an URI endpoint for any given API 
 * @query: a string to be sent with the request (i.e. 'firstName=Arie&lastName=Stavchansky'). 
 */  

// alert(webRequest("GET", "google.com"));

var response = system.callSystem('cmd.exe /c \"\"%cd%\\(lib)\\curl.vbs\" \"');
alert(response);
function webRequest(method, endpoint, query)  
{  
      
    var response = null,  
        wincurl  = 'C:\\Users\\sdixon\\AppData\\Roaming\\Adobe\\After Effects\\16.1\\Scripts\\\(lib\)\\curl.ps1',  //the path to the .vbs file  
        curlCmd = '';  
              
    try {  
  
        if ( os() == "Win" ) {  
            curlCmd = 'powershell /f "' + wincurl + '"';  
            alert (curlCmd);
        } else {  
            if (method === "POST") {  
                curlCmd = 'curl -s -d "' + query + '" ' + endpoint;  
            } else if (method === "GET") {  
                curlCmd = 'curl -s -G -d "' + query + '" ' + endpoint;  
            }  
        }  
      
        response = system.callSystem(curlCmd);  
      
    } catch (err) {  
  
        alert("Error\nUnable to make a `"+ method +"` request to the network endpoint.  Please try again.");  
      
    }  
  
    return response;  
      
}  
  
  
function os()  
{  
      
    var os = system.osName;  
      
    if (!os.length) { os = $.os;  }  
  
    app_os =  ( os.indexOf("Win") != -1 )  ?  "Win" : "Mac";  
      
    return app_os;  
      
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
