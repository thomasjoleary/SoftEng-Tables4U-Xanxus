'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
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

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function createRestPageClick() {
    model.setPath("Create Restaurant")
    andRefreshDisplay()
  }

  async function loginButton ( event : React.MouseEvent ) {
    event.preventDefault()
    let res
    //console.log(riddata)
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
    } catch (error) {
      console.log(error)
      return
    }
    //console.log(res)

    // set rid to model for auth purposes later on
    model.setRid(res.rid)

    if (res.admin === "yes") {
      // if admin
      router.push('/Admin')
    } else if (res.admin === "no") {
      // if restaurant
      router.push('/Restaurant')
    }
    
  }

  function createRestaurant() {
    console.log("Creating restaurant...");
    const gateway = "https://7yv9xzfvp8.execute-api.us-east-2.amazonaws.com/Initial/createRestaurant"
    const nameInput = (document.querySelector('input[placeholder="(enter Restaurant Name)"]') as HTMLInputElement)?.value;
    const addressInput = (document.querySelector('input[placeholder="(enter Restaurant Address)"]') as HTMLInputElement)?.value;

    if (!nameInput || !addressInput) {
      alert("Please provide both a restaurant name and address.");
      return;
    }

    const requestBody = {
      body: JSON.stringify({
        name: nameInput,
        address: addressInput,
      }),
    };

    // add something for a failed creation here:

    axios.post(gateway, requestBody)
    .then(response => {
      console.log("API Response:", response); // Log the full response object
      if (response.status === 200) {
        if (response.data) {
          const data = JSON.parse(response.data.body);
          const restaurantId = data.rid
          model.setLoginID(restaurantId)
          model.setPath("Successful Creation");
          andRefreshDisplay();
        } else {
          alert("No response data received.");
          console.error("No data in response:", response);
        }
      } else {
        alert("Failed to create restaurant. Please try again.");
        console.error("Unexpected response:", response);
      }
    })
    .catch(error => {
      alert("An error occurred while creating the restaurant.");
      console.error("Error creating restaurant:", error);
    });
  }

  function backToLogin() {
    model.setPath("Login")
    andRefreshDisplay()
  }

  return (
  <body>
    <div className="container">
        <button className="tables4u" onClick={() => router.push('/')}>Tables4U</button>
        

        {/* For base login page */}
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


          {/* For create restaurant page */}
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

          {/* For successful creation page */}
        { model.isPath("Successful Creation") ? (
          
          <div className="container">
              <button className="tables4u">Tables4U</button>
              <p className="subtext">Restaurant successfully created!</p>
              <p className="subheader">{model.getLoginID()}</p>
              <p className="subtext">This is your only login credential. Write it down somewhere safe, and keep it secret!</p>
              <button className="wide button" onClick={() => backToLogin()}>Go to Login</button>
          </div>
          
          ) : null }

        
    </div>
  </body>
    

  )
}
