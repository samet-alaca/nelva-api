import express from 'express';

const router = express.Router();

router.get('/test', (request, response) => {
    response.sendFile('../index.html');
});

export default router;
