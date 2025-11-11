import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { activityLog, Activity } from '../src/activityLog';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

export default function ActivityScreen() {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);

	const loadActivities = async () => {
		setLoading(true);
		try {
			const recent = await activityLog.getRecent(50);
			setActivities(recent);
		} catch (e: any) {
			Alert.alert('Error', `Failed to load activity: ${e?.message || 'unknown'}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadActivities();
	}, []);

	const clearLog = async () => {
		Alert.alert(
			'Clear Activity Log',
			'Are you sure you want to clear all activity history?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear',
					style: 'destructive',
					onPress: async () => {
						await activityLog.clear();
						await loadActivities();
					},
				},
			]
		);
	};

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString();
	};

	const getActivityIcon = (type: string, status: string) => {
		if (status === 'error') return '❌';
		switch (type) {
			case 'upload': return '📤';
			case 'delete': return '🗑️';
			case 'sync': return '🔄';
			default: return '•';
		}
	};

	// iOS SwiftUI version
	if (Platform.OS === 'ios' && SwiftUIComponents) {
		const { Host, List, Section, Button, Text, VStack, HStack, Spacer } = SwiftUIComponents;

		return (
			<Host style={styles.container}>
				<VStack spacing={12}>
					<HStack spacing={8}>
						<Text font="title" fontWeight="semibold">Activity</Text>
						<Spacer />
						<Button action={loadActivities} disabled={loading}>
							<Text>{loading ? 'Loading…' : 'Refresh'}</Text>
						</Button>
					</HStack>

					<List inset>
						<Section header={<Text>Recent Activity ({activities.length})</Text>}>
							{activities.length === 0 ? (
								<Text foregroundColor="secondary">No recent activity</Text>
							) : (
								activities.map((activity) => (
									<VStack key={activity.id} alignment="leading" spacing={4}>
										<HStack spacing={8}>
											<Text>{getActivityIcon(activity.type, activity.status)}</Text>
											<VStack alignment="leading" spacing={2}>
												<Text>{activity.message}</Text>
												<Text foregroundColor="secondary" font="caption">
													{formatTimestamp(activity.timestamp)}
												</Text>
												{activity.details?.count !== undefined ? (
													<Text foregroundColor="secondary" font="caption">
														Count: {activity.details.count}
													</Text>
												) : null}
											</VStack>
										</HStack>
									</VStack>
								))
							)}
						</Section>
					</List>

					{activities.length > 0 ? (
						<Button action={clearLog}>
							<Text>Clear Activity Log</Text>
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
	const { View, Text, FlatList, Button, ActivityIndicator } = require('react-native');
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Activity ({activities.length})</Text>
				<Button title={loading ? 'Loading…' : 'Refresh'} onPress={loadActivities} disabled={loading} />
			</View>

			{loading ? (
				<ActivityIndicator size="large" />
			) : activities.length === 0 ? (
				<Text style={styles.emptyText}>No recent activity</Text>
			) : (
				<FlatList
					data={activities}
					keyExtractor={(item: Activity) => item.id}
					renderItem={({ item }: { item: Activity }) => (
						<View style={styles.activityItem}>
							<Text style={styles.activityIcon}>
								{getActivityIcon(item.type, item.status)}
							</Text>
							<View style={styles.activityContent}>
								<Text style={styles.activityMessage}>{item.message}</Text>
								<Text style={styles.activityTime}>
									{formatTimestamp(item.timestamp)}
								</Text>
								{item.details?.count !== undefined ? (
									<Text style={styles.activityDetails}>
										Count: {item.details.count}
									</Text>
								) : null}
							</View>
						</View>
					)}
				/>
			)}

			{activities.length > 0 ? (
				<Button title="Clear Activity Log" onPress={clearLog} />
			) : null}

			<View style={{ height: 8 }} />
			<Button title="Back" onPress={() => router.back()} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: { fontSize: 20, fontWeight: '600' },
	emptyText: { textAlign: 'center', marginTop: 24, color: '#666' },
	activityItem: {
		flexDirection: 'row',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	activityIcon: { fontSize: 20, marginRight: 12 },
	activityContent: { flex: 1 },
	activityMessage: { fontSize: 14, fontWeight: '500' },
	activityTime: { fontSize: 12, color: '#666', marginTop: 4 },
	activityDetails: { fontSize: 12, color: '#666', marginTop: 2 },
});
