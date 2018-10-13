import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import path from 'path';
import Socket from 'socket.io';
import RTMP from 'rtmp-server';
import Segmenter from './segmenter';

export default class Cinelva extends EventEmitter {
    constructor(options = null) {
        super();
        this.default = {
            port: 8001,
            stream: [
                '-loglevel', 'quiet',
                '-y',
                '-r', '24',
                '-i', 'rtmp://localhost:1935/live/stream',
                '-c:a', 'aac',
                '-ar', '48000',
                '-c:v', 'copy',
                '-crf', '20',
                '-sc_threshold', '0',
                '-g', '24',
                '-keyint_min', '24',
                '-hls_time', '2',
                '-hls_playlist_type', 'vod',
                '-b:v', '5000k',
                '-maxrate', '5350k',
                '-bufsize', '1500k',
                '-b:a', '192k',
                '-hls_segment_filename', path.join(__dirname, '../../stream/source_%03d.ts') + ' ' + path.join(__dirname, '../../stream/source.m3u8')
            ]
        };
        this.options = options || this.default;
        this.stream = null;
        this.server = new RTMP();
        this.segmenter = new Segmenter();
        this.socket = new Socket();

        this.server.on('error', error => {
            throw error;
        });

        this.server.on('client', client => {
            client.on('publish', data => {
                this.emit('publish', data.stream);
            });
        });

        this.server.on('stop', () => {
            this.emit('stop');
        });

        this.socket.listen(this.options.port);
        this.server.listen(1935);

        this.socket.on('connection', client => {
            client.on('disconnect', () => {
                this.viewers--;
                this.socket.emit('viewers', this.viewers);
            });
            this.viewers++;
            this.socket.emit('viewers', this.viewers);
        });
    }

    start() {
        this.stream = spawn('ffmpeg', this.options.stream.join(' '));
        this.stream.stderr.on('data', data => {
            console.log(data);
        });
    }
}
