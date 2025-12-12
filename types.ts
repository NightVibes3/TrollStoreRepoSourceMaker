

export interface AppItem {
    id: string;
    name: string;
    bundleIdentifier: string;
    developerName: string;
    version: string;
    versionDate: string;
    versionDescription: string;
    downloadURL: string;
    localizedDescription: string;
    iconURL: string;
    tintColor?: string;
    size?: number;
    screenshotURLs: string[];
}

export interface Repo {
    name: string;
    subtitle: string;
    description: string;
    iconURL: string;
    headerImageURL: string;
    website: string;
    tintColor: string;
    apps: AppItem[];
}

export interface DeviceProfile {
    model: 'iPhone 16 Pro' | 'iPhone 15' | 'iPhone SE' | 'iPad Pro';
    iosVersion: string;
}

export interface Deployment {
    id: string;
    url: string;
    createdAt: string;
    type: 'public' | 'secret';
    name: string;
}

export const DEFAULT_APP: AppItem = {
    id: "default",
    name: "New App",
    bundleIdentifier: "com.example.app",
    developerName: "Developer Name",
    version: "1.0",
    versionDate: new Date().toISOString().split('T')[0],
    versionDescription: "Initial release",
    downloadURL: "",
    localizedDescription: "Description of the app...",
    iconURL: "https://placehold.co/128x128.png",
    tintColor: "#3b82f6",
    size: 0,
    screenshotURLs: []
};

export const DEFAULT_REPO: Repo = {
    name: "My Repo",
    subtitle: "A collection of apps",
    description: "Welcome to my repository.",
    iconURL: "https://picsum.photos/200/200",
    headerImageURL: "https://picsum.photos/1200/400",
    website: "",
    tintColor: "#3b82f6",
    apps: []
};

export const DEFAULT_DEVICE: DeviceProfile = {
    model: 'iPhone 16 Pro',
    iosVersion: '18.0'
};

export const SAMPLE_REPOS: Record<string, Repo> = {
    "Empty Starter": DEFAULT_REPO,
    "Emulators Pack": {
        ...DEFAULT_REPO,
        name: "Retro Gaming",
        subtitle: "Classic Consoles",
        description: "The best emulators for iOS, ready to sideload.",
        iconURL: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop",
        headerImageURL: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
        apps: [
            {
                ...DEFAULT_APP,
                id: "delta-sample",
                name: "Delta",
                bundleIdentifier: "com.rileytestut.Delta",
                developerName: "Riley Testut",
                version: "1.5.1",
                localizedDescription: "The definitive all-in-one emulator for iPhone.",
                iconURL: "https://github.com/rileytestut/Delta/raw/main/Assets/AppIcon.png",
                tintColor: "#6d28d9",
                downloadURL: ""
            },
            {
                ...DEFAULT_APP,
                id: "provenance-sample",
                name: "Provenance",
                bundleIdentifier: "com.provenance-emu.provenance",
                developerName: "Provenance Emu",
                version: "2.2.0",
                localizedDescription: "Multi-system emulator frontend supporting Atari, Sega, Nintendo, Sony and more.",
                iconURL: "https://github.com/Provenance-Emu/Provenance/raw/develop/Provenance/Assets.xcassets/AppIcon.appiconset/Icon-60@3x.png",
                tintColor: "#10b981",
                downloadURL: ""
            }
        ]
    },
    "Power Tools": {
        ...DEFAULT_REPO,
        name: "Power Tools",
        subtitle: "System Utilities",
        description: "Advanced utilities for power users (JIT, VMs).",
        iconURL: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
        headerImageURL: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
        apps: [
            {
                ...DEFAULT_APP,
                id: "utm-sample",
                name: "UTM SE",
                bundleIdentifier: "com.turingsoftware.utm.se",
                developerName: "Turing Software",
                version: "4.5.0",
                localizedDescription: "Run virtual machines on iOS. Slow edition (No JIT).",
                iconURL: "https://github.com/utmapp/UTM/raw/main/Platform/iOS/Images.xcassets/AppIcon.appiconset/1024.png",
                tintColor: "#f43f5e",
                downloadURL: ""
            },
            {
                 ...DEFAULT_APP,
                 id: "it-sample",
                 name: "iTorrent",
                 bundleIdentifier: "com.x1331.iTorrent",
                 developerName: "XITRIX",
                 version: "1.8.3",
                 localizedDescription: "BitTorrent client for iOS.",
                 iconURL: "https://github.com/XITRIX/iTorrent/raw/master/iTorrent/Resources/Assets.xcassets/AppIcon.appiconset/1024.png",
                 tintColor: "#3b82f6",
                 downloadURL: ""
            }
        ]
    }
};

export const validateURL = (url: string | undefined, context: 'image' | 'file' | 'website'): string | null => {
    if (!url || url.trim() === '') return null;
    
    const lower = url.toLowerCase();
    
    if (!lower.startsWith('https://')) {
        return "Must start with https:// (SideStore requirement)";
    }
    
    if (lower.includes('example.com') || lower.includes('placehold.it')) {
        return "This looks like a placeholder URL.";
    }
    
    if (lower.includes('localhost') || lower.includes('127.0.0.1')) {
        return "Localhost links won't work on other devices.";
    }

    if (!lower.includes('.')) {
        return "Invalid domain.";
    }

    // Context specific checks
    if (context === 'file') {
        if (lower.includes('terabox.com')) return "Terabox links are NOT direct. They will not work in AltStore.";
        if (lower.includes('mega.nz')) return "Mega links are encrypted and NOT direct. Use a direct mirror.";
        if (lower.includes('mediafire.com') && !lower.includes('download')) return "Mediafire links require a direct download key.";
        if (lower.includes('drive.google.com')) return "Google Drive links are unstable for Repos. Use GitHub Releases.";
        if (lower.includes('dropbox.com') && !lower.includes('dl=1')) return "Dropbox links must end in ?dl=1 to be direct.";

        if (lower.includes('app.iosgods.com') && !lower.includes('.ipa')) {
            return "iOSGods Store links break SideStore. You need the direct .ipa link.";
        }
        if (lower.includes('github.com') && lower.includes('/blob/')) {
            return "This is a GitHub view page. Replace '/blob/' with '/raw/' to make it valid.";
        }
        if (lower.includes('github.com') && !lower.includes('/releases/download/') && !lower.includes('raw')) {
             return "This looks like a GitHub page, not a file. Use the 'Assets' download link.";
        }
        if (lower.includes('archive.org/details/')) {
             return "This is a webpage. Use the direct file link from 'download' or right-click the IPA > Copy Link.";
        }
    }
    
    if (context === 'image') {
        if (!lower.match(/\.(png|jpg|jpeg|webp|gif)$/) && !lower.includes('githubusercontent')) {
             // Soft warning for images without extensions
             // return "Image URL should typically end in .png or .jpg";
        }
    }

    return null;
};

// --- Shared Export Logic ---

export const compareVersions = (v1: string, v2: string) => {
    const p1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
};

export const processRepoForExport = (repo: Repo, config: { deduplicate: boolean, filterIncompatible: boolean }): any => {
    let processedApps = [...repo.apps];

    // 1. Compatibility Filter (Remove apps that are explicitly marked as incompatible)
    if (config.filterIncompatible) {
        processedApps = processedApps.filter(app => {
            const text = (app.name + " " + app.localizedDescription + " " + app.versionDescription).toLowerCase();
            if (text.includes('jailbreak only') || text.includes('trollstore only') || text.includes('root required')) return false;
            return true;
        });
    }

    // 2. Deduplication (Latest Only Mode)
    if (config.deduplicate) {
        const latestMap = new Map<string, AppItem>();
        processedApps.forEach(app => {
            const existing = latestMap.get(app.bundleIdentifier);
            if (!existing) {
                latestMap.set(app.bundleIdentifier, app);
            } else {
                // If duplicates exist, keep the one with the higher version
                if (compareVersions(app.version, existing.version) > 0) {
                    latestMap.set(app.bundleIdentifier, app);
                }
            }
        });
        processedApps = Array.from(latestMap.values());
    }

    // 3. Data Sanitization (Ensure valid icon URLs, remove empty screenshots)
    return {
        ...repo,
        apps: processedApps.map(({ id, ...rest }) => ({
            ...rest,
            iconURL: rest.iconURL || "https://placehold.co/128x128.png",
            screenshotURLs: rest.screenshotURLs.filter(u => u && u.trim() !== "")
        }))
    };
};
