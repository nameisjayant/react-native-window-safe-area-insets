package com.windowsafeareainsets

import com.facebook.react.bridge.ReactApplicationContext

class WindowSafeAreaInsetsModule(reactContext: ReactApplicationContext) :
  NativeWindowSafeAreaInsetsSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeWindowSafeAreaInsetsSpec.NAME
  }
}
