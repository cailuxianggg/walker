const WalkContract = function () {

  LocalContractStorage.defineMapProperties(this, {
    walkData: null,
    enrollData: null,
    enrollMapper: null,
    userInfo: null,
    walkBalance:null,
    walkHistory:null,
    freeWalk: null
  });
  LocalContractStorage.defineProperties(this, {
    admin: null,
    cycle: null,
    enrollSize: null,
    balance: null
  });
}
WalkContract.prototype = {
  init: function () {
    this.admin = Blockchain.transaction.from;
    this.cycle = 0;
    this.balance = 0;
    this.enrollSize = 0;
    // this.enrollWalk(1,"2018-06-19");
  },
  //登记参加步行
  enrollWalk: function (type, date) {
    const from = Blockchain.transaction.from;
    const enrollMapper = this.enrollMapper;
    const enrollSize = this.enrollSize;
    const enroll = {
      type,
      date,
      from,
      step: 0
    };
    if (!enrollSize || enrollSize === 0) {
      this._createEnroll(0, enroll, date);
      return "success";
    }
    const info = enrollMapper.get(enrollSize - 1);
    if (info == null) {
      this._createEnroll(enrollSize - 1, enroll, date);
      return "success";
    }
  },
  //免费参加步行
  // freeWalk: function (date) {
  //   const type = 1
  //   const from = Blockchain.transaction.from;
  //   const hasFrom = this.freeWalk.get(from);
  //   if(hasFrom){
  //     throw new Error("no free");
  //   }
  //   this.freeWalk.set(from,true);
  //   const enrollMapper = this.enrollMapper;
  //   const enrollSize = this.enrollSize;
  //   const enroll = {
  //     type,
  //     date,
  //     from,
  //     step: 0
  //   };
  //   if (enrollSize === 0) {
  //     this._createEnroll(0, enroll, date);
  //     return "success";
  //   }
  //   const info = enrollMapper.get(enrollSize - 1);
  //   if (info == null) {
  //     this._createEnroll(enrollSize - 1, enroll, date);
  //     return "success";
  //   }
  // },
  getCurrentInfo: function(date) {
    const enrollMapper = this.enrollMapper;
    const enrollSize = this.enrollSize;
    const result = { success: false };
    debugger
    for(var i = enrollSize - 1; i>=0;i--){
      const oDate = enrollMapper.get(i);
      if(oDate == date){
        result.cycle = i + 1;
        result.balance = this.walkBalance.get(i);
        result.success = true;
        return result;
      }
    }
    return result;
  },
  checkEnroll: function (date) {
    const from = Blockchain.transaction.from;
    let list = this
      .walkData
      .get(date);
    if (!list) {
      return false;
    }
    const filter = list.filter(item => item.from === from);
    if (filter.length != 0) {
      const enroll = filter[0];
      enroll.cycle = this.enrollSize - 1
      return enroll
    }
    return false
  },
  //创建步行记录
  _createEnroll: function (index, enroll, date) {
    const value = Blockchain.transaction.value;
    // const value = 100000000000000000;
    let list = this
      .walkData
      .get(date);
    if (!list) {
      list = [];
    }
    if (this.checkEnroll(date)) {
      throw new Error("user has enroll");
    } else {
      list.push(enroll);
    }
    this
      .walkData
      .set(date, list);
    this
      .enrollMapper
      .set(index, date);
    let balance = this.walkBalance.get(index);
    debugger
    if(!balance){
      balance = 0;
    }
    this.walkBalance.set(index,balance + value);
    this.enrollSize = index + 1;
  },
  uploadWalkInfo: function (date, step) {
    const from = Blockchain.transaction.from;
    let list = this
      .walkData
      .get(date);
    if (!list) {
      throw new Error("walk info is null");
    }
    let isChange = false;
    const newList = list.map((item, index) => {
      if (item.from === from) {
        item.step = step;
        isChange = true;
      }
      return item;
    });
    if (!isChange) {
      throw new Error("user not enroll")
    }
    this
      .walkData
      .set(date, newList);
  },
  takeOutBalance: function (amount) {
    if (Blockchain.transaction.from !== this.admin) {
      throw new Error("No permission!");
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Parameter error!");
    }
    amount = NAS2WEI(amount);

    var result = Blockchain.transfer(this.admin, amount);
    if (!result) {
      throw new Error("takeOutBalance failed:" + this.admin + "," + amount);
    }
    this.balance -= amount;
    return true;
  },
  register:function(userName){
    const from = Blockchain.transaction.from;
    const user = {
      userName,from
    }
    this.userInfo.set(from,user);
    return user;
  },
  login: function(){
    const from = Blockchain.transaction.from;
    const user = this.userInfo.get(from);
    if(!user){
      this.userInfo.set(from,from)
      return from;
    }
    return user
  },
  bonus:function(date){
    const from = Blockchain.transaction.from;
    if(from !== this.admin){
      throw new Error("no premission")
    }
    const walkData = this.walkData.get(date);
    const enrollSize = this.enrollSize;
    let history = this.walkHistory.get(date);
    if(history && history.length != 0){
      throw new Error("A bonus has been paid");
    }
    history = [];
    for(var i= enrollSize -1;i>=0;i--){
      const oDate = this.enrollMapper.get(i);
      if(oDate == date){
        const balance = this.walkBalance.get(i);
        if(balance != 0){
          const bonus = balance/walkData.length
          walkData.map(item => {
            const result = this.transfer(item.from,bonus);
            if(result){
              history.push({
                bonus,
                from
              })
            }else{
              throw new Error("transfer error");
            }
          })
        }
        this.walkHistory.set(date,history);
        return true;
      }
    }
    throw new Error("not match date:" + date);
  },
  getWalkBalance:function(date){
    const enrollSize = this.enrollSize;
    for(var i= enrollSize -1;i>=0;i--){
      const oDate = this.enrollMapper.get(i);
      if(oDate == date){
        const balance = this.walkBalance.get(i);
        return balance;
      }
    }
    throw new Error("no match date:"+date);
  },
  getMineBonus:function(){
    const from = Blockchain.transaction.from;
    const enrollSize = this.enrollSize;
    const result = [];
    for(var i= enrollSize -1;i>=0;i--){
      const oDate = this.enrollMapper.get(i);
      const walkHistory = this.walkHistory.get(oDate);
      if(!walkHistory){
        continue;
      }
      walkHistory.map(item => {
        if(item.from === from){
          result.push(item)
        }
      })
    }
    return result;
  },
  _transfer: function(address, value) {
   var result = Blockchain.transfer(address, value);
   return result;
  }
}
module.exports = WalkContract;