'use client' // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Datetime } from '../../datetime'
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
  const [utilizationRest, setUtilizationRest] = React.useState<{ rid: string; name: string; address: string}>({ rid: "", name:"", address:""})
  const [utilizationFrom, setUtilizationFrom] = React.useState("")
  const [utilizationTo, setUtilizationTo] = React.useState("")
  const [report, setReport] = React.useState<{ date : string; time : string; unused : number; utilization : number; availability : number }[]>([])
  const hours = Array.from({length: 24}, (_, i) => i)
  const availabilitytables = Array(tables.length).fill(0).map((_, i) => i + 1)
  const [availSET, setAvailSet] = React.useState(0)
  const [stateClosedDays, setClosedDays] = React.useState<string[]>([])
  const [reservationRid, setReservationRid] = React.useState("")
  const [reservationList, setReservationList] = React.useState<{ rvid : string; guestEmail : string; numGuests : number; date : string; time : number }[]>([])

  const today = new Date()
  const todayyear = today.getFullYear()
  const todaymonth = today.getMonth() + 1
  const todayday = today.getDate()
  
  const [availability, setAvailability] = React.useState<boolean[][]>([])

  React.useEffect(() => {
    if (tables.length > 0) {
      console.log("first useeffect has been triggered")
      setAvailability(tables.map(() => Array(24).fill(true)))
      setAvailSet(1)
      console.log("first useeffect has finished")
    }
  }, [tables])

  React.useEffect(() => {
    console.log("Current availability (after reset in the USEEFFECT):", availability)
}, [availability])

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
    updateCurrentSettings()
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
    model.setPath("Edit Restaurant")
    andRefreshDisplay()
  }

  function utilizationButtonClick(rid : string, name : string, address : string, active : number) {
    if (active === 0) {
      alert("That restaurant isn't active!")
      return
    }

    setUtilizationRest({rid, name, address})

    model.setPath("Utilization Range Set")
    andRefreshDisplay()
  }

  async function utilizationSubmit( event:React.MouseEvent ) {
    event.preventDefault()

    let from = new Datetime(utilizationFrom)
    let to = new Datetime(utilizationTo)
    
    let res
    try {
      // send post request
      const response = await axios.post(

        gateway.concat("generateAvailabilityReport"),
  
        {
          body: {
            rid : utilizationRest.rid,
            startmonth : from.month,
            startday : from.day,
            startyear : from.year,
            starttime : from.hour,
            endmonth : to.month,
            endday : to.day,
            endyear : to.year,
            endtime : to.hour
          }
        }

      )
      // set res to the body json, parsed
      res = JSON.parse(response.data.body)
      console.log(res)
    } catch (error) {
      console.log(error)
      return
    }

    let rep = []
    for (let i = 0; i < res.report.length; i += 1) {
      let date = `${res.report[i].time.month}/${res.report[i].time.day}/${res.report[i].time.year}`
      rep.push({ date : date, time : res.report[i].time.hour, unused : res.report[i].unusedSeats, utilization : res.report[i].utilization.toFixed(2), availability : res.report[i].availability.toFixed(2) })
    }
    console.log(rep)
    setReport(rep)

    model.setPath("Utilization Report")
    andRefreshDisplay()

  }

  async function cancelResPageClick( rid : string) {

    setReservationRid(rid)

    let res

    try {
      // send post request
      const response = await axios.post(

        gateway.concat("listReservations"),
  
        {
          body: {
            rid : rid
          }
        }

      )
      // set res to the body json, parsed
      res = JSON.parse(response.data.body)
      console.log(res)
    } catch (error) {
      console.log(error)
      return
    }

    setReservationList(res)
    model.setPath("Admin List Reservations")
    andRefreshDisplay()

  }

  function getClosedDayInformation () {
    console.log("getClosedDayInformation() called")
    axios.post(`${gateway}getClosedDays`, { body: JSON.stringify({ rid: riddata }) })
      .then(response => {
        console.log("getClosedDayInformation() got a return")
        console.log("API Response:", response)
        if (response.status === 200) {
          if (response.data) {
            const data = JSON.parse(response.data.body)
            console.log("the data closeddays is:", data)
            const closedDays = data.ClosedDays.map((item: any) => item.date.slice(0,10))
            console.log("the new closeddays is:", closedDays)
            setClosedDays(closedDays)
            console.log("the current state of closeddays is:", stateClosedDays)
            console.log("closedday1:", stateClosedDays[0])
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
  }

  function closeDay (year : number, month : number, day : number) {
    if(year < todayyear){
      alert ("Cannot close a day in the past")
      return
    }
    if(year == todayyear && month < todaymonth){
      alert ("Cannot close a day in the past")
      return
    }
    if(year == todayyear && month == todaymonth && day < todayday){
      alert ("Cannot close a day in the past")
      return
    }
    const date = `${year}-${month}-${day}`
    axios.post(`${gateway}closeFutureDay`, { body: JSON.stringify({ rid: riddata, date: date })})
      .then(response => {
        console.log("closeDay() got a return")
        console.log("API Response:", response)
        if (response.status === 200) {
          console.log("closed day added successfully")
          getClosedDayInformation ()
        } 
        else {
          alert("bad thing happened dawg")
          console.error("Unexpected response:", response)
        }
      })
      .catch(error => {
        alert("An error occurred adding closed day.")
        console.error("Error updating restaurant:", error)
      })}
  async function adminCancelReservation( rvid : string ) {

    let res

    try {
      // send post request
      const response = await axios.post(

        gateway.concat("cancelReservationAdmin"),
  
        {
          body: {
            rvid : rvid
          }
        }

      )
      // set res to the body json, parsed
      res = JSON.parse(response.data.body)
      console.log(res)
    } catch (error) {
      console.log(error)
      return
    }

    alert("Reservation Deleted Successfully")
    
    cancelResPageClick(reservationRid)

  }

  function openDay (date : string) {
    //const date = `${year}-${month}-${day}`
    console.log(`openDay() called with date ${date}`)
    axios.post(`${gateway}openFutureDay`, { body: JSON.stringify({ rid: riddata, date: date })})
      .then(response => {
        console.log("openDay() got a return")
        console.log("API Response:", response)
        if (response.status === 200) {
          console.log("closed day removed successfully")
          getClosedDayInformation ()
        } 
        else {
          alert("bad thing happened dawg")
          console.error("Unexpected response:", response)
        }
      })
      .catch(error => {
        alert("An error occurred adding closed day.")
        console.error("Error updating restaurant:", error)
      })
  }

  async function updateCurrentSettings () {
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
            if (data.tables){
              const tables = data.tables.map((table: { tid: string; seats: number }) => ({
              number: table.tid,
              seats: table.seats,}))
              if(!availSET){
                setTables(tables)
                console.log("set the tables")
                setAvailability(tables.map(() => Array(24).fill(true)))
                console.log("availability set to true from inside updateCurrentSettings")
                andRefreshDisplay()
              }
            }
          
            
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

  function toRestaurantAvailability(year : number, month : number, day : number) {
    console.log(`dates passed from the html is ${year}-${month}-${day}, about to send it to the STATE`)
    initAvailability(year, month, day)
    andRefreshDisplay()
  }

  function toSelectDate() {
    model.setPath("Select Date")
    andRefreshDisplay()
  }

  function toManageClosedDays() {
    getClosedDayInformation()
    model.setPath("Manage Closed Days")
    andRefreshDisplay()
  }

  function setSelectDateToToday() {
  }

  function activateRestPageClick() {
    model.setPath("Activate Restaurant")
    andRefreshDisplay()
  }

  function editRestaurant() {
    const startHour = parseInt((document.getElementById("hours") as HTMLSelectElement).value)
    const endHour = parseInt((document.getElementById("end-hours") as HTMLSelectElement).value)
    console.log(`editrestaurant called with starthour ${startHour} and endHour ${endHour}`)

    if (startHour >= endHour) {
      alert("Please select valid hours.")
      return
    }

    const restaurantId = riddata
    const tablesData = tables.map((table) => ({
      tid: String(table.number),  
      seats: String(table.seats), 
    }))
    console.log("tables look like this:", JSON.stringify(tablesData, null, 2))
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

  const getCellStyle = (tableNum: number, hour: number, currentAvailability: boolean[][]) => {
    if (hour < openingTime || hour > closingTime) return 'bg-black-500 dark:bg-black-700'
    if(availability[tableNum-1] && availability[tableNum-1][hour] !== undefined){
      if (availability[tableNum-1][hour]) {
        return 'bg-green-500 dark:bg-green-700'
      }
      
    }
    return 'bg-red-500 dark:bg-red-700'
  }

  const  initAvailability = async (year : number, month : number, day : number) => {
    console.log(`dates set to ${year}-${month}-${day}, about to send it to RAR`)
    model.setPath("Restaurant Availability Report")
    await updateCurrentSettings()
    populateAvailability(year, month, day)
  }

  const populateAvailability = (year : number, month : number, day : number) => {
    console.log("populateAvailability() called")
    console.log("Current availability:", availability)
    
    const resetAvailability = tables.map(() => Array(24).fill(true))
    console.log("Current resetAvailability:", resetAvailability)
    setAvailability(resetAvailability)
    console.log("Current availability (RESET????):", availability)


    const date = `${year}-${month}-${day}`
    console.log(`date sent to axios looks like this ${date}`)

    axios.post(`${gateway}getRestaurantAvailability`, { body: JSON.stringify({ rid: riddata, date: date }) })
      .then(response => {
        console.log("populateAvailability() got a return")
        console.log("populateAvailability() API Response:", response)
        if (response.status === 200) {
          if (response.data) {
            const data = JSON.parse(response.data.body)
            console.log(`Parsed data looks like this:`, data)
            console.log(`Reservations data:`, data.reservations)
            setAvailability(tables.map(() => Array(24).fill(true)))
            console.log("Current availability should be reset:", availability)
            const updatedAvailability = tables.map(() => Array(24).fill(true))
            console.log("Current updatedAvailability:", updatedAvailability)
            data.reservations.forEach((reservation: any) => {
              console.log("enteredReservationLoop")
              const { tid, time } = reservation
              console.log(`tid is ${tid}, time is ${time}`)
              updatedAvailability[tid - 1][time] = false
              console.log("New UNCHANGED Current availability:", updatedAvailability)
            })
            console.log("left the loop, updatedAvailability is:", updatedAvailability)
            setAvailability(updatedAvailability)
            console.log("availability reset")
            console.log("New Current availability:", availability)
            andRefreshDisplay()

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

//the new html functions for the remainder of admin functions
function cancelReservationAdminClick(rid: string){
  model.setPath("Cancel Reservation Admin") //for the HTML itself, you need to enter a particular reservation ID instead of seeing a dropdown
  setriddata(rid)
  andRefreshDisplay()
}
function cancelReservationAdmin(){
  //lambda goes here
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
          <button className="wide button" onClick={() => editRestPageClick()}>Edit Restaurant</button>&nbsp;&nbsp;
          <button className="wide button" onClick={() => deleteRestManagerPageClickFromInactive()}>Delete Restaurant</button>&nbsp;&nbsp;
          <button className="bold wide button" onClick={() => activateRestPageClick()}>Activate Restaurant</button>
        </div>
        ) : null}

        {model.isPath("Manage Activated") ? (
        <div className="container">
          <p className="subheader">Welcome back, {restName}</p>
          <button className="wide button" onClick={() => toSelectDate()}>Show Availability</button>&nbsp;&nbsp;
          <button className="wide button" onClick={() => toManageClosedDays()}>Manage Closed Days</button>&nbsp;&nbsp;
          <button className="bold wide button" onClick={() => deleteRestManagerPageClickFromActive()}>Delete Restaurant</button>
        </div>
        ) : null}

        {model.isPath("Activate Restaurant") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to activate {restName}?</p>
          <p className="subtext">Once you activate your restaraunt, you will not be able to un-activate it, or edit your schedule.</p>
          <button className="bold wide button" onClick={() => activateRestaurant()}>Activate Restaurant</button>&nbsp;&nbsp;
          <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
        </div>
        ) : null}

        {model.isPath("Successful Activation") ? (
        <div className="container">
          <p className="subtext">Restaurant successfully activated!</p>
          <button className="wide button" onClick={() => backToActivatedHome()}>Go to Activated Home</button>
        </div>
        ) : null}

        {model.isPath("Manage Closed Days") ? (
        <div className="container">
          <h2 className="subheader">Manage Closed Days</h2>
          <div className="closed-days-list">
            {stateClosedDays.map((date, index) => (
              <div key={index} className="closed-day-row">
                <span className="subtext">{date} </span>
                <button className="button delete-button" onClick={() => openDay(date)}>Reopen</button>
              </div>
            ))}
          </div>
          <br></br>
          <div className="actions">
          <div className="input searchRestaurants container-select-date">
    <br></br>
       <select id="dropdown closed-year-search all">
           <option value="">Year</option>
           <option value="2024">2024</option>
           <option value="2025">2025</option>
           <option value="2026">2026</option>
       </select>
        
       <select id="dropdown closed-month-search all">
           <option value="">Month</option>
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
       </select>

       <select id="dropdown closed-day-search all">
           <option value="">Day</option>
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
           <option value="25">25</option>
           <option value="26">26</option>
           <option value="27">27</option>
           <option value="28">28</option>
           <option value="29">29</option>
           <option value="30">30</option>
           <option value="31">31</option>
       </select>
    <br></br>
</div>
            <button className="wide button" onClick={() => closeDay(
    (parseInt((document.getElementById("dropdown closed-year-search all") as HTMLSelectElement).value)),
    (parseInt((document.getElementById("dropdown closed-month-search all") as HTMLSelectElement).value)),
    (parseInt((document.getElementById("dropdown closed-day-search all") as HTMLSelectElement).value))
    )}>Add Closed Day</button><br></br><br></br>
            <button className="wide button" onClick={() => backToActivatedHome()}>Go Back</button>
          </div>
        </div>
        ) : null}

        {model.isPath("Restaurant Availability Report") ? (
        <div className="container mx-auto p-4">
        <br></br><br></br><br></br><br></br><br></br> {/*I couldn't figure out how to fix the css for this page, so 5 page breaks it is!*/}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-200 dark:bg-gray-700 sticky left-0 z-10">Time</th>
                {availabilitytables.map((availabilitytables, columnIndex) => (
                  <th key={availabilitytables} className="border p-2 bg-gray-200 dark:bg-gray-700 min-w-[100px]">
                    {availabilitytables}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, rowIndex) => (
                <tr key={hour}>
                  <td className="border p-2 text-center sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {availabilitytables.map((availabilitytables, columnIndex) => (
                    <td 
                      key={`${availabilitytables}-${hour}`}
                      className={`border p-2 text-center min-w-[100px] 
                        ${getCellStyle(columnIndex + 1, rowIndex, availability)}`}
                    >
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br></br><button className="wide button" onClick={() => backToActivatedHome()}>Go Back</button>
      </div>
        ) : null}

        {model.isPath("Select Date") ? (
       <div className="input searchRestaurants container-select-date">
        <br></br>
       <select id="dropdown year-search all">
           <option value="">Year</option>
           <option value="2024">2024</option>
           <option value="2025">2025</option>
       </select>
        
       <select id="dropdown month-search all">
           <option value="">Month</option>
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
       </select>

       <select id="dropdown day-search all">
           <option value="">Day</option>
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
           <option value="25">25</option>
           <option value="26">26</option>
           <option value="27">27</option>
           <option value="28">28</option>
           <option value="29">29</option>
           <option value="30">30</option>
           <option value="31">31</option>
       </select>
       <br></br>
       <button className="wide button center-test" onClick={() => toRestaurantAvailability(
    (parseInt((document.getElementById("dropdown year-search all") as HTMLSelectElement).value)),
    (parseInt((document.getElementById("dropdown month-search all") as HTMLSelectElement).value)),
    (parseInt((document.getElementById("dropdown day-search all") as HTMLSelectElement).value))
  )}> Find availability for this day </button>
      </div>
      
        ) : null}

        {model.isPath("Edit Restaurant") ? (
        //the <> here is required for some stupid reason, don't remove it
        <><div className="container">
          <h2 className="subheader">Editing {restName}</h2><br></br>
          <label htmlFor="hours" className="subtext">Hours</label><br></br>
          <select id="hours" className="subtext black-text" name="hours" value={openingTime} onChange={handleOpenChange}>
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
          <span className="subtext">  to  </span>
          <select id="end-hours" className="subtext black-text" name="end-hours" value={closingTime} onChange={handleCloseChange}>
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
        <br></br>
        <div className="container">
            <div className="tables-wrapper">
              <div className="table-entries-wrapper">
                {tables.sort((a, b) => a.number - b.number).map((table) => (
                  <div key={table.number} className="table-entry">
                    <label htmlFor ={`table${table.number}`} className="subtext">Table {table.number} </label>
                    <label className="subtext dark:bg-gray-200 black-text" htmlFor={`table${table.number}`}> &nbsp;{table.seats}&nbsp;</label>&nbsp;
                    <span className="subtext"> seats </span>
                    <button
                      className="table-plus subtext button"
                      onClick={() => updateSeats(table.number, 1)}
                    >
                      + 
                    </button> 
                    &nbsp;&nbsp;
                    <button
                      className="table-minus subtext button"
                      onClick={() => updateSeats(table.number, -1)}
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="buttons-container">
              <div className="extra-buttons">
                <button id="global-plus" className="button" onClick={addTable}>+</button>&nbsp;&nbsp;
                <button id="global-minus" className="button" onClick={removeTable}>-</button>
              </div>
              <br></br>
              <div className="main-buttons">
                <button id="save-changes" className="button" onClick={editRestaurant}>Save Changes</button>
                <br></br><br></br>
                <button id="go-back" className="button" onClick={backToUnactivatedHome}>Go back</button>
              </div>
            </div>
          </div></>
        ) : null}

        {model.isPath("Delete Inactive Restaurant Manager") ? (
          <div className="container">
            <p className="subheader">Are you sure you want to delete the inactive {restName}?</p>
            <p className="subheader">This action cannot be undone</p>
            <button className="bold wide button" onClick={() => deleteRestaurantManager()}>Delete Restaurant</button>
            <button className="wide button" onClick={() => backToUnactivatedHome()}>Go Back</button>
          </div>
        ) : null}

        {model.isPath("Delete Active Restaurant Manager") ? (
        <div className="container">
          <p className="subheader">Are you sure you want to delete the active {restName}?</p>
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
                      <td><button className="button cancelButton" onClick={() => cancelResPageClick(restaurant.rid)}> Cancel Reservation </button></td>
                      <td><button className="button deleteButton" onClick={() => deleteRestPageClick(restaurant.rid)}> Delete </button></td>
                      <td><button className="button utilizationButton" onClick={() => utilizationButtonClick(restaurant.rid, restaurant.name, restaurant.address, restaurant.active)}> Utilization</button></td>
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

        {model.isPath("Utilization Range Set") ? (

          <div className='container'>
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>
            <p className="subheader"> Set Utilization Report Range</p>
            <form>
              <div className="container-utilization">
                <table className="tableForUtilizationRange">
                  <tbody>


                    <tr>
                      <td>From:</td>
                      <td><input type="datetime-local" value={utilizationFrom} onChange={(e) => setUtilizationFrom(e.target.value)}></input></td>
                    </tr>
                    <tr>
                      <td>To:</td>
                      <td><input type="datetime-local" min={utilizationFrom} value={utilizationTo} onChange={(e) => setUtilizationTo(e.target.value)}></input></td>
                    </tr>
                  </tbody>
                </table>
                <button type="submit" className="wide button" onClick={(e) => utilizationSubmit(e)}>Submit</button>
              </div>
            </form>
          </div>
        ) : null}

        {model.isPath("Utilization Report") ? (

        <div className='container'>
          <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

          <p className="subheader">Report for {utilizationRest.name}</p>
          <div className="container-list-admin">
            <table className="tableForAdminListRestaurants">
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>Hour</td>
                  <td>Unused Seats</td>
                  <td>Utilization</td>
                  <td>Availability</td>
                </tr>
                {report.length > 0 ? (
                  report.map((hour, row) => (
                    <tr className="reportRow" key={row}>
                      <td>{hour.date}</td>
                      <td>{hour.time}</td>
                      <td>{hour.unused}</td>
                      <td>{`${hour.utilization}%`}</td>
                      <td>{`${hour.availability}%`}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>No report available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : null}

      {model.isPath("Admin List Reservations") ? (

        <div className='container'>
          <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

          <p className="subheader">List of Reservations</p>
          <div className="container-list-admin">
            <table className="tableForAdminListRestaurants">
              <tbody>
                <tr>
                  <td>Reservation ID</td>
                  <td>Guest Email</td>
                  <td>Number of Guests</td>
                  <td>Date</td>
                  <td>Time</td>
                  <td></td>
                </tr>
                {reservationList.length > 0 ? (
                  reservationList.map((rv, row) => (
                    <tr className="reportRow" key={row}>
                      <td>{rv.rvid}</td>
                      <td>{rv.guestEmail}</td>
                      <td>{rv.numGuests}</td>
                      <td>{`${rv.date}%`}</td>
                      <td>{`${rv.time}%`}</td>
                      <td>
                        <button onClick={() => adminCancelReservation(rv.rvid)}>Cancel</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>No report available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

        {model.isPath("Cancel Reservation Admin") ? (
          <div className='container'>
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>
            <p className="subheader">Cancel Reservation</p>
            <p className="subtext">Select a customer's resrevation to cancel</p>
          https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
            <button className="button" onClick={() => backToAdminList()}> Go Back </button>
            <div className="container-list-admin">
              <table className="tableForAdminListRestaurants">
                <tbody>
                  {restaurants.length > 0 ? (
                    restaurants.map((restaurant, row) => (
                      <tr className="restaurantRow" key={row}>
                        <td>{restaurant.name}</td>
                        <td>{"restaurant.rvid"}</td>
                        <td>{"restaurant.userEmail"}</td>
                        <td><button className="button cancelButton" onClick={() => cancelReservationAdmin()}>Cancel</button></td>
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
          </div>
        ) : null}

        {model.isPath("Generate Availability Report") ? (
                  <div className='container'>
                   <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>
                   <p className="subheader">enjoy your report</p>
                   <button className="button" onClick={() => backToAdminList()}> Go Back </button>
                </div>
        ) : null}
    </div>
  )
}
