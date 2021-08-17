import { BACKEND } from '../config';
import { AppDispatch } from '../index';
import { ACCOUNT } from './type';

interface userInfo {
  username: string;
  password: string;
}

interface fectchFromAccountInfo {
  endpoint: string;
  options: RequestInit;
  FETCH_TYPE: string;
  ERROR_TYPE: string;
  SUCCESS_TYPE: string;
}

export const fectchFromAccount =
  ({ endpoint, options, FETCH_TYPE, ERROR_TYPE, SUCCESS_TYPE }: fectchFromAccountInfo) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_TYPE });

    return fetch(`${BACKEND.ADDRESS}/account/${endpoint}`, options)
      .then((response) => response.json())
      .then((json) => {
        if (json.type === 'error') {
          dispatch({
            type: ERROR_TYPE,
            message: json.message,
          });
        } else {
          dispatch({
            type: SUCCESS_TYPE,
            ...json, //message object from setSession
          });
        }
      })
      .catch((error) =>
        dispatch({
          type: ERROR_TYPE,
          message: error.message,
        })
      );
  };

export const signup = ({ username, password }: userInfo) =>
  fectchFromAccount({
    endpoint: 'signup',
    options: {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
    FETCH_TYPE: ACCOUNT.FETCH,
    ERROR_TYPE: ACCOUNT.FETCH_ERROR,
    SUCCESS_TYPE: ACCOUNT.FETCH_SUCCESS,
  });

export const login = ({ username, password }: userInfo) =>
  fectchFromAccount({
    endpoint: 'login',
    options: {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
    FETCH_TYPE: ACCOUNT.FETCH,
    ERROR_TYPE: ACCOUNT.FETCH_ERROR,
    SUCCESS_TYPE: ACCOUNT.FETCH_SUCCESS,
  });

export const fetchAuthenticated = () =>
  fectchFromAccount({
    endpoint: 'authenticated',
    options: {
      credentials: 'include',
    },
    FETCH_TYPE: ACCOUNT.FETCH,
    ERROR_TYPE: ACCOUNT.FETCH_ERROR,
    SUCCESS_TYPE: ACCOUNT.FETCH_AUTHENTICATED_SUCCESS,
  });

export const logout = () =>
  fectchFromAccount({
    endpoint: 'logout',
    options: {
      credentials: 'include',
    },
    FETCH_TYPE: ACCOUNT.FETCH,
    ERROR_TYPE: ACCOUNT.FETCH_ERROR,
    SUCCESS_TYPE: ACCOUNT.FETCH_LOGOUT_SUCCESS,
  });
