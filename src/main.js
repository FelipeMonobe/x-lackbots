import XlackBot from './base/xlackbot';
import ScrumBot from './scrumbot/scrumbot';

function main() {
  let scrumbot = new ScrumBot('scrumbot', process.env.TOKEN_SCRUMBOT, 'agile');

  scrumbot.run();
};

main();
