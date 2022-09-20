function toCamelCase(str) {
    //turns a string with spaces into aStringWithSpaces
    var TitleCaseNoSpaces =  str.toLowerCase().split(' ').map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
        //lower the first letter
    }).join('');
    return TitleCaseNoSpaces.charAt(0).toLowerCase() + TitleCaseNoSpaces.slice(1);
}
$.writeln (toCamelCase("A string with spaces In It"))