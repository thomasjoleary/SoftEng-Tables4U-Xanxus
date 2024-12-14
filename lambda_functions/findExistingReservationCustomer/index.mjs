import mysql from "mysql2/promise";

const dbConfig = {
    host: "restaurantdb.czcukuq6u2x1.us-east-2.rds.amazonaws.com",
    user: "xanxus",
    password: "XanxusRest",
    database: "xanxus",
    port: 3306,
};

const errorResponse = (statusCode, message) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
});

export const handler = async (event) => {
    let connection;
    try {
        console.log("Function started");

        // Establish database connection
        connection = await mysql.createConnection(dbConfig);
        console.log("Database connected");

        // Parse the request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body || "{}");
        } catch (err) {
            console.error("Invalid JSON format:", event.body);
            return errorResponse(400, "Invalid request body format");
        }
        const { rvid, email } = requestBody;

        // Validate rvid
        if (!rvid) {
            console.error("Missing rvid");
            return errorResponse(400, "Missing required field: rvid");
        }
        if (!email) {
            console.error("Missing email");
            return errorResponse(400, "Missing required field: email");
        }

        console.log(`Looking for reservation with rvid=${rvid} & email=${email}`);

        // Check if the reservation exists
        const [reservationRows] = await connection.execute(
            "SELECT rvid, numGuests, tid, rid, date, time FROM Reservations WHERE rvid = ? AND guestEmail = ?",
            [rvid, email]
        );

        if (reservationRows.length === 0) {
            console.warn(`No reservation found for rvid=${rvid} & email=${email}`);
            return errorResponse(404, "Reservation not found");
        }
        
        // Log query results
        console.log("Query results:", reservationRows);


        let restaurantInfo = await connection.execute("SELECT name, address FROM Restaurants WHERE rid = ?", [reservationRows[0].rid])

        let name = restaurantInfo[0][0].name

        let address = restaurantInfo[0][0].address

        
        

        // Return the reservation data
        return {
            statusCode: 200,
            body: JSON.stringify([reservationRows, name, address]),
        };
    } catch (error) {
        console.error("Error viewing reservation:", error);
        return errorResponse(500, "Internal Server Error");
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed");
        }
    }
};
