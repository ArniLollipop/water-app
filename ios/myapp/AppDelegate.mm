#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <React/RCTPushNotificationManager.h> // Подключение PushNotificationManager

@implementation AppDelegate

// Метод вызывается, когда приложение завершает загрузку
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [UNUserNotificationCenter currentNotificationCenter].delegate = (id<UNUserNotificationCenterDelegate>)self;
  
  // Регистрация для удалённых уведомлений
  [application registerForRemoteNotifications];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// Обработка показа уведомления в foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
}

// Обработка уведомлений, полученных в background или при запуске
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void(^)(void))completionHandler {
  [RCTPushNotificationManager didReceiveRemoteNotification:response.notification.request.content.userInfo];
  completionHandler();
}

// Обработка успешной регистрации устройства для уведомлений
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Обработка ошибки регистрации устройства для уведомлений
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}

// Обработка получения удалённого уведомления
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end

// #import "AppDelegate.h"

// #import <React/RCTBundleURLProvider.h>
// #import <React/RCTLinkingManager.h>
// #import <UserNotifications/UNUserNotificationCenter.h>

// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
//   [UNUserNotificationCenter currentNotificationCenter].delegate = (id<UNUserNotificationCenterDelegate>)self;
//   return YES;
// }

// @implementation AppDelegate

// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// {
//   self.moduleName = @"main";

//   // You can add your custom initial props in the dictionary below.
//   // They will be passed down to the ViewController used by React Native.
//   self.initialProps = @{};

//   return [super application:application didFinishLaunchingWithOptions:launchOptions];
// }

// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// {
//   return [self bundleURL];
// }

// - (NSURL *)bundleURL
// {
// #if DEBUG
//   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
// #else
//   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// #endif
// }

// // Linking API
// - (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
//   return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
// }

// // Universal Links
// - (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
//   BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
//   return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
// }

// // Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
// - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
// {
//   return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
// }

// // Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
// - (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
// {
//   return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
// }

// // Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
// - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
// {
//   return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
// }

// @end
