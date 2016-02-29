'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);
  }

  _createClass(Page, [{
    key: 'evaluate',
    value: function evaluate() {
      var data = [];
      var entities = document.querySelectorAll('.entry_content');
      for (var i = 0, l = entities.length; i < l; i++) {
        var e = this.entity(entities[i]);
        if (e.error === "") {
          data.push(e);
        }
      }
      if (data.length === 0) {
        return window.callPhantom({ next: '' });
      }
      window.callPhantom({ page: data });
      window.callPhantom({ next: this.next() });
    }

    // { model, vendor, timestamp, size, link, error }

  }, {
    key: 'entity',
    value: function entity(el) {
      var data = { model: "", vendor: "", timestamp: "", size: "", link: "", error: "" };
      var ite = document.createNodeIterator(el, NodeFilter.SHOW_ALL);
      var node = undefined;
      var title = undefined;
      while ((node = ite.nextNode()) !== null) {
        if (node.nodeType === Node.TEXT_NODE) {
          title = node.data.trim();
          if (/^\w+ \d{6,8} \d{3,4}/.test(title)) {
            var arr = title.split(' ');
            if (!new RegExp('^' + this.model() + '$', 'i').test(arr[0])) {
              data.error = "unmatched model";
              break;
            }
            data.model = arr[0];
            var date = ['20' + arr[1].substr(-2), arr[1].substr(2, 2) - 1, arr[1].substr(0, 2)];
            var time = [arr[2].length === 3 ? arr[2][1] : arr[2].substr(0, 2), arr[2].substr(-2)];
            data.timestamp = Math.floor(new (Function.prototype.bind.apply(Date, [null].concat(date, time)))().getTime() / 1000);
            data.vendor = arr[arr.length - 1];
          } else if (/^Size:/.test(title)) {
            data.size = title.split(' ')[1];
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
          var link = node.getAttribute('href');
          if (/pip\.bz|cur\.bz/.test(link)) {
            data.link = link;
          }
        }
      }
      if (data.error !== "") {
        return data;
      }
      for (var prop in data) {
        if (prop === 'error') {
          continue;
        }
        if (data[prop] === '') {
          window.callPhantom({ error: 'Entity parse failed, url ' + document.URL + ', title ' + title + ', detail ' + JSON.stringify(data) });
        }
      }
      return data;
    }
  }, {
    key: 'next',
    value: function next() {
      var matches = new RegExp('/page/(\\d+)/').exec(document.URL);
      if (matches === null) {
        return 'http://camgirlvideos.org/page/2/?s=' + this.model();
      }
      var n = parseInt(matches[1]) + 1;
      return 'http://camgirlvideos.org/page/' + n + '/?s=' + this.model();
    }
  }, {
    key: 'model',
    value: function model() {
      if ('_model' in this) {
        return this._model;
      }
      var arr = document.URL.split("=");
      if (arr.length !== 2 || arr[1] === '') {
        window.callPhantom({ error: "model name not found in document URL" });
      }
      return this._model = arr[1];
    }
  }]);

  return Page;
}();

new Page().evaluate();