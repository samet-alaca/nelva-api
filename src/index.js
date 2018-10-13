import config from '../config';
import Api from './class/api';
import Database from './class/database';
import Bot from './class/bot';
import Cinelva from './class/cinelva';

const processes = {
    api: new Api(config.api),
    bot: new Bot(config.bot),
    cinelva: new Cinelva()
};
