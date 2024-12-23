function sendHttpPostMessage(isInMeet) {
  chrome.storage.local.get(["httpEnabled", "httpUrl"], (settings) => {
	// only send notification when HTTP Post is enabled
	if (settings.httpEnabled) {
		
	  // send HTTP-POST request
	  fetch(settings.httpUrl, {
		method: "POST",
		mode: 'no-cors',
		headers: {
		  "Content-Type": "application/json"
		},
		body: JSON.stringify({isInMeet})
	  }).catch((error) => {
		  console.error("Error by sending HTTP Post request", error);
		});
	}
  });
}

function checkMeetState() {
  // read old state
  chrome.storage.local.get(["isInMeeting"], function(state){
	  const oldIsInMeeting = state.isInMeeting;
	  newIsInMeetingState = false;
	  
	  // check all tabs if we are in a meeting
	  chrome.tabs.query({}, (tabs) => {
	    tabs.forEach((tab) => {
		  const newIsGoogleMeet = tab.url.includes("https://meet.google.com/");
		  
		  // only set state when we have not yet found a meeting side
		  if (newIsInMeetingState == false) 
		  {  
			newIsInMeetingState = newIsGoogleMeet;
		  }
		});
		
		  // check if state has changed
		  if (newIsInMeetingState == oldIsInMeeting) {
			  return;
		  }
			
		  // send new state
		  sendHttpPostMessage(newIsInMeetingState);
		  
		  // save new state
		  chrome.storage.local.set({"isInMeeting": newIsInMeetingState}, () => {
			console.log(`Meeting state changed to: ${newIsInMeetingState}`);
		  });
      });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) { 
    checkMeetState();
  }
});

chrome.tabs.onActivated.addListener(() => { 
  checkMeetState();
});

chrome.tabs.onRemoved.addListener((tabId, windowInfo) => {
  checkMeetState();	
});

checkMeetState();