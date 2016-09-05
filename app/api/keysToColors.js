// const col2 = [
// "#f700fe",
//  "#83ff00",
// "#0004ff",
//  "#ff7c00",
// "#00fbfb",
// "#539933",//"#ff008d",
// "#0ccc00",//"#0eff00",
//  "#8900ff",
//  "#fbfb00",
// "#637282", //;"#0080ff";
// "#ff000a",
// "#00ff91"];


// const col3 = //["#8900ff", "#fbfb00", "#637282", "#ff000a", "#00ff91", "#f700fe", "#83ff00", "#0004ff", "#ff7c00", "#00fbfb", "#539933", "#0ccc00"];
// col2.map((c,i)=> col2[(i+7)%col2.length])


// const col=col3.map((c,i) => col3[(i*7)%col3.length]);
// ;
const col =["#8900ff","#0004ff","#637282","#00fbfb","#00ff91","#539933","#0ccc00","#83ff00","#fbfb00","#ff7c00","#ff000a","#f700fe"];

//  console.log("colorwheel",col);

var colors=
	{
		"c":col[0], "am":col[0],
		"g":col[1], "em":col[1],
		"d":col[2], "bm":col[2],
		"a":col[3], "gbm":col[3],"f#m":col[3],
		"e":col[4], "dbm":col[4],"c#m":col[4],
		"b":col[5], "abm":col[5],"g#m":col[5],
		"gb":col[6], "f#":col[6], "d#m":col[6], "ebm":col[6],
		"db":col[7], "c#":col[7], "bbm":col[7], "a#m":col[7],
		"ab":col[8], "g#": col[8], "fm":col[8],
		"eb":col[9], "d#":col[9],"cm":col[9],
		"bb":col[10], "a#":col[10], "gm":col[10],
		"f":col[11],"dm":col[11]
	}
;

import tinycolor from  "tinyColor2";
console.log("colors",colors);
export default function getKeyColor(keyString) {
	// console.log("getting col for",keyString);	
	if (!keyString)
		return "#bbbbbb";
	return tinycolor(colors[keyString.toLowerCase().trim()] || "#aaaaaa")/*.lighten(20)*/.toHexString();
}