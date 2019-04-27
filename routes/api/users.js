const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')


// Load user model
const User = require('../../models/User')



// @routes GET api/users/test
// @description Tests users route
// @access Public

router.get('/test', (req,res)=>{
	res.json({msg: "Users works"})
})

// @routes GET api/users/register
// @description to register users
// @access Public


router.post('/register', (req, res) => {
	// check if the email doesnt exisit
	User.findOne({ email: req.body.email})
		.then(user => {
			if(user){
				return res.status(400).json({email:"email already exists"})
			} else {
				const avatar = gravatar.url(req.body.email,{
					s: '200', // size
					r: 'pg', // Rating
					d: 'mm' // default
				})
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					avatar,
					password: req.body.password

				});
				bcrypt.genSalt(10, (err,salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) =>{
						if(err) throw err;
						newUser.password = hash;
						newUser.save()
						.then(user => res.json(user))
						.catch(err => console.log(err))
					})
				})
			}
		})

})

// @routes GET api/users/login
// @description to login users/ Returing JWT token
// @access Public

router.post('/login', (req,res) => {
	const email = req.body.email;
	const password = req.body.password;

	//Find user by email

	User.findOne({email})
		.then( user=>{
			// check for user
			if(!user){
				return res.status(404).json({email: "user email not found"})
			}

			// check password

			bcrypt.compare(password, user.password)
				  .then(isMatch =>{
				  	if(isMatch){
				  		// User Matched
				  		
				  		const payload = {
				  			id: user.id,
				  			name: user.name,
				  			avatar: user.avatar
				  		} // create JWT payload


				  		// Sign Token
				  		jwt.sign(
				  			payload, 
				  			keys.secretOrKey, 
				  			{ expiresIn: 3600 }, 
				  			(err, token) => {

				  			if(err){
				  				res.send(400).json({token: "token error"})
				  			}

				  			res.json({
				  				sucess: true,
				  				token: 'Bearer ' + token
				  			});
				  		});

				  		
				  	} else {
				  		return res.status(400).json({password: 'password incorrect'})
				  	}
				  })
		})
});

// @routes GET api/users/current
// @description Return current user
// @access Private


router.get('/current', passport.authenticate('jwt', {session:false}), (req,res)=>{
	res.json({
		id: req.user.id,
		name: req.user.name,
		email: req.user.email
	});
})


module.exports = router;