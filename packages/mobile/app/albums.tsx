import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

export default function AlbumsScreen() {
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
	const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
	const [selected, setSelected] = useState<MediaLibrary.Asset | null>(null);

	useEffect(() => {
		(async () => {
			if (!permissionResponse || permissionResponse.status !== 'granted') {
				const res = await requestPermission();
				if (!res?.granted) return;
			}
			const page = await MediaLibrary.getAssetsAsync({ mediaType: 'photo', first: 60 });
			setAssets(page.assets);
		})();
	}, [permissionResponse?.status]);

	const goSend = () => {
		if (!selected) {
			Alert.alert('Select a photo first');
			return;
		}
		router.push({ pathname: '/send', params: { id: selected.id } });
	};

	// iOS SwiftUI version
	if (Platform.OS === 'ios' && SwiftUIComponents) {
		const { Host, ScrollView, LazyVGrid, AsyncImage, Button, Text, VStack } = SwiftUIComponents;

		return (
			<Host style={styles.container}>
				<VStack spacing={8}>
					<Text font="title" fontWeight="semibold">Pick a Photo</Text>
					<ScrollView>
						<LazyVGrid columns={3} spacing={4}>
							{assets.map((asset) => (
								<AsyncImage
									key={asset.id}
									url={asset.uri}
									contentMode="aspectFill"
									frame={{ width: 110, height: 110 }}
									cornerRadius={6}
									onTapGesture={() => setSelected(asset)}
									overlay={
										selected?.id === asset.id
											? { border: { color: 'blue', width: 3 } }
											: undefined
									}
								/>
							))}
						</LazyVGrid>
					</ScrollView>
					<Button action={goSend}>
						<Text>Send</Text>
					</Button>
				</VStack>
			</Host>
		);
	}

	// Fallback for Android/Web
	const { View, Text, FlatList, Image, Pressable, Button } = require('react-native');
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Pick a Photo</Text>
			<FlatList
				data={assets}
				keyExtractor={(a: MediaLibrary.Asset) => a.id}
				numColumns={3}
				contentContainerStyle={{ paddingVertical: 8 }}
				renderItem={({ item }: { item: MediaLibrary.Asset }) => (
					<Pressable onPress={() => setSelected(item)}>
						<Image
							source={{ uri: item.uri }}
							style={[styles.thumb, selected?.id === item.id && styles.thumbSelected]}
						/>
					</Pressable>
				)}
			/>
			<Button title="Send" onPress={goSend} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 8 },
	title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
	thumb: { width: 110, height: 110, margin: 2, borderRadius: 6 },
	thumbSelected: { borderWidth: 3, borderColor: '#007aff' },
});
