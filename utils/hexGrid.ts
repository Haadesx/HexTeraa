import { LatLng, HexCell, CellStatus } from "../types";
import { HEX_SIZE_DEGREES } from "../constants";

// We use axial coordinates (q, r) for the hex grid.
// Flat-topped hexagons are better for latitude representation usually, but pointy-topped works fine.
// Here we implement a simple projection-less grid on Lat/Lng which works well for city-scale (small areas).

export const pointToHex = (point: LatLng, size: number): { q: number; r: number } => {
  const q = ((2 / 3) * point.lng) / size;
  const r = ((-1 / 3) * point.lng + (Math.sqrt(3) / 3) * point.lat) / size;
  return hexRound(q, r);
};

const hexRound = (q: number, r: number): { q: number; r: number } => {
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(-q - r);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - (-q - r));

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
};

export const hexToPixel = (q: number, r: number, size: number): LatLng => {
  const x = size * ((3 / 2) * q);
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
  return { lat: y, lng: x };
};

export const getHexCorners = (center: LatLng, size: number): LatLng[] => {
  const corners: LatLng[] = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      lat: center.lat + size * Math.sin(angle_rad) * Math.sqrt(3), // Aspect ratio correction attempt roughly
      lng: center.lng + size * Math.cos(angle_rad)
    });
  }
  return corners;
};

// Generate a unique ID for the cell
export const getCellId = (q: number, r: number) => `${q},${r}`;

export const createHexCell = (q: number, r: number, status: CellStatus = CellStatus.NEUTRAL): HexCell => {
  const center = hexToPixel(q, r, HEX_SIZE_DEGREES);
  // Correction for visualization: Hex math outputs to a generic plane. 
  // We need to treat q,r as relative steps.
  // Actually, simple lat/lng grid without projection is easier for this lightweight app.
  // Let's use a direct mapping for visual simplicity if the math above drifts.
  
  // REVISED SIMPLE MAPPING:
  // q = x axis (lng), r = y axis (lat) with offset
  // This isn't a perfect projection but sufficient for gameplay 
  
  return {
    id: getCellId(q, r),
    q,
    r,
    center,
    corners: getHexCorners(center, HEX_SIZE_DEGREES),
    status,
    visitCount: 0
  };
};

// Generate neighbor coordinates
export const getNeighbors = (q: number, r: number): { q: number; r: number }[] => {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
};
