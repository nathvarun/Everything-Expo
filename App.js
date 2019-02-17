import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Button,
  Linking,
  AppState
} from 'react-native';
import { Constants, Location, Permissions, IntentLauncherAndroid } from 'expo';
import Modal from 'react-native-modal';
export default class App extends Component {
  state = {
    location: null,
    errorMessage: null,
    isLocationModalVisible: false,
    appState: AppState.currentState
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      this._getLocationAsync();
    }
    this.setState({ appState: nextAppState });
  };

  componentWillMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage:
          'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    try {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          errorMessage: 'Permission to access location was denied'
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      this.setState({ location });
    } catch (error) {
      let status = Location.getProviderStatusAsync();
      if (!status.locationServicesEnabled) {
        this.setState({ isLocationModalVisible: true });
      }
    }
  };

  openSetting = () => {
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:');
    } else {
      IntentLauncherAndroid.startActivityAsync(
        IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS
      );
    }
    this.setState({ openSetting: false });
  };

  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }

    return (
      <View style={styles.container}>
        <Modal
          onModalHide={this.state.openSetting ? this.openSetting : undefined}
          isVisible={this.state.isLocationModalVisible}
        >
          <View
            style={{
              height: 300,
              width: 300,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Button
              onPress={() =>
                this.setState({
                  isLocationModalVisible: false,
                  openSetting: true
                })
              }
              title="Enable Location Services"
            />
          </View>
        </Modal>
        <Text style={styles.paragraph}>{text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center'
  }
});
