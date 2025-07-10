const Listing = require("./models/listing");
const ExpressError = require("./Utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/reviews");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        //redirectURL save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create a new listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

/// Listing Schema Server Side Validation
module.exports.validateListing = (req,res,next) => {
    const { error } = listingSchema.validate(req.body);

    if(error) {
        let errMsg = error.details?.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else {
        next();
    }
};

// Server-side validation for reviews
module.exports.validateReview = (req, res, next) => {
    console.log("Validating review data:", req.body); 
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log("Review validation error:", errMsg); 
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review) {
        req.flash("error","Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the author of this review"); 
    }
    next();
};