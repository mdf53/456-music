"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = connectDb;
exports.getDb = getDb;
exports.closeDb = closeDb;
const mongodb_1 = require("mongodb");
let client = null;
let db = null;
async function connectDb() {
    if (db)
        return db;
    const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB_NAME ?? "456-music";
    client = new mongodb_1.MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    return db;
}
function getDb() {
    if (!db)
        throw new Error("Database not connected. Call connectDb() first.");
    return db;
}
async function closeDb() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}
