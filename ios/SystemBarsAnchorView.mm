#import "SystemBarsAnchorView.h"

#import <react/renderer/components/WindowSafeAreaInsetsSpec/ComponentDescriptors.h>
#import <react/renderer/components/WindowSafeAreaInsetsSpec/Props.h>
#import <react/renderer/components/WindowSafeAreaInsetsSpec/ShadowNodes.h>

#import "WindowSystemBars.h"

using namespace facebook::react;

@implementation SystemBarsAnchorView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<SystemBarsAnchorComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = SystemBarsAnchorShadowNode::defaultSharedProps();
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const SystemBarsAnchorProps &>(*props);
  const BOOL iconsChanged = _darkStatusBarIcons != newProps.darkStatusBarIcons;

  _barsId = newProps.barsId;
  _darkStatusBarIcons = newProps.darkStatusBarIcons;
  [super updateProps:props oldProps:oldProps];

  if (iconsChanged && self.window != nil) {
    [WindowSystemBars.current anchorIconsChanged:self];
  }
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window != nil) {
    [WindowSystemBars.current anchorShown:self];
  } else {
    [WindowSystemBars.current anchorHidden:self];
  }
}

@end
