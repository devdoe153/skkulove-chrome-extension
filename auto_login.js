
// 자동로그인
// author : 멍충한아싸
// 2013/10/13

(function(){

	chrome.runtime.sendMessage({
		'serv' : 'auto_login',
		'cmd'  : 'load'
	}, function(response){
	
		/*
			로그인 상태가 아닐경우 'fhead' 이름 form 이 유일하게 존재한다.
			2013/10/13 현재 ~
		*/
		var login_form = document.forms['fhead'];

		if(response.states == 'true' && login_form != null){

			login_form.mb_id.value                       = response.userid;
			login_form.mb_id.style.backgroundImage       ='';
			login_form.mb_password.value                 = response.userpw;
			login_form.mb_password.style.backgroundImage ='';
						
			// login url
			// 홈페이지 url 이 바뀔시 수정 예) ver3 -> ver4
			login_form.action = 'http://www.skkulove.com/ver3/bbs/login_check.php';
			login_form.submit();	
		}

	});


})();

