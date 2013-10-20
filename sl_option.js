//

(function(){

	// 우선 로그인 정보를 받아와서 채워넣는다.
	chrome.runtime.sendMessage({
		'serv' : 'auto_login',
		'cmd'  : 'load'
	}, function(response){
	
		var auto_chk = document.querySelector('#auto_chk');
		var auto_id  = document.querySelector('#auto_id');
		var auto_pw  = document.querySelector('#auto_pw');

		if(response.states == 'true'){
			auto_chk.checked = true;
		}else{
			auto_chk.checked = false;
		}
		auto_id.value = response.userid;
		auto_pw.value = response.userpw;

		document.querySelector('#auto_btn').addEventListener('click', function(){
			// 저장버튼을 눌렀을시
			chrome.runtime.sendMessage({
				'serv' : 'auto_login',
				'cmd'  : 'save',
				'userid' : auto_id.value,
				'userpw' : auto_pw.value,
				'states'  : auto_chk.checked
			}, function(response){
				var msg = document.querySelector('#auto_msg');
				msg.innerHTML = '저장되었습니다...';
				setTimeout(function(){
					msg.innerHTML = '';
				}, 1000);
			});
		}, false);
	});

	// 너싫어 리스트를 불러온다
	function refresh_list(){
		chrome.runtime.sendMessage({
			'serv' : 'ihateyou',
			'cmd'  : 'load'
		}, function(response){
			var lis = Object.keys(response.list);
			var ihate_list = document.querySelector('#ihate_list');
			ihate_list.innerHTML = '';

			for(var i=0; i < lis.length; i++){
				var itm = document.createElement('li');
				var btn = document.createElement('button');
				var span = document.createElement('span');
				itm.className = 'list-group-item';
				btn.className = 'close';
				span.innerHTML = lis[i];
				btn.innerHTML = 'x';

				itm.appendChild(span);
				itm.appendChild(btn);

				(function(i){
					btn.addEventListener('click', function(){
						chrome.runtime.sendMessage({
							'serv' : 'ihateyou',
							'cmd'  : 'del',
							'userid' : lis[i]
						});
						refresh_list();
					}, false);
				})(i);
				

				ihate_list.appendChild(itm);
			}
		});
	}
	// 갱신
	refresh_list();

	var hate_id = document.querySelector('#hate_id');
	var hate_btn= document.querySelector('#hate_btn');

	hate_btn.addEventListener('click', function(){
		if(hate_id.value){
			chrome.runtime.sendMessage({
				'serv' : 'ihateyou',
				'cmd'  : 'save',
				'userid' : hate_id.value
			});
			refresh_list();
			hate_id.value = '';
		}
	}, false);


	// 히스토리 검색
	var history_search     = document.querySelector('#history_search');
	var history_search_btn = document.querySelector('#history_search_btn');

	history_search_btn.addEventListener('click', function(){
		chrome.runtime.sendMessage({
			'serv' : 'history',
			'cmd'  : 'search' ,
			'search' : history_search.value.split(/\s+/) || []
			//'page' : 0 
		}, function(response){

			function fetch(){
				chrome.runtime.sendMessage({
					'serv' : 'history',
					'cmd'  : 'fetched'
				}, function(response){

					// waiting...
					if(response.fetch_on == true) {
						setTimeout(function(){
							fetch();
						}, 1);
						return ;
					};

					var history_list = document.querySelector('#history_list');
					history_list.innerHTML = '';

					var history_result = document.querySelector('#history_result');
					history_result.innerHTML = '';

					console.log(response);
					
					if(response == null) return ;

					for(var i=0; i < response.list.length; i++){
						// closure
						(function(i){
							var itm = document.createElement('a');
							itm.className = 'list-group-item';
							var subject = '제목을 찾을수 없습니다';
							var matg = response.list[i].content.match(/<div class="board_head">[^<]*<\/div>/g);
							if(matg != null){
								subject = matg[0];
							}

							itm.innerHTML = '[Captured: ' + response.list[i].ts + ']   ' + subject;
							history_list.appendChild(itm);
							itm.addEventListener('click', function(){
								var history_result = document.querySelector('#history_result');
								history_result.innerHTML = response.list[i].content;
							},false);
						})(i);
					}

				});
			}
			fetch();
		});
	}, false);

})();

