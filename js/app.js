(function () {
	'use strict';

	$(function() {
		FastClick.attach(document.body);
	});

	var app = angular.module('msmApp', ['ngRoute', 'ngSanitize', 'angulartics', 'angulartics.google.analytics']);

	app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/',
				{
					templateUrl: 'html/home.html'
				})
			.when('/about',
				{
					templateUrl: 'html/about.html'
				})
			.when('/events',
				{
					templateUrl: 'html/events.html'
				})
			.when('/weekly',
				{
					templateUrl: 'html/weekly.html'
				})
			.when('/initiative',
				{
					templateUrl: 'html/initiative.html'
				})
			.when('/upcoming',
				{
					templateUrl: 'html/upcoming.html'
				})
			.when('/news',
				{
					templateUrl: 'html/news.html'
				})
			.when('/podcasts',
				{
					templateUrl: 'html/podcasts.html'
				})
			.when('/contact',
				{
					templateUrl: 'html/contact.html'
				})
      .when('/thankyou',
				{
					templateUrl: 'html/thankyou.html'
				})
      .when('/blog',
				{
					templateUrl: 'html/blog.html'
				})
			.otherwise({ redirectTo: '/' });
	}]);

  /********************************************************************
   *
   *                            Controllers
   *
   ********************************************************************/
  
  app.controller('InitializeController', [function (){
		$(document).foundation();
		var swipeFrontElement = document.getElementById('swipe');

		console.log('swipe elem', swipeFrontElement);
		
		
    // Shim for requestAnimationFrame from Paul Irishpaul ir
    // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ 
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    var pointerDownName = 'MSPointerDown';
    var pointerUpName = 'MSPointerUp';
    var pointerMoveName = 'MSPointerMove';

    if(window.PointerEvent) {
      pointerDownName = 'pointerdown';
      pointerUpName = 'pointerup';
      pointerMoveName = 'pointermove';
    }
      
    // Simple way to check if some form of pointerevents is enabled or not
    window.PointerEventsSupport = false;
    if(window.PointerEvent || window.navigator.msPointerEnabled) {
      window.PointerEventsSupport = true;
    }
      
		function SwipeRevealItem(element) {
	    // Gloabl state variables
	    var STATE_DEFAULT = 1;
	    var STATE_LEFT_SIDE = 2;
	    var STATE_RIGHT_SIDE = 3;
	    
	    var swipeFrontElement = element.querySelector('.swipe-front');
	    var swipeBack = element.querySelector('.swipe-back');
	    var isAnimating = false;
	    var initialTouchPos = null;
	    var lastTouchPos = null;
	    var currentXPosition = 0;
	    var currentState = STATE_DEFAULT;
	    var handleSize = 10;
	    
	    // Perform client width here as this can be expensive and doens't 
	    // change until window.onresize
	    var itemWidth = swipeFrontElement.clientWidth;
	    var slopValue = itemWidth * (1/4);

	    // On resize, change the slop value
	    this.resize = function() {
	      itemWidth = swipeFrontElement.clientWidth;
	      slopValue = itemWidth * (1/4);
    	}

			// Handle the start of gestures
	    this.handleGestureStart = function(evt) {
	      evt.preventDefault();

	      if(evt.touches && evt.touches.length > 1) {
	        return;
	      }

	      // Add the move and end listeners
	      if (window.PointerEventsSupport) {
	        // Pointer events are supported.
	        document.addEventListener(pointerMoveName, this.handleGestureMove, true);
	        document.addEventListener(pointerUpName, this.handleGestureEnd, true);
	      } else {
	        // Add Touch Listeners
	        document.addEventListener('touchmove', this.handleGestureMove, true);
	        document.addEventListener('touchend', this.handleGestureEnd, true);
	        document.addEventListener('touchcancel', this.handleGestureEnd, true);
	      
	        // Add Mouse Listeners
	        document.addEventListener('mousemove', this.handleGestureMove, true);
	        document.addEventListener('mouseup', this.handleGestureEnd, true);
	      }
	      
	      initialTouchPos = getGesturePointFromEvent(evt);

	      swipeFrontElement.style.transition = 'initial';
	    }.bind(this);
	        
			// Handle move gestures
	    this.handleGestureMove = function (evt) {
	      evt.preventDefault();

	      console.log('handleGestureMove');

	      lastTouchPos = getGesturePointFromEvent(evt);
	      
	      if(isAnimating) {
	        return;
	      }
	      
	      isAnimating = true;
	      
	      window.requestAnimFrame(onAnimFrame);
	    }.bind(this);

			// Handle end gestures
		  this.handleGestureEnd = function(evt) {
		    evt.preventDefault();

		    if(evt.touches && evt.touches.length > 0) {
		      return;
		    }

		    isAnimating = false;
		    
		    // Remove Event Listeners
		    if (window.PointerEventsSupport) {
		      // Remove Pointer Event Listeners
		      document.removeEventListener(pointerMoveName, this.handleGestureMove, true);
		      document.removeEventListener(pointerUpName, this.handleGestureEnd, true);
		    } else {
		      // Remove Touch Listeners
		      document.removeEventListener('touchmove', this.handleGestureMove, true);
		      document.removeEventListener('touchend', this.handleGestureEnd, true);
		      document.removeEventListener('touchcancel', this.handleGestureEnd, true);
		    
		      // Remove Mouse Listeners
		      document.removeEventListener('mousemove', this.handleGestureMove, true);
		      document.removeEventListener('mouseup', this.handleGestureEnd, true);
		    }
		    
		    updateSwipeRestPosition();
		  }.bind(this);
		  
			function updateSwipeRestPosition() {
	      var differenceInX = initialTouchPos.x - lastTouchPos.x;
	      currentXPosition = currentXPosition - differenceInX;
	      
	      // Go to the default state and change
	      var newState = STATE_DEFAULT;

	      // Check if we need to change state to left or right based on slop value
	      if(Math.abs(differenceInX) > slopValue) {
	        if(currentState == STATE_DEFAULT) {
	          if(differenceInX > 0) {
	            newState = STATE_LEFT_SIDE;
	          } else {
	            newState = STATE_RIGHT_SIDE;
	          }
	        } else {
	          if(currentState == STATE_LEFT_SIDE && differenceInX > 0) {
	            newState = STATE_DEFAULT;
	          } else if(currentState == STATE_RIGHT_SIDE && differenceInX < 0) {
	            newState = STATE_DEFAULT;
	          }
	        }
	      } else {
	        newState = currentState;
	      }
	      
	      changeState(newState);
	      
	      swipeFrontElement.style.transition = 'all 150ms ease-out';
	    }

	    function changeState(newState) {
	      var transformStyle;
	      switch(newState) {
	        case STATE_DEFAULT:
	          currentXPosition = 0;
	          break;
	        case STATE_LEFT_SIDE:
	          currentXPosition = -(itemWidth - handleSize);
	          break;
	        case STATE_RIGHT_SIDE:
	          currentXPosition = itemWidth - handleSize;
	          break;
	      }
	      
	      transformStyle = 'translateX('+currentXPosition+'px)';
	      
	      swipeFrontElement.style.msTransform = transformStyle;
	      swipeFrontElement.style.MozTransform = transformStyle;
	      swipeFrontElement.style.webkitTransform = transformStyle;
	      swipeFrontElement.style.transform = transformStyle;

	      currentState = newState;
	    }
    
	    function getGesturePointFromEvent(evt) {
	      var point = {};

	      if(evt.targetTouches) {
	        point.x = evt.targetTouches[0].clientX;
	        point.y = evt.targetTouches[0].clientY;
	      } else {
	        // Either Mouse event or Pointer Event
	        point.x = evt.clientX;
	        point.y = evt.clientY;
	      }

	      return point;
	    }
    
	    function onAnimFrame() {
	      if(!isAnimating) {
	        return;
	      }
	      
	      var differenceInX = initialTouchPos.x - lastTouchPos.x;
	      
	      var newXTransform = (currentXPosition - differenceInX)+'px';
	      var transformStyle = 'translateX('+newXTransform+')';
	      swipeFrontElement.style['-webkit-transform'] = transformStyle;
	      swipeFrontElement.style['-moz-transform'] = transformStyle;
	      swipeFrontElement.style.transform = transformStyle;
	      
	      isAnimating = false;
	    }

			// Check if pointer events are supported.
	    if (window.PointerEventsSupport) {
	      // Add Pointer Event Listener
	      swipeFrontElement.addEventListener(pointerDownName, this.handleGestureStart, true);
	    } else {
	      // Add Touch Listener
	      swipeFrontElement.addEventListener('touchstart', this.handleGestureStart, true);
	      
	      // Add Mouse Listener
	      swipeFrontElement.addEventListener('mousedown', this.handleGestureStart, true);
	    }   
		}

    var swipeRevealItems = [];

    window.onload = function () {
      var swipeRevealItemElements = document.querySelectorAll('.swipe-element');
      for(var i = 0; i < swipeRevealItemElements.length; i++) {
        swipeRevealItems.push(new SwipeRevealItem(swipeRevealItemElements[i]));
      }

      // We do this so :active pseudo classes are applied.
      window.onload = function() {
        if(/iP(hone|ad)/.test(window.navigator.userAgent)) {
          document.body.addEventListener('touchstart', function() {}, false);
        }
      };
    };

    window.onresize = function () {
      for(var i = 0; i < swipeRevealItems.length; i++) {
        swipeRevealItems[i].resize();
      }
    };


    var swipeFronts = document.querySelectorAll('.swipe-front');
    for(var i = 0; i < swipeFronts.length; i++) {
      swipeFronts[i].addEventListener('touchstart', function(){
        sampleCompleted('touch-demo-1.html-SwipeFrontTouch');
      });
    }

    var isCompleted = {};
    function sampleCompleted(sampleName){
      if (!isCompleted.hasOwnProperty(sampleName)) {
        isCompleted[sampleName] = true;
      }
    }

    

	}]);
  
  /********************************************************************
   *
   *                            Directives
   *
   ********************************************************************/
	app.directive('swipejs', function() {
	  return function(scope, element, attrs) {
	    scope.createSwipe = function() {
	    	scope.swipe = Swipe(element[0], {
		    	startSlide: 0,
				  speed: 400,
				  auto: 0,
				  continuous: false,
				  disableScroll: false,
				  stopPropagation: false,
				  callback: function(index, elem) {
				  	//scope.callback(index);
				  },
				  transitionEnd: function(index, elem) {
				  	scope.callback(index);
				  }
		    });
	    };
	    scope.prevSlide = function() {
    		scope.swipe.prev();
    	};
    	scope.nextSlide = function() {
	    	scope.swipe.next();
	    };

	    $(document).keyup(function (e) {
	    	if(e.which === 37) {
	    		scope.prevSlide();
	    	}
	    	if(e.which === 39) {
	    		scope.nextSlide();
	    	}
			});
			/*
			.keydown(function (e) {
		    if(e.which === 37){
		    	console.log('keydown left arrow');
		    	isCtrl=true;
		    }
		    if(e.which === 39) {
	    		console.log('keydown right arrow');
	    		isCtrl=false;
	    	}
			});
			//*/
	  };
	});

	/********************************************************************
   *
   *                            Feed Reader
   *
   ********************************************************************/
  app.controller("FeedCtrl", ['$scope', 'httpService', function ($scope, httpService) {
   	$scope.loadButonText = "Load";
   	$scope.posts;

   	httpService.getBlogPosts().
   	success(function(data, status, headers, config) {
   		console.log('posts', data);

   		$scope.posts = data.items;
   	}).
   	error(function(data, status, headers, config) {
	  });

	  httpService.getBlog().
   	success(function(data, status, headers, config) {
   		console.log('blog', data.items);

   		$scope.blog = data.items;
   	}).
   	error(function(data, status, headers, config) {
	  });
	}]);

	app.service('httpService', ['$http', '$q', function ($http, $q) {
		var self = this;
		
		// Request an API Key for the Blogger API from 
	  // https://code.google.com/apis/console/
	  var apikey = "AIzaSyBwh5B3d-nVf8Ut6mf690Id5miFFQ01s0M";
	  
	  // You can find the blogId in the HTML source of a blog
	  var blogId = "1357003820482584675";

	  self.getBlog = function() {
	  	var url = 'https://www.googleapis.com/blogger/v3/blogs/' +
	    blogId + '?key=' + apikey + '&callback=JSON_CALLBACK';
	    
	    //console.log(url);
	    return $http.jsonp(url);
	  };
		self.getBlogPosts = function() {     
	    var url = 'https://www.googleapis.com/blogger/v3/blogs/' +
	    blogId + '/posts?maxPosts=9999&key=' + apikey + '&callback=JSON_CALLBACK';
	    
	    //console.log(url);
	    return $http.jsonp(url);
		};
		self.getLabeledPost = function(label) {
			var url = 'https://www.googleapis.com/blogger/v3' +
			'/blogs/' + blogId + 
			'/posts?maxResults=20' +
			'&labels=' + label +
			'&fields=nextPageToken,items(title,published,labels,content)'+
			'&key='+ apikey + '&callback=JSON_CALLBACK';

			//console.log(url);
	    return $http.jsonp(url);
		};

		var recursiveContainer = {
			items : new Array()
		};
		var mainLabel;
		var deferred;

		var recursiveGet = function(label, nextPageToken) {
			var url = 'https://www.googleapis.com/blogger/v3' +
			'/blogs/' + blogId + 
			'/posts?maxResults=20';
			if (nextPageToken) {
                //console.log('loading next page', url);
				url += '&pageToken='+ nextPageToken;
                //console.log('after next page', url);
			}
			url += '&labels=' + mainLabel +
			'&fields=nextPageToken,items(title,published,labels,content)'+
			'&key='+ apikey + '&callback=JSON_CALLBACK';

			//console.log('>>recursiveGet<<', mainLabel, nextPageToken, url);
	    $http.jsonp(url).
   		success(function(data, status, headers, config) {
   			//console.log('recursive', data);
   			//recursiveContainer.items.push(data.items);
   			recursiveContainer.items.push.apply(recursiveContainer.items, data.items);
   			if(data.nextPageToken) {
   				recursiveGet(mainLabel, data.nextPageToken);
          //console.log('resolve', recursiveContainer);
          //deferred.resolve(recursiveContainer);
   			} else {
          //console.log('resolve', recursiveContainer);
   				deferred.resolve(recursiveContainer);
   			}
	   	}).
	   	error(function(data, status, headers, config) {
		  });
		};

		self.getLabeledPostRecursive = function(label, nextPageToken) {
      self.resetRecursiveGet();

			deferred = $q.defer();
			mainLabel = label;

			recursiveGet();

			return deferred.promise;
		};

    self.resetRecursiveGet = function() {
      deferred = $q.defer();
			mainLabel = '';
      recursiveContainer = {
		    items : new Array()
	    };
    };
		/*
		page tokens
		CgkIChiA45D1nigQ48DZtY_5wuoS
		CgkIChiE_-DznigQ48DZtY_5wuoS

		//*/
	}]);

	/********************************************************************
   *
   *                            Animations
   *
   ********************************************************************/

})();