const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialControllers');
const { authUser } = require('../middleware/authUser');

router.post('/create-credential', authUser, credentialController.createCredential);
router.post('/fetch-credential', authUser, credentialController.fetchCredential);
router.post('/update-credential', authUser, credentialController.updateCredential);
router.post('/delete-credential', authUser, credentialController.deleteCredential);

module.exports = router;
