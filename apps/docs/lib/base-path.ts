export function withDocsBasePath(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (basePath.length === 0) {
    return pathname;
  }

  if (/^https?:\/\//.test(pathname) || pathname.startsWith("data:")) {
    return pathname;
  }

  const normalizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBasePath}${normalizedPath}`;
}
