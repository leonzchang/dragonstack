import React from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { BACKEND } from '../config';
import history from '../history';
import { RootState } from '../index';

interface mateInputType {
  matronDragonId: number;
  patronDragonId: number;
}
interface matingOptionsProps {
  patronDragonId: number;
}

const MatingOptions = (props: matingOptionsProps) => {
  const accountDragons = useSelector((store: RootState) => store.accountDragons);

  const mate =
    ({ matronDragonId, patronDragonId }: mateInputType) =>
    () => {
      fetch(`${BACKEND.ADDRESS}/dragon/mate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matronDragonId, patronDragonId }),
      })
        .then((reponse) => reponse.json())
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
      <h4>Pick one of your dragons to mate with: </h4>
      {accountDragons.dragons?.map((dragon) => {
        const { dragonId, generationId, nickname } = dragon;

        return (
          <span key={dragonId}>
            <Button
              onClick={mate({
                patronDragonId: props.patronDragonId,
                matronDragonId: dragonId,
              })}
            >
              G{generationId}.I{dragonId}. {nickname}
            </Button>{' '}
          </span>
        );
      })}
    </div>
  );
};

export default MatingOptions;
