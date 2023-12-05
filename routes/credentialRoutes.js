const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialControllers');
const { authUser } = require('../middleware/authUser');

router.post('/create-credential', authUser, credentialController.createCredential);
router.get('/fetch-credential', authUser, credentialController.fetchCredential);
router.put('/update-credential', authUser, credentialController.updateCredential);
router.delete('/delete-credential', authUser, credentialController.deleteCredential);

module.exports = router;
