import moment from 'moment';
import _ from 'lodash';
import {reactLocalStorage} from 'reactjs-localstorage';
import {graphColors, metricColor} from '../constants';
import {getStockData} from './requests';

const {requestUrl} = require('../localConfig');

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

export const checkErrorForTokenExpiry = (error, history, fromUrl) => {
    const name = _.get(error, 'response.data.name', '');
    const message = _.get(error, 'response.data.message', '');
    if(name==='TokenExpiredError' || message==='jwt expired'){
        if (this.loggedInUserinfo.recentTokenUpdateTime
            && (moment().valueOf() < ((5*60*1000) + this.loggedInUserinfo.recentTokenUpdateTime)) ){
            return;
        } else{
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

export class Utils{

	static loggedInUserinfo = reactLocalStorage.getObject('USERINFO');
	static userInfoString = "USERINFO";
	static webSocket;

	static setLoggedInUserInfo(object){
		this.loggedInUserinfo = object;
	}

	static setShouldUpdateToken(status){
		this.localStorageSave('SHOULDUPDATETOKEN', status);
	}

	static getShouldUpdateToken(){
		// console.log(this.getFromLocalStorage('SHOULDUPDATETOKEN'));
		return this.getFromLocalStorage('SHOULDUPDATETOKEN');
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
					&& (moment().valueOf() < ((5*60*1000) + this.loggedInUserinfo.recentTokenUpdateTime)) ){
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

	static getBaseUrl(){
		return requestUrl;
		// return "https://api.aimsquant.com/api/v2";
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

	static isLoggedIn(){
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
			return true;
		}else{
			return false;
		}
	}

	static getAuthToken(){
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
		if (this.loggedInUserinfo && this.loggedInUserinfo['_id']){
			return this.loggedInUserinfo['_id'];
		}else{
			return "";
		}
	}

	static getUserInfo(){
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
    
	static formatMoneyValueMaxTwoDecimals(value){
		if (value){
			var x=value.toString();
			var afterPoint = '';
			if(x.indexOf('.') > 0)
			   afterPoint = x.substring(x.indexOf('.'),x.length);
			x = Math.floor(x);
			x=x.toString();
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if(otherNumbers !== '')
			    lastThree = ',' + lastThree;
			return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
		}else{
			return value;
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

}

export const getBreadCrumbArray = (array = [], item = []) => {
	return [
		{name: 'Home', url: '/home'},
		...array,
		...item
	];
}

export * from './requests';