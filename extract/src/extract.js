'use strict';

import webPage from 'webpage';
import system  from 'system';
import fs      from 'fs';

if (system.args.length < 2) {
  console.error('Error: phantomjs [options] extract.js <url>');
  phantom.exit(1);
}

let extractions = [];

function evaluate(url) {
  const page  = webPage.create();
  page.open(url, status => {
    if (status !== 'success') {
      console.Error('Error: failed to open', url);
      phantom.exit(1);
    }
    console.log('File open success!');
    page.evaluateJavaScript('function(){' + fs.read('dist/page.js') + ';}');
  });

  page.onConsoleMessage = msg => {
    console.log(msg);
  };

  // { model, vendor, date, size, link, error }
  page.onCallback = data => {
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
        extractions.forEach(e => {
          console.log(e.model, e.vendor, e.timestamp, e.size, e.link);
        });
        phantom.exit(0);
      }
      evaluate(data.next);
    }
  }
}

evaluate(system.args[1]);
