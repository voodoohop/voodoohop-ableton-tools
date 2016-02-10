var colors=
	{
		"c":"#f700fe", "am":"#f700fe",
		"g":"#8900ff", "em":"#8900ff",
		"d":"#0004ff", "bm":"#0004ff",
		"a":"#0080ff", "gbm":"#0080ff","f#m":"#0080ff",
		"e":"#00fbfb", "dbm":"#00fbfb","c#m":"#00fbfb",
		"b":"#00ff91", "abm":"#00ff91","g#m":"#00ff91",
		"gb":"#0eff00", "f#":"#0eff00", "d#m":"#0eff00", "ebm":"#0eff00",
		"db":"#83ff00", "c#":"#83ff00", "bbm":"#83ff00", "a#m":"#83ff00",
		"ab":"#fbfb00", "g#": "#fbfb00", "fm":"#fbfb00",
		"eb":"#ff7c00", "d#":"#ff7c00","cm":"#ff7c00",
		"bb":"#ff000a", "a#":"#ff000a", "gm":"#ff000a",
		"f":"#ff008d","dm":"#ff008d"
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