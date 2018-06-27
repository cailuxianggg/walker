import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  AsyncStorage,
  ListView,
  Linking,
  WebView,
  Alert,
  View
} from 'react-native';
import { loginWalker,getMineBonus } from '../util/contractUtil';
import Spinner from 'react-native-loading-spinner-overlay';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const listData = ds.cloneWithRows([{
  text:'注册星云链账号', 
  onPress:() =>  Linking.openURL("https://incentive.nebulas.io/cn/signup.html?invite=ghSYs")
},{
  text:'星云链钱包安装', 
  onPress:() =>  Linking.openURL("https://nano.nebulas.io/")
}])
export default class SettingsScreen extends React.Component {
  constructor(props){
    super(props);
    AsyncStorage.getItem("from").then(from => {
      const login = !!from;
      this.setState({
        login,
        from
      },() => {
        if(login){
          this.getBalance(from);
          getMineBonus(from).then(({result}) => {
            result = result.result;
            if(result){
              if(typeof result === 'string'){
                result = JSON.parse(result);
              }
              this.setState({
                history:result
              })
            }
          })
        }
      })
    })
  }
  static navigationOptions = {
    title: '个人中心',
  };
  state = {
    balance: 0,
    convert: 0,
    history:[]
  }
  render() {
    const {balance, convert, login, from, history, loadingMsg } = this.state;
    if(login === undefined){
      return null;
    }
    const list = history.map(item => (
      <View style={{flex:1,flexDirection:'row',padding:10,backgroundColor:'#fff',borderTopColor:'#f5f5f5',borderTopWidth:2}} key={item.time}>
        <Text style={{flex:1}}>获得{item.nas}NAS</Text>
        <Text>{item.time}</Text>
      </View>
    ))
    return <View style={{flex:1}}>
      <View style={styles.userName} >
          <Image roundAsCircle={true} style={login ? styles.touxiang : styles.notLogin} resizeMode='cover' source={require('../assets/images/touxiang.png')}/>
          {
            login ?
            <Text style={{textAlign:'center',color:'#fff',fontSize:12}}>{from}</Text> :
            <Text style={{textAlign:'center',color:'#f5f5f5',fontSize:14}} onPress={() => {
              this.setState({
                loading:true,
                loadingMsg:"登录中，请稍候..."
              })
              if(!login)loginWalker(({from}) => {
                if(from){
                  this.setState({
                    loading:false,
                    loadingMsg:""
                  })
                  AsyncStorage.setItem("from",from)
                  this.getBalance(from);
                  this.setState({
                    login:true,
                    from
                  })
                }
              },(url,message) => {
                this.setState({
                  loading:false,
                  loadingMsg:""
                })
                if(message){
                  Alert.alert("NANO未安装，请前往安装")
                  url = "https://nano.nebulas.io/";
                }
                this._handlePressButtonAsync(url)
              });
              }}>未登录,点击登陆</Text>
          }
          
      </View>
      <View style={{backgroundColor:'#fff',padding:20}}>
        <Text>我获得的奖金:</Text>
        <View style={styles.drawList}>
          <Text style={{fontSize:30}}>{balance}</Text>
          <Text style={{fontSize:30}}> NAS</Text>
        </View>
        <Text style={{textAlign:'center'}}>≈{convert}$</Text>
      </View>
      <ListView
        dataSource={listData}
        style={{marginTop:10}}
        renderRow={(rowData) => <Text style={{backgroundColor:'#fff',textAlign:'center',padding:8,borderTopWidth:1,borderTopColor:'#f5f5f5',fontSize:14}} onPress={rowData.onPress}>{rowData.text}</Text>}
      />
      {
        login ? <View >
          <Button title="退出登录"  onPress={() => {
            AsyncStorage.removeItem("from",(error) => {
              if(error){
                Alert.alert("退出登录失败")
              }
            })
            this.setState({
              login:false,
              from:null
            })
          }} />
        </View> : null 
      }
      <ScrollView>
        {list}
      </ScrollView>
      <View style={{ flex: 1 }}>
        <Spinner visible={this.state.loading} textContent={loadingMsg} textStyle={{color: '#FFF'}} />
      </View>
    </View>
  }

  _handlePressButtonAsync = async (url) => {
    Linking.openURL(url)
  };
  getBalance(from){
    console.log(from);
    fetch(`https://explorer.nebulas.io/main/api/address/${from}`).then(resp => resp.json()).then(resp => {
      if(resp.code === 0){
        const { address } = resp.data;
        if(address && address.balance){
          const balance = wei2nas(address.balance).toFixed(2);
          fetch('https://explorer.nebulas.io/main/api/market_cap').then(resp => resp.json()).then(({code,data}) => {
            if(code === 0){
              const price = data.price;
              if(price){
                const convert = (price * balance).toFixed(2);
                this.setState({
                  convert
                })
              }
            }
          }).catch(e => {
            Alert.alert("获取单价失败～～")
          })
          this.setState({balance})
        }
      }
    }).catch(e => {
      Alert.alert("获取余额失败～～")
    })
  }
}
const nas2wei = (nas) => {
  if (nas == 0) {
    return nas;
  }
  return nas * Math.pow(10, 18);
 }
 const wei2nas = (wei) => {
   return wei / Math.pow(10, 18);
 }

const styles = StyleSheet.create({
  contain: {
    flex:1,
    flexDirection:'row',
  },
  drawList: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'center',
  },
  userName: {
    backgroundColor:'#ff9800',
  
    
    alignItems:'center',
    justifyContent: 'center',
    height:120    
  },
  touxiang: {
    height:50,
    resizeMode:'cover',
    width:50,
    marginBottom:5,
    borderWidth:2,
    overflow:'hidden',
    borderColor:'#00ff00',
    borderRadius:25,
  },
  notLogin:{
    height:50,
    overflow:'hidden',
    resizeMode:'cover',
    width:50,
    marginBottom:5,
    borderWidth:2,
    borderColor:'#00ff00',
    borderRadius:25,
  },
  stepText:{
    color:'#fff',
    textAlign:'center'
  },
  stepDesc: {
    flex:1,
    padding:10,
    paddingTop:5,
    justifyContent: 'center', 
  },
  othenStep: {
    flex:0.5,
    backgroundColor: '#fff',
    flexDirection:'row',
  },
  payContrain: {
    flex:2
  },
  payButton: {
    flex:1,
    padding:20,
    paddingBottom:40,
    alignItems:'flex-end',
    flexDirection:'row',
    justifyContent: 'center'
  },
  payText: {
    flex:1,
    backgroundColor: '#00bcd4',
    height:30
  },
  payNow: {
    flex:1,
    backgroundColor: '#00bcd4',
    height:35
  }
})