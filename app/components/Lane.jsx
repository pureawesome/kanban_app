import AltContainer from 'alt-container';
import React from 'react';

import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

import LaneActions from '../actions/LaneActions';

import Editable from './Editable .jsx';

export default class Lane extends React.Component {
  render() {
    const {lane, ...props} = this.props;

    return (
      <div {...props}>
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
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }

  addNote = (e) => {
    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New Task'});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };

  editNote(id, task) {
    NoteActions.update({id, task});
  }

  deleteNote = (noteId, e) => {
    e.stopPropagation();

    const laneId = this.props.lane.id;

    laneActions.detachFromLane({laneId, noteId});
    NoteActions.delete(noteId);
  };
}
