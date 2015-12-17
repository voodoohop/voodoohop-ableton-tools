// import most from "most";

// import Immutable from "immutable";

// // import Subject as action from "../utils/subject";

// // var appStore = Immutable.Map();
// // var actions = Immutable.Map();

// var stateTransformer = most.of(Immutable.Map());

// var actionsList = Immutable.List();


// export var addStore = ({actions, name}) => {
// 	appStore = appStore.set(name, actions);
// 	actions.forEach((func,type) => {
// 		var doActionStream = (actionStream) => func(actionStream.filter(a => a.get("type") === type));
// 		actionsList = actionsList.concat([doActionStream]);
// 	}
// 		// stateTransformer = stateTransformer.merge()
// 	)	
// 	// actions = actions.merge(Immutable.Map(actions).mapEntries(([name, functor]) => [name, Immutable.Map({functor, storeName})]));
	
// };


// export var appModel = (actionStream) => actionStream
// 	.scan((state, action) => state.set(actions.get(action.get("type"))., Immutable.Map(appStore.mapEntries(e => [e[0], Immutable.Map()])));