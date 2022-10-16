import { REFRESH_RATE, HOURS } from '../config';
import Dragon from '../dargon/index';

const refreshRate = REFRESH_RATE * HOURS;

export default class Generation {
  expiration: Date;
  generationId?: number;
  accountIds: Set<number>;
  constructor() {
    this.accountIds = new Set();
    this.expiration = this.calculateExpiration();
    this.generationId = undefined;
  }

  calculateExpiration() {
    const expirationPeriod = Math.floor(Math.random() * (refreshRate / 2));

    const msUntilExpiration =
      Math.random() < 0.5 ? refreshRate - expirationPeriod : refreshRate + expirationPeriod;

    return new Date(Date.now() + msUntilExpiration);
  }

  newDragon({ accountId }: { accountId: number }) {
    if (new Date(Date.now()) > this.expiration) {
      throw new Error(`This generation expired on ${this.expiration}`);
    }

    if (this.accountIds.has(accountId))
      throw new Error('You already have dragon from this generation');

    this.accountIds.add(accountId); //each account only can get one dragon on each generation

    return new Dragon({ generationId: this.generationId });
  }
}
