/*!
 * <ADD COPYRIGHT DETAILS>
 */

(function (cxt) {
  const window = cxt.window;
  const document = cxt.document;
  const $ = cxt.$;  
  const summary_arcade_container = "#root .page > .container";
  const arcade_container = "div:contains(My Highest Record)";
  const loading_image = "<img src='https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' width='20' height='20' />";
  const storage = cxt.chrome.storage;
  const runtime = cxt.chrome.runtime;
   
  const sync = storage.sync;

  let new_container = true;
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
        //body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return true;
}

 async function get_dosi_game_ranking(game, challenge_list = null) {
    let data = {};
    let req = "https://citizen.dosi.world/api/citizen/v1/arcade/"+game+"/ranking";
    await fetch(req)
        .then(res => res.json())
        .then(res => {
            if(res.myRank > 0) {
              data = res;
              send_dosi_game_ranking(game, data);
            }
              
            if($(".dk-dosi-summary-arcade-container").length != 0) {
              $(".dk-dosi-summary-arcade-container ."+game+"_score").html(res.myScore);
              $(".dk-dosi-summary-arcade-container ."+game+"_rank").html(res.myRank);
              if(challenge_list) {
                let challenge = null;
                let don_reward = 0;
                challenge_list.forEach(list => {
                  if(res.myScore >= list.minScore) {
                    challenge = list;
                    don_reward += 1000;
                  }
                });
                if(challenge) {
                    $(".dk-dosi-summary-arcade-container ."+game+"_reward").html(don_reward+" DON (1/"+challenge.winnerCount+")");
                }
              }
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
            if($(".dk-dosi-summary-arcade-container").length != 0) {
              let game_list_body = "";
              data.forEach(async game => {
                let gg = game
                game_list_body += "<tr>"
                                      +"<td><a target='_blank' href='https://citizen.dosi.world/arcade/game/"+gg.gameId+"'><img class='"+gg.gameId+"_image dk_arcade_summary_image' height='50' src='"+gg.arcadeThumbnailList[1]['url']+"' /></a></td>"
                                      +"<td><a target='_blank' href='https://citizen.dosi.world/arcade/game/"+gg.gameId+"/play'>"+gg.title.toUpperCase()+"</a></td>"
                                      +"<td><span class='"+gg.gameId+"_score dk_arcade_summary_score'>-</span></td>"
                                      +"<td><span class='"+gg.gameId+"_rank dk_arcade_summary_rank'>-</span></td>"
                                      +"<td><span class='"+gg.gameId+"_reward dk_arcade_summary_reward'>-</span></td>"
                                  +"</tr>";
              });
              $(".dk-dosi-summary-arcade-container tbody").html(game_list_body);
            }

            data.forEach(async g => {
              let g_data = g;
              let d = await get_dosi_game_ranking(g_data.gameId, g_data.arcadeChallengeList);
              /*
              console.log(d)
              score_list.data.push({
                'game': g_data.gameId,
                'score': 111,
              });*/
            });
            //send_dosi_game_ranking(score_list);
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
          get_all_game_score();
        })
    return data;
}

function prepare_summary_arcade_container() {
  if($(".dk-dosi-summary-arcade-container").length != 0) {
    return false;
  }
  
  url = window.location.href.replace(/https?:\/\//i, "");
  
  if(url == 'citizen.dosi.world/arcade') {
      $(".dk-dosi-summary-arcade-container").remove();
      $(summary_arcade_container).append("<div class='dk-dosi-summary-arcade-container'>"
                                            +"<table class='dk-sodi-summary-arcade-table table' border='1' width='100%' cellspacing='0'>"
                                              +"<thead>"
                                                +"<tr>"
                                                  +"<th></th>"
                                                  +"<th>Game</th>"
                                                  +"<th>Score</th>"
                                                  +"<th>My rank</th>"
                                                  +"<th>DON Prize (Raffle)</th>"
                                                +"</tr>"
                                              +"</thead>"
                                              +"<tbody></tbody>"
                                            +"</table>"
                                        +"</div>");
                                        
        get_all_game_score();
  }
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
    //getOrCreateClientId();
  
    setInterval(function() {
      prepare_summary_arcade_container();
    }, 2000)
  
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
