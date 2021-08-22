import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

import { BACKEND } from '../config';
import history from '../history';
import DragonAvatar from './DragonAvatar';
import MatingOptions from './MatingOptions';

interface dragonInfo {
  dragonId: number;
  generationId: number;
  birthdate: Date;
  nickname: string;
  traits: Array<{ traitType: string; traitValue: string }>;
  isPublic: boolean;
  saleValue: number;
  sireValue: number;
}

interface publicDragonsProps {
  dragon: dragonInfo;
}

interface Istate {
  displayMatingOptions: boolean;
}

const PublicDragonRow = (props: publicDragonsProps) => {
  const [state, setState] = useState<Istate>({ displayMatingOptions: false });

  const toggleDisplayMatingOptions = () => {
    setState({ displayMatingOptions: !state.displayMatingOptions });
  };

  const buy = () => {
    const { dragonId, saleValue } = props.dragon;

    fetch(`${BACKEND.ADDRESS}/dragon/buy`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dragonId, saleValue }),
    })
      .then((response) => response.json())
      .then((json) => {
        alert(json.message);

        if (json.type !== 'error') {
          history.push('/account-dragons');
        }
      })
      .catch((error) => alert(error.message));
  };

  return (
    <div>
      <div>{props.dragon.nickname}</div>
      <DragonAvatar dragon={props.dragon} />
      <div>
        <span>Sale Value: {props.dragon.saleValue}</span>
        {' | '}
        <span>Sire Value: {props.dragon.sireValue}</span>
      </div>
      <br />
      <Button onClick={buy}>Buy</Button> <Button onClick={toggleDisplayMatingOptions}>Sire</Button>
      <br />
      {state.displayMatingOptions ? (
        <MatingOptions patronDragonId={props.dragon.dragonId} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default PublicDragonRow;
