'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../model'
import { useRouter } from 'next/navigation'


const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Restaurant() {
  const [selectedRID, setSelectedRID] = React.useState<string>('')
  const [restaurants, setRestaurants] = React.useState<{ rid: string; name: string; address: string }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [redraw, forceRedraw] = React.useState(0)
  const [tables, setTables] = React.useState([])
  const [openingTime, setOpeningTime] = React.useState(0)
  const [activated, setActivated] = React.useState(0)
  const [closingTime, setClosingTime] = React.useState(24)
  const [restaurantName, setRestaurantName] = React.useState('')

  React.useEffect(() => {
    // Fetch restaurant details when the page loads
    const restaurantId = "b14d844b-50eb-4d5f-9a83-744a878c3e4c"
    axios
      .post(`${gateway}getRestaurant`, { rid: restaurantId }, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        const data = response.data
        setRestaurantName(data.name)
        setOpeningTime(parseInt(data.openingTime))
        setClosingTime(parseInt(data.closingTime))
        setActivated(parseInt(data.activated))
        setTables(data.tables.map((table, index) => ({
          number: index + 1, 
          seats: table.seats,
        })))
      })
      .catch((error) => console.error("Error fetching restaurant details:", error))
  }, [])

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

  function deleteRestManagerPageClickFromActive(rid: string) {
    console.log("Selected restaurant ID for deletion:", rid)
    setSelectedRID(rid)
    model.setPath("Delete Active Restaurant Manager")
    andRefreshDisplay()
  }

 
  function deleteRestManagerPageClickFromInactive(rid: string) {
      console.log("Selected restaurant ID for deletion:", rid)
      setSelectedRID(rid)
      model.setPath("Delete Inactive Restaurant Manager")
      andRefreshDisplay()
    }

  function backToUnactivatedHome() {
    console.log("back to unactivated home")
    model.setPath("Manage Unactivated")
    andRefreshDisplay()
  }

  function backToActivatedHome() {
    console.log("back to activated home")
    model.setPath("Manage Activated")
    andRefreshDisplay()
  }


  function activateRestPageClick() {
    console.log("activate restaurant")
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

    const restaurantId = "b14d844b-50eb-4d5f-9a83-744a878c3e4c"
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

  async function deleteRestaurantManager() { //axious instance?
   
    console.log("Deleting Restaurant")

    if (!selectedRID) { //if there's no RID then the delete function will not work
      console.error("No selectedRID to delete")
      return
    }

    console.log("Attempting to delete restaurant with ID:", selectedRID) //log the selected RID that is being deleted

    //send post request
    try {
      // send post request
      const response = await axios.post(

        gateway.concat("deleteRestaurantManager"),
  
        {
          body: {rid : selectedRID}
        }

      )
      // set res to the body json, parsed
    
    } catch (error) {
      console.log(error)
      return
    }

    // on successful creation:
   
    model.setPath("Successful Deletion from Manager")
    andRefreshDisplay()
  }

  const activateRestaurant = async (restaurantId: string) => {
    setLoading(true);
    console.log("trying to activate restaurant")
    try {
      const response = await axios.post(`${gateway}activateRestaurantManager`, {
        restaurantId: restaurantId
      });
      console.log(`Restaurant with ID ${restaurantId} has been activated.`);
      // Add any additional logic needed after activation, e.g., redirecting the user
    } catch (error) {
      console.error(`Failed to activate restaurant with ID ${restaurantId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Example restaurant ID, replace with actual ID from your data
  const restaurantId = "example-restaurant-id";

  return (
    <body>
      <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>


      

      {/* For unactivated restaurant page */}
      {model.isPath("Manage Unactivated") ? (
        <div className="container">
          <p className="subheader">Welcome, (Restaurant Name)</p>
          <button className="wide button" onClick={() => editRestPageClick()}>Edit Restaurant</button><br></br>
          <button className="wide button" onClick={() => deleteRestManagerPageClickFromInactive(selectedRID)}>Delete Restaurant</button><br></br>
          <button className="bold wide button" onClick={() => activateRestPageClick()}>Activate Restaurant</button><br></br>
        </div>
      ) : null}

      {/* For activated restaurant page */}
      {model.isPath("Manage Activated") ? (
        <div className="container">
          <p className="subheader">Welcome back, (Restaurant Name)</p>
          <button className="wide button">Show Availability</button>
          <button className="wide button">Manage Closed Days</button>
          <button className="bold wide button" onClick={() => deleteRestManagerPageClickFromActive(selectedRID)}>Delete Restaurant</button>
        </div>
      ) : null}

      {/* for activating restaurant */}
      {model.isPath("Activate Restaurant") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to activate (Restaurant Name)?</p>
          <p className="subtext">Once you activate your restaurant, you will not be able to un-activate it, or edit your schedule.</p>
          <button className="bold wide button" onClick={() => activateRestaurant("db3022e4-320a-4550-b91f-0fb64a0c859a")}>Activate Restaurant</button>
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
        <><div className="container">
          <h2>Editing {restaurantName || "(Restaurant Name)"}</h2>
          <label htmlFor="hours">Hours</label>
          <select
            id="hours"
            name="hours"
            value={openingTime}
            onChange={(e) => setOpeningTime(parseInt(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <span>to</span>
          <select
            id="end-hours"
            name="end-hours"
            value={closingTime}
            onChange={(e) => setClosingTime(parseInt(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
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
