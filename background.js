importScripts('libs/mqtt.min.js');
const MQTT = mqtt;
mqttClient = null;
isRunning = false;

function dissconnectMqtt() {
  if (mqttClient) {
    mqttClient.end();
    console.log('MQTT disconnected');
    mqttClient = null;
  }
}

function connectToMqtt() {
  chrome.storage.local.get(["mqttEnabled", "mqttBroker", "mqttClientId", "mqttUsername", "mqttPassword"], (settings) => {
	// only connect when MQTT is enabled
	const isMqttEnabled = settings.mqttEnabled == true;
	if (isMqttEnabled) {
	  mqttClient = MQTT.connect(settings.mqttBroker, {
        clientId: `${settings.mqttClientId}`,
        keepalive: 2,
	    username: `${settings.mqttUsername}`,
        password: `${settings.mqttPassword}`
      });	
	  
      mqttClient.on('connect', () => console.log('Connected with MQTT broker!'));
      mqttClient.on('error', (err) => console.error('Error:', err));
	}
  });
}

function sendMqttMessage(isInMeet, meetingDuration) {
  chrome.storage.local.get(["mqttEnabled", "mqttBroker", "mqttTopic"], (settings) => { 
    const isMqttEnabled = settings.mqttEnabled == true;
    if (isMqttEnabled && mqttClient) {
	  mqttClient.publish(`${settings.mqttTopic}/inMeeting`, `${isInMeet}`);
	  mqttClient.publish(`${settings.mqttTopic}/duration`, `${meetingDuration}`);
	  console.log(`Mqtt published, inMeet: ${isInMeet}, duration: ${meetingDuration}s`);  
	}
  });
}

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
  if (isRunning == true) {
	return;
  } else {
	isRunning = true;
  }	  
	
  // read old state
  chrome.storage.local.get(["isInMeeting", "timestampMeetingStarted"], (meetingState) => {
	  const oldIsInMeeting = meetingState.isInMeeting;
	  newIsInMeetingState = false;
	  
	  // check all tabs if we are in a meeting
	  chrome.tabs.query({}, (tabs) => {
	    tabs.forEach((tab) => {
		  const newIsGoogleMeet = tab.url.includes("https://meet.google.com/");
		  
		  // only set state when we have not yet found a meeting
		  if (newIsInMeetingState == false) 
		  {  
			newIsInMeetingState = newIsGoogleMeet;
		  }
		});
		
		  // check if state has changed
		  if (newIsInMeetingState == oldIsInMeeting) {
			  return;
		  }
		  
		  // get duration in meeting
		  meetingDuration = 0;
		  if (newIsInMeetingState == true)
		  {
			  timestampMeetingStarted = Date.now();
		  } else {
			  // not in meeting anymore --> calculate duration
			  meetingDuration = Math.trunc((Date.now() - timestampMeetingStarted) / 1000); //ms to sec
		  }
		  
		  const meetingState = {
			  isInMeeting: newIsInMeetingState,
			  timestampMeetingStarted: timestampMeetingStarted,
			};
			
		  // send new state
		  sendHttpPostMessage(newIsInMeetingState);
		  sendMqttMessage(newIsInMeetingState, meetingDuration);
		  
		  // save new state
		  chrome.storage.local.set(meetingState, () => {
			console.log(`Meeting state changed to: ${meetingState.isInMeeting}`);
			isRunning = false;
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'updatedSettings') {
    // settings changed, we need to reconnect to mqtt broker
	dissconnectMqtt();
	connectToMqtt();
  }
});

// start-up
connectToMqtt();
checkMeetState();