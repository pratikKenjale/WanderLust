const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listngController = require("../controllers/listings.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// ✅ SEARCH ROUTE — must be BEFORE any route with ":id"
router.get("/search", async (req, res) => {
  const { q } = req.query;

  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } }
    ]
  });

  res.render("listings/index", { listings });
});

router.route("/")
.get( wrapAsync(listngController.index))

.post(isLoggedIn,
  validateListing,upload.single("listing[image]"),
  wrapAsync(listngController.createListing)
);

//New Route
router.get("/new", isLoggedIn, listngController.renderNewForm);


router.route("/:id")
 .get( wrapAsync(listngController.showListing)) 

 .put( isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing, wrapAsync(listngController.updateListing))

  .delete(isLoggedIn,
  isOwner,
  wrapAsync(listngController.deleteListing));

  
//Edit Route
router.get("/:id/edit", 
  isLoggedIn,
  isOwner,
  wrapAsync(listngController.renderEditForm));

module.exports = router;



