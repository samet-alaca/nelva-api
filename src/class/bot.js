import { Client, RichEmbed } from 'discord.js';
import { EventEmitter } from 'events';
import Plotly from 'plotly';
import Database from './database';
import Dates from './dates';

export default class Bot extends EventEmitter {
    constructor(config, prefix = '/') {
        super();
        if(config.token && config.token.length === 59) {
            this.error = error => { throw error; };
            this.responses = {
                NOT_ALLOWED: 'Vous n\'êtes pas autorisés à utiliser cette commande.',
                SPAM: 'Tu te calmes avec le spam stp :)',
                COMMAND_NOT_FOUND: 'Cette commande n\'existe pas',
                MISSING_ARG: 'Argument manquant',
                INVALID_ARG: 'Valeur invalide pour l\'argument',
                NOTIFY_SUCCESS: 'Tous les utilisateurs concernés ont été notifiés. :incoming_envelope:',
                ERRORS: 'Des erreurs sont survenues'
            };
            this.plotly = new Plotly(config.charts.username, config.charts.token);
            this.token = config.token;
            this.roles = config.roles;
            this.prefix = prefix;
            this.forbidden = ['constructor', 'start', 'count', 'args'];
            this.date = Dates.today();
            this.counter = {};
            this.last = null;
            this.client = new Client();
            this.client.login(this.token).catch(this.error);
            this.client.on('error', this.error);
            this.client.on('ready', () => {
                this.start();
            });
        }
    }

    start() {
        this.client.on('message', message => {
            if(message.content.indexOf(this.prefix) === 0) {
                const command = message.content.slice(1).split(' ');
                if(this[command[0]] instanceof Function && this.forbidden.indexOf(command[0]) === -1) {
                    if(Date.now() - this.last > 1000) {
                        this[command[0]](message, this.args(command.slice(1)));
                    } else {
                        message.channel.send(this.responses.SPAM);
                    }
                } else {
                    message.channel.send(this.responses.COMMAND_NOT_FOUND);
                }
                this.last = Date.now();
            } else if(!message.author.bot) {
                this.count(message);
            }
        });
    }

    count(message) {
        if(!message || !message.author || !message.author.id || !message.content) {
            return false;
        }

        if(Dates.today() !== this.date) {
            Database.stats.insert(Object.values(this.counter));
            this.counter = {};
            this.date = Dates.today();
        }

        if(this.counter[message.author.id]) {
            this.counter[message.author.id].messages++;
            this.counter[message.author.id].characters += message.content.length;
        } else {
            this.counter[message.author.id] = {
                user: message.author.id,
                date: this.date,
                messages: 1,
                characters: message.content.length
            };
        }
    }

    args(argsArray) {
        const args = {};
        let current = null;

        if(!Array.isArray(argsArray) || argsArray.length < 1) {
            return args;
        }

        for(let index = 0; index < argsArray.length; index++) {
            if(argsArray[index].indexOf('-') === 0) {
                current = argsArray[index].slice(1);
                args[current] = argsArray.length > index + 1 && argsArray[index + 1].indexOf('-') !== 0 ? '' : true;
            } else if(current) {
                args[current] += argsArray[index] + ' ';
            }
        }

        Object.keys(args).forEach(key => {
            if(args[key].trim instanceof Function) {
                args[key] = args[key].trim();
            }
        });

        return args;
    }

    notify(message, args) {
        if(!message.member.roles.has(this.roles.adminDev) && !message.member.roles.has(this.roles.botDev)) {
            message.channel.send(this.responses.NOT_ALLOWED);
            return false;
        }

        if(!args.message) {
            message.channel.send(this.responses.MISSING_ARG + ' : -message');
            return false;
        }

        const errors = [];
        const promises = [];
        const author = message.member.nickname || message.author.username;
        const send = members => {
            members.forEach(member => {
                promises.push(member.send(args.message + '\n\n' + author).catch(error => {
                    errors.push(member.nickname || member.user.username + ' : ' + error);
                }));
            });
        };

        if(message.mentions.everyone) {
            send(message.guild.members);
        } else {
            message.mentions.roles.forEach(role => send(role.members));
        }

        Promise.all(promises).then(() => {
            if(errors.length > 0) {
                message.channel.send(this.responses.ERRORS + ' :\n' + errors.join('\n'));
            } else {
                message.channel.send(this.responses.NOTIFY_SUCCESS);
            }
        });
    }

    stats(message, args) {
        if(!args.period) {
            message.channel.send(this.responses.MISSING_ARG + ' : -period');
            return false;
        }

        const queries = {
            today: { date: Dates.today() },
            yesterday: { date: Dates.dayAgo(1) },
            week: {
                date: {
                    $gte: args.glide ? Dates.dayAgo(7) : Dates.weekStart(),
                    $lte: Dates.today()
                }
            },
            month: {
                date: {
                    $gte: args.glide ? Dates.dayAgo(30) : Dates.monthStart(),
                    $lte: Dates.today()
                }
            },
            year: {
                date: {
                    $gte: args.glide ? Dates.dayAgo(355) : Dates.yearStart(),
                    $lte: Dates.today()
                }
            }
        };

        if(!queries[args.period]) {
            message.channel.send(this.responses.INVALID_ARG + ' : -period');
            return false;
        }

        const handle = stats => {
            const data = null;
            /*
            if(args.list) {

        } else {
        if(args.graph) {

    } else {
    message.channel.send()
}
}
*/
        };

        if(queries[args.period].date === Dates.today()) {
            handle(Object.values(this.counter));
        } else {
            Database.stats.find(queries[args.period], (error, stats) => {
                if(error) {
                    message.channel.send(this.responses.ERRORS + ' : ' + error.message);
                    return false;
                }
                handle(stats);
            });
        }
    }
}
