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

const connection = await mysql.createConnection(dbConfig);

const errorResponse = (statusCode, message) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
});

export const handler = async (event) => {
    try {
        console.log("Function started");

        // Parse the request body
        const { rid } = JSON.parse(event.body || "{}");
        console.log(`Received data: rid=${rid}`);

        // Validate required fields
        if (!rid) return errorResponse(400, "This restaurant doesn’t exist.");

        // Check if the restaurant exists
        const [restaurantRows] = await connection.execute("SELECT * FROM Restaurants WHERE rid = ?", [rid]);
        if (restaurantRows.length === 0) return errorResponse(400, "This restaurant doesn’t exist.");

        console.log("Restaurant exists");

        // Check if the daily schedule has been set
        const [scheduleRows] = await connection.execute("SELECT * FROM Schedules WHERE rid = ?", [rid]);
        if (scheduleRows.length === 0) return errorResponse(400, "Daily schedule has not been set.");

        // Check if the number of tables has been set
        const [tablesRows] = await connection.execute("SELECT * FROM Tables WHERE rid = ?", [rid]);
        if (tablesRows.length === 0) return errorResponse(400, "Number of tables has not been set.");

        // Check if the number of seats for each table has been set
        for (const table of tablesRows) {
            if (!table.seats || table.seats <= 0) return errorResponse(400, "Number of seats for each table has not been set.");
        }

        console.log("Validation complete");

        // Activate the restaurant
        await connection.execute("UPDATE Restaurants SET active = true WHERE rid = ?", [rid]);

        return {
            statusCode: 200,
            body: JSON.stringify({ rid, active: "true" }),
        };

       
    } catch (error) {
        console.error("Error activating restaurant:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
