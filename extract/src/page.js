class Page {

  evaluate() {
    let data = [];
    const entities = document.querySelectorAll('.entry_content');
    for (let i = 0, l = entities.length; i < l; i++) {
      const e = this.entity(entities[i]);
      if (e.error === "") {
        data.push(e)
      }
    }
    if (data.length === 0) {
      return window.callPhantom({next: ''});
    }
    window.callPhantom({page: data});
    window.callPhantom({next: this.next()});
  }

  // { model, vendor, timestamp, size, link, error }
  entity(el) {
    const data = {model: "", vendor: "", timestamp: "", size: "", link: "", error: ""};
    const ite = document.createNodeIterator(el, NodeFilter.SHOW_ALL);
    let   node;
    let   title;
    while ((node = ite.nextNode()) !== null) {
      if (node.nodeType === Node.TEXT_NODE) {
        title = node.data.trim();
        if (/^\w+ \d{6,8} \d{3,4}/.test(title)) {
          const arr = title.split(' ');
          if (!(new RegExp('^' + this.model() + '$', 'i').test(arr[0]))) {
            data.error = "unmatched model";
            break;
          }
          data.model = arr[0];
          let date = ['20' + arr[1].substr(-2), arr[1].substr(2, 2) - 1, arr[1].substr(0, 2)];
          let time = [arr[2].length === 3 ? arr[2][1] : arr[2].substr(0, 2), arr[2].substr(-2)];
          data.timestamp = Math.floor(new Date(...date, ...time).getTime() / 1000);
          data.vendor = arr[arr.length - 1];
        } else if (/^Size:/.test(title)) {
          data.size = title.split(' ')[1];
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
        const link = node.getAttribute('href');
        if (/pip\.bz|cur\.bz/.test(link)) {
          data.link = link;
        }
      }
    }
    if (data.error !== "") {
      return data;
    }
    for (let prop in data) {
      if (prop === 'error') {
        continue;
      }
      if (data[prop] === '') {
        window.callPhantom({error: `Entity parse failed, url ${document.URL}, title ${title}, detail ${JSON.stringify(data)}`});
      }
    }
    return data;
  }

  next() {
    const matches = new RegExp('/page/(\\d+)/').exec(document.URL)
    if (matches === null) {
      return `http://camgirlvideos.org/page/2/?s=${this.model()}`;
    }
    const n = parseInt(matches[1]) + 1;
    return `http://camgirlvideos.org/page/${n}/?s=${this.model()}`;
  }

  model() {
    if ('_model' in this) {
      return this._model;
    }
    let arr = document.URL.split("=");
    if (arr.length !== 2 || arr[1] === '') {
      window.callPhantom({error: "model name not found in document URL"});
    }
    return this._model = arr[1];
  }
}

new Page().evaluate();
