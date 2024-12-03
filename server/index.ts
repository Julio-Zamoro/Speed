import { AppDataSource } from "./data-source";
import { routes } from "./routes";
const express = require('express')
    const cors = require('cors')

AppDataSource.initialize().then(async () => {
    const server = express()

    server.use(express.json());
    server.use(cors())

    server.use(routes)

    server.listen(3001)

}).catch(error => console.log(error))
