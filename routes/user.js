const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
const { saveRedirectUrl } = require("../middleware.js"); // ✅ CORRECT

 
    // router for given the signup form
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});
            
// router for handling the signup form submission
router.post("/signup",wrapAsync(async(req, res) => {
    try{
    let {username,email,password} = req.body;
    const newUser = new User({username,email});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) =>{
        if(err){
                return next(err);
        }
    req.flash("success", "Welcome to TravelStay!");
    res.redirect("/listings");
    });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
   }));
    
//    /login router for taking form of login 
   router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
   });


// Login router to submit the login form for checking that user is authenticated or not
router.post(
  "/login",
  saveRedirectUrl, // ✅ Now this is a real function
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success", "Welcome back to TravelStay!");
    res.redirect(redirectUrl);
  }
);



// Logout router
router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if (err){
            return next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listings");
    });
});
    

module.exports = router;