import NebPay from 'rn-nebpay';
import contract from '../constants/Contract';
import {
  Linking,
  Alert
} from 'react-native';

var nebPay = new NebPay();
let intervalQuery;
function funcIntervalQuery(serialNumber, cb, count) {
  let index = ++count;
  nebPay.queryPayInfo(serialNumber) //search transaction result from server (result upload to server by app)
    .then(function (resp) {
      var respObject = JSON.parse(resp)
      console.log(respObject)
      if (respObject.msg === 'success' && respObject.code === 0 && respObject.data.status === 1) {
        cb(respObject.data);
        clearTimeout(intervalQuery)
      } else {
        if (index === 6) {
          //cb(resp);
          clearTimeout(intervalQuery)
          return
        }
        intervalQuery = setTimeout(() => {
          funcIntervalQuery(serialNumber, cb, index);
        }, 7000)
      }
    });
}
function superNebPay(method,args,value = 0,callback,error){
  const options = {
    controller: (url) => {
      Linking.openURL(url);
    },
    callback: NebPay.config.mainnetUrl
  }
 const serialNumber = nebPay.call(contract.address,value,method,args,options)
 intervalQuery = setTimeout(() => {
  funcIntervalQuery(serialNumber,callback,0)
  },5000);
}
export const enrollWalk = (type,date,callback,error) => {
  superNebPay(contract.enrollWalk,JSON.stringify([type,date]),0.1,callback,error)
}
export const loginWalker = (callback,error) => {
  superNebPay(contract.login,"[]",0,callback,error)
}
export const isAdmin = (callback,error) => {
  superNebPay(contract.login,"[]",0,callback,error);
}
export const uploadWalk = (date,step,callback) => {
  superNebPay(contract.uploadWalkInfo,JSON.stringify([date,step]),0,callback);
}
export const getCurrentInfo = (date) => {
  return superCall(contract.getCurrentInfo,"[\"" + date + "\"]")
}
export const check = (date,callbck,from) => {
  return superCall(contract.checkEnroll,"[\"" + date + "\"]",from)
}
export const getMineBonus = (from) => {
  return superCall(contract.getMineBonus,"[]",from)
}
const superCall = (fun,args,from) => {
  if(!from){
    from = 'n1GP23KokgmFwEqdVjCjPvchTDgKW9HBgye';
  }
  const params = {
    "from":from,
    "to":contract.address,
    "value":"0",
    "nonce":"1000",
    "gasPrice":"1000000",
    "gasLimit":"2000000",
    "contract":{
      "function":fun,
      "args":args
    }
  }
  console.log(JSON.stringify(params))
  return fetch("https://mainnet.nebulas.io/v1/user/call",{
    method:'POST',
    body:JSON.stringify(params),
    headers:{
      'Content-Type':'application/json'
    }
  }).then(resp => resp.json());
}