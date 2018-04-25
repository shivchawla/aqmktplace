import {reactLocalStorage} from 'reactjs-localstorage';
import moment from 'moment';

class Utils{

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

	static getSocketUrl(){
		return "wss://devaqdashapi.aimsquant.com";
	}

	static getBaseUrl(){
		return "https://devaqdashapi.aimsquant.com/api/v2";
		// return "https://api.aimsquant.com/api/v2";
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
				}else if(fromUrl && fromUrl.indexOf('/community') !== -1){
					this.logoutUser();
					history.push(fromUrl);
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

	static isLoggedIn(){
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
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
			var x=value.toString();
			var startSymbol = '';
			var afterPoint = '';
			if(x.indexOf('.') > 0)
			   afterPoint = x.substring(x.indexOf('.'),x.length);
			x = Math.floor(x);
			x=x.toString();
			if (x.charAt(0) === '-'){
				x=x.substring(1,x.length);
				startSymbol = '-';
			}
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if (afterPoint.length === 0){
				afterPoint = '.00';
			}else if (afterPoint.length === 1){
				afterPoint = afterPoint + '00';
			}else if (afterPoint.length === 2){
				afterPoint = afterPoint + '0';
			}
			if(otherNumbers !== '')
			    lastThree = ',' + lastThree;
			return startSymbol+otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint.substring(0, 3);
		}else if (value ===0){
			return '0.00';
		}else{
			return value;
		}
	}

	static getNumberFromFormattedMoney(moneyString){
		if (moneyString){
			return Number(moneyString.replace(/,/g , "").trim());
		}
		return 0;
	}

	static openSocketConnection(){
		if (this.webSocket){
			try{
				this.webSocket.close();
			}catch(err){}
		}
		this.webSocket = new WebSocket(this.getSocketUrl());
	}

	static closeWebSocket(){
		try{
			this.webSocket.close();
		}catch(err){}
		this.webSocket = undefined;
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

}

export default Utils;
