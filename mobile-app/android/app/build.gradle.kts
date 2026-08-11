plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Avoid java.util.Properties / java.io.* — AGP 9 Kotlin DSL fails with Unresolved reference util/io.
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties: Map<String, String> =
    if (keystorePropertiesFile.exists()) {
        keystorePropertiesFile
            .readLines()
            .map { it.trim() }
            .filter { it.isNotEmpty() && !it.startsWith("#") && it.contains("=") }
            .associate { line ->
                val i = line.indexOf('=')
                line.substring(0, i).trim() to line.substring(i + 1).trim()
            }
    } else {
        emptyMap()
    }
val hasReleaseKeystore = keystoreProperties.isNotEmpty()

android {
    namespace = "com.gat.academy"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }

    defaultConfig {
        // Production application ID (was com.gat.academy.test).
        // Re-register Android OAuth client SHA-1/256 in Google Cloud after changing this.
        applicationId = "com.gat.academy"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                keyAlias = keystoreProperties.getValue("keyAlias")
                keyPassword = keystoreProperties.getValue("keyPassword")
                storeFile = file(keystoreProperties.getValue("storeFile"))
                storePassword = keystoreProperties.getValue("storePassword")
            }
        }
    }

    buildTypes {
        release {
            // Only attach release signing when key.properties exists.
            // Do NOT check() here — Gradle configures release even for assembleDebug
            // (`flutter run`), which must keep working without a store keystore.
            if (hasReleaseKeystore) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
}

// Fail only when a real release artifact is requested (Play Store / CI).
gradle.taskGraph.whenReady {
    val needsReleaseKeystore =
        allTasks.any { task ->
            val n = task.name
            (n.startsWith("assemble") || n.startsWith("bundle") || n.startsWith("sign")) &&
                n.contains("Release", ignoreCase = true)
        }
    if (needsReleaseKeystore && !hasReleaseKeystore) {
        throw GradleException(
            "Missing android/key.properties — required for release/Play Store builds. " +
                "Copy android/key.properties.example and point storeFile at your keystore. " +
                "Debug (`flutter run` / assembleDebug) does not need it.",
        )
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}
