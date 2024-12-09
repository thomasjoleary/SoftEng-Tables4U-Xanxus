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
        const { year, month, day, time, guests } = JSON.parse(event.body || "{}");
        console.log(`Received data: year=${JSON.stringify(year)}, month=${JSON.stringify(month)}, day=${JSON.stringify(day)}, time=${JSON.stringify(time)}, guests=${JSON.stringify(guests)}`);

        // have to make sure all fields have been selected before sending in query
        if (!year) return errorResponse(400, "No year entered.")
        if (!month) return errorResponse(400, "No month entered.")
        if (!day) return errorResponse(400, "No day entered.")
        if (!time) return errorResponse(400, "No time entered.")
        if (!guests) return errorResponse(400, "No guest amount entered.")


        // have to make sure day and time is in future
        const selectedDate = new Date(year, month - 1, day);
        const selectedHour = time

        const currentDate = new Date();
        const currentHour = currentDate.getHours();

        if (selectedDate < currentDate ||
            (selectedDate.toDateString() === currentDate.toDateString() && selectedHour <= currentHour)
        ) {
            return errorResponse(400, "Selected date and time must be in the future.");
        }

        //format date for later passing into query in mysql
        const mysqlDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log(`Formatted MySQL Date: ${mysqlDate}, User-selected time: ${selectedHour}`);

        // have to test with closed days!!!!!
        //restaurant is available if for a certain day and time, there is a table that can fit the user's number of guests
        //restaurant must also be active
        const restQuery = `
        SELECT DISTINCT r.rid, r.name, r.address
        FROM xanxus.Restaurants r
        JOIN xanxus.Tables t ON r.rid = t.rid
        LEFT JOIN xanxus.ClosedDays cd 
        ON r.rid = cd.rid 
        AND cd.date = ? 
        LEFT JOIN xanxus.Reservations rv 
        ON t.tid = rv.tid 
        AND t.rid = rv.rid 
        AND rv.date = ? 
        AND rv.time = ?
        WHERE r.activated = 1
        AND t.seats >= ?
        AND r.openingTime <= ?
        AND r.closingTime > ?
        AND cd.date IS NULL  
        AND rv.rid IS NULL; `;


        //change the query
        const [results] = await connection.execute(restQuery, [
            mysqlDate,     // date check for closed 
            mysqlDate,     // date in reservation
            time,          // reservation time
            guests,        // number of guests
            time,          // equal to or later than opening
            time,          // before closing
        ]);

        if (results.length === 0) {
            return errorResponse(400, "No restaurants available to list for your day, time and guests.");
        }

        console.log("Restaurants selected");

        const response = {
            year,
            month,
            day,
            time,
            guests,
            availableRestaurants: results.map((restaurant) => ({
                rid: restaurant.rid,
                name: restaurant.name,
                address: restaurant.address,
            })),
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error("Error searching for restaurants:", error);
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
