const Listing = require("../models/listing");
const Review = require("../models/reviews");

module.exports.createReview = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            console.log("Listing not found for ID:", req.params.id);
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        console.log("Listing found:", listing.title);

        // Check if review data exists
        if (!req.body.review) {
            console.log("No review data in request body");
            req.flash("error", "Invalid review data");
            return res.redirect(`/listings/${req.params.id}`);
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        
        console.log("New review created:", newReview);
        
        await newReview.save();
        console.log("Review saved successfully");
        
        await Listing.findByIdAndUpdate(
            req.params.id,
            { $push: { reviews: newReview._id } },
            { new: true }
        );
        console.log("Review added to listing");
        
        req.flash("success", "Review added successfully!");
        res.redirect(`/listings/${listing._id}`);
        
    } catch (error) {
        console.error("Error creating review:", error);
        console.error("Error stack:", error.stack);
        req.flash("error", "Error adding review. Please try again.");
        res.redirect(`/listings/${req.params.id}`);
    }
};

module.exports.destroyReview = async (req, res) => {
    try {
        console.log("=== DELETE REVIEW DEBUG ===");
        console.log("Request params:", req.params);
        
        const { id, reviewId } = req.params;
        
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        
        console.log("Review deleted successfully");
        req.flash("success", "Review deleted successfully!");
        res.redirect(`/listings/${id}`);
        
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Error deleting review. Please try again.");
        res.redirect(`/listings/${req.params.id}`);
    }
};