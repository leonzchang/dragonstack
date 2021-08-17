import { ACCOUNT } from '../actions/type';
import fetchState from './fetchState';

interface reduxAccountSate {
  loggedIn?: boolean;
  message?: string;
  status?: string;
}

interface accountAction {
  type: string;
  message?: string;
  authenticated?: boolean; //not pass everytime
}

const DEFAULT_ACCOUNT = { loggedIn: false };

const accountReducer = (state: reduxAccountSate = DEFAULT_ACCOUNT, action: accountAction) => {
  switch (action.type) {
    case ACCOUNT.FETCH:
      return { ...state, status: fetchState.fetching };
    case ACCOUNT.FETCH_ERROR:
      return { ...state, message: action.message, status: fetchState.error };
    case ACCOUNT.FETCH_SUCCESS:
      return {
        ...state,
        status: fetchState.success,
        message: action.message,
        loggedIn: true,
      };
    case ACCOUNT.FETCH_LOGOUT_SUCCESS:
      return {
        ...state,
        status: fetchState.success,
        message: action.message,
        loggedIn: false,
      };
    case ACCOUNT.FETCH_AUTHENTICATED_SUCCESS:
      return {
        ...state,
        status: fetchState.success,
        message: action.message,
        loggedIn: action.authenticated,
      };
    default:
      return state;
  }
};

export default accountReducer;
