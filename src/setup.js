let token = process.argv[2];
if (!token) throw 'Erro: slackbot token obrigatório.';

require('child_process')
  .exec(`TOKEN_INFOBOT=${token}; export TOKEN_INFOBOT;`,
    err => { if (err) throw err; });
