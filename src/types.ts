export interface FileItem {
  name: string;
  isDir: boolean;
  size?: number; // in bytes
  content?: string;
  binaryData?: string; // base64 or hex preview
  type?: 'text' | 'plist' | 'json' | 'sqlite' | 'image' | 'binary' | 'log';
  modifiedDate?: string;
  permissions?: string;
  children?: { [key: string]: FileItem };
}

export interface AppMetadata {
  bundleId: string;
  name: string;
  version: string;
  developer: string;
  iconType: 'music' | 'chat' | 'camera' | 'globe' | 'video' | 'lock' | 'gear' | 'terminal' | 'tool';
  containerPath: string;
  installedSize: string;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}
