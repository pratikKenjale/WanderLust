const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("listings/index.ejs", {listings : allListings});
};


module.exports.renderNewForm = (req, res) => { 
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let  id  = req.params.id;
  const listing = await Listing.findById(id)
  .populate({path : "reviews",
    populate : {path : "author",
    },
     })
  .populate("owner");

  if(!listing){
     req.flash("error", "Listing you requested for does not exists!");
     return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => { 
  try {
    const { listing } = req.body;
    const { latitude, longitude } = req.body;
    
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

    // Image info
    let url = req.file?.path;
    let filename = req.file?.filename;

    // Create new listing with all required fields
    const newListing = new Listing({
      ...listing,
      image: { url, filename },
      owner: req.user._id,
      geometry: {
        type: 'Point',
        coordinates: [longitude,latitude] 
      }
    });



    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    next(err); 
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
    if(!listing){
     req.flash("error", "Listing you requested for does not exists!");
     return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if(typeof req.file !== "undefined") {
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image ={url,filename};
  await listing.save();
  }
  req.flash("success", "Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing =   async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted !");
  res.redirect("/listings");
};

