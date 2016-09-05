import when from 'when';

unhandledRejectionsWithSourceMaps(when.Promise);

function unhandledRejectionsWithSourceMaps(Promise) {
	Promise.onPotentiallyUnhandledRejection = function(r) {
		setTimeout(function() {
			if(!r.handled) {
				throw r.value;
			}
		}, 0);
	};

	Promise.onPotentiallyUnhandledRejectionHandled = function(r) {
		setTimeout(function() {
			console.log('Handled previous rejection', String(r.value));
		}, 0);
	};
}