import React from 'react';
import { subscribe } from 'most';

// import { hasStream, arrayStream } from './utils';

function isStream(o) {
  return o && o["subscribe"];
}

export default function createReactiveClass(tag) {
  class ReactiveClass extends React.Component {
    constructor(props) {
      super(props);
      this.displayName = `MostReactiveElement-${tag}`;
      this.state = { mount: true };
    }

    componentWillMount() {
      this.subscribe(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.subscribe(nextProps);
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    addPropListener(name, prop$) {
      return subscribe((value) => {
        // don't re-render if value is the same.
        if (value === this.state[name]) {
          return;
        }

        const prop = {};
        prop[name] = value;
        this.setState(prop);
      }, prop$);
    }

    // childrenSubscription(children) {
    //   const key = 'children';

    //   if (isStream(children)) {
    //     return this.addPropListener(key, children);
    //   } else if (Array.isArray(children) && hasStream(children)) {
    //     return this.addPropListener(key, arrayStream(children));
    //   }
    //   // Do not need to subscribe to children with no streams
    //   return undefined;
    // }

    // subscribeChildren(children) {
    //   const subscription = this.childrenSubscription(children);
    //   if (subscription) {
    //     this.subscriptions.push(subscription);
    //   }
    // }

    subscribe({ children, ...props }) {
      if (this.subscriptions) {
        this.unsubscribe();
      }

      this.subscriptions = [];

      // this.subscribeChildren(children);

      Object.keys(props).forEach(key => {
        const value = props[key];
        if (isStream(value)) {
          const subscription = this.addPropListener(key, value);
          this.subscriptions.push(subscription);
        }
      });
    }

    unsubscribe() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptions = null;
      this.state = { mount: true };
    }

    render() {
      const { mount, ...state } = this.state;
      if (!mount) {
        return null;
      }

      // eslint-disable-next-line react/prop-types, no-unused-vars
      const { mount: _, ...props } = this.props;
      return React.createElement(tag, { ...props, ...state });
    }
  }

  return ReactiveClass;
}
