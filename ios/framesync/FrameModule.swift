import Foundation
#if canImport(React)
import React
#else
@objc protocol RCTBridgeModule {}
typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void
#endif
#if canImport(SwiftSamsungFrame)
import SwiftSamsungFrame
#else
final class TVClient {}
#endif
#if canImport(OSLog)
import OSLog
#endif
#if canImport(Photos)
import Photos
#endif

@objc(FrameModule)
final class FrameModule: NSObject, RCTBridgeModule {
	private let bridgeActor = FrameNativeBridge()
	private let dateFormatter: ISO8601DateFormatter = {
		let formatter = ISO8601DateFormatter()
		formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
		return formatter
	}()

	#if canImport(OSLog)
	private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.mouli.framesync", category: "FrameModule")
	#endif

	@objc static func moduleName() -> String! {
		"FrameModule"
	}

	@objc static func requiresMainQueueSetup() -> Bool {
		false
	}

	@objc(listMedia:rejecter:)
	func listMedia(_ resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
		perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let media = await self.bridgeActor.listMedia()
			let payload = media.map { $0.toDictionary(dateFormatter: dateFormatter) }
			return ["items": payload]
		}
	}

	@objc(uploadPhoto:resolver:rejecter:)
	func uploadPhoto(_ payload: NSDictionary,
					resolver resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let request = try UploadPhotoRequest(payload: payload)
				let acceptance = try await self.bridgeActor.uploadPhoto(request: request)
			return acceptance.toDictionary(dateFormatter: dateFormatter)
		}
	}

	@objc(deleteMedia:resolver:rejecter:)
	func deleteMedia(_ mediaId: String,
					resolver resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [self] in
				let result = try await self.bridgeActor.deleteMedia(mediaId: mediaId)
			return result.toDictionary()
		}
	}

	@objc(syncAlbum:resolver:rejecter:)
	func syncAlbum(_ payload: NSDictionary,
				  resolver resolve: @escaping RCTPromiseResolveBlock,
				  rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let request = try SyncAlbumRequest(payload: payload)
				let acceptance = try await self.bridgeActor.syncAlbum(request: request)
			return acceptance.toDictionary(dateFormatter: dateFormatter)
		}
	}

	@objc(getSyncJob:resolver:rejecter:)
	func getSyncJob(_ jobId: String,
				   resolver resolve: @escaping RCTPromiseResolveBlock,
				   rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
				let job = try await self.bridgeActor.getSyncJob(jobId: jobId)
			return job.toDictionary(dateFormatter: dateFormatter)
		}
	}

	private func perform(
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock,
		operation: @escaping () async throws -> Any
	) {
		Task {
			do {
				let value = try await operation()
				dispatchToMainQueue {
					resolve(value)
				}
			} catch {
				self.handle(error, reject: reject)
			}
		}
	}

	private func handle(_ error: Error, reject: @escaping RCTPromiseRejectBlock) {
		let moduleError: FrameModuleError

		if let frameError = error as? FrameModuleError {
			moduleError = frameError
		} else {
			moduleError = .unexpected(error)
		}

		#if canImport(OSLog)
		logger.error("FrameModule error: \(moduleError.logDescription, privacy: .public)")
		#endif

		dispatchToMainQueue {
			reject(moduleError.code, moduleError.message, moduleError.asNSError())
		}
	}

	private func dispatchToMainQueue(_ work: @escaping () -> Void) {
		if Thread.isMainThread {
			work()
		} else {
			DispatchQueue.main.async(execute: work)
		}
	}
}

private actor FrameNativeBridge {
	// Default configuration constants
	private static let defaultTVHost = "192.168.1.100"
	private static let defaultTVPort = 8001
	private static let maxStoredJobs = 50
	private static let maxStoredUploads = 100
	
	#if canImport(SwiftSamsungFrame)
	private let tvClient = TVClient()
	#endif
	private var isConnected = false
	private var mediaLibrary: [FrameMediaRecord] = []
	private var uploadRequests: [String: UploadRecord] = [:]
	private var syncJobs: [String: SyncJobRecord] = [:]
	private let dateProvider: () -> Date
	private let tvHost: String
	private let tvPort: Int

	#if canImport(OSLog)
	private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.mouli.framesync", category: "FrameNativeBridge")
	#endif

	init(tvHost: String? = nil, tvPort: Int? = nil, dateProvider: @escaping () -> Date = Date.init) {
		// Try to get TV host from UserDefaults, environment, or use default
		if let host = tvHost {
			self.tvHost = host
		} else if let host = ProcessInfo.processInfo.environment["FRAME_TV_HOST"] {
			self.tvHost = host
		} else if let host = UserDefaults.standard.string(forKey: "FrameTVHost") {
			self.tvHost = host
		} else {
			self.tvHost = Self.defaultTVHost
		}
		
		// Try to get TV port from parameters, environment, or use default
		if let port = tvPort {
			self.tvPort = port
		} else if let portString = ProcessInfo.processInfo.environment["FRAME_TV_PORT"], let port = Int(portString) {
			self.tvPort = port
		} else if let port = UserDefaults.standard.object(forKey: "FrameTVPort") as? Int {
			self.tvPort = port
		} else {
			self.tvPort = Self.defaultTVPort
		}
		
		self.dateProvider = dateProvider
	}
	
	private func ensureConnected() async throws {
		#if canImport(SwiftSamsungFrame)
		guard !isConnected else { return }
		
		#if canImport(OSLog)
		logger.info("Connecting to TV at \(self.tvHost):\(self.tvPort)")
		#endif
		
		do {
			_ = try await tvClient.connect(to: tvHost, port: tvPort)
			isConnected = true
			
			#if canImport(OSLog)
			logger.info("Successfully connected to TV")
			#endif
		} catch {
			#if canImport(OSLog)
			logger.error("Failed to connect to TV: \(error.localizedDescription)")
			#endif
			isConnected = false  // Reset connection state on failure
			throw FrameModuleError.unexpected(error)
		}
		#else
		// When SwiftSamsungFrame is not available, we're in stub mode
		#if canImport(OSLog)
		logger.debug("SwiftSamsungFrame not available, using stub implementation")
		#endif
		#endif
	}
	
	// Helper method to fetch image data from Photos
	#if canImport(Photos)
	private func fetchImageData(for asset: PHAsset) async throws -> (Data, SwiftSamsungFrame.ImageType) {
		let imageManager = PHImageManager.default()
		let requestOptions = PHImageRequestOptions()
		requestOptions.isSynchronous = false
		requestOptions.deliveryMode = .highQualityFormat
		requestOptions.isNetworkAccessAllowed = true
		
		return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<(Data, SwiftSamsungFrame.ImageType), Error>) in
			imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { data, dataUTI, orientation, info in
				if let error = info?[PHImageErrorKey] as? Error {
					continuation.resume(throwing: error)
					return
				}
				
				guard let data = data else {
					continuation.resume(throwing: FrameModuleError.invalidArguments(reason: "Failed to fetch image data"))
					return
				}
				
				// Determine image type from dataUTI parameter
				let imageType: SwiftSamsungFrame.ImageType
				if let uti = dataUTI, uti.contains("png") {
					imageType = .png
				} else {
					imageType = .jpeg
				}
				
				continuation.resume(returning: (data, imageType))
			}
		}
	}
	#endif
	
	// Clean up old upload requests to prevent memory leaks
	private func cleanupOldUploads() {
		guard uploadRequests.count > Self.maxStoredUploads else { return }
		
		// Sort by requested time and keep only the most recent
		let sorted = uploadRequests.sorted { $0.value.requestedAt > $1.value.requestedAt }
		uploadRequests = Dictionary(uniqueKeysWithValues: sorted.prefix(Self.maxStoredUploads))
	}
	
	// Clean up old sync jobs to prevent memory leaks
	private func cleanupOldJobs() {
		guard syncJobs.count > Self.maxStoredJobs else { return }
		
		// Sort by started time and keep only the most recent
		let sorted = syncJobs.sorted { $0.value.startedAt > $1.value.startedAt }
		syncJobs = Dictionary(uniqueKeysWithValues: sorted.prefix(Self.maxStoredJobs))
	}

	func listMedia() async -> [FrameMediaRecord] {
		#if canImport(SwiftSamsungFrame)
		do {
			try await ensureConnected()
			
			#if canImport(OSLog)
			logger.info("Fetching art list from TV")
			#endif
			
			let artPieces = try await tvClient.art.listAvailable()
			
			#if canImport(OSLog)
			logger.info("Retrieved \(artPieces.count) art pieces from TV")
			#endif
			
			// Convert ArtPiece to FrameMediaRecord
			mediaLibrary = artPieces.map { art in
				FrameMediaRecord(
					id: art.id,
					title: art.title,
					createdAt: art.uploadDate,
					width: nil,  // ArtPiece doesn't expose dimensions
					height: nil,
					sizeBytes: art.fileSize,
					fingerprint: nil  // We'll use content_id as unique identifier
				)
			}
			
			return mediaLibrary
		} catch {
			#if canImport(OSLog)
			logger.error("Failed to list media: \(error.localizedDescription)")
			#endif
			
			isConnected = false  // Reset connection state on error
			// Fall back to cached library on error
			return mediaLibrary
		}
		#else
		// Stub implementation when SwiftSamsungFrame is not available
		#if canImport(OSLog)
		logger.debug("Listing cached media (count=\(self.mediaLibrary.count))")
		#endif
		return mediaLibrary
		#endif
	}

	func uploadPhoto(request: UploadPhotoRequest) async throws -> UploadAcceptance {
		#if canImport(OSLog)
		logger.info("Queueing upload for assetId=\(request.assetId, privacy: .public)")
		#endif

		let identifier = UUID().uuidString
		let now = dateProvider()
		let record = UploadRecord(id: identifier, status: .pending, requestedAt: now, assetId: request.assetId, convertIfNeeded: request.convertIfNeeded)
		uploadRequests[identifier] = record
		cleanupOldUploads()

		#if canImport(SwiftSamsungFrame) && canImport(Photos)
		do {
			try await ensureConnected()
			
			// Fetch the photo from the Photos library
			#if canImport(OSLog)
			logger.info("Fetching photo asset \(request.assetId)")
			#endif
			
			let fetchOptions = PHFetchOptions()
			let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [request.assetId], options: fetchOptions)
			
			guard let asset = fetchResult.firstObject else {
				uploadRequests.removeValue(forKey: identifier)  // Clean up failed upload
				throw FrameModuleError.invalidArguments(reason: "Photo asset not found: \(request.assetId)")
			}
			
			// Update status to started
			uploadRequests[identifier]?.status = .started
			
			// Fetch image data using helper method
			let (imageData, imageType) = try await fetchImageData(for: asset)
			
			#if canImport(OSLog)
			logger.info("Fetched image data: \(imageData.count) bytes, type: \(imageType == .jpeg ? "JPEG" : "PNG")")
			#endif
			
			// Upload to TV
			let contentId = try await tvClient.art.upload(imageData, type: imageType, matte: nil)
			
			#if canImport(OSLog)
			logger.info("Upload successful, content ID: \(contentId)")
			#endif
			
			// Update status to completed
			uploadRequests[identifier]?.status = .completed
			
			// Add to media library cache with user-friendly title
			let assetResources = PHAssetResource.assetResources(for: asset)
			let filename = assetResources.first?.originalFilename
			let formattedDate: String? = {
			    guard let date = asset.creationDate else { return nil }
			    let formatter = DateFormatter()
			    formatter.dateStyle = .medium
			    formatter.timeStyle = .short
			    return formatter.string(from: date)
			}()
			let title = filename ?? formattedDate ?? asset.localIdentifier
			
			let mediaRecord = FrameMediaRecord(
				id: contentId,
				title: title,
				createdAt: asset.creationDate,
				width: asset.pixelWidth,
				height: asset.pixelHeight,
				sizeBytes: imageData.count,
				fingerprint: contentId
			)
			mediaLibrary.append(mediaRecord)
			
			return UploadAcceptance(uploadId: identifier, status: .completed, acceptedAt: now)
		} catch {
			#if canImport(OSLog)
			logger.error("Upload failed: \(error.localizedDescription)")
			#endif
			
			uploadRequests[identifier]?.status = .failed
			// Note: Failed uploads remain in dictionary for status queries but will be cleaned up by cleanupOldUploads()
			throw FrameModuleError.unexpected(error)
		}
		#else
		// Stub implementation when SwiftSamsungFrame or Photos is not available
		#if canImport(OSLog)
		logger.warning("SwiftSamsungFrame or Photos framework not available, using stub upload")
		#endif
		return UploadAcceptance(uploadId: identifier, status: .pending, acceptedAt: now)
		#endif
	}

	func deleteMedia(mediaId: String) async throws -> DeleteResult {
		#if canImport(OSLog)
		logger.info("Deleting mediaId=\(mediaId, privacy: .public)")
		#endif

		#if canImport(SwiftSamsungFrame)
		do {
			try await ensureConnected()
			
			// Delete from TV
			try await tvClient.art.delete(mediaId)
			
			#if canImport(OSLog)
			logger.info("Successfully deleted media from TV")
			#endif
			
			// Remove from local cache
			let initialCount = mediaLibrary.count
			mediaLibrary.removeAll { $0.id == mediaId }
			let deleted = mediaLibrary.count < initialCount
			
			return DeleteResult(mediaId: mediaId, deleted: deleted)
		} catch {
			#if canImport(OSLog)
			logger.error("Delete failed: \(error.localizedDescription)")
			#endif
			isConnected = false  // Reset connection state on error
			throw FrameModuleError.unexpected(error)
		}
		#else
		// Stub implementation when SwiftSamsungFrame is not available
		let initialCount = mediaLibrary.count
		mediaLibrary.removeAll { $0.id == mediaId }
		let deleted = mediaLibrary.count < initialCount
		return DeleteResult(mediaId: mediaId, deleted: deleted)
		#endif
	}

	func syncAlbum(request: SyncAlbumRequest) async throws -> SyncAcceptance {
		#if canImport(OSLog)
		logger.info("Sync requested for albumId=\(request.albumId, privacy: .public) mode=\(request.deletionMode.rawValue, privacy: .public)")
		#endif

		let jobId = UUID().uuidString
		let now = dateProvider()
		syncJobs[jobId] = SyncJobRecord(
			id: jobId,
			albumId: request.albumId,
			startedAt: now,
			completedAt: nil,
			addedCount: 0,
			skippedDuplicates: 0,
			failedCount: 0,
			deletionMode: request.deletionMode
		)
		cleanupOldJobs()

		#if canImport(SwiftSamsungFrame) && canImport(Photos)
		// Start async sync job
		Task {
			do {
				try await self.performSync(jobId: jobId, request: request)
			} catch {
				#if canImport(OSLog)
				self.logger.error("Sync job failed: \(error.localizedDescription)")
				#endif
				
				// Update job with error
				if var job = self.syncJobs[jobId] {
					job.completedAt = self.dateProvider()
					self.syncJobs[jobId] = job
				}
			}
		}
		#else
		// Stub implementation
		#if canImport(OSLog)
		logger.warning("SwiftSamsungFrame or Photos framework not available, using stub sync")
		#endif
		#endif
		
		return SyncAcceptance(jobId: jobId, status: .pending, acceptedAt: now)
	}
	
	#if canImport(SwiftSamsungFrame) && canImport(Photos)
	private func performSync(jobId: String, request: SyncAlbumRequest) async throws {
		try await ensureConnected()
		
		// Fetch album
		#if canImport(OSLog)
		logger.info("Fetching album assets for \(request.albumId)")
		#endif
		
		let fetchOptions = PHFetchOptions()
		let albums = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [request.albumId], options: nil)
		
		guard let album = albums.firstObject else {
			#if canImport(OSLog)
			logger.error("Album not found: \(request.albumId)")
			#endif
			
			// Update job with failure
			if var job = syncJobs[jobId] {
				job.failedCount = 1
				job.completedAt = dateProvider()
				syncJobs[jobId] = job
			}
			return
		}
		
		let assetsFetchResult = PHAsset.fetchAssets(in: album, options: fetchOptions)
		
		#if canImport(OSLog)
		logger.info("Found \(assetsFetchResult.count) assets in album")
		#endif
		
		// Get current Frame media and build mapping
		let currentFrameMedia = try await tvClient.art.listAvailable()
		
		// Build a mapping of Frame content IDs we've uploaded
		var frameContentIds = Set<String>()
		for media in currentFrameMedia {
			frameContentIds.insert(media.id)
		}
		
		// Collect all image assets from album
		var assetsToProcess: [PHAsset] = []
		assetsFetchResult.enumerateObjects { asset, _, _ in
			if asset.mediaType == .image {
				assetsToProcess.append(asset)
			}
		}
		
		// Process uploads sequentially to properly track state
		var added = 0
		var skipped = 0
		var failed = 0
		
		for (index, asset) in assetsToProcess.enumerated() {
			// Note: This is simplified deduplication using content ID
			// A production implementation should use content hashing or persistent mapping
			let assetId = asset.localIdentifier
			
			// Skip if we think it's already uploaded (simplified check)
			// TODO: Implement proper content-based deduplication
			if frameContentIds.contains(assetId) {
				skipped += 1
				
				// Update job progress
				if var job = syncJobs[jobId] {
					job.skippedDuplicates = skipped
					syncJobs[jobId] = job
				}
				continue
			}
			
			// Upload the asset
			do {
				let (imageData, imageType) = try await fetchImageData(for: asset)
				
				#if canImport(OSLog)
				logger.info("Uploading asset \(index + 1)/\(assetsToProcess.count)")
				#endif
				
				let contentId = try await tvClient.art.upload(imageData, type: imageType, matte: nil)
				frameContentIds.insert(contentId)  // Track uploaded content
				added += 1
				
				#if canImport(OSLog)
				logger.info("Uploaded asset \(index + 1)/\(assetsToProcess.count): \(contentId)")
				#endif
				
				// Update job progress
				if var job = syncJobs[jobId] {
					job.addedCount = added
					syncJobs[jobId] = job
				}
			} catch {
				#if canImport(OSLog)
				logger.error("Failed to upload asset \(index + 1): \(error.localizedDescription)")
				#endif
				failed += 1
				
				// Update job progress
				if var job = syncJobs[jobId] {
					job.failedCount = failed
					syncJobs[jobId] = job
				}
			}
		}
		
		// Handle deletion mode if mirror
		if request.deletionMode == .mirror {
			// Build set of asset IDs in album
			var albumAssetIds = Set<String>()
			for asset in assetsToProcess {
				albumAssetIds.insert(asset.localIdentifier)
			}
			
			// Note: This deletion logic has a known limitation - it compares Frame content IDs
			// with local asset identifiers, which are different types. A production implementation
			// needs a persistent mapping between local identifiers and Frame content IDs.
			// For now, we skip deletion to avoid accidentally deleting all Frame media.
			#if canImport(OSLog)
			logger.warning("Mirror mode deletion skipped - requires content ID mapping implementation")
			#endif
		}
		
		// Mark job as completed
		if var job = syncJobs[jobId] {
			job.addedCount = added
			job.skippedDuplicates = skipped
			job.failedCount = failed
			job.completedAt = dateProvider()
			syncJobs[jobId] = job
		}
		
		#if canImport(OSLog)
		logger.info("Sync job completed: added=\(added), skipped=\(skipped), failed=\(failed)")
		#endif
	}
	#endif

	func getSyncJob(jobId: String) async throws -> SyncJobRecord {
		guard let job = syncJobs[jobId] else {
			throw FrameModuleError.notFound(resource: "syncJob", identifier: jobId)
		}
		return job
	}
}

private struct UploadPhotoRequest {
	let assetId: String
	let convertIfNeeded: Bool

	init(assetId: String, convertIfNeeded: Bool) {
		self.assetId = assetId
		self.convertIfNeeded = convertIfNeeded
	}

	init(payload: NSDictionary) throws {
		guard let assetId = payload["assetId"] as? String, !assetId.isEmpty else {
			throw FrameModuleError.invalidArguments(reason: "`assetId` is required")
		}
		let convert = payload["convertIfNeeded"] as? Bool ?? true
		self.init(assetId: assetId, convertIfNeeded: convert)
	}
}

private struct SyncAlbumRequest {
	let albumId: String
	let deletionMode: SyncDeletionMode

	init(albumId: String, deletionMode: SyncDeletionMode) {
		self.albumId = albumId
		self.deletionMode = deletionMode
	}

	init(payload: NSDictionary) throws {
		guard let albumId = payload["albumId"] as? String, !albumId.isEmpty else {
			throw FrameModuleError.invalidArguments(reason: "`albumId` is required")
		}
		if let deletionModeValue = payload["deletionMode"] as? String,
		   let mode = SyncDeletionMode(rawValue: deletionModeValue) {
			self.init(albumId: albumId, deletionMode: mode)
		} else if payload["deletionMode"] == nil {
			self.init(albumId: albumId, deletionMode: .addOnly)
		} else {
			throw FrameModuleError.invalidArguments(reason: "Unsupported deletionMode value")
		}
	}
}

private enum SyncDeletionMode: String {
	case addOnly = "add-only"
	case mirror = "mirror"
}

private struct FrameMediaRecord: Hashable {
	let id: String
	var title: String?
	var createdAt: Date?
	var width: Int?
	var height: Int?
	var sizeBytes: Int?
	var fingerprint: String?

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		var dictionary: [String: Any] = ["id": id]
		if let title {
			dictionary["title"] = title
		}
		if let createdAt {
			dictionary["createdAt"] = dateFormatter.string(from: createdAt)
		}
		if let width {
			dictionary["width"] = width
		}
		if let height {
			dictionary["height"] = height
		}
		if let sizeBytes {
			dictionary["sizeBytes"] = sizeBytes
		}
		if let fingerprint {
			dictionary["fingerprint"] = fingerprint
		}
		return dictionary
	}
}

private struct UploadRecord {
	let id: String
	var status: UploadStatus
	let requestedAt: Date
	let assetId: String
	let convertIfNeeded: Bool
}

private enum UploadStatus: String {
	case pending
	case started
	case completed
	case failed
}

private struct UploadAcceptance {
	let uploadId: String
	let status: UploadStatus
	let acceptedAt: Date

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		[
			"uploadId": uploadId,
			"status": status.rawValue,
			"acceptedAt": dateFormatter.string(from: acceptedAt)
		]
	}
}

private struct DeleteResult {
	let mediaId: String
	let deleted: Bool

	func toDictionary() -> [String: Any] {
		[
			"mediaId": mediaId,
			"deleted": deleted
		]
	}
}

private struct SyncAcceptance {
	let jobId: String
	let status: SyncStatus
	let acceptedAt: Date

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		[
			"jobId": jobId,
			"status": status.rawValue,
			"acceptedAt": dateFormatter.string(from: acceptedAt)
		]
	}
}

private enum SyncStatus: String {
	case pending
	case running
	case completed
	case failed
}

private struct SyncJobRecord {
	let id: String
	let albumId: String
	let startedAt: Date
	var completedAt: Date?
	var addedCount: Int
	var skippedDuplicates: Int
	var failedCount: Int
	let deletionMode: SyncDeletionMode

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		var dictionary: [String: Any] = [
			"id": id,
			"albumId": albumId,
			"startedAt": dateFormatter.string(from: startedAt),
			"addedCount": addedCount,
			"skippedDuplicates": skippedDuplicates,
			"failedCount": failedCount,
			"deletionMode": deletionMode.rawValue
		]
		if let completedAt {
			dictionary["completedAt"] = dateFormatter.string(from: completedAt)
		}
		return dictionary
	}
}

private enum FrameModuleError: Error {
	case invalidArguments(reason: String)
	case notFound(resource: String, identifier: String)
	case unexpected(Error)

	var code: String {
		switch self {
		case .invalidArguments:
			return "FRAME_INVALID_ARGUMENTS"
		case .notFound:
			return "FRAME_NOT_FOUND"
		case .unexpected:
			return "FRAME_UNEXPECTED_ERROR"
		}
	}

	var message: String {
		switch self {
		case let .invalidArguments(reason):
			return reason
		case let .notFound(resource, identifier):
			return "\(resource) with id \(identifier) was not found"
		case let .unexpected(error):
			return error.localizedDescription
		}
	}

	#if canImport(OSLog)
	var logDescription: String {
		switch self {
		case let .invalidArguments(reason):
			return "invalidArguments(\(reason))"
		case let .notFound(resource, identifier):
			return "notFound(resource=\(resource), id=\(identifier))"
		case let .unexpected(error):
			return "unexpected(\(String(describing: error)))"
		}
	}
	#endif

	func asNSError() -> NSError {
		switch self {
		case let .unexpected(error):
			return error as NSError
		default:
			return NSError(domain: "FrameModule", code: 0, userInfo: [NSLocalizedDescriptionKey: message])
		}
	}
}
