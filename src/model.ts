
import { error } from 'console'

export class Model {
    path : String

    /** which is zero-based. */
    constructor(gpath : String) {
        this.path = gpath
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

}