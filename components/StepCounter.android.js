import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
  NativeModules,
  View
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

const { SensorManager } = NativeModules;

const MAX_POINTS = 5000;
export default class StepCounter extends React.Component {
  state = {
    isPedometerAvailable: "checking",
    pastStepCount: 0,
    currentStepCount: 0
  }
  componentDidMount(){
    SensorManager.startStepCounter(1000);
    DeviceEventEmitter.addListener('StepCounter', function (data) {
      console.log(data);
    });
  }
  render() {
    const fill = this.state.pastStepCount / MAX_POINTS * 100 ;
    const { cycle, nas } = this.props;
    return (
    <View >
      <View style={styles.chartView}>
      <AnimatedCircularProgress
        size={150}
        width={10}
        fill={fill}
        tintColor="#00e0ff"
        backgroundColor="#3d5875">
        {(fill) => (
          <Text style={styles.points}>
            {Math.round(MAX_POINTS * fill / 100)}
          </Text>
        )}
      </AnimatedCircularProgress>
      </View>
      <View style={styles.stepText}>
        <Text style={styles.stepNumber}>第{cycle}期</Text>
        <Text style={styles.desc}>参赛满5000步，瓜分{nas}NAS</Text>
      </View>
    </View>)
  }

  notifyProps = (result) => {
    if(this.props.onChange){
      this.props.onChange(result.steps)
    }
  }
}

const styles = StyleSheet.create({
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7'
  },
  points: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: 90,
    textAlign: 'center',
    color: '#7591af',
    fontSize: 20,
    fontWeight: "800"
  },
  chartView: {
    flexDirection:"row",
    justifyContent:"center"
  },
  stepText:{
    padding:10
  },
  stepNumber:{
    textAlign:'center',
    marginBottom:4
  }
});