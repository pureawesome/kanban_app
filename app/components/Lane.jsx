import AltContainer from 'alt-container';
import React from 'react';

import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

import LaneActions from '../actions/LaneActions';

import Editable from './Editable.jsx';

import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const laneSource = {
  beginDrag(props) {
    return {
      id: props.lane.id
    };
  },
  isDragging(props, monitor) {
    return props.lane.id === monitor.getItem().id;
  }
}

const laneTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(sourceId !== targetId) {
      targetProps.onMove({sourceId, targetId});
    }
  }
}

const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.lane.id,
        noteId: sourceId
      });
    }
  }
};

@DragSource(ItemTypes.LANE, laneSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

@DropTarget(ItemTypes.LANE, laneTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))

// @DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
//   connectDropTarget: connect.dropTarget()
// }))

export default class Lane extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget, isDragging, lane, id, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props} style={{opacity: isDragging ? 0 : 1}}>
        <div className="lane-header" onClick={this.activateLaneEdit}>
          <div className="lane-add-note">
            <button onClick={this.addNote}>+ Note</button>
          </div>
          <Editable className="lane-name"
            editing={lane.editing}
            value={lane.name}
            onEdit={this.editName} />
          <div className="lane-delete">
            <button onClick={this.deleteLane}>x</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getNotesByIds(lane.notes)
          }}
        >
          <Notes
            onValueClick={this.activateNoteEdit}
            onEdit={this.editNote}
            onDelete={this.deleteNote} />
        </AltContainer>
      </li>
    ));
  }

  addNote = (e) => {
    e.stopPropagation();

    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New Task'});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };

  editName = (name) => {
    const laneId = this.props.lane.id;

    if(!name.trim()) {
      LaneActions.update({id: laneId, editing: false});
      return;
    }
    LaneActions.update({id: laneId, name, editing: false});
  };

  deleteLane = () => {
    const laneId = this.props.lane.id;

    LaneActions.delete(laneId);
  };

  activateLaneEdit = () => {
    const laneId = this.props.lane.id;

    LaneActions.update({id: laneId, editing: true});
  };

  activateNoteEdit(id) {
    NoteActions.update({id, editing: true});
  }

  editNote(id, task) {
    if(!task.trim()) {
      NoteActions.update({id, editing: false});
      return;
    }
    NoteActions.update({id, task, editing: false});
  }

  deleteNote = (noteId, e) => {
    e.stopPropagation();

    const laneId = this.props.lane.id;

    LaneActions.detachFromLane({laneId, noteId});
    NoteActions.delete(noteId);
  };
}
