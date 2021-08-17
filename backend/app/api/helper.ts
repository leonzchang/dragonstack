import { Response } from 'express';

import hash from '../account/helper';
import Session from '../account/session';
import AccountTable from '../account/table';

interface setSessionInfo {
  username: string;
  res: Response;
  sessionId?: string;
}

interface setSessionCookieInfo {
  sessionString: string;
  res: Response;
}

interface ErrorType extends Error {
  statusCode?: number;
}

interface authenticatedAccountInfo {
  sessionString: string;
}

interface authenticatedAccountReturnType {
  account: {
    id: number;
    passwordHash: string;
    sessionId: string;
    balance: number;
  };
  authenticated: boolean;
  username: string;
}

const setSession = ({ username, res, sessionId }: setSessionInfo) => {
  return new Promise<{ message: string }>((resolve, reject) => {
    let session: Session, sessionString: string;

    if (sessionId) {
      sessionString = Session.sessionString({ username, id: sessionId });

      setSessionCookie({ sessionString, res });

      resolve({ message: 'session restored' });
    } else {
      session = new Session({ username });
      sessionString = session.toString();

      AccountTable.updateSessionId({
        sessionId: session.id,
        usernameHash: hash(username),
      })
        .then(() => {
          setSessionCookie({ sessionString, res });

          resolve({ message: 'session created' });
        })
        .catch((error) => reject(error));
    }
  });
};

const setSessionCookie = ({ sessionString, res }: setSessionCookieInfo) => {
  res.cookie('sessionString', sessionString, {
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    // secure:true  //use with https
  });
};

const authenticatedAccount = ({ sessionString }: authenticatedAccountInfo) => {
  return new Promise<authenticatedAccountReturnType>((resolve, reject) => {
    if (!sessionString || !Session.verify(sessionString)) {
      const error: ErrorType = new Error('Invalid session');

      error.statusCode = 400;

      reject(error);
    } else {
      const { username, id } = Session.parse(sessionString);

      AccountTable.getAccount({ usernameHash: hash(username) })
        .then(({ account }) => {
          const authenticated = account.sessionId === id;

          resolve({ account, authenticated, username });
        })
        .catch((error) => reject(error));
    }
  });
};

export { authenticatedAccount, setSession };
