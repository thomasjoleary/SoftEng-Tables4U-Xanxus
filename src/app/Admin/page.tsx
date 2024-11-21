'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Admin() {
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  return (
  <body>
    <button className="tables4u">Tables4U</button>
    <p className="subheader"> Welcome, Admin!</p>
    <p className="subtext">List of Restaurants</p>
    <div className="container">
        <table className="tableForAdminListRestaurants">
            <tbody>
                <tr>
                    <td><label className="restaurantName">Restaurant A</label></td>
                    <td><button className="button cancelButton"> Cancel Reservation </button></td>
                    <td><button className="button deleteButton"> Delete </button></td>
                    <td><button className="button utilizationButton"> Utilization</button></td>
                </tr>
            </tbody>
        </table>
    </div>
  </body>
    

  )
}
