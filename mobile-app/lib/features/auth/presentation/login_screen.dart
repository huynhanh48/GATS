import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/services/auth_service.dart';
import 'package:gats_academy/features/auth/presentation/widgets/auth_provider_button.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

/// Ngữ cảnh mở auth — cùng một UI, khác headline / skip / demo / đích sau đăng nhập.
enum AuthGate { entry, postOnboarding }

enum _AuthStep { choice, emailSignUp, emailSignIn, emailVerify }

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    this.gate = AuthGate.entry,
    required this.onAuthenticated,
    required this.onBack,
    this.onSkip,
  });

  final AuthGate gate;
  final VoidCallback onAuthenticated;
  final VoidCallback onBack;
  final VoidCallback? onSkip;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late _AuthStep _step;
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _ageController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _verifyTokenController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _step = _AuthStep.choice;
    for (final c in [
      _firstNameController,
      _lastNameController,
      _ageController,
      _emailController,
      _passwordController,
      _verifyTokenController,
    ]) {
      c.addListener(_onFieldsChanged);
    }
  }

  @override
  void dispose() {
    for (final c in [
      _firstNameController,
      _lastNameController,
      _ageController,
      _emailController,
      _passwordController,
      _verifyTokenController,
    ]) {
      c
        ..removeListener(_onFieldsChanged)
        ..dispose();
    }
    super.dispose();
  }

  void _onFieldsChanged() {
    if (mounted) setState(() {});
  }

  bool get _canSubmitSignUp =>
      _emailController.text.trim().isNotEmpty &&
      _passwordController.text.isNotEmpty &&
      _firstNameController.text.trim().isNotEmpty &&
      _lastNameController.text.trim().isNotEmpty &&
      _ageController.text.trim().isNotEmpty;

  void _goTo(_AuthStep step) {
    setState(() {
      _step = step;
      _error = null;
    });
  }

  void _handleBack() {
    switch (_step) {
      case _AuthStep.choice:
        widget.onBack();
      case _AuthStep.emailSignUp:
        _goTo(_AuthStep.choice);
      case _AuthStep.emailSignIn:
        _goTo(_AuthStep.choice);
      case _AuthStep.emailVerify:
        _goTo(_AuthStep.emailSignUp);
    }
  }

  Future<void> _completeSession(AuthSession session) async {
    await AuthService.persistSession(session);
    if (!mounted) return;
    widget.onAuthenticated();
  }

  Future<void> _submitGoogle() async {
    await _submitSocial(AuthService.signInWithGoogle);
  }

  Future<void> _submitApple() async {
    await _submitSocial(AuthService.signInWithApple);
  }

  Future<void> _submitMomo() async {
    await _submitSocial(AuthService.signInWithMomo);
  }

  Future<void> _submitSocial(Future<AuthSession> Function() signIn) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final session = await signIn();
      await _completeSession(session);
    } on AuthException catch (e) {
      if (!mounted) return;
      if (e.code == AuthErrorCode.socialCancelled) {
        setState(() => _error = null);
        return;
      }
      setState(() => _error = AuthL10n.errorMessage(context.l10n, e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool _validateSignUp(AppLocalizations l10n) {
    if (_firstNameController.text.trim().isEmpty) {
      setState(() => _error = l10n.authErrorFirstNameRequired);
      return false;
    }
    if (_lastNameController.text.trim().isEmpty) {
      setState(() => _error = l10n.authErrorLastNameRequired);
      return false;
    }
    final age = int.tryParse(_ageController.text.trim());
    if (age == null) {
      setState(() => _error = l10n.authErrorAgeInvalid);
      return false;
    }
    if (age < 1 || age > 120) {
      setState(() => _error = l10n.authErrorAgeInvalid);
      return false;
    }
    return true;
  }

  Future<void> _submitSignUp() async {
    final l10n = context.l10n;
    if (!_canSubmitSignUp || !_validateSignUp(l10n)) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final displayName =
          '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}'.trim();
      if (_passwordController.text.length < 6) {
        throw const AuthException(AuthErrorCode.passwordTooShortSignup);
      }
      final session = await AuthService.registerWithEmail(
        email: _emailController.text,
        password: _passwordController.text,
        displayName: displayName,
      );
      await _completeSession(session);
    } on AuthException catch (e) {
      if (!mounted) return;
      if (e.code == AuthErrorCode.emailVerificationRequired) {
        setState(() {
          _error = AuthL10n.errorMessage(l10n, e);
          _step = _AuthStep.emailVerify;
        });
      } else {
        setState(() => _error = AuthL10n.errorMessage(l10n, e));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitSignIn() async {
    final l10n = context.l10n;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final session = await AuthService.signInWithEmail(
        email: _emailController.text,
        password: _passwordController.text,
        defaultDisplayName: l10n.authDefaultDisplayName,
      );
      await _completeSession(session);
    } on AuthException catch (e) {
      if (mounted) setState(() => _error = AuthL10n.errorMessage(l10n, e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitVerify() async {
    final l10n = context.l10n;
    final token = _verifyTokenController.text.trim();
    if (token.isEmpty) {
      setState(() => _error = l10n.authVerifyEmailTokenLabel);
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final session = await AuthService.verifyEmail(token: token);
      await _completeSession(session);
    } on AuthException catch (e) {
      if (mounted) setState(() => _error = AuthL10n.errorMessage(l10n, e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: switch (_step) {
          _AuthStep.choice => _ChoiceStep(
              gate: widget.gate,
              isLoading: _isLoading,
              error: _error,
              onBack: _handleBack,
              onApple: _submitApple,
              onGoogle: _submitGoogle,
              onMomo: _submitMomo,
              onContinueEmail: () => _goTo(_AuthStep.emailSignUp),
              onSignIn: () => _goTo(_AuthStep.emailSignIn),
              onSkip: widget.onSkip,
            ),
          _AuthStep.emailSignUp => _EmailSignUpStep(
              isLoading: _isLoading,
              error: _error,
              canSubmit: _canSubmitSignUp,
              firstNameController: _firstNameController,
              lastNameController: _lastNameController,
              ageController: _ageController,
              emailController: _emailController,
              passwordController: _passwordController,
              obscurePassword: _obscurePassword,
              onTogglePassword: () => setState(() => _obscurePassword = !_obscurePassword),
              onBack: _handleBack,
              onSubmit: _submitSignUp,
              onSignIn: () => _goTo(_AuthStep.emailSignIn),
            ),
          _AuthStep.emailSignIn => _EmailSignInStep(
              isLoading: _isLoading,
              error: _error,
              emailController: _emailController,
              passwordController: _passwordController,
              obscurePassword: _obscurePassword,
              rememberMe: _rememberMe,
              onTogglePassword: () => setState(() => _obscurePassword = !_obscurePassword),
              onRememberMeChanged: (v) => setState(() => _rememberMe = v),
              onBack: _handleBack,
              onSubmit: _submitSignIn,
              onSignUp: () => _goTo(_AuthStep.emailSignUp),
            ),
          _AuthStep.emailVerify => _EmailVerifyStep(
              isLoading: _isLoading,
              error: _error,
              tokenController: _verifyTokenController,
              onBack: _handleBack,
              onSubmit: _submitVerify,
            ),
        },
      ),
    );
  }
}

class _ChoiceStep extends StatelessWidget {
  const _ChoiceStep({
    required this.gate,
    required this.isLoading,
    required this.error,
    required this.onBack,
    required this.onApple,
    required this.onGoogle,
    required this.onMomo,
    required this.onContinueEmail,
    required this.onSignIn,
    this.onSkip,
  });

  final AuthGate gate;
  final bool isLoading;
  final String? error;
  final VoidCallback onBack;
  final VoidCallback onApple;
  final VoidCallback onGoogle;
  final VoidCallback onMomo;
  final VoidCallback onContinueEmail;
  final VoidCallback onSignIn;
  final VoidCallback? onSkip;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isEntry = gate == AuthGate.entry;

    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.sm, AppSpacing.xl, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              onPressed: isLoading ? null : onBack,
              icon: const Icon(Icons.arrow_back_rounded),
            ),
          ),
          const Spacer(flex: 2),
          Text(
            isEntry ? l10n.authLoginTitle : l10n.authPostOnboardingTitle,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                  letterSpacing: -0.5,
                ),
          ),
          if (isEntry) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              l10n.authLoginSubtitle,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            ),
          ],
          const Spacer(flex: 3),
          AuthProviderRow(
            enabled: !isLoading,
            onApple: onApple,
            onGoogle: onGoogle,
            onMomo: onMomo,
            momoLabel: l10n.authMomo,
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              const Expanded(child: Divider()),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Text(
                  l10n.authOrDivider.toUpperCase(),
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
              const Expanded(child: Divider()),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: isLoading ? null : onContinueEmail,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.darkCanvas,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
              ),
              child: Text(
                l10n.authContinueEmail,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
              ),
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(error!, style: const TextStyle(color: AppColors.accent, fontSize: 13), textAlign: TextAlign.center),
          ],
          const Spacer(),
          _ExistingUserLink(
            enabled: !isLoading,
            onSignIn: onSignIn,
          ),
          if (onSkip != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Center(
              child: TextButton(
                onPressed: isLoading ? null : onSkip,
                child: Text(
                  l10n.authPostOnboardingSkip,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _EmailSignUpStep extends StatelessWidget {
  const _EmailSignUpStep({
    required this.isLoading,
    required this.error,
    required this.canSubmit,
    required this.firstNameController,
    required this.lastNameController,
    required this.ageController,
    required this.emailController,
    required this.passwordController,
    required this.obscurePassword,
    required this.onTogglePassword,
    required this.onBack,
    required this.onSubmit,
    required this.onSignIn,
  });

  final bool isLoading;
  final String? error;
  final bool canSubmit;
  final TextEditingController firstNameController;
  final TextEditingController lastNameController;
  final TextEditingController ageController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool obscurePassword;
  final VoidCallback onTogglePassword;
  final VoidCallback onBack;
  final VoidCallback onSubmit;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.sm, AppSpacing.xl, AppSpacing.xl),
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            onPressed: isLoading ? null : onBack,
            icon: const Icon(Icons.arrow_back_rounded),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _AuthInputField(
          hint: l10n.authEmailLabel,
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          enabled: !isLoading,
        ),
        const SizedBox(height: AppSpacing.md),
        _AuthInputField(
          hint: l10n.authPasswordLabel,
          controller: passwordController,
          obscureText: obscurePassword,
          enabled: !isLoading,
          suffix: IconButton(
            onPressed: onTogglePassword,
            icon: Icon(obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: _AuthInputField(
                hint: l10n.authFirstNameLabel,
                controller: firstNameController,
                textCapitalization: TextCapitalization.words,
                enabled: !isLoading,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _AuthInputField(
                hint: l10n.authLastNameLabel,
                controller: lastNameController,
                textCapitalization: TextCapitalization.words,
                enabled: !isLoading,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _AuthInputField(
          hint: l10n.authAgeLabel,
          controller: ageController,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          enabled: !isLoading,
        ),
        if (error != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(error!, style: const TextStyle(color: AppColors.accent, fontSize: 13)),
        ],
        const SizedBox(height: AppSpacing.xl),
        SizedBox(
          height: 56,
          child: FilledButton(
            onPressed: isLoading || !canSubmit ? null : onSubmit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.darkCanvas,
              disabledBackgroundColor: AppColors.chipInactive,
              disabledForegroundColor: AppColors.textSecondary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
            ),
            child: Text(
              l10n.authSignUpButton,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        _ExistingUserLink(enabled: !isLoading, onSignIn: onSignIn),
        const SizedBox(height: AppSpacing.xl),
        _LegalSignUpText(l10n: l10n),
      ],
    );
  }
}

class _EmailSignInStep extends StatelessWidget {
  const _EmailSignInStep({
    required this.isLoading,
    required this.error,
    required this.emailController,
    required this.passwordController,
    required this.obscurePassword,
    required this.rememberMe,
    required this.onTogglePassword,
    required this.onRememberMeChanged,
    required this.onBack,
    required this.onSubmit,
    required this.onSignUp,
  });

  final bool isLoading;
  final String? error;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool obscurePassword;
  final bool rememberMe;
  final VoidCallback onTogglePassword;
  final ValueChanged<bool> onRememberMeChanged;
  final VoidCallback onBack;
  final VoidCallback onSubmit;
  final VoidCallback onSignUp;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.sm, AppSpacing.xl, AppSpacing.xl),
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            onPressed: isLoading ? null : onBack,
            icon: const Icon(Icons.arrow_back_rounded),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          l10n.authLoginTitle,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          l10n.authLoginSubtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.xl),
        _AuthInputField(
          hint: l10n.authEmailLabel,
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          enabled: !isLoading,
        ),
        const SizedBox(height: AppSpacing.md),
        _AuthInputField(
          hint: l10n.authPasswordLabel,
          controller: passwordController,
          obscureText: obscurePassword,
          enabled: !isLoading,
          suffix: IconButton(
            onPressed: onTogglePassword,
            icon: Icon(obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Checkbox(
              value: rememberMe,
              onChanged: isLoading ? null : (v) => onRememberMeChanged(v ?? false),
              activeColor: AppColors.primary,
            ),
            Text(l10n.authRememberMe, style: Theme.of(context).textTheme.bodySmall),
            const Spacer(),
            TextButton(
              onPressed: isLoading
                  ? null
                  : () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.comingSoon))),
              child: Text(l10n.authForgotPassword, style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
        if (error != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(error!, style: const TextStyle(color: AppColors.accent, fontSize: 13)),
        ],
        const SizedBox(height: AppSpacing.xl),
        SizedBox(
          height: 56,
          child: FilledButton(
            onPressed: isLoading ? null : onSubmit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.darkCanvas,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
            ),
            child: Text(l10n.authLoginButton, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Center(
          child: GestureDetector(
            onTap: isLoading ? null : onSignUp,
            child: RichText(
              text: TextSpan(
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                children: [
                  TextSpan(text: '${l10n.authNoAccount} '),
                  TextSpan(
                    text: l10n.authSignUpLink,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w800,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ExistingUserLink extends StatelessWidget {
  const _ExistingUserLink({required this.enabled, required this.onSignIn});

  final bool enabled;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Center(
      child: GestureDetector(
        onTap: enabled ? onSignIn : null,
        child: RichText(
          text: TextSpan(
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            children: [
              TextSpan(text: '${l10n.authExistingUserPrompt} '),
              TextSpan(
                text: l10n.authSignInLink,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w800,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LegalSignUpText extends StatelessWidget {
  const _LegalSignUpText({required this.l10n});

  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final bodyStyle = Theme.of(context).textTheme.bodySmall?.copyWith(
          color: AppColors.textSecondary,
          height: 1.45,
          fontSize: 12,
        );
    final linkStyle = bodyStyle?.copyWith(
      color: AppColors.textPrimary,
      fontWeight: FontWeight.w700,
      decoration: TextDecoration.none,
    );

    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: bodyStyle,
        children: [
          TextSpan(text: l10n.authLegalSignUpPrefix),
          TextSpan(
            text: l10n.authTermsLink,
            style: linkStyle,
            recognizer: null,
          ),
          TextSpan(text: l10n.authLegalSignUpMiddle),
          TextSpan(text: l10n.authPrivacyLink, style: linkStyle),
        ],
      ),
    );
  }
}

class _AuthInputField extends StatelessWidget {
  const _AuthInputField({
    required this.hint,
    required this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.enabled = true,
    this.suffix,
  });

  final String hint;
  final TextEditingController controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final bool enabled;
  final Widget? suffix;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      inputFormatters: inputFormatters,
      enabled: enabled,
      decoration: InputDecoration(
        hintText: hint,
        suffixIcon: suffix,
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.lg),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.textPrimary, width: 1.5),
        ),
      ),
    );
  }
}

class _EmailVerifyStep extends StatelessWidget {
  const _EmailVerifyStep({
    required this.isLoading,
    required this.error,
    required this.tokenController,
    required this.onBack,
    required this.onSubmit,
  });

  final bool isLoading;
  final String? error;
  final TextEditingController tokenController;
  final VoidCallback onBack;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.sm, AppSpacing.xl, AppSpacing.xl),
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            onPressed: isLoading ? null : onBack,
            icon: const Icon(Icons.arrow_back_rounded),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          l10n.authVerifyEmailTitle,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          l10n.authVerifyEmailSubtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.xl),
        _AuthInputField(
          hint: l10n.authVerifyEmailTokenLabel,
          controller: tokenController,
          enabled: !isLoading,
        ),
        if (error != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(error!, style: const TextStyle(color: AppColors.accent, fontSize: 13)),
        ],
        const SizedBox(height: AppSpacing.xl),
        SizedBox(
          height: 56,
          child: FilledButton(
            onPressed: isLoading ? null : onSubmit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.darkCanvas,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
            ),
            child: Text(
              l10n.authVerifyEmailButton,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            ),
          ),
        ),
      ],
    );
  }
}
