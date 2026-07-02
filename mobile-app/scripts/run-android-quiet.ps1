# Run the app on Android and hide noisy system logs from the console.
param(
    [string]$Device = ""
)

$noise = @(
    'I/ImeTracker',
    'W/InsetsSource',
    'PHASE_CLIENT_ALREADY_HIDDEN',
    'Has no intersection or mTmpFrame\.height\(\)',
    'MiResource',
    'MiResources',
    'Resource 0107008e is a complex map type',
    'AssetManager2',
    'ApkAssets',
    'Package ID map',
    'PG \([0-9a-fA-F]{2}\)',
    'invalid cookie from nativeGetResourceValue',
    'MIUIInput',
    'MiInputConsumer',
    'HandWritingStubImpl',
    'BLASTBufferQueue',
    'BufferQueueConsumer',
    'SurfaceView',
    'SurfaceSyncGroup',
    'FrameEvents',
    'ViewRootImplStubImpl',
    'ViewRootImpl',
    'InsetsController',
    'ForceDarkHelperStubImpl',
    'PowerHalMgrImpl',
    'PowerHalWrapper',
    'ScrollIdentify',
    'CompatChangeReporter',
    'VRI\[',
    'WindowOnBackDispatcher',
    'getMiuiFreeformStackInfo',
    'InAppReviewPlugin',
    'PlayCore',
    'legacy_receive_flag',
    'perfmgr_sbe',
    'setInheritRt before being parceled',
    'Skipping stats log for color mode',
    'Resume onConfigurationChanged'
)

Push-Location $PSScriptRoot\..

try {
    if ([string]::IsNullOrWhiteSpace($Device)) {
        $androidDeviceId = adb devices |
            Where-Object { $_ -match '^\S+\s+device$' } |
            ForEach-Object { ($_ -split '\s+')[0] } |
            Select-Object -First 1

        if ($androidDeviceId) {
            $Device = $androidDeviceId
        } else {
            Write-Error "No Android device found. Run 'flutter devices' and pass the device id with -Device."
            exit 1
        }
    }

    flutter run -d $Device 2>&1 | ForEach-Object {
        $line = "$_"
        $skip = $false

        foreach ($pattern in $noise) {
            if ($line -match $pattern) {
                $skip = $true
                break
            }
        }

        if (-not $skip) {
            Write-Output $line
        }
    }
} finally {
    Pop-Location
}
