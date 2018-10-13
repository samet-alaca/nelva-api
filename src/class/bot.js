import { Client } from 'discord.js';
import { EventEmitter } from 'events';
import Database from './database';

export default class Bot extends EventEmitter {
    constructor(config, prefix = '/') {
        super();
        if(config.token && config.token.length === 59) {
            this.token = config.token;
            this.prefix = prefix;
            this.error = error => { throw error; };
            this.client = new Client();
            this.client.login(this.token).catch(this.error);
            this.client.on('error', this.error);
            this.client.on('ready', () => {
                this.start();
            });
        }
    }

    start() {
        this.client.removeAllListeners('message');
        this.client.on('message', message => {
            if(message.content.indexOf(this.prefix) === 0) {
                const command = message.content.slice(1).split(' ');
                if(this[command[0]] instanceof Function) {
                    this[command[0]](message, command.slice(1));
                } else {
                    message.channel.send('Cette commande n\'existe pas');
                }
            } else if(!message.author.bot) {
                this.count(message);
            }
        });
    }

    count(message) {
        const query = {
            user: message.author.id,
            date: (new Date()).toLocaleDateString()
        };
        const update = {
            $inc: {
                messages: 1,
                characters: message.content.length
            }
        };

        Database.stats.update(query, update, { upsert: true });
    }
    /*
    stats(message, args) {

    }
    */
}
