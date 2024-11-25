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
    const [restaurants, setRestaurants] = React.useState<{ name: string; address: string }[]>([]);
    const [loading, setLoading] = React.useState(false);


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
                setRestaurants(parsedBody.restaurants)
            })
            .catch((error) => {
                console.error("Failed to fetch restaurants", error)
            })
            .finally(() => {
                setLoading(false)
            });
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

                    <button className="button allRestaurants" onClick={() => listRestaurantsPageClick()}> List All Restaurants</button>

                    <div className="input searchRestaurants">
                        <select className="dropdown month">
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

                        <select className="dropdown day">
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
                        </select>

                        <select className="dropdown time">
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
                        <button className="button searchRestaurants"> Search Restaurants </button>
                    </div>


                    <div className="input findTable">
                        <select className="dropdown guests">
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

                        <select className="dropdown month">
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

                        <select className="dropdown day">
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
                        </select>

                        <select className="dropdown time">
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
                        <input className="input restaurantName" type="text" placeholder="Enter Restaurant Name" />
                        <button className="button findTable"> Find Table </button>
                    </div>

                    <div className="bottom-buttons-container">
                        <button className="button viewReservation"> View Reservation </button>
                        <button className="button cancelReservation"> Cancel Reservation </button>
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
            ) : null
            }
        </body >
    )
}
