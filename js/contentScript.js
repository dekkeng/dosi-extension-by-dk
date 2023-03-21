/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const window = cxt.window;
  const document = cxt.document;
  const $ = cxt.$;  
  const profile_container = "#__next > main > div > div > div > div > div.chakra-stack > div";
  const loading_image = "<img src='https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' width='20' height='20' />";
  const storage = cxt.chrome.storage;
  const runtime = cxt.chrome.runtime;
   
   let total_value = 0;
  // const commands = cxt.chrome.commands;
  // const tabs = cxt.chrome.tabs;
  // const windows = cxt.chrome.windows;
  // const contextMenus = cxt.chrome.contextMenus;
  // const action = cxt.chrome.action;

  const sync = storage.sync;

  let options = {};

  async function get_options() {
    return new Promise(function(resolve, reject) {
        sync.get('dk_dosi_options', function(opt) {
          console.log(opt['dk_dosi_options'])
          if('dk_dosi_options' in opt) {
            resolve(opt['dk_dosi_options']);
          } else {
            resolve({})
          }
        });
    });
  }

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
    let str = '',url ='',currency='';
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

    if('check_currency' in options) {
      switch (options['check_currency']) {
          case 'ln':
          case 'eth':
              currency = "currency="+options['check_currency'].toUpperCase()+"&"
              data.currency = options['check_currency'].toUpperCase()
              break;  
          default:
          case 'all':
              currency = ""
              break;
      }
    }

    let req = "https://citizen.store.dosi.world/api/stores/v1/dosi/market/nfts?pageNo=1&"+str+"category=&"+currency+"nftOrder="+order;
    
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
    
    if('check_currency' in options) $(".dk-dosi-profile-container .dk_filter").html("Filtered currency : "+options['check_currency'].toUpperCase());
    $(".dk-dosi-profile-container .total_value").html(get_format_text(total_value, 'USD'));
}

function prepare_container() {
  total_value = 0;
  $(profile_container).append("<div class='dk-dosi-profile-container'>"+
            "Your NFTs : <strong><span class='total_nft'>..</span> (~<span class='total_value'>..</span>)</strong>"+
            "<div class='dk_filter'></div>"+
            "<table id='dk-dosi-profile-table' border='1'>"+
            "<thead>"+
                "<tr>"+
                    "<th align='left'>Type</th>"+
                    "<th align='right'>Owned</th>"+
                    "<th align='right'>Selling</th>"+
                    "<th align='right'>Market</th>"+
                    "<th align='right'>Floor</th>"+
                    "<th align='right'>USD</th>"+
                "</tr>"+
            "</thead>"+
            "<tbody>"+
                "<tr id='dk_floor_dosi_lv1'>"+
                    "<td align='left'>"+
                        "<a href='https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&propertyIds=947&category=&nftOrder=PRICE_ASC' target='_blank'>"+
                            "DOSI LV1"+
                        "</a>"+
                    "</td>"+
                    "<td align='right' class='owned'>"+loading_image+"</td>"+
                    "<td align='right' class='selling'>"+loading_image+"</td>"+
                    "<td align='right' class='market'>"+loading_image+"</td>"+
                    "<td align='right' class='floor'>"+loading_image+"</td>"+
                    "<td align='right' class='usd'>"+loading_image+"</td>"+
                "</tr>"+
                "<tr id='dk_floor_dosi_lv2'>"+
                    "<td align='left'>"+
                        "<a href='https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&amp;propertyIds=1523913&amp;category=&amp;nftOrder=PRICE_ASC' target='_blank'>"+
                            "DOSI LV2"+
                        "</a>"+
                    "</td>"+
                    "<td align='right' class='owned'>"+loading_image+"</td>"+
                    "<td align='right' class='selling'>"+loading_image+"</td>"+
                    "<td align='right' class='market'>"+loading_image+"</td>"+
                    "<td align='right' class='floor'>"+loading_image+"</td>"+
                    "<td align='right' class='usd'>"+loading_image+"</td>"+
                "</tr>"+
                "<tr id='dk_floor_dosi_lv3'>"+
                    "<td align='left'>"+
                        "<a href='https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&amp;propertyIds=1527441&amp;category=&amp;nftOrder=PRICE_ASC'target='_blank'>"+
                            "DOSI LV3"+
                        "</a>"+
                      "</td>"+
                    "<td align='right' class='owned'>"+loading_image+"</td>"+
                    "<td align='right' class='selling'>"+loading_image+"</td>"+
                    "<td align='right' class='market'>"+loading_image+"</td>"+
                    "<td align='right' class='floor'>"+loading_image+"</td>"+
                    "<td align='right' class='usd'>"+loading_image+"</td>"+
                "</tr>"+
                "<tr id='dk_floor_dosi_lv4'>"+
                    "<td align='left'>"+
                      "<a href='https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&amp;propertyIds=1998823&amp;category=&amp;nftOrder=PRICE_ASC' target='_blank'>"+
                          "DOSI LV4"+
                      "</a>"+
                    "</td>"+
                    "<td align='right' class='owned'>"+loading_image+"</td>"+
                    "<td align='right' class='selling'>"+loading_image+"</td>"+
                    "<td align='right' class='market'>"+loading_image+"</td>"+
                    "<td align='right' class='floor'>"+loading_image+"</td>"+
                    "<td align='right' class='usd'>"+loading_image+"</td>"+
                "</tr>"+
                "<tr id='dk_floor_cat'>"+
                    "<td align='left'>"+
                      "<a href='https://citizen.store.dosi.world/en-US/marketplace?pageNo=1&amp;collectibleId=2&amp;category=&amp;nftOrder=PRICE_ASC' target='_blank'>"+
                          "CAT"+
                      "</a>"+
                    "</td>"+
                    "<td align='right' class='owned'>"+loading_image+"</td>"+
                    "<td align='right' class='selling'>"+loading_image+"</td>"+
                    "<td align='right' class='market'>"+loading_image+"</td>"+
                    "<td align='right' class='floor'>"+loading_image+"</td>"+
                    "<td align='right' class='usd'>"+loading_image+"</td>"+
                "</tr>"+
            "</tbody>"+
          "</table>");
}

function dk_extract_profile_id(url) {
  let tmp = url.split('/');
  let f_i = 5;
  for (let i = 0; i < tmp.length; i++) {
    if(tmp[i] == 'profile' && (i+1) in tmp) {
      f_i = i+1;
      break;
    }
  }
  return tmp[f_i].split('?')[0];
}

async function generate_dosi_report(url = '') {
  if(url == '') {
      url = window.location.href;
  }

  let profile_id = dk_extract_profile_id(url);
  if(profile_id) {
      options = await get_options();
      let data = await get_dosi_nfts(profile_id);
      let selling = await get_dosi_nfts(profile_id, "selling");

      $(".dk-dosi-profile-container .total_nft").html(data.list.length + selling.list.length);

      let token_price = await get_token_price();

      gen_floor_price_text(data.summary['Traveler'], selling.summary['Traveler'], "dosi_lv1", token_price);
      gen_floor_price_text(data.summary['Visitor'], selling.summary['Visitor'], "dosi_lv2", token_price);
      gen_floor_price_text(data.summary['Resident'], selling.summary['Resident'], "dosi_lv3", token_price);
      gen_floor_price_text(data.summary['Citizen'], selling.summary['Citizen'], "dosi_lv4", token_price);
      gen_floor_price_text(data.summary['Cat'], selling.summary['Cat'], "cat", token_price);
  }
}

  $(() => {
    prepare_container();
    generate_dosi_report();
    // toastr["success"]("Content script inserted", "Ext");
    //
    // Swal.fire({
    //   title: "Are you sure?",
    //   html: "<b>Do you want to perform this action now?</b>",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#d33",
    //   cancelButtonColor: "#3085d6",
    //   confirmButtonText: "Yes!",
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     toastr["info"]("You pressed Yes!", "Ext");
    //   }
    // });
  });

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
  });
/*
  //
  // Some helper functions:
  //

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function FindElementsByXpath(xpath, parent = document) {
    let els = document.evaluate(
      xpath,
      parent,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    const els_array = [];

    if (els) {
      let el = els.iterateNext();
      while (el) {
        els_array.push(el);
        el = els.iterateNext();
      }
    }
    return els_array;
  }

  function FindElementByXpath(xpath, parent = document) {
    var el = document.evaluate(
      xpath,
      parent,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    if (el && el.singleNodeValue) {
      return el.singleNodeValue;
    }
  }

  function smoothScrollTo(el, last = false) {
    try {
      (last ? $(el).last() : $(el))[0].scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } catch (e) {}
  }*/
})(this);
