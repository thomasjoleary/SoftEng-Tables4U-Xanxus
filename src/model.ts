
import { error } from 'console'

export class Model {
    path : String
    rid : String

    /** which is zero-based. */
    constructor(gpath : String) {
        this.path = gpath
        this.rid = ""
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
}