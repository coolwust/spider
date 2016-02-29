'use strict';

var args = require('system').args;
var page = require('webpage').create();

if (args.length === 1) {
  console.log('Please pass the model\'s name');
  phantom.exit(1);
}

//page.onConsoleMessage = function (msg) {
//  console.log(msg);
//};

page.open('cam.html', function (status) {
  if (status !== 'success') {
    return console.log('open failed');
  }
  console.log('open successfully');
  //var entities = page.evaluate(onPageEvaluate, args[1]);
  phantom.exit(0);
});

function onPageEvaluate(model) {

  function parseEntryContent(el) {
    var info = {title: '', size: 0, duration: '', download: ''};
    if ((info.title = el.querySelector('p').firstChild.data.split(' ', 1)[0]) !== model) {
      return null;
    }
    var ite = document.createNodeIterator(el, NodeFilter.SHOW_ALL, null), node, matches;
    while (node = ite.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (matches = /Size: (\d+) bytes/.exec(node.data)) {
          info.size = matches[1];
        }
        if (matches = /duration: (\d{2}:\d{2}:\d{2})/.exec(node.data)) {
          info.duration = matches[1];
        }
      } else if (node.tagName === 'A') {
        var url = node.getAttribute('href');
        if (/pip\.bz/.test(url)) {
          info.download = url;
        }
      }
    }
    console.log(JSON.stringify(info, null, 4));
  }

  var data = [];
  var contents = document.getElementsByClassName('entry_content');
  for (var i = 0, l = contents.length; i < l; i++) {
    parseEntryContent(contents[i]);
  }
}
