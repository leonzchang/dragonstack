import Dragon from '../dargon/index'
import { REFRESH_RATE, SECONDS } from '../config'

const refreshRate = REFRESH_RATE * SECONDS

export default class Generation {

    expiration: Date
    generationId?: number
    constructor() {
        this.expiration = this.calculateExpiration()
        this.generationId = undefined
    }

    calculateExpiration() {
        const expirationPeriod = Math.floor(Math.random() * (refreshRate / 2))

        const msUntilExpiration = Math.random() < 0.5 ? refreshRate - expirationPeriod : refreshRate + expirationPeriod

        return new Date(Date.now() + msUntilExpiration)
    }

    newDragon() {
        if (new Date(Date.now()) > this.expiration) {
            throw new Error(`This generation expired on ${this.expiration}`)
        }
        return new Dragon({ generationId: this.generationId })
    }
}
