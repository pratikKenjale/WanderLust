const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const allListings = await Listing.find({}).populate("owner");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    return initDB();
  })
  .then(() => {
    console.log("Data was initialized");
  })
  .catch((err) => {
    console.error("Error:", err);
  })
  .finally(() => {
    mongoose.connection.close();
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

async function initDB() {
  await Listing.deleteMany({});
  initData.data.map((obj) => ({...obj, owner :"684ab8758526b59b2709f20b",}));
  await Listing.insertMany(initData.data);

};

initDB();

