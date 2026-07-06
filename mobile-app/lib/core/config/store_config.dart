/// ID cửa hàng — khớp [applicationId] trong android/app/build.gradle.kts.
abstract final class StoreConfig {
  static const androidPackageId = 'com.gat.academy.test';

  static Uri get playStoreHttpsUri => Uri.parse(
        'https://play.google.com/store/apps/details?id=$androidPackageId',
      );

  static Uri get playStoreMarketUri => Uri.parse(
        'market://details?id=$androidPackageId',
      );
}
