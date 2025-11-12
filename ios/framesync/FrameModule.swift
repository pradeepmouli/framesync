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
			self.tvHost = "192.168.1.100"  // Default for development
		}
		
		// Try to get TV port from parameters, environment, or use default
		if let port = tvPort {
			self.tvPort = port
		} else if let portString = ProcessInfo.processInfo.environment["FRAME_TV_PORT"], let port = Int(portString) {
			self.tvPort = port
		} else if let port = UserDefaults.standard.object(forKey: "FrameTVPort") as? Int {
			self.tvPort = port
		} else {
			self.tvPort = 8001  // Default port
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
			throw FrameModuleError.unexpected(error)
		}
		#else
		// When SwiftSamsungFrame is not available, we're in stub mode
		#if canImport(OSLog)
		logger.debug("SwiftSamsungFrame not available, using stub implementation")
		#endif
		#endif
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
				throw FrameModuleError.invalidArguments(reason: "Photo asset not found: \(request.assetId)")
			}
			
			// Request image data
			let imageManager = PHImageManager.default()
			let requestOptions = PHImageRequestOptions()
			requestOptions.isSynchronous = false
			requestOptions.deliveryMode = .highQualityFormat
			requestOptions.isNetworkAccessAllowed = true
			
			// Update status to started
			uploadRequests[identifier]?.status = .started
			
			let imageData = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Data, Error>) in
				imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { data, dataUTI, orientation, info in
					if let error = info?[PHImageErrorKey] as? Error {
						continuation.resume(throwing: error)
						return
					}
					
					guard let data = data else {
						continuation.resume(throwing: FrameModuleError.invalidArguments(reason: "Failed to fetch image data"))
						return
					}
					
					continuation.resume(returning: data)
				}
			}
			
			#if canImport(OSLog)
			logger.info("Fetched image data: \(imageData.count) bytes")
			#endif
			
			// Determine image type from data
			let imageType: SwiftSamsungFrame.ImageType
			if let dataUTI = asset.value(forKey: "uniformTypeIdentifier") as? String {
				if dataUTI.contains("png") {
					imageType = .png
				} else {
					imageType = .jpeg
				}
			} else {
				// Default to JPEG
				imageType = .jpeg
			}
			
			// Upload to TV
			#if canImport(OSLog)
			logger.info("Uploading image to TV (type: \(imageType == .jpeg ? "JPEG" : "PNG"))")
			#endif
			
			let contentId = try await tvClient.art.upload(imageData, type: imageType, matte: nil)
			
			#if canImport(OSLog)
			logger.info("Upload successful, content ID: \(contentId)")
			#endif
			
			// Update status to completed
			uploadRequests[identifier]?.status = .completed
			
			// Add to media library cache
			let mediaRecord = FrameMediaRecord(
				id: contentId,
				title: asset.localIdentifier,
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
		var record = SyncJobRecord(
			id: jobId,
			albumId: request.albumId,
			startedAt: now,
			completedAt: nil,
			addedCount: 0,
			skippedDuplicates: 0,
			failedCount: 0,
			deletionMode: request.deletionMode
		)
		syncJobs[jobId] = record

		#if canImport(SwiftSamsungFrame) && canImport(Photos)
		// Start async sync job
		Task {
			do {
				try await self.ensureConnected()
				
				// Fetch album
				#if canImport(OSLog)
				self.logger.info("Fetching album assets for \(request.albumId)")
				#endif
				
				let fetchOptions = PHFetchOptions()
				let albums = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [request.albumId], options: nil)
				
				guard let album = albums.firstObject else {
					record.failedCount = 1
					record.completedAt = self.dateProvider()
					self.syncJobs[jobId] = record
					return
				}
				
				let assetsFetchResult = PHAsset.fetchAssets(in: album, options: fetchOptions)
				
				#if canImport(OSLog)
				self.logger.info("Found \(assetsFetchResult.count) assets in album")
				#endif
				
				// Get current Frame media
				let currentFrameMedia = try await self.tvClient.art.listAvailable()
				let frameMediaIds = Set(currentFrameMedia.map { $0.id })
				
				// Process each asset
				var added = 0
				var skipped = 0
				var failed = 0
				
				assetsFetchResult.enumerateObjects { asset, index, stop in
					guard asset.mediaType == .image else {
						skipped += 1
						return
					}
					
					// For simplicity, we'll use the local identifier as a fingerprint
					// In a production implementation, you'd want to compute a content hash
					let assetId = asset.localIdentifier
					
					// Check if already on Frame (by checking if we've uploaded it before)
					// This is a simplified deduplication - a real implementation would use content hashing
					if frameMediaIds.contains(assetId) {
						skipped += 1
						return
					}
					
					// Upload the asset
					Task {
						do {
							let imageManager = PHImageManager.default()
							let requestOptions = PHImageRequestOptions()
							requestOptions.isSynchronous = false
							requestOptions.deliveryMode = .highQualityFormat
							requestOptions.isNetworkAccessAllowed = true
							
							let imageData = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Data, Error>) in
								imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { data, dataUTI, orientation, info in
									if let error = info?[PHImageErrorKey] as? Error {
										continuation.resume(throwing: error)
										return
									}
									
									guard let data = data else {
										continuation.resume(throwing: FrameModuleError.invalidArguments(reason: "Failed to fetch image data"))
										return
									}
									
									continuation.resume(returning: data)
								}
							}
							
							// Determine image type
							let imageType: SwiftSamsungFrame.ImageType = (asset.value(forKey: "uniformTypeIdentifier") as? String)?.contains("png") == true ? .png : .jpeg
							
							// Upload to TV
							let contentId = try await self.tvClient.art.upload(imageData, type: imageType, matte: nil)
							
							#if canImport(OSLog)
							self.logger.info("Uploaded asset \(index + 1)/\(assetsFetchResult.count): \(contentId)")
							#endif
							
							added += 1
							
							// Update record
							record.addedCount = added
							record.skippedDuplicates = skipped
							record.failedCount = failed
							self.syncJobs[jobId] = record
						} catch {
							#if canImport(OSLog)
							self.logger.error("Failed to upload asset \(index + 1): \(error.localizedDescription)")
							#endif
							failed += 1
							
							// Update record
							record.addedCount = added
							record.skippedDuplicates = skipped
							record.failedCount = failed
							self.syncJobs[jobId] = record
						}
					}
				}
				
				// Handle deletion mode if mirror
				if request.deletionMode == .mirror {
					// Get album asset IDs
					var albumAssetIds = Set<String>()
					assetsFetchResult.enumerateObjects { asset, _, _ in
						albumAssetIds.insert(asset.localIdentifier)
					}
					
					// Find media on Frame that's not in album
					let mediaToDelete = currentFrameMedia.filter { !albumAssetIds.contains($0.id) }
					
					for media in mediaToDelete {
						do {
							try await self.tvClient.art.delete(media.id)
							#if canImport(OSLog)
							self.logger.info("Deleted media \(media.id) from Frame (mirror mode)")
							#endif
						} catch {
							#if canImport(OSLog)
							self.logger.error("Failed to delete media \(media.id): \(error.localizedDescription)")
							#endif
							failed += 1
						}
					}
				}
				
				// Mark job as completed
				record.addedCount = added
				record.skippedDuplicates = skipped
				record.failedCount = failed
				record.completedAt = self.dateProvider()
				self.syncJobs[jobId] = record
				
				#if canImport(OSLog)
				self.logger.info("Sync job completed: added=\(added), skipped=\(skipped), failed=\(failed)")
				#endif
			} catch {
				#if canImport(OSLog)
				self.logger.error("Sync job failed: \(error.localizedDescription)")
				#endif
				
				record.completedAt = self.dateProvider()
				self.syncJobs[jobId] = record
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
