import React from 'react'
import { StyleSheet, Platform, Image, Text, View, Button } from 'react-native'
import * as firebase from 'firebase'

interface Props {
  navigation: any
}

interface State {
    currentUser: any,
    room: string
}

export default class GameRoom extends React.Component<Props> {
  state = { currentUser: null, room: '' }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    const room = this.props.navigation.state.params.roomName
    console.log(room)
    this.setState({ room })
}
render() {
    const { room } = this.state
return (
      <View style={styles.container}>
        <Text>
          {room}
        </Text>
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
  }
})