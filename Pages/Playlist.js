import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { Share } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Swipeable } from 'react-native-gesture-handler';


import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlaylistScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://n11705264.ifn666.com/assignment2test/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await fetch("https://n11705264.ifn666.com/assignment2test/api/songs");
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongIds(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // const handleCreatePlaylist = async () => {
  //   if (!name || selectedSongIds.length === 0) {
  //     Alert.alert("Error", "Please enter a name and select at least one song.");
  //     return;
  //   }

  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const response = await fetch('https://n11705264.ifn666.com/assignment2test/api/playlists', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         name,
  //         description,
  //         songs: selectedSongIds
  //       }),
  //     });

  //     if (response.ok) {
  //       Alert.alert("Success", "Playlist created!");
  //       setName('');
  //       setDescription('');
  //       setSelectedSongIds([]);
  //       fetchPlaylists();
  //     } else {
  //       const errorText = await response.text();
  //       console.error("Create failed:", errorText);
  //       Alert.alert("Failed", "Could not create playlist.");
  //     }
  //   } catch (error) {
  //     console.error("Error creating playlist:", error);
  //   }
  // };

  const handleCreatePlaylist = async () => {
  if (!name || selectedSongIds.length === 0) {
    Alert.alert("Error", "Please enter a name and select at least one song.");
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('https://n11705264.ifn666.com/assignment2test/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        songs: selectedSongIds
      }),
    });

    if (response.ok) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎵 Playlist Created!",
          body: `Playlist "${name}" has been successfully created.`,
        },
        trigger: null, // 即時通知
      });

      Alert.alert("Success", "Playlist created!");
      setName('');
      setDescription('');
      setSelectedSongIds([]);
      fetchPlaylists();
    } else {
      const errorText = await response.text();
      console.error("Create failed:", errorText);
      Alert.alert("Failed", "Could not create playlist.");
    }
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
};


  const handleDeletePlaylist = async (playlistId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://n11705264.ifn666.com/assignment2test/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Alert.alert("Deleted", "Playlist has been deleted.");
        fetchPlaylists();
      } else {
        const text = await response.text();
        console.error("Delete failed:", text);
        Alert.alert("Error", "Could not delete playlist.");
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      Alert.alert("Error", "An error occurred.");
    }
  };

  const handleUpdatePlaylist = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://n11705264.ifn666.com/assignment2test/api/playlists/${editPlaylist._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editPlaylist.name,
          description: editPlaylist.description,
          songs: editPlaylist.songs.map((s) => typeof s === 'string' ? s : s._id),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Playlist updated!");
        setIsEditing(false);
        setEditPlaylist(null);
        fetchPlaylists();
      } else {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        Alert.alert("Error", "Could not update playlist.");
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const handleSharePlaylist = async (playlist) => {
  try {
    const songList = playlist.songs
      .map((song) => `- ${song.title} by ${song.artist?.name || 'Unknown'}`)
      .join('\n');

    const message = `🎵 My Playlist: ${playlist.name}\n\n${playlist.description}\n\n${songList}`;

    await Share.share({
      message,
    });
  } catch (error) {
    console.error('Error sharing playlist:', error);
  }
};


  const renderSong = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSongSelection(item._id)}
      style={[
        styles.songItem,
        selectedSongIds.includes(item._id) && styles.songItemSelected
      ]}
    >
      <Text>{item.title} by {item.artist?.name || "Unknown"}</Text>
    </TouchableOpacity>
  );

  // const renderPlaylist = ({ item }) => (
  //   <View style={styles.item}>
  //     <Text style={styles.name}>{item.name}</Text>
  //     <Text style={styles.description}>{item.description}</Text>

  //     {item.songs && item.songs.length > 0 && (
  //       <View style={{ marginTop: 8 }}>
  //         <Text style={{ fontWeight: 'bold' }}>Songs:</Text>
  //         {item.songs.map((song) => (
  //           <Text key={song._id} style={styles.songInPlaylist}>
  //             - {song.title} by {song.artist?.name || 'Unknown'}
  //           </Text>
  //         ))}
  //       </View>
  //     )}

  //     <TouchableOpacity
  //       style={styles.editButton}
  //       onPress={() => {
  //         const songIds = item.songs.map((s) => typeof s === 'string' ? s : s._id);
  //         setEditPlaylist({ ...item, songs: songIds });
  //         setIsEditing(true);
  //       }}
  //     >
  //       <Text style={styles.editText}>Edit</Text>
  //     </TouchableOpacity>

  //       <TouchableOpacity
  //         style={styles.shareButton}
  //         onPress={() => handleSharePlaylist(item)}
  //       >
  //       <Text style={styles.shareText}>Share</Text>
  //       </TouchableOpacity>

  //     <TouchableOpacity
  //       style={styles.deleteButton}
  //       onPress={() =>
  //         Alert.alert("Confirm", "Delete this playlist?", [
  //           { text: "Cancel", style: "cancel" },
  //           { text: "OK", onPress: () => handleDeletePlaylist(item._id) },
  //         ])
  //       }
  //     >
  //       <Text style={styles.deleteText}>Delete</Text>
  //     </TouchableOpacity>
  //   </View>
  // );



const renderPlaylist = ({ item }) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.swipeDeleteButton}
      onPress={() =>
        Alert.alert("Confirm", "Delete this playlist?", [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => handleDeletePlaylist(item._id) },
        ])
      }
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.item}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {item.songs && item.songs.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Songs:</Text>
            {item.songs.map((song) => (
              <Text key={song._id} style={styles.songInPlaylist}>
                - {song.title} by {song.artist?.name || 'Unknown'}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            const songIds = item.songs.map((s) =>
              typeof s === 'string' ? s : s._id
            );
            setEditPlaylist({ ...item, songs: songIds });
            setIsEditing(true);
          }}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleSharePlaylist(item)}
        >
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Playlist</Text>
      <TextInput
        style={styles.input}
        placeholder="Playlist name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.subHeader}>Select Songs</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        renderItem={renderSong}
        style={styles.songList}
      />
      <Button title="Create" onPress={handleCreatePlaylist} />

      <Text style={styles.header}>Your Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item._id}
        renderItem={renderPlaylist}
      />

      {isEditing && editPlaylist && (
        <View style={styles.modal}>
          <Text style={styles.header}>Edit Playlist</Text>
          <TextInput
            style={styles.input}
            value={editPlaylist.name}
            onChangeText={(text) => setEditPlaylist({ ...editPlaylist, name: text })}
          />
          <TextInput
            style={styles.input}
            value={editPlaylist.description}
            onChangeText={(text) => setEditPlaylist({ ...editPlaylist, description: text })}
          />
          <Text style={styles.subHeader}>Edit Songs</Text>
          <FlatList
            data={songs}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const currentIds = editPlaylist.songs.map((s) => typeof s === 'string' ? s : s._id);
              const isSelected = currentIds.includes(item._id);
              return (
                <TouchableOpacity
                  onPress={() => {
                    const updated = isSelected
                      ? editPlaylist.songs.filter((id) => (typeof id === 'string' ? id : id._id) !== item._id)
                      : [...currentIds, item._id];
                    setEditPlaylist({ ...editPlaylist, songs: updated });
                  }}
                  style={[
                    styles.songItem,
                    isSelected && styles.songItemSelected,
                  ]}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <Button title="Save Changes" onPress={handleUpdatePlaylist} />
          <Button title="Cancel" onPress={() => setIsEditing(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  subHeader: { fontSize: 18, fontWeight: '600', marginTop: 15 },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    backgroundColor: '#e8e8e8',
    marginVertical: 5,
    borderRadius: 5,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#555' },
  songItem: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  songItemSelected: {
    backgroundColor: "#cce5ff",
  },
  songList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 8,
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 10,
  },
  songInPlaylist: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  shareButton: {
  marginTop: 8,
  backgroundColor: "#1e90ff",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 5,
  alignSelf: "flex-start",
},
shareText: {
  color: "#fff",
  fontWeight: "bold",
},
swipeDeleteButton: {
  backgroundColor: '#ff4d4d',
  justifyContent: 'center',
  alignItems: 'center',
  width: 80,
  height: '100%',
  borderRadius: 5,
},

});
