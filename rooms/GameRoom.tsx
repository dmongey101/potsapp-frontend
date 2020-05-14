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
    currentWord: string,
    roundStarted: boolean,
    isLoading: boolean
}

export default class GameRoom extends React.Component<Props, State> {
  state = { currentUser: null, roomState: null, counter: null, currentWord: null, roundStarted: false, isLoading: true}
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
              currentPlayer: room.currentPlayer,
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
        if (counter == 0) {
          socket.emit('next-round', this.state.roomState)
          this.setState({ roundStarted: false })
        }
      })

      socket.on('new-game-state', room => {
        this.setState({ roomState: {
          name: room.name,
          noOfPlayers: parseInt(room.noOfPlayers),
          currentTeam: parseInt(room.currentTeam),
          currentPlayer: room.currentPlayer,
          currentRound: room.currentRound,
          scores: room.scores,
          pot1: room.pot1,
          pot2: room.pot2,
          teams: room.teams
        }})
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
            data={roomState.teams[i.toString()].players}
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
  const { roomState, roundStarted } = this.state
  if (roomState != null) {
    if (this.state.currentUser.email == this.state.roomState.currentPlayer) {
      if (!roundStarted) {
        return <Button
                  title="Start"
                  onPress={() => this.start()}
                />
      } else {
        return <Button
                  title="Next"
                  onPress={() => this.next()}
                />
      }
    }
  }
}

start() {
  const socket = this.props.navigation.state.params.socket
  var pot = this.state.roomState.pot1;
  this.setState({ currentWord: pot[Math.floor(Math.random() * pot.length)]})
  this.setState({ roundStarted: true})
  socket.emit('start-timer', { room: this.state.roomState.name, player: this.state.currentUser.email })
}

next() {
  var i = this.state.roomState.pot1.indexOf(this.state.currentWord)
  if (i > -1) {
    this.state.roomState.pot1.splice(i, 1)
    this.state.roomState.pot2.push(this.state.currentWord)
  }

  if (this.state.roomState.pot1 == 0) {
    this.state.roomState.pot1 = this.state.roomState.pot2
    this.state.roomState.pot2 = []
  }

  this.setState({ currentWord: this.state.roomState.pot1[Math.floor(Math.random() * this.state.roomState.pot1.length)]})
}

render() {
  const { roomState, isLoading, counter, currentWord, roundStarted } = this.state

return  <View style={styles.container}>
          {isLoading ? <ActivityIndicator/> : (
            
          <View style={styles.teams}>
            {this.teamView()}
            {roundStarted ? <Text>{currentWord}</Text> : (<Text></Text>)}
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