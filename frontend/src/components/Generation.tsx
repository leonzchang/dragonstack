import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { fetchGeneration } from '../actions/generation';
import { RootState } from '../index';
import fetchState from '../reducers/fetchState';

const MINIMUN_DELAY = 3000;

class Generaion extends Component<PropsFromRedux> {
  timer!: NodeJS.Timeout;

  componentDidMount() {
    this.fetchNextGeneration();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  fetchNextGeneration = async () => {
    await this.props.fetchGeneration(); //promise

    let delay = new Date(this.props.generation.expiration!).getTime() - Date.now();

    if (delay < MINIMUN_DELAY) {
      //prevent api update slower
      delay = MINIMUN_DELAY;
    }

    this.timer = setTimeout(() => this.fetchNextGeneration(), delay);
  };

  render() {
    const { generation } = this.props;

    // if (generation.status === fetchState.fetching){
    //     return <div>...</div>
    // }

    if (generation.status === fetchState.error) {
      return <div>{generation.message}</div>;
    }

    return (
      <div>
        <h3>Generation {generation.generationId}. Expires on:</h3>
        <h4>{new Date(generation.expiration!).toString()}</h4>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const generation = state.generation;

  return { generation };
};

const componetConnector = connect(mapStateToProps, { fetchGeneration });

type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(Generaion);
