package com.windowsafeareainsets

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class WindowSafeAreaInsetsPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      WindowSafeAreaInsetsModule.NAME -> WindowSafeAreaInsetsModule(reactContext)
      WindowSystemBarsModule.NAME -> WindowSystemBarsModule(reactContext)
      else -> null
    }
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(SystemBarsAnchorManager())

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    listOf(WindowSafeAreaInsetsModule.NAME, WindowSystemBarsModule.NAME).associateWith { name ->
      ReactModuleInfo(
        name = name,
        className = name,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      )
    }
  }
}
