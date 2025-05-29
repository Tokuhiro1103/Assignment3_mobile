import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Share
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlaylistScreen() {
  /* ────────────────────────────────
     State
  ──────────────────────────────── */
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  /* ────────────────────────────────
     Initial fetch & notification permission
  ──────────────────────────────── */
  useEffect(() => {
    fetchPlaylists();
    fetchSongs();

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  /* ────────────────────────────────
     Data fetch helpers
  ──────────────────────────────── */
  const fetchPlaylists = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        'https://n11705264.ifn666.com/assignment2test/api/playlists',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch(
        'https://n11705264.ifn666.com/assignment2test/api/songs'
      );
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  };

  /* ────────────────────────────────
     Selection logic
  ──────────────────────────────── */
  const toggleSongSelection = (songId) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  /* ────────────────────────────────
     Create playlist
  ──────────────────────────────── */
  const handleCreatePlaylist = async () => {
    if (!name || selectedSongIds.length === 0) {
      Alert.alert('Error', 'Please enter a name and select at least one song.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        'https://n11705264.ifn666.com/assignment2test/api/playlists',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, description, songs: selectedSongIds })
        }
      );

      if (res.ok) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎵 Playlist Created!',
            body: `"${name}" was successfully created.`
          },
          trigger: null
        });

        resetForm();
        fetchPlaylists();
        Alert.alert('Success', 'Playlist created.');
      } else {
        const txt = await res.text();
        console.error('Create failed:', txt);
        Alert.alert('Failed', 'Could not create playlist.');
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  /* ────────────────────────────────
     Update playlist
  ──────────────────────────────── */
  const handleUpdatePlaylist = async () => {
    if (!name || selectedSongIds.length === 0) {
      Alert.alert('Error', 'Please enter a name and select at least one song.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        `https://n11705264.ifn666.com/assignment2test/api/playlists/${editPlaylist._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, description, songs: selectedSongIds })
        }
      );

      if (res.ok) {
        resetForm();
        fetchPlaylists();
        Alert.alert('Success', 'Playlist updated.');
      } else {
        const txt = await res.text();
        console.error('Update failed:', txt);
        Alert.alert('Failed', 'Could not update playlist.');
      }
    } catch (err) {
      console.error('Error updating playlist:', err);
    }
  };

  /* ────────────────────────────────
     Delete playlist
  ──────────────────────────────── */
  const handleDeletePlaylist = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(
        `https://n11705264.ifn666.com/assignment2test/api/playlists/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchPlaylists();
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };


  /* ────────────────────────────────
   Share playlist (with song list)
──────────────────────────────── */
const handleSharePlaylist = async (pl) => {
  try {
    // Make an array of song titles (fallback to the raw value if title is missing)
    const songLines = pl.songs?.map((s) =>
      typeof s === 'string' ? `• ${s}` : `• ${s.title}`
    ) || [];

    // Compose the share text
    const message = [
      `🎧  Playlist: ${pl.name}`,
      pl.description || '',
      '',
      'Songs:',
      ...songLines
    ].join('\n');

    await Share.share({
      title: pl.name,
      message         // same string for iOS & Android
    });
  } catch (err) {
    console.error('Error sharing playlist:', err);
    Alert.alert('Error', 'Failed to share the playlist.');
  }
};


  /* ────────────────────────────────
     Helper to reset form & state
  ──────────────────────────────── */
  const resetForm = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setEditPlaylist(null);
    setName('');
    setDescription('');
    setSelectedSongIds([]);
  };

  /* ────────────────────────────────
     Renderers
  ──────────────────────────────── */
  const renderSong = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => toggleSongSelection(item._id)}
        style={[
          styles.songItem,
          selectedSongIds.includes(item._id) && styles.songItemSelected
        ]}
      >
        <Text>
          {item.title} by {item.artist?.name || 'Unknown'}
        </Text>
      </TouchableOpacity>
    ),
    [selectedSongIds]
  );

  const renderPlaylist = ({ item }) => {
    const rightActions = () => (
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={() =>
          Alert.alert('Confirm', 'Delete this playlist?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => handleDeletePlaylist(item._id) }
          ])
        }
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={rightActions}>
        <View style={styles.item}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {!!item.songs?.length && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>Songs:</Text>
              {item.songs.map((s) => (
                <Text key={typeof s === 'string' ? s : s._id} style={styles.songInPlaylist}>
                  - {typeof s === 'string' ? s : s.title}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              const ids = item.songs.map((s) => (typeof s === 'string' ? s : s._id));
              setEditPlaylist({ ...item, songs: ids });
              setSelectedSongIds(ids);
              setName(item.name);
              setDescription(item.description);
              setIsEditing(true);
              setIsModalVisible(true);
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

  /* ────────────────────────────────
     JSX
  ──────────────────────────────── */
  return (
    <View style={styles.container}>
      <Button title="Create Playlist" onPress={() => setIsModalVisible(true)} />

      <Text style={styles.header}>Your Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item._id}
        renderItem={renderPlaylist}
      />

      {/* Create / Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modal}>
          <Text style={styles.header}>
            {isEditing ? 'Edit Playlist' : 'Create Playlist'}
          </Text>

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

          <Button
            title={isEditing ? 'Save Changes' : 'Create'}
            onPress={isEditing ? handleUpdatePlaylist : handleCreatePlaylist}
          />
          <Button title="Cancel" color="#888" onPress={resetForm} />
        </View>
      </Modal>
    </View>
  );
}

/* ────────────────────────────────
   Styles
──────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E0F7FA' },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  subHeader: { fontSize: 18, fontWeight: '600', marginTop: 15 },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5
  },
  item: {
    padding: 10,
    backgroundColor: '#e8e8e8',
    marginVertical: 5,
    borderRadius: 5
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#555' },
  songItem: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#eee',
    borderRadius: 5
  },
  songItemSelected: {
    backgroundColor: '#cce5ff'
  },
  songList: {
    maxHeight: 220,
    marginBottom: 10
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start'
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  shareButton: {
    marginTop: 8,
    backgroundColor: '#1e90ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start'
  },
  shareText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modal: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  songInPlaylist: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10
  },
  swipeDeleteButton: {
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 5
  }
});
