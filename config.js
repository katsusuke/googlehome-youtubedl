const config = {
  apiKey: "xxxxx",
  authDomain: "xxxxx",
  databaseURL: "xxxxx",
  projectId: "xxxxx",
  storageBucket: "",
  messagingSenderId: "xxxxx"
};

module.exports = {
  fireBase : config,
  youtubeApiKey : 'xxx',
  googleHomeNotifier : {
    deviceName : 'xxxx', // google homeのdevice name
    ip : 'xxx.xxx.xxx.xxx',
    locale : 'ja'
  },
  youtubeDlMode : 'command', // 'command' or 'api'
  youtube_dl_api_server_host : 'http://xxxxxxxx' // api使用時のみ使用
};
