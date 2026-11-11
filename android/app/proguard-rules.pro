# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# R8 is enabled for release builds (enableProguardInReleaseBuilds in
# build.gradle) so that Play's DEX code optimization check passes. Most
# libraries here ship their own consumer rules inside their AARs; the rules
# below cover what reflection-based code still needs.

# ---------------------------------------------------------------------------
# React Native core
# ---------------------------------------------------------------------------
# Native methods are looked up by name from C++.
-keepclasseswithmembernames class * {
    native <methods>;
}

# Anything the RN annotations mark must survive obfuscation.
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStripAny
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters

-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.proguard.annotations.DoNotStripAny class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# TurboModule / Fabric plumbing resolved by name at runtime.
-keep class com.facebook.jni.** { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Hermes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jsi.** { *; }

# ---------------------------------------------------------------------------
# Networking (OkHttp / Okio, pulled in by RN and react-native-blob-util)
# ---------------------------------------------------------------------------
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ---------------------------------------------------------------------------
# react-native-config — reads every .env value out of BuildConfig by
# reflection, so R8 sees no references and strips the whole class. Without
# this, Config.* is undefined at runtime, the API base URL is empty and the
# app hangs on the splash. Verified: BuildConfig appeared in R8's usage.txt
# (removed) with zero entries in seeds.txt before this rule was added.
# Matching **.BuildConfig rather than the literal package keeps this working
# if the applicationId is ever changed.
# ---------------------------------------------------------------------------
-keep class **.BuildConfig { *; }
-keep class com.lugg.RNCConfig.** { *; }

# ---------------------------------------------------------------------------
# jail-monkey — probes for root/hooking frameworks by class name, so the
# strings and lookups must not be rewritten.
# ---------------------------------------------------------------------------
-keep class com.gantix.JailMonkey.** { *; }

# ---------------------------------------------------------------------------
# react-native-keychain — selects a cipher storage implementation reflectively.
# ---------------------------------------------------------------------------
-keep class com.oblador.keychain.** { *; }

# ---------------------------------------------------------------------------
# Google Sign-In. R8 reports "Invalid stack map table" warnings against
# play-services-auth's own pre-obfuscated jar, ending with "the method may be
# assumed not reachable" — i.e. a future R8 could drop code the sign-in flow
# needs. Keeping the API surface costs a few KB and removes that risk.
# ---------------------------------------------------------------------------
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.google.android.gms.common.api.** { *; }
-dontwarn com.google.android.gms.**

# ---------------------------------------------------------------------------
# Kotlin metadata used by several of the native modules.
# ---------------------------------------------------------------------------
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

# Keep annotations and generics, otherwise reflective lookups fail at runtime.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-keepattributes SourceFile, LineNumberTable
