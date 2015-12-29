import Immutable from "immutable";

// import monkeypatch from "monkeypatch";

// monkeypatch(Immutable.Map,"get", function(original, ...args) {
// 	console.log(args);
// 	return original(...args);
// });
var disable = false;
export default function streamLog(identifier) {
	if (disable)
		return (args) => args;
	return (...args) => {
		console.log("---"+identifier, ...args.map(a => a === undefined ? undefined : ((a===null) ? null: (a.toJS && a.toJS()) || a)  ));
		return args[0];
	}
}