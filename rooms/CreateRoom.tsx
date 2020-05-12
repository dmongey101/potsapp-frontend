import React from 'react'
import { StyleSheet, Platform, Image, Text, TextInput, View, Button } from 'react-native'
import { Formik } from 'formik';
import * as firebase from 'firebase';
import { socket, baseURL } from '../Socket'

interface Props {
  navigation: any
}

interface State {
    currentUser: any,
    roomName: string,
    noOfPlayers: string,
    noOfTeams: string 
 }

export default class CreateRoom extends React.Component<Props, State> {
  state = { currentUser: null, roomName: '', noOfPlayers: '', noOfTeams: '' }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    }

  createRoom = () => {
    fetch(`${baseURL}/rooms/createRoom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomName: this.state.roomName,
          noOfPlayers: this.state.noOfPlayers,
          noOfTeams: this.state.noOfTeams,
          playerName: this.state.currentUser.email
        })
      })
      socket.emit('join-room', { room: this.state.roomName, player: this.state.currentUser.email })
      this.props.navigation.navigate('WaitingRoom', { roomName: this.state.roomName, socket: socket })
      
  }

render() {
    const { currentUser } = this.state
return (
    <View style={styles.container}>
    <Text>Create Room</Text>
    <TextInput
      style={styles.textInput}
      autoCapitalize="none"
      placeholder="Room Name"
      onChangeText={roomName => this.setState({ roomName })}
      value={this.state.roomName}
    />
    <TextInput
      style={styles.textInput}
      autoCapitalize="none"
      placeholder="No. of Players"
      keyboardType={'numeric'}
      onChangeText={noOfPlayers => this.setState({ noOfPlayers })}
      value={this.state.noOfPlayers}
    />
    <TextInput
      style={styles.textInput}
      autoCapitalize="none"
      placeholder="No. of Teams"
      keyboardType={'numeric'}
      onChangeText={noOfTeams => this.setState({ noOfTeams })}
      value={this.state.noOfTeams}
    />
    <Button title="Create" onPress={this.createRoom} />

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
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})