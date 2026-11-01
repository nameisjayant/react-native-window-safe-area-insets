#import "WindowSystemBars.h"

#import <React/RCTAssert.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

#import "SystemBarsAnchorView.h"

static const int kNoBars = -1;

static __weak WindowSystemBars *currentModule = nil;

static NSDictionary *EdgesToDictionary(CGFloat top, CGFloat right, CGFloat bottom, CGFloat left)
{
  return @{@"top" : @(top), @"right" : @(right), @"bottom" : @(bottom), @"left" : @(left)};
}

static UIViewController *OwningViewController(UIView *view)
{
  for (UIResponder *responder = view; responder != nil; responder = responder.nextResponder) {
    if ([responder isKindOfClass:[UIViewController class]]) {
      return (UIViewController *)responder;
    }
  }
  return nil;
}

/**
 * Fills the window to hear about safe area changes. An anchor cannot: it has no
 * size, so UIKit has no reason to tell it about edges it does not reach.
 */
@interface SystemBarsWindowObserver : UIView
@property (nonatomic, copy) dispatch_block_t onChange;
@end

@implementation SystemBarsWindowObserver

- (void)safeAreaInsetsDidChange
{
  [super safeAreaInsetsDidChange];
  [self notifyChange];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  [self notifyChange];
}

- (void)notifyChange
{
  // Posted because the status bar frame can lag behind the safe area.
  dispatch_block_t onChange = self.onChange;
  if (onChange != nil) {
    dispatch_async(dispatch_get_main_queue(), onChange);
  }
}

@end

@interface WindowSystemBars ()
// Set on the main thread, read by JS on its own thread.
@property (atomic, copy) NSDictionary *insetsSnapshot;
@property (atomic, copy) NSDictionary *activeBarsSnapshot;
@end

@implementation WindowSystemBars {
  /** On-screen anchors in the app's window, newest last. The last one is in charge. */
  NSMutableArray<SystemBarsAnchorView *> *_anchors;
  /** On-screen anchors above it, such as inside a Modal. */
  NSMutableArray<SystemBarsAnchorView *> *_foreignAnchors;

  __weak UIWindow *_window;
  SystemBarsWindowObserver *_windowObserver;

  NSDictionary *_lastInsets;
  NSDictionary *_lastActiveBars;
  BOOL _updateScheduled;
  BOOL _warnedAboutStatusBarAppearance;
}

+ (NSString *)moduleName
{
  return @"WindowSystemBars";
}

/** `getInsets` is synchronous, so the first value is read during setup, on the main thread. */
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

+ (WindowSystemBars *)current
{
  return currentModule;
}

- (instancetype)init
{
  if (self = [super init]) {
    _anchors = [NSMutableArray new];
    _foreignAnchors = [NSMutableArray new];
    self.activeBarsSnapshot = @{@"barsId" : @(kNoBars), @"foreignBarsIds" : @[]};
  }
  return self;
}

/**
 * Not `init`: codegen's module provider also creates a spare instance, on any
 * thread. React Native only calls this on the one it uses.
 */
- (void)initialize
{
  self.insetsSnapshot = [self readInsets];
  currentModule = self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeWindowSystemBarsSpecJSI>(params);
}

- (void)invalidate
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_windowObserver removeFromSuperview];
    self->_windowObserver = nil;
    [self->_anchors removeAllObjects];
    [self->_foreignAnchors removeAllObjects];
    if (currentModule == self) {
      currentModule = nil;
    }
  });
}

- (NSDictionary *)getInsets
{
  return self.insetsSnapshot;
}

- (NSDictionary *)getActiveBars
{
  return self.activeBarsSnapshot;
}

- (void)anchorShown:(SystemBarsAnchorView *)anchor
{
  RCTAssertMainQueue();
  if ([_anchors containsObject:anchor] || [_foreignAnchors containsObject:anchor]) {
    return;
  }

  UIWindow *appWindow = RCTKeyWindow() ?: anchor.window;
  [self observeWindow:appWindow];

  // A Modal is presented in the same window, on top of the screens. A wrapper
  // inside it must not take over from the screen it covers.
  BOOL isForeign =
      anchor.window != appWindow || OwningViewController(anchor).presentingViewController != nil;
  [isForeign ? _foreignAnchors : _anchors addObject:anchor];
  [self scheduleUpdate];
}

- (void)anchorHidden:(SystemBarsAnchorView *)anchor
{
  RCTAssertMainQueue();
  [_anchors removeObject:anchor];
  [_foreignAnchors removeObject:anchor];
  [self scheduleUpdate];
}

- (void)anchorIconsChanged:(SystemBarsAnchorView *)anchor
{
  RCTAssertMainQueue();
  if (_anchors.lastObject == anchor) {
    [self applyIconColors];
  }
}

/** A switch between screens hides one anchor and shows another. JS only needs the outcome. */
- (void)scheduleUpdate
{
  if (_updateScheduled) {
    return;
  }
  _updateScheduled = YES;
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_updateScheduled = NO;
    [self update];
  });
}

- (void)update
{
  [self applyIconColors];
  [self publishInsets];

  NSMutableArray<NSNumber *> *foreignBarsIds = [NSMutableArray new];
  for (SystemBarsAnchorView *anchor in _foreignAnchors) {
    [foreignBarsIds addObject:@(anchor.barsId)];
  }
  NSNumber *barsId = _anchors.count > 0 ? @(_anchors.lastObject.barsId) : @(kNoBars);
  NSDictionary *activeBars = @{@"barsId" : barsId, @"foreignBarsIds" : foreignBarsIds};

  self.activeBarsSnapshot = activeBars;
  if (![activeBars isEqualToDictionary:_lastActiveBars]) {
    _lastActiveBars = activeBars;
    [self emitOnActiveBarsChange:activeBars];
  }
}

- (void)publishInsets
{
  NSDictionary *insets = [self readInsets];
  self.insetsSnapshot = insets;
  if (![insets isEqualToDictionary:_lastInsets]) {
    _lastInsets = insets;
    [self emitOnInsetsChange:insets];
  }
}

- (void)observeWindow:(UIWindow *)window
{
  if (_window == window && _windowObserver != nil) {
    return;
  }
  [_windowObserver removeFromSuperview];
  _window = window;

  _windowObserver = [[SystemBarsWindowObserver alloc] initWithFrame:window.bounds];
  _windowObserver.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  _windowObserver.userInteractionEnabled = NO;

  __weak WindowSystemBars *weakSelf = self;
  _windowObserver.onChange = ^{
    [weakSelf publishInsets];
  };
  [window insertSubview:_windowObserver atIndex:0];
}

/**
 * Foreign anchors are left out: while a Modal is presented iOS keeps the default
 * style, whatever is set here or in its view controller.
 */
- (void)applyIconColors
{
  SystemBarsAnchorView *anchor = _anchors.lastObject;
  if (anchor == nil) {
    return;
  }
  [self warnIfStatusBarFollowsViewControllers];

  UIStatusBarStyle style = anchor.darkStatusBarIcons ? UIStatusBarStyleDarkContent : UIStatusBarStyleLightContent;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  // Deprecated, but it is the only call that works without owning the view
  // controllers, and what React Native's own StatusBar uses.
  [RCTSharedApplication() setStatusBarStyle:style animated:NO];
#pragma clang diagnostic pop
}

- (void)warnIfStatusBarFollowsViewControllers
{
  if (_warnedAboutStatusBarAppearance) {
    return;
  }
  _warnedAboutStatusBarAppearance = YES;

  // iOS defaults to YES when the key is missing.
  id value = [NSBundle.mainBundle objectForInfoDictionaryKey:@"UIViewControllerBasedStatusBarAppearance"];
  if (value == nil || [value boolValue]) {
    RCTLogWarn(@"SystemBarsView cannot set the status bar style while "
                "UIViewControllerBasedStatusBarAppearance is YES. Set it to NO in Info.plist.");
  }
}

/**
 * iOS has no display cutout or navigation bar of its own, so these are their
 * closest matches: the safe area around the notch, and the home indicator.
 */
- (NSDictionary *)readInsets
{
  UIWindow *window = _window ?: RCTKeyWindow();
  UIEdgeInsets safeArea = window.safeAreaInsets;
  UIStatusBarManager *statusBar = window.windowScene.statusBarManager;
  CGFloat statusBarHeight = statusBar.isStatusBarHidden ? 0 : CGRectGetHeight(statusBar.statusBarFrame);

  return @{
    @"statusBar" : EdgesToDictionary(statusBarHeight, 0, 0, 0),
    @"navigationBar" : EdgesToDictionary(0, 0, safeArea.bottom, 0),
    @"displayCutout" : EdgesToDictionary(safeArea.top, safeArea.right, 0, safeArea.left),
  };
}

@end
