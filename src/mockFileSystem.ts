import { FileItem, AppMetadata } from './types';

export const INITIAL_APPS: AppMetadata[] = [
  {
    bundleId: 'com.spotify.client',
    name: 'Spotify',
    version: '8.8.92',
    developer: 'Spotify AB',
    iconType: 'music',
    containerPath: '/var/mobile/Containers/Data/Application/3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10',
    installedSize: '142.5 MB'
  },
  {
    bundleId: 'com.burbn.instagram',
    name: 'Instagram',
    version: '315.0.0',
    developer: 'Meta Platforms, Inc.',
    iconType: 'camera',
    containerPath: '/var/mobile/Containers/Data/Application/8F4E6D2B-1A3C-4E5F-9B7D-62C84A91E04B',
    installedSize: '210.8 MB'
  },
  {
    bundleId: 'org.videolan.vlc-ios',
    name: 'VLC for Mobile',
    version: '3.4.8',
    developer: 'VideoLAN',
    iconType: 'video',
    containerPath: '/var/mobile/Containers/Data/Application/1D5E9A7F-6C3B-42E8-89A1-45F7B8C2D3E1',
    installedSize: '95.2 MB'
  },
  {
    bundleId: 'com.agilebits.onepassword',
    name: '1Password',
    version: '8.10.24',
    developer: 'AgileBits Inc.',
    iconType: 'lock',
    containerPath: '/var/mobile/Containers/Data/Application/7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D',
    installedSize: '68.4 MB'
  },
  {
    bundleId: 'com.google.chrome.ios',
    name: 'Google Chrome',
    version: '122.0.6261.89',
    developer: 'Google LLC',
    iconType: 'globe',
    containerPath: '/var/mobile/Containers/Data/Application/9A1B2C3D-4E5F-6A7B-8C9D-0E1F2A3B4C5D',
    installedSize: '184.1 MB'
  },
  {
    bundleId: 'com.atebits.Tweetie2',
    name: 'Twitter (X)',
    version: '10.28.1',
    developer: 'X Corp.',
    iconType: 'chat',
    containerPath: '/var/mobile/Containers/Data/Application/4F5A6B7C-8D9E-0F1A-2B3C-4D5E6F7A8B9C',
    installedSize: '155.0 MB'
  },
  {
    bundleId: 'com.apple.mobilesafari',
    name: 'Safari (Apple)',
    version: '17.4',
    developer: 'Apple Inc.',
    iconType: 'globe',
    containerPath: '/var/mobile/Containers/Data/Application/00000000-0000-0000-0000-000000000001',
    installedSize: '12.0 MB'
  },
  {
    bundleId: 'com.apple.Preferences',
    name: 'Settings (Apple)',
    version: '1.0',
    developer: 'Apple Inc.',
    iconType: 'gear',
    containerPath: '/var/mobile/Containers/Data/Application/00000000-0000-0000-0000-000000000002',
    installedSize: '8.4 MB'
  }
];

export const INITIAL_FILE_SYSTEM: { [path: string]: FileItem } = {
  // Spotify Container
  '/var/mobile/Containers/Data/Application/3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10': {
    name: '3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10',
    isDir: true,
    modifiedDate: '2026-08-18 14:32',
    permissions: 'drwxr-xr-x',
    children: {
      'Documents': {
        name: 'Documents',
        isDir: true,
        modifiedDate: '2026-08-18 14:32',
        permissions: 'drwxr-xr-x',
        children: {
          'offline_cache.db': {
            name: 'offline_cache.db',
            isDir: false,
            size: 4528192,
            type: 'sqlite',
            modifiedDate: '2026-08-18 14:20',
            permissions: '-rw-r--r--',
            content: `SQLite format 3\n--- [Table: tracks_offline] ---\n1 | uri: spotify:track:4cOdK2wGLETKBW3PvgPWqT | Rick Astley - Never Gonna Give You Up | 213s | cached: true\n2 | uri: spotify:track:3n3Ppam7vgaVa1iaRUc9Lp | The Weeknd - Blinding Lights | 200s | cached: true\n3 | uri: spotify:track:7qiZfU4dY1lWllzX7mPBI3 | Ed Sheeran - Shape of You | 233s | cached: true\n--- [Table: playback_state] ---\nactive_device: iPhone15,2 | volume: 0.85 | shuffle: true | repeat: track`
          },
          'user_profile.json': {
            name: 'user_profile.json',
            isDir: false,
            size: 1420,
            type: 'json',
            modifiedDate: '2026-08-18 10:15',
            permissions: '-rw-r--r--',
            content: JSON.stringify({
              username: "elvis_music",
              subscription: "Premium Individual",
              country: "US",
              explicit_content_filter: false,
              streaming_quality: "Very High (320kbps)",
              download_over_cellular: false,
              crossfade_seconds: 5,
              equalizer_preset: "Bass Boost"
            }, null, 2)
          }
        }
      },
      'Library': {
        name: 'Library',
        isDir: true,
        modifiedDate: '2026-08-18 14:32',
        permissions: 'drwxr-xr-x',
        children: {
          'Preferences': {
            name: 'Preferences',
            isDir: true,
            modifiedDate: '2026-08-18 12:00',
            permissions: 'drwxr-xr-x',
            children: {
              'com.spotify.client.plist': {
                name: 'com.spotify.client.plist',
                isDir: false,
                size: 2840,
                type: 'plist',
                modifiedDate: '2026-08-18 12:00',
                permissions: '-rw-r--r--',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>APMetDataStoreVersionKey</key>
    <integer>3</integer>
    <key>AppVersion</key>
    <string>8.8.92</string>
    <key>AuthSessionToken</key>
    <string>spt_live_99d10e828a1c8f49</string>
    <key>CarPlayEnabled</key>
    <true/>
    <key>CrashReporterEnabled</key>
    <false/>
    <key>DownloadQualityAudio</key>
    <string>VERY_HIGH</string>
    <key>LastSyncTimestamp</key>
    <real>1787123901.42</real>
</dict>
</plist>`
              }
            }
          },
          'Caches': {
            name: 'Caches',
            isDir: true,
            modifiedDate: '2026-08-18 14:30',
            permissions: 'drwxr-xr-x',
            children: {
              'artwork_cache': {
                name: 'artwork_cache',
                isDir: true,
                modifiedDate: '2026-08-18 14:30',
                permissions: 'drwxr-xr-x',
                children: {
                  'cover_83f12a.jpg': {
                    name: 'cover_83f12a.jpg',
                    isDir: false,
                    size: 89410,
                    type: 'image',
                    modifiedDate: '2026-08-18 14:28',
                    permissions: '-rw-r--r--',
                    content: '[JPEG Image Binary Data: Album Artwork - 640x640]'
                  },
                  'artist_thumb_01.jpg': {
                    name: 'artist_thumb_01.jpg',
                    isDir: false,
                    size: 42100,
                    type: 'image',
                    modifiedDate: '2026-08-18 14:28',
                    permissions: '-rw-r--r--',
                    content: '[JPEG Image Binary Data: Artist Thumbnail - 320x320]'
                  }
                }
              },
              'http_cache.db': {
                name: 'http_cache.db',
                isDir: false,
                size: 120480,
                type: 'sqlite',
                modifiedDate: '2026-08-18 14:25',
                permissions: '-rw-r--r--',
                content: `SQLite format 3: WebKit HTTP network cache index & headers.`
              }
            }
          },
          'Application Support': {
            name: 'Application Support',
            isDir: true,
            modifiedDate: '2026-08-18 09:00',
            permissions: 'drwxr-xr-x',
            children: {
              'analytics.log': {
                name: 'analytics.log',
                isDir: false,
                size: 8400,
                type: 'log',
                modifiedDate: '2026-08-18 14:31',
                permissions: '-rw-r--r--',
                content: `[2026-08-18 14:30:01.102] [INFO] Player: Initializing CoreAudio Output Pipeline (44.1kHz, Stereo)\n[2026-08-18 14:30:02.441] [INFO] Network: Fetching metadata for URI spotify:track:4cOdK2wGLETKBW3PvgPWqT\n[2026-08-18 14:30:03.012] [INFO] AudioEngine: Buffer primed 4096 frames\n[2026-08-18 14:30:03.050] [DEBUG] Playback status changed: PLAYING`
              }
            }
          }
        }
      },
      'tmp': {
        name: 'tmp',
        isDir: true,
        modifiedDate: '2026-08-18 14:32',
        permissions: 'drwxrwxrwx',
        children: {
          'audio_buffer_temp.dat': {
            name: 'audio_buffer_temp.dat',
            isDir: false,
            size: 524288,
            type: 'binary',
            modifiedDate: '2026-08-18 14:30',
            permissions: '-rw-r--r--',
            content: '00 1f 4c 9a 00 00 01 e2 ff 1a bb cc 44 21 00 90\n33 ff 80 12 88 77 66 55 44 33 22 11 00 ff 00 aa'
          }
        }
      }
    }
  },

  // VLC Container
  '/var/mobile/Containers/Data/Application/1D5E9A7F-6C3B-42E8-89A1-45F7B8C2D3E1': {
    name: '1D5E9A7F-6C3B-42E8-89A1-45F7B8C2D3E1',
    isDir: true,
    modifiedDate: '2026-08-18 11:00',
    permissions: 'drwxr-xr-x',
    children: {
      'Documents': {
        name: 'Documents',
        isDir: true,
        modifiedDate: '2026-08-18 11:00',
        permissions: 'drwxr-xr-x',
        children: {
          'sample_clip.mp4': {
            name: 'sample_clip.mp4',
            isDir: false,
            size: 45088200,
            type: 'binary',
            modifiedDate: '2026-08-17 19:40',
            permissions: '-rw-r--r--',
            content: '00 00 00 20 66 74 79 70 69 73 6f 6d 00 00 02 00\n69 73 6f 6d 69 73 6f 32 61 76 63 31 6d 70 34 31'
          },
          'subtitles.srt': {
            name: 'subtitles.srt',
            isDir: false,
            size: 1540,
            type: 'text',
            modifiedDate: '2026-08-17 19:42',
            permissions: '-rw-r--r--',
            content: `1\n00:00:01,000 --> 00:00:04,000\nWelcome to iOS File System Explorer (MiFilza)\n\n2\n00:00:04,500 --> 00:00:08,000\nInspect sandboxes, app containers, and plist attributes.`
          }
        }
      },
      'Library': {
        name: 'Library',
        isDir: true,
        modifiedDate: '2026-08-18 11:00',
        permissions: 'drwxr-xr-x',
        children: {
          'Preferences': {
            name: 'Preferences',
            isDir: true,
            modifiedDate: '2026-08-18 11:00',
            permissions: 'drwxr-xr-x',
            children: {
              'org.videolan.vlc-ios.plist': {
                name: 'org.videolan.vlc-ios.plist',
                isDir: false,
                size: 1980,
                type: 'plist',
                modifiedDate: '2026-08-18 11:00',
                permissions: '-rw-r--r--',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>HardwareDecoding</key>
    <true/>
    <key>AudioTimeStretching</key>
    <true/>
    <key>PasscodeEnabled</key>
    <false/>
    <key>WiFiSharingEnabled</key>
    <true/>
    <key>WiFiSharingPort</key>
    <integer>8080</integer>
</dict>
</plist>`
              }
            }
          }
        }
      }
    }
  },

  // 1Password Container
  '/var/mobile/Containers/Data/Application/7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D': {
    name: '7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D',
    isDir: true,
    modifiedDate: '2026-08-18 10:00',
    permissions: 'drwxr-xr-x',
    children: {
      'Documents': {
        name: 'Documents',
        isDir: true,
        modifiedDate: '2026-08-18 10:00',
        permissions: 'drwxr-xr-x',
        children: {
          'Vault.sqlite': {
            name: 'Vault.sqlite',
            isDir: false,
            size: 891240,
            type: 'sqlite',
            modifiedDate: '2026-08-18 09:45',
            permissions: '-rw-------',
            content: `SQLite format 3\n[ENCRYPTED VAULT BLOB - AES-256 GCM]\nKeyDerivation: Argon2id (Salt: 0x9f1a2b3c)\nEncryptedItems: 142 records\nBiometrics: FaceID Enabled`
          }
        }
      },
      'Library': {
        name: 'Library',
        isDir: true,
        modifiedDate: '2026-08-18 10:00',
        permissions: 'drwxr-xr-x',
        children: {
          'Preferences': {
            name: 'Preferences',
            isDir: true,
            modifiedDate: '2026-08-18 10:00',
            permissions: 'drwxr-xr-x',
            children: {
              'com.agilebits.onepassword.plist': {
                name: 'com.agilebits.onepassword.plist',
                isDir: false,
                size: 2100,
                type: 'plist',
                modifiedDate: '2026-08-18 10:00',
                permissions: '-rw-------',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>BiometricAuthEnabled</key>
    <true/>
    <key>AutoLockTimeout</key>
    <integer>300</integer>
    <key>ClipboardClearTimeout</key>
    <integer>90</integer>
    <key>WatchtowerAlerts</key>
    <true/>
</dict>
</plist>`
              }
            }
          }
        }
      }
    }
  },

  // Root file system (Unrestricted Filesystem simulation)
  '/': {
    name: '/',
    isDir: true,
    modifiedDate: '2026-08-19 00:00',
    permissions: 'drwxr-xr-x',
    children: {
      'Applications': {
        name: 'Applications',
        isDir: true,
        modifiedDate: '2026-08-19 00:00',
        permissions: 'drwxr-xr-x',
        children: {
          'MiFilza.app': {
            name: 'MiFilza.app',
            isDir: true,
            modifiedDate: '2026-08-19 00:00',
            permissions: 'drwxr-xr-x',
            children: {
              'Info.plist': {
                name: 'Info.plist',
                isDir: false,
                size: 1420,
                type: 'plist',
                modifiedDate: '2026-08-19 00:00',
                permissions: '-rw-r--r--',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>MiApp</string>
    <key>CFBundleIdentifier</key>
    <string>com.apple.mobile.MobileHouseArrest</string>
    <key>CFBundleName</key>
    <string>MiFilza</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>MinimumOSVersion</key>
    <string>14.0</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
</dict>
</plist>`
              },
              'MiApp': {
                name: 'MiApp',
                isDir: false,
                size: 2154200,
                type: 'binary',
                modifiedDate: '2026-08-19 00:00',
                permissions: '-rwxr-xr-x',
                content: 'cf fa ed fe 07 00 00 01 03 00 00 00 02 00 00 00\nMach-O 64-bit arm64 executable binary (MiFilza Engine)'
              },
              'Assets.car': {
                name: 'Assets.car',
                isDir: false,
                size: 512000,
                type: 'binary',
                modifiedDate: '2026-08-19 00:00',
                permissions: '-rw-r--r--',
                content: '79 73 70 70 01 00 00 00 (Compiled Asset Catalog: AppIcon, Icons, UI Elements)'
              }
            }
          },
          'Safari.app': {
            name: 'Safari.app',
            isDir: true,
            modifiedDate: '2026-08-19 00:00',
            permissions: 'drwxr-xr-x',
            children: {
              'Info.plist': {
                name: 'Info.plist',
                isDir: false,
                size: 2400,
                type: 'plist',
                modifiedDate: '2026-08-19 00:00',
                permissions: '-rw-r--r--',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>com.apple.mobilesafari</string><key>CFBundleName</key><string>Safari</string></dict></plist>`
              }
            }
          },
          'Preferences.app': {
            name: 'Preferences.app',
            isDir: true,
            modifiedDate: '2026-08-19 00:00',
            permissions: 'drwxr-xr-x',
            children: {
              'Info.plist': {
                name: 'Info.plist',
                isDir: false,
                size: 1900,
                type: 'plist',
                modifiedDate: '2026-08-19 00:00',
                permissions: '-rw-r--r--',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>com.apple.Preferences</string><key>CFBundleName</key><string>Settings</string></dict></plist>`
              }
            }
          }
        }
      },
      'var': {
        name: 'var',
        isDir: true,
        modifiedDate: '2026-08-19 00:00',
        permissions: 'drwxr-xr-x',
        children: {
          'mobile': {
            name: 'mobile',
            isDir: true,
            modifiedDate: '2026-08-19 00:00',
            permissions: 'drwxr-xr-x',
            children: {
              'Containers': {
                name: 'Containers',
                isDir: true,
                modifiedDate: '2026-08-19 00:00',
                permissions: 'drwxr-xr-x',
                children: {
                  'Data': {
                    name: 'Data',
                    isDir: true,
                    modifiedDate: '2026-08-19 00:00',
                    permissions: 'drwxr-xr-x',
                    children: {
                      'Application': {
                        name: 'Application',
                        isDir: true,
                        modifiedDate: '2026-08-19 00:00',
                        permissions: 'drwxr-xr-x',
                        children: {
                          '3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10': {
                            name: '3B9F2A1C-9E40-4C5A-85C1-37DB53A47C10 (Spotify)',
                            isDir: true,
                            modifiedDate: '2026-08-18 14:32',
                            permissions: 'drwxr-xr-x',
                            children: {}
                          },
                          '1D5E9A7F-6C3B-42E8-89A1-45F7B8C2D3E1': {
                            name: '1D5E9A7F-6C3B-42E8-89A1-45F7B8C2D3E1 (VLC)',
                            isDir: true,
                            modifiedDate: '2026-08-18 11:00',
                            permissions: 'drwxr-xr-x',
                            children: {}
                          },
                          '7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D': {
                            name: '7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D (1Password)',
                            isDir: true,
                            modifiedDate: '2026-08-18 10:00',
                            permissions: 'drwxr-xr-x',
                            children: {}
                          }
                        }
                      }
                    }
                  }
                }
              },
              'Library': {
                name: 'Library',
                isDir: true,
                modifiedDate: '2026-08-19 00:00',
                permissions: 'drwxr-xr-x',
                children: {
                  'Preferences': {
                    name: 'Preferences',
                    isDir: true,
                    modifiedDate: '2026-08-19 00:00',
                    permissions: 'drwxr-xr-x',
                    children: {
                      'com.apple.springboard.plist': {
                        name: 'com.apple.springboard.plist',
                        isDir: false,
                        size: 3200,
                        type: 'plist',
                        modifiedDate: '2026-08-18 08:00',
                        permissions: '-rw-r--r--',
                        content: `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>SBControlCenterShowVolumeControl</key>
    <true/>
    <key>SBHomePodIntegration</key>
    <true/>
    <key>SBStatusBarBatteryPercentage</key>
    <true/>
</dict>
</plist>`
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      'etc': {
        name: 'etc',
        isDir: true,
        modifiedDate: '2026-08-19 00:00',
        permissions: 'drwxr-xr-x',
        children: {
          'hosts': {
            name: 'hosts',
            isDir: false,
            size: 420,
            type: 'text',
            modifiedDate: '2026-08-19 00:00',
            permissions: '-rw-r--r--',
            content: `127.0.0.1   localhost\n::1         localhost\n127.0.0.1   mesu.apple.com (OTA Blocked)\n127.0.0.1   appldnld.apple.com`
          },
          'os-release': {
            name: 'os-release',
            isDir: false,
            size: 180,
            type: 'text',
            modifiedDate: '2026-08-19 00:00',
            permissions: '-rw-r--r--',
            content: `NAME="Darwin / iOS"\nVERSION="17.4 (21E219)"\nID=ios\nPRETTY_NAME="iOS 17.4"\nARCH="arm64e"`
          }
        }
      }
    }
  }
};

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
