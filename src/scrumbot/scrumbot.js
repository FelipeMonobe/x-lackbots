import XlackBot from '../base/xlackbot';

export default class ScrumBot extends XlackBot {
  constructor(name, token, channel) {
    super(name, token, channel);
    this._alerts = require('./alerts.json');
    this._currentIntervals = [];
    this._id = '';
    this._cmdPaths.push({
      rel: './dist/scrumbot/commands/',
      abs: __dirname
        .split('/')
        .splice(0, __dirname.split('/')
          .length - 1)
        .join('/') +
        '/' + this._name +
        '/commands/'
    });
  }

  _checkTriggers(text) {
    return super._checkTriggers(text);
  }
  _checkTypeAndUser(msg) {
    return super._checkTypeAndUser(msg);
  }
  _fetchCommands(dirs) {
    return super._fetchCommands(dirs);
  }
  _listCmds() {
    return super._listCmds();
  }
  _onMessage(msg) {
    return super._onMessage(msg);
  }
  _replyChannel(msg) {
    return super._replyChannel(msg);
  }

  _checkTimeNotPast(hours, minutes) {
    return hours > new Date().getHours() ||
      (hours === new Date().getHours() && minutes > new Date().getMinutes());
  }

  _checkScheduledAlerts() {
    return this._alerts
      .forEach(alert => this
        ._setAlert(alert));
  }

  _extractAlertInfo(msg) {
    let params = msg.text
      .split(/(\b[A-z0-9:]+|\".+\")+/g)
      .filter(i => i && i.trim())
      .splice(2, 5);

    return this
      ._setAlert({
        message: params[0],
        event: params[1],
        time: params[2],
        frequencyInDays: parseInt(params[3])
      });
  }

  _saveAlert(alert) {
    this._alerts = this._alerts
      .filter(a => a.event !== alert.event);

    this._alerts.push(alert);

    return require('fs')
      .writeFileSync('./dist/scrumbot/alerts.json',
        JSON.stringify(this._alerts));
  }

  _sendAlert(alert){
    let dayOfWeek = new Date()
      .getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6)
      return this
        ._replyChannel(this._alerts
          .find(a => a.event === alert.event)
            .message);
  }

  _setAlert(alert) {
    let that = this,
      aux = [],
      intervalId = 0,
      splittedTime = alert.time.split(':'),
      hours = parseInt(splittedTime[0]),
      minutes = parseInt(splittedTime[1]),
      nowDate = new Date(),
      timeLeft = 0,
      timeReccurrence = 86400000 * alert.frequencyInDays,
      alertDate = this._checkTimeNotPast(hours, minutes) ?
      new Date(nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate(),
        hours,
        minutes,
        0) :
      new Date(nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate() + 1,
        hours,
        minutes,
        0);

    timeLeft = alertDate.getTime() - nowDate.getTime();
    aux = that._currentIntervals
      .filter(interval => interval.eventType === alert.event);

    if (aux.length) {
      clearInterval(aux[0].intervalId);

      that._currentIntervals
        .splice(that._currentIntervals.indexOf(aux), 1);
    }

    this._saveAlert(alert);

    setTimeout(() => {
      that._sendAlert(alert);
      intervalId = setInterval(() => that._sendAlert(alert), timeReccurrence);

      that._currentIntervals
        .push({
          intervalId: intervalId,
          eventType: alert.event
      });
    }, timeLeft);

    return this
      ._replyChannel(`Alerta para *${alert.event}* configurado para às ${alert.time}, a cada ${alert.frequencyInDays} dia(s).`);
  }

  _onStart() {
    super.
    _onStart();

    return this.
    _checkScheduledAlerts();
  }

  run() {
    return super.run();
  }
}
