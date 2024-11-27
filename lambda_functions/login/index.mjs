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
        console.log("Function started");
        console.log(event);
        const { rid } = JSON.parse(JSON.stringify(event.body || "{}"));
        console.log(`Received data: rid=${rid}`);

        // if no rid given, return error
        if (!rid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing 'rid'" }),
            };
        }
        let admin = "no"
        let success = "false"

        // check for admin
        if (rid === "nimda") {
            admin = "yes"
            success = "true"
            const active = "true"
            const name = "admin login"
            return {
                statusCode: 200,
                body: JSON.stringify({
                    rid,
                    success,
                    admin,
                    active,
                    name,
                }),
            }
        }

        // establish database connection
        const connection = await mysql.createConnection(dbConfig);
        console.log("Database connection established");

        // query database for given rid
        const query = `SELECT * FROM Restaurants WHERE rid = '${rid}';`;
        console.log(`Executing query: ${query} with rid value: ${rid}`);
        const [restRow] = await connection.execute(query, [rid])
        
        
        if (restRow.length === 1) {
            // if the restaurant exists
            console.log("Restaurant exists")
            success = "true"
        } else {
            // if the restaurant doesn't exist
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Restaurant with that rid does not exist." }),
            };
        }

        const active = restRow[0].activated
        const name = restRow[0].name
        await connection.end();
        console.log("Database operation complete");

        // return rid, success (true), admin (no), active
        return {
            statusCode: 200,
            body: JSON.stringify({
                rid,
                success,
                admin,
                active,
                name,
            }),
        };
    } catch (error) {
        console.error("Error logging in:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
