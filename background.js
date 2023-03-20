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

  // Configure commands in manifest.commands
  commands &&
    commands.onCommand.addListener(function (command) {
    });

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse();
  });
})(this);
