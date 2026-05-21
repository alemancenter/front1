import { extractError } from '@/lib/utils';

export type EditorUploadResult = {
  url: string;
  name?: string;
  alt?: string;
};

function normalizeUploadedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);

    // Backend often returns internal API URLs such as:
    // http://127.0.0.1:8080/storage/images/x.webp
    // These must not be inserted into browser HTML because CSP blocks them and
    // production visitors cannot access private/internal backend hosts.
    if (parsed.pathname.startsWith('/storage/') || parsed.pathname.startsWith('/assets/')) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

function pickUploadResult(json: any, fallbackName: string): EditorUploadResult {
  const data = json?.data ?? json;
  const rawUrl = data?.url ?? data?.file_url ?? data?.path;
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('لم يرجع الخادم رابطًا صالحًا للملف');
  }
  return {
    url: normalizeUploadedUrl(rawUrl),
    name: data?.name ?? data?.file_name ?? fallbackName,
    alt: data?.alt ?? fallbackName,
  };
}

async function upload(endpoint: string, formData: FormData, fallbackName: string): Promise<EditorUploadResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const errorInfo = extractError(json);
    throw new Error(errorInfo.message || json?.message || 'فشل رفع الملف');
  }

  return pickUploadResult(json, fallbackName);
}

export async function uploadEditorImage(file: File): Promise<EditorUploadResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('width', '1920');
  formData.append('quality', '85');
  formData.append('convert_to_webp', 'true');
  return upload('/api/upload/image', formData, file.name);
}

export async function uploadEditorFile(file: File): Promise<EditorUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return upload('/api/upload/file', formData, file.name);
}
