import mysql from 'mysql2/promise';

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
        const { rid } = JSON.parse(event.body || "{}");
        console.log(`Received data: rid=${rid}`);

        // Validate required fields
        if (!rid) return errorResponse(400, "This restaurant doesn’t exist.");

        console.log("Validation complete");

        // Check if the restaurant exists
        const [restaurantRows] = await connection.execute(
            "SELECT rid, name, address, openingTime, closingTime, activated FROM Restaurants WHERE rid = ?",
            [rid]
        );

        if (restaurantRows.length === 0) {
            return errorResponse(400, "This restaurant doesn’t exist.");
        }

        const restaurant = restaurantRows[0];
        console.log("Restaurant exists", restaurant);

        const [tableRows] = await connection.execute(
            "SELECT tid, seats FROM Tables WHERE rid = ?",
            [rid]
        );

        console.log("Tables fetched", tableRows);

        // Return the restaurant data along with tables
        return {
            statusCode: 200,
            body: JSON.stringify({
                rid: restaurant.rid,
                name: restaurant.name,
                address: restaurant.address,
                openingTime: restaurant.openingTime,
                closingTime: restaurant.closingTime,
                activated: restaurant.activated,
                tables: tableRows,
            }),
        };
    } catch (error) {
        console.error("Error getting restaurant info:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    } finally {
        await connection.end();
    }
};

function errorResponse(statusCode, message) {
    console.log(`Error: ${message}`)
    return {
        statusCode,
        body: JSON.stringify({ error: message }),
    };
}
