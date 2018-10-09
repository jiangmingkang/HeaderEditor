import browser from 'webextension-polyfill'

const IS_ANDROID = navigator.userAgent.includes('Android');
const IS_CHROME = /Chrome\/(\d+)\.(\d+)/.test(navigator.userAgent);
const CHROME_VERSION = IS_CHROME ? (() => {
	const a = navigator.userAgent.match(/Chrome\/(\d+)\.(\d+)/);
	return parseFloat(a[1] + '.' + a[2]);
})() : null;
const IS_FIREFOX = !IS_CHROME;
const FIREFOX_VERSION = IS_FIREFOX ? (() => {
	let a = navigator.userAgent.match(/Firefox\/(\d+)\.(\d+)/);
	return parseFloat(a[1] + '.' + a[2]);
})() : null;

export default {
	IS_ANDROID: IS_ANDROID,
	IS_MOBILE: IS_ANDROID,
	IS_FIREFOX: IS_FIREFOX,
	IS_CHROME: IS_CHROME,
	CHROME_VERSION: CHROME_VERSION,
	FIREFOX_VERSION: FIREFOX_VERSION,
	TABLE_NAMES: ['request', 'sendHeader', 'receiveHeader'],
	// Get Active Tab
	getActiveTab() {
		return new Promise(resolve => {
			browser.tabs.query({currentWindow: true, active: true})
			.then(tabs => tabs[0])
			.then(resolve)
		});
	},
	trimNewLines(s) {
		return s.replace(/^[\s\n]+/, "").replace(/[\s\n]+$/, "");
	},
	getURL(url, isPost) {
		return new Promise((resolve, fail) => {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if (xhr.readyState == 4) {
					if (xhr.status >= 400) {
						fail();
					} else {
						resolve(xhr.responseText);
					}
				}
			};
			if (url.length > 2000 || isPost) {
				var parts = url.split("?");
				xhr.open("POST", parts[0], true);
				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				xhr.send(parts[1]);
			} else {
				xhr.open("GET", url, true);
				xhr.send();
			}
		})
	},
	ruleType2tableName(ruleType) {
		if (ruleType === 'cancel' || ruleType === 'redirect') {
			return 'request';
		}
		if (ruleType === 'modifySendHeader') {
			return 'sendHeader';
		}
		if (ruleType === 'modifyReceiveHeader') {
			return 'receiveHeader';
		}
	},
	upgradeRuleFormat(s) {
		if (typeof(s.matchType) === "undefined") {
			s.matchType = s.type;
			delete s.type;
		}
		if (typeof(s.isFunction) === "undefined") {
			s.isFunction = 0;
		}
		if (typeof(s.enable) === "undefined") {
			s.enable = 1;
		}
	},
	t(key, params) {
		var s = browser.i18n.getMessage(key, params)
		return s || key;
	}
}
