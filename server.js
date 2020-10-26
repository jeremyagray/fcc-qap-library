'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

// Wrap express in the mongoose connection async function.
// https://stackoverflow.com/a/60366415
async function start()
{
  // Configure mongoose.
  const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
    };
  await mongoose.connect(process.env.MONGO_URI, MONGOOSE_OPTIONS);

  // Security middleware.
  // Change the X-Powered-By header per spec.
  // Should just let helmet remove it.
  // app.use(helmet({
  //   contentSecurityPolicy: false,
  //   hidePoweredBy: false
  // }));
  // https://github.com/expressjs/express/issues/2477#issuecomment-67775940
  app.use(function(request, response, next)
  {
    response.setHeader('X-Powered-By', 'PHP 4.2.0');
    next();
  });
  // Better:
  // app.use(helmet());
  app.use(nocache());

  app.use('/public', express.static(process.cwd() + '/public'));

  // FCC testing.
  app.use(cors({origin: '*'}));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Index page.
  app.route('/')
    .get(function (req, res)
    {
      res.sendFile(process.cwd() + '/views/index.html');
    });

  // FCC testing.
  fccTestingRoutes(app);

  // API routing. 
  apiRoutes(app);  
      
  //404 Not Found Middleware
  app.use(function(req, res, next)
  {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  // Connect database, start server, and run tests.
  const port = process.env.PORT || 3000;
  const appName = 'fcc-qap-library';
  const timeout = 3500;

  app.listen(port, function ()
  {
    console.log(appName + ' listening on port ' + port);
    if(process.env.NODE_ENV === 'test')
    {
      console.log('running tests for ' + appName + ' ...');
      setTimeout(function ()
      {
        try
        {
          runner.run();
        }
        catch(e)
        {
          const error = e;
          console.log(appName + ' tests are not valid:');
          console.error(error);
        }
      }, timeout);
    }
  });

  module.exports = app;
}

start();