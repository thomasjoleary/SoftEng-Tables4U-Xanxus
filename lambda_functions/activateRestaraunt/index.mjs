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
    try {
        const { path, httpMethod, body } = event;

        if (path === '/addRestaurant' && httpMethod === 'POST') {
            const { name, address } = JSON.parse(body || "{}");

            if (!name || !address) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing 'name' or 'address'" }),
                };
            }



            /*
            // Generates a unique restaurant ID, could look something like this: 123e4567-e89b-12d3-a456-426614174000
            const rid = uuidv4(); //does this even need to be here? it's covered in createRestaurant 
            */


            // Insert into database
            const query = `INSERT INTO Restaurants (rid, name, address) VALUES ($1, $2, $3)`;
            await pool.query(query, [rid, name, address]);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Restaurant added successfully", rid }),
            };
        }

        if (path === '/activateRestaurant' && httpMethod === 'POST') {
            const { rid } = JSON.parse(body || "{}");

            if (!rid) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing 'rid'" }),
                };
            }

            // Check if the restaurant actually exists
            const restaurantQuery = `SELECT * FROM Restaurants WHERE rid = $1`;
            const restaurantResult = await pool.query(restaurantQuery, [rid]);

            if (restaurantResult.rowCount === 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "This restaurant doesn’t exist." }),
                };
            }

            // Check if the daily schedule has been set
            const scheduleQuery = `SELECT * FROM Schedules WHERE rid = $1`;
            const scheduleResult = await pool.query(scheduleQuery, [rid]);

            if (scheduleResult.rowCount === 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Daily schedule has not been set." }),
                };
            }

            // Check if the number of tables has been set
            const tablesQuery = `SELECT * FROM Tables WHERE rid = $1`;
            const tablesResult = await pool.query(tablesQuery, [rid]);

            if (tablesResult.rowCount === 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Number of tables has not been set." }),
                };
            }

            // Check if the number of seats for each table has been set
            const seatsQuery = `SELECT * FROM Seats WHERE rid = $1`;
            const seatsResult = await pool.query(seatsQuery, [rid]);

            if (seatsResult.rowCount === 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Number of seats for each table has not been set." }),
                };
            }

            // Activate the restaurant
            const activateQuery = `UPDATE Restaurants SET active = true WHERE rid = $1`;
            await pool.query(activateQuery, [rid]);

            return {
                statusCode: 200,
                body: JSON.stringify({ rid, active: "true" }),
            };
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Not Found" }),
        };

        
    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
