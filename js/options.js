/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const window = cxt.window;
  const document = cxt.document;
  const $ = cxt.$;
  // const runtime = cxt.chrome.runtime;
  // const commands = cxt.chrome.commands;
  // const tabs = cxt.chrome.tabs;
  // const windows = cxt.chrome.windows;
  // const contextMenus = cxt.chrome.contextMenus;
  // const action = cxt.chrome.action;
  const storage = cxt.chrome.storage;
  const sync = storage.sync;
  let options = {};
  let dosi_type = {};

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

  function save_options() {
    options['check_currency'] = $("#check_currency").val();
    options['floor_alert'] = {};
    
    Object.keys(dosi_type).forEach(key => {
      options['floor_alert'][key] = {
        'alert_type': $("#"+key+"_alert .alert_type").val(),
        'alert_amount': $("#"+key+"_alert .alert_amount").val(),
        'alert_currency': $("#"+key+"_alert .alert_currency").val()
      }
    });

    sync.set({ 'dk_dosi_options' : options });

    toastr["success"]("Save option complete");
  }

  async function get_dosi_type() {
    let req = "https://dosi.newfolderhosting.com/api/type/";
    
    return new Promise(function(resolve, reject) { 
      fetch(req)
        .then(response => response.json())
        .then(data => resolve(data));
    });
  }

  async function generate_options() {
    dosi_type = await get_dosi_type();
    let text = "";
    
    Object.keys(dosi_type).forEach(key => {
      let name = key.replace("_", " ").toUpperCase();

      text += "<div id='"+key+"_alert' class='form-group row'>"+
                  "<label class='col-4'>"+name+" floor price</label>"+
                  "<div class='col-3'>"+
                      "<select class='form-control alert_type'>"+
                          "<option value='0' selected>Not alert</option>"+
                          "<option value='-1'><</option>"+
                          "<option value='1'>></option>"+
                      "</select>"+
                  "</div>"+
                  "<div class='col-2'>"+
                      "<input type='number' class='form-control alert_amount' value='0' />"+
                  "</div>"+
                  "<div class='col-3'>"+
                      "<select class='form-control alert_currency'>"+
                          "<option value='usd' selected>USD</option>"+
                          "<option value='fnsa'>FNSA</option>"+
                          "<option value='eth'>ETH</option>"+
                      "</select>"+
                  "</div>"+
                "</div>";
    });

    $("#option_dosi_alert_container").html(text);
    
    await show_options();
  }

  function assign_options(opt, key) {    
    if(key in opt) {
      $("#"+key).val(opt[key]);
    } else {
      opt[key] = '';
    }
    options[key] = opt[key];
  }

  async function show_options() {
    options = await get_options();
    if(options) {
      assign_options(options, 'check_currency');    
      
      if('floor_alert' in options) {
        Object.keys(dosi_type).forEach(key => {    
          if(key in options['floor_alert']) {
            $("#"+key+"_alert .alert_type").val(options['floor_alert'][key]['alert_type']);
            $("#"+key+"_alert .alert_amount").val(options['floor_alert'][key]['alert_amount']);
            $("#"+key+"_alert .alert_currency").val(options['floor_alert'][key]['alert_currency']);
          }
        });
      }
      toastr["info"]("Load option complete");
    }
  }

  $(() => {
    generate_options();
    $("#save_option").click(save_options);
  });
})(this);
