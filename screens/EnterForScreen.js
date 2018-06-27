import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  WebView,
  Alert,
  ToastAndroid,
  AlertIOS,
  Linking,
  View
} from 'react-native';
import contract from '../constants/Contract';
import { enrollWalk, check } from '../util/contractUtil';
import NebPay from 'rn-nebpay';
import Spinner from 'react-native-loading-spinner-overlay';

var nebPay = new NebPay();
export default class EnterForScreen extends React.Component {
  static navigationOptions = {
    title: '报名参赛',
  };
  state = {
    loadingMsg:''
  }

  _handlePressButtonAsync = async (url) => {
    Linking.openURL(url)
  };
  render() {
    const { date, type = 1, cycle = 1 } = this.props.navigation.state.params;
    const { loadingMsg } = this.state;
    const step = type === 1 ? 5000 : 10000
    return <View style={{flex:1}}>
      <View style={styles.stepContain}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepText}>1</Text>
        </View>
        <View style={styles.stepDesc}>
          <Text style={{color:'#fff',fontSize:16}}>缴纳报名费用-第{cycle}期(明日)</Text>
          <Text style={{fontSize:30,color: '#fff'}}>0.1 NAS</Text>
          <Text style={{color:'#fff',fontSize:16,marginTop:6}}>比赛时间：{date} 00:00-23:59</Text>
          {/* <Text style={{color:'#fff',fontSize:12,marginTop:4}}>新用户可以免费获得一次参赛资格，参赛的报名费用由官方支付</Text> */}
        </View>
      </View>
      <View style={styles.othenStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepText}>2</Text>
        </View>
        <View style={styles.stepDesc}>
          <Text style={{fontSize:16}}>完成{step}步并提交写入星云链</Text>
          <Text style={{fontSize:12,marginTop:6}}>注意：只有当日步数达到{step}步，并调用星云链智能合约将数据写入才能获得奖金</Text>
        </View>
      </View>
      <View style={styles.othenStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepText}>3</Text>
        </View>
        <View style={styles.stepDesc}>
          <Text style={{fontSize:16}}>获得奖金</Text>
          <Text style={{fontSize:12,marginTop:6}}>比赛结束后，成功将数据写入星云链的用户瓜分奖池里的奖金</Text>
        </View>
      </View>
      <View style={styles.payContrain}>
      <View style={{ flex: 1 }}>
            <Spinner visible={this.state.loading} textContent={loadingMsg} textStyle={{color: '#FFF'}} />
          </View>
        <View style={styles.payButton}>
          <View style={styles.payNow}>
          <Button color={Platform.OS === 'ios' ? '#fff' : undefined} onPress={() => {
             this.setState({
               loading:true,
               loadingMsg:'报名中...'
             },() => {
              enrollWalk(1,date,() => {
                this.setState({
                  loading:false,
                  loadingMsg:''
                },() => {
                  const msg = "报名成功，记得明天同步步行数据哦";
                  Platform.OS === 'ios' ? 
                    AlertIOS.prompt(msg)
                    :ToastAndroid.show(msg,ToastAndroid.SHORT);
                    // this.props.navigation.goBack()
                })
               },(url,message) => {
                 if(message){
                   Alert.alert("NANO未安装，请前往安装")
                   url = "https://nano.nebulas.io/";
                 }
                this._handlePressButtonAsync(url)
               });
             })
          }} title="立即支付"/>
          </View>
        </View>
      </View>
    </View>
  }
}
const styles = StyleSheet.create({
  stepContain: {
    flex:1,
    flexDirection:'row',
    backgroundColor:'#ff9800'
  },
  stepNumber: {
    backgroundColor:'#00bcd4',
    width:20,
    height:20,
    borderRadius:10,
    margin:10
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