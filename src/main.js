import XlackBot from './base/xlackbot';

function main() {
  let testebot = new XlackBot('testebot', process.env.TOKEN_TESTEBOT, 'slackbots');

  testebot.run();
};

main();
