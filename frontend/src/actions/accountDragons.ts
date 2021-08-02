import { ACCOUNT_DRAGONS} from "./type"
import { fectchFromAccount } from './account'


export const fectchAccountDragons = () => fectchFromAccount({
    endpoint:'dragons',
    options:{credentials:'include'},
    FETCH_TYPE:ACCOUNT_DRAGONS.FETCH,
    ERROR_TYPE:ACCOUNT_DRAGONS.FETCH_ERROR,
    SUCCESS_TYPE:ACCOUNT_DRAGONS.FETCH_SUCCESS
})