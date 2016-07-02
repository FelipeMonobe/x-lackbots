import Bot from 'slackbots';

export default class XlackBot {
  constructor(name, token, channel) {
    this._channel  = channel;
    this._commands = [];
    this._core     = new Bot({ name, token });
    this._name     = name;
  }

  run() {
    this._commands = this._fetchCommands();
    this._core.on('message', msg => this._onMessage(msg));
    this._core.on('start',    () => this._onStart(this));
  }

  _fetchCommands() {
    const FS = require('fs');
    let commands = [];

    FS.readdirSync('./dist/base/commands/').forEach(file => {
      commands.push(require(`./commands/${file}`));
    });

    return commands;
  }

  _listCmds() {
    return this._replyChannel('Meus comandos são:\n' +
      this._commands.map(cmd => `- ${cmd.triggers.toString().replace(/,/g, '/')}: ${cmd.description};`)
      .toString()
      .replace(/,/g, '\n'));
  }

  _onMessage(msg) {
    //check for message type
    //check who sent
    //check for possible triggers
    //take actions accordingly
    return console.log(`Message '${JSON.stringify(msg)}' was received`);
  }

  _onStart() {
    return console.log(`${this._name} is alive at #${this._channel}`);
  }

  _replyChannel(msg) {
    return this._core.postMessageToChannel(this._channel, msg, { as_user: true });
  }
}
