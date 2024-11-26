'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import axios from 'axios'

import './styles.css'
import { create } from 'domain'
import { Model } from '../../../model'
import { useRouter } from 'next/navigation'

const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/"

export default function Admin() {
  const [redraw, forceRedraw] = React.useState(0)
  const [model, setModel] = React.useState(new Model("Admin List Restaurants"))
  const [restaurants, setRestaurants] = React.useState<{ rid: string; name: string; address: string }[]>([])
  const [selectedRID, setSelectedRID] = React.useState<string | null>(null)
  const router = useRouter()
  //const [loading, setLoading] = React.useState(false)

  listRest()

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function deleteRestPageClick(rid: string) {
    console.log("Selected restaurant ID for deletion:", rid)
    setSelectedRID(rid)
    model.setPath("Admin Delete Restaurant")
    andRefreshDisplay()
  }

  function deleteRestaurantAdmin() {
    if (!selectedRID) {
      console.error("No selectedRID to delete")
      return
    }
    console.log("Attempting to delete restaurant with ID:", selectedRID)

    //send post request
    axios.post(`${gateway}deleteRestaurantAdmin`, { body: JSON.stringify({ rid: selectedRID }) }
    )
      .then(() => {
        console.log("Restaurant deleted successfully.")
      })
      .catch((error) => {
        console.error("Failed to delete restaurant", error)
      })


    // on successful creation:
    model.setPath("Successful Deletion")
    andRefreshDisplay()
  }

  function backToAdminList() {
    model.setPath("Admin List Restaurants")
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

  return (
    <body>
      {/* <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button> */}

      {/* For base admin listing page */}
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

      {/* For admin deletion page */}
      {model.isPath("Admin Delete Restaurant") ? (

        <div className='container'>
          <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

          <body>
            <p className="subheader">Deleting Restaurant</p>
            <p className="subtext"> Are you sure you want to delete this restaurant? </p>
            <p className="subtext"> This action cannot be undone.</p>
            <button className="button" onClick={() => deleteRestaurantAdmin()}> Yes</button>
            <button className="button" onClick={() => backToAdminList()}> No </button>
          </body>
        </div>

      ) : null}

      {/* For admin deletion success page */}
      {model.isPath("Successful Deletion") ? (
        <div className="container">
          <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>

          <p className="subtext">Restaurant successfully deleted!</p>
          <button className="wide button" onClick={() => backToAdminList()}>Go to List of Restaurants</button>
        </div>
      ) : null}

    </body>


  )
}
