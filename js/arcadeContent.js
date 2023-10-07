/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
    const window = cxt.window;
    const document = cxt.document;
    const $ = cxt.$;  
    const arcade_container = "div:contains(My Highest Record)";
    const loading_image = "<img src='https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' width='20' height='20' />";
    const storage = cxt.chrome.storage;
    const runtime = cxt.chrome.runtime;
     
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
            if('dk_dosi_options' in opt) {
              resolve(opt['dk_dosi_options']);
            } else {
              resolve({})
            }
          });
      });
    }
    
  function dk_extract_arcade_game(url) {
    if(!url.includes("game")) {
      return 0;
    }

    let tmp = url.split('/');
    let f_i = 5;
    for (let i = 0; i < tmp.length; i++) {
      if(tmp[i] == 'game' && (i+1) in tmp) {
        f_i = i+1;
        break;
      }
    }
    return tmp[f_i].split('?')[0];
  }
  
  async function generate_dosi_ranking_report(url = '') {
    if(url == '') {
        url = window.location.href;
    }
  
    let game = dk_extract_arcade_game(url);
    if(game) {
        options = await get_options();
        let data = await get_dosi_game_ranking(game);
  
        $(".dk-dosi-arcade-container").remove();
        container = $(arcade_container);
        if(container && container.length > 0) {
            coontainer = container[container.length-1];
        }
        $(coontainer).parent().removeClass("dk-container");
        $(coontainer).parent().addClass("dk-container");
        $(coontainer).append("<div class='dk-dosi-arcade-container'>"+
                  "<h4>(My Rank : <strong><span class='myrank'>"+data.myRank+"</span></strong>)</h4>"+
                "</div>");
    }
  }
  
  function send_dosi_game_ranking(game, data) {        
      let req = "https://dosi.newfolderhosting.com/api/update_game_score";
      fetch(req,{
          method: "POST",
          body: JSON.stringify({
              //'uid': userData.uid,
              //'user_data': JSON.stringify(userData),
              'game': game,
              'rank': data.myRank,
              'score': data.myScore,
              'play_time': data.myPlayTms,
              'week_start': data.weekBeginTms,
              'week_end': data.weekEndTms,
              'raw_data': JSON.stringify(data)
          }),
          headers: {
              'Content-Type': 'application/json',
          },
      });


      return true;
  }

  async function get_dosi_game_ranking(game) {
      let data = {};
      let req = "https://citizen.dosi.world/api/citizen/v1/arcade/"+game+"/ranking";
      await fetch(req)
          .then(res => res.json())
          .then(res => {
              data = res;
              if(data.myRank > 0) {
                send_dosi_game_ranking(game, data);
              }
          })
      return data;
  }

  function get_all_game_score() {
      let data = {};
      let req = "https://citizen.dosi.world/api/citizen/v1/arcade";
      fetch(req)
          .then(res => res.json())
          .then(res => {
              data = res.arcadeList;
              data.forEach(g => {
                  get_dosi_game_ranking(g.gameId);
              });
          })
      return data;
  }

    $(() => {
        setInterval(function() {
            generate_dosi_ranking_report();
        }, 2000)
        
        setInterval(function() {
            get_all_game_score();
        }, 30000)
        get_all_game_score();
    });
  
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log(message);
    });
  })(this);
  