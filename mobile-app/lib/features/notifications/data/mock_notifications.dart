import 'package:flutter/material.dart';

enum AppNotificationSection { today, yesterday, earlier }

class AppNotificationItem {
  const AppNotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.icon,
    required this.section,
    this.iconBackground,
    this.isUnread = false,
    this.href,
  });

  final String id;
  final String title;
  final String body;
  final IconData icon;
  final AppNotificationSection section;
  final Color? iconBackground;
  final bool isUnread;
  final String? href;
}

abstract final class MockNotifications {
  static const items = <AppNotificationItem>[
    AppNotificationItem(
      id: 'n1',
      title: 'Khóa học mới!',
      body: 'Khóa AI cho công sở vừa được mở — xem ngay trong Cửa hàng.',
      icon: Icons.grid_view_rounded,
      section: AppNotificationSection.today,
      isUnread: true,
    ),
    AppNotificationItem(
      id: 'n2',
      title: 'Nhắc điểm danh',
      body: 'Bạn chưa nhận XP hôm nay — mở app để điểm danh nhé.',
      icon: Icons.wallet_rounded,
      section: AppNotificationSection.today,
      iconBackground: Color(0xFF0070EB),
      isUnread: true,
    ),
    AppNotificationItem(
      id: 'n3',
      title: 'Ưu đãi hôm nay',
      body: 'Giảm 40% khóa Automation — chỉ còn hôm nay.',
      icon: Icons.local_offer_outlined,
      section: AppNotificationSection.today,
    ),
    AppNotificationItem(
      id: 'n4',
      title: 'Thanh toán thành công',
      body: 'Bạn đã mua khóa Flutter Mastery.',
      icon: Icons.credit_card_outlined,
      section: AppNotificationSection.yesterday,
    ),
    AppNotificationItem(
      id: 'n5',
      title: 'Tài khoản đã sẵn sàng',
      body: 'Chào mừng bạn đến GATS Academy!',
      icon: Icons.person_outline_rounded,
      section: AppNotificationSection.earlier,
    ),
  ];
}
