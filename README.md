# Online Meeting Status Notifier

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Technology](https://img.shields.io/badge/technology-JavaScript-orange)
![Manifest](https://img.shields.io/badge/Manifest-Version%203-blue)

## 🚀 Overview

The **Online Meeting Status Notifier** is a powerful Chrome Extension designed to help you automatically detect when you're in an online meeting. The extension supports a variety of online meeting platforms and can send status updates via **MQTT** or **HTTP POST requests** to your configured systems.  

This tool is ideal for automating your meeting status notifications for IoT devices, workflow automation, or integration into custom systems.

## ✨ Features

- 🔎 **Automatic meeting detection** across popular online meeting platforms.
- 🔗 **MQTT support** for real-time status updates to IoT devices.
- 🌐 **HTTP POST integration** to notify external systems.
- 🛠 **Customizable settings** for MQTT broker details and HTTP endpoints.
- 📋 **Status tracking**:
  - **In a meeting**: Sends a notification when you join or leave a meeting.
  - **Meeting duration**: Sends a notification when the meeting is over, how long it took.
- 🔔 **Lightweight and efficient**, adhering to Chrome Manifest V3 standards.

## 🌍 Supported Platforms

The extension currently supports the following online meeting platforms:

 ✔️ Google Meet 

Planned:
- [x] Zoom  
- [x] Microsoft Teams  
- [x] Webex  
- [x] Skype  
- [x] Slack Calls  
- [x] Jitsi Meet  
- [x] BlueJeans  
- [x] GoToMeeting  

> More platforms can be added upon request or future updates.

## 📦 Installation

1. Clone this repository to your local machine:
```bash
https://github.com/mariusgrams/meetdetector
```
2. Enable the developer mode

3.  Extension import
Go to "chrome://extensions/" and click import extension
