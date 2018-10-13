import Database from 'nedb';
import path from 'path';

export default {
    /*
    {
        user: INT (18)
        date: DATE
        messages: INT (n)
        characters: INT (n)
    }
    */
    stats: new Database({
        filename: path.join(__dirname, '/../../database/stats.db'),
        autoload: true,
        timestampData: true
    })
};
