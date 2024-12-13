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

      const { rid } = JSON.parse(event.body || "{}")
      console.log(`Received data: rid=${rid}`)

      // Validate required fields
       if (!rid) return errorResponse(400, "Can't find the current restaurant in the database")

       // Check if the restaurant exists
       const [closedDays] = await connection.execute("SELECT date FROM ClosedDays WHERE rid = ?", [rid])

       

       console.log("Restaurant exists")
 
     return {
       statusCode: 200,
       body: JSON.stringify({ ClosedDays: closedDays }),
      
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