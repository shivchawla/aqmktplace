import moment from 'moment';
import _ from 'lodash';
import {reactLocalStorage} from 'reactjs-localstorage';
import {graphColors, metricColor} from '../constants';
import {getStockData} from './requests';

const {requestUrl, webSocketUrl} = require('../localConfig');

export const dateFormat = 'Do MMMM YYYY';

export const getUnixTimeSeries = (data) => {
    return new Promise((resolve, reject) => {
        const benchmarkArray = _.toPairs(data).sort();
        const unixBenchmarkArray = benchmarkArray.map((item, index) => {
            const timeStamp = moment(item[0], 'YYYY-MM-DD').valueOf();
            return [timeStamp, item[1]];
        });
        resolve(unixBenchmarkArray);
    });
};

export const getUnixStockData = (data) => {
    return new Promise((resolve, reject) => {
        getStockData(data)
        .then(response => {
            resolve(getUnixTimeSeries(response.data.priceHistory.values));
        })
    })
}

export const getStockPerformance = (tickerName) => {
    return new Promise((resolve, reject) => {
        getStockData(tickerName)
        .then(performance => {
            const data = performance.data.priceHistory;
            if (data.length > 0) { // Check if ticker is valid
                const performanceArray = data.map((item, index) => {
                    return [moment(item.date).valueOf(), item.price]
                });
                resolve(performanceArray);
            } else {
                reject('Invalid Ticker');
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

export const convertToPercentage = value => {
    return Number((100 * value).toFixed(2));
}

// tickers = ['TCS', 'WIPRO', 'LT']
export const generateColorData = (tickers => {
    let obj = {};
    tickers.map((ticker, index) => {
        obj[ticker] = graphColors[index];
    });

    return obj;
});

export const getMetricColor = metricValue => {
    return metricValue < 0 ? metricColor.negative : metricColor.positive;
};

export class Utils{

	static loggedInUserinfo = reactLocalStorage.getObject('USERINFO');
	static userInfoString = "USERINFO";
	static webSocket;
	static numAttempts = 0;

	static setLoggedInUserInfo(object){
		this.loggedInUserinfo = object;
	}

	static setShouldUpdateToken(status){
		this.localStorageSave('SHOULDUPDATETOKEN', status);
	}

	static getShouldUpdateToken(){
		return this.getFromLocalStorage('SHOULDUPDATETOKEN');
	}

	static getAnnouncementUrl(){
		return "/assets/community/announcement.json";
	}

	static getPolicyTxtUrl(){
		return "/assets/policy/privacy.txt";
	}

	static getHelpUrl(){
		return "/assets/help/data_help.json";
	}

	static getBenchMarkUrl(){
		return "/assets/benchmark/benchmark.json";
	}

	static getTutorialUrl(){
		return "/assets/help/data_tutorial.json";
	}

	static getTncUrl(){
		return "/assets/policy/tnc.txt";
	}

	static goToLoginPage(history, fromUrl){
		if (fromUrl){
			this.localStorageSave('redirectToUrlFromLogin', fromUrl);
		}
		if (history){
			Utils.logoutUser();
			history.push('/login');
		}
	}

	static checkErrorForTokenExpiry(error, history, fromUrl){
		if (error && error.response && error.response.data){
			if(error.response.data.name==='TokenExpiredError' ||
				error.response.data.message==='jwt expired'){
				if (this.loggedInUserinfo.recentTokenUpdateTime
					&& (moment().valueOf() < ((60*1000) + this.loggedInUserinfo.recentTokenUpdateTime)) ){
					return;
				}else{
					this.setShouldUpdateToken(true);
					history.push('/tokenUpdate?redirectUrl='+encodeURIComponent(fromUrl));
				}
			}else{
				// if (fromUrl && history){
				// 	history.push(fromUrl);
				// }else if (history){
				// 	history.push('/login');
				// }
				// Utils.logoutUser();
			}
		}
	}

	static getRedirectAfterLoginUrl(){
		const url = this.getFromLocalStorage('redirectToUrlFromLogin');
		this.localStorageSave('redirectToUrlFromLogin', '');
		if (url && url.trim().length > 0){
			return url.trim();
		}else{
			return undefined;
		}
	}

	static logoutUser(){
		this.localStorageSaveObject('USERINFO', {});
		this.setLoggedInUserInfo({});
	}

	static localStorageSave(key, value){
		reactLocalStorage.set(key, value);
	}

	static getFromLocalStorage(key){
		return reactLocalStorage.get(key);
	}

	static localStorageSaveObject(key, value){
		reactLocalStorage.setObject(key, value);
	}

	static getObjectFromLocalStorage(key){
		return reactLocalStorage.getObject(key);
	}	

	static isLoggedIn() {
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']) {
			return true;
		}else{
			return false;
		}
	}

	static getAuthToken(){
		this.loggedInUserinfo = reactLocalStorage.getObject('USERINFO');
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
			return this.loggedInUserinfo['token'];
		}else{
			return "";
		}
	}

	static getAuthTokenHeader(headers){
		let headersLocal = headers;
		if(!headersLocal){
			headersLocal = {};
		}
		if (this.isLoggedIn()){
			headersLocal['aimsquant-token'] = this.getAuthToken();
		}
		return headersLocal;
	}

	static getUserId(){
		this.loggedInUserinfo = reactLocalStorage.getObject('USERINFO');
		if (this.loggedInUserinfo && this.loggedInUserinfo['_id']){
			return this.loggedInUserinfo['_id'];
		}else{
			return "";
		}
	}

	static getUserInfo(){
		this.loggedInUserinfo = reactLocalStorage.getObject('USERINFO');
		if (this.loggedInUserinfo){
			return this.loggedInUserinfo;
		}else{
			return {};
		}
	}

	static updateUserToken(newToken){
		this.loggedInUserinfo['token'] = newToken;
		this.loggedInUserinfo['recentTokenUpdateTime'] = moment().valueOf();
		this.localStorageSaveObject('USERINFO', this.loggedInUserinfo);
	}

	static getLoggedInUserName(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.firstName + " " + data.lastName;
		}
		return stringy;
	}

	static getLoggedInUserEmail(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.email;
		}
		return stringy;
	}

	static getLoggedInUserInitials(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = this.getInitials(data.firstName, data.lastName);
		}
		return stringy;
	}

	static getInitials(firstName, lastName){
		let returnString = "";
		if (firstName && firstName.trim().length > 0){
			returnString = returnString + firstName.trim().slice(0, 1).toUpperCase();
		}
		if (lastName && lastName.trim().length > 0){
			returnString = returnString + lastName.trim().slice(0, 1).toUpperCase();
		}
		return returnString;
	}

	static getReactQuillEditorModules(){
		const modules = {
		      toolbar: [
		        [{ 'header': [1, 2, 3, false] }],
		        ['bold', 'italic', 'underline','strike', 'blockquote', 'code-block'],
		        [{'list': 'ordered'}, {'list': 'bullet'}],
		        ['link'],
		        ['clean']
		      ],
		    };
		return modules;
	}

	static formatMoneyValueMaxTwoDecimals(value){
		if (value){
			var x = (value/100000) > 1.0 ? value.toFixed(0) : value.toFixed(2);
			var afterPoint = '';
			if(x.indexOf('.') > 0)
			   afterPoint = x.substring(x.indexOf('.'),x.length);
			x = Math.floor(x);
			x=x.toString();
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if(otherNumbers !== '' && otherNumbers !== '-')
			    lastThree = ',' + lastThree;
			return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
		}else{
			return value;
		}
	}

	static openSocketConnection() {
		if (!this.webSocket || this.webSocket.readyState != WebSocket.OPEN) {
			if (this.webSocket) {
				try{
					this.webSocket.close();
				} catch(err){}
			}

			this.webSocket = new WebSocket(webSocketUrl);
			
			if (this.webSocket && this.webSocket.readyState == WebSocket.CLOSED) {
				// console.log('Server unavailable');
				this.numAttempts++;
				var timeOut = Math.min(2 * Utils.numAttempts * 1000, 20000)
				setTimeout(() => {
					Utils.openSocketConnection()
				}, timeOut);
			}

			this.webSocket.onclose = () => {
				// console.log('Connection Closed');
				this.numAttempts++;
				var timeOut = Math.min(2 * Utils.numAttempts * 1000, 20000)
				setTimeout(() => {
					Utils.openSocketConnection()
				}, timeOut);
			}

			this.webSocket.onopen = () => {
				// console.log('Connection Established');
				this.numAttempts = 0;
			}
		}
	}

	static closeWebSocket(){
		try{
			this.webSocket.close();
		}catch(err){}
		this.webSocket = undefined;
	}

	static sendWSMessage(msg) {
		if (this.webSocket && this.webSocket.readyState == 1) {
			this.webSocket.send(JSON.stringify(msg));
		}
	}

	static firstLetterUppercase(stringy){
		if (stringy && stringy.length > 0){
			return stringy[0].toUpperCase() + stringy.substring(1);
		}else{
			return '';
		}
	}

	static getStringWithNoSpaces(stringy){
		if (stringy){
			return stringy.replace(/\s+/g, "");
		}else{
			return "";
		}
	}

	static getLowerCasedNoSpaces(stringy){
		if (stringy){
			return this.getStringWithNoSpaces(stringy).toLowerCase();
		}else{	
			return "";
		}
	}

	static saveCommunitySearchString(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['searchString'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityTab(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['tabs'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityCheckBox(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['checkboxes'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static getCommunitySearchString(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.searchString){
			return savedData.searchString;
		}
		return '';
	}
	static getCommunityTab(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.tabs){
			return savedData.tabs;
		}
		return '';
	}
	static getCommunityCheckBox(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.checkboxes){
			return savedData.checkboxes;
		}
		return '';
	}

	static computeLatestPerformanceSummary(eodPerformanceSummary, currentPortfolioPnlStats) {
		var obj = Object.assign(eodPerformanceSummary, currentPortfolioPnlStats);

		var netValueLatest = _.get(obj, 'netValue', 0);
		var netValueEOD = _.get(obj, 'netValueEOD', 0);

		var dailyNavChangeEODPct =  _.get(obj, 'dailyNAVChangeEODPct', 0);
		var dailyNavChangeLatestPct = netValueEOD > 0.0 ? (netValueLatest - netValueEOD)/netValueEOD : 0.0;
		var dailyNavChangePct = dailyNavChangeLatestPct || dailyNavChangeEODPct;

		var netValue = netValueLatest || netValueEOD;

		//var annualReturnEOD  = _.get(obj, 'annualReturn', 0);
		//var annualReturn = Math.pow((1+annualReturnEOD),(251/252))*(1+dailyNavChangeLatestPct) - 1.0;
		//var totalReturn = (1 + _.get(obj, 'totalReturn', 0))*(1+dailyNavChangeLatestPct) - 1.0;

		//return Object.assign(obj, {annualReturn: annualReturn, totalReturn: totalReturn, netValue:netValue, dailyNavChangePct: dailyNavChangePct});
		return Object.assign(obj, {netValue:netValue, dailyNavChangePct: dailyNavChangePct});

	}

	static checkForInternet (error, history) {
		if (error.message === 'Network Error') {
			history.push('/errorPage');
		}
	}
}

export const getBreadCrumbArray = (array = [], item = []) => {
	return [
		{name: 'Home', url: '/home'},
		...array,
		...item
	];
}

export const convertToDecimal = value => {
	if (typeof(value) !== 'number') {
		return value;
	}
	return Number(value.toFixed(2));
}

export const constructErrorMessage = error => {
	const errorCode = _.get(error.response, 'data.errorCode', 'N/A');
	const message = _.get(error.response, 'data.message', 'N/A');
	return(`${errorCode} - ${message}`);
}

export const checkForInternet = (error, history) => {
	if (error.message === 'Network Error') {
		history.push('/errorPage');
	}
};

setInterval(function(){Utils.openSocketConnection();}, 60000);

export * from './requests';
export * from './portfolio';
export * from './date';