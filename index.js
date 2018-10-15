/**
 * CLI GI Client
 */
const GiClient = require('gi-sdk-nodejs');
const SlackBot = require('slackbots');

const config = require('./config.js');

//Colours for terminal output
const colours = {
  'default':    ['\x1b[36m','\x1b[0m'],      //Blue
  'secondary':  ['\x1b[35m','\x1b[0m'],      //Purple
  'success':    ['\x1b[32m','\x1b[0m'],      //Green
  'warning':    ['\033[31m','\033[0m'],      //Red
  'error':      ['\033[31m','\033[0m'],      //Red
  'mute':       ['\x1b[90m','\x1b[0m'],      //Gray
};

//Output start message
output('Loading GI SDK and attemping connection');

//Start the SDK
GiApp = new GiClient(config.gi.name, config.gi.secret, config.gi.host);
GiApp.connect();

GiApp.on('connect', () => {
	output('Connected to server', 'success');
});

GiApp.on('disconnect', () => {
	output('Disconnected', 'warning');
  //prompt.pause();
});

GiApp.on('identified', () => {
  output('Client identified', 'success');

  //Handshake for the user
  GiApp.handshake(config.slack.name);
});

GiApp.on('error', (data) => {
	output('Error: '+data.message, 'error');
});

GiApp.on('notice', (data) => {
  let message = data.messages.join(', '); 
	output('Notice: '+message, 'mute');
});

GiApp.on('type_start', () => {
	output('GI is typing', 'mute');
});

GiApp.on('type_end', () => {
	output('GI has finished typing', 'mute');
});

GiApp.on('message', (data) => {
  //Messages
  for(var ii=0; ii<data.messages.length; ii++) {
    output(data.messages[ii]);
    bot.postMessage('CA0UL52TU', data.messages[ii]);
  }

  //Attachments
  if(data.attachments.actions) {
    var actions = data.attachments.actions;
    var _data = []; 
    for(var ii=0; ii<actions.length; ii++) {
      _data.push(actions[ii].text);
    }
    output('Options: '+_data.join(', '), 'secondary');
  }

  if(data.attachments.images) {
    var images = data.attachments.images;
    for(var ii=0; ii<images.length; ii++) {
      output('Image: '+images[ii].url, 'secondary');
    }
  }

  if(data.attachments.shortcuts) {
    var shortcuts = data.attachments.shortcuts;
    for(var ii=0; ii<shortcuts.length; ii++) {
      output('Shortcut: '+shortcuts[ii].text, 'secondary');
    }
  }

  if(data.attachments.links) {
    var links = data.attachments.links;
    for(var ii=0; ii<links.length; ii++) {
      output('Link: '+links[ii].text+' ['+links[ii].url+']', 'secondary');
    }
  }

  if(data.attachments.fields) {
    var fields = data.attachments.fields;
    for(var ii=0; ii<fields.length; ii++) {
      output('Field: '+fields[ii].title+': '+fields[ii].value, 'secondary');
    }
  }

  //Debug information
  let debug = [];
  debug.push('Confidence: '+data.confidence);
  debug.push('Intent: '+data.intent);
  debug.push('Action: '+data.action);
  debug.push('Collection: '+data.collection);
  debug.push('Seq.: '+data.sequence);
  output(debug.join(' | '),'mute');
});


function output(string, colour = 'default') {
	console.log(colours[colour][0] + string + colours[colour][1]);
}


//Start Slack bot
var bot = new SlackBot({
  token: config.slack.token,
  name: config.slack.name
});

bot.on('start', function () {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
    icon_emoji: ':cat:'
  };

  // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
  //postToChannel('testzone', 'meow', params)

  // define existing username instead of 'user_name'
  //bot.postMessageToUser('user_name', 'meow!', params);

  // If you add a 'slackbot' property, 
  // you will post to another user's slackbot channel instead of a direct message
  //bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' });

  // define private group instead of 'private_group', where bot exist
  //bot.postMessageToGroup('private_group', 'meow!', params);
});


bot.on('message', function (data) {
  //console.log(data);

  // bot.getChannel(data.channel).then((channel) => {
  //   console.log('channel...');
  //   console.log(channel);
  // });

  if(data.type != 'message') {
    return;
  }

  if(data.text.indexOf('firebot') == -1) {
    return;
  }

  let message = data.text;
  message = message.replace('firebot','');

  //Get the current channel
  // let channel = await bot.getChannel(data.channel);

  // console.log('channel...');
  // console.log(channel);

  // bot.getChannel(data.channel).then((channel) => {
  //   console.log(channel);
  // });
  
  GiApp.send('my-unique-session', 'message', message);
});


function postToChannel(channel, text, params) {
  bot.postMessageToChannel(channel, text, params);
}
