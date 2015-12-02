import React, { findDOMNode, Component, PropTypes } from 'react/addons';
import { action } from '../events/action';

export default class Counter extends Component {
  render () {
    console.log('render');
    return (
        <div>
          <div className="counter-display">{ this.props.count }</div>
          <div className="counter-controls">
            <button onClick={action('increment')}>+</button>
            <button onClick={action('decrement')}>-</button>
          </div>
        </div>
    );
  }
}

/*Counter.propTypes = {
  count: PropTypes.number.isRequired,
  onClickIncrement: PropTypes.func.isRequired,
  onClickDecrement: PropTypes.func.isRequired
};*/
