const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// Load validation

const validateProfileInput = require('../../validation/profile')

// Load Profile Model
const Profile = require('../../models/Profile')

// Load User Model
const User = require('../../models/User')


// @routes GET api/profile/test
// @description Tests profile route
// @access Public

router.get('/test', (req,res)=>{
	res.json({msg: "Profile works"})
})


// @routes GET api/profile/
// @description Tests profile route
// @access Private

router.get('/', passport.authenticate('jwt',{session:false}), (req,res) =>{
	const errors = {}
 	Profile.findOne({ 
 		user: req.user.id
 	})
 	.populate('user',['name','avatar'])
 	.then(profile=>{
 		if(!profile){
 			errors.noprofile = 'There is no profile for this user'
 			return res.status(404).json(errors);
 		} 
 			res.json(profile)
 		
 	})
 	.catch(err => res.status(404).json(err));

})



// @routes GET api/profile/all/
// @description Get all profiles
// @access Public

router.get('/all', (req,res) => {
	const errors= {}
	Profile.find()
			.populate('user',['name','avatar'])
			.then(profile => {
				if(!profile){
					errors.noprofile = "There are no profiles"
					return res.status(400).json()
				}
				res.json(profile)
			})
			.catch(err => res.status(404).json({profile: "There are no profiles"}))
})


// @routes GET api/profile/handle/:handle
// @description Get profile by handle 
// @access Public

router.get('/handle/:handle', (req,res) => {
	const errors = {}

	Profile.findOne({handle: req.params.handle})
			.populate('user',['name','avatar'])
			.then(profile => {
				if(!profile){
					errors.noprofile = 'There is no profile for this user'
					res.status(404).json(errors)
				}
				res.json(profile)
			})
			.catch(err => res.status(404).json(err));

} )


// @routes GET api/profile/handle/:user_id
// @description Get profile by handle 
// @access Public

router.get('/user/:user_id', (req,res) => {
	const errors = {}

	Profile.findOne({user: req.params.user_id})
			.populate('user',['name','avatar'])
			.then(profile => {
				if(!profile){
					errors.noprofile = 'There is no profile for this user'
					res.status(404).json(errors)
				}
				res.json(profile)
			})
			.catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
			
} )





// @routes Post api/profile/
// @description create or edit user profile
// @access Private

router.post('/',
 passport.authenticate('jwt',{session:false}),
 (req,res) =>{

 	const {errors, isValid} = validateProfileInput(req.body);

 	//check  validation

 	if(!isValid){
 		// Return any errors with 400 status
 		return res.status(400).json(errors)
 	}
 	// Get fields

 	const profileFields = {}
 	profileFields.user = req.user.id;
 	if(req.body.handle) profileFields.handle = req.body.handle
	if(req.body.company) profileFields.company = req.body.company
 	if(req.body.website) profileFields.website = req.body.website
 	if(req.body.location) profileFields.location = req.body.location
 	if(req.body.bio) profileFields.bio = req.body.bio
 	if(req.body.status) profileFields.status = req.body.status
 	if(req.body.githubusername) profileFields.githubusername = req.body.githubusername

 		// Skills - Split into array
 	if(typeof req.body.skills !== 'undefined'){
 		profileFields.skills = req.body.skills.split(',')
	}
 	
 	profileFields.social = {}

 	if(req.body.youtube) profileFields.social.youtube = req.body.youtube
 	if(req.body.twitter) profileFields.social.twitter = req.body.twitter
 	if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
 	if(req.body.facebook) profileFields.social.facebook = req.body.facebook
 	if(req.body.instagram) profileFields.social.instagram = req.body.instagram


 	Profile.findOne({user: req.user.id})
 			.then(profile=>{
 				if(profile){
 					// Update

 					Profile.findOneAndUpdate({user: req.user.id}, {$set:profileFields}, {new: true})
 							.then(profile => res.json(profile))
 				} else {
 					//Crete

 					// Check if handle exists

 					Profile.findOne({handle: profileFields.handle})
 							.then(profile => {
 								if(profile){
 									errors.handle = 'That handle already exists'
 									res.status(400).json(errors)
 								}
 								// Save profile

 								new Profile(profileFields).save().then(profile => res.json(profile))

 							})
 				}

 			})
 	
})






module.exports = router;