import { ACCOUNT_INFO} from "./type"
import { fectchFromAccount } from './account'

export const fectchAccountInfo = () => fectchFromAccount({
    endpoint:'info',
    options:{credentials:'include'},
    FETCH_TYPE:ACCOUNT_INFO.FETCH,
    ERROR_TYPE:ACCOUNT_INFO.FETCH_ERROR,
    SUCCESS_TYPE:ACCOUNT_INFO.FETCH_SUCCESS
})