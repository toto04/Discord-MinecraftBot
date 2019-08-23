"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var downloader_1 = __importDefault(require("./downloader"));
var child_process_1 = __importDefault(require("child_process"));
var fs_1 = __importDefault(require("fs"));
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server() {
        var _this = _super.call(this) || this;
        _this.status = 'offline';
        _this.process = null;
        _this.list = {
            len: null,
            max: null,
            players: []
        };
        return _this;
    }
    Server.prototype._setStatus = function (s) {
        // function called internally to update status
        this.status = s;
        this.emit('statusChange', s);
        this.logln('Status set to ' + s);
    };
    Server.prototype._updateList = function () {
        var _this = this;
        // asynchronously returns an object containing:
        // len: number of players online
        // max: max number of players online
        // players: array of the players' usernames
        var pro = new Promise(function (resolve, reject) {
            if (_this.status != 'online' || !_this.process) {
                _this.list = {
                    len: null,
                    max: null,
                    players: []
                };
            }
            _this.process.stdin.write('list\r');
            _this.process.stdout.once('data', function (data) {
                var match = data.toString().match(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: There are (\d+) of a max (\d+) players online:(.{0,})/);
                if (match) {
                    var players = match[3].substring(1).split(", ");
                    _this.list = {
                        len: match[1],
                        max: match[2],
                        players: players
                    };
                    resolve();
                }
                else {
                    _this.list = {
                        len: null,
                        max: null,
                        players: []
                    };
                    resolve(); // very poor error handling
                }
            });
        });
        pro.then(function () {
            _this.emit('listUpdate');
        });
        return pro;
    };
    Server.prototype.start = function () {
        var _this = this;
        if (this.status != 'offline')
            return 'Server already running!';
        if (!fs_1.default.existsSync(__dirname + '/mcServer/server.jar')) {
            // creates the folder and downloads the latest server.jar file, restarts when finished
            downloader_1.default().then(function () {
                _this._setStatus('offline');
                _this.start();
            });
            this._setStatus('downloading');
            return 'Downloading jar file...';
        }
        this.process = child_process_1.default.spawn(
        // runs the server
        "java", ['-Xms512M', '-Xmx2048M', '-jar', 'server.jar', 'nogui'], {
            cwd: __dirname + '/mcServer'
        });
        this._setStatus('booting');
        this.process.stdout.on('data', function (data) {
            // parses useful stuff when the server process outputs something
            data = data.toString();
            _this.log(data);
            if (data.includes('joined') || data.includes('left') || data.includes('logged in'))
                _this._updateList();
            var match = data.match(/\[\d{2}:\d{2}:\d{2}\] (?:\[Server thread\/INFO\]|\[Async Chat Thread - #\d+\/INFO\]): <([^>]+)> (.+)/);
            if (match) {
                _this.emit('chat', match[1], match[2]);
            }
            if (data.substring(10, 37) == ' [Server thread/INFO]: Done')
                _this._setStatus('online');
        });
        this.process.stderr.on('data', function (data) {
            console.error('[server: ERROR] ' + data);
        });
        this.process.on('exit', function () {
            _this.process = null;
            _this._setStatus('offline');
        });
        return 'Server starting...';
    };
    Server.prototype.log = function (txt) {
        this.emit('console', txt);
        process.stdout.write('[server] ' + txt);
    };
    Server.prototype.logln = function (txt) {
        this.log(txt + '\n');
    };
    Server.prototype.stop = function () {
        // stops the server
        if (this.status != 'online' || !this.process)
            return "Server is " + this.status;
        this._setStatus('stopping');
        this.process.stdin.write('stop\r');
        return 'Server stopping...';
    };
    Server.prototype.command = function (cmd) {
        // submits a given command to the server stdin
        if (this.status != 'online')
            return this.logln('cannot execute command: server offline');
        this.process.stdin.write(cmd + '\r');
    };
    Server.prototype.say = function (msg) {
        this.command('say ' + msg);
    };
    return Server;
}(events_1.default));
exports.default = Server;
