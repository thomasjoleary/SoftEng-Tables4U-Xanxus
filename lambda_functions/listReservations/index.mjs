import pkg from "aws-lambda";
const { APIGatewayProxyHandler } = pkg;
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

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
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log("Function started");


        // Parse the request body
        const { rid } = JSON.parse(JSON.stringify(event.body || "{}"));
        console.log(`Received data: rid=${rid}`);

        // Check if the Reservations exists
        const [reservationRows] = await connection.execute("SELECT rvid, guestEmail, numGuests, date, time FROM Reservations WHERE rid = ?", [rid]);

        // Return the updated Reservation data
        return {
            statusCode: 200,
            body: JSON.stringify(
                reservationRows
            ),
        };
    } catch (error) {
        console.error("Error making reservation:", error);
        return errorResponse(500, "Internal Server Error");
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed");
        }
    }
};



