"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = __importStar(require("discord.js"));
function clientLog(txt) {
    console.log('[discordBot] ' + txt);
}
var client = new discord_js_1.default.Client();
var OPs = []; // array of admins' IDs
exports.default = (function (server) {
    server.on('chat', function (player, text) {
        // sends minecraft messages over to discord
        var cID = process.env.CHANNEL_ID;
        if (!cID)
            return;
        var ch = client.channels.get(cID);
        if (ch instanceof discord_js_1.TextChannel && player != 'Server')
            ch.send("[minecraft] " + player + ": " + text);
        else
            clientLog('No channel for given id, change CHANNEL_ID in .env file');
    });
    server.on('statusChange', function (s) {
        // changes the presence according to current server status
        if (s == 'online') {
            client.user.setPresence({
                status: 'online'
            });
        }
        else if (s == 'offline') {
            client.user.setPresence({
                status: 'dnd',
                game: {
                    name: 'Server offline'
                }
            });
        }
        else {
            client.user.setPresence({
                status: 'idle',
                game: {
                    name: "Server " + s
                }
            });
        }
    });
    server.on('listUpdate', function () {
        // updates presence according to player list
        var res = server.list;
        var msg = "Server " + server.status + "\n" + res.len + " of " + res.max + " online:";
        for (var _i = 0, _a = res.players; _i < _a.length; _i++) {
            var player = _a[_i];
            msg += "\n- " + player;
        }
        client.user.setPresence({
            game: {
                name: msg
            }
        });
    });
    client.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
        var cID, cmd, payload, res, msg, _i, _a, player, cp;
        return __generator(this, function (_b) {
            if (message.author == client.user)
                return [2 /*return*/]; // returns if sender is the bot
            cID = process.env.CHANNEL_ID;
            if (cID && cID != message.channel.id && process.env.BIND_TO_CHANNEL == 'true')
                return [2 /*return*/]; //channel is not the one bound
            if (process.env.COMMAND_PREFIX && !message.content.startsWith(process.env.COMMAND_PREFIX)) {
                // sends discord messages over to minecraft
                if (server.status != 'online')
                    return [2 /*return*/];
                server.say("<" + message.author.username + "> " + message.content);
            }
            else {
                cmd = void 0, payload = '';
                if (message.content.indexOf(' ') == -1) {
                    cmd = message.content.substring(1, message.content.length);
                }
                else {
                    cmd = message.content.substring(1, message.content.indexOf(' '));
                    payload = message.content.substring(message.content.indexOf(' ') + 1, message.content.length);
                }
                clientLog("<" + message.author.username + "> command: " + cmd + ", payload: " + payload);
                switch (cmd) {
                    // commands
                    case 'start':
                        message.channel.send(server.start());
                        break;
                    case 'stop':
                        message.channel.send(server.stop());
                        break;
                    case 'status':
                        message.channel.send("Server is currently " + server.status);
                        break;
                    case 'list':
                        res = server.list;
                        msg = void 0;
                        if (typeof (res) == 'string') {
                            msg = res;
                        }
                        else {
                            msg = res.len + " of " + res.max + " online:";
                            for (_i = 0, _a = res.players; _i < _a.length; _i++) {
                                player = _a[_i];
                                msg += "\n- " + player;
                            }
                        }
                        message.channel.send(msg);
                        break;
                    case '/':
                        if (!OPs.includes(message.author.id)) {
                            message.channel.send('You are not allowed to use commands');
                            return [2 /*return*/];
                        }
                        server.command(payload);
                        break;
                    case 'help':
                        cp = process.env.COMMAND_PREFIX;
                        message.channel.send(new discord_js_1.default.RichEmbed()
                            .setColor("#FF9900")
                            .setTitle("Command list")
                            .addField(cp + "start", "executes the server.jar file, downloads first it if missing")
                            .addField(cp + "stop", "stops the server process if running, by issuing the \"/stop\" minecraft command")
                            .addField(cp + "status", "returns the current server status (downloading, booting, online, stopping, offline)")
                            .addField(cp + "list", "if the server is running, lists all online players")
                            .addField(cp + "/ [command] [arguments]", "submits a command to the server's stdin, only available to admins listed in the .env file\n" +
                            ("For example the command '" + process.env.COMMAND_PREFIX + "/ say hi' will result in '[Server] hi' in the minecraft chat"))
                            .setAuthor('view this project on github', 'https://github.com/toto04.png', 'https://github.com/toto04/Discord-MinecraftBot'));
                        break;
                    default:
                        message.channel.send("Unknown command, type " + process.env.COMMAND_PREFIX + "help to get available commands");
                        return [2 /*return*/];
                }
            }
            return [2 /*return*/];
        });
    }); });
    client.on('ready', function () {
        clientLog("Logged in as " + client.user.tag);
        if (process.env.ADMIN_IDS)
            OPs = process.env.ADMIN_IDS.split(',');
        client.user.setPresence({
            status: 'dnd',
            game: {
                name: 'Server offline',
                type: 'PLAYING'
            }
        });
    });
    return client;
});
