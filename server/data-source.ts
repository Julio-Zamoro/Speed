import "reflect-metadata"
import { DataSource } from "typeorm"
import { Sequence } from "./entity/sequence.entity"
import { Cedente } from "./entity/cedente.entity"

export const AppDataSource = new DataSource({
    type: "postgres",
    username: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123',
    port: 5432,
    synchronize: true,
    logging: false,
    entities: [Sequence, Cedente],
    migrations: [],
    subscribers: [],
})
