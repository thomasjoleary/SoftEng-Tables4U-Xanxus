
import { error } from 'console'

export class Model {
    path : String
    rid : String | null
    public loginID : String | null


    /** which is zero-based. */
    constructor(gpath : String) {
        this.path = gpath
        this.rid = null
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

    setRid(givenRid : String) {
        this.rid = givenRid
    }
  
    setLoginID(givenID : String){
        this.loginID = givenID
    }

    getLoginID(){
        return this.loginID
    }
}