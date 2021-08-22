import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../index';
import fetchState from '../reducers/fetchState';
import { fetchGeneration } from '../reducers/generationSlice';

const MINIMUN_DELAY = 3000;

const Generation = () => {
  const generation = useSelector((store: RootState) => store.generation);
  const expiration = generation.expiration;
  const dispatch = useDispatch();

  //componentDidMount
  useEffect(() => {
    let timeout!: NodeJS.Timeout;
    let retry!: NodeJS.Timer;
    const dispatchEverySecond = () => {
      dispatch(fetchGeneration());
      retry = setInterval(() => {
        dispatch(fetchGeneration());
      }, 1000);
    };
    if (expiration == undefined) {
      dispatchEverySecond();
    } else {
      let delay = new Date(expiration).getTime() - Date.now();
      if (delay < MINIMUN_DELAY) {
        //prevent api update slower
        delay = MINIMUN_DELAY;
      }
      timeout = setTimeout(() => {
        dispatchEverySecond();
      }, delay);
    }

    //componentWillUnmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (retry) {
        clearInterval(retry);
      }
    };
  }, [expiration]);

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
};

export default Generation;
