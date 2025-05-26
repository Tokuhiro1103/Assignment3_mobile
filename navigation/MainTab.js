import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Pages/Home';
import PlaylistScreen from '../Pages/Playlist';
import SongScreen from '../Pages/Song';
import ArtistScreen from '../Pages/Artist';

const Tab = createBottomTabNavigator();

export default function MainTab() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Playlists" component={PlaylistScreen} />
      <Tab.Screen name="Songs" component={SongScreen} />
      <Tab.Screen name="Artists" component={ArtistScreen} />
    </Tab.Navigator>
  );
}