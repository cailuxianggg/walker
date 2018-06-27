import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  Alert,
  TouchableOpacity,
  AsyncStorage,
  View
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {MonoText} from '../components/StyledText';
import StepCounter from '../components/StepCounter';
import ActiveItem from '../components/ActiveItem';
import { check,uploadWalk, getCurrentInfo } from '../util/contractUtil';
import {Card, CardImage, CardTitle, CardContent, CardAction} from 'react-native-card-view';
import moment from 'moment';
import { BigNumber } from 'bignumber.js';
import Spinner from 'react-native-loading-spinner-overlay';

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Walker",
    headerRight:(
      <Text style={{paddingRight:10,color:'blue'}} onPress={() => navigation.state.params.navigatePress()}>同步</Text>
    )
});
  state = {
    points: 1000,
    nas:0,
    cycle:1
  }
  handleAsync = () => {
   // uploadWalk(this.state)
  }
  constructor(props){
    super(props)
    const dateStr = moment().dayOfYear(moment().dayOfYear() + 1).format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");
    AsyncStorage.getItem("from").then(from => {
      console.log(`from is ${from} chenk ${dateStr}`);
      if(from){
        check(dateStr,from).then(({ result }) => {
          result = result.result;
          console.log(result)
          if(result){
            result = !!JSON.parse(result);
            this.setState({
              check:result,
              date:dateStr
            })
          }
        })
      }else{
        this.setState({
          check:false,
          date:dateStr
        })
        // Alert.alert("当前未登录，请用NAS登录")
        // const { navigate } = this.props.navigation;
        // navigate("Settings")
      }
    });
    getCurrentInfo(today).then( ({result}) => {
      console.log(today)
      console.log(`current info ${JSON.stringify(result)}`)
      if(result.result){
        const data = JSON.parse(result.result);
        if(data && data.success){
          const {cycle,balance} = data;
          if(balance){
            const nas = wei2nas(new BigNumber(balance)).toFixed(2);
            this.setState({
              cycle,nas
            })
          }
        }
      }
    })
  }
  render() {
    const { cycle,nas, loadingMsg } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>

          <View
            style={{
            marginBottom: 5,
            backgroundColor: '#fff'
          }}>
            <View style={styles.helpContainer}>
              <StepCounter 
                cycle={cycle}
                nas={nas}
                onChange={(step) => this.setState({step})}/>
            </View>
          </View>

          <View>
            <ActiveItem 
              cycle={cycle + 1}
              check={this.state.check} 
              date={this.state.date} 
              imgUrl={require('../assets/images/run1.jpg')} 
              navigation={this.props.navigation} 
              count={5000}/>
          </View>
          <View >
            <ActiveItem 
              cycle={cycle + 1}
              check={true} 
              date={this.state.date} 
              imgUrl={require('../assets/images/run2.jpg')} 
              navigation={this.props.navigation} 
              count={10000}/>
          </View>
          <View style={{ flex: 1 }}>
            <Spinner visible={this.state.loading} textContent={loadingMsg} textStyle={{color: '#FFF'}} />
          </View>
        </ScrollView>
        
      </View>
    );
  }
  navigatePress = () => {
    const { step } = this.state;
    const today = moment().format('YYYY-MM-DD');
    AsyncStorage.getItem("from").then(from => {
      this.setState({
        loading:true,
        loadingMsg:'同步数据中...'
      },() => {
        check(today,from).then(({result}) => {
          console.log(result.result);
          if(!!result.result){
            uploadWalk(today,step,(data) => {
              this.setState({
                loading:false,
                loadingMsg:''
              })
              Alert.alert("同步成功")
            })
          }else{
            this.setState({
              loading:false,
              loadingMsg:''
            })
            Alert.alert("今天没有报名参加哦～")
          }
        })
      })
    })
  }
  componentDidMount(){
      this.props.navigation.setParams({
          navigatePress:this.navigatePress
      })
  }
}
const wei2nas = (wei) => {
  return wei / Math.pow(10, 18);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)'
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center'
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {
          height: -3
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    margin: 15,
    alignItems: 'center'
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7'
  }
});