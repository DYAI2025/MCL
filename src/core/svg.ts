import { Face } from './iso';

export function facesToSVG(
  faces: Face[],
  width: number,
  height: number,
  background: string
): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  if (background && background !== 'transparent') {
    svg += `<rect width="${width}" height="${height}" fill="${background}"/>`;
  }
  for (const face of faces) {
    const pointsStr = face.points.map(([px, py]) => `${px},${py}`).join(' ');
    svg += `<polygon points="${pointsStr}" fill="${face.color}" shape-rendering="crispEdges"/>`;
  }
  svg += `</svg>`;
  return svg;
}
