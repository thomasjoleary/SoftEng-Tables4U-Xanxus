
import { error } from 'console'

export class Model {
    path : String
    public loginID : String | null

    /** which is zero-based. */
    constructor(gpath : String) {
        this.path = gpath
        this.loginID = null
    }

    isPath(givenPath : String) {
        if (this.path === givenPath) {
            return true
        }
        return false
    }

    setPath(givenPath : String) {
        this.path = givenPath
        return true
    }

    setLoginID(givenID : String){
        this.loginID = givenID
    }

    getLoginID(){
        return this.loginID
    }
}