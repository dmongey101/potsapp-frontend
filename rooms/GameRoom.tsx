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
  totalScore: number,
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
    const { roomState } = this.state
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
              totalScore: room.totalScore,
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
          totalScore: room.totalScore,
          pot1: room.pot1,
          pot2: room.pot2,
          teams: room.teams
        }})
      })

      socket.on('updated-score', data => {
        console.log(data)
        this.setState(state => (state.roomState.scores[data.currentTeam - 1][data.currentTeam.toString()] = data.score, state))
        this.setState(state => (state.roomState.totalScore = data.totalScore, state))
        this.setState(state => (state.roomState.currentRound = data.currentRound, state))
      })
    
}

teamView = () => {
  const { roomState } = this.state
  var teams = []
  if (roomState != null) {
    for(var i=1; i<=roomState.noOfPlayers; i++) {
      teams.push(
        <View style={styles.mainTeamsView} key={i}>
          <Text>Team {i} - {roomState.scores[i - 1][i.toString()]} </Text>
          <FlatList
            data={roomState.teams[i.toString()].players}
            renderItem={({ item, index }) => {
              if(item.playerEmail == roomState.currentPlayer) {
                return <Text style={styles.currentPlayer}>{item.player}</Text>
              } else {
                return <Text>{item.player}</Text>
              }
            }}
            keyExtractor={item => item.playerEmail}
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
  const { roomState }  = this.state
  const socket = this.props.navigation.state.params.socket
  var pot = roomState.pot1;
  this.setState({ currentWord: pot[Math.floor(Math.random() * pot.length)]})
  this.setState({ roundStarted: true})
  socket.emit('start-timer', { room: roomState.name, player: this.state.currentUser.email })
}

next() {
  const { roomState } = this.state
  const socket = this.props.navigation.state.params.socket
  var i = roomState.pot1.indexOf(this.state.currentWord)
  if (i > -1) {
    roomState.pot1.splice(i, 1)
    roomState.pot2.push(this.state.currentWord)
  }

  if (roomState.pot1 == 0) {
    roomState.pot1 = roomState.pot2
    roomState.pot2 = []
  }


  var score = roomState.scores[roomState.currentTeam - 1][roomState.currentTeam.toString()] + 1

  socket.emit('inc-score', { score: score, totalScore: roomState.totalScore, noOfPlayers: roomState.noOfPlayers, currentTeam: roomState.currentTeam, room: roomState.name })
  this.setState({ currentWord: roomState.pot1[Math.floor(Math.random() * roomState.pot1.length)]})
}

render() {
  const { roomState, isLoading, counter, currentWord, roundStarted } = this.state

return  <View style={styles.container}>
          {isLoading ? <ActivityIndicator/> : (
            
          <View style={styles.teams}>
            {this.teamView()}
            {this.currentPlayerView()}
            {roundStarted ? <Text>{currentWord}</Text> : (<Text></Text>)}
            <Text>{ counter }</Text>
            <Text>{ roomState.currentRound }</Text>
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
  },
  currentPlayer: {
    color: 'red'
  }
})