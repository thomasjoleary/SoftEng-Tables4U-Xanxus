'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Login() {
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  return (
  <body>
    <div className="container">
        <button className="tables4u">Tables4U</button>
        <p className="subtext">Welcome Restaurant Owner</p>
        <p className="subtext">we can get you more customers dude, trust us</p>

        <form>
            <input
                type="text" 
                placeholder="(enter Restaurant Code)" 
                className="button" >
            </input>
            <br></br>
            <button type="submit" className="wide button">Log in</button>
        </form>

        <p className="subtext">First time here?</p>
        <button className="button">Create Restaurant</button>
    </div>
  </body>
    

  )
}
