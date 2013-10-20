(function(){

	// 히스토리에 저장된 본문내용을 리스트로 가져온다
	chrome.runtime.sendMessage({
		'serv' : 'history',
		'cmd'  : 'contents',
		'url'  : document.URL
	}, function(response){
		//console.log(response);
		// 쿼리를 수행하고 결과를 바로 fetch 
		// (매우중요 다른 callback이 이벤트뤂에 끼어들어가면 안된다.)
		function fetch(){
			chrome.runtime.sendMessage({
				'serv' : 'history',
				'cmd'  : 'fetched'
			}, function(response){
				//console.log(response);

				// waiting...
				if(response.fetch_on == true) {
					setTimeout(function(){
						fetch();
					}, 1);
					return ;
				};

				// 왼쪽 상단에 히스토리 리스트를 띄운다
				var ul = document.createElement('ul');
				ul.style.border = 'solid 1px red';
				ul.style.left = '0px';
				ul.style.top = '0px';
				ul.style.width = '120px';
				ul.style.position = 'fixed';

				var head = document.createElement('li');
				head.innerHTML = '나는 기억한다';
				ul.appendChild(head);

				var curr = document.createElement('button');
				curr.innerHTML = 'Current Page';
				curr.style.float = 'left';
				window['_sl_history'] = document.querySelector('#content > div > table').innerHTML;
				curr.addEventListener('click', function(){
					var contents = document.querySelector('#content > div > table');
					contents.innerHTML = window._sl_history;
					// 블랙리스트 숨기기
					ihateyou();
				}, false);
				ul.appendChild(document.createElement('li').appendChild(curr));

				for(var i=0; i < response.list.length; i++){
					(function(i){

						var li = document.createElement('li');
						var span = document.createElement('button');
						li.appendChild(span);
						li.style.margin = '2px';
						span.innerHTML = response.list[i].ts;
						span.style.float= 'left';

						span.addEventListener('click', function(){
							var contents = document.querySelector('#content > div > table');
							contents.innerHTML = response.list[i].content;
							// 블랙리스트 숨기기
							ihateyou();
						}, false);

						ul.appendChild(li);
					})(i);
				}
				document.body.appendChild(ul);

			});
		}
		fetch();// fetch 실행
	});


	// 본문 내용 전송 (순서를 보장하기 위해 중첩)
	var contents = document.querySelector('#content > div > table');
	var dNow = new Date();
	function getTimeStamp(){
		var dNow = new Date();
		function le10(d){
			if(d < 10)
				return '0' + d;
			else
				return '' + d;
		}
		var yyyy = le10(dNow.getFullYear());
		var mm = le10(dNow.getMonth() + 1);
		var dd = le10(dNow.getDate());
		var hh = le10(dNow.getHours());
		var mi =  le10(dNow.getMinutes());
		var sc = le10(dNow.getSeconds());

		return yyyy+'/'+mm+'/'+dd+' '+hh+':'+mi+':'+sc;
	}
	chrome.runtime.sendMessage({
		'serv' : 'history',
		'cmd'  : 'save',
		'url'  : document.URL,
		'timestamp' : getTimeStamp(),
		'contents' : contents.innerHTML
	});


	// i hate you 기능
	// 블랙리스트를 요청하고 숨긴다
	function ihateyou(){
		chrome.runtime.sendMessage({
			'serv' : 'ihateyou',
			'cmd'  : 'load'
		}, function(response){

			function hide_list(blist){
				for(var i=0; i < blist.length; i++){
					(function(i){
						var _name = blist[i].querySelector('a[href="javascript:;"]');
						if(_name){
							var id = String(_name.getAttribute('onclick')).split(',')[1].split("'")[1];
							//console.log(id);
							if(response.list[id]){
								//blist[i].style.visibility = 'hidden';
								blist[i].style.display = 'none';
							}
						}
					})(i);
				}
			}

			hide_list(document.querySelectorAll('.bg0'));
			hide_list(document.querySelectorAll("#commentContents > table"));
		});
	}
	ihateyou();

})();
