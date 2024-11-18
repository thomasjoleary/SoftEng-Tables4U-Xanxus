import { expect, test } from 'vitest'
import { Model } from './model'

test('Home', async () => {
        let m:Model = new Model(0)     // start with first configuration
        expect(m.board.letters[0][0]).toBe("E")
        expect(m.board.letters[0][4]).toBe("C")
        expect(m.board.letters[0][3]).toBe("Y")

        m.board.setSelectSquare(0,4)
        m.board.checkReady(0,3)
        m.mergeContents(0,4,0,3)
        expect(m.board.letters[0][4]).toBe("")
        expect(m.board.letters[0][3]).toBe("CY")
        m.board.setSelectSquare(0,3)
        m.board.checkReady(0,4)
        m.board.checkReady(1,3)
        m.board.checkReady(2,4)
        m.mergeContents(0,3,1,3)
        expect(m.board.letters[0][3]).toBe("")
        expect(m.board.letters[1][3]).toBe("CYA")

        m.reset()
        expect(m.board.letters[0][0]).toBe("E")
        expect(m.board.letters[0][4]).toBe("C")
        expect(m.board.letters[0][3]).toBe("Y")
        m.readyForCheck()
        m.check()
    }
)