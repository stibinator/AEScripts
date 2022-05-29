
function rankMatch(theString, theItem) {
    var letters = theString.split("");
    var lCursor = 0;
    var canMatch = true;
    var canMatchUpper = true;
    for (var i = 0; i < letters.length && canMatch; i++) {
        var caseInsensitiveIndex = theItem.info.shortname.toLowerCase().indexOf(letters[i].toLowerCase(), lCursor);
        if (caseInsensitiveIndex >= 0) {
            lCursor = caseInsensitiveIndex+1;
        } else {
            canMatch = false;
        }
    }
    var caseInsensitiveRank = lCursor;
    lCursor = 0;
    var upperCaseLetters = theItem.info.shortname.match(/(^.|[A-Z]*)/g).join("").toUpperCase(); //select all the capitals and the first letter as an honorary capital
    for (var i = 0; i < letters.length && canMatch && canMatchUpper; i++) {
        var upperCaseIndex = upperCaseLetters.indexOf(letters[i].toUpperCase(), lCursor);
        if (upperCaseIndex >= 0) {
            lCursor = upperCaseIndex + 1;
        } else {
            canMatchUpper = false;
        }
    }
    var upperCaseRank = lCursor + theString.length;
    return canMatch ? Math.min(caseInsensitiveRank, upperCaseRank) : -1;
}
// var matchCaps = rankMatch("foo", { "info": { "shortname": "FriendsOfOdin" } })
var matchFirst = rankMatch("foo", { "info": { "shortname": "fooFriendsOfOdin" } })
// var matchVarious = rankMatch("fro", { "info": { "shortname": "friendsOfOdin" } })
alert(Math.min(matchCaps, matchFirst))