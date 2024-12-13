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

  try {
      console.log("Function started")

      const { rid, date } = JSON.parse(event.body || "{}")
      console.log(`Received data: rid=${rid}, date=${JSON.stringify(date)}`)

      const year = date.slice(0,4)
      const month = date.slice(5, 7)
      const day = date.slice(-2)

      console.log(`Received data: year=${year}, month=${month}, day=${day}`)

      // Validate required fields
       if (!rid) return errorResponse(400, "Can't find the current restaurant in the database")


       // Check if the restaurant exists
       const [restaurantRows] = await connection.execute("SELECT * FROM Restaurants WHERE rid = ?", [rid])
       if (restaurantRows.length === 0) return errorResponse(400, "This restaurant doesn’t exist.")

       console.log("Restaurant exists")


     // Activate the restaurant
     await connection.execute("INSERT INTO ClosedDays (date, rid) VALUES (?, ?)",[`${year}-${month}-${day}`, rid])
     await connection.execute("DELETE FROM Reservations WHERE rid = ? AND date = ?;",[rid, `${year}-${month}-${day}`])

     console.log("Closed Day added")
 
     return {
       statusCode: 200,
       body: JSON.stringify({ message: "Closed Day added successfully" }),
     }
   } catch (error) {
     console.error(error)
     return errorResponse(500, "Internal Server Error")
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