import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula)
 * @returns 거리 (km)
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // 지구 반지름 (km)
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * 거리를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(1)}km`
}

/**
 * 포인트를 천 단위 콤마 형식으로 변환
 */
export function formatPoints(points: number): string {
    return points.toLocaleString('ko-KR')
}
