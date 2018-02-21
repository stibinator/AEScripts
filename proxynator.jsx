var originals = app.project.selection;
var f, proxyPath;
var proxyFolder = Folder.selectDialog ("choose the source folder for the proxies");
for (i=1; i <= originals.length; i++){
     try {
   if (originals[i].typeName==="Footage"){
        newProxy = new File(proxyFolder.absoluteURI + "/" + originals[i].file.name);
      
           originals[i].setProxy(newProxy);
           }
      
       }
    catch(e){
           writeln(e)
           }
   }