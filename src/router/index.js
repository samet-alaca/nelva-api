import express from 'express';

const router = express.Router();

router.get('/test', (request, response) => {
    response.send('ok');
});

export default router;
