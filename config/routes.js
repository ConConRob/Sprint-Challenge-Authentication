const axios = require("axios");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const knexConfig = require("../knexfile").development;
const db = knex(knexConfig);
const jwt = require("jsonwebtoken");

const { authenticate, makeTokenFromId } = require("../auth/authenticate");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let { username, password } = req.body;
  if (username && password) {
    password = bcrypt.hashSync(password, 12);
    db("users")
      .insert({ username, password })
      .then(() =>
        res.status(201).json({ message: "Successfully created a user" })
      )
      .catch(error => {
        res.status(400).json({ error, message: "Username already taken" });
      });
  } else {
    res
      .status(400)
      .json({ message: "Include a username, password and department" });
  }
}

function login(req, res) {
  // implement user login
  const { username, password } = req.body;
  if (username && password) {
    db("users")
      .where({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = makeTokenFromId(user.id);
          res.status(200).json({ token });
        } else {
          res.status(401).json({ message: "Invalid Credentials" });
        }
      });
  } else {
    res.status(401).json({ message: "Username and password required" });
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
