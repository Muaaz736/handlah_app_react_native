import { Alert, I18nManager, PermissionsAndroid, Platform } from 'react-native';
import { requestStorageWritePermission } from '../services/permissions/permissionService';
import { enforceHttps } from './httpsGuard';
import i18next from 'i18next';
import type {
  ApplyRTLFunction,
  GetInitialsFunction,
  GetLocaleDateFormatFunction,
  DateFormat,
} from '../types/helpers.types';
import { BASEURL, apiHandle } from '../config/apiHandle';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';

export const isIOS: boolean = Platform.OS === 'ios';

export const applyRTL: ApplyRTLFunction = isRTL => {
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    return true; // restart needed
  }
  return false;
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
const getMimeType = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Generate initials from name
 * @param {string | null | undefined} name - Name to generate initials from
 * @returns {string} - Initials or '?' if name is invalid
 */
export const getInitials: GetInitialsFunction = name => {
  if (!name) return '?';

  const nameParts: string[] = name.trim().split(' ');

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};

/**
 * Get date format based on language/locale
 * English (US) uses MM/DD/YYYY, most other locales use DD/MM/YYYY
 * @param {string} language - Language code
 * @returns {DateFormat} - Date format string
 */
export const getLocaleDateFormat: GetLocaleDateFormatFunction = language => {
  // For English, use US format (MM/DD/YYYY)
  if (language === 'en' || language?.startsWith('en-')) {
    return 'MM/DD/YYYY';
  }
  // For Arabic and other languages, use DD/MM/YYYY
  return 'DD/MM/YYYY';
};

/**
 * @param {string|object} imageId - The image ID, full URL, or API object with signedurl
 * @returns {string|null} - Full image URL or null if no imageId provided

 */
export const getImageUrl = (imageId: any) => {
  if (!imageId || imageId === 'null' || imageId === 'undefined') {
    return null;
  }

  // If it's an object (new API format with signedurl)
  if (typeof imageId === 'object' && imageId !== null) {
    // Check for signedurl field (new API format)
    if (imageId.signedurl) {
      return imageId.signedurl;
    }
    // Check for signedUrl field (camelCase)
    if (imageId.signedUrl) {
      return imageId.signedUrl;
    }
    // Check for url field (old format)
    if (imageId.url) {
      return imageId.url;
    }
    // If object has id, treat it as an ID
    if (imageId.id) {
      return `${BASEURL}image/${imageId.id}`;
    }
    return null;
  }

  // If it's a string
  if (typeof imageId === 'string') {
    // Check if it's already a full URL; enforce HTTPS via guard
    if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
      return enforceHttps(imageId);
    }
    // If it's just an ID, build the full URL
    return `${BASEURL}image/${imageId}`;
  }

  return null;
};

/**

 * @param {string|object} documentId - The document ID, full URL, or API object with signedurl
 * @returns {string|null} - Full document URL or null if no documentId provided

 */
export const getDocumentUrl = (documentId: any) => {
  if (!documentId || documentId === 'null' || documentId === 'undefined') {
    return null;
  }

  // If it's an object (new API format with signedurl)
  if (typeof documentId === 'object' && documentId !== null) {
    // Check for signedurl field (new API format - lowercase)
    if (documentId.signedurl) {
      return documentId.signedurl;
    }
    // Check for signedUrl field (camelCase)
    if (documentId.signedUrl) {
      return documentId.signedUrl;
    }
    // Check for url field (old format)
    if (documentId.url) {
      return documentId.url;
    }
    // If object has id, treat it as an ID
    if (documentId.id) {
      return `${BASEURL}image/${documentId.id}`;
    }
    return null;
  }

  // If it's a string
  if (typeof documentId === 'string') {
    // Check if it's already a full URL (starts with http:// or https://)
    if (documentId.startsWith('http://') || documentId.startsWith('https://')) {
      return enforceHttps(documentId);
    }
    // If it's just an ID, build the full URL
    return `${BASEURL}image/${documentId}`;
  }

  return null;
};

/**
 * Format ISO date string to US date format (MM/DD/YYYY)
 * @param {string} isoDateString - ISO date string (e.g., "2026-03-09T15:27:01.237")
 * @param {string} locale - Locale code (default: 'en-US')
 * @returns {string} - Formatted date string or 'N/A' if invalid
 */
export const formatDate = (isoDateString: any, locale = 'en-US') => {
  if (!isoDateString) return 'N/A';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'N/A';

    const isDateOnly =
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0;

    return date.toLocaleDateString(locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      ...(isDateOnly ? { timeZone: 'UTC' } : {}),
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

/**
 * Parse a calendar-only date value (birthdate, expiration, start/end date, etc.)
 * into a Date object safe to read back out via local getters (getFullYear/
 * getMonth/getDate) — e.g. before handing it to CustomDateTimePicker's `value`
 * prop. Backend values are stored as UTC midnight with no real time-of-day
 * meaning; reinterpreting via UTC components prevents the date from rolling
 * back a day in timezones behind UTC.
 */
export const parseDateOnlyValue = (
  value: string | Date | null | undefined,
): Date | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;

  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  return isUtcMidnight
    ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    : date;
};

export const convert24HourTo12Hour = (
  time: string,
): string => {
  if (!time) return '';

  const parts = time.split(':');

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(
    2,
    '0',
  )}:${minutes} ${ampm}`;
};

/**
 * Download and open a document from URL
 * @param {string} documentUrl - Full URL of the document to download
 * @param {string} fileName - Name to save the file as
 * @returns {Promise<void>}
 */
export const downloadAndOpenDocument = async (
  documentUrl: any,
  fileName: string = 'document.pdf',
): Promise<void> => {
  if (!documentUrl) {
    Alert.alert(i18next.t('common.error'), i18next.t('common.invalid_document_url'));
    return;
  }

  if (typeof documentUrl === 'object' && documentUrl !== null) {
    const obj = documentUrl;
    const resolvedUrl = obj.signedurl || obj.signedUrl || obj.url;
    const resolvedName = obj.filename || obj.fileName || fileName;
    if (resolvedUrl) {
      return downloadAndOpenDocument(resolvedUrl, resolvedName);
    }
    Alert.alert(i18next.t('common.error'), i18next.t('common.invalid_document_url'));
    return;
  }

  if (typeof documentUrl === 'string' && documentUrl.includes(`${BASEURL}image/`)) {
    try {
      const imageId = documentUrl.replace(`${BASEURL}image/`, '').split('?')[0];
      if (imageId) {
        const response = await apiHandle.get(`image/${imageId}`);
        const data = response.data;
        const signedUrl = data?.signedurl || data?.signedUrl || data?.url;
        const resolvedName = data?.filename || data?.fileName || fileName;
        if (signedUrl) {
          return downloadAndOpenDocument(signedUrl, resolvedName);
        }
      }
    } catch (error) {
      console.error('Error resolving signed URL for download:', error);
    }
  }

  try {
    const storageGranted = await requestStorageWritePermission();
    if (!storageGranted) {
      return;
    }

    const timestamp = new Date().getTime();

    let fileExtension = 'pdf'; // default to pdf

    if (fileName && fileName.includes('.')) {
      fileExtension = (fileName.split('.').pop() as string).toLowerCase();
    } else {
      const urlPath = documentUrl.split('?')[0]; // Remove query params
      if (urlPath.includes('.')) {
        fileExtension = (urlPath.split('.').pop() as string).toLowerCase();
      }
    }

    let sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    if (!sanitizedFileName.toLowerCase().endsWith(`.${fileExtension}`)) {
      sanitizedFileName = `${sanitizedFileName}.${fileExtension}`;
    }

    const { dirs } = ReactNativeBlobUtil.fs;

    const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.CacheDir;
    const filePath = `${downloadDir}/${sanitizedFileName}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: filePath,
      addAndroidDownloads: Platform.OS === 'android' ? {
        useDownloadManager: true,
        notification: true,
        title: sanitizedFileName,
        description: 'Downloading document',
        mime: 'application/octet-stream',
        mediaScannable: true,
      } : undefined,
    }).fetch('GET', documentUrl);

    const actualPath = res.path();

    const fileExists = await ReactNativeBlobUtil.fs.exists(actualPath);
    if (!fileExists) {
      Alert.alert(i18next.t('common.error'), i18next.t('common.download_failed'));
      return;
    }

    // Check file size
    const stat = await ReactNativeBlobUtil.fs.stat(actualPath);
    if (stat.size === 0) {
      Alert.alert(
        i18next.t('common.error'),
        i18next.t('common.download_empty'),
      );
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(actualPath, getMimeType(fileExtension));
      } else {
        await FileViewer.open(actualPath, {
          showOpenWithDialog: true,
          showAppsSuggestions: true,
        });
      }
    } catch (viewError: any) {
      Alert.alert(
        i18next.t('common.download_complete'),
        `${i18next.t('common.document_downloaded_successfully')}\n\nLocation: ${actualPath}`,
        [
          {
            text: i18next.t('common.ok'),
            onPress: () => { },
          },
        ]
      );
    }
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert(
      i18next.t('common.error'),
      i18next.t('common.download_failed') + ': ' + (error.message || ''),
    );
  }
};


export const saveAndOpenExportFile = async (
  content: string,
  baseFileName: string = 'Handlah_Data_Export',
  extension: string = 'csv',
): Promise<void> => {
  if (!content) {
    Alert.alert(i18next.t('common.error'), i18next.t('common.download_failed'));
    return;
  }

  try {
    const storageGranted = await requestStorageWritePermission();
    if (!storageGranted) {
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const sanitized = baseFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${sanitized}_${timestamp}.${extension}`;

    const { dirs } = ReactNativeBlobUtil.fs;
    const saveDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.CacheDir;
    const filePath = `${saveDir}/${fileName}`;

    await ReactNativeBlobUtil.fs.writeFile(filePath, content, 'utf8');

    const fileExists = await ReactNativeBlobUtil.fs.exists(filePath);
    if (!fileExists) {
      Alert.alert(i18next.t('common.error'), i18next.t('common.download_failed'));
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(filePath, getMimeType(extension));
      } else {
        await FileViewer.open(filePath, {
          showOpenWithDialog: true,
          showAppsSuggestions: true,
        });
      }
    } catch (viewError) {
      Alert.alert(
        i18next.t('common.download_complete'),
        `${i18next.t('common.document_downloaded_successfully')}\n\nLocation: ${filePath}`,
        [{ text: i18next.t('common.ok'), onPress: () => { } }],
      );
    }
  } catch (error: any) {
    console.error('Export save error:', error);
    Alert.alert(
      i18next.t('common.error'),
      i18next.t('common.download_failed') + ': ' + (error.message || ''),
    );
  }
};

/**
 * @param {string|object} documentUrl - The document URL, ID, or API object with signedurl
 * @returns {object|null} - Document data object with uri, name, type, size or null
 */
export const getDocumentDataFromUrl = (documentUrl: any) => {
  if (!documentUrl || documentUrl === 'null' || documentUrl === 'undefined') {
    return null;
  }

  if (typeof documentUrl === 'object' && documentUrl !== null) {
    const url = documentUrl.signedurl || documentUrl.signedUrl || documentUrl.url;
    const name = documentUrl.filename || documentUrl.fileName || 'Document';
    const type = documentUrl.contenttype || documentUrl.contentType || 'application/octet-stream';
    const size = documentUrl.filesize || documentUrl.fileSize || undefined;

    if (url) {
      return {
        uri: url,
        name: name,
        type: type,
        size: size,
      };
    }
  }
  const fullUrl = getDocumentUrl(documentUrl);
  if (!fullUrl) return null;

  const urlParts = fullUrl.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const documentId = lastPart.split('.')[0]; // Get ID without extension

  let fileExtension = 'pdf';
  let mimeType = 'application/pdf';
  let fileName = 'Document.pdf';

  if (lastPart.includes('.')) {
    fileExtension = lastPart.split('.').pop()?.toLowerCase() || 'pdf';
  }

  const extensionMap: { [key: string]: { mime: string; name: string } } = {
    pdf: { mime: 'application/pdf', name: 'Document.pdf' },
    doc: { mime: 'application/msword', name: 'Document.doc' },
    docx: {
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'Document.docx',
    },
    xls: { mime: 'application/vnd.ms-excel', name: 'Document.xls' },
    xlsx: {
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: 'Document.xlsx',
    },
    ppt: { mime: 'application/vnd.ms-powerpoint', name: 'Document.ppt' },
    pptx: {
      mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      name: 'Document.pptx',
    },
    txt: { mime: 'text/plain', name: 'Document.txt' },
    jpg: { mime: 'image/jpeg', name: 'Image.jpg' },
    jpeg: { mime: 'image/jpeg', name: 'Image.jpeg' },
    png: { mime: 'image/png', name: 'Image.png' },
    gif: { mime: 'image/gif', name: 'Image.gif' },
    zip: { mime: 'application/zip', name: 'Archive.zip' },
    rar: { mime: 'application/x-rar-compressed', name: 'Archive.rar' },
  };

  if (extensionMap[fileExtension]) {
    mimeType = extensionMap[fileExtension].mime;
    fileName = extensionMap[fileExtension].name;
  }

  return {
    uri: fullUrl,
    name: fileName,
    type: mimeType,
    size: undefined, // Size is unknown from URL
  };
};

export const extractApiError = (error: any, defaultMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  } else if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  } else if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

/** @deprecated Use extractApiError with rejectWithValue instead */
export const handleApiError = (error: any, defaultMessage: string): never => {
  throw new Error(extractApiError(error, defaultMessage));
};

export const formatDropdoenOption = (options: any) => {
  const optionsArray = options?.map((option: any) => ({
    label: option.label,
    value: String(option.id),
    icon: option.iconsvg || null,
    // Kept for features that read them (e.g. a finance account type's Asset / Liability category).
    optionValue: option.value ?? null,
    stype: option.stype ?? option.sType ?? null,
    sortOrder: option.sortorder ?? option.sortOrder ?? null,
  }));
  return optionsArray || [];
}

const OTHER_VALUES = ['other', 'others'];
export const isOtherSelected = (val: string) =>
  OTHER_VALUES.includes(val?.toLowerCase()?.trim());

export const DEFAULT_COUNTRY_NAME = 'United States';

const DEFAULT_COUNTRY_ALIASES = [
  'united states',
  'united states of america',
  'usa',
  'us',
];

export const findDefaultCountry = (countriesData: any[] | null | undefined): any | undefined =>
  countriesData?.find((c: any) => {
    const name = c?.countryname?.trim().toLowerCase();
    return !!name && DEFAULT_COUNTRY_ALIASES.includes(name);
  });