import { SHA256 } from "crypto-js";
import APP_SECRET from "../../secrets";


const hash = (string:string) => {
    return SHA256(`${APP_SECRET}${string}${APP_SECRET}`).toString()
}

export default hash 