
import { error } from 'console'
import { config1, config2, config3 } from './puzzle'

export class Coordinate {
    readonly row : number
    readonly column : number

    constructor(row:number, column:number) {
      this.row = row
      this.column = column
    }
}

export class Board {
    letters : string[][]
    scores : number[][]
    selectedSquare : Coordinate

    constructor() {
        this.letters = []
        for (let r:number = 0; r < 5; r++) {
            this.letters[r] = []
            for (let c:number = 0; c < 5; c++) {
                this.letters[r][c] = ''
            }
        }

        this.scores = []
        for (let r:number = 0; r < 5; r++) {
            this.scores[r] = []
            for (let c:number = 0; c < 5; c++) {
                this.scores[r][c] = 0
            }
        }

        this.selectedSquare = new Coordinate(6,6)
    }

    setSelectSquare(row:number, column:number){
        this.selectedSquare = new Coordinate(row, column)
    }

    checkReady(row:number, column:number) {
        if (this.letters[row][column] == "") {
            return false // box is empty
        }

        if (this.selectedSquare.row == row + 1 && this.selectedSquare.column == column ||
            this.selectedSquare.row == row - 1 && this.selectedSquare.column == column ||
            this.selectedSquare.column == column + 1 && this.selectedSquare.row == row ||
            this.selectedSquare.column == column - 1 && this.selectedSquare.row == row) {
                //if any of these are true, it is bordering selected square
            return true
        } else {
            return false
        }
    }
}

export class Model {
    words : string[]
    board : Board
    readonly configs = [ config1, config2, config3]
    chosen : number
    moves : number
    score : number
    winlose : number

    /** which is zero-based. */
    constructor(which:number) {
        this.chosen = which
        let puzzle =  this.configs[this.chosen]
        let board = new Board()
        this.words = []
        for (let r:number = 0; r < 5; r++) {
            this.words[r] = puzzle.words[r]

            for (let c:number = 0; c < 5; c++) {
                board.letters[r][c] = puzzle.initial[r][c]
            }
        }
        this.board = board
        this.moves = 0
        this.score = 0
        this.winlose = 0 //if this is 1, game is won, if -1, game is lost
    }

    reset() {
        let puzzle = this.configs[this.chosen]
        for (let r:number = 0; r < 5; r++) {
            this.words[r] = puzzle.words[r]

            for (let c:number = 0; c < 5; c++) {
                this.board.letters[r][c] = puzzle.initial[r][c]
            }
        }
        this.board.setSelectSquare(6,6)
        this.moves = 0
        this.score = 0
    }

    readyForCheck() {
        let count:number = 0
        for (let r:number = 0; r < 5; r++) {
            for (let c: number = 0; c < 5; c++) {
                if (this.board.letters[r][c] !== "") {
                    count += 1
                }
            }
        }
        if (count > 5) {
            return false
        } else {
            return true
        }
    }

    check() {
        let checked = []
        for (let a :number = 0; a < 5; a++) {
            checked[a] = false
        }
        for (let a:number = 0; a < 5; a++) {
            for (let r:number = 0; r < 5; r++) {
                for (let c:number = 0; c < 5; c++) {
                    if (this.configs[this.chosen].words[a] === this.contents(r, c)) {
                        checked[a] = true
                    }
                }
            }
        }

        for (let a:number = 0; a < 5; a++) {
            if (checked[a] == false) {
                return false
            }
        }
        return true
    }

    getFinished() {
        if (this.winlose === 0) {
            return false
        }
        return true
    }

    contents(row:number, column:number) {
        return this.board.letters[row][column]
    }

    changeContents(row:number, column:number, input:string) {
        this.board.letters[row][column] = input
    }

    isSubstring(row:number, column:number) {
        for (let a:number = 0; a < 5; a++) {
            let word = this.configs[this.chosen].words[a] //sets word to be each word of the config
            if (word.includes(this.contents(row, column))) {
                return true
            }
        }
        return false
    }

    setBoxScore(row:number, column:number) {
        if (this.isSubstring(row, column)) {
            this.board.scores[row][column] = this.contents(row, column).length
        } else {
            this.board.scores[row][column] = 0
        }
    }

    totalScore() {
        let total = 0
        for (let r:number = 0; r < 5; r++) {
            for (let c:number = 0; c < 5; c++) {
                total += this.board.scores[r][c]
            }
        }
        return total
    }

    mergeContents(row:number, column:number, row2:number, column2:number) {
        let output = this.contents(row, column).concat(this.contents(row2, column2))
        if (output.length > 6) {
            return false
        }
        this.changeContents(row, column, "")
        this.changeContents(row2, column2, output)
        this.setBoxScore(row, column)
        this.setBoxScore(row2, column2)
        this.score = this.totalScore()
        return true
    }
}