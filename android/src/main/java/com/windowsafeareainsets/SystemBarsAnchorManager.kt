package com.windowsafeareainsets

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.SystemBarsAnchorManagerDelegate
import com.facebook.react.viewmanagers.SystemBarsAnchorManagerInterface

@ReactModule(name = SystemBarsAnchorManager.NAME)
class SystemBarsAnchorManager :
  SimpleViewManager<SystemBarsAnchorView>(), SystemBarsAnchorManagerInterface<SystemBarsAnchorView> {

  private val delegate = SystemBarsAnchorManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<SystemBarsAnchorView> = delegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext) = SystemBarsAnchorView(context)

  override fun setBarsId(view: SystemBarsAnchorView, value: Int) {
    view.barsId = value
  }

  override fun setDarkStatusBarIcons(view: SystemBarsAnchorView, value: Boolean) {
    view.darkStatusBarIcons = value
  }

  override fun setDarkNavigationBarIcons(view: SystemBarsAnchorView, value: Boolean) {
    view.darkNavigationBarIcons = value
  }

  companion object {
    const val NAME = "SystemBarsAnchor"
  }
}
