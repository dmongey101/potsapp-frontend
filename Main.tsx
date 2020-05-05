import React from 'react'
import { StyleSheet, Platform, Image, Text, View, Button } from 'react-native'
import * as firebase from 'firebase'
import { socket } from './Socket'

interface Props {
  navigation: any
}

export default class Main extends React.Component<Props> {
  state = { currentUser: null }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
}
render() {
    const { currentUser } = this.state
return (
      <View style={styles.container}>
        <Text>
          Welcome back {currentUser && currentUser.email}!
        </Text>

        <Button 
          title="Create Room"
          onPress={() => this.props.navigation.navigate('CreateRoom')} />
        <Button
          title="Join Room"
          onPress={() => this.props.navigation.navigate('JoinRoom')}
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
  }
})