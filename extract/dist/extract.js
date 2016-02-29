'use strict';

var _webpage = require('webpage');

var _webpage2 = _interopRequireDefault(_webpage);

var _system = require('system');

var _system2 = _interopRequireDefault(_system);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_system2.default.args.length < 2) {
  console.error('Error: phantomjs [options] extract.js <url>');
  phantom.exit(1);
}

var extractions = [];

function evaluate(url) {
  var page = _webpage2.default.create();
  page.open(url, function (status) {
    if (status !== 'success') {
      console.Error('Error: failed to open', url);
      phantom.exit(1);
    }
    console.log('File open success!');
    page.evaluateJavaScript('function(){' + _fs2.default.read('dist/page.js') + ';}');
  });

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  // { model, vendor, date, size, link, error }
  page.onCallback = function (data) {
    if ('error' in data) {
      console.error('Error:', data.error);
      phantom.exit(1);
    }
    if ('page' in data) {
      extractions = extractions.concat(data.page);
    }
    if ('next' in data) {
      console.log(data.next);
      if (data.next === '') {
        extractions.forEach(function (e) {
          console.log(e.model, e.vendor, e.timestamp, e.size, e.link);
        });
        phantom.exit(0);
      }
      evaluate(data.next);
    }
  };
}

evaluate(_system2.default.args[1]);