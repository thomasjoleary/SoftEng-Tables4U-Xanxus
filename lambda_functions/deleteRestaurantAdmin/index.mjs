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

export const handler = async (event) => {
    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log("Function started");

        // Parse the request body
        const { rid} = JSON.parse(event.body || "{}");
        console.log(`Received data: rid=${rid}`);


        // Validate required fields
        if (!rid) return errorResponse(400, "This restaurant doesn’t exist.");

        console.log("Validation complete");

        // Check if the restaurant exists
        const [restaurantRows] = await connection.execute("SELECT * FROM Restaurants WHERE rid = ?", [rid]);
        if (restaurantRows.length === 0) return errorResponse(400, "This restaurant doesn’t exist.");

        console.log("Restaurant exists");

        // Delete restaurant
        await connection.execute("DELETE FROM Restaurants WHERE rid = ?", [rid]);
        console.log("Restaurants updated");

        // Return the updated restaurant data
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Restaurant deleted successfully", rid }),
        };
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    } finally {
        await connection.end();
    }
};

function errorResponse(statusCode, message) {
    console.log(`Error: ${message}`);
    return {
        statusCode,
        body: JSON.stringify({ error: message }),
    };
}
