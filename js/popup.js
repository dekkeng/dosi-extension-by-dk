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
  const loading_img = "<img src='https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' width='20' height='20' />";
  
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

async function gen_floor_price_text(type, floor) {
    let elem = "#popup_dk_floor_"+type;

    $(elem+" .amount").html(floor.total_items.toLocaleString());
    $(elem+" .amount_24change").html(gen_percent_change_text(floor.yesterday_total_items_change));
    $(elem+" .floor").html(floor.price.toFixed(4)+" "+floor.currency);
    $(elem+" .usd").html(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(floor.price_usd));
    $(elem+" .usd_24change").html(gen_percent_change_text(floor.yesterday_price_usd_change));
}

async function generate_dosi_report() {    
  options = await get_options();
  dosi_types = await get_dosi_type();
  $(".popup_dk_floor_price_table tbody").html("");
  let str = "";
  Object.keys(dosi_types).forEach(key => {
    str += "<tr id='popup_dk_floor_"+key+"'>"+
                  "<td align='left'>"+
                    "<img src='../img/"+dosi_types[key]['icon_image']+"' width='30' height='30' />"+
                  "</td>"+
                  "<td align='left'>"+
                      "<a href='"+dosi_types[key]['url']+"' target='_blank'>"+
                        dosi_types[key]['name']+
                      "</a>"+
                  "</td>"+
                  "<td align='right' class='amount'>"+loading_img+"</td>"+
                  "<td align='right' class='amount_24change'>"+loading_img+"</td>"+
                  "<td align='right' class='floor'>"+loading_img+"</td>"+
                  "<td align='right' class='usd'>"+loading_img+"</td>"+
                  "<td align='right' class='usd_24change'>"+loading_img+"</td>"+
                "</tr>";
  });
  $(".popup_dk_floor_price_table tbody").append(str);

  const floor = await get_floor_price();

  if('check_currency' in options) $(".popup_dk_filter").html("Filtered currency : "+options['check_currency'].toUpperCase()+" | ");
  let updated_at = "";
  Object.keys(floor).forEach(key => {
    gen_floor_price_text(key, floor[key]);
    updated_at = floor[key]['updated_at'];
  });
  
  $(".popup_dk_updated").html("Updated : "+moment(updated_at).fromNow());
  popupTable = new DataTable('.popup_dk_floor_price_table', {
      paging: false,
      searching: false,
      ordering:  false,
      info: false
  });
}

  $(() => {
    $('.option_button').click(function() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('html/options.html'));
      }
    });

    generate_dosi_report()
    //setInterval(generate_dosi_report, 20000)
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
