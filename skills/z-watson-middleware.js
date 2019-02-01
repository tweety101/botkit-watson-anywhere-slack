const watsonMiddleware = require('botkit-middleware-watson')({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  url: process.env.ASSISTANT_URL,
  workspace_id: process.env.WORKSPACE_ID,
  version: '2018-07-10',
  minimum_confidence: 0.50, // (Optional) Default is 0.75
});

module.exports = function(controller) {
                           
controller.middleware.receive.use(watsonMiddleware.receive);

    controller.hears(['.*'], ['message_received', 'direct_message'], function(bot, message) {
      if (message.watsonError) {
        bot.reply(message, "there is some error with watson");
        console.log(message.watsonError);
      } else {
        bot.reply(message, message.watsonData.output.text.join('\n'));
      }
    });
                           
  }




/*

slackcontroller.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  if (message.watsonError) {
    console.log(message.watsonError);
    bot.reply(message, message.watsonError.description || message.watsonError.error);
  } else if (message.watsonData && 'output' in message.watsonData) {
    bot.reply(message, message.watsonData.output.text.join('\n'));
  } else {
    console.log('Error: received message in unknown format. (Is your connection with Watson Assistant up and running?)');
    bot.reply(message, 'I\'m sorry, but for technical reasons I can\'t respond to your message');
  }
});

*/