import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { frameClient } from '../src/frameClient';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

type FrameArt = {
	id: string;
	title?: string;
	sizeBytes?: number;
};

export default function ManageScreen() {
	const [artList, setArtList] = useState<FrameArt[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const loadArt = async () => {
		setLoading(true);
		try {
			const items = await frameClient.listArt();
			setArtList(items);
		} catch (e: any) {
			Alert.alert('Error', `Failed to load art: ${e?.message || 'unknown'}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadArt();
	}, []);

	const toggleSelection = (id: string) => {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		setSelectedIds(newSet);
	};

	const deleteSelected = async () => {
		if (selectedIds.size === 0) {
			Alert.alert('No items selected');
			return;
		}

		Alert.alert(
			'Delete Confirmation',
			`Are you sure you want to delete ${selectedIds.size} item(s)?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						setDeleting(true);
						let successCount = 0;
						let failCount = 0;

						for (const id of selectedIds) {
							try {
								await frameClient.deleteArt(id);
								successCount++;
							} catch {
								failCount++;
							}
						}

						setDeleting(false);
						setSelectedIds(new Set());
						
						if (failCount > 0) {
							Alert.alert('Completed with errors', `Deleted ${successCount}, failed ${failCount}`);
						} else {
							Alert.alert('Success', `Deleted ${successCount} item(s)`);
						}
						
						await loadArt();
					},
				},
			]
		);
	};

	// iOS SwiftUI version
	if (Platform.OS === 'ios' && SwiftUIComponents) {
		const { Host, List, Section, Button, Text, VStack, HStack, Spacer } = SwiftUIComponents;

		return (
			<Host style={styles.container}>
				<VStack spacing={12}>
					<HStack spacing={8}>
						<Text font="title" fontWeight="semibold">Frame Media</Text>
						<Spacer />
						<Button action={loadArt} disabled={loading}>
							<Text>{loading ? 'Loading…' : 'Refresh'}</Text>
						</Button>
					</HStack>
					
					<List inset>
						<Section header={<Text>Images on Frame ({artList.length})</Text>}>
							{artList.length === 0 ? (
								<Text foregroundColor="secondary">No images on Frame</Text>
							) : (
								artList.map((item) => (
									<Button
										key={item.id}
										action={() => toggleSelection(item.id)}
									>
										<HStack spacing={8}>
											<Text>{selectedIds.has(item.id) ? '✓' : '○'}</Text>
											<VStack alignment="leading" spacing={4}>
												<Text>{item.title || item.id}</Text>
												{item.sizeBytes ? (
													<Text foregroundColor="secondary" font="caption">
														{(item.sizeBytes / 1024 / 1024).toFixed(2)} MB
													</Text>
												) : null}
											</VStack>
										</HStack>
									</Button>
								))
							)}
						</Section>
					</List>

					{selectedIds.size > 0 ? (
						<Button
							action={deleteSelected}
							disabled={deleting}
						>
							<Text>
								{deleting ? 'Deleting…' : `Delete ${selectedIds.size} item(s)`}
							</Text>
						</Button>
					) : null}

					<Button action={() => router.back()}>
						<Text>Back</Text>
					</Button>
				</VStack>
			</Host>
		);
	}

	// Fallback for Android/Web
	const { View, Text, FlatList, Pressable, Button, ActivityIndicator } = require('react-native');
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Frame Media ({artList.length})</Text>
				<Button title={loading ? 'Loading…' : 'Refresh'} onPress={loadArt} disabled={loading} />
			</View>
			
			{loading ? (
				<ActivityIndicator size="large" />
			) : artList.length === 0 ? (
				<Text style={styles.emptyText}>No images on Frame</Text>
			) : (
				<FlatList
					data={artList}
					keyExtractor={(item: FrameArt) => item.id}
					renderItem={({ item }: { item: FrameArt }) => (
						<Pressable
							style={[
								styles.item,
								selectedIds.has(item.id) && styles.itemSelected,
							]}
							onPress={() => toggleSelection(item.id)}
						>
							<Text style={styles.itemText}>
								{selectedIds.has(item.id) ? '✓ ' : '○ '}
								{item.title || item.id}
							</Text>
							{item.sizeBytes ? (
								<Text style={styles.itemSize}>
									{(item.sizeBytes / 1024 / 1024).toFixed(2)} MB
								</Text>
							) : null}
						</Pressable>
					)}
				/>
			)}

			{selectedIds.size > 0 ? (
				<Button
					title={deleting ? 'Deleting…' : `Delete ${selectedIds.size} item(s)`}
					onPress={deleteSelected}
					disabled={deleting}
				/>
			) : null}

			<View style={{ height: 8 }} />
			<Button title="Back" onPress={() => router.back()} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
	title: { fontSize: 20, fontWeight: '600' },
	emptyText: { textAlign: 'center', marginTop: 24, color: '#666' },
	item: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	itemSelected: {
		backgroundColor: '#e3f2fd',
	},
	itemText: { fontSize: 16 },
	itemSize: { fontSize: 12, color: '#666', marginTop: 4 },
});
