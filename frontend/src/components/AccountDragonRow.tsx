import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

import { BACKEND } from '../config';
import DragonAvatar from './DragonAvatar';

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonProps {
  dragon: {
    dragonId: number;
    generationId: number;
    nickname: string;
    birthdate: Date;
    traits: traitsType[];
    isPublic: boolean;
    saleValue: number;
    sireValue: number;
  };
}

interface Istate {
  nickname: string;
  isPublic: boolean;
  saleValue: number;
  sireValue: number;
  edit: boolean;
}

const AccountDragonRow = (props: dragonProps) => {
  const regExp = /^[0-9\b]+$/;
  const [state, setState] = useState<Istate>({
    nickname: props.dragon.nickname,
    isPublic: props.dragon.isPublic,
    saleValue: props.dragon.saleValue,
    sireValue: props.dragon.sireValue,
    edit: false,
  });

  const updateNickname = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, nickname: event.target.value });
  };

  const updateSaleValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    // only accept positive integer
    if (regExp.test(event.target.value)) {
      setState({ ...state, saleValue: event.target.valueAsNumber });
    }
  };

  const updateSireValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    // only accept positive integer
    if (regExp.test(event.target.value)) {
      setState({ ...state, sireValue: event.target.valueAsNumber });
    }
  };

  const updateIsPublic = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, isPublic: event.target.checked });
  };

  const toggleEdit = () => {
    setState({ ...state, edit: !state.edit });
  };

  const toggleCancel = () => {
    setState({
      ...state,
      edit: !state.edit,
      nickname: props.dragon.nickname,
      isPublic: props.dragon.isPublic,
      saleValue: props.dragon.saleValue,
    });
  };

  const save = () => {
    if (state.isPublic && state.saleValue === 0) {
      alert("sale value hasn't been given");
    } else {
      fetch(`${BACKEND.ADDRESS}/dragon/update`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dragonId: props.dragon.dragonId,
          nickname: state.nickname,
          isPublic: state.isPublic,
          saleValue: state.saleValue,
          sireValue: state.sireValue,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.type === 'error') {
            alert(json.message);
          } else {
            toggleEdit();
          }
        })
        .catch((error) => alert(error.message));
    }
  };

  const SaveButton = () => {
    return (
      <>
        <Button onClick={save}>Save</Button> <Button onClick={toggleCancel}>Cancel</Button>
      </>
    );
  };

  const EditButton = () => {
    return <Button onClick={toggleEdit}>Edit</Button>;
  };

  return (
    <div>
      <input type="text" value={state.nickname} onChange={updateNickname} disabled={!state.edit} />
      <br />
      <DragonAvatar dragon={props.dragon} />
      <div>
        <span>
          Sale Value:{' '}
          <input
            className="account-draong-row-input"
            type="number"
            disabled={!state.edit}
            value={state.saleValue}
            onChange={updateSaleValue}
            min={0}
          />
        </span>{' '}
        <span>
          Sire Value:{' '}
          <input
            className="account-draong-row-input"
            type="number"
            disabled={!state.edit}
            value={state.sireValue}
            onChange={updateSireValue}
            min={0}
          />
        </span>{' '}
        <span>
          Public:{' '}
          <input
            type="checkbox"
            disabled={!state.edit}
            checked={state.isPublic}
            onChange={updateIsPublic}
          />
        </span>{' '}
        {state.edit ? SaveButton() : EditButton()}
      </div>
    </div>
  );
};

export default AccountDragonRow;
