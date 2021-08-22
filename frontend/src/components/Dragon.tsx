import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../index';
import { fetchDragon } from '../reducers/dragonSlice';
import fetchState from '../reducers/fetchState';
import DragonAvatar from './DragonAvatar';

const Dragon = () => {
  const dragon = useSelector((store: RootState) => store.dragon);
  const dispatch = useDispatch();

  const DragonView = () => {
    if (dragon.status === fetchState.error) return <span>{dragon.message}</span>;

    return <DragonAvatar dragon={dragon.dragonInfo} />;
  };

  return (
    <div>
      <Button onClick={() => dispatch(fetchDragon())}>New Dragon</Button>
      <br />
      {DragonView()}
    </div>
  );
};

export default Dragon;
