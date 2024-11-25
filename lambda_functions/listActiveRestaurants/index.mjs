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

        // Check if active restaurants exist
        // const [restaurantRows] = await connection.execute(
        //     "SELECT rid, name, address, activated FROM Restaurants WHERE activated = 1"
        // );
        const [restaurantRows] = await connection.execute(
                 "SELECT name, address FROM Restaurants WHERE activated = 1"
             );

        if (restaurantRows.length === 0) {
            return errorResponse(400, "No restaurants available to list.");
        }

        console.log("Active restaurants selected");

        const response = {
            restaurants: restaurantRows.map((restaurant) => ({
                //rid: restaurant.rid,
                name: restaurant.name,
                address: restaurant.address,
                //active: restaurant.activated === 1, 
            })),
        };

        console.log("Activated restaurants fetched successfully");
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error("Error listing restaurants:", error);
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
