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
        const { name, address } = JSON.parse(event.body || "{}");
        console.log(`Received data: name=${name}, address=${address}`);

        if (!name || !address) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing 'name' or 'address'" }),
            };
        }

        const rid = uuidv4();
        console.log(`Generated UUID: ${rid}`);

        const connection = await mysql.createConnection(dbConfig);
        console.log("Database connection established");

        const query = 'INSERT INTO Restaurants (rid, name, address) VALUES (?, ?, ?)';
        console.log(`Executing query: ${query} with values: ${rid}, ${name}, ${address}`);

        await connection.execute(query, [rid, name, address]);
        await connection.end();
        console.log("Database operation complete");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Restaurant added successfully", rid }),
        };
    } catch (error) {
        console.error("Error adding restaurant:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
