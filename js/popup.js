/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const window = cxt.window;
  const document = cxt.document;
  const $ = cxt.$;
  const tabs = cxt.chrome.tabs;
  const runtime = cxt.chrome.runtime;
  const storage = cxt.chrome.storage;

  //const local = storage.local;
  async function get_token_price() {  
    let req = "https://api.coingecko.com/api/v3/simple/price?ids=link%2Cethereum&vs_currencies=usd";
  
    let data = {};
    
    return new Promise(function(resolve, reject) { $.ajax({
          url: req,
          type: "GET",
          crossDomain: true,
          dataType: "json",
          success: function(res) {
              //console.log(res)
              data = res;
              resolve(data)
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
              resolve(data)
          }
      });
    });
}

function pad(width, string, padding) { 
  return (width <= string.length) ? string : pad(width, padding + string, padding)
}

async function gen_floor_price_text(type, token_price, name = "") {
    let floor = await get_floor_price(type);
    let price_usd = convert_price_usd(floor, token_price);
    let elem = "#popup_dk_floor_"+type;

    replace_text_element(elem+" .amount", floor.totalItems.toLocaleString());
    replace_text_element(elem+" .floor", floor.price+" "+floor.currency);
    replace_text_element(elem+" .usd", new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price_usd));
}

async function generate_dosi_report() {    
  let token_price = await get_token_price();
    
  gen_floor_price_text("dosi_lv1", token_price, "DOSI LV1");
  gen_floor_price_text("dosi_lv2", token_price, "DOSI LV2");
  gen_floor_price_text("dosi_lv3", token_price, "DOSI LV3");
  gen_floor_price_text("dosi_lv4", token_price, "DOSI LV4");
  gen_floor_price_text("cat", token_price, "CAT");
}

  $(() => {
    generate_dosi_report();
  });
/*
  $("#shortcuts_link").click(() => {
    tabs.create({ url: "chrome://extensions/shortcuts" });
  });

  $("#author_flaticon_url").click(() => {
    tabs.create({ url: "https://www.flaticon.com/authors/flat-icons" });
  });

  $("#flaticon_url").click(() => {
    tabs.create({ url: "https://www.flaticon.com/" });
  });

  $("#sampleInput").change(() => {
    saveSettings();
  });

  $("#start").click(() => {
    runtime.sendMessage({ m: "scrap" }, () => {
      window.close();
    });
  });

  function saveSettings() {
    const settings = {};

    settings.sampleInput = $("#sampleInput").val();

    local.set({ settings: settings });
  }

  local.get("settings", (data) => {
    const settings = data.settings;
    if (settings) {
      $("#sampleInput").val(settings.sampleInput);
    }
  });*/
})(this);
