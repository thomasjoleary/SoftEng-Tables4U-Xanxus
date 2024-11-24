'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../model'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Restaurant() {
  const [redraw, forceRedraw] = React.useState(0)
  // use conditional for if activated vs unactivated???
  const [model, setModel] = React.useState(new Model("Manage Unactivated"))

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function editRestPageClick() {
    model.setPath("Edit Restaurant")
    andRefreshDisplay()
  }

  function deleteRestManagerPageClickFromActive() {
    model.setPath("Delete Active Restaurant Manager")
    andRefreshDisplay()
  }

  function deleteRestManagerPageClickFromInactive() {
    model.setPath("Delete Inactive Restaurant Manager")
    andRefreshDisplay()
  }

  function backToUnactivatedHome() {
    model.setPath("Manage Unactivated")
    andRefreshDisplay()
  }

  function backToActivatedHome() {
    model.setPath("Manage Activated")
    andRefreshDisplay()
  }


  function activateRestPageClick() {
    model.setPath("Activate Restaurant")
    andRefreshDisplay()
  }

  function editRestaurant() {

    // Add Lambda calls to edit restaurant here


    // add something for a failed edit here:


    andRefreshDisplay()
  }

  function deleteRestaurantManager() {

    // Add Lambda calls to delete restaurant here


    // add something for a failed delete here:


    // on successful deletion:
    model.setPath("Successful Deletion from Manager")
    andRefreshDisplay()
  }

  function activateRestaurant() {

    // Add Lambda calls to edit restaurant here


    // add something for a failed activation here:


    // on successful activation:
    model.setPath("Successful Activation")
    andRefreshDisplay()
  }


  return (
    <body>
      <button className="tables4u">Tables4U</button>

      {/* For unactivated restaurant page */}
      {model.isPath("Manage Unactivated") ? (
        <div className="container">
          <p className="subheader">Welcome, (Restaurant Name)</p>
          <button className="wide button" onClick={() => editRestPageClick()}>Edit Restaurant</button><br></br>
          <button className="wide button" onClick={() => deleteRestManagerPageClickFromInactive()}>Delete Restaurant</button><br></br>
          <button className="bold wide button" onClick={() => activateRestPageClick()}>Activate Restaurant</button><br></br>
        </div>
      ) : null}

      {/* For activated restaurant page */}
      {model.isPath("Manage Activated") ? (
        <div className="container">
          <p className="subheader">Welcome back, (Restaurant Name)</p>
          <button className="wide button">Show Availability</button>
          <button className="wide button">Manage Closed Days</button>
          <button className="bold wide button" onClick={() => deleteRestManagerPageClickFromActive()}>Delete Restaurant</button>
        </div>
      ) : null}

      {/* for activating restuarant */}
      {model.isPath("Activate Restaurant") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to activate(Restaurant Name)?</p>
          <p className="subtext">Once you activate your restaraunt, you will not be able to un-activate it, or edit your schedule.</p>
          <button className="bold wide button" onClick={() => activateRestaurant()}>Activate Restaurant</button>
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {/* for successfully activating restuarant */}
      {model.isPath("Successful Activation") ? (
        <div className="container">
          <p className="subtext">Restaurant successfully activated!</p>
          <button className="wide button" onClick={() => backToActivatedHome()}>Go to Activated Home</button>
        </div>
      ) : null}

      {/* For editing restaurant page */}
      {model.isPath("Edit Restaurant") ? (
        <div className="container">
          <p className="subheader">PLACEHOLDER UNTIL TIM FIXES JAVASCRIPT</p>

          <button className="wide button" onClick={() => editRestaurant()}>Save Changes</button>
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {/* For deleting inactive restaurant page */}
      {model.isPath("Delete Inactive Restaurant Manager") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to delete the inactive (Restaurant Name)?</p>
          <p className="subheader">This action cannot be undone</p>
          <button className="bold wide button" onClick={() => deleteRestaurantManager()}>Delete Restaurant</button>
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {/* For deleting active restaurant page */}
      {model.isPath("Delete Active Restaurant Manager") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to delete the active (Restaurant Name)?</p>
          <p className="subheader">This action cannot be undone</p>
          <button className="bold wide button" onClick={() => deleteRestaurantManager()}>Delete Restaurant</button>
          <button className="wide button" onClick={() => backToActivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {/* For successful deletion of restaurant page */}
      {model.isPath("Successful Deletion from Manager") ? (
        <div className="container">
          <p className="subtext">Restaurant successfully deleted!</p>
          {/* WHERE TO RE-ROUTE THEM NOW???? */}
        </div>
      ) : null}


    </body>


  )
}
