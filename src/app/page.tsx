'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'

import { Model } from '../model'

export default function Home() {
  // initial instantiation of the Model
  const [model, setModel] = React.useState(new Model(0))
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  return (

    <div>
      hi
    </div>

  )
}
