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
    sync.set({ 'dk_dosi_options' : options });

    toastr["success"]("Save option complete");
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
      toastr["info"]("Load option complete");
    }
  }

  $(() => {
    show_options();
    $("#save_option").click(save_options);
  });
})(this);
