import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import caretUp from "../assets/images/caret-arrow-up.png";
import caretDown from "../assets/images/caret-down.png";
import { View } from '../components/Themed';
const TradingPair = {
  CHANNEL_ID: null,
  BID: null,
  BID_SIZE: null,
  ASK: null,
  ASK_SIZE: null,
  DAILY_CHANGE: null,
  DAILY_CHANGE_RELATIVE: null,
  LAST_PRICE: null,
  VOLUME: null,
  HIGH: null,
  LOW: null,
};
var flatArray = (array: any[]) => {
  return array.reduce((i, j: number | any[]) => {
    if (typeof j === 'object' && j.length) {
      i.push(...flatArray(j));
    } else {
      i.push(j);
    }
    return i;
  }, []);
};

export default function TabOneScreen() {
  const [socketUrl, setSocketUrl] = React.useState('wss://api-pub.bitfinex.com/ws/2');
  const [messageHistory, setMessageHistory] = React.useState<any[]>([]);
  const [tradeData, setTradeData] = React.useState<any>(TradingPair);
  const [tradeHistory, setTradeHistory] = React.useState<any[]>([]);

  const onMessage = useCallback(
    message => {
      let lastMessageData = JSON.parse(message && message.data) || {};
      if (lastMessageData.length && lastMessageData[1] !== 'hb') {
        let data = flatArray(lastMessageData);
        data = Object.keys(TradingPair).reduce((i: any, j: any, k: any) => {
          i[j] = data[k];
          return i;
        }, TradingPair);
        setTradeData(data);
        setTradeHistory([...tradeHistory, data]);
      } else {
        setMessageHistory([...messageHistory, lastMessageData]);
      }
    },
    [messageHistory, tradeHistory],
  );

  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      let msg: any = JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tBTCUSD',
      });
      sendMessage(msg);
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: closeEvent => false,
    onMessage: onMessage,
  });

  const connectionStatus = {
    [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED',
    [ReadyState.CONNECTING]: 'CONNECTING',
    [ReadyState.OPEN]: 'OPEN',
    [ReadyState.CLOSING]: 'CLOSING',
    [ReadyState.CLOSED]: 'CLOSED',
  };

  const handleConnection = useCallback(() => {
    let url =
      socketUrl === 'wss://api-pub.bitfinex.com/ws/2'
        ? 'ws://abc.com'
        : 'wss://api-pub.bitfinex.com/ws/2';
    setSocketUrl(url);
  }, [socketUrl]);
  let isUp =  Math.sign(tradeData['DAILY_CHANGE']) > 1;
  return (
    <View style={styles.container}>
      <View style={{flexDirection:"row", justifyContent:"space-between", marginHorizontal: 10, top: 20}}>
      <View style={{flexDirection:"row"}}>
          <Text>Connection Status </Text>
          <Text style={{color: "#7d9f45", fontWeight:"bold"}}>{connectionStatus[readyState]}</Text>
        </View>
        <View >
          <TouchableOpacity
            onPress={handleConnection}
            style={{borderColor: readyState === ReadyState.OPEN ||
              readyState === ReadyState.CONNECTING ? "red" : "#7d9f45", borderWidth: 1, height: 30, paddingHorizontal: 10, alignItems:"center", justifyContent:"center", borderRadius:5}}
          >
            <Text style={{color: readyState === ReadyState.OPEN ||
            readyState === ReadyState.CONNECTING ? "red" : "#7d9f45", fontWeight:"bold"}}>
            {readyState === ReadyState.OPEN ||
            readyState === ReadyState.CONNECTING
              ? 'Disconnect'
              : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tickerContainer}>
        <Image style={{height: 50, width: 50,alignSelf:"center"}} source={{uri:"https://res.cloudinary.com/teepublic/image/private/s--lWUj--s9--/c_crop,x_10,y_10/c_fit,h_913/c_crop,g_north_west,h_1038,w_1038,x_-179,y_-62/l_upload:v1565806151:production:blanks:vdbwo35fw6qtflw9kezw/fl_layer_apply,g_north_west,x_-290,y_-173/b_rgb:262c3a/c_limit,f_jpg,h_630,q_90,w_630/v1571584172/production/designs/6398882_0.jpg"}}></Image>
        <View style={styles.TextCotainer}>
        <Text style={[styles.title,{color:"#c7c8cb"}]}>BTC/USD</Text>
        <View style={styles.textView}>
        <Text style={styles.title}>VOL  </Text>
        <Text style={[styles.title,{color:"white",}]}>{parseFloat(tradeData['VOLUME']).toFixed(0) }</Text>
        <Text style={[styles.title,{ textDecorationLine: 'underline',}]}> BTC </Text>
        </View>
        <View style={styles.textView}>
        <Text style={styles.title}>LOW  </Text>
        <Text style={[styles.title,{color:"white",}]}>{parseFloat(tradeData['LOW']).toFixed(0)}</Text>
        </View>
        </View>
        <View style={styles.TextCotainer1}>
        <Text style={styles.title1}>{parseFloat(tradeData['BID']).toFixed(1)}</Text>
        <View style={styles.textView}>
        <Text style={isUp ? styles.title3 : styles.titleRed}>{parseFloat(Math.abs(tradeData['DAILY_CHANGE']).toString()).toFixed(2)}</Text>
        <Image style={{height: 10, width: 10,marginHorizontal: 5, alignSelf:"center"}} source={isUp ? caretUp : caretDown}></Image>
        <Text style={isUp ? styles.title3 : styles.titleRed}>{`(${parseFloat(
                            Math.abs(
                              tradeData['DAILY_CHANGE_RELATIVE'],
                            ).toString(),
                          ).toFixed(2)}%)`} </Text>
        </View>
        <View style={[styles.textView,{ justifyContent: "flex-end",}]}>
        <Text style={[styles.title]}>HIGH  </Text>
        <Text style={[styles.title,{color:"white",}]}>{parseFloat(tradeData['HIGH']).toFixed(0)}</Text>
        </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tickerContainer: {
    height: 180,
    width: "100%",
    marginTop: 50,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor:"#253038",
    paddingHorizontal: 10,
  },
  TextCotainer:{
    height: 100,
    justifyContent: 'flex-start',
    backgroundColor:"#253038"
  },
  textView:{
    flexDirection:"row",
    backgroundColor:"#253038",
  },
  TextCotainer1:{
    height: 100,
    backgroundColor:"#253038",
  },
  title: {
    fontSize: 18,
    color:"#707476",
    fontWeight: 'bold',
    lineHeight: 35,
  },
  title1: {
    color:"#c7c8cb",
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "right",
    lineHeight: 35,
  },
  title3:{
    color: "#7d9f45",
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "right",
    lineHeight: 35,
  },
  titleRed: {
    color: "red",
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "right",
    lineHeight: 35,
  },
  title2: {
    color:"#c7c8cb",
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "right",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
