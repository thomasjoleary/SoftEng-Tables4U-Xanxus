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
  const router = useRouter()

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }

  function createRestPageClick() {
    model.setPath("Create Restaurant")
    andRefreshDisplay()
  }

  function loginButton() {

    
    // if restaurant
    router.push('/Restaurant')
    // if admin
    router.push('/Admin')
  }

  function createRestaurant() {

    // Add Lambda calls to create restaurant here


    // add something for a failed creation here:


    // on successful creation:
    model.setPath("Successful Creation")
    andRefreshDisplay()
  }

  function backToLogin() {
    model.setPath("Login")
    andRefreshDisplay()
  }

  return (
  <body>
    <div className="container">
        <button className="tables4u">Tables4U</button>
        

        {/* For base login page */}
        { model.isPath("Login") ? (
          <div className="container">
            <p className="subtext">Welcome Restaurant Owner</p>
            <p className="subtext">we can get you more customers dude, trust us</p>
            <form>
              <input
                  type="text" 
                  placeholder="(enter Restaurant Code)" 
                  className="button" >
              </input>
              <br></br>
              <button type="submit" className="wide button" onClick={() => loginButton()}>Log in</button>
            </form>

            <p className="subtext">First time here?</p>
            <button className="button" onClick={() => createRestPageClick()}>Create Restaurant</button>
          </div>
          ) : null }


          {/* For create restaurant page */}
        { model.isPath("Create Restaurant") ? (
          <div className="container">
            <p className="subtext">Create a Restaurant</p>
      
            <form>
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
                <button type="submit" className="wide button" onClick={() => createRestaurant()}>Create Restaurant</button>
            </form>
      
            <p className="subtext">Already have a Restaurant?</p>
            <button className="button" onClick={() => backToLogin()}>Back to Login</button>
          </div>
          ) : null }

          {/* For successful creation page */}
        { model.isPath("Successful Creation") ? (
          
          <div className="container">
              <button className="tables4u">Tables4U</button>
              <p className="subtext">Restaurant successfully created!</p>
              <p className="subheader">123456</p>
              <p className="subtext">This is your only login credential. Write it down somewhere safe, and keep it secret!</p>
              <button className="wide button" onClick={() => backToLogin()}>Go to Login</button>
          </div>
          
          ) : null }

        
    </div>
  </body>
    

  )
}
