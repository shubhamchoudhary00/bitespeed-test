require("reflect-metadata");
const express = require("express");
const { createConnection } = require("typeorm");
const Contact = require("./entity/Contact");

const app = express();
app.use(express.json());

createConnection({
    type: "sqlite",  // or whatever database you're using
    database: "database.sqlite",
    synchronize: true,
    entities: [Contact],
}).then(() => {
    console.log("Database connected!");

    // Define routes here after the database is connected
    const identifyRoute = require("./routes/identify");
    app.use("/api", identifyRoute);

    app.get("/", (req, res) => {
        res.send("Hello, World!");
    });

    const PORT = process.env.PORT ;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => console.log(error));
