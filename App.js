
import React, { Component } from 'react';
import { Alert, View, Text, Vibration, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { Camera, BarCodeScanner, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';


class Scanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasCameraPermission: null,
      type: Camera.Constants.Type.back,    
    };    

    this.onBarCodeRead = this.onBarCodeRead.bind(this);
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    await this.setState({hasCameraPermission: status === 'granted'});
    this.resetScanner();
  }

  onBarCodeRead({ type, data }) {
    if ((type === this.state.scannedItem.type && data === this.state.scannedItem.data) || data === null) {
      return;
    }
    if (type != this.props.codeType) {
      return;
    }
    this.setState({ scannedItem: { data, type } });
    this.props.onBarCodeScanned(data);
    this.resetScanner();
  }

  resetScanner() {
    this.scannedCode = null;
    this.setState({
      scannedItem: {
        type: null,
        data: null
      }
    });
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.scanScreenMessage}>{this.props.prompt}</Text>
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={this.onBarCodeRead}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    );
  }

}

export default class ExpoScanner extends Component {
  constructor(props) {
    super(props);

    // this.onBarCodeRead = this.onBarCodeRead.bind(this);
    // this.renderMessage = this.renderMessage.bind(this);
    // this.scannedCode = null;

    this.state = {
      // mode: "ticket",
      'ticket': null, 
      'key': null, 
      'saveError': null
    };

    // this.onTicketScanned = this.onTicketScanned.bind(this);
    // this.onKeyScanned = this.onKeyScanned.bind(this);
  }

  renderAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        { text: 'OK', onPress: () => this.resetScanner() },
      ],
      { cancelable: true }
    );
  }

  //onTicketScanned(data) {
  onTicketScanned = (data) => {
    Vibration.vibrate(100);
    console.log('ticket', data);
    this.setState({ticket: data})
  }

  // onKeyScanned(data) {
  onKeyScanned = (data) => {
    Vibration.vibrate(100);
    console.log('key', data);
    this.setState({key: data}, this.doSave);
  }

  reset = () => {
    this.setState({ticket: null, key: null, saveError: null});
  }

  doSave = () => {
    const {ticket, key} = this.state;
    console.log(this.state);
    this.setState({'saveError': null});

    // const url = 'https://postb.in/TMdThJ8N'
    //const url = 'http://kac.lan:8000/api/v1/bind_token'
    const url = 'http://192.168.1.10:8000/api/v1/bind_token'
    fetch(`${url}?ticket_code=${ticket}&token=${key}`, {
      method: 'POST',
      // headers: {
      //   Accept: 'application/json',
      //   'Content-Type': 'application/json',
      // },
      // body: JSON.stringify({
      //   firstParam: 'yourValue',
      //   secondParam: 'yourOtherValue',
      // }),
    })
    .then(function(response) { return response.json(); })
    .then((data) => {
      if (data.status != 'ok') {
        throw data.detail
      }
      Vibration.vibrate(100);
      this.reset();
    }).catch((error) => {
      Vibration.vibrate(400);
      console.log(error);
      this.setState({'saveError': error})
    });
  }
  // onBarCodeRead({ type, data }) {
  //   if ((type === this.state.scannedItem.type && data === this.state.scannedItem.data) || data === null) {
  //     return;
  //   }
  //   Vibration.vibrate();
  //   this.setState({ scannedItem: { data, type } });

  //   if (type ==  BarCodeScanner.Constants.BarCodeType.ean13) {
  //     // Do something for EAN
  //     console.log(`EAN scanned: ${data}`);
  //     this.resetScanner();
  //     this.props.navigation.navigate('YOUR_NEXT_SCREEN', { ean: data });
  //   } else if (type == BarCodeScanner.Constants.BarCodeType.qr) {
  //     // Do samething for QRCode
  //     console.log(`QRCode scanned: ${data}`);
  //     this.resetScanner();
  //   } else {
  //     this.renderAlert(
  //       'This barcode is not supported.',
  //       `${type} : ${data}`,
  //     );
  //   }
  // }

  // renderMessage() {
  //   if (this.state.scannedItem && this.state.scannedItem.type) {
  //     const { type, data } = this.state.scannedItem;
  //     return (
  //       <Text style={styles.scanScreenMessage}>
  //         {`Scanned \n ${type} \n ${data}`}
  //       </Text>
  //     );
  //   }
  //   return <Text style={styles.scanScreenMessage}>Focus the barcode to scan.</Text>;
  // }

  render() {
    const {ticket, key, saveError} = this.state;

    let el = null
    let bgColor = '#fff';
    if (!ticket) {
      el = <Scanner prompt="Scan ticket" onBarCodeScanned={this.onTicketScanned} codeType={BarCodeScanner.Constants.BarCodeType.qr} />
      bgColor = '#f90';
    } else if (ticket && !key) {
      el = <Scanner prompt="Scan key" onBarCodeScanned={this.onKeyScanned} codeType={BarCodeScanner.Constants.BarCodeType.ean8} />
      bgColor = '#9f0';
    } else if (saveError) {
      bgColor = '#f99';
      el = <View style={{flex:1,flexDirection: 'column', alignItems:'center', justifyContent: 'center', padding: 10}}>
        <View style={{flex:1,flexDirection: 'row', alignItems:'center', justifyContent: 'center', padding: 10}}>
          <Ionicons name="md-alert" size={32} color="red" />
          <Text>{saveError.toString()}</Text>
        </View>
        <View style={{flex:1,flexDirection: 'row', alignItems:'center', justifyContent: 'center', padding: 10}}>
          <Button onPress={this.doSave} title="Try again" style={{margin: 10}}/>
          <Button onPress={this.reset} title="Scan another" style={{margin: 10}}/>
        </View>
      </View>
    } else {
      el = <View style={{flex:1,flexDirection: 'row', alignItems:'center', justifyContent: 'center', padding: 10}}>
        <ActivityIndicator size="large" color="#0000ff" style={{paddingRight: 10}}/>
        <Text>Saving...</Text>
      </View>
    }
    return <View style={{...styles.container, backgroundColor:bgColor}}>
      {el}
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    backgroundColor: '#fff',
  },
  scanScreenMessage: {
    fontSize: 40,
//    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

