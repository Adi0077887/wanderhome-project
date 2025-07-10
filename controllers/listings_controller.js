const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "The Listing you requested for does not exist");
        return res.redirect("/listings"); 
    }
    res.render("listings/show.ejs", { listing, mapToken: process.env.MAP_TOKEN });
}

module.exports.createListing = async (req, res, next) => {
    try {
        // Validate required fields
        if (!req.body.listing) {
            req.flash("error", "Invalid listing data");
            return res.redirect("/listings/new");
        }

        const { listing } = req.body;
        
        if (!listing.location) {
            req.flash("error", "Location is required");
            return res.redirect("/listings/new");
        }

        // Geocode the location
        const response = await geocodingClient
            .forwardGeocode({
                query: listing.location,
                limit: 1,
            })
            .send();

        console.log("Geocoding response:", response.body);

        const geoData = response.body.features[0];

        if (!geoData || !geoData.geometry) {
            req.flash("error", "Could not find location on map. Please try a different location.");
            return res.redirect("/listings/new");
        }

        // Create new listing with only the fields that exist in your schema
        const newListing = new Listing({
            title: listing.title,
            description: listing.description,
            price: listing.price,
            location: listing.location,
            country: listing.country,
            owner: req.user._id,
            geometry: {
                type: "Point",
                coordinates: geoData.geometry.coordinates,
            }
        });

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }

        
        await newListing.save();
        
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
        
    } catch (error) {
        req.flash("error", "Error creating listing. Please try again.");
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","The Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;
        const updateData = {
            title: req.body.listing.title,
            description: req.body.listing.description,
            price: req.body.listing.price,
            location: req.body.listing.location,
            country: req.body.listing.country
        };

        if (req.body.listing.location) {
            const response = await geocodingClient
                .forwardGeocode({
                    query: req.body.listing.location,
                    limit: 1,
                })
                .send();

            const geoData = response.body.features[0];
            if (geoData && geoData.geometry) {
                updateData.geometry = {
                    type: "Point",
                    coordinates: geoData.geometry.coordinates,
                };
            }
        }

        let listing = await Listing.findByIdAndUpdate(id, updateData, { new: true });

        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
        
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Error updating listing. Please try again.");
        res.redirect(`/listings/${req.params.id}/edit`);
    }
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}