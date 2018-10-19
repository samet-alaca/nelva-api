import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/test', (request, response) => {
    response.sendFile(path.join(__dirname, '/../../src/index.html'));
});

router.get('/stream/source.m3u8', (request, response) => {
    response.sendFile(path.join(__dirname, '/../../stream/source.m3u8'));
});

export default router;
