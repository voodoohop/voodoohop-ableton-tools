import { Component, createElement } from 'react';
// import { Observable } from 'kefir';

export function Connector(component) {
  return class extends Component {

    constructor(...args) {
      super(...args)
      this.observables = {}
      this.updaters = {}
      this.state = {}
      this.unsubscribers = {}
    }

    componentWillMount() {
      let state = {}

      each(this.props, (prop, k) => {
        if (!isObservable(prop)) { state[k] = prop }
        else { this.observables[k] = prop }
      })

      this.setState(state)

      each(this.observables, (_, k) =>
        addUpdater(this, k)
      )
    }

    componentWillUnmount() {
      each(this.updaters, (_, k) =>
        removeObservable(this, k)
      )
    }

    componentWillReceiveProps(nextProps) {
      let state = {}

      let newProps = select(nextProps, (_, k) =>
        !this.props.hasOwnProperty(k)
      )

      let keys = [].concat(
        Object.keys(this.props),
        Object.keys(newProps)
      )

      keys.forEach(k => handlePropChange(this, k, state, nextProps))
      this.setState(state)

      let pendingObservables = select(this.observables, (_, k) =>
        !this.updaters.hasOwnProperty(k)
      )

      each(pendingObservables, (_, k) =>
        addUpdater(this, k)
      )
    }

    render() {
      return createElement(
        component,
        this.state
      )
    }

  }
}

export function createConnector(component) {
  console.warn("`createConnector(A)` is deprecated; use `Connector(A)`")
  return Connector(component)
}

function isObservable(object) {
  return object && object["subscribe"] ? true:false;
}

function each(object, cb) {
  Object.keys(object).forEach(k =>
    cb(object[k], k, object)
  )
}

function select(object, predicate) {
  let clone = {}
  each(object, (v, k, o) => {
    if (predicate(v, k, o)) clone[k] = v
  })
  return clone
}


function addUpdater(self, key) {
  self.unsubscribers[key] = self.observables[key].subscribe({next:self.updaters[key] = value => {
    self.setState({[key]: value})
  }});
}

function removeUpdater(self, key) {
  self.unsubscribers[key].unsubscribe(self.updaters[key]);
  // unsubscribers[key]
  delete self.updaters[key]
}

function removeObservable(self, key) {
  removeUpdater(self, key)
  delete self.observables[key]
}

function handlePropChange(self, key, state, nextProps) {
  let prop = self.props[key]
  let nextProp = nextProps[key]
  let isObs = isObservable(prop)
  let isObsNext = isObservable(nextProp)
  let isNew = prop === undefined
  let isRemoved = nextProp === undefined
  let isChanged = !isNew && !isRemoved && nextProp !== prop

  if (!isObs && !isObsNext) {
    state[key] = nextProp
  }

  if (isObs && isObsNext) {
    if (isChanged) {
      removeUpdater(self, key)
      self.observables[key] = nextProp
    }
  }

  if (isObs && !isObsNext) {
    removeObservable(self, key)
    state[key] = nextProp
  }

  if (!isObs && isObsNext) {
    self.observables[key] = nextProp
  }
}