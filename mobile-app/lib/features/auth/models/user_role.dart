enum UserRole {
  user,
  mentor,
  admin;

  /// Prefer [AuthL10n.roleLabel] so the string follows the app locale.
  @Deprecated('Use AuthL10n.roleLabel')
  String get label => switch (this) {
        UserRole.user => 'Học viên',
        UserRole.mentor => 'Mentor',
        UserRole.admin => 'Admin',
      };

  bool get isLearner => this == UserRole.user;
}
