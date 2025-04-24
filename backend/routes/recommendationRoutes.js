const express = require('express');
const { getRecommendations } = require('../services/recommendationModel');

const router = express.Router();

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const recommendations = await getRecommendations(userId);
    res.json({ recommendations });
});

module.exports = router;
