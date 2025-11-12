import { useState, useEffect } from 'react';
import {
	View,
	Text,
	FlatList,
	Button,
	StyleSheet,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
} from 'react-native';

import { FrameApiClient } from '../api/client';
import type { FrameMedia } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function MediaListScreen() {
	const [media, setMedia] = useState<FrameMedia[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const client = new FrameApiClient(API_BASE_URL);

	const loadMedia = async () => {
		try {
			setLoading(true);
			const items = await client.listMedia();
			setMedia(items);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Load Failed', message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (selectedIds.size === 0) {
			Alert.alert('No Selection', 'Please select items to delete');
			return;
		}

		Alert.alert(
			'Confirm Delete',
			`Delete ${selectedIds.size} item(s)?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							setLoading(true);
							for (const mediaId of selectedIds) {
								await client.deleteMedia(mediaId);
							}
							setSelectedIds(new Set());
							await loadMedia();
							Alert.alert('Success', 'Items deleted');
						} catch (error) {
							const message = error instanceof Error ? error.message : 'Unknown error';
							Alert.alert('Delete Failed', message);
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};

	const toggleSelection = (id: string) => {
		const updated = new Set(selectedIds);
		if (updated.has(id)) {
			updated.delete(id);
		} else {
			updated.add(id);
		}
		setSelectedIds(updated);
	};

	useEffect(() => {
		void loadMedia();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Frame Media</Text>

			{loading && <ActivityIndicator size="large" style={styles.loader} />}

			<FlatList
				data={media}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={[
							styles.mediaItem,
							selectedIds.has(item.id) && styles.selectedItem,
						]}
						onPress={() => { toggleSelection(item.id); }}
					>
						<Text style={styles.mediaTitle}>{item.title ?? item.id}</Text>
						{item.createdAt && (
							<Text style={styles.mediaDate}>
								{new Date(item.createdAt).toLocaleDateString()}
							</Text>
						)}
					</TouchableOpacity>
				)}
				ListEmptyComponent={
					!loading ? <Text style={styles.empty}>No media on Frame</Text> : null
				}
				style={styles.list}
			/>

			<View style={styles.actions}>
				<Button title="Refresh" onPress={() => { void loadMedia(); }} disabled={loading} />
				<Button
					title={`Delete (${selectedIds.size})`}
					onPress={() => { void handleDelete(); }}
					disabled={loading || selectedIds.size === 0}
					color="#d9534f"
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	loader: {
		marginVertical: 16,
	},
	list: {
		flex: 1,
	},
	mediaItem: {
		padding: 12,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		marginBottom: 8,
	},
	selectedItem: {
		borderColor: '#007bff',
		backgroundColor: '#e7f3ff',
	},
	mediaTitle: {
		fontSize: 16,
		fontWeight: '500',
	},
	mediaDate: {
		fontSize: 12,
		color: '#666',
		marginTop: 4,
	},
	empty: {
		textAlign: 'center',
		color: '#999',
		marginTop: 32,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 16,
	},
});
