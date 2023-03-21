/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const runtime = cxt.chrome.runtime;
  const commands = cxt.chrome.commands;
  // const storage = cxt.chrome.storage;
  // const tabs = cxt.chrome.tabs;
  // const windows = cxt.chrome.windows;
  // const contextMenus = cxt.chrome.contextMenus;
  // const action = cxt.chrome.action;

  // const local = storage.local; // use local.set() and local.get()
/*
  async function get_dosi_nfts(id, type = 'collections') {
    let condition = {
      "id": id,
      "last": false,
      "pageToken": ""
    };
    let data = {
      "list": [],
      "summary": {},
    };
  
  while(condition.last == false) {
    let req = "https://citizen.store.dosi.world/api/stores/v2/my-nft/"+condition.id+"/"+type+"?"+condition.pageToken;
    await fetch(req)
        .then(res => res.json())
        .then(res => {
            condition.last = res.responseData.last;
            condition.pageToken = "pageToken="+encodeURIComponent(res.responseData.pageToken);
            data.list.push(...res.responseData.nfts);
            res.responseData.nfts.forEach(nft => {
                switch (nft.title) {
                    default:
                        if(!(nft.title in data.summary)) {
                            data.summary[nft.title] = { 'total': 0 };
                        }
                        data.summary[nft.title]['total']++;
                        break;
                }
            });
        })
  }
  return data;
}

  //const local = storage.local;
  async function get_token_price() {  
    let req = "https://api.coingecko.com/api/v3/simple/price?ids=link%2Cethereum&vs_currencies=usd";
  
    let data = {};
    return new Promise(function(resolve, reject) { $.ajax({
          url: req,
          type: "GET",
          crossDomain: true,
          dataType: "json",
          beforeSend: function() {            
          },
          success: function(res) {
              //console.log(res)
              data = res;
              resolve(data) // Resolve promise and when success
          },
          error: function(err) {
              reject({}) // Reject the promise and go to catch()
          }
      });
    });
  }
  
  function convert_price_usd(floor, conversion) {
    let price_usd = 0;
    switch (floor.currency) {
      case 'LN':
      case 'ln':
        price_usd = floor.price*conversion.link.usd;
        break;
        
      case 'ETH':
      case 'eth':
      default:
        price_usd = floor.price*conversion.ethereum.usd;
        break;   
    }
    return price_usd;
  }

  function replace_text_element(elem, text = '') {    
      //console.log("set text", text);
      $(elem).html(text);
  }

  async function get_floor_price(filter, order = 'PRICE_ASC') {  
      let data = {
          "currency": "LN",
          "id": "",
          "price": 0,
          "totalItems": 0
      };
      let str = '',url ='';
      switch (filter) {
          case 'dosi_lv1':
              str = "propertyIds=947&"
              break;
          case 'dosi_lv2':
              str = "propertyIds=1523913&"
              break;
          case 'dosi_lv3':
              str = "propertyIds=1527441&"
              break;
          case 'dosi_lv4':
              str = "propertyIds=1998823&"
              break;
          case 'cat':
              str = "collectibleId=2&"
              break;

          default:
              str = filter
              break;
      }
      let req = "https://citizen.store.dosi.world/api/stores/v1/dosi/market/nfts?pageNo=1&"+str+"category=&nftOrder="+order;
      
      return new Promise(function(resolve, reject) { $.ajax({
          url: req,
          type: "GET",
          crossDomain: true,
          dataType: "json",
          success: function(res) {
              if(0 in res.responseData.content) {
                data = res.responseData.content[0];
                data.totalItems = res.responseData.totalElements;
              }
              data.url = 'https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&'+str+'category=&nftOrder='+order;
              resolve(data) // Resolve promise and when success
          },
          error: function(err) {
              reject({}) // Reject the promise and go to catch()
          }
      });
    });
  }
  function get_format_text(price, currency, style='currency') {
    return new Intl.NumberFormat('en-US', { style: style, currency: currency }).format(price)
  }
  async function gen_floor_price_text(data, selling, type, token_price) {
      let floor = await get_floor_price(type);
      let price_usd = convert_price_usd(floor, token_price);
      let elem = "#dk_floor_"+type;

      replace_text_element(elem+" .owned", (data?data.total : "0"));
      replace_text_element(elem+" .selling", (selling?selling.total : "0"));
      replace_text_element(elem+" .market", floor.totalItems.toLocaleString());
      replace_text_element(elem+" .floor", floor.price+" "+floor.currency);
      replace_text_element(elem+" .usd", get_format_text(price_usd, 'USD'));

      if(data) { total_value += data.total * price_usd; }
      if(selling) { total_value += selling.total * price_usd; }
      
      $(".dk-dosi-profile-container .total_value").html(get_format_text(total_value, 'USD'));
  }

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
  commands &&
    commands.onCommand.addListener(function (command) {
    });

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse();
  });
})(this);
