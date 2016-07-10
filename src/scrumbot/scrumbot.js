import XlackBot from '../base/xlackbot';

export default class ScrumBot extends XlackBot {
  constructor(name, token, channel) {
    super(name, token, channel);
    this._id       = '';
    this._messages = require('./messages.json');
    this._currentIntervals = [];
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
  _onStart()              { return super._onStart();              }

  _alert(eventType, time) {
    let that = this,
        aux = [],
        intervalId = 0,
        splittedTime = time.split(':'),
        hours = parseInt(splittedTime[0]),
        minutes = parseInt(splittedTime[1]),
        nowDate = new Date(),
        timeLeft = 0,
        timeReccurrence = 86400000,
        alertDate = this._checkNotPassed(hours, minutes) ?
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

    setTimeout(() => {
      aux = that._currentIntervals
        .filter(interval => interval.eventType === eventType);

      if(aux.length) {
        clearInterval(aux[0].intervalId);
        that._currentIntervals
          .splice(that._currentIntervals.indexOf(aux), 1);
      }

      intervalId = setInterval(() => {
        let dayOfWeek = new Date().getDay();

        if(dayOfWeek !== 0 && dayOfWeek !== 6) return that
          ._replyChannel(that._messages[eventType]);
      }, timeReccurrence);

      that._currentIntervals.push({
          intervalId: intervalId,
          eventType: eventType
      });
    }, timeLeft);
  }

  _checkNotPassed(hours, minutes) {
    return hours > new Date().getHours() ||
      (hours === new Date().getHours() &&
      minutes > new Date().getMinutes());
  }

  _setAlert(msg) {
    let params = msg.text.split(' ').splice(2, 3);

    if(!this._messages[params[0]]) return this
      ._replyChannel('Esse evento não existe. Os eventos são: ' +
      Object.keys(this._messages).toString());

    this
      ._alert(params[0], params[1]);

    return this
      ._replyChannel('Alerta configurado com sucesso.');
  }

  run() { return super.run(); }
}
