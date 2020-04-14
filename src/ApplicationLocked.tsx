import { colors } from './design/colors';
import { grid } from './design/grid';
import delay from './delay';
import { PinResultStatus } from './utils';

import AsyncStorage from '@react-native-community/async-storage';
import { easeLinear } from 'd3-ease';
import * as React from 'react';
import Animate from 'react-move/Animate';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const thirdSize = Dimensions.get('window').width / 3 + 20;
const { height, width } = Dimensions.get('window');

export type IProps = {
  timeToLock: number;
  onClickButton: any;
  textButton: string;
  changeStatus: (status: PinResultStatus) => void;
  textDescription?: string;
  textSubDescription?: string;
  buttonComponent?: any;
  timerComponent?: any;
  textTitle?: string;
  titleComponent?: any;
  iconComponent?: any;
  timePinLockedAsyncStorageName: string;
  pinAttemptsAsyncStorageName: string;
  styleButton?: any;
  styleTextButton?: any;
  styleViewTimer?: any;
  styleTextTimer?: any;
  styleTitle?: any;
  styleViewTextLock?: any;
  styleViewIcon?: any;
  colorIcon?: string;
  nameIcon?: string;
  sizeIcon?: number;
  styleMainContainer?: any;
  styleText?: any;
  styleViewButton?: any;
};

export type IState = {
  timeDiff: number;
};

class ApplicationLocked extends React.PureComponent<IProps, IState> {
  timeLocked: number;
  isUnmounted: boolean;

  constructor(props: IProps) {
    super(props);
    this.state = {
      timeDiff: 0
    };
    this.isUnmounted = false;
    this.timeLocked = 0;
    this.timer = this.timer.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  componentDidMount() {
    AsyncStorage.getItem(this.props.timePinLockedAsyncStorageName).then(val => {
      this.timeLocked = new Date(val ? val : '').getTime() + this.props.timeToLock;
      this.timer();
    });
  }

  async timer() {
    const timeDiff = +new Date(this.timeLocked) - +new Date();
    this.setState({ timeDiff: Math.max(0, timeDiff) });
    await delay(1000);
    if (timeDiff < 1000) {
      this.props.changeStatus(PinResultStatus.initial);
      AsyncStorage.multiRemove([
        this.props.timePinLockedAsyncStorageName,
        this.props.pinAttemptsAsyncStorageName
      ]);
    }
    if (!this.isUnmounted) {
      this.timer();
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  renderButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.onClickButton) {
            this.props.onClickButton();
          } else {
            throw 'Quit';
          }
        }}
        style={styles.button}
      >
        <Text style={styles.closeButtonText}>{'Exit the app'}</Text>
      </TouchableOpacity>
    );
  };

  renderTimer = (minutes: number, seconds: number) => {
    return (
      <View style={styles.viewTimer}>
        <Text style={styles.textTimer}>
          {`${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
        </Text>
      </View>
    );
  };

  renderTitle = () => {
    return <Text style={styles.title}>{'Maximum attempts \nreached'}</Text>;
  };

  renderIcon = () => {
    return (
      <View style={styles.viewIcon}>
        <Icon name={'lock-outline'} size={24} color="rgb(75,94,127)" />
      </View>
    );
  };

  renderErrorLocked = () => {
    const minutes = Math.floor(this.state.timeDiff / 1000 / 60);
    const seconds = Math.floor(this.state.timeDiff / 1000) % 60;
    return (
      <View>
        <Animate
          show={true}
          start={{
            opacity: 0
          }}
          enter={{
            opacity: [1],
            timing: { delay: 1000, duration: 1500, ease: easeLinear }
          }}
        >
          {(state: any) => (
            <View style={[styles.viewTextLock, { opacity: state.opacity }]}>
              {this.renderTitle()}
              {this.renderIcon()}
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginBottom: 20,
                  flex: 1
                }}
              >
                <View>
                  <Text style={styles.text}>
                    {`3 incorrect passcodes have been entered. To protect your information, access has been locked for ${Math.ceil(
                      this.props.timeToLock / 1000 / 60
                    )} minutes.`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.text, { marginBottom: 40 }]}>
                {'Come back later and try again.'}
              </Text>

              {this.renderTimer(minutes, seconds)}
            </View>
          )}
        </Animate>
        <Animate
          show={true}
          start={{
            opacity: 0
          }}
          enter={{
            opacity: [1],
            timing: { delay: 2000, duration: 1500, ease: easeLinear }
          }}
        >
          {(state: any) => (
            <View style={{ opacity: state.opacity, flex: 1 }}>
              <View style={styles.viewCloseButton}>{this.renderButton()}</View>
            </View>
          )}
        </Animate>
      </View>
    );
  };

  render() {
    return (
      <View
        style={this.props.styleMainContainer ? this.props.styleMainContainer : styles.container}
      >
        {this.renderErrorLocked()}
      </View>
    );
  }
}

export default ApplicationLocked;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    backgroundColor: colors.background,
    flexBasis: 0,
    left: 0,
    height,
    width,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  text: {
    fontSize: grid.unit,
    color: '#4B5E7F',
    lineHeight: grid.unit * grid.lineHeight,
    textAlign: 'center',
    fontFamily: 'Comfortaa-light'
  },
  viewTextLock: {
    marginTop: 2 * grid.unit,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: grid.unit * 3,
    paddingRight: grid.unit * 3,
    flex: 3
  },
  textTimer: {
    fontFamily: 'Comfortaa-light',
    fontSize: 48,
    color: '#4B5E7F'
  },
  title: {
    fontSize: 24,
    color: colors.base,
    textAlign: 'center',
    fontFamily: 'Comfortaa-light',
    marginBottom: 20
  },
  viewIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  viewTimer: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
    paddingTop: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgb(230, 231, 233)',
    marginBottom: grid.unit * 4
  },
  viewCloseButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: grid.unit * 2,
    flex: 1
  },
  button: {
    display: 'flex',
    height: 48,
    marginLeft: 2 * grid.unit,
    marginRight: 2 * grid.unit,
    marginBottom: 4 * grid.unit,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#01e576'
  },
  closeButtonText: {
    fontFamily: 'Comfortaa-bold',
    color: '#fff',
    fontSize: 16
  },
  borderViewRight: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 10
  },
  borderViewLeft: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'flex-start',
    marginHorizontal: 10
  },
  borderBottom: {
    backgroundColor: '#ccc',
    height: 2,
    width: 10
  }
});
