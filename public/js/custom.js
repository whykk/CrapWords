	$(document).ready(function(){
	console.log('jquery is ready!!!');
	var appName, isValid;
	var allKeywords = [];
	var step0 = $("#step0");
	var step1 = $("#step1");
	var step2 = $("#step2");
	var step3 = $("#step3");

	var diagnose_button = $("#diagnose_button");
 	var argument_div = $("#argument_div");
 	var auto_search = $("#auto_search");
 	var keyword_container = $("#keyword_container");

 	
	$("#auto_search").autocomplete({
		source: function(request, response){
			//var searchUrl = 'https://itunes.apple.com/search?term=yelp&country=us&entity=software';
			var searchUrl;
			var device = $('input:radio[name=device]:checked').val();
	
			// If user is searching for app by ID
			if ( isNaN(request.term) == false ){

				searchUrl = 'https://itunes.apple.com/lookup?id=' + request.term + '&country=us&entity=' + device + '&limit=10';
			
			// If user is searching for app by keywords
			} else {
				searchUrl = 'https://itunes.apple.com/search?term=' + request.term + '&country=us&entity=' + device + '&limit=10';

				//searchUrl ='https://itunes.apple.com/search?term=' + request.term + '&country=us&entity=' + device + '&limit=10';
			}
				
			$.ajax({  
	          url: searchUrl,
              dataType: 'jsonp',
              success: function( data ) {
              	var i=0;	
              	console.log(this.url);
          		results =[];
          		length = data.results.length;
          		for (i=0;i<length;i++){
	          		results.push({"value": data.results[i].trackName, "id": data.results[i].trackId});
	          		if ( i==( length-1) ){
	          			response(results);
	          		}
          		}
	          }
			});
		},

		select: function( event, ui ) {
		     fetchAppById(ui.item.id);
		     console.log("select clicked, fetching app with ID: ",ui.item.id);
		}
	});

	// go to itunes and fetch info about the chosen app and appen it to the site
	function fetchAppById(id){ 
		 $.ajax({
            url: 'https://itunes.apple.com/lookup?id=' + id,
            dataType: 'jsonp',
            success: function(response){
            	console.log(response);				
				name = response.results[0].trackName;
				img_url = response.results[0].artworkUrl60	
				$("#app_icon").append("<img id='icon_img' src=" + img_url +">");
				$("#app_title").append(name);
				appName = name;
				appId = response.results[0].trackId;
			
				renderStep1()
		}
	});
	}

	function renderStep1(){
		step0.hide();
		step1.show();
	}

	$("#single_keyword_form").submit(function(e){
	    e.preventDefault();
		console.log("#single_keyword_form submitted");
	    var str = $("#single_keywords_input").val();
	    console.log('single_keywords_input ', str);
	    if ( !$("#single_keywords_input").val()) {
	    	str = "free,bored,online,games,racing,playing,game";
	    }
	    cleanUpSingleKeywords(str, false);
	    fetchKeywordsFromTitle();
	   	
	   	renderStep2();
	
	});


	// Cleaning up the string of keywords (separating by commas and spaces plu removing non alphabetic characters and lowercasing all characters)
	function cleanUpSingleKeywords(str, fromTitle){
		console.log('cleanUpSingleKeywords triggered');
		var cleanSingleKeywords = [];
	    var keywords = str.replace(/[^a-zA-Z, ]/g, "").split(/[, ]/g);
	    for (var i=0, len=keywords.length; i < len; i++){
	    	if (keywords[i].length>0) {
	    		cleanSingleKeywords.push(keywords[i].toLowerCase());
	    	}
	    }
	    addToAllKeywords(cleanSingleKeywords, fromTitle, true);
	}

	// Add the single keywords to the allKeywords array
	function addToAllKeywords(keywords, fromTitle, singleKeyword){
		console.log('addToAllKeywords triggered. keywords is: ', keywords);
		if (keywords instanceof Array ){
			console.log('its an array');
			keywords.forEach(function (keyword){
				allKeywords.push({
						"keyword"         : keyword, 
						"title_keyword"   : fromTitle, 
						"single_keyword"  : singleKeyword,
						"combinations"    : []
					});
				});
		} else {
				console.log('its a string');
				allKeywords.push({
						"keyword"         : keywords, 
						"title_keyword"   : fromTitle, 
						"single_keyword"  : singleKeyword,
						"combinations"    : [] 
					});
		}
		renderKeywords(allKeywords);
	}

	// fetch keywords form app title
	function fetchKeywordsFromTitle(){
		console.log('fetchKeywordsFromTitle triggered');
		cleanUpSingleKeywords(appName,true);
	}

	// render keywords
	function renderKeywords(keywords){
		console.log('renderKeywords triggered');
		keyword_container.html("");
		var singleKeywordsHTML = [];
		for (var i=0,len=keywords.length;i<len;i++){
			singleKeywordsHTML.push('<li class="rendered_keyword">' + keywords[i].keyword + '</li>');
		}
		keyword_container.append(singleKeywordsHTML);
		console.log('allKeywords: ', allKeywords);
	}


	function renderStep2(){
		step1.hide();
		step2.show();
		diagnose_button.show();
	}

	$("#double_keyword_form").submit(function(e){
		e.preventDefault();

		var double_keywords_input = $("#double_keywords_input").val();
		if ( !$("#double_keywords_input").val()) {
	    	double_keywords_input = "free bored,online games,racing game,fun run";
	    }


		console.log('double_keyword_form triggered: ', double_keywords_input);
		var double_keywords = double_keywords_input.split(',');
		for (var i=0,len=double_keywords.length; i<len; i++){
			double_keywords[i].toLowerCase();
		}
		double_keywords.forEach(function(double_keyword){
			if (isDoubleKeyword(double_keyword) == true) {
				console.log('isDoubleKeyword is true, double_keyword is:', double_keyword);
				isValidDoubleKeyword(double_keyword);
			} else {
				console.log(double_keyword,' is not a double keyword');
				// add message to user: this keyword isnt a double keyword combination
			}
		});
	});

	//checking if the double keyword actually is a DOUBLE keyword
	function isDoubleKeyword(keyword){
		var arr = keyword.split(" ");
		if (arr.length > 1){
			return true;
		} else {
			return false;

		}
	}


	//checking if the double keyword actually is a combination of your single keywords
	function isValidDoubleKeyword(double_keyword){
		console.log('double_keyword is :', double_keyword);
		var arr = double_keyword.split(" ");
		
		for (var i =0,len=arr.length; i<len;i++){ 
			isValid = false;
			for (var j=0,length=allKeywords.length; j<length;j++){
				if (allKeywords[j].keyword === arr[i]){
					console.log('Match: ', arr[i], '=', arr[i]);
					isValid = true;
					break;
				}
			}
			if (!isValid){
				console.log('the keyword doesnt match: ', arr[i]);
				break;
			}
		}
		if (isValid){
			isUniqueDoubleKeyword(double_keyword);
		} else {
			// add a message to user "This keyword combo isnt valid!"
		}
	}

	// check if the double keyword exists already of if its unique
	function isUniqueDoubleKeyword(double_keyword){
		var isUnique = true;
		for (var i=0,length=allKeywords.length; i<length;i++){
				if (allKeywords[i].single_keyword == false) {
					if (allKeywords[i].keyword === double_keyword) {
						console.log('This double keyword already exists: ', allKeywords[i].keyword, '=', double_keyword);
						isUnique = false;
						break;
					}
				}
			}
		if (isUnique){
			addToAllKeywords(double_keyword,false,false);
		}	else {
			// add message to user: "You have already added this keyword combination"
		}
	}

	diagnose_button.click(function(){
		console.log('diagnose_button clicked');
		getKeywordResults(allKeywords);
		step2.hide();
		step3.show();
		diagnose_button.hide();

	});


	function getKeywordResults(allKeywords){
		console.log('diagnose_button clicked');
		var device = $('input:radio[name=device]:checked').val();
		allKeywords.map(function(keywordObject, index, array){
			var length = array.length;
			runAjaxCall(keywordObject.keyword,index, device, length);
		});

	/*
		for (var i=0,len = allKeywords.length;i<len;i++) {
			runAjaxCall(allKeywords[i],i);
		}
	*/

	}


/*	$(document).ajaxStop(function() {
		console.log('ajax stop triggered');
		// very unefficient! FIND A BETTER WAY!!
		checkImportantCombos(allKeywords);
	  // place code to be executed on completion of last outstanding ajax call here
	});
*/



	var ajaxCalls = 0;

	function runAjaxCall(keyword, atIndex, device, length){
		console.log('runAjaxCall triggered. keywordObject is:', keyword);
		console.log('device is:', device);
		var ajaxUrl ='http://local.host:8000/search/' + device + '/' + keyword;
		console.log('ajaxUrl: ', ajaxUrl);
		$.ajax({ 
			url: ajaxUrl,
			dataType: 'json',
			async:false,
			success: function (response){
				var ranked = false;
				console.log('ajax success');
				console.log('response: ', response);
				for (var j=0,len=response.length;j<len;j++) {
					console.log('j=',j);
					if (response[j].trackId === appId) {
						allKeywords[atIndex]["rank"] = j+1;
						ranked = true;
						console.log("FOUND MATCH!, j+1 =", j+1, 'j=', j);

					}
					// if looped through all results without a match
					if (j === (len-1)){
						if (ranked === false){
							allKeywords[atIndex]["rank"] = 50;
						}
					}
				}
				ajaxCalls += 1;
				if (ajaxCalls === length){		
					console.log('ALL AJAX CALLS FINISHED!');
					checkImportantCombos(allKeywords);

				}


			}
		});
	}

	function checkImportantCombos(allKeywords){
		allKeywords.forEach(function (singleKeywordObject,index){
			if (singleKeywordObject.single_keyword === true){
				allKeywords.forEach(function (doubleKeywordObject){
					if (doubleKeywordObject.single_keyword === false){
						if (doubleKeywordObject.keyword.indexOf(singleKeywordObject.keyword) > -1){
							console.log(singleKeywordObject.keyword, ' is a part of ', doubleKeywordObject.keyword);
							allKeywords[index]["combinations"] = [];
							allKeywords[index].combinations.push(doubleKeywordObject);
						}
					}
				});
			}
		if (index === (allKeywords.length - 1)){
			console.log(allKeywords);
			renderResult(allKeywords);
		}
		});
	}


	$("#email_input_button").click(function(){
		var email_address = $("#email_input_field").val();
		console.log('send_ajax clicked');
		$.ajax({
			url: "/postemail",
			method: "POST",
			data: {
				appName: appName, 
				email: email_address,
				report: JSON.stringify(allKeywords)
			},
			success: function(response){
				console.log('ALLKEYWORDS SENT TO SERVER.repsonse: ',response);	
			}
		})
	});

	function renderResult(allKeywords){
		$("#email_div").show();
		console.log('renderResult called');
		var HTML = [];
		allKeywords.forEach(function(keywordObject){
			HTML.push('<tr><td>' + keywordObject.keyword + '</td><td>' + keywordObject.rank + '</td></tr>');
		});
		console.log(HTML);
		$("#rank_table").append(HTML);

	}


	




// End of jQuery
});