import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { BannerConfig } from "../types";
import { googleSignIn, logout, initAuth, getAccessToken } from "../lib/driveAuth";
import {
  listAppDriveFiles,
  uploadBannerImageToDrive,
  uploadDesignProjectToDrive,
  downloadDesignProjectFromDrive,
  deleteDriveFile,
  DriveFileItem
} from "../lib/driveApi";
import {
  Cloud,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  LogOut,
  ShieldAlert,
  Loader2,
  HardDrive
} from "lucide-react";

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BannerConfig;
  onLoadConfig: (newConfig: BannerConfig) => void;
  getCanvasDataUrl: () => string | null;
}

export default function DriveModal({
  isOpen,
  onClose,
  config,
  onLoadConfig,
  getCanvasDataUrl
}: DriveModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isListingLoading, setIsListingLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  const [isSavingImage, setIsSavingImage] = useState<boolean>(false);
  const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // Destructive deletion confirmation state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
        fetchFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const fetchFiles = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    setIsListingLoading(true);
    setActionStatus({ type: null, message: "" });
    try {
      const files = await listAppDriveFiles(activeToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error("Failed to load Google Drive files:", err);
      setActionStatus({
        type: "error",
        message: err.message || "Failed to list files from Google Drive."
      });
    } finally {
      setIsListingLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setActionStatus({ type: null, message: "" });
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setActionStatus({
          type: "success",
          message: `Connected to Google Drive as ${result.user.displayName || result.user.email}!`
        });
        await fetchFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setActionStatus({
        type: "error",
        message: err.message || "Sign in failed. Please try again."
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setDriveFiles([]);
      setActionStatus({ type: "info", message: "Signed out of Google Drive." });
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveBannerImage = async () => {
    if (!token) return;
    const dataUrl = getCanvasDataUrl();
    if (!dataUrl) {
      setActionStatus({ type: "error", message: "Canvas unavailable. Please ensure banner preview is loaded." });
      return;
    }

    setIsSavingImage(true);
    setActionStatus({ type: null, message: "" });
    try {
      const fileName = `${config.name.replace(/\s+/g, "-") || "LinkedIn"}-Banner-${Date.now().toString().slice(-4)}.png`;
      const uploadedFile = await uploadBannerImageToDrive(token, dataUrl, fileName);
      setActionStatus({
        type: "success",
        message: `Saved "${uploadedFile.name}" to Google Drive folder!`
      });
      await fetchFiles(token);
    } catch (err: any) {
      setActionStatus({
        type: "error",
        message: err.message || "Failed to save banner PNG to Google Drive."
      });
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSaveProjectConfig = async () => {
    if (!token) return;
    setIsSavingProject(true);
    setActionStatus({ type: null, message: "" });
    try {
      const fileName = `Qeloma-Banner-${config.name.replace(/\s+/g, "-") || "Project"}-${Date.now().toString().slice(-4)}.json`;
      const uploadedFile = await uploadDesignProjectToDrive(token, config, fileName);
      setActionStatus({
        type: "success",
        message: `Saved design project "${uploadedFile.name}" to Google Drive!`
      });
      await fetchFiles(token);
    } catch (err: any) {
      setActionStatus({
        type: "error",
        message: err.message || "Failed to save design project to Google Drive."
      });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleLoadProjectConfig = async (file: DriveFileItem) => {
    if (!token) return;
    setLoadingFileId(file.id);
    setActionStatus({ type: null, message: "" });
    try {
      const loadedConfig = await downloadDesignProjectFromDrive(token, file.id);
      onLoadConfig(loadedConfig);
      setActionStatus({
        type: "success",
        message: `Loaded design configuration from "${file.name}"!`
      });
    } catch (err: any) {
      setActionStatus({
        type: "error",
        message: err.message || "Failed to read design project file."
      });
    } finally {
      setLoadingFileId(null);
    }
  };

  // User Confirmation for Destructive Delete Operation
  const confirmDeleteFile = async () => {
    if (!token || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setActionStatus({
        type: "info",
        message: `Deleted "${fileToDelete.name}" from Google Drive.`
      });
      setFileToDelete(null);
      await fetchFiles(token);
    } catch (err: any) {
      setActionStatus({
        type: "error",
        message: err.message || "Failed to delete file from Google Drive."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-line rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-raised/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 text-brand">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-ink flex items-center gap-2">
                <span>Google Drive Integration</span>
              </h2>
              <p className="text-xs text-muted">
                Save banners, export project JSONs, and reload designs from your Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-raised transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert Banner */}
          {actionStatus.type && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                actionStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : actionStatus.type === "error"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              {actionStatus.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {actionStatus.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
              {actionStatus.type === "info" && <Cloud className="w-4 h-4 shrink-0" />}
              <span className="flex-1 font-medium">{actionStatus.message}</span>
              <button
                onClick={() => setActionStatus({ type: null, message: "" })}
                className="hover:opacity-70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Authentication Card */}
          {!user ? (
            <div className="p-8 rounded-2xl bg-raised/40 border border-line text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand mx-auto flex items-center justify-center">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Connect Your Google Account</h3>
                <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
                  Sign in to save your customized 1584x396 LinkedIn cover banners and project templates directly to a dedicated <strong className="text-ink font-semibold">Qeloma Cover Studio Banners</strong> folder in Google Drive.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-slate-100 dark:text-slate-900 border border-slate-700 dark:border-slate-300 font-bold text-xs hover:opacity-95 transition-all flex items-center gap-3 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Header */}
              <div className="p-4 rounded-xl bg-raised/50 border border-line flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Google User"}
                      className="w-10 h-10 rounded-full border border-line"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center border border-brand/20">
                      {user.displayName?.[0] || user.email?.[0] || "G"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-ink">{user.displayName || "Google User"}</h4>
                    <p className="text-[11px] text-muted">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchFiles()}
                    disabled={isListingLoading}
                    className="p-2 text-muted hover:text-ink hover:bg-raised rounded-lg border border-line transition-colors cursor-pointer"
                    title="Refresh files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isListingLoading ? "animate-spin text-brand" : ""}`} />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSaveBannerImage}
                  disabled={isSavingImage}
                  className="p-4 rounded-xl bg-brand/10 border border-brand/20 hover:bg-brand/20 transition-all text-left flex items-start gap-3 cursor-pointer group disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-lg bg-brand text-on-brand shrink-0 group-hover:scale-105 transition-transform">
                    {isSavingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink group-hover:text-brand transition-colors">
                      Save Banner PNG to Drive
                    </h4>
                    <p className="text-[11px] text-muted mt-0.5">
                      Uploads full 1584x396 ultra-res PNG directly to your Google Drive folder.
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleSaveProjectConfig}
                  disabled={isSavingProject}
                  className="p-4 rounded-xl bg-raised border border-line hover:border-brand/40 transition-all text-left flex items-start gap-3 cursor-pointer group disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-lg bg-slate-800 text-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                    {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink group-hover:text-brand transition-colors">
                      Save Design Template JSON
                    </h4>
                    <p className="text-[11px] text-muted mt-0.5">
                      Saves editable banner parameters so you can reload and tweak later.
                    </p>
                  </div>
                </button>
              </div>

              {/* Google Drive Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-brand" />
                    <span>Qeloma Cover Studio Banners Folder</span>
                  </h3>
                  <span className="text-[10px] font-mono text-faint">
                    {driveFiles.length} file{driveFiles.length === 1 ? "" : "s"} saved
                  </span>
                </div>

                {isListingLoading ? (
                  <div className="p-8 text-center text-xs text-muted flex items-center justify-center gap-2 border border-line rounded-xl bg-raised/20">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span>Loading files from Google Drive...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted border border-line rounded-xl bg-raised/20 space-y-1">
                    <p className="font-semibold text-ink">No saved banners or projects yet</p>
                    <p className="text-faint text-[11px]">
                      Click "Save Banner PNG" or "Save Design Template" above to start populating your Google Drive folder.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {driveFiles.map((file) => {
                      const isJson = file.mimeType === "application/json" || file.name.endsWith(".json");
                      return (
                        <div
                          key={file.id}
                          className="p-3 rounded-xl bg-raised/40 border border-line hover:border-brand/30 transition-all flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {file.thumbnailLink ? (
                              <img
                                src={file.thumbnailLink}
                                alt={file.name}
                                className="w-9 h-9 rounded object-cover border border-line shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${
                                  isJson
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                }`}
                              >
                                {isJson ? <FileCode className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-ink truncate text-xs">{file.name}</p>
                              <p className="text-[10px] text-faint mt-0.5">
                                {file.createdTime
                                  ? new Date(file.createdTime).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })
                                  : "Google Drive File"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isJson && (
                              <button
                                onClick={() => handleLoadProjectConfig(file)}
                                disabled={loadingFileId === file.id}
                                className="px-2.5 py-1 rounded bg-brand/10 border border-brand/20 text-brand text-[10px] font-bold hover:bg-brand/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Apply this design template to canvas"
                              >
                                {loadingFileId === file.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Download className="w-3 h-3" />
                                )}
                                <span>Load Template</span>
                              </button>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-muted hover:text-ink hover:bg-raised rounded transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line bg-raised/30 flex items-center justify-between text-xs text-muted">
          <span className="text-[11px] text-faint">
            Direct REST API sync with Google Drive v3
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-raised border border-line text-ink font-semibold hover:bg-surface transition-colors cursor-pointer text-xs"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for Destructive Delete Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-surface border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Delete File from Google Drive?</h3>
                <p className="text-xs text-muted">This operation will permanently remove the item.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-raised border border-line text-xs space-y-1">
              <p className="font-bold text-ink truncate">{fileToDelete.name}</p>
              <p className="text-[11px] text-faint">
                ID: {fileToDelete.id}
              </p>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to delete <strong className="text-ink">{fileToDelete.name}</strong> from your Google Drive? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl bg-raised border border-line text-ink text-xs font-semibold hover:bg-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
