import Bot from 'slackbots';

export default class XlackBot {
  constructor(name, token, channel) {
    this._channel  = channel;
    this._commands = [];
    this._core     = new Bot({ name, token });
    this._id       = '';
    this._name     = name;
  }

  _checkForTriggers(text) {
    let textCmd = /\w+\b$/.exec(text)[0];
    return this._commands.find(cmd => cmd.triggers.indexOf(textCmd) > -1);
  }

  _checkTypeAndUser(msg) {
    return msg.type === 'message' &&
      msg.text.includes(this._name) &&
      msg.user !== this._id;
  }

  _fetchCommands() {
    const FS = require('fs');
    let commands = [];

    FS
      .readdirSync('./dist/base/commands/')
      .forEach(file => commands.push(require(`./commands/${file}`)));

    return commands;
  }

  _listCmds() {
    return this
      ._replyChannel('Meus comandos são:\n' +
        this._commands
        .map(cmd => `- ${cmd.triggers.toString().replace(/,/g, '/')}: ${cmd.description};`)
        .toString()
        .replace(/,/g, '\n'));
  }

  _onMessage(msg) {
    console.log(`Message '${JSON.stringify(msg)}' was received`);

    if (this._checkTypeAndUser(msg)) {
      let command = this._checkForTriggers(msg.text);

      return !command || this[command.action]();
    }

    return;
  }

  _onStart() {
    this._id = this._core.self.id;
    this._replyChannel(`${this._name} has just joined the party :cubimal_chick:`);
    return console.log(`${this._name} is alive at #${this._channel}`);
  }

  _replyChannel(msg) {
    return this._core
      .postMessageToChannel(this._channel, msg, { as_user: true });
  }

  run() {
    this._commands = this._fetchCommands();
    this._core.on('message', msg => this._onMessage(msg));
    this._core.on('start',    () => this._onStart(this));
  }
}
