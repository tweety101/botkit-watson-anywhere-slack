/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var env = require('node-env-file');
env(__dirname + '/.env');


var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
    replyWithTyping: true,
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET
};

const watsonMiddleware = require('botkit-middleware-watson')({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  url: process.env.ASSISTANT_URL,
  workspace_id: process.env.WORKSPACE_ID,
  version: '2018-07-10',
  minimum_confidence: 0.50, // (Optional) Default is 0.75
});

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
  // create a custom db access method
  var db = require(__dirname + '/components/database.js')({});
  bot_options.storage = db;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var webcontroller = Botkit.socketbot(bot_options);

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(webcontroller);

// Load in some helpers that make running Botkit on Glitch.com better
// require(__dirname + '/components/plugin_glitch.js')(webcontroller);

// Load in a plugin that defines the bot's identity
require(__dirname + '/components/plugin_identity.js')(webcontroller);

// Open the web socket server
webcontroller.openSocketServer(webcontroller.httpserver);

// Start the bot brain in motion!!
webcontroller.startTicking();

// Use middlewares
require(__dirname + '/skills/z-watson-middleware.js')(webcontroller);
require(__dirname + '/skills/message_history.js')(webcontroller);
require(__dirname + '/skills/keen-analytics.js')(webcontroller);
require(__dirname + '/skills/log-messages.js')(webcontroller);
                   
  
console.log('Webbot is online: COME TALK TO ME: http://localhost:' + (process.env.PORT || 3000))


var slackcontroller = Botkit.slackbot(bot_options);
var slackbot = slackcontroller.spawn({
  token: process.env.SLACK_TOKEN
  
});

// Load in some helpers that make running Botkit on Glitch.com better
//require(__dirname + '/components/plugin_glitch.js')(slackcontroller);

slackbot.startRTM();

/*
var normalizedPath = require("path").join(__dirname, "skills");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./skills/" + file)(slackcontroller);
  });
  
*/

// Use Middlewares
require(__dirname + '/skills/z-watson-middleware.js')(slackcontroller);
 require(__dirname + '/skills/keen-analytics.js')(slackcontroller);
 require(__dirname + '/skills/log-messages.js')(slackcontroller);


function usage_tip() {
    console.log('~~~~~~~~~~');
    console.log('Botkit Starter Kit');
    console.log('Execute your bot application like this:');
    console.log('PORT=3000 node bot.js');
    console.log('~~~~~~~~~~');
}