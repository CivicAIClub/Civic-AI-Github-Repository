import QRCode from 'qrcode';

export async function generateQRCodeDataURL(
  url: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width || 300,
    margin: options?.margin || 2,
    color: {
      dark: '#1B2A4A',
      light: '#FDFCFA',
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRCodeSVG(
  url: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    width: options?.width || 300,
    margin: options?.margin || 2,
    color: {
      dark: '#1B2A4A',
      light: '#FDFCFA',
    },
    errorCorrectionLevel: 'M',
  });
}
