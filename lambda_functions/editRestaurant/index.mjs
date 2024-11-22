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
        const { rid, hours, tables } = JSON.parse(event.body || "{}");
        console.log(`Received data: rid=${rid}, hours=${JSON.stringify(hours)}, tables=${JSON.stringify(tables)}`);


        // Validate required fields
        if (!rid) return errorResponse(400, "This restaurant doesn’t exist.");
        if (!hours) return errorResponse(400, "There are no hours set.");
        if (!tables || tables.length === 0) return errorResponse(400, "There are no tables set.");

        const { open, close } = hours || {};
        console.log(`Received data: open=${open}, close=${close}`);

        // Validate hours
        if (open === undefined || close === undefined) return errorResponse(400, "There are no hours set.");
        if (Number(close) <= Number(open)) return errorResponse(400, "A day closes before it opens.");

        // Validate tables
        for (const table of tables) {
            if (!table.seats || table.seats <= 0) return errorResponse(400, "A table has no seats.");
        }

        console.log("Validation complete");

        // Check if the restaurant exists
        const [restaurantRows] = await connection.execute("SELECT * FROM Restaurants WHERE rid = ?", [rid]);
        if (restaurantRows.length === 0) return errorResponse(400, "This restaurant doesn’t exist.");

        console.log("Restaurant exists");

        // Check if the restaurant is already activated (assuming "activated" is a column)
        if (restaurantRows[0].activated) return errorResponse(400, "This restaurant has already been activated.");

        // Update restaurant hours
        await connection.execute(
            "UPDATE Restaurants SET openingTime = ?, closingTime = ? WHERE rid = ?",
            [open, close, rid]
        );
        console.log("Restaurant hours updated");

        // Update tables: Delete existing tables and insert new ones
        await connection.execute("DELETE FROM Tables WHERE rid = ?", [rid]);
        for (const table of tables) {
            await connection.execute(
                "INSERT INTO Tables (tid, rid, seats) VALUES (?, ?, ?)",
                [table.tid, rid, table.seats]
            );
        }
        console.log("Tables updated");

        // Return the updated restaurant data
        return {
            statusCode: 200,
            body: JSON.stringify({
                rid,
                open,
                close,
                tables,
            }),
        };
    } catch (error) {
        console.error("Error editing restaurant:", error);
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
