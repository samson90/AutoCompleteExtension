// send the command to the active page.
chrome.commands.onCommand.addListener(function(command){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {action: command}, 
			function(response){});
	});
});