;(function(){
	XMLHttpRequest.prototype.setRequestHeaders = function _setRequestHeaders(rh, defaultCT){
		if(!defaultCT) defaultCT = 'application/json';

		for(var header in rh){
			this.setRequestHeader(header, rh[header]);
		}
	}

	var events = {
		facebook: {
			button: [],
			checkbox: []
		}
	};

	var botto = {};
	botto.config = {};

	botto.chat = {};
	botto.chat.__open = false;
	botto.chat.__iframe = null;

	botto.chat.button = function(system, options){
		// creates chat div
		let container = document.createElement('div');
		container.classList.add('botto-chat');
		document.body.appendChild(container);

		// creates button
		let div = document.createElement('div');
		div.classList.add('botto-button');
		
		let button = document.createElement('a');

		button.addEventListener('click', function(e){
			e.preventDefault();
			botto.chat.show(system, container, options);
		});
		div.appendChild(button);
		document.body.appendChild(div);
		return container;
	};

	botto.chat.show = function(system, container, options){
		if(!botto.chat.__iframe){
			botto.chat.make(system, container, options);
		}

		if(botto.chat.__open){
			container.style.display = 'none';
			botto.chat.__open = false;
		} else {
			container.style.display = 'block';
			botto.chat.__open = true;
		}
	};

	botto.chat.exists = function(){
		return !!botto.chat.__iframe;
	};

	botto.chat.make = function(system, container, options){
		if(!container){
			throw new Error('[BOTTO][CHAT] Container is needed');
		}
		
		if(!options){
			options = {};
		}

		if(botto.chat.__iframe){
			return;
		}

		let iframe = document.createElement('iframe');
		if(options.style){
			for(k in options.style){
				iframe.style[k] = options.style[k];
			}
		}

		if(!options.style || !options.style.width){
			iframe.style.width = '100%';
		}

		if(!options.style || !options.style.height){
			iframe.style.height = '100%';
		}

		iframe.setAttribute('allow', 'geolocation; microphone; camera; midi');
		iframe.style.borderRadius = '5px';
		iframe.style.border = 'none';

		iframe.src = 'https://' + (options.host ? options.host : 'bot.bottomatik.com') + '/chat/' + system;
		container.appendChild(iframe);

		botto.chat.__iframe = iframe;
		return iframe;
	};

	botto.facebook = {};
	botto.facebook.config = {};

	botto.facebook.ready = function(){
		// create facebook script
		var fbjs = document.getElementsByTagName('script')[0];
		if(document.getElementById('facebook-jssdk')){return;}
		var js = document.createElement('script');
		js.id = 'facebook-jssdk';
		js.src = "https://connect.facebook.net/en_US/sdk.js";
		if(!fbjs){
			document.head.appendChild(js);
		} else {
			fbjs.parentNode.insertBefore(js, fbjs);
		}
	};

	botto.facebook.init = function(system, host){
		if(!system){
			throw new Error('[BOTTO][INIT] System must be defined');
		}

		botto.config.system = system;
		botto.config.host = host;

		// get configuration from server
		return botto.http({
			url: 'https://' + (host ? host : (system + '.bottomatik.com')) + '/api/configuration/fb/config',
			method: 'GET',
			headers: {
				'X-Botto-Script': 'botto-on-facebook'
			}
		}).then(function(res){
			try {
				var response = JSON.parse(res.response);
				if(!response.page_id){
					throw new Error('[BOTTO] Could not get page_id from config, contact support');
				}

				botto.facebook.config = response;

				// prepare facebook async
				window.fbAsyncInit = function(){
					FB.init({
						appId: botto.facebook.config.app_id,
						autoLogAppEvents: true,
						xfbml: true,
						version: 'v2.11'
					});
				};

				return Promise.resolve();
			} catch(e) {
				botto.facebook.__locked = true;
				e.response = res;
				throw e;
			}

		}).catch(function(err){
			console.error(err);
			return Promise.reject();
		});
	};

	botto.facebook.checkbox = function(user_ref, options){
		var default_opts = {
			origin: location.protocol + '//' + location.host,
			prechecked: true,
			allow_login: true,
			size: 'large'
		};
		if(!options){options = default_opts;}

		if(botto.facebook.__locked){
			throw new Error('[BOTTO] Config is missing, cannot create checkbox');
		}

		var fb_checkbox = '<div class="fb-messenger-checkbox" origin={{origin}} page_id={{page_id}} '+
			'messenger_app_id={{app_id}} user_ref="{{user_ref}}" prechecked="{{prechecked}}" allow_login="{{allow_login}}" '+
			' size="{{size}}"></div>';

		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?origin(\\s+)?}}', 'gi'), default_opts.origin);
		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?prechecked(\\s+)?}}', 'gi'), options.prechecked || default_opts.prechecked);
		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?allow_login(\\s+)?}}', 'gi'), options.allow_login || default_opts.allow_login);
		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?size(\\s+)?}}', 'gi'), options.size || default_opts.size);

		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?user_ref(\\s+)?}}', 'gi'), user_ref);

		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?page_id(\\s+)?}}', 'gi'), botto.facebook.config.page_id);
		fb_checkbox = fb_checkbox.replace(new RegExp('{{(\\s+)?app_id(\\s+)?}}', 'gi'), botto.facebook.config.app_id);

		var checkbox = document.getElementsByClassName('botto-fb-checkbox');
		for(var i = 0; i < checkbox.length; i++){
			checkbox[i].innerHTML = fb_checkbox;
		}
	};

	botto.facebook.button = function(ref, options){
		if(!ref){
			throw new Error('[BOTTO][FB Button] ref must be defined');
		}

		var default_opts = {
			color: 'white',
			size: 'large'
		};
		if(!options) {options = default_opts;}

		if(botto.facebook.__locked){
			throw new Error('[BOTTO] Config is missing, cannot create send-to-messenger button');
		}
		var fb_button = '<div class="fb-send-to-messenger" messenger_app_id="{{ app_id }}" page_id="{{ page_id }}" data-ref="{{ ref }}"'+
			'color="{{ color }}" size="{{ size }}"></div>';

		fb_button = fb_button.replace(new RegExp('{{(\\s+)?color(\\s+)?}}', 'gi'), options.color || default_opts.color);
		fb_button = fb_button.replace(new RegExp('{{(\\s+)?size(\\s+)?}}', 'gi'), options.size || default_opts.size);

		fb_button = fb_button.replace(new RegExp('{{(\\s+)?ref(\\s+)?}}', 'gi'), ref);
		fb_button = fb_button.replace(new RegExp('{{(\\s+)?page_id(\\s+)?}}', 'gi'), botto.facebook.config.page_id);
		fb_button = fb_button.replace(new RegExp('{{(\\s+)?app_id(\\s+)?}}', 'gi'), botto.facebook.config.app_id);

		var buttons = document.getElementsByClassName('botto-fb-button');
		for(var i = 0; i < buttons.length; i++){
			buttons[i].innerHTML = fb_button;
		}
	};

	botto.facebook.checked = function(ref, user_ref){
		if(!ref || !user_ref){
			throw new Error('[BOTTO][FB Button] ref and user_ref must be defined');
		}
		if(botto.facebook.__locked){
			throw new Error('[BOTTO] Config is missing, cannot fire checkbox event');
		}

		FB.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
			'app_id': botto.facebook.config.app_id,
			'page_id': botto.facebook.config.page_id,
			'ref': ref,
			'user_ref': user_ref
		});
	};


	// http requests bundled with package
	botto.http = function workshop_ajax(params, callback, onupload){
		//params = url, method, callback(err, resp), data, async, debug, status, rh
		if (typeof params == 'undefined'){
			throw new Error("[BOTTO][HTTP] Parameters are required");
		}

		if(typeof params.debug == 'undefined' || params.debug == null) params.debug = false; 

		if (typeof params.url == 'undefined'){
			throw new Error("[BOTTO][HTTP] URL is required");
		}

		if (typeof params.method == 'undefined' || (params.method != "GET" && params.method != "POST" && params.method != "DELETE" && params.method != "PUT")){
			throw new Error("[BOTTO][HTTP] method is required and must be GET, POST, DELETE or PUT only");
		}

		function ajaxpromise(resolve, reject){
			var xml = new XMLHttpRequest();
			xml.onreadystatechange = function(){
				if(xml.readyState == 4){
					if (xml.status == (params.status || 200)){
						//readyState 4 = end of call and success
						if (typeof callback != 'undefined') callback(null, xml.responseText, xml);
						if(resolve){resolve({
							error:null,
							response: xml.responseText,
							xhr:xml,
							status: xml.status
						});}
						return xml.responseText;
					} else {
						if(params.debug) console.log("XMl Error: readyState: ", xml.readyState, " status:", xml.status);
						if (typeof callback != 'undefined') callback({error: {message: xml.statusText, state: xml.readyState, status: xml.status}}, xml.responseText, xml);
						if(reject){reject({
							error:{message: xml.statusText, state: xml.readyState, status: xml.status},
							response: xml.responseText,
							status:xml.status,
							xhr: xml
						});}
					}
				}
			};

			if(onupload){
				xml.upload.onloadstarts = onupload.onloadstarts || null;
				xml.upload.onprogress = onupload.onprogress || null;
				xml.upload.onerror = xml.upload.onabort = xml.upload.ontimeout = onupload.onerror || null;
				xml.upload.onload = onupload.onload || null;
				xml.upload.onloadend = onupload.onloadend || null;
			}

			xml.onerror = function(){
				if(params.debug) console.log("XMl Error: readyState: ", xml.readyState, " status:", xml.status);
				if (typeof callback != 'undefined') callback({error: {message: xml.statusText, state: xml.readyState, status: xml.status}}, xml.responseText, xml);
				if(reject){
					reject({
						error:{message: xml.statusText, state: xml.readyState, status: xml.status},
						response: xml.responseText,
						status:xml.status,
						xhr: xml
					});
				}
			};

			var async;
			if (typeof params.async != 'undefined'){
				async = params.async;
			}else{
				async = true;
			}

			if (params.method == "GET" || params.method == "DELETE"){

				if (typeof params.data === 'undefined'){
					xml.open(params.method, params.url, async);
					xml.setRequestHeaders(params.headers || {});
					xml.send();
				}else{
					var url = (params.url.substring(params.url.length-1, params.url.length) == "/")? "?" : "/?";
					for (var key in params.data){
						url += key + "=" + params.data[key] + "&";
					}
					url = url.substring(0,url.length-1);
					params.url += url;
					xml.open(params.method, params.url, async);
					xml.setRequestHeaders(params.headers || {});
					xml.send();
				}

			}else if(params.method == "POST" || params.method == "PUT"){
				xml.open(params.method, params.url, async);
				xml.setRequestHeaders(params.headers || {});
				if (typeof params.data != 'undefined'){
					if(params.headers && params.headers['Content-Type'] && params.headers['Content-Type'] == 'application/json'){
						xml.send(JSON.stringify(params.data));
					} else {
						xml.send(params.data);
					}
				}else{
					xml.send();
				}
			}
		}

		return new Promise(ajaxpromise);
	};

	window.botto = botto;
})();