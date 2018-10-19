import express from 'express';
import compression from 'compression';
import parser from 'body-parser';
import cors from 'cors';
import router from '../router';

export default class API {
    constructor(config) {
        if(Number.isInteger(config.port)) {
            this.api = express();
            this.api.use(compression());
            this.api.use(parser.json());
            this.api.use(parser.urlencoded({ extended: true }));
            this.api.use(cors({ exposeHeaders: ['Link'] }));
            this.api.use('/', router);
            this.api.listen(config.port);
        }
    }
}
