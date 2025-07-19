const express = require("express");
const router = express.Router();
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");


//Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate: {
        path: "author",
    },
    })
    .populate("owner");
  if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");    
  }
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  const { listing } = req.body;

  // Handle image field properly
  if (!listing.image) {
    listing.image = {}; // Initialize image object if it doesn't exist
  }
  
  // Remove empty image values so schema defaults apply
  if (!listing.image.url || listing.image.url.trim() === "") {
    delete listing.image.url; // Let schema default take over
  }
  if (!listing.image.filename || listing.image.filename.trim() === "") {
    delete listing.image.filename; // Let schema default take over
  }

  // Create new listing and set owner
  const newListing = new Listing(listing);
  newListing.owner = req.user._id; // Set owner AFTER creating the object
  
  await newListing.save();
  req.flash("success", "Listing created successfully!");
  res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");    
  }
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner ,validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;

  // Handle image field properly
  if (!listing.image) {
    listing.image = {};
  };
  
  // Remove empty image values so schema defaults apply
  if (!listing.image.url || listing.
    image.url.trim() === "") {
    delete listing.image.url;
  };
  if (!listing.image.filename || listing
    .image.filename.trim() === "") {
    delete listing.image.filename;
  };

  await Listing.findByIdAndUpdate(id, { $set: listing }, { runValidators: true });
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted successfully!");
  res.redirect("/listings");
}));

module.exports = router;