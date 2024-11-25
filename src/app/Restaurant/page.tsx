'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../model'
import { useRouter } from 'next/navigation'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Restaurant() {
  const [redraw, forceRedraw] = React.useState(0)
  const [tables, setTables] = React.useState([
    { number: 1, seats: 3 },
    { number: 2, seats: 3 },
    { number: 3, seats: 3 },
  ])
  // use conditional for if activated vs unactivated???
  const [model, setModel] = React.useState(new Model("Manage Unactivated"))
  const router = useRouter()

  const addTable = () => {
    setTables((prevTables) => [
      ...prevTables,
      { number: prevTables.length + 1, seats: 3},
    ])
  }

  const removeTable = () => {
    setTables((prevTables) => prevTables.slice(0, prevTables.length - 1))
  }

  const updateSeats = (tableNumber: number, delta: number) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.number === tableNumber
          ? { ...table, seats: Math.max(table.seats + delta, 0) }
          : table
      )
    )
  }
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
    const startHour = parseInt((document.getElementById("hours") as HTMLSelectElement).value)
    const endHour = parseInt((document.getElementById("end-hours") as HTMLSelectElement).value)

    if (startHour >= endHour) {
      alert("Please select valid hours.")
      return
    }

    const restaurantId = "1"
    const tablesData = tables.map((table) => ({
      tid: String(table.number),  
      seats: String(table.seats), 
    }))
  
    const requestBody = {
      rid: restaurantId,
      hours: {
        open: String(startHour),
        close: String(endHour), 
      },
      tables: tablesData,
    }
    const jsonData = JSON.stringify({ body: JSON.stringify(requestBody) })
    axios
      .post(`${gateway}editRestaurant`, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Restaurant updated successfully:", response.data)
        model.setPath("Edit Restaurant Success")
        andRefreshDisplay()
      })
      .catch((error) => {
        console.error("Error updating restaurant:", error)
        alert("There was an error updating the restaurant. Please try again.")
      })
    andRefreshDisplay()
  }

  function deleteRestaurantManager() {

    // Add Lambda calls to delete restaurant here


    // add something for a failed delete here:


    // on successful deletion:
    model.setPath("Successful Deletion from Manager")
    andRefreshDisplay()
  }

  function activateRestaurant() { // this is the function that will be called when the user clicks the "Activate Restaurant" button

    // Add Lambda calls to edit restaurant here

    axios



    // add something for a failed activation here:


    // on successful activation:
    model.setPath("Successful Activation")
    andRefreshDisplay()
  }


  return (
    <body>
      <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

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
        //the <> here is required for some stupid reason, don't remove it
        <><div className="container">
          <h1>Tables4U</h1>
          <h2>Editing (Restaurant Name)</h2>
          <label htmlFor="hours">Hours</label>
          <select id="hours" name="hours">
            <option value="0">Time</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
          </select>
          <span>to</span>
          <select id="end-hours" name="end-hours">
            <option value="24">Time</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
          </select>
        </div>
        <div className="container">
            <div className="table-container">
              <div className="table-entries-wrapper">
                {tables.map((table) => (
                  <div key={table.number} className="table-entry">
                    <label htmlFor={`table${table.number}`}>Table {table.number}</label>
                    <input type="number" id={`table${table.number}`} value={table.seats} readOnly />
                    <span>seats</span>
                    <button
                      className="table-plus"
                      onClick={() => updateSeats(table.number, 1)}
                    >
                      +
                    </button>
                    <button
                      className="table-minus"
                      onClick={() => updateSeats(table.number, -1)}
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="button-container">
              <div className="extra-buttons">
                <button id="global-plus" onClick={addTable}>+</button>
                <button id="global-minus" onClick={removeTable}>-</button>
              </div>
              <div className="main-buttons">
                <button id="save-changes" onClick={editRestaurant}>Save Changes</button>
                <button id="go-back" onClick={backToUnactivatedHome}>Go back</button>
              </div>
            </div>
          </div></>
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
