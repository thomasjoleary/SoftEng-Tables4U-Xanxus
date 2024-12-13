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

//YOU NEED TO ADD EMAIL TO THE TEST

const errorResponse = (statusCode, message) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
});

export const handler = async (event) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log("Function started");


        // Parse the request body
        const { rvid} = JSON.parse(event.body || "{}");
        console.log(`Received data: rvid=${rvid}`);

        // Check if the Reservations exists
        const [reservationRows] = await connection.execute("SELECT * FROM Reservations WHERE rvid = ?", [rvid]);
        if (reservationRows.length === 0) return errorResponse(400, "This reservation doesn’t exist.");

        console.log("Reservation exists");

        // Delete Reservations
        await connection.execute("DELETE FROM Reservations WHERE rvid = ?", [rvid]);
        console.log("Reservations updated");

        // Return the updated Reservation data
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Reservation deleted successfully", rvid }),
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



