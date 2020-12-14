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