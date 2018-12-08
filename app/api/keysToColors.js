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
// // ;

// export const abletonCols = {
// 	white: "#ffffff",
// 	yellow: "#ffee9f",
// 	yellow_1: "#dbc300",
// 	yellow_2: "#ffee9f",
// 	orange: "#f66c03",
// 	red: "#ff0505",
// 	dark_gray: "#3c3c3c",
// 	green_1: "#89b47d",
// 	green_2: "#87ff67",
// 	blue_1: "#8bc5ff",
// 	blue_2: "#10a4ee",
// 	blue_3: "#0303ff",
// 	purple_1: "#cdbbe4",
// 	purple_2: "#d86ce4",
// 	purple_3: "#ff39d4",
// 	brown_1: '#965735',
// 	brown_2: "#ffa374",
// 	brown_3: "#ffa374",
// 	fuschia_1: "#d2e498",
// 	fuschia_2: "#7ac634",
// 	pink: "#ff94a6"
// };

import tinycolor from 'tinycolor2';

// const convertFormat = c => c.mapKeys(k => k.toUpperCase()).filter((v, k) => k !== "A");
// const colsPre = Immutable.fromJS(abletonCols).toSet().map(col => tinycolor(col).toRgb()).map(c => Immutable.fromJS(c)).map(convertFormat); //;["#8900ff", "#0004ff", "#637282", "#00fbfb", "#00ff91", "#539933", "#0ccc00", "#83ff00", "#fbfb00", "#ff7c00", "#ff000a", "#f700fe"];


// console.log("cols", colsPre);

// import husl from "husl";

// import colorDiff from "color-diff";

// // col.reduce((remaining,color) => colorDiff.closest(color, remaining));

// const startCol = colsPre.toArray()[Math.floor(Math.random() * colsPre.size)];


// console.log("startCol", startCol);

// // const colsByFurthest = Immutable.List();
// const findNextCol = (cols, startCol, colsByFurthest) => {
// 	// console.log(cols.toJS(), startCol);

// 	const nextCol = colorDiff.closest(startCol.toJS(), cols.toJS());
// 	if (!nextCol) {
// 		console.log("colSequence", colsByFurthest);
// 		return colsByFurthest;
// 	}

// 	console.log("nextCol", nextCol);
// 	const newCols = cols.remove(Immutable.fromJS(nextCol));;
// 	return findNextCol(newCols, Immutable.fromJS(nextCol), colsByFurthest.push(Immutable.fromJS(nextCol)));

// };

// const colsDifferent = findNextCol(colsPre.remove(startCol), startCol, Immutable.List()).take(12)
// 	.map(c => "#" + tinycolor(c.mapKeys(k => k.toLowerCase()).toJS()).toHex()).toList();


// const col = colsDifferent//Immutable.Range(0, 12 * 5, 5).map(i => colsDifferent.get(i % 12))
// 	.toArray();

const colDark = ['#bfba69', '#a6be00', '#7ac634', '#3dc300', '#00bfaf', '#10a4ee', '#5480e4', '#886ce4', '#a34bad', '#b73d69', '#965735', '#f66c03']
	.map((col, i, cols) => cols[(i + 7) % cols.length]);
const colLighter = ['#bffb00', '#87ff67', '#1aff2f', '#25ffa8', '#5cffe8', '#19e9ff', '#8bc5ff', '#92a7ff', '#b88dff', '#d86ce4', '#ff39d4', '#ffa529']
	.map((col, i, cols) => cols[(i + 7) % cols.length]);
const col = colLighter;
console.log('colorwheel', col);
import Immutable from 'immutable';

let colors =
	{
		'c': col[1], 'am': col[1],
		g: col[0], 'em': col[0],
		'd': col[11], bm: col[11],
		a: col[10], gbm: col[10], 'f#m': col[10],
		e: col[9], 'dbm': col[9], 'c#m': col[9],
		b: col[8], 'abm': col[8], 'g#m': col[8],
		'gb': col[7], 'f#': col[7], 'd#m': col[7], ebm: col[7],
		db: col[6], 'c#': col[6], 'bbm': col[6], 'a#m': col[6],
		ab: col[5], 'g#': col[5], 'fm': col[5],
		'eb': col[4], 'd#': col[4], 'cm': col[4],
		'bb': col[3], 'a#': col[3], gm: col[3],
		f: col[2], 'dm': col[2]
	}
	;


// let colors =
// {
// 	'c': col[0], 'am': col[0],
// 	g: col[1], 'em': col[1],
// 	'd': col[2], bm: col[2],
// 	a: col[3], gbm: col[3], 'f#m': col[3],
// 	e: col[4], 'dbm': col[4], 'c#m': col[4],
// 	b: col[5], 'abm': col[5], 'g#m': col[5],
// 	'gb': col[6], 'f#': col[6], 'd#m': col[6], ebm: col[6],
// 	db: col[7], 'c#': col[7], 'bbm': col[7], 'a#m': col[7],
// 	ab: col[8], 'g#': col[8], 'fm': col[8],
// 	'eb': col[9], 'd#': col[9], 'cm': col[9],
// 	'bb': col[10], 'a#': col[10], gm: col[10],
// 	f: col[11], 'dm': col[11]
// }
// ;


console.log('colors', colors);
export default function getKeyColor(keyString) {
	// console.log("getting col for",keyString);
	if (keyString === undefined)
		return '#aaaaaa';
	if (keyString === null) {
		return keyString;
	}
	return tinycolor(colors[keyString.toLowerCase().trim()] || '#aaaaaa')/* .lighten(20)*/.toHexString();
}
