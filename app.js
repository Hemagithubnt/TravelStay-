const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");


const MONGO_URL = "mongodb://127.0.0.1:27017/TravelStay";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "public")));
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true, // Helps prevent XSS attacks
}
};
app.get("/",(req,res)=>{
    res.send("you are on right path");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
res.locals.success = req.flash("success");
next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080, ()=>{
    console.log("server is listening on port 8080");
});