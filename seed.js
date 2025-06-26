// seed.js
require('dotenv').config();
console.log("ATLASDB_URL:", process.env.ATLASDB_URL);

const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");
const User = require("./models/user");
const { data: sampleListings } = require("./data");
const locationIQToken = 'pk.888e4523ae15a9ca48d8cb6d35946124';


const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connected");
});

// Function to get coordinates using LocationIQ
const getCoordinates = async (location) => {
  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: locationIQToken,
        q: location,
        format: 'json'
      }
    });

    const place = response.data[0];
    return [parseFloat(place.lon), parseFloat(place.lat)];
  } catch (err) {
    console.error(`Failed to geocode location: ${location}`);
    return [0, 0]; // Default or fallback
  }
};

const seedDB = async () => {
  await Listing.deleteMany({});
  await User.deleteMany({});

  // Create a test user to assign as owner
  const user = new User({ email: "test@gmail.com", username: "tester" });
  await User.register(user, "1234");

   const listingsWithOwner = [];

  for (let listing of sampleListings) {
    const coordinates = await getCoordinates(listing.location);

    listingsWithOwner.push({
      ...listing,
      owner: user._id,
      geometry: {
        type: "Point",
        coordinates: coordinates
      }
    });
  }

  await Listing.insertMany(listingsWithOwner);
  console.log("Seeded listings with owner");

  mongoose.connection.close();
};

seedDB();
