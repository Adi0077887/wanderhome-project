/// SERVER SIDE VALIDATION SCHEMA ////

const Joi = require('joi');

///Listing Schema Server Side Validation So THAT NO ONE CAN PUT IRRELEVANT DATA IN OUR LISTING ///

module.exports.listingSchema = Joi.object({
    listing : Joi.object().required({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("",null)
    }).required()
})

//// REVIEW SERVER SIDE VALIDATON ///
module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().min(1).max(5),
        comment : Joi.string().required(),
    }).required()
})