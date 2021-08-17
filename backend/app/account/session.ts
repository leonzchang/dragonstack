import { v4 as uuid } from 'uuid';

import hash from './helper';

interface sessionInfo {
  username: string;
}

interface accountInfo {
  username: string;
  id: string;
}

const SEPARATOR = '|';

export default class Session {
  username: string;
  id: string;
  constructor({ username }: sessionInfo) {
    this.username = username;
    this.id = uuid();
  }

  toString() {
    const { username, id } = this;

    return Session.sessionString({ username, id });
  }

  static parse(sessionString: string) {
    const sessionData = sessionString.split(SEPARATOR);

    return {
      username: sessionData[0],
      id: sessionData[1],
      sessionHash: sessionData[2],
    };
  }

  static verify(sessionString: string) {
    const { username, id, sessionHash } = Session.parse(sessionString);

    const accountData = Session.accountData({ username, id });

    return hash(accountData) === sessionHash;
  }

  static accountData({ username, id }: accountInfo) {
    return `${username}${SEPARATOR}${id}`;
  }

  static sessionString({ username, id }: accountInfo) {
    const accountData = Session.accountData({ username, id });

    return `${accountData}${SEPARATOR}${hash(accountData)}`;
  }
}
