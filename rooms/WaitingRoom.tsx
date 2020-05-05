import React from 'react'
import { StyleSheet, Modal, TouchableHighlight, Text, TextInput, View, FlatList, Button } from 'react-native'
import * as firebase from 'firebase';
import { socket, baseURL } from '../Socket';

interface Props {
  route: any,
  navigation: any
}

interface State {
    currentUser: any,
    players: Array<string>,
    word1: string,
    word2: string,
    word3: string,
    word4: string,
    modalVisible: boolean,
    isLoading: boolean
}


export default class WaitingRoom extends React.Component<Props, State> {
    state = { currentUser: null, players: [], word1: '', word2: '', word3: '', word4: '', modalVisible: true, isLoading: true }
    
  componentDidMount() {
    const { currentUser } = firebase.auth()
    const roomName = this.props.navigation.state.params.roomName
    this.setState({ currentUser })

    fetch(`${baseURL}/rooms/getPlayers/${roomName}`)
        .then((res) => res.json())
        .then((players) => {
            this.setState({ players: players })
        })
        .catch((err) => console.log(err))
        .finally(() => {
            this.setState({ isLoading: false })
        })

    socket.on('player-joined', player => {
      this.setState({ players: [...this.state.players, player] })
    })
  }

  submitWords = () => {
    const roomName = this.props.navigation.state.params.roomName;
    fetch(`${baseURL}/rooms/submitWords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomName: roomName,
        player: this.state.currentUser.email,
        word1: this.state.word1,
        word2: this.state.word2,
        word3: this.state.word3,
        word4: this.state.word4
      })
    })
    
    socket.on('player-ready', player => {
      var i = this.state.players.findIndex(user => user == player)
      this.state.players[i] = player + ' is Ready'
    })

    socket.on('start-game', () => {
      console.log('hello')
      this.props.navigation.navigate('GameRoom', { roomName: roomName })
    })

    var i = this.state.players.findIndex(user => user == this.state.currentUser.email)
    this.state.players[i] = this.state.currentUser.email + ' is Ready'
    
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  componentWillUnmount() {
    socket.disconnect()
    var i = this.state.players.indexOf(this.state.currentUser)
    if(i !== -1) this.state.players.splice(i, 1)
  }

render() {
  const { modalVisible } = this.state
  const players = this.state.players.map(player => (
  <Text key={player}>{player}</Text>
  ))

return (
  <View style={styles.container}>
    <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TextInput 
                style={styles.textInput}
                autoCapitalize="none"
                placeholder="Word 1"
                onChangeText={word1 => this.setState({ word1: word1 })}
              />
              <TextInput 
                style={styles.textInput}
                autoCapitalize="none"
                placeholder="Word 2"
                onChangeText={word2 => this.setState({ word2: word2 })}
              />
              <TextInput 
                style={styles.textInput}
                autoCapitalize="none"
                placeholder="Word 3"
                onChangeText={word3 => this.setState({ word3: word3 })}
              />
              <TextInput 
                style={styles.textInput}
                autoCapitalize="none"
                placeholder="Word 4"
                onChangeText={word4 => this.setState({ word4: word4 })}
              />

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={() => {
                  this.setModalVisible(!modalVisible);
                  this.submitWords();
                }}
              >
                <Text style={styles.textStyle}>Submit</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
    {players}
    <Button
        title="Back to rooms"
        onPress={() => this.props.navigation.navigate('Main')}
    />
  </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 10
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 10,
    height: '50%',
    width: '80%',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
})