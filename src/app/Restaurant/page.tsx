'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Restaurant() {
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  return (
  <body>
    <div className="container">
        <button className="tables4u">Tables4U</button>
        <p className="subheader">Welcome, (Restaurant Name)</p>
        <button className="wide button">Edit Restaurant</button><br></br>
        <button className="wide button">Delete Restaurant</button><br></br>
        <button className="bold wide button">Activate Restaurant</button><br></br>
    </div>
  </body> //THIS CURRENTLY WILL ONLY SHOW THE UNACTIVATED VIEW
    

  )
}
