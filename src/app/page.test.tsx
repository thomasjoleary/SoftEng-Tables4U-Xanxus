import { expect, test } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'

import React from 'react'
import Home from './page'

test('Home', async () => {
  const { getByText, getByTestId } = render(<Home />)
})

