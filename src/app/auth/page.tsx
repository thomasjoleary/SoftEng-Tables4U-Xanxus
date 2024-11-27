'use client' // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../model'
import { useRouter } from 'next/navigation'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Login() {
  const [redraw, forceRedraw] = React.useState(0)
  const [model, setModel] = React.useState(new Model("Login"))
  const [riddata, setriddata] = React.useState("")
  const router = useRouter()
  const [restaurants, setRestaurants] = React.useState<{ rid: string; name: string; address: string; active: number }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [restName, setRestName] = React.useState("")
  const [tables, setTables] = React.useState<{ number: number; seats: number}[]>([])
  const [openingTime, setOpeningTime] = React.useState(0)
  const [closingTime, setClosingTime] = React.useState(24)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function deleteRestPageClick(rid: string) {
    console.log("Selected restaurant ID for deletion:", rid)
    setriddata(rid)
    model.setPath("Admin Delete Restaurant")
    andRefreshDisplay()
  }

  async function deleteRestaurantAdmin( event : React.MouseEvent ) {
    event.preventDefault()
    if (!riddata) {
      console.error("No riddata to delete")
      return
    }
    console.log("Attempting to delete restaurant with ID:", riddata)

    //send post request
    await axios.post(`${gateway}deleteRestaurantAdmin`, { body: JSON.stringify({ rid: riddata }) } 
    )
      .then(() => {
        console.log("Restaurant deleted successfully.")
      })
      .catch((error) => {
        console.error("Failed to delete restaurant", error)
      })

    // on successful deletion:
    backToAdminList()
  }

  function backToAdminList() {
    model.setPath("Admin List Restaurants")
    listRest()
    andRefreshDisplay()
  }

  function deleteRestaurantManager() {

    //for now there's no real difference between deleting a restaurant as an admin or as a manager
    //they're just separated in the UI
    //two seperate lambdas though, just called the same way

    if (!riddata) {
      console.error("No riddata to delete")
      return
    }
    console.log("Attempting to delete restaurant with ID:", riddata)

    //send post request
    axios.post(`${gateway}deleteRestaurantManager`, { body: JSON.stringify({ rid: riddata }) } //deleteRestaurantManager is identical to deleteRestaurantAdmin
    )
      .then(() => {
        console.log("Restaurant deleted successfully.")
      })
      .catch((error) => {
        console.error("Failed to delete restaurant", error)
      })

    model.setPath("Successful Deletion from Manager")
    andRefreshDisplay()
  }

  function activateRestaurant() {

    if (!riddata) {
      console.error("No riddata to delete")
      console.error("No riddata to delete")
      return
    }
    console.log("Attempting to activate restaurant with ID:", riddata)

    //send post request
    axios.post(`${gateway}activateRestaurant`, { body: JSON.stringify({ rid: riddata }) } 
    
    )
    
      .then(() => {
        console.log("Restaurant activated successfully.")
      })
      .catch((error) => {
        console.error("Failed to activate restaurant", error)
      })
    model.setPath("Successful Activation")
    andRefreshDisplay()
  }


  async function listRest() {

    let res

    try {
      // send get request
      const response = await axios.get(
        gateway.concat("listRestaurants")
      )
      // set res to the body json, parsed
      res = JSON.parse(response.data.body)
      setRestaurants(res.restaurants || [])
    } catch (error) {
      console.log(error)
      return
    }


  }

  function createRestPageClick() {
    model.setPath("Create Restaurant")
    andRefreshDisplay()
  }

  async function loginButton ( event : React.MouseEvent ) {
    event.preventDefault()
    let res
    console.log(riddata)
    try {
      // send post request
      const response = await axios.post(

        gateway.concat("login"),
  
        {
          body: {rid : riddata}
        }

      )
      // set res to the body json, parsed
      res = JSON.parse(response.data.body)
      console.log(res)
    } catch (error) {
      console.log(error)
      return
    }
    if (!res.rid) {
      alert(res.error)
    }

    // set rid to model for auth purposes later on
    model.setRid(res.rid)

    setRestName(res.name)

    if (res.admin === "yes") {
      // if admin
      model.setPath("Admin List Restaurants")
      listRest()
      andRefreshDisplay()
    } else if (res.admin === "no") {
      // if restaurant
      if (res.active === 1) {
        model.setPath("Manage Activated")
      } else {
        model.setPath("Manage Unactivated")
      }
      andRefreshDisplay()
    }
    
  }

  function createRestaurant() {
    console.log("Creating restaurant...")
    const nameInput = (document.querySelector('input[placeholder="(enter Restaurant Name)"]') as HTMLInputElement)?.value
    const addressInput = (document.querySelector('input[placeholder="(enter Restaurant Address)"]') as HTMLInputElement)?.value

    if (!nameInput || !addressInput) {
      alert("Please provide both a restaurant name and address.")
      return
    }

    const requestBody = {
      body: JSON.stringify({
        name: nameInput,
        address: addressInput,
      }),
    }

    // add something for a failed creation here:

    axios.post(`${gateway}createRestaurant`, requestBody)
    .then(response => {
      console.log("API Response:", response)
      if (response.status === 200) {
        if (response.data) {
          const data = JSON.parse(response.data.body)
          const restaurantId = data.rid
          model.setLoginID(restaurantId)
          model.setPath("Successful Creation")
          andRefreshDisplay()
        } else {
          alert("No response data received.")
          console.error("No data in response:", response)
        }
      } else {
        alert("Failed to create restaurant. Please try again.")
        console.error("Unexpected response:", response)
      }
    })
    .catch(error => {
      alert("An error occurred while creating the restaurant.")
      console.error("Error creating restaurant:", error)
    })
  }

  function backToLogin() {
    model.setPath("Login")
    andRefreshDisplay()
  }

  function editRestPageClick() {
    updateCurrentSettings()
  }

  function updateCurrentSettings() {
    console.log("updateCurrentSettings() called")
    axios.post(`${gateway}getRestaurantInformation`, { body: JSON.stringify({ rid: riddata }) })
      .then(response => {
        console.log("updateCurrentSettings() got a return")
        console.log("API Response:", response)
        if (response.status === 200) {
          if (response.data) {
            const data = JSON.parse(response.data.body)
            const openingTime= data.openingTime
            setOpeningTime(openingTime)
            const closingTime= data.closingTime
            setClosingTime(closingTime)
            const tables = data.tables.map((table: { tid: string; seats: number }) => ({
              number: table.tid,
              seats: table.seats,
            }))
            setTables(tables)
          }
          else {
            alert("No response data received.")
            console.error("No data in response:", response)
          }
        } 
        else {
          alert("Failed to create restaurant. Please try again.")
          console.error("Unexpected response:", response)
        }
      })
      .catch(error => {
        alert("An error occurred while updating the restaurant.")
        console.error("Error updating restaurant:", error)
      })

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

    const restaurantId = riddata
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
        alert("Restaurant updated successfully")
        andRefreshDisplay()
      })
      .catch((error) => {
        console.error("Error updating restaurant:", error)
        alert("There was an error updating the restaurant. Please try again.")
      })
    andRefreshDisplay()
  }

  
  const addTable = () => {
    setTables((prevTables) => [
      ...prevTables, { number: prevTables.length + 1, seats: 3},
    ])
  }

  const removeTable = () => {
    setTables((prevTables) => prevTables.slice(0, prevTables.length - 1))
  }

  const updateSeats = (tableNumber: number, delta: number) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.number === tableNumber ? { ...table, seats: Math.max(table.seats + delta, 0) } : table
      )
    )
  }

  const handleOpenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOpeningTime(Number(event.target.value))
  }

  const handleCloseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setClosingTime(Number(event.target.value))
  }

  return (

    <div className="container">
        <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>
        
        { model.isPath("Login") ? (
          <div className="container">
            <p className="subtext">Welcome Restaurant Owner</p>
            <p className="subtext">we can get you more customers dude, trust us</p>
            <form>
              <input
                  type="text" 
                  placeholder="(enter Restaurant Code)" 
                  className="button"
                  value={riddata}
                  onChange={(e) => setriddata(e.target.value)}>
              </input>
              <br></br>
              <button type="submit" className="wide button" onClick={(e) => loginButton(e)}>Log in</button>
            </form>

            <p className="subtext">First time here?</p>
            <button className="button" onClick={() => createRestPageClick()}>Create Restaurant</button>
          </div>
          ) : null }

        { model.isPath("Create Restaurant") ? (
          <div className="container">
            <p className="subtext">Create a Restaurant</p>
      
            <input 
                type="text" 
                placeholder="(enter Restaurant Name)" 
                className="button"></input>
            <br></br>
            <input 
                type="text" 
                placeholder="(enter Restaurant Address)" 
                className="button"></input>
            <br></br>
            <button className="wide button" onClick={() => createRestaurant()}>Create Restaurant</button>
            
            <p className="subtext">Already have a Restaurant?</p>
            <button className="button" onClick={() => backToLogin()}>Back to Login</button>
          </div>
          ) : null }

        { model.isPath("Successful Creation") ? (
          
          <div className="container">
              <button className="tables4u">Tables4U</button>
              <p className="subtext">Restaurant successfully created!</p>
              <p className="subheader">{model.getLoginID()}</p>
              <p className="subtext">This is your only login credential. Write it down somewhere safe, and keep it secret!</p>
              <button className="wide button" onClick={() => backToLogin()}>Go to Login</button>
          </div>
          
          ) : null }

      {model.isPath("Manage Unactivated") ? (
        <div className="container">
          <p className="subheader">Welcome, {restName}</p>
          <button className="wide button" onClick={() => editRestPageClick()}>Edit Restaurant</button><br></br>
          <button className="wide button" onClick={() => deleteRestManagerPageClickFromInactive()}>Delete Restaurant</button><br></br>
          <button className="bold wide button" onClick={() => activateRestPageClick()}>Activate Restaurant</button><br></br>
        </div>
      ) : null}

      {model.isPath("Manage Activated") ? (
        <div className="container">
          <p className="subheader">Welcome back, {restName}</p>
          <button className="wide button">Show Availability</button>
          <button className="wide button">Manage Closed Days</button>
          <button className="bold wide button" onClick={() => deleteRestManagerPageClickFromActive()}>Delete Restaurant</button>
        </div>
      ) : null}

      {model.isPath("Activate Restaurant") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to activate(Restaurant Name)?</p>
          <p className="subtext">Once you activate your restaraunt, you will not be able to un-activate it, or edit your schedule.</p>
          <button className="bold wide button" onClick={() => activateRestaurant()}>Activate Restaurant</button>
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {model.isPath("Successful Activation") ? (
        <div className="container">
          <p className="subtext">Restaurant successfully activated!</p>
          <button className="wide button" onClick={() => backToActivatedHome()}>Go to Activated Home</button>
        </div>
      ) : null}

      {model.isPath("Edit Restaurant") ? (
        //the <> here is required for some stupid reason, don't remove it
        <><div className="container">
          <h1>Tables4U</h1>
          <h2>Editing {restName}</h2>
          <label htmlFor="hours">Hours</label>
          <select id="hours" name="hours" value={openingTime} onChange={handleOpenChange}>
            <option value="0">Time</option>
            <option value="0">0</option>
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
          <select id="end-hours" name="end-hours" value={closingTime} onChange={handleCloseChange}>
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

      {model.isPath("Delete Inactive Restaurant Manager") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to delete the inactive (Restaurant Name)?</p>
          <p className="subheader">This action cannot be undone</p>
          <button className="bold wide button" onClick={() => deleteRestaurantManager()}>Delete Restaurant</button>
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {model.isPath("Delete Active Restaurant Manager") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to delete the active (Restaurant Name)?</p>
          <p className="subheader">This action cannot be undone</p>
          <button className="bold wide button" onClick={() => deleteRestaurantManager()}>Delete Restaurant</button>
          <button className="wide button" onClick={() => backToActivatedHome()}>Go Back</button>
        </div>
      ) : null}

      {model.isPath("Successful Deletion from Manager") ? (
        <div className="container">
          <p className="subtext">Restaurant successfully deleted!</p>
        </div>
      ) : null}

        {model.isPath("Admin List Restaurants") ? (

          <div className='container'>
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

            <p className="subheader"> Welcome, Admin!</p>
            <p className="subtext">List of Restaurants</p>
            <div className="container-list-admin">
              <table className="tableForAdminListRestaurants">
                <tbody>
                  {restaurants.length > 0 ? (
                    restaurants.map((restaurant, row) => (
                      <tr className="restaurantRow" key={row}>
                        <td>{restaurant.rid}</td>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.address}</td>
                        {(restaurant.active === 0) ? (
                          <td>Inactive</td>
                        ): <td>Active</td>}
                        <td><button className="button cancelButton"> Cancel Reservation </button></td>
                        <td><button className="button deleteButton" onClick={() => deleteRestPageClick(restaurant.rid)}> Delete </button></td>
                        <td><button className="button utilizationButton"> Utilization</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>No restaurants available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <script>
              listRest()
            </script>
          </div>
        ) : null}

        {model.isPath("Admin Delete Restaurant") ? (

          <div className='container'>
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

            
              <p className="subheader">Deleting Restaurant</p>
              <p className="subtext"> Are you sure you want to delete this restaurant? </p>
              <p className="subtext"> This action cannot be undone.</p>
              <button className="button" onClick={(e) => deleteRestaurantAdmin(e)}> Yes</button>
              <button className="button" onClick={() => backToAdminList()}> No </button>
            
          </div>

        ) : null}

        {model.isPath("Successful Deletion") ? (
          <div className="container">
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

            <p className="subtext">Restaurant successfully deleted!</p>
            <button className="wide button" onClick={() => backToAdminList()}>Go to List of Restaurants</button>
          </div>
        ) : null}
        
    </div>

    

  )
}
