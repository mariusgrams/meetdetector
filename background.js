importScripts('libs/mqtt.min.js');
const MQTT = mqtt;
mqttClient = null;

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
	console.log(`is MQTT enabled: ${isMqttEnabled}`);
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

function sendMqttMessage(isInMeet) {
  chrome.storage.local.get(["mqttEnabled", "mqttBroker", "mqttTopic"], (settings) => { 
    const isMqttEnabled = settings.mqttEnabled == true;
    if (isMqttEnabled && mqttClient) {
	  mqttClient.publish(settings.mqttTopic, `${isInMeet}`);
	  console.log(`sendMqttMessage() published`);  
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
  // read old state
  chrome.storage.local.get(["isInMeeting"], function(state){
	  const oldIsInMeeting = state.isInMeeting;
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
			
		  // send new state
		  sendHttpPostMessage(newIsInMeetingState);
		  sendMqttMessage(newIsInMeetingState);
		  
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