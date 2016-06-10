const col2 = [
"#f700fe",
 "#83ff00",
"#0004ff",
 "#ff7c00",
"#00fbfb",
"#539933",//"#ff008d",
"#0ccc00",//"#0eff00",
 "#8900ff",
 "#fbfb00",
"#637282", //;"#0080ff";
"#ff000a",
"#00ff91"];

const col = col2.map((c,i)=> col2[(i+7)%col2.length])
;



var colors=
	{
		"c":col[0], "am":col[0],
		"g":col[7], "em":col[7],
		"d":col[2], "bm":col[2],
		"a":col[9], "gbm":col[9],"f#m":col[9],
		"e":col[4], "dbm":col[4],"c#m":col[4],
		"b":col[11], "abm":col[11],"g#m":col[11],
		"gb":col[6], "f#":col[6], "d#m":col[6], "ebm":col[6],
		"db":col[1], "c#":col[1], "bbm":col[1], "a#m":col[1],
		"ab":col[8], "g#": col[8], "fm":col[8],
		"eb":col[3], "d#":col[3],"cm":col[3],
		"bb":col[10], "a#":col[10], "gm":col[10],
		"f":col[5],"dm":col[5]
	}
;

var tinycolor=require( "tinyColor2");
console.log("colors",colors);
export default function getKeyColor(keyString) {
	// console.log("getting col for",keyString);	
	if (!keyString)
		return "#bbbbbb";
	return tinycolor(colors[keyString.toLowerCase().trim()] || "#aaaaaa")/*.lighten(20)*/.toHexString();
}