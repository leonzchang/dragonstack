import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';

import { fetchDragon } from '../actions/dragon';
import { RootState } from '../index';
import fetchState from '../reducers/fetchState';
import DragonAvatar from './DragonAvatar';

class Dragon extends Component<PropsFromRedux> {
  get DragonView() {
    const { dragon } = this.props; //each account only can get one dragon on each generation

    if (dragon.status === fetchState.error) return <span>{dragon.message}</span>;

    return <DragonAvatar dragon={dragon} />;
  }

  render() {
    return (
      <div>
        <Button onClick={this.props.fetchDragon}>New Dragon</Button>
        <br />
        {this.DragonView}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const dragon = state.dragon;

  return { dragon };
};

const componetConnector = connect(mapStateToProps, { fetchDragon });

type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(Dragon);
