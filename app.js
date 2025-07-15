if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}

console.log("SECRET from .env:", process.env.SECRET);
console.log("ATLASDB_URL from .env:", process.env.ATLASDB_URL);

// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing");
const passportLocalMongoose = require("passport-local-mongoose");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";


console.log("DB URL is:",process.env.ATLASDB_URL );


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
};



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public')); // ✅ very important

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:"mysupersecretcode",
  },
  touchAfter:24*3600,
});

store.on("error",() => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions ={
  store,
  secret : "mysupersecretcode",
  resave : false,
  saveUninitialized : true,
  Cookie : {
    expires : Date.now()+7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  },
};



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
   res.locals.currentUser =req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.req = req; 
  next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews);
app.use("/", user);

app.use((err, req, res,next) => {
   const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status (statusCode).render("error.ejs",{err,message});
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});


app.get("/listings/new", (req, res) => {
  res.render("listings/new"); 
});

