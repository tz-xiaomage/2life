import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import TabNavigator from 'react-native-tab-navigator';
import BottomTabs from '../common/BottomTabs';
import AgendaScreen from "./AgendaScreen";
import ProfileScreen from "./ProfileScreen";

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return	<BottomTabs 
    	page1 = {
    		<AgendaScreen navigator={this.props.navigator}/>
    	}
    	page2 = {
    		<ProfileScreen navigator={this.props.navigator}/>
    	}
    />
  }
}

const styles = StyleSheet.create({
  
});