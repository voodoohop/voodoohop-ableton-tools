"use strict";

import React from "react";
import Two from "two.js";
import {Map} from "Immutable";

export default class TwoWaveform extends React.Component {

  constructor (props) {
    super(props);
    this.state = Map({
      
    });

    this.line = null;
    this.two = null;

    this.resize = this.resize.bind(this);
    this.updateShape = this.updateShape.bind(this);
  }

  componentWillMount() {
    console.log("Two",Two);
    var two = new Two({
      type: Two.Types[this.props.type],
      fullscreen: true
    });
    this.two = two;
  }

  componentDidMount() {
    var two = this.two;
    two.bind('resize', this.resize)
                  .appendTo(this.refs.stage.getDOMNode())
                  .trigger('resize')
                  .update();

    this.setState({
      y1: two.height / 4,
      y2: two.height / 2,
      y3: two.height / 1.5
    })

    this.line = this.two.makeCurve(
      two.width / 1, this.state.y1, 
      two.width / 2, this.state.y2,
      4 * two.width / 3, this.state.y3,
      true
    );
    this.line.linewidth = 4;
    this.line.cap = 'round';
  }

  componentWillUnmount() { 
    this.state.two.unbind('resize', this.resize);
  }

  componentWillUpdate(nextProps, nextState) {
    for (var i = 0; i < 3; i++) {
      var y = 'y' + (i+1);
      if (this.state[y] !== nextState[y]) {
        this.line.vertices[i].y = window.innerHeight / 2 - this.state[y];
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.two.update();
  }

  resize() {
    this.setState({
      right: this.two.width,
      bottom: this.two.height
    });
  }

  updateShape({ target }) {
    this.setState({ [target.name]: target.value });
  }

  render() {
    return (
      <div>
        <div ref="stage" style={{height: 30+ '%', zIndex: -10}}></div>
      </div>
    );  
  }
}

// window._dottedNested = function (key, value) {
//   return key.split('.').concat(value).reduceRight((acc, val) => { return { [val]: acc }});
// }

// React.render(<TwoTest type="svg" />,
//              document.getElementById('react-main'));


