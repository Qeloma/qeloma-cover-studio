import { BannerConfig } from "../types";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  size?: string;
}

const APP_FOLDER_NAME = "Qeloma Cover Studio Banners";

/**
 * Searches for or creates the application folder in the user's Google Drive.
 */
export async function getOrCreateAppFolder(token: string): Promise<string> {
  const query = encodeURIComponent(`name = '${APP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Google Drive API error (${listRes.status}): ${errText}`);
  }

  const data = await listRes.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder"
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Drive folder (${createRes.status}): ${errText}`);
  }

  const folder = await createRes.json();
  return folder.id;
}

/**
 * Saves a banner PNG image to Google Drive.
 */
export async function uploadBannerImageToDrive(
  token: string,
  dataUrl: string,
  fileName: string
): Promise<DriveFileItem> {
  const folderId = await getOrCreateAppFolder(token);

  // Convert dataURL to base64
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

  const metadata = {
    name: fileName.endsWith(".png") ? fileName : `${fileName}.png`,
    mimeType: "image/png",
    parents: [folderId]
  };

  const boundary = "qeloma_drive_boundary_8832";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: image/png\r\n" +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    base64Data +
    closeDelimiter;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink,createdTime,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Saves a JSON design configuration project file to Google Drive.
 */
export async function uploadDesignProjectToDrive(
  token: string,
  config: BannerConfig,
  fileName: string
): Promise<DriveFileItem> {
  const folderId = await getOrCreateAppFolder(token);
  const cleanName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;

  const metadata = {
    name: cleanName,
    mimeType: "application/json",
    parents: [folderId]
  };

  const jsonContent = JSON.stringify(config, null, 2);

  const boundary = "qeloma_drive_boundary_8832";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    jsonContent +
    closeDelimiter;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive project upload failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Lists files saved in the Qeloma Cover Studio folder on Google Drive.
 */
export async function listAppDriveFiles(token: string): Promise<DriveFileItem[]> {
  try {
    const folderId = await getOrCreateAppFolder(token);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent("files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,size)");

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=createdTime%20desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to list Google Drive files (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error("Error listing Drive files:", err);
    throw err;
  }
}

/**
 * Downloads and parses a JSON design configuration file from Google Drive.
 */
export async function downloadDesignProjectFromDrive(token: string, fileId: string): Promise<BannerConfig> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch file content from Google Drive (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete file from Google Drive (${res.status}): ${errText}`);
  }
}
