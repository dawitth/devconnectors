const express = require('express');
const router = express.Router();



// @routes GET api/users/test
// @description Tests users route
// @access Public

router.get('/test', (req,res)=>{
	res.json({msg: "Users works"})
})


module.exports = router;