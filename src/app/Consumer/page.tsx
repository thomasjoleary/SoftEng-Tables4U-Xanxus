'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../model'
import { useRouter } from 'next/navigation'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Consumer() {
    const [redraw, forceRedraw] = React.useState(0)
    const [model, setModel] = React.useState(new Model("Consumer Home"))
    const router = useRouter()
    const [restaurants, setRestaurants] = React.useState<{ name: string; address: string }[]>([])
    const [availableRestaurants, setAvailableRestaurants] = React.useState<{ name: string; address: string }[]>([])
    const [specificRest, setSpecificRest] = React.useState<{ name: string; address: string; tableID: string; seats: string }[]>([])
    const [loading, setLoading] = React.useState(false)
    const [riddata, setriddata] = React.useState("")
    const [selectedTable, setSelectedTable] = React.useState("") //for table id primarily
    const [reservationDetails, setReservationDetails] = React.useState<{year: number;month: number;day: number;time: number;guests: number}>()
    const [rvid, setRVID] = React.useState("")


    // helper function that forces React app to redraw whenever this is called.
    function andRefreshDisplay() {
        forceRedraw(redraw + 1)
    }

    function listRestaurantsPageClick() {
        listAllRestaurants()
        model.setPath("List Restaurants")
        andRefreshDisplay()
    }

    function listAllRestaurants() {
        setLoading(true)
        //send get request
        axios
            .get(`${gateway}listActiveRestaurants`)
            //parse the response and set it to the new array of restaurants
            .then((response) => {
                const parsedBody = JSON.parse(response.data.body)
                setRestaurants(parsedBody.restaurants || [])
            })
            .catch((error) => {
                console.error("Failed to fetch restaurants", error)
            })
            .finally(() => {
                setLoading(false)
            });
    }

    function searchRestaurantsPageClick() {
        searchRestaurants()
        //model.setPath("Search Restaurants")
        andRefreshDisplay()
    }

    function searchRestaurants() {
        const year = parseInt((document.getElementById("dropdown year-search all") as HTMLSelectElement).value)
        const month = parseInt((document.getElementById("dropdown month-search all") as HTMLSelectElement).value)
        const day = parseInt((document.getElementById("dropdown day-search all") as HTMLSelectElement).value)
        const time = parseInt((document.getElementById("dropdown time-search all") as HTMLSelectElement).value)
        const guests = parseInt((document.getElementById("dropdown guests-search all") as HTMLSelectElement).value)

        if (!year || !month || !day || !time || !guests) {
            alert("All fields must be filled!")
            return
        }
        const selectedDate = new Date(year, month - 1, day)
        const selectedHour = time

        const currentDate = new Date()
        const currentHour = currentDate.getHours()

        if (selectedDate < currentDate ||
            (selectedDate.toDateString() === currentDate.toDateString() && selectedHour <= currentHour)
        ) {
            alert("Selected date and time must be in the future.")
            return
        }

        console.log("year:", year)
        console.log("month:", month)
        console.log("day:", day)
        console.log("time:", time)
        console.log("guests:", guests)

        const requestBody = {
            year,
            month,
            day,
            time,
            guests
        }
        const jsonData = JSON.stringify({ body: JSON.stringify(requestBody) })
        axios
            .post(`${gateway}searchAvailableRestaurantsDayAndTime`, jsonData, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                console.log("Restaurants searched successfully:", response.data)
                const parsedResponse = JSON.parse(response.data.body)
                console.log("Parsed Response:", parsedResponse)

                setAvailableRestaurants(parsedResponse.availableRestaurants || [])
                model.setPath("Search Restaurants")
                andRefreshDisplay()
            })
            .catch((error) => {
                console.error("Error searching restaurants:", error)
                alert("There was an error searching for restaurants. Please try again.")
            });

        //andRefreshDisplay()
    }

    function findTablePageClick() {
        findTable()
        //model.setPath("Find Table")
        andRefreshDisplay()
    }

    function findTable() {
        const year = parseInt((document.getElementById("dropdown year-search specific") as HTMLSelectElement).value)
        const month = parseInt((document.getElementById("dropdown month-search specific") as HTMLSelectElement).value)
        const day = parseInt((document.getElementById("dropdown day-search specific") as HTMLSelectElement).value)
        const time = parseInt((document.getElementById("dropdown time-search specific") as HTMLSelectElement).value)
        const guests = parseInt((document.getElementById("dropdown guests-search specific") as HTMLSelectElement).value)
        const name = (document.querySelector('input[placeholder="Enter Restaurant Name"]') as HTMLInputElement)?.value

        if (!year || !month || !day || !time || !guests || !name) {
            alert("All fields must be filled!")
            return
        }
        const selectedDate = new Date(year, month - 1, day)
        const selectedHour = time

        const currentDate = new Date()
        const currentHour = currentDate.getHours()

        if (selectedDate < currentDate ||
            (selectedDate.toDateString() === currentDate.toDateString() && selectedHour <= currentHour)
        ) {
            alert("Selected date and time must be in the future.")
            return
        }

        console.log("year:", year)
        console.log("month:", month)
        console.log("day:", day)
        console.log("time:", time)
        console.log("guests:", guests)
        console.log("name:", name)

        const requestBody = {
            year,
            month,
            day,
            time,
            guests,
            name
        }
        const jsonData = JSON.stringify({ body: JSON.stringify(requestBody) })
        axios
            .post(`${gateway}searchSpecificRestaurantAvailabilityFutureDay`, jsonData, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                console.log("Specific restaurant searched successfully:", response.data)
                const parsedResponse = JSON.parse(response.data.body)
                console.log("Parsed Response:", parsedResponse)

                setSpecificRest(parsedResponse.availableTables || [])
                model.setPath("Find Table")
                setriddata(parsedResponse.availableTables[0].rid)
                console.log("rid to reserve later:", parsedResponse.availableTables[0].rid)
                setReservationDetails({year, month, day, time, guests})

                //console.log("riddata:" , riddata)
                andRefreshDisplay()
            })
            .catch((error) => {
                console.error("Error searching your restaurant:", error)
                alert("There was an error searching your restaurant. Please try again.")
            });
    }

    function custInputForReservationPageClick(tid: string) {
        setSelectedTable(tid)
        model.setPath("Customer Input for Reserving")
        andRefreshDisplay()
    }

    function makeReservationPageClick() {
        model.setPath("Make Reservation")
        makeReservation()
        //andRefreshDisplay()
    }

    function makeReservation() {
        const email = (document.querySelector('input[ placeholder="Enter email"]') as HTMLInputElement)?.value
        const rid = riddata
        const tid = selectedTable
        const year = reservationDetails?.year
        const month = reservationDetails?.month
        const day = reservationDetails?.day
        const time = reservationDetails?.time
        const guests = reservationDetails?.guests

        if (!year || !month || !day || !time || !guests || !rid || !tid) {
            alert("Year, month, day, time, rid and tid must be provided!")
            return
        }
        if(!email || !email.includes('@')){
            alert("Email must be provided and be valid (contains @)!")
            return
        }
        const selectedDate = new Date(year, month - 1, day)
        const selectedHour = time

        const currentDate = new Date()
        const currentHour = currentDate.getHours()

        if (selectedDate < currentDate ||
            (selectedDate.toDateString() === currentDate.toDateString() && selectedHour <= currentHour)
        ) {
            alert("Selected date and time must be in the future.")
            return
        }

        console.log("year:", year)
        console.log("month:", month)
        console.log("day:", day)
        console.log("time:", time)
        console.log("guests:", guests)
        console.log("email:", email)
        console.log("rid:", rid)
        console.log("tid:", tid)


        const requestBody = {
            year,
            month,
            day,
            time,
            guests,
            email,
            rid, 
            tid
        }
        const jsonData = JSON.stringify({ body: JSON.stringify(requestBody) })
        axios
            .post(`${gateway}makeReservation`, jsonData, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                console.log("Reservation made successfully:", response.data)
                const parsedResponse = JSON.parse(response.data.body)
                console.log("Parsed Response:", parsedResponse)

                console.log("Generated rvid:", parsedResponse.rvid)
                setRVID(parsedResponse.rvid)

                model.setPath("Successful Reservation")

                andRefreshDisplay()
            })
            .catch((error) => {
                console.error("Error making your reservation:", error)
                alert("There was an error making your reservation. Please try again.")
            });

       // andRefreshDisplay()
    }

    function customerInputForViewResPageClick() {
        model.setPath("Customer Input for Viewing")
        andRefreshDisplay()
    }

    function viewReservationPageClick(rvid: string) {
        console.log("clicking viewing reservation")
        setRVID(rvid)
        //viewReservation()
        model.setPath("View Reservation")
        andRefreshDisplay()
    }


    function viewReservation() {
        const rvid = (document.querySelector('input[placeholder="Enter confirmation code"]') as HTMLInputElement)?.value;
        if (!rvid) {
            console.error("No rviddata to view")
            return
          }
          console.log("Attempting to view reservation with ID:", rvid)
      
          //send post request
          axios.post(`${gateway}findExistingReservationCustomer`, { body: JSON.stringify({ rvid: rvid}) }
      
          )
      
            .then(() => {
              console.log("Reservation Viewed Successfully.")
            })
            .catch((error) => {
              console.error("Could Not View", error)
            })
          model.setPath("Successful Viewing")
        
        andRefreshDisplay()
    }

    function customerInputForCancelResPageClick() {
        model.setPath("Customer Input for Canceling")
        andRefreshDisplay()
    }

    function cancelReservationCustomerPageClick(rvid: string) {
        if (!rvid) {
            
            alert("No rvid data to delete right now")
        }
        console.log("clicking canceling reservation")
        //cancelReservationCustomer()
        model.setPath("Cancel Reservation Customer")
        andRefreshDisplay()
    }

    function cancelReservationCustomer() {
        const rvid = (document.querySelector('input[placeholder="Enter confirmation code"]') as HTMLInputElement)?.value;

        if (!rvid) {
            alert("Please enter a confirmation code to cancel the reservation.");
            console.error("No rvid data to delete here");
            return;
        }
        console.log("Attempting to cancel reservation with ID:", rvid);

        // Send post request
        axios.post(`${gateway}deleteReservationCustomer`, { rvid: rvid })
            .then(() => {
                console.log("Reservation Canceled Successfully.");
                alert("Reservation canceled successfully.");
            })
            .catch((error) => {
                console.error("Could Not Cancel", error);
                alert("Could not cancel the reservation. Please try again.");
            });

        model.setPath("Successful Cancellation");
        andRefreshDisplay();
    }


    function backToConsumerHome() {
        model.setPath("Consumer Home")
        andRefreshDisplay()
    }

    return (

        <body>
            <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

            {/* For consumer home page */}
            {model.isPath("Consumer Home") ? (
                <div className='container'>
                    <p className="subheader"> Welcome, Customer!</p>

                    <button className="cust-button allRestaurants" onClick={() => listRestaurantsPageClick()}> List All Restaurants</button>

                    <div className="input searchRestaurants">
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

                        <select id="dropdown time-search all">
                            <option value="">Time</option>
                            <option value="1">0</option>
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

                        <select id="dropdown guests-search all">
                            <option value="">Guests</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>

                        <button className="cust-button searchRestaurants" onClick={() => searchRestaurantsPageClick()}> Search Available Restaurants </button>
                    </div>


                    <div className="input findTable">
                        <select id="dropdown year-search specific">
                            <option value="">Year</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>

                        <select id="dropdown month-search specific">
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

                        <select id="dropdown day-search specific">
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

                        <select id="dropdown time-search specific">
                            <option value="">Time</option>
                            <option value="1">0</option>
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

                        <select id="dropdown guests-search specific">
                            <option value="">Guests</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>


                        <input className="input restaurantName" type="text" placeholder="Enter Restaurant Name" />
                        <button className="cust-button findTable" onClick={() => findTablePageClick()}> Find Table for Specific Restaurant </button>
                    </div>

                    <div className="bottom-buttons-container">
                        <button className="cust-button viewReservation" onClick={() => customerInputForViewResPageClick()}> View Reservation </button>
                        <button className="cust-button cancelReservation" onClick={() => customerInputForCancelResPageClick()}> Cancel Reservation </button>
                    </div>
                </div>
            ) : null}

            {/* for list all restaurants page */}
            {model.isPath("List Restaurants") ? (
                <div className='container'>
                    <p className="subtext"> All Restaurants </p>
                    {loading ? (
                        <p>Loading restaurants...</p>
                    ) : (
                        <div className="container-list-cust">
                            <table className="restaurantsTable">
                                <thead>
                                    <tr>
                                        <th>Restaurant Name</th>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.length > 0 ? (
                                        restaurants.map((restaurant, row) => (
                                            <tr className="restaurantRow" key={row}>
                                                <td>{restaurant.name}</td>
                                                <td>{restaurant.address}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>No restaurants available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>)}
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for search restaurants page */}
            {model.isPath("Search Restaurants") ? (
                <div className='container'>
                    <p className="subtext"> Here are the available restaurants we found for your day, time and number of guests: </p>
                    {loading ? (
                        <p>Loading restaurants...</p>
                    ) : (
                        <div className="container-list-cust">
                            <table className="restaurantsTable">
                                <thead>
                                    <tr>
                                        <th>Restaurant Name</th>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableRestaurants.length > 0 ? (
                                        availableRestaurants.map((restaurant, row) => (
                                            <tr className="restaurantRow" key={row}>
                                                <td>{restaurant.name}</td>
                                                <td>{restaurant.address}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>No restaurants available</td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>)}
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for find table page */}
            {model.isPath("Find Table") ? (
                <div className='container'>
                    <p className="subtext"> Here are the available tables we found for your restaurant, number of guests and day. </p>
                    <p className="subtext"> To make a reservation, click on the button next to a listed table. </p>
                    {loading ? (
                        <p>Loading tables...</p>
                    ) : (
                        <div className="container-list-cust">
                            <table className="restaurantsTable">
                                <thead>
                                    <tr>
                                        <th>Restaurant Name</th>
                                        <th>Address</th>
                                        <th>Table ID</th>
                                        <th>Number of Seats</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {specificRest.length > 0 ? (
                                        specificRest.map((table, row) => (
                                            <tr className="restaurantRow" key={row}>
                                                <td>{table.name}</td>
                                                <td>{table.address}</td>
                                                <td>{table.tableID}</td>
                                                <td>{table.seats}</td>
                                                <td><button className="cust-button reserveButton" onClick={() => custInputForReservationPageClick(table.tableID)}> Make Reservation </button></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>No tables available</td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>)}
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for customer putting in info page */}
            {model.isPath("Customer Input for Viewing") ? (
                <div className='container'>
                    <p className="subtext"> Enter your email and confirmation code to view your reservation. </p>
                    <input className="input restaurantName" type="text" placeholder="Enter email" />
                    <input className="input restaurantName" type="text" placeholder="Enter confirmation code" />
                    < button className="back-btn" onClick={() => viewReservationPageClick(rvid)}>View Reservation</button>

                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for actual viewing reservation page */}
            {model.isPath("View Reservation") ? (
                <div className='container'>
                    <p className="subheader"> Your Reservation: </p>
                    <p className="subtext">Restaurant placeholder</p>
                    <p className="subtext">Time placeholder</p>
                    <p className="subtext">Table placeholder</p>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}


            {/* for putting in info to cancel reservation page */}
            {model.isPath("Customer Input for Canceling") ? (
                <div className='container'>
                    <p className="subtext"> Enter your email and confirmation code to cancel your reservation. </p>
                    <input className="input restaurantName" type="text" placeholder="Enter email" />
                    <input className="input restaurantName" type="text" placeholder="Enter confirmation code" />
                    < button className="back-btn" onClick={() => cancelReservationCustomerPageClick(rvid)}>Cancel Reservation</button>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for actual canceling reservation page */}
            {model.isPath("Cancel Reservation Customer") ? (
                <div className='container'>
                    <p className="subtext"> Are you sure you want to cancel this reservation? </p>
                    <p className="subtext">Restaurant name placeholder</p>
                    <p className="subtext">Time placeholder</p>
                    <p className="subtext">Table placeholder</p>
                    < button className="back-btn" onClick={() => cancelReservationCustomer()}>Yes</button>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>No</button> </div>
            ) : null}

            {/* for confirmation of canceling reservation page */}
            {model.isPath("Successful Cancellation") ? (
                <div className='container'>
                    <p className="subtext"> Your reservation was cancelled! </p>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for putting in email to make reservation */}
            {model.isPath("Customer Input for Reserving") ? (
                <div className='container'>
                    <p className="subtext"> Enter your email to confirm your reservation. </p>
                    <input className="input" type="text" placeholder="Enter email" />
                    <button className="back-btn" onClick={() => makeReservationPageClick()}>Confirm Reservation</button>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

            {/* for seeing confirmation of creation of reservation */}
            {model.isPath("Successful Reservation") ? (
                <div className='container'>
                    <p className="subtext"> You have succesfully made your reservation! </p>
                    <p className="subtext"> This is your reservation ID. Use it to view or cancel this reservation.</p>
                    <p className="subheader">{rvid}</p>
                    <button className="cust-button viewReservation" onClick={() => customerInputForViewResPageClick()}> View Reservation </button>
                    <button className="cust-button cancelReservation" onClick={() => customerInputForCancelResPageClick()}> Cancel Reservation </button>
                    < button className="back-btn" onClick={() => backToConsumerHome()}>Go Back</button> </div>
            ) : null}

        </body >
    )
}
