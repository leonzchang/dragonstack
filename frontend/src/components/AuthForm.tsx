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
  usernameVaild: boolean;
  passwordValid: boolean;
}

const AuthForm = () => {
  const account = useSelector((store: RootState) => store.account);
  const dispatch = useDispatch();
  const [state, setState] = useState<Istate>({ username: '', password: '', buttonClicked: false, usernameVaild: false, passwordValid: false });


  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, username: event.target.value });
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, password: event.target.value });
  };

  const handleSignup = () => {
    const { username, password } = state;
    
    if ( username.length !== 0 && password.length !== 0){
      setState({ ...state, buttonClicked: true });
      dispatch(signup({ username, password }));
    }else{
      if ( username.length === 0 && password.length === 0 ){
        setState({ ...state, usernameVaild: true , passwordValid: true });
      }else if (username.length === 0 && password.length !== 0){
        setState({ ...state, usernameVaild: true });
      }else if  (username.length !== 0 && password.length === 0){
        setState({ ...state, passwordValid: true });
      }
    }
  };

  const handleLogin = () => {
    const { username, password } = state;
    
    if ( username.length !== 0 && password.length !== 0){
      setState({ ...state, buttonClicked: true });
      dispatch(login({ username, password }));
    }else{
      if ( username.length === 0 && password.length === 0 ){
        setState({ ...state, usernameVaild: true , passwordValid: true });
      }else if (username.length === 0 && password.length !== 0){
        setState({ ...state, usernameVaild: true });
      }else if  (username.length !== 0 && password.length === 0){
        setState({ ...state, passwordValid: true });
      }
    }
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
          isInvalid={state.usernameVaild}
        />
      </FormGroup>
      <br />
      <FormGroup>
        <FormControl
          type="password"
          value={state.password}
          placeholder="password"
          onChange={updatePassword}
          isInvalid={state.passwordValid}
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
