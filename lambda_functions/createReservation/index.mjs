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

const errorResponse = (statusCode, message) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
});

export const handler = async (event) => {
    let connection;
    try {
        console.log("Function started");

        // Parse input event
        const { year, month, day, time, guests, email, rid, tid } = JSON.parse(event.body || "{}");
        console.log(`Received data: year=${JSON.stringify(year)}, month=${JSON.stringify(month)}, day=${JSON.stringify(day)}, time=${JSON.stringify(time)}, guests=${JSON.stringify(guests)}, email=${JSON.stringify(email)}, rid=${JSON.stringify(rid)}, tid=${JSON.stringify(tid)}`);

        if (!year) return errorResponse(400, "No year entered.")
        if (!month) return errorResponse(400, "No month entered.")
        if (!day) return errorResponse(400, "No day entered.")
        if (!time) return errorResponse(400, "No time entered.")
        if (!guests) return errorResponse(400, "No guest amount entered.")
        if (!email) return errorResponse(400, "No email entered.")
        if (!email.includes('@')) return errorResponse (400, "Email is in invalid form (must contain @).")
        if (!rid) return errorResponse(400, "No rid entered.")
        if (!tid) return errorResponse(400, "No tid entered.")

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

        // available table selection should have already been handled prior to this

        // Generate UUID
        const rvid = uuidv4();
        console.log(`Generated UUID: ${rvid}`);

        const connection = await mysql.createConnection(dbConfig);
        console.log("Database connection established");

        // make query to insert reservation
        const query = `INSERT INTO Reservations (rvid, guestEmail, numGuests, tid, rid, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await connection.execute(query, [rvid, email, guests, tid, rid, mysqlDate, time]);
        await connection.end();
        console.log("Database operation complete");

        // send back response, including inputted data and new rvid
        const response = {
            year, month, day, time, guests, email, rid, tid, rvid,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
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
