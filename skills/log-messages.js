module.exports = function(controller) {



  controller.middleware.receive.use(function(bot, message, next) {
  
    console.log(message);
    next();
  
  })
  
  controller.middleware.send.use(function(bot, message, next) {
  
    console.log(message);
    next();
  
  })




}