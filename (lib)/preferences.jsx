function PrefsFile(theName)
{
    var __construct = function(that) {
            that.prefPath = "~/." + theName + ".txt";
         }(this);

    this.saveToPrefs = function(data){
        var f = new File(this.prefPath);
        f.encoding="UTF8";
        f.open("w");
        f.write(data.toSource());
        f.close();
    };

    this.readFromPrefs = function(){
        var f = new File(this.prefPath);
        f.open("r");
        var data = eval(f.read());
        f.close();
        return data;
    };

}
