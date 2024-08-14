import { DataSource } from "typeorm";
import { SocketEntity } from "./DBModels.js";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../', '.env') });

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: true,
    logging: process.env.NODE_ENV === 'development' ? ["query", "warn", "error"] : ["warn", "error"],
    logger: process.env.NODE_ENV === 'development' ? 'advanced-console' : 'file',
    entities: [SocketEntity],
});

export const connect = async () => {
    try {
        const ds = await AppDataSource.initialize();
        console.log("Connected to database");
        await ds.getRepository(SocketEntity).clear();
        console.log("Truncated SocketEntity table");
        return ds;
    } catch (err) {
        console.error("Failed to connect to database:", err);
        throw err;
    }
};
