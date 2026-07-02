enum UserRole {
  guest,
  user,
  mentor,
  admin;

  String get label => switch (this) {
        UserRole.guest => 'Khách',
        UserRole.user => 'Học viên',
        UserRole.mentor => 'Mentor',
        UserRole.admin => 'Admin',
      };

  bool get isLearner => this == UserRole.user || this == UserRole.guest;
}
