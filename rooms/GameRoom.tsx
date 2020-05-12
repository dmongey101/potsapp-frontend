import React from 'react'
import { StyleSheet, Platform, Image, Text, View, Button, ActivityIndicator, FlatList } from 'react-native'
import * as firebase from 'firebase'
import { baseURL } from '../Socket';

interface Props {
  navigation: any,
  socket: any
}

type Room = {
  name: string,
  noOfPlayers: number,
  currentPlayer: number,
  currentTeam: number,
  currentRound: string,
  scores: Array<Object>,
  pot1: Array<string>,
  pot2: Array<string>,
  teams: Object
}

type State = {
    currentUser: any,
    roomState: Room | any,
    counter: number,
    isLoading: boolean
}

export default class GameRoom extends React.Component<Props, State> {
  state = { currentUser: null, roomState: null, counter: null, isLoading: true}
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    const room = this.props.navigation.state.params.roomName
    const socket = this.props.navigation.state.params.socket

    fetch(`${baseURL}/rooms/getCurrentRoom/${room}`)
        .then((res) => res.json())
        .then((room) => {
            this.setState({ roomState: {
              name: room.name,
              noOfPlayers: parseInt(room.noOfPlayers),
              currentTeam: parseInt(room.currentTeam),
              currentPlayer: parseInt(room.currentPlayer),
              currentRound: room.currentRound,
              scores: room.scores,
              pot1: room.pot1,
              pot2: room.pot2,
              teams: room.teams
            }})
        })
        .catch((err) => console.log(err))
        .finally(() => {
            this.setState({ isLoading: false })
        })
    
      socket.on('counter', counter => {
        this.setState({ counter: counter })
      })
    
}

teamView = () => {
  const { roomState } = this.state
  var teams = []
  if (roomState != null) {
    for(var i=1; i<=roomState.noOfPlayers; i++) {
      teams.push(
        <View style={styles.mainTeamsView} key={i}>
          <FlatList
            data={roomState.teams[i.toString()]}
            renderItem={({ item, index }) => (
                  <Text>{item.player}</Text>
            )}
            keyExtractor={item => item.player}
        />
        </View>
      )
    }
  }
  return teams
}

currentPlayerView = () => {
  const { roomState } = this.state
  if (roomState != null) {
    if (this.state.currentUser.email == this.state.roomState.currentPlayer) {
      return <Button
                title="Start"
                onPress={() => this.start()}
              />
    }
  }
}

start() {
  const socket = this.props.navigation.state.params.socket
  socket.emit('start-timer', { room: this.state.roomState.name, player: this.state.currentUser.email })
}

render() {
  const { roomState, isLoading, counter } = this.state

return  <View style={styles.container}>
          {isLoading ? <ActivityIndicator/> : (
            
          <View style={styles.teams}>
            {this.teamView()}
            {this.currentPlayerView()}
            <Text>{ counter }</Text>
            <Button
              title="Back to rooms"
              onPress={() => this.props.navigation.navigate('Main')}
            />
          </View> 
          
          )}          
        </View>  
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainTeamsView: {
    flexDirection: "row",
    height: 100,
    padding: 20
  },
  teams: {
    flex: 0.3
  },
  flatList: {
      marginTop: 200
  }
})