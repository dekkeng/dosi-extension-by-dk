/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const runtime = cxt.chrome.runtime;
  const commands = cxt.chrome.commands;
  // const storage = cxt.chrome.storage;
  const tabs = cxt.chrome.tabs;
  // const windows = cxt.chrome.windows;
  // const contextMenus = cxt.chrome.contextMenus;
  // const action = cxt.chrome.action;
  let dosi_type = {};
  // const local = storage.local; // use local.set() and local.get()
  /*

  // Configure commands in manifest.commands
  setInterval(function() {
    chrome.notifications.create('DK_DOSI_PRICE_ALERT', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'TEST',
        message: 'ทดสอบ dosi',
        priority: 2,
        buttons: [
          {
              title: 'View'
          },
          {
              title: 'Close'
          }
      ]
    })
  }, 10*1000);*/

  
  const storage = cxt.chrome.storage;
  const sync = storage.sync;
  let options = {};

  function alert_price(title, message, id, url) {
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: 'icon.png',
      title: title,
      message: message,
      priority: 2
    });
  }

  function check_alert_price(name, floor, opt) {
    if(opt['alert_currency'] == 'usd') check_price = floor['price_usd'];
    else {
      if(floor['currency'] != opt['alert_currency']) {
        return false;
      }
      check_price = floor['price'];
    }    

    if(opt['alert_type'] == -1 && check_price < opt['alert_amount']) {
      alert_price(name + " price alert", "Floor price < "+opt['alert_amount']+ " " + opt['alert_currency'], name+'_'+opt['alert_amount']+'_'+ opt['alert_currency'],"#");
    } else if(opt['alert_type'] == 1 && check_price > opt['alert_amount']) {
      alert_price(name + " price alert", "Floor price > "+opt['alert_amount']+ " " + opt['alert_currency'], name+'_'+opt['alert_amount']+'_'+ opt['alert_currency'], "#");
    }
  }

  async function check_floor_price() {
    options = await get_options();
    let floor = await get_floor_price();
    
    Object.keys(dosi_type).forEach(key => {    
      if(key in options['floor_alert']) {
        if(key in floor) {          
          let name = key.replace("_", " ").toUpperCase();
          check_alert_price(name, floor[key], options['floor_alert'][key]);
        }
      }
    });
  }
  
  async function get_options() {
    return new Promise(function(resolve, reject) {
        sync.get('dk_dosi_options', function(opt) {
          if('dk_dosi_options' in opt) {
            resolve(opt['dk_dosi_options']);
          } else {
            resolve({})
          }
        });
    });
  }

  async function get_floor_price() {
    let check_currency = "";
    if('check_currency' in options) check_currency = options['check_currency'];
    let req = "https://dosi.newfolderhosting.com/api/floor/"+check_currency;
    
    return new Promise(function(resolve, reject) { 
        fetch(req)
          .then(response => response.json())
          .then(data => resolve(data));
    });
  }

  async function get_dosi_type() {
    let req = "https://dosi.newfolderhosting.com/api/type/";
    
    return new Promise(function(resolve, reject) { 
      fetch(req)
        .then(response => response.json())
        .then(data => resolve(data));
    });
  }

  async function start() {
    dosi_type = await get_dosi_type();
    
    setInterval(function() {
      check_floor_price();
    }, 60*1000); // second * 1000
  }

  start()

  /*commands &&
    commands.onCommand.addListener(function (command) {
    });

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse();
  });*/
})(this);
