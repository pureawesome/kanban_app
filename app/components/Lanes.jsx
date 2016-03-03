import React from 'react';
import Lane from './Lane.jsx'
import LaneActions from '../actions/LaneActions';

export default ({lanes}) => {
  return (
    <ul className="lanes">{lanes.map(lane =>
      <Lane className="lane" key={lane.id} lane={lane} onMove={LaneActions.move} />
    )}</ul>
  );
}
