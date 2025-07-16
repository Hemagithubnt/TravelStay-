const express = require("express");
const router = express.Router();
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");



 // Make schemaValidater variable
const validateListing = (req,res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else {
    next();
  }
};

//Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", wrapAsync(async (req, res) => {
  const { listing } = req.body;

  // Remove empty image values so schema defaults apply
  if (!listing.image.url) listing.image.url = undefined;
  if (!listing.image.filename) listing.image.filename = undefined;

  const newListing = new Listing(listing);
  await newListing.save();
  res.redirect("/listings");
}));


//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;

  // Remove empty image values
  if (!listing.image.url) listing.image.url = undefined;
  if (!listing.image.filename) listing.image.filename = undefined;

  await Listing.findByIdAndUpdate(id, { $set: listing }, { runValidators: true });
  res.redirect(`/listings/${id}`);
}));



//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

module.exports = router;