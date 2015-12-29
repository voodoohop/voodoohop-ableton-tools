
import React,{Component, PropTypes} from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";
import clipTypes from "../api/clipTypes";

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext,DragSource, DropTarget } from 'react-dnd';
// var DragSource = require('react-dnd').DragSource;



const style = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left'
};

const audioDropTarget = {
drop() {
  	return {trackId: 1234};
  }
}
const audioDragSource = {
  beginDrag(props) {
	  console.log("dragging,",props);
    return {
      trackId: props.trackId
    };
  },
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      window.alert( // eslint-disable-line no-alert
        `You dropped ${item.trackId} into ${dropResult.trackId}!`
      );
    }
  }
};

@DropTarget(clipTypes.midi, audioDropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
@DragSource(clipTypes.midi, audioDragSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DragDropContext(HTML5Backend)
export default class Container extends Component {
	  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
  };
  render() {
    const { canDrop, isOver, connectDropTarget, childView } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = '#222';
    if (isActive) {
      backgroundColor = 'darkgreen';
    } else if (canDrop) {
      backgroundColor = 'darkkhaki';
    }

    return connectDropTarget(
      <div style={{ ...style, backgroundColor }}>
          {childView}       
      </div>
    );
  	  
  }
}
//Status API Training Shop Blog About Pricing

//export default component((props) => <div>{props.childView}</div>);