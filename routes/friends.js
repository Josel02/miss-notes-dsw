const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

router.post('/sendFriendRequest/:requesterId/:receiverId', friendsController.sendFriendRequest);
router.patch('/acceptFriendRequest/:friendshipId', friendsController.acceptFriendRequest);
router.patch('/rejectFriendRequest/:friendshipId', friendsController.rejectFriendRequest);
router.get('/listFriends/:userId', friendsController.listFriends);
router.get('/listPendingRequests/:userId', friendsController.listPendingRequests);

module.exports = router;
