// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
var reply = "asfdas";


var domain = "pureandapplied.com.au";
var resource = "/scripts/current.zip"; 
reply = "";
try{
    conn = new Socket;
    if(! conn){throw conn} 
    // access Adobe's home page
    if (conn.open (domain + ":80")) {
        // send a HTTP GET request
        var userAgent = 'User-Agent: pnasScript';

    //    var request = "GET " + resource + " HTTPS/1.0\nHost: " + domain + "\n";
    var request = "GET " + resource + "\nHost: " + domain + "\n"
       conn.write(request);
       // and read the server's reply
       reply = conn.read(999999);
       conn.close();
       alert(reply);
        if(reply.length){
            var downloadedFile = new File("~/pureandapplied.temp.zip");
            downloadedFile.open("w");
            downloadedFile.write(reply);
            downloadedFile.close();
        } else {
            throw "nothing was downloaded…?"
        }
        
    } else { 
        alert (conn.open (domain)) 
    }
}catch (e){
    alert(e);
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
