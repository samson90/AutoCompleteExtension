var currentRequest = 0;

chrome.runtime.onMessage.addListener(function(message, MessageSender, sendResponse){
	// populate the textarea with the suggested word.
	var index = 1;
	if (message.action == 'select_second_word'){
		index = 2;
	}
	else if (message.action == 'select_third_word'){
		index = 3;
	}
	var descriptor = '#predicted-words li:nth-child(' + index + ')';
	var word = $(descriptor).html();

	var textArea = $('textarea.current-textarea');
	textArea.val(textArea.val() + word);
})

function getPredictedWords(searchTerm, callback, errorCallback) {
	// call the api to get the predicted words list.
	var searchUrl = 'http://0.0.0.0:5000/autocomplete/api/v1.0/words/' + 
		encodeURI(searchTerm);
	var x = new XMLHttpRequest();
	x.open('GET', searchUrl, true);
	// Get the response in json
	x.onload = function() {
	// Parse and process the response
		var words = JSON.parse(x.responseText);
		callback(words.words, currentRequest);
	};
	x.onerror = function() {
		alert('Cannot acquire words');
	};
	x.send();
}

function getPredictedWordsOuter(outputValue){
	if (outputValue.length == 0)
	{
		outputValue = 'START';
	}

    getPredictedWords(outputValue, function(words, requestID) {
    	if (requestID >= currentRequest){
	      	var wordsList = document.getElementById('predicted-words');
	      	wordsList.innerHTML = '';

	      	// loop through the list of words and add them to the list.
	      	for(var i = 0; i < words.length; i++){
	        	var li = document.createElement('li');
	        	li.appendChild(document.createTextNode(words[i].word));
	        	wordsList.appendChild(li);
	     	}
		}
    }, function(errorMessage) {
    	alert('Cannot acquire words');
    });	
}

function showWordBubble(textArea){
	// position the bubble according to where the cursor is.
	var textAreaOffset = $(textArea).offset();
	textLines = textArea.value.substr(0, textArea.selectionStart).split('\n');
	var coordinates = getCaretCoordinates(textArea, textArea.selectionEnd);

	bubbleDOM.style.top = textAreaOffset.top + coordinates.top + 20 + 'px';
	bubbleDOM.style.left = textAreaOffset.left + coordinates.left + 'px';
	bubbleDOM.style.visibility = 'visible';	
}

function showWords(){
	showWordBubble(this);

	$(this).addClass('current-textarea');
	currentRequest++;

	// Get the predicted words from the api in json format.
	getPredictedWordsOuter(this.value);
}

function hideWords(){
	bubbleDOM.style.visibility = 'hidden';
	$(this).removeClass('current-textarea');
}

function predictWords(evt){
	showWordBubble(this);

	// Position the bubble to the middle of the screen.
	var outputValue = ''
	if (evt.keyCode == 32){ 
		// user presses space bar.
		outputValue = this.value
	}
	else if (evt.keyCode == 8){
		// user pressed the back space.
		// remove that last character from the input.
		outputValue = this.value.substring(0, this.value.length - 1);

		// show all the text from before the last space
		var n = outputValue.lastIndexOf(' ');
		outputValue = outputValue.substring(0, n);
	}

	if (outputValue.length > 0){
		currentRequest++;

		// Get the predicted words from the api in json format.
		getPredictedWordsOuter(outputValue, currentRequest);
	}
}

// Add the predicted words bubble to the top of the screen
var bubbleDOM = document.createElement('div');
bubbleDOM.setAttribute('class', 'words_bubble');
var wordsList = document.createElement('ul');
bubbleDOM.appendChild(wordsList);
wordsList.setAttribute('id', 'predicted-words');
document.body.appendChild(bubbleDOM);

// add an event listener to textareas as well.
var textareas = document.getElementsByTagName('textarea');
for (var i = 0; i < textareas.length; i++){
	textareas[i].onkeydown = predictWords;
	textareas[i].onfocus = showWords;
	textareas[i].onblur = hideWords;
}