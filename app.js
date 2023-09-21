// Aufbau der Auswahlfelder
const express = require("express");
const app = express();
const mariadb = require("mariadb");
const port = 3000;
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require("path");
const pool = mariadb.createPool({
    host: "localhost",
    user: "flemo",
    password: "motherfucker1",
    database: "learndb",
});

// Lege einen Table an, falls dieser noch nicht existiert
pool.getConnection()
    .then((conn) => {
        conn.query(
            "CREATE TABLE IF NOT EXISTS highscore (id INT PRIMARY KEY, name VARCHAR(255), highscore INT)"
        )
            .then((result) => {
                console.log("Table wurde erfolgreich angelegt");
                conn.release();
            })
            .catch((e) => {
                console.log("Fehler beim Anlegen des Tables: ", e);
                conn.release();
            });
    })
    .catch((e) => {
        console.log("Fehler beim Anlegen des Tables: ", e);
    });

//Haupseite
app.get("/", (req, res) => {
    const htmlFilePath = path.join(__dirname, "spiel.html");
    res.sendFile(htmlFilePath);
});

//Funktion zur zufälligen Ermittlung eines Farbarrays
app.get("/getColors", (req, res) => {
    const colors = ["red", "green", "blue", "yellow"];
    let randomColors = [];
    for (let i = 0; i < colors.length; i++) {
        let randomNumber = Math.floor(Math.random() * colors.length);
        randomColors.push(colors[randomNumber]);
    }
    res.send(randomColors);
});

// Funktion zur Ausgabe des Highscores
app.get("/highscore", (req, res) => {
    const insertQuery =
        "SELECT * FROM highscore ORDER BY highscore ASC LIMIT 10";
    pool.getConnection()
        .then((conn) => {
            conn.query(insertQuery)
                .then((results) => {
                    res.status(200).send(results);
                    conn.release();
                })
                .catch((e) => {
                    console.log(
                        "Ein Fehler ist beim Senden der Daten aufgetreten" + e
                    );
                    res.status(500).send("Ein Fehler ist aufgetreten");
                });
        })
        .catch((e) => {
            console.log("Ein Fehler ist beim Senden der Daten aufgetreten" + e);
            res.status(500).send("Ein Fehler ist aufgetreten");
        });
});

let userId = 0;
app.post("/score", (req, res) => {
    const name = req.body.name;
    userId += 1;
    const highscore = req.body.highscore;
    const insertQuery =
        "INSERT INTO highscore (id, name, highscore) VALUES (" + userId + ", '" + name + "', " + highscore + ")";

    pool.getConnection()
        .then((conn) => {
            conn.query(insertQuery)
                .then((result) => {
                    console.log("Neuer Highscore angelegt");
                    conn.release();
                })
                .catch((e) => {
                    console.log("Fehler beim Insert: ", e);
                    conn.release();
                });
        })
        .catch((e) => {
            console.log("Fehler beim Insert: ", e);
        });
});

app.listen(port, () => {
    console.log(`Server gestartet auf Port ${port}`);
});
