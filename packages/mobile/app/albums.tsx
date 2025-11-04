import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function AlbumsScreen() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    (async () => {
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        await requestPermission();
      }
      const page = await MediaLibrary.getAssetsAsync({ mediaType: 'photo', first: 50 });
      setAssets(page.assets);
    })();
  }, [permissionResponse]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a photo</Text>
      <FlatList
        data={assets}
        keyExtractor={(a) => a.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.thumb} />
        )}
      />
      <Button title="Send" onPress={() => router.push('/send')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  thumb: { width: 110, height: 110, margin: 2, borderRadius: 6 },
});
