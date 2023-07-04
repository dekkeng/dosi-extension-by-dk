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
  const sync = storage.sync;
  let options = {};
  let popupTable;
  let dosi_types = {};
  
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
  
  return new Promise(function(resolve, reject) { $.ajax({
        url: req,
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function(res) {
            data = res;
            resolve(data)
        }
    });
  });
}

async function get_dosi_type() {
  let req = "https://dosi.newfolderhosting.com/api/type/";
  
  return new Promise(function(resolve, reject) { $.ajax({
        url: req,
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function(res) {
            data = res;
            resolve(data)
        }
    });
  });
}

function gen_percent_change_text(percent) {
  let res = "", color = "gray", sign = "";

  if(percent < 0) { color = "red" }
  else if(percent > 0) { color = "green"; sign = "+"; }

  res += "<span style='color:"+color+";'>" + sign +percent.toFixed(2)+'%</span>';
  return res;
}

async function generate_dosi_report() {    
  options = await get_options();
  dosi_types = await get_dosi_type();
  const floor = await get_floor_price();

  let currency_filter = "";

  if('check_currency' in options) {
    currency_filter = options['check_currency'].toUpperCase();
    $(".popup_dk_filter").html("Filtered currency : "+currency_filter+" | ");
    if(currency_filter == "ALL") currency_filter = "";
  }
  let updated_at = "";


  popupTable.clear().draw();

  Object.keys(floor).forEach(key => {
    popupTable.row.add([
      "<img src='../img/"+dosi_types[key]['icon_image']+"' width='20' height='20' />",
      "<a href='"+dosi_types[key]['url']+"&currency="+currency_filter+"' target='_blank'>"+dosi_types[key]['name']+"</a>",
      floor[key].price.toFixed(4)+" "+floor[key].currency,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(floor[key].price_usd),
      gen_percent_change_text(floor[key].yesterday_price_usd_change),
      floor[key].total_items.toLocaleString(),
      gen_percent_change_text(floor[key].yesterday_total_items_change),
    ])
    updated_at = floor[key]['updated_at'];
  });
  popupTable.draw();

  $(".popup_dk_updated").html(" "+moment(updated_at).format("D MMM YYYY HH:mm:ss [GMT]Z") + " ("+moment(updated_at).fromNow()+")");
}

  $(() => {
    $('.option_button').click(function() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('html/options.html'));
      }
    });

    popupTable = new DataTable('.popup_dk_floor_price_table', {
      paging: false,
      searching: false,
      ordering:  false,
      info: false,
      columnDefs: [
        {
          "targets": [0],
          "className": "text-center",
        },
        {
          "targets": [1],
          "className": "text-left",
        },
        {
          "targets": [2,3,4,5,6],
          "className": "text-right",
        }
      ]
    });
    generate_dosi_report()
    setInterval(generate_dosi_report, 20000)
  });
})(this);
