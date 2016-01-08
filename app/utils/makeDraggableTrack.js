import { DragSource, DropTarget } from 'react-dnd';

import actionStream from "../api/actionSubject";
import Immutable from "immutable";

import EventEmitter from "eventemitter3";

var trackType="track";

export var dragEvent = new EventEmitter();

export var DraggableChild = (TrackComponent) => DropTarget(trackType,{
  hover({trackId},monitor,hoverComponent){
    console.log("dragHover",monitor,hoverComponent,monitor.getItem()); 
    const sourceId =  monitor.getItem().trackId;
    // if (sourceId != trackId)
    dragEvent.emit("hoverDrag",Immutable.Map({
           type:"hoverDraggingTrack", 
           sourceId: sourceId, 
           targetId: trackId
    }));
  },
  drop({trackId}) {
    //   console.log("dragDrop",dropProps);
      return {trackId};
  }
},(connect)=>{
  return {
    connectDropTarget: connect.dropTarget(),
  }
})
(DragSource(trackType,{
  beginDrag({trackId}){
    // actionStream.push()
    dragEvent.emit("beginDrag",Immutable.Map({type:"beginDraggingTrack", trackId}));
    return {trackId};
  },
  endDrag({trackId},monitor){
    dragEvent.emit("endDrag",Immutable.Map({type:"endDraggingTrack", sourceId: trackId, targetId: monitor.getDropResult() && monitor.getDropResult().trackId}))
    //   console.log("endDrag",monitor.getDropResult(),monitor.getItem());
  }
},(connect,monitor)=>{
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
})(TrackComponent));



import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

export var DraggableParent = DragDropContext(HTML5Backend);
// export dragEvent;