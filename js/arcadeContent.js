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
     
    const sync = storage.sync;
  
    let options = {};
    let clientId = "";
  
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
        $(coontainer).parent().removeClass("dk-arcade-container");
        $(coontainer).parent().addClass("dk-arcade-container");
        $(coontainer).append("<div class='dk-dosi-arcade-container'>"+
                  "<h4>(My Rank : <strong><span class='myrank'>"+data.myRank+"</span></strong>)</h4>"+
                "</div>");
    }
  }
  
  function send_dosi_game_ranking(data) {        
      let req = "https://dosi.newfolderhosting.com/api/update_game_score";
      fetch(req,{
          method: "POST",
          body: JSON.stringify(data),
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
              if(res.myRank > 0) {
                data = res;
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
              let score_list = {
                'uid': clientId,
                'data': []
              };
              data.forEach(async g => {
                let g_data = g;
                let d = await get_dosi_game_ranking(g_data.gameId);
                console.log(d)
                score_list.data.push({
                  'game': g_data.gameId,
                  'score': 111,
                });
              });
              send_dosi_game_ranking(score_list);
          })
      return data;
  }

  function get_user_profile() {
      let data = {};
      let req = "https://api.store.dosi.world/stores/citizen/v2/login/status?loginFinishUri=";
      fetch(req)
          .then(res => res.json())
          .then(res => {
            data = res
            console.log(data);
            get_all_game_score();
          })
      return data;
  }

  async function getOrCreateClientId() {
    const result = await sync.get('dk_client_id');
    clientId = result.clientId;
    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      clientId = self.crypto.randomUUID();
      await sync.set({clientId});
    }
    return clientId;
  }

    $(() => {
      getOrCreateClientId();
    
      setInterval(function() {
          generate_dosi_ranking_report();
      }, 2000)
      
      setInterval(function() {
          get_all_game_score();
      }, 30000)
      get_all_game_score();

      /*setTimeout(function() {
        get_user_profile();
      }, 3000)*/
    });
  
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log(message);
    });
  })(this);
  