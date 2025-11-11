import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { frameClient } from '../src/frameClient';
import { activityLog } from '../src/activityLog';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

type Album = {
	id: string;
	title: string;
	assetCount: number;
};

type DeletionMode = 'add-only' | 'mirror';

export default function SyncScreen() {
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
	const [albums, setAlbums] = useState<Album[]>([]);
	const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
	const [deletionMode, setDeletionMode] = useState<DeletionMode>('add-only');
	const [syncing, setSyncing] = useState(false);
	const [progress, setProgress] = useState('');

	useEffect(() => {
		(async () => {
			if (!permissionResponse || permissionResponse.status !== 'granted') {
				const res = await requestPermission();
				if (!res?.granted) return;
			}
			const albumsResult = await MediaLibrary.getAlbumsAsync();
			setAlbums(albumsResult);
		})();
	}, [permissionResponse?.status]);

	const startSync = async () => {
		if (!selectedAlbum) {
			Alert.alert('Select an album first');
			return;
		}

		setSyncing(true);
		setProgress('Getting album photos...');

		try {
			// Get all assets from the album
			const albumAssets = await MediaLibrary.getAssetsAsync({
				album: selectedAlbum.id,
				mediaType: 'photo',
				first: 1000, // Get up to 1000 photos
			});

			setProgress(`Found ${albumAssets.assets.length} photos in album`);
			
			// Get current Frame media to check for duplicates
			setProgress('Checking Frame for existing photos...');
			const frameMedia = await frameClient.listArt();
			const frameIds = new Set(frameMedia.map((m) => m.id));

			let addedCount = 0;
			let skippedCount = 0;
			let failedCount = 0;

			// Upload each photo that's not already on the Frame
			for (let i = 0; i < albumAssets.assets.length; i++) {
				const asset = albumAssets.assets[i];
				setProgress(`Processing ${i + 1}/${albumAssets.assets.length}: ${asset.filename || asset.id}`);

				// Simple deduplication: check if asset ID is already on Frame
				// In a real implementation, this would use content fingerprints
				if (frameIds.has(asset.id)) {
					skippedCount++;
					continue;
				}

				try {
					const result = await frameClient.sendPhoto(asset.id);
					if (result.id) {
						addedCount++;
					}
				} catch (e) {
					console.error(`Failed to upload ${asset.id}:`, e);
					failedCount++;
				}
			}

			// Handle deletion mode
			if (deletionMode === 'mirror') {
				setProgress('Checking for items to remove from Frame...');
				const albumAssetIds = new Set(albumAssets.assets.map((a) => a.id));
				const toDelete = frameMedia.filter((m) => !albumAssetIds.has(m.id));

				if (toDelete.length > 0) {
					const confirmDelete = await new Promise<boolean>((resolve) => {
						Alert.alert(
							'Mirror Mode',
							`${toDelete.length} item(s) on Frame are not in the album. Delete them?`,
							[
								{ text: 'Cancel', onPress: () => resolve(false) },
								{ text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
							]
						);
					});

					if (confirmDelete) {
						for (const item of toDelete) {
							try {
								await frameClient.deleteArt(item.id);
							} catch (e) {
								console.error(`Failed to delete ${item.id}:`, e);
							}
						}
					}
				}
			}

			setProgress('Sync complete');
			
			await activityLog.add('sync', failedCount > 0 ? 'error' : 'success',
				`Album sync: ${addedCount} added, ${skippedCount} skipped`,
				{ count: addedCount, albumName: selectedAlbum.title });
			
			Alert.alert(
				'Sync Complete',
				`Added: ${addedCount}\nSkipped (duplicates): ${skippedCount}\nFailed: ${failedCount}`
			);
		} catch (e: any) {
			await activityLog.add('sync', 'error', `Sync failed: ${e?.message || 'unknown'}`,
				{ albumName: selectedAlbum?.title });
			Alert.alert('Sync Error', e?.message || 'Unknown error');
		} finally {
			setSyncing(false);
		}
	};

	// iOS SwiftUI version
	if (Platform.OS === 'ios' && SwiftUIComponents) {
		const { Host, List, Section, Button, Text, VStack, HStack, Picker } = SwiftUIComponents;

		return (
			<Host style={styles.container}>
				<VStack spacing={16}>
					<Text font="title" fontWeight="semibold">Album Sync</Text>

					<List inset>
						<Section header={<Text>Select Album</Text>}>
							{albums.length === 0 ? (
								<Text foregroundColor="secondary">No albums found</Text>
							) : (
								albums.map((album) => (
									<Button
										key={album.id}
										action={() => setSelectedAlbum(album)}
									>
										<HStack spacing={8}>
											<Text>{selectedAlbum?.id === album.id ? '✓' : '○'}</Text>
											<VStack alignment="leading">
												<Text>{album.title}</Text>
												<Text foregroundColor="secondary" font="caption">
													{album.assetCount} photos
												</Text>
											</VStack>
										</HStack>
									</Button>
								))
							)}
						</Section>

						<Section header={<Text>Deletion Mode</Text>}>
							<Picker
								selection={deletionMode}
								onChange={(value: string) => setDeletionMode(value as DeletionMode)}
							>
								<Picker.Item label="Add-only (don't delete)" value="add-only" />
								<Picker.Item label="Mirror (sync deletions)" value="mirror" />
							</Picker>
						</Section>
					</List>

					{syncing && progress ? (
						<Text foregroundColor="secondary">{progress}</Text>
					) : null}

					<Button
						action={startSync}
						disabled={!selectedAlbum || syncing}
					>
						<Text>{syncing ? 'Syncing…' : 'Start Sync'}</Text>
					</Button>

					<Button action={() => router.back()}>
						<Text>Back</Text>
					</Button>
				</VStack>
			</Host>
		);
	}

	// Fallback for Android/Web
	const { View, Text, FlatList, Pressable, Button, ActivityIndicator, Picker } = require('react-native');
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Album Sync</Text>

			<Text style={styles.sectionTitle}>Select Album</Text>
			{albums.length === 0 ? (
				<Text style={styles.emptyText}>No albums found</Text>
			) : (
				<FlatList
					data={albums}
					keyExtractor={(album: Album) => album.id}
					renderItem={({ item }: { item: Album }) => (
						<Pressable
							style={[
								styles.albumItem,
								selectedAlbum?.id === item.id && styles.albumItemSelected,
							]}
							onPress={() => setSelectedAlbum(item)}
						>
							<Text style={styles.albumTitle}>
								{selectedAlbum?.id === item.id ? '✓ ' : '○ '}
								{item.title}
							</Text>
							<Text style={styles.albumCount}>{item.assetCount} photos</Text>
						</Pressable>
					)}
				/>
			)}

			<Text style={styles.sectionTitle}>Deletion Mode</Text>
			<Picker
				selectedValue={deletionMode}
				onValueChange={(value: DeletionMode) => setDeletionMode(value)}
				style={styles.picker}
			>
				<Picker.Item label="Add-only (don't delete)" value="add-only" />
				<Picker.Item label="Mirror (sync deletions)" value="mirror" />
			</Picker>

			{syncing ? (
				<View style={styles.progressContainer}>
					<ActivityIndicator size="small" />
					<Text style={styles.progressText}>{progress}</Text>
				</View>
			) : null}

			<Button
				title={syncing ? 'Syncing…' : 'Start Sync'}
				onPress={startSync}
				disabled={!selectedAlbum || syncing}
			/>

			<View style={{ height: 8 }} />
			<Button title="Back" onPress={() => router.back()} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
	sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
	emptyText: { textAlign: 'center', color: '#666', paddingVertical: 16 },
	albumItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	albumItemSelected: {
		backgroundColor: '#e3f2fd',
	},
	albumTitle: { fontSize: 16 },
	albumCount: { fontSize: 12, color: '#666', marginTop: 4 },
	picker: { height: 50, marginBottom: 16 },
	progressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 12,
		gap: 8,
	},
	progressText: { fontSize: 14, color: '#666' },
});
