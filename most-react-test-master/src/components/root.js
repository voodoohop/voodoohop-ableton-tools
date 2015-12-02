import React, { findDOMNode, Component, PropTypes } from 'react/addons';
import Counter from './counter';

export default class Root extends Component {
  render () {
    console.log(this.props);
    return (
      <div>
        <Counter count={ this.props.count }></Counter>
      </div>
    );
  }
}
