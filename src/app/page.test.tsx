import { expect, test } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'

import React from 'react'
import Home from './page'

// to write this kind of test, we need to be able to render canvas, so we need 
// to simply run (once) npm install canvas. Tricky for GUI but these have to 
// be async functions that are cleaned up afterwards. Only for REACT gui
test('Home', async () => {
  const { getByText, getByTestId } = render(<Home />)
  const scoresElement = getByText(/Score: 0/i);     // scrape text that should be there...
  getByText(/Moves: 0/i);
  getByText(/Choose a Configuration!/i);
  getByText(/Colors/i);
  getByText(/Animals/i);
  getByText(/Fruits/i);
  getByText(/Reset Puzzle/i);
  getByText(/Check Puzzle/i);

  const b04 = getByTestId('0,4')
  const b03 = getByTestId('0,3')
  const b14 = getByTestId('1,4')
  const b13 = getByTestId('1,3')
  expect(b04.textContent).toBe("C")
  expect(b03.textContent).toBe("Y") //ensure normal config 1

  fireEvent.click(b04)
  fireEvent.click(b03)

  expect(b04.textContent).toBe("")
  expect(b03.textContent).toBe("CY")
  getByText(/Score: 2/i);
  getByText(/Moves: 1/i); //ensure merge works

  const reset = getByTestId('reset')
  fireEvent.click(reset)
  expect(b04.textContent).toBe("C")
  expect(b03.textContent).toBe("Y")
  fireEvent.click(b04)
  fireEvent.click(b13)
  fireEvent.click(b04)
  fireEvent.click(b03) //ensure resetting works

  expect(b04.textContent).toBe("")
  expect(b03.textContent).toBe("CY")
  getByText(/Score: 2/i);
  getByText(/Moves: 1/i); //ensure merge still works


  expect(b14.textContent).toBe("N")
  expect(b13.textContent).toBe("A")
  fireEvent.click(b03)
  fireEvent.click(b13)
  getByText(/Score: 3/i)
  getByText(/Moves: 2/i)
  fireEvent.click(b13)
  fireEvent.click(b14)
  getByText(/Score: 4/i)
  getByText(/Moves: 3/i) //ensure merging up to Cyan works

  const config2 = getByTestId('config2')
  fireEvent.click(config2)
  expect(b14.textContent).toBe("R")

  const check = getByTestId('check')
  fireEvent.click(check)


  cleanup()
})

