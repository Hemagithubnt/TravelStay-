const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isReviewAuthor,validateReview } = require("../middleware.js");



// Post Reviews Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  // ✅ Assign author to the review
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review created successfully!");
  res.redirect(`/listings/${listing._id}`);
}));


// Delete Reviews Route
router.delete('/:reviewId',isReviewAuthor,wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
   req.flash("success", " Review Deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;