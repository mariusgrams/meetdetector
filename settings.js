document.addEventListener("DOMContentLoaded", () => {
	  console.log(`Settings page loaded!`);
	
      const mqttEnabledCheckbox = document.getElementById("mqtt-enabled");
      const mqttSettings = document.getElementById("mqtt-settings");

      const httpEnabledCheckbox = document.getElementById("http-enabled");
      const httpSettings = document.getElementById("http-settings");

      const saveButton = document.getElementById("save-settings");

      // generate a random Client ID for MQTT if not already set
      const generateRandomClientId = () => `client-${Math.random().toString(16).substring(2, 10)}`;

      // load saved settings
      chrome.storage.local.get([
        "mqttEnabled", "mqttBroker", "mqttTopic", "mqttClientId", "mqttUsername", "mqttPassword", "httpEnabled", "httpUrl", "httpPayload", "httpParameterType", "httpParameterValue"
      ], (settings) => {
        mqttEnabledCheckbox.checked = settings.mqttEnabled || false;
        httpEnabledCheckbox.checked = settings.httpEnabled || false;

        document.getElementById("mqtt-broker").value = settings.mqttBroker || "";
        document.getElementById("mqtt-topic").value = settings.mqttTopic || "";
        document.getElementById("mqtt-client-id").value = settings.mqttClientId || generateRandomClientId();
        document.getElementById("mqtt-username").value = settings.mqttUsername || "";
        document.getElementById("mqtt-password").value = settings.mqttPassword || "";

        document.getElementById("http-url").value = settings.httpUrl || "";

        updateSectionVisibility();
      });

      // toggle settings visibility
      mqttEnabledCheckbox.addEventListener("change", updateSectionVisibility);
      httpEnabledCheckbox.addEventListener("change", updateSectionVisibility);

      function updateSectionVisibility() {
        mqttSettings.style.display = mqttEnabledCheckbox.checked ? "block" : "none";
        httpSettings.style.display = httpEnabledCheckbox.checked ? "block" : "none";
      }

      // save settings
      saveButton.addEventListener("click", () => {
        const settings = {
          mqttEnabled: mqttEnabledCheckbox.checked,
          mqttBroker: document.getElementById("mqtt-broker").value,
          mqttTopic: document.getElementById("mqtt-topic").value,
          mqttClientId: document.getElementById("mqtt-client-id").value,
          mqttUsername: document.getElementById("mqtt-username").value,
          mqttPassword: document.getElementById("mqtt-password").value,
          httpEnabled: httpEnabledCheckbox.checked,
          httpUrl: document.getElementById("http-url").value,
        };

        chrome.storage.local.set(settings, () => {
          alert("Settings saved successfully!");
        });
		
		// notify background class
		chrome.runtime.sendMessage('updatedSettings', (response) => {
          console.log('received user data', response);
        });
		
      });
    });