export default function connectAction(action$, store) {
  action$.observe(
    (action) => {
      store.dispatch(action);
    }).catch(
    (err) => {
      store.dispatcher$.onError(err);
    }).then(
    () => {
      store.dispatcher$.onCompleted();
    }
	);
}