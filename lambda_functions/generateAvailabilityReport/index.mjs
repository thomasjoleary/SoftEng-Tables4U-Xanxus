import mysql from 'mysql2/promise'

const dbConfig = {
    host: "restaurantdb.czcukuq6u2x1.us-east-2.rds.amazonaws.com",
    user: "xanxus",
    password: "XanxusRest",
    database: "xanxus",
    port: 3306,
}

export const handler = async (event) => {
  const connection = await mysql.createConnection(dbConfig)

  function nextAvailableTime(currentTime, currentYear, currentDay, currentMonth, open, close) {
    if (currentTime < open) { // should only happen on very first call
      currentTime = open
    } else if ((currentTime + 1) >= close) { // becomes next day
      currentTime = open
      if ((currentMonth === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10) && currentDay === 31) { // 31 day months
        currentDay = 1
        currentMonth+= 1
      } else if ((currentMonth === 4 || currentMonth === 6 || currentMonth === 9 || currentMonth === 11) && currentDay === 30) { // 30 day months
        currentDay = 1
        currentMonth+= 1
      } else if (currentMonth === 2 && currentDay === 28) { // leap year check for February
        if (((currentYear % 4 === 0) && (!(currentYear % 100 === 0))) || (y % 400 === 0)) { // is a leap year
          currentDay+= 1
        } else { // is not a leap year
          currentDay = 1
          currentMonth+= 1
        }
      } else if (currentMonth === 2 && currentDay === 29) { // to go from February on a leap year to March
        currentDay = 1
        currentMonth = currentMonth + 1
      } else if (currentMonth === 12 && currentDay === 31) {// December 31st, go to next year
        currentDay = 1
        currentMonth = 1
        currentYear += 1
      } else {
        currentDay += 1
      }
    } else { // next hour
      currentTime += 1
    }
    return {currentTime : currentTime, currentYear : currentYear, currentDay : currentDay, currentMonth : currentMonth}
  }

  function beforeCheck(currentTime, currentYear, currentDay, currentMonth, goalTime, goalYear, goalDay, goalMonth) {
    if (currentYear > goalYear) {
      return false
    } else if (currentMonth > goalMonth && currentYear === goalYear) {
      return false
    } else if (currentDay > goalDay && currentMonth === goalMonth && currentYear === goalYear) {
      return false
    } else if (currentTime > goalTime && currentDay === goalDay && currentMonth === goalMonth && currentYear === goalYear) {
      return false
    }
    return true
  }

  try {
      console.log("Function started")

      const { rid, startmonth, startday, startyear, starttime, endmonth, endday, endyear, endtime } = JSON.parse(JSON.stringify(event.body || "{}"))
      console.log(`Received data: rid=${rid}`)
      console.log(`Received data: startmonth=${startmonth}, startday=${startday}, startyear=${startyear}, starttime=${starttime}`)
      console.log(`Received data: endmonth=${endmonth}, endday=${endday}, endyear=${endyear}, endtime=${endtime}`)
      

      // Validate required fields
       if (!rid) return errorResponse(400, "Can't find the current restaurant in the database")


       // Check if the restaurant exists
       const [restaurantRows] = await connection.execute("SELECT * FROM Restaurants WHERE rid = ?", [rid])
       if (restaurantRows.length === 0) return errorResponse(400, "This restaurant doesn’t exist.")

       console.log("Restaurant exists")

    const [times] = await connection.execute("SELECT openingTime, closingTime FROM Restaurants WHERE rid = ? AND activated = 1;", [rid])
    const open = times[0].openingTime
    const close = times[0].closingTime

     const [tables] = await connection.execute("SELECT * FROM xanxus.Tables WHERE rid = ?;", [rid])
     console.log("Table data is:", tables);
     let totalSeats = 0
     let tableSeats = []
     for (let i = 0; i < tables.length; i += 1) {
        totalSeats += tables[i].seats
        tableSeats.push(tables[i].seats)
     }

    let hour = starttime
    let day = startday
    let month = startmonth
    let year = startyear

    if (hour < open || hour > close) { // Need to start at an available time
      let next = nextAvailableTime(hour, year, day, month, open, close) // set time one hour forwards, accounting for days, months, and year changes
      hour = next.currentTime
      day = next.currentDay
      month = next.currentMonth
      year = next.currentYear
    }
    //console.log(`Starting at ${hour} oclock on ${month}/${day}/${year}`)
    let report = []
    let usedSeats = []
    let thisDate

    while (beforeCheck(hour, year, day, month, endtime, endyear, endday, endmonth)) { // while before the specified end time
      thisDate = `${year}-${month}-${day}`
      // gets reservations for this restaurant at this exact date and time
      let [thisRes] = await connection.execute("SELECT *  FROM Reservations WHERE rid = ? AND date = ? AND time = ?;", [rid, thisDate, hour])
      usedSeats = []
      for (let i = 0; i < tables.length; i += 1) {
        usedSeats.push(0)
      } // initializes usedSeats to an array of zeroes
      for (let i = 0; i < thisRes.length; i += 1) {
        usedSeats[thisRes[i].tid] = thisRes[i].numGuests
      } // fills out usedSeats with the usedSeats at each table
      let unused = 0
      for (let i = 0; i < usedSeats.length; i += 1) {
        unused += (tableSeats[i] - usedSeats[i])
      } // sets unused to each table's seats minus how many are used

      let utilization = (((totalSeats - unused) / totalSeats) * 100) // utilization = (used seats / total seats) * 100, multiplied so it's not decimal

      let openTables = 0
      for (let i = 0; i < usedSeats.length; i += 1) {
        if (usedSeats[i] === 0) {
          openTables += 1
        }
      }
      let availability = (openTables / tableSeats.length) * 100 // availability = COMPLETELY open tables / total tables
      
      report.push({time : {day : day, month : month, year : year, hour : hour}, unusedSeats : unused, utilization : utilization, availability : availability})

      let next = nextAvailableTime(hour, year, day, month, open, close) // set time one hour forwards, accounting for days, months, and year changes
      hour = next.currentTime
      day = next.currentDay
      month = next.currentMonth
      year = next.currentYear
    }

    
 
     return {
       statusCode: 200,
       body: JSON.stringify({
        report : report
      }),
     }
   } catch (error) {
     console.error("Error during processing:", error)
     console.error("Error details:", JSON.stringify(error))
     return errorResponse(501, "Internal Server Error Yippee")
   } finally {
     await connection.end()
   }
 }
 
 const errorResponse = (statusCode, message) => {
   return {
     statusCode,
     body: JSON.stringify({ message }),
   }
 }