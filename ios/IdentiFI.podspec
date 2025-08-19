Pod::Spec.new do |spec|
  spec.name         = "IdentiFi"
  spec.version      = "1.6.0.0"
  spec.summary      = "IdentiFi Framework"
  spec.description  = "IdentiFi Framework for identity verification"
  spec.homepage     = "https://example.com"
  spec.license      = { :type => "Commercial" }
  spec.author       = { "IdentiFi" => "contact@identifi.com" }
  
  spec.platform     = :ios, "15.1"
  spec.source       = { :git => "https://example.com", :tag => "1.6.0.0" }
  
  # Include source files and XCFramework for device builds
  spec.source_files = "IdentifiApp/IdentiFi.h"
  
  # Include XCFramework for device builds only
  spec.ios.vendored_frameworks = "IdentiFi.xcframework"
  
  # Exclude simulator builds
  spec.pod_target_xcconfig = {
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64',
    'VALID_ARCHS[sdk=iphonesimulator*]' => ''
  }
  
  spec.frameworks = "UIKit", "Foundation"
  spec.swift_version = "5.0"
  
  # Force the framework name to match the internal name
  spec.module_name = "IdentiFi"
  
  spec.xcconfig = {
    'FRAMEWORK_SEARCH_PATHS' => '$(inherited) $(PODS_XCFRAMEWORKS_BUILD_DIR)/IdentiFi'
  }
end