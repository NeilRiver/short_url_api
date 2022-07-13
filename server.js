const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 3001
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');

let pgp = require("pg-promise")();
let db = pgp("postgres://lsapriod:n8ECtjYRJXCc8cqnf7Zk5Xfw_IHvkZhm@dumbo.db.elephantsql.com/lsapriod");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

app.get('/users', (req, res) => {

    db.any('select * from users')
        .then(function (data) {
            res.json(data)
        })
        .catch(function (error) {
            res.json({ "error": true })
        });

})

app.post('/create_user', (req, res) => {

    db.any('select * from users where email = $1', [req.body.email])
        .then((data) => {
            if (data.length == 0) {
                db.none('insert into users values(default, $1, $2)', [req.body.email, req.body.password])
                    .then(() => {
                        res.json({ "id": uuidv4(), "severity": "success", "email": req.body.email, "text": "The user has been successfully created" })
                    })
                    .catch(error => {
                        console.log(error)
                        res.json({ "id": uuidv4(), "severity": "error", "email": req.body.email, "text": "Cant create user" })
                    });
            } else {
                res.json({ "id": uuidv4(), "severity": "error", "email": req.body.email, "text": `Email ${req.body.email} is already taken` })
            }
        })
        .catch(error => {
            console.log(error)
            res.json({ "id": uuidv4(), "severity": "error", "text": "Неизветстная ошибка" })
        });
})

app.post('/login', (req, res) => {

    db.any('select * from users where email = $1 and password = $2', [req.body.email, req.body.password])
        .then((data) => {
            if (data.length !== 0) {
                res.json({ "id": uuidv4(), "severity": "success", "email": req.body.email, "text": `Success  login ${req.body.email}` })
            } else {
                res.json({ "id": uuidv4(), "severity": "error", "email": req.body.email, "text": `Invalid email address or password` })
            }
        })
        .catch(error => {
            console.log(error)
            res.json({ "id": uuidv4(), "severity": "error", "text": "Неизветстная ошибка" })
        });
})

app.get('/delete_by_range_id', (req, res) => {
    db.any('DELETE FROM users WHERE id BETWEEN 26  AND 1000')
        .then((data) => {
            console.log('Delete')
            res.send('Delete')
        })
        .catch(error => {
            console.log('error', error)
        });
})

app.listen(process.env.PORT || port, () => {
    console.log(app.listen().address())
    console.log(`Example app listening on port ${port}`)
})