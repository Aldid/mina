import Capacitor
import PhotosUI
import AVFoundation
import ImageIO
import UniformTypeIdentifiers

class MinaBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(MinaPhotoPlugin())
    }
}

@objc(MinaPhotoPlugin)
final class MinaPhotoPlugin: CAPPlugin, CAPBridgedPlugin, PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let identifier = "MinaPhotoPlugin"
    let jsName = "MinaPhoto"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "getPhoto", returnType: CAPPluginReturnPromise)]
    private var pending: CAPPluginCall?

    @objc func getPhoto(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.pending == nil else { call.reject("Фото уже открывается."); return }
            guard let presenter = self.bridge?.viewController else { call.reject("Не удалось открыть фото."); return }
            self.pending = call
            if call.getString("source") == "photos" {
                // PHPicker hands over only the selected item; no PHPhotoLibrary permission is requested.
                var configuration = PHPickerConfiguration()
                configuration.filter = .images
                configuration.selectionLimit = 1
                let picker = PHPickerViewController(configuration: configuration)
                picker.delegate = self
                presenter.present(picker, animated: true)
            } else {
                guard UIImagePickerController.isSourceTypeAvailable(.camera) else { self.reject("Камера недоступна на этом устройстве."); return }
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    DispatchQueue.main.async {
                        guard granted else { self.reject("Нет доступа к камере. Можно выбрать готовый снимок."); return }
                        let camera = UIImagePickerController()
                        camera.sourceType = .camera
                        if UIImagePickerController.isCameraDeviceAvailable(.front) { camera.cameraDevice = .front }
                        camera.delegate = self
                        presenter.present(camera, animated: true)
                    }
                }
            }
        }
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        guard let provider = results.first?.itemProvider else { cancel(); return }
        provider.loadDataRepresentation(forTypeIdentifier: UTType.image.identifier) { [weak self] data, _ in
            guard let self else { return }
            guard let data, data.count <= 30 * 1024 * 1024,
                  let source = CGImageSourceCreateWithData(data as CFData, nil),
                  let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
                  let width = properties[kCGImagePropertyPixelWidth] as? NSNumber,
                  let height = properties[kCGImagePropertyPixelHeight] as? NSNumber,
                  width.doubleValue * height.doubleValue <= 60_000_000,
                  let image = CGImageSourceCreateThumbnailAtIndex(source, 0, [
                    kCGImageSourceCreateThumbnailFromImageAlways: true,
                    kCGImageSourceCreateThumbnailWithTransform: true,
                    kCGImageSourceThumbnailMaxPixelSize: 960,
                  ] as CFDictionary) else {
                DispatchQueue.main.async { self.reject("Выбери фото до 30 МБ и 60 мегапикселей.") }; return
            }
            self.deliver(image)
        }
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true); cancel()
    }

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        picker.dismiss(animated: true)
        guard let image = info[.originalImage] as? UIImage else { reject("Не удалось прочитать снимок."); return }
        let scale = min(1, 960 / max(image.size.width, image.size.height))
        let size = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let format = UIGraphicsImageRendererFormat(); format.scale = 1; format.opaque = true
        let prepared = UIGraphicsImageRenderer(size: size, format: format).image { _ in image.draw(in: CGRect(origin: .zero, size: size)) }
        guard let cgImage = prepared.cgImage else { reject("Не удалось подготовить снимок."); return }
        deliver(cgImage)
    }

    private func deliver(_ image: CGImage) {
        let output = NSMutableData()
        guard let destination = CGImageDestinationCreateWithData(output, UTType.jpeg.identifier as CFString, 1, nil) else {
            DispatchQueue.main.async { self.reject("Не удалось подготовить фото.") }; return
        }
        // Re-encode the oriented, downsampled image without filename, EXIF or a temporary URI file.
        CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: 0.9] as CFDictionary)
        guard CGImageDestinationFinalize(destination) else { DispatchQueue.main.async { self.reject("Не удалось подготовить фото.") }; return }
        let dataURL = "data:image/jpeg;base64," + (output as Data).base64EncodedString()
        DispatchQueue.main.async {
            let call = self.pending; self.pending = nil
            // The observed Intel iOS 26.3 simulator crashes in JavaScriptCore's
            // Wasm::prepareSignalingMemory even with ad-hoc signing. Never run that
            // known-crashing path or pretend that manual annotations are model output.
            #if targetEnvironment(simulator) && arch(x86_64)
            call?.resolve(["dataUrl": dataURL, "analysisMode": "manual-simulator"])
            #else
            call?.resolve(["dataUrl": dataURL, "analysisMode": "automatic"])
            #endif
        }
    }

    private func cancel() { let call = pending; pending = nil; call?.resolve(["cancelled": true]) }
    private func reject(_ message: String) { let call = pending; pending = nil; call?.reject(message) }
}
