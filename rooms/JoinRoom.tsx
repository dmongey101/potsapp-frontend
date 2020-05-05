import React from 'react'
import { ActivityIndicator, StyleSheet, Platform, Image, Text, TextInput, View, Button, FlatList } from 'react-native'
import * as firebase from 'firebase'
import { socket, baseURL } from '../Socket'

interface Props {
  navigation: any
}

interface State {
    currentUser: any,
    rooms: Array<string>,
    roomName: string,
    isLoading: boolean
 }

export default class JoinRoom extends React.Component<Props, State> {
  state = { currentUser: null, rooms: [], roomName: '', isLoading: true }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    fetch(`${baseURL}/rooms/getRooms`)
        .then((res) => res.json())
        .then((rooms) => {
            this.setState({ rooms: rooms })
        })
        .catch((err) => console.log(err))
        .finally(() => {
            this.setState({ isLoading: false })
        })
    }

    joinRoom(roomName) {
        fetch(`${baseURL}/rooms/joinRoom`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            roomName: roomName,
            playerName: this.state.currentUser.email,
            })
        })
        socket.emit('join-room', { room: roomName, player: this.state.currentUser.email })
        this.props.navigation.navigate('WaitingRoom', { roomName: roomName})
    }


render() {
    const { rooms, isLoading } = this.state
return (
    <View style={styles.container}>
        {isLoading ? <ActivityIndicator/> : (
            <FlatList
                style={styles.flatList}
                data={rooms}
                keyExtractor={({ id }, index) => id}
                renderItem={({ item }) => (
                    <View><Text>{item}</Text><Button title="Join" onPress={() => this.joinRoom(item)} /></View>
                    
                )}
            />
        )}
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
  flatList: {
      marginTop: 300
  }
})