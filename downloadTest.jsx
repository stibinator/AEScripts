// @target aftereffects
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
