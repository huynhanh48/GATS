enum UserRole {
  user,
  mentor,
  admin;

  String get label => switch (this) {
        UserRole.user => 'Học viên',
        UserRole.mentor => 'Mentor',
        UserRole.admin => 'Admin',
      };

  bool get isLearner => this == UserRole.user;
}
