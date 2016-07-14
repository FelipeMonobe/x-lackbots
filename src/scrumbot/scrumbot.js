import XlackBot from '../base/xlackbot';

export default class ScrumBot extends XlackBot {
  constructor(name, token, channel) {
    super(name, token, channel);
    this._alerts           = require('./alerts.json');
    this._currentIntervals = [];
    this._id               = '';
    this._cmdPaths.push({ rel: './dist/scrumbot/commands/',
    abs: __dirname
          .split('/')
          .splice(0, __dirname.split('/').length-1)
          .join('/') +
        '/' + this._name +
        '/commands/' });
  }

  _checkTriggers(text)    { return super._checkTriggers(text);    }
  _checkTypeAndUser(msg)  { return super._checkTypeAndUser(msg);  }
  _fetchCommands(dirs)    { return super._fetchCommands(dirs);    }
  _listCmds()             { return super._listCmds();             }
  _onMessage(msg)         { return super._onMessage(msg);         }
  _replyChannel(msg)      { return super._replyChannel(msg);      }

  _checkTimeNotPast(hours, minutes) {
    return hours > new Date().getHours() ||
      (hours === new Date().getHours() &&
      minutes > new Date().getMinutes());
  }

  _checkScheduledAlerts() {
    return this._alerts
      .forEach(alert => this
        ._setAlert(alert));
  }

  _extractAlertInfo(msg) {
    let params = msg.text.split(' ').splice(2, 4);

    return this
      ._setAlert({
        event: params[0],
        message: params[1],
        time: params[2],
        frequencyInDays: parseInt(params[3])
      });
  }

  _saveAlert(alert) {
    this._alerts.push(alert);

    return require('fs')
      .writeFileSync('alerts.json', JSON.stringify(this._alerts));
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
        timeReccurrence = 86400000,
        alertDate = this._checkTimeNotPast(hours, minutes) ?
          new Date(nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDay(),
            hours,
            minutes,
            0) :
          new Date(nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDay() + 1,
            hours,
            minutes,
            0);

    timeLeft = alertDate.getTime() - nowDate.getTime();

    this._saveAlert(alert);

    setTimeout(() => {
      aux = that._currentIntervals
        .filter(interval => interval.eventType === alert.event);

      if(aux.length) {
        clearInterval(aux[0].intervalId);
        that._currentIntervals
          .splice(that._currentIntervals.indexOf(aux), 1);
      }

      intervalId = setInterval(() => {
        let dayOfWeek = new Date().getDay();

        if(dayOfWeek !== 0 && dayOfWeek !== 6) return that
          ._replyChannel(that._alerts[alert.event]);
      }, timeReccurrence);

      that._currentIntervals.push({
          intervalId: intervalId,
          eventType: alert.event
      });
    }, timeLeft);
  }

  _onStart() {
    super.
      _onStart();

    return this.
      _checkScheduledAlerts();
  }

  run() { return super.run(); }
}
