import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/test', (request, response) => {
    response.sendFile(path.join(__dirname, '/../../src/index.html'));
});
export default router;
