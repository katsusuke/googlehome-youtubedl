'use strict';
const firebase = require("firebase");
const config = require('config');

firebase.initializeApp(config.fireBase);

const Youtube = require('youtube-node');
const youtube = new Youtube();
youtube.setKey(config.youtubeApiKey);

const notifier = require('google-home-notifier');
notifier.ip(config.googleHomeNotifier.ip);
notifier.device(config.googleHomeNotifier.deviceName, config.googleHomeNotifier.locale);
notifier.accent(config.googleHomeNotifier.locale);

const  exec = require('child_process').exec;


//database更新時
var db = firebase.database();
db.ref("/googlehome").on("value", function(changedSnapshot) {
  //値取得
  var value = changedSnapshot.child("word").val();
  if (value) {
    console.log("value:"+value);

    //コマンド生成
    getJsonData(value.split(" ")[0], {
      //電気
      "light": function() {
        let command = "";
        command += getJsonData(value.split(" ")[1], {
          "つけ": "on",         // つけて
          "オン": "on",         // オン
          "消し": "off",          // 消して
          "オフ": "off",          // オフ
          "default": value.split(" ").pop()
        });
        console.log(command);
        play_light(command);
      },
      // youtube
      "youtube": function() {
        let keyword = value.split(" ");
        keyword.shift();
        keyword = keyword.join(' ');
        console.log(keyword);
        play_youtube(keyword);
      }
    })();

    //firebase clear
    db.ref("/googlehome").set({"word": ""});

  }
});

function play_light(cmd) {
  const exec = require('child_process').exec;
  exec("python /home/ode/rm_mini3/BlackBeanControl/BlackBeanControl.py -c light_"+cmd);
}

//jsonからvalueに一致する値取得
function getJsonData(value, json) {
  for (var word in json)  if (value == word) return json[word]
  return json["default"]
}


function play_youtube(keyword) {
  // categoryIdの10はMusic https://stackoverflow.com/questions/17698040/youtube-api-v3-where-can-i-find-a-list-of-each-videocategoryid
  youtube.search(keyword, 1, {'type':'video', 'videoCategoryId':10}  , function(error, result) {
    if (error) {
      console.log(error);
      return ;
    }
    console.log(JSON.stringify(result, null, 2));
    for (const item of result.items) {
      if (item.id.videoId) {
        console.log(item.id.videoId);

        switch (config.youtubeDlMode) {
          case 'command':
            exec('youtube-dl -g -x https://www.youtube.com/watch?v='+item.id.videoId, function(error, stdout, stderr) {
              if (error !== null) {
                console.log('exec error: '+error);
              }
              const soundUrl = stdout;
              console.log(soundUrl);

              notifier.play(soundUrl, function(res) {
                console.log(res);
              });
            });
            break;
          case 'api':
            const request = require('request');
            let url = config.youtube_dl_api_server_host+'/api/info?url=https://www.youtube.com/watch?v='+item.id.videoId+'&format=bestaudio/best';
            let options = {
              url: url,
              method: 'GET',
              json: true
            };
            request(options, (error, response, body) => {
              console.log(body.info.url);
              notifier.play(body.info.url, res => {
                console.log(res);
              });
            });
            break;
          default:
            throw new Error("bad conifig. config.youtubeDlMode: "+config.youtubeDlMode);
            break;
        }
      }
    }
  });
}
