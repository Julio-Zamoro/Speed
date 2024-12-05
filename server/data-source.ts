import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    username: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '021412',
    port: 5432,
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
})
