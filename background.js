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
  
  const storage = cxt.chrome.storage;
  const sync = storage.sync;
  let options = {};

  function check_notification_click(notificationId, buttonIndex = 0) {
    //console.log("NOTI CLICK",notificationId,buttonIndex);
    let type = notificationId.split(" ")[0];
    if(buttonIndex == 0 && type in dosi_type) {
      tabs.create({ url: dosi_type[type]['url'] });
    }
  }

  chrome.notifications.onClicked.addListener(check_notification_click);
  chrome.notifications.onButtonClicked.addListener(check_notification_click);

  function alert_price(floor, message) {
    chrome.notifications.create(floor['type']+ ' ' + floor['price'], {
      type: 'basic',
      iconUrl: 'img/'+floor['type']+'.png',
      title:  dosi_type[floor['type']]['name'] + " price alert",
      message: message,
      requireInteraction: true,
      buttons: [
        { title: "View" },
        { title: "Close" }
      ]
    });
  }

  function check_alert_price(floor, opt) {
    if(opt['alert_currency'] == 'usd') check_price = floor['price_usd'];
    else {
      if(floor['currency'] != opt['alert_currency']) {
        return false;
      }
      check_price = floor['price'];
    }    

    if(opt['alert_type'] == -1 && check_price < opt['alert_amount']) {
      alert_price(floor, "Floor price < "+opt['alert_amount']+ " " + opt['alert_currency']);
    } else if(opt['alert_type'] == 1 && check_price > opt['alert_amount']) {
      alert_price(floor, "Floor price > "+opt['alert_amount']+ " " + opt['alert_currency']);
    }
  }

  async function check_floor_price() {
    options = await get_options();
    let floor = await get_floor_price();
    
    if('floor_alert' in options) {
      Object.keys(dosi_type).forEach(key => {    
        if(key in options['floor_alert']) {
          if(key in floor) {
            check_alert_price(floor[key], options['floor_alert'][key]);
          }
        }
      });
    }
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
    
    check_floor_price();
    setInterval(function() {
      check_floor_price();
    }, 20*1000); // second * 1000
  }
  
  start()
  
})(this);
