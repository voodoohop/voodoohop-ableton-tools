import Immutable from "immutable";

// import monkeypatch from "monkeypatch";

// monkeypatch(Immutable.Map,"get", function(original, ...args) {
// 	console.log(args);
// 	return original(...args);
// });



var disable = process.env["NODE_ENV"] !== "development";
export default function streamLog(identifier, transformer = (a => a instanceof Object && a.toJS ? a.toJS() : a)) {
	if (disable)
		return (args) => args;
	return (...args) => {
		if (window.loggingDisabled)
			return args[0];
		console.log("---" + identifier,
			...args.map(transformer).map(a => a === undefined ? undefined : ((a === null) ? null : a)));
		return args[0];
	}
}