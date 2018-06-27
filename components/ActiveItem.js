import React from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Button,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

const run1 = "../assets/images/run1.jpg";
const run2 = "../assets/images/run2.jpg"
export default class ActiveItem extends React.Component {
  state = {
  }

  render() {
    const {imgUrl, count, check,date, cycle} = this.props;
    if(check === undefined){
      return null
    }
    return (
      <View style={styles.itemContrain}>
        <ImageBackground source={imgUrl} style={styles.absoluteFillObject}></ImageBackground>
        <View style={styles.activeContext}>
          <Text style={styles.countText}>第{cycle}期:{count}步</Text>
          {
            check ? <Text style={styles.enterforButton}>{count === 10000 ? '敬请期待' : '已报名'}</Text> :
            <Text style={styles.enterforButton} onPress={() => {
              const { navigate } = this.props.navigation;
              navigate("EnterFor",{
                date:date
              })
           }}>立即报名</Text>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemContrain: {
    flex: 1,
    height: 120,
    marginTop: 10,
    padding: 10
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    right: 0,
    top: 0,
    bottom: 30
  },
  activeContext: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    position: 'absolute',
    top: 80,
    flex:1,
    paddingTop:8,
    flexDirection:'row',
    alignItems:'flex-start',  
    height: 30,
    left: 0,
    right: 0
  },
  countText: {
    paddingLeft:10,
    flex:1
  },
  enterforButton: {
    color:'#5677fc',
    paddingRight:10
  }
});