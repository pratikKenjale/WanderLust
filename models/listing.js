const mongoose = require("mongoose");
const review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
   
},
  price: Number,
  location: String,
  country: String,
  reviews : [
    {
      type : Schema.Types.ObjectId,
      ref : "Review",
    },
  ],
  owner : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
  },
   location: String,
  geometry: {
    type: {
      type: String, // Must be 'Point'
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }

});




listingSchema.post("findOneAndDelete",async (listing)=>{
  if(listing) {
  await review.deleteMany({_id : {$in : listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
