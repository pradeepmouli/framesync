import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface ActivityLogEntry {
	id: string;
	timestamp: Date;
	type: 'upload' | 'delete' | 'sync';
	message: string;
	status: 'success' | 'error';
}

// TODO: Wire to persistent storage or activity service
const mockActivities: ActivityLogEntry[] = [];

export function ActivityScreen() {
	const [activities, setActivities] = useState<ActivityLogEntry[]>([]);

	useEffect(() => {
		setActivities(mockActivities);
	}, []);

	const renderItem = ({ item }: { item: ActivityLogEntry }) => {
		const statusColor = item.status === 'success' ? '#28a745' : '#dc3545';

		return (
			<View style={styles.item}>
				<View style={styles.header}>
					<Text style={styles.type}>{item.type.toUpperCase()}</Text>
					<Text style={styles.timestamp}>
						{item.timestamp.toLocaleString()}
					</Text>
				</View>
				<Text style={[styles.message, { color: statusColor }]}>
					{item.message}
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Activity Log</Text>

			{activities.length === 0 && (
				<Text style={styles.emptyText}>No recent activity</Text>
			)}

			<FlatList
				data={activities}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
			/>
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
	emptyText: {
		textAlign: 'center',
		color: '#999',
		marginTop: 32,
	},
	item: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	type: {
		fontWeight: '600',
		fontSize: 14,
	},
	timestamp: {
		fontSize: 12,
		color: '#666',
	},
	message: {
		fontSize: 14,
	},
});
