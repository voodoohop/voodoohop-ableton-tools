import MulticastSource from 'most/lib/source/MulticastSource';
import Stream from 'most/lib/Stream';

module.exports = function model(actions, store) {
	var updates = actions.scan(function(store, action) {
		return store.map(action);
	}, store);

	return new Stream(new MulticastSource(updates.source));
};