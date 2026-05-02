// ============================================================
// src/utils/download.js
// Captures the comic grid element as a PNG using html2canvas.
// ============================================================

/**
 * Downloads the comic grid element as a PNG image.
 * @param {React.RefObject} ref - Ref attached to the ComicGrid wrapper div
 * @param {string} filename     - Downloaded file name (without extension)
 */
export async function downloadComicAsPNG(ref, filename = 'my-comic') {
  if (!ref?.current) {
    console.warn('downloadComicAsPNG: ref.current is null');
    return;
  }

  // Dynamically import html2canvas to keep initial bundle lean
  const html2canvas = (await import('html2canvas')).default;

  try {
    const canvas = await html2canvas(ref.current, {
      useCORS: true,           // Required for DALL-E image URLs (cross-origin)
      allowTaint: false,
      backgroundColor: '#fef9e7',
      scale: 2,                // 2x resolution for crisp output
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Download failed:', err);
    alert('Download failed. This can happen due to browser security restrictions on image URLs. Try right-clicking individual panels to save them.');
  }
}
