import AppKit

let size = 1024
let context = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
                        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
context.setFillColor(CGColor(red: 48/255, green: 39/255, blue: 45/255, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: size, height: size))
context.setStrokeColor(CGColor(red: 250/255, green: 249/255, blue: 247/255, alpha: 1))
context.setLineWidth(64)
context.setLineCap(.round)
context.setLineJoin(.round)
context.move(to: CGPoint(x: 270, y: 330)); context.addLine(to: CGPoint(x: 270, y: 650))
context.move(to: CGPoint(x: 270, y: 535))
context.addCurve(to: CGPoint(x: 512, y: 535), control1: CGPoint(x: 270, y: 700), control2: CGPoint(x: 512, y: 700))
context.addLine(to: CGPoint(x: 512, y: 330))
context.move(to: CGPoint(x: 512, y: 535))
context.addCurve(to: CGPoint(x: 754, y: 535), control1: CGPoint(x: 512, y: 700), control2: CGPoint(x: 754, y: 700))
context.addLine(to: CGPoint(x: 754, y: 330))
context.strokePath()
let image = NSBitmapImageRep(cgImage: context.makeImage()!)
try image.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
