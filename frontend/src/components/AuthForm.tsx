import React, { useState } from 'react';
import { Button, FormControl, FormGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../index';
import { login, signup } from '../reducers/accountSlice';
import fetchState from '../reducers/fetchState';

interface Istate {
  username: string;
  password: string;
  buttonClicked: boolean;
}

const AuthForm = () => {
  const account = useSelector((store: RootState) => store.account);
  const dispatch = useDispatch();
  const [state, setState] = useState<Istate>({ username: '', password: '', buttonClicked: false });

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, username: event.target.value });
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, password: event.target.value });
  };

  const handleSignup = () => {
    setState({ ...state, buttonClicked: true });

    const { username, password } = state;
    if ( username.length || password.length === 0 ){
      alert('username / password is required!')
    }else{
      dispatch(signup({ username, password }));
    }
  };

  const handleLogin = () => {
    setState({ ...state, buttonClicked: true });

    const { username, password } = state;

    dispatch(login({ username, password }));
  };

  const Error = () => {
    if (state.buttonClicked && account.status === fetchState.error) {
      return <div>{account.message}</div>;
    }
  };

  return (
    <div>
      <h2>Dragon Stack</h2>
      <br />
      <FormGroup>
        <FormControl
          type="text"
          value={state.username}
          placeholder="username"
          onChange={updateUsername}
        />
      </FormGroup>
      <br />
      <FormGroup>
        <FormControl
          type="password"
          value={state.password}
          placeholder="password"
          onChange={updatePassword}
        />
      </FormGroup>
      <br />
      <div>
        <Button onClick={handleLogin}>Log in</Button>
        <span> or </span>
        <Button onClick={handleSignup}>Sign up</Button>
      </div>
      {Error()}
    </div>
  );
};

export default AuthForm;
