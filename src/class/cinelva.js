import { EventEmitter } from 'events';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Socket from 'socket.io';
import RTMP from 'rtmp-server';

export default class Cinelva extends EventEmitter {
    constructor(options = null) {
        super();
        this.directory = path.join(__dirname, '/../../stream/');
        this.default = {
            port: 8001,
            stream: [
                '-hide_banner',
                '-loglevel', 'quiet',
                '-y',
                '-r', '24',
                '-threads', '0',
                '-i', 'rtmp://localhost:1935/live/stream',
                '-c:a', 'aac',
                '-ar', '48000',
                '-c:v', 'copy',
                '-crf', '20',
                '-sc_threshold', '0',
                '-g', '24',
                '-keyint_min', '24',
                '-hls_time', '2',
                '-hls_flags', 'delete_segments',
                '-hls_playlist_type', 'vod',
                '-b:v', '5000k',
                '-maxrate', '5350k',
                '-bufsize', '1500k',
                '-b:a', '192k',
                '-hls_segment_filename', this.directory + 'source_%03d.ts ' + this.directory + 'source.m3u8'
            ]
        };
        this.options = options || this.default;
        this.viewers = 0;
        this.stream = null;
        this.server = new RTMP();
        this.socket = new Socket();

        this.server.on('error', error => {
            this.stop();
            throw error;
        });

        this.server.on('client', client => {
            client.on('publish', data => {
                this.start();
            });
            client.on('stop', () => {
                this.stop();
            });
        });

        this.socket.on('connection', client => {
            client.on('disconnect', () => {
                this.viewers--;
                this.socket.emit('viewers', this.viewers);
            });
            client.on('viewers', () => {
                client.emit('viewers', this.viewers);
            });
            client.on('status', () => {
                client.emit('status', Boolean(this.stream));
            });
            this.viewers++;
            this.socket.emit('viewers', this.viewers);
        });

        this.socket.listen(this.options.port);
        this.server.listen(1935);
    }

    start() {
        if(this.stream) {
            return false;
        }

        this.clear().then(() => {
            this.stream = exec('ffmpeg ' + this.options.stream.join(' '));
        });
    }

    stop() {
        this.stream.kill();
        this.stream = null;
    }

    clear() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.directory, (error, files) => {
                if(error) {
                    reject(error);
                }

                console.log('found ' + files.length + ' files');
                for(const file of files) {
                    fs.unlinkSync(path.join(this.directory, file));
                }
                resolve();
            });
        });
    }
}
