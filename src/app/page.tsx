'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'

import { Coordinate, Model } from '../model'

export default function Home() {
  // initial instantiation of the Model comes from the first configuration
  const [model, setModel] = React.useState(new Model(0))
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function changeConfig(inp: number) {
    setModel(new Model(inp))
  }

  function resetPuzzle() {
    model.reset()
    andRefreshDisplay()
  }

  function checkPuzzle() {
    if (model.readyForCheck()) {
      if (model.check() == true) {
        return (
          alert("Hooray! You got it!")
        )
      } else if (model.check() == false) {
        return (
          alert("That's wrong! Try again!")
        )
      }
      andRefreshDisplay()
    } else {
      alert("Solve the puzzle first!")
    }
  }

  function handleClick(row:number, column:number) {
    if (model.getFinished()) {
      return //if finished, do nothing on click
    }
    if (model.board.selectedSquare.row == 6 && model.board.selectedSquare.column == 6 && model.contents(row, column) != "") {
      model.board.setSelectSquare(row, column) //Makes clicked square selected
    } else if (model.board.selectedSquare.row == row && model.board.selectedSquare.column == column) {
      model.board.setSelectSquare(6, 6)
    } else {
      if (model.board.checkReady(row, column)) {
        if (model.mergeContents(model.board.selectedSquare.row, model.board.selectedSquare.column, row, column) == false) {
          alert("A square can have at most 6 letters!")
          model.board.setSelectSquare(6,6) //Resets selected square
        } else {
          model.moves += 1
          model.board.setSelectSquare(6,6) //Resets selected square
        }
      } else if (model.contents(row, column) != "") {
        model.board.setSelectSquare(row, column)
      }
    }
    andRefreshDisplay()

    //alert("Clicked on row " + model.board.selectedSquare.row + "," + model.board.selectedSquare.column)
  }

  // change the style for the given square based on model. Space separated string.
  // So "square" is a regular square, while "square selected" is a selected square. Find
  // these CSS definitions inside the global.css file
  function css(row:number, column:number) {

    if (row == model.board.selectedSquare.row && column == model.board.selectedSquare.column) {
      return "square selected" // if square is selectedSquare, it should look selected
    }
    
    return "square"
  }

  return (
    <div>
      <div className="board">
        <div className="button-container">
          <button data-testid="0,0" className={css(0,0)} onClick={() => handleClick(0, 0)}>{model.contents(0,0)}</button>
          <button data-testid="0,1" className={css(0,1)} onClick={() => handleClick(0, 1)}>{model.contents(0,1)}</button>
          <button data-testid="0,2" className={css(0,2)} onClick={() => handleClick(0, 2)}>{model.contents(0,2)}</button>
          <button data-testid="0,3" className={css(0,3)} onClick={() => handleClick(0, 3)}>{model.contents(0,3)}</button>
          <button data-testid="0,4" className={css(0,4)} onClick={() => handleClick(0, 4)}>{model.contents(0,4)}</button>
        </div>
        <div className="button-container">
          <button data-testid="1,0" className={css(1,0)} onClick={() => handleClick(1, 0)}>{model.contents(1,0)}</button>
          <button data-testid="1,1" className={css(1,1)} onClick={() => handleClick(1, 1)}>{model.contents(1,1)}</button>
          <button data-testid="1,2" className={css(1,2)} onClick={() => handleClick(1, 2)}>{model.contents(1,2)}</button>
          <button data-testid="1,3" className={css(1,3)} onClick={() => handleClick(1, 3)}>{model.contents(1,3)}</button>
          <button data-testid="1,4" className={css(1,4)} onClick={() => handleClick(1, 4)}>{model.contents(1,4)}</button>
        </div>
        <div className="button-container">
          <button data-testid="2,0" className={css(2,0)} onClick={() => handleClick(2, 0)}>{model.contents(2,0)}</button>
          <button data-testid="2,1" className={css(2,1)} onClick={() => handleClick(2, 1)}>{model.contents(2,1)}</button>
          <button data-testid="2,2" className={css(2,2)} onClick={() => handleClick(2, 2)}>{model.contents(2,2)}</button>
          <button data-testid="2,3" className={css(2,3)} onClick={() => handleClick(2, 3)}>{model.contents(2,3)}</button>
          <button data-testid="2,4" className={css(2,4)} onClick={() => handleClick(2, 4)}>{model.contents(2,4)}</button>
        </div>
        <div className="button-container">
          <button data-testid="3,0" className={css(3,0)} onClick={() => handleClick(3, 0)}>{model.contents(3,0)}</button>
          <button data-testid="3,1" className={css(3,1)} onClick={() => handleClick(3, 1)}>{model.contents(3,1)}</button>
          <button data-testid="3,2" className={css(3,2)} onClick={() => handleClick(3, 2)}>{model.contents(3,2)}</button>
          <button data-testid="3,3" className={css(3,3)} onClick={() => handleClick(3, 3)}>{model.contents(3,3)}</button>
          <button data-testid="3,4" className={css(3,4)} onClick={() => handleClick(3, 4)}>{model.contents(3,4)}</button>
        </div>
        <div className="button-container">
          <button data-testid="4,0" className={css(4,0)} onClick={() => handleClick(4, 0)}>{model.contents(4,0)}</button>
          <button data-testid="4,1" className={css(4,1)} onClick={() => handleClick(4, 1)}>{model.contents(4,1)}</button>
          <button data-testid="4,2" className={css(4,2)} onClick={() => handleClick(4, 2)}>{model.contents(4,2)}</button>
          <button data-testid="4,3" className={css(4,3)} onClick={() => handleClick(4, 3)}>{model.contents(4,3)}</button>
          <button data-testid="4,4" className={css(4,4)} onClick={() => handleClick(4, 4)}>{model.contents(4,4)}</button>
        </div>
      </div>
      <label className="score">{"Score: " + model.score}</label>
      <label className="numMoves">{"Moves: " + model.moves}</label>
      <button data-testid="reset" className="reset" onClick={() => resetPuzzle()}>Reset Puzzle</button>
      <button data-testid="check" className="check" onClick={() => checkPuzzle()}>Check Puzzle</button>
      <div className="config-container">
        <label className="config-label"> Choose a Configuration! </label>
        <div className="container">
          <button data-testid="config1" className="config" onClick={() => changeConfig(0)}>Colors</button>
          <button data-testid="config2" className="config" onClick={() => changeConfig(1)}>Animals</button>
          <button data-testid="config3" className="config" onClick={() => changeConfig(2)}>Fruits</button>
        </div>        
      </div>
    </div>
  )
}
