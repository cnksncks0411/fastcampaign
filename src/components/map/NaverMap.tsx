'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Crosshair } from 'lucide-react'

interface MarkerData {
    id: string
    lat: number
    lng: number
    title: string
    content?: string
    onClick?: () => void
}

interface NaverMapProps {
    center?: { lat: number; lng: number }
    zoom?: number
    markers?: MarkerData[]
    onMapClick?: (lat: number, lng: number) => void
    onCenterChange?: (lat: number, lng: number) => void
    onBoundsChange?: (bounds: { south: number, west: number, north: number, east: number }) => void
    className?: string
    showCurrentLocation?: boolean
}

export function NaverMap({
    center,
    zoom = 15,
    markers = [],
    onMapClick,
    onCenterChange,
    onBoundsChange,
    className = '',
    showCurrentLocation = false,
}: NaverMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<naver.maps.Map | null>(null)
    const markersInstanceRef = useRef<naver.maps.Marker[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 네이버 지도 SDK 로드 확인
    useEffect(() => {
        const checkNaverMaps = () => {
            if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
                setIsLoaded(true)
                return true
            }
            return false
        }

        if (checkNaverMaps()) return

        const interval = setInterval(() => {
            if (checkNaverMaps()) {
                clearInterval(interval)
            }
        }, 100)

        const timeout = setTimeout(() => {
            clearInterval(interval)
            if (typeof window !== 'undefined' && !window.naver?.maps) {
                setError('네이버 지도를 불러올 수 없습니다.')
            }
        }, 5000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [])

    // 지도 초기화 (최초 1회만)
    useEffect(() => {
        if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

        const initializeMap = (initialCenter: { lat: number; lng: number }) => {
            try {
                const mapOptions: naver.maps.MapOptions = {
                    center: new naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
                    zoom,
                    minZoom: 10,
                    maxZoom: 19,
                    zoomControl: false,
                    mapDataControl: false,
                    scaleControl: false,
                    // 하단 UI(네비게이션 바 등)에 가려지지 않도록 패딩 설정
                    padding: { top: 0, right: 0, bottom: 60, left: 0 }
                }

                const map = new naver.maps.Map(mapRef.current as HTMLElement, mapOptions)
                mapInstanceRef.current = map

                if (onMapClick) {
                    naver.maps.Event.addListener(map, 'click', (e: naver.maps.PointerEvent) => {
                        onMapClick(e.coord.y, e.coord.x)
                    })
                }

                if (onCenterChange || onBoundsChange) {
                    naver.maps.Event.addListener(map, 'idle', () => {
                        const center = map.getCenter()
                        // @ts-ignore
                        const lat = typeof center.lat === 'function' ? center.lat() : center.y
                        // @ts-ignore
                        const lng = typeof center.lng === 'function' ? center.lng() : center.x

                        if (onCenterChange) {
                            onCenterChange(lat, lng)
                        }

                        if (onBoundsChange) {
                            const bounds = map.getBounds() as any
                            onBoundsChange({
                                south: bounds.getSouth ? bounds.getSouth() : bounds._min.y,
                                west: bounds.getWest ? bounds.getWest() : bounds._min.x,
                                north: bounds.getNorth ? bounds.getNorth() : bounds._max.y,
                                east: bounds.getEast ? bounds.getEast() : bounds._max.x
                            })
                        }
                    })
                }
            } catch (err) {
                console.error('Map initialization error:', err)
                setTimeout(() => setError('지도 초기화에 실패했습니다.'), 0)
            }
        }

        // 초기화 시에만 실행 (의존성 배열 빈 배열)
        // 만약 center가 바뀔 때마다 초기화하면 지도가 깜빡거림
        if (showCurrentLocation) {
            // 현재 위치를 먼저 가져온 후 지도 초기화
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    initializeMap({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (err) => {
                    console.error('Geolocation initialization error:', err)
                    // 실패 시 기본 위치로 초기화
                    initializeMap(center || { lat: 37.5665, lng: 126.978 })
                },
                {
                    enableHighAccuracy: false,
                    timeout: 3000,
                    maximumAge: 5 * 60 * 1000
                }
            )
        } else {
            // center가 없으면 기본값 사용
            initializeMap(center || { lat: 37.5665, lng: 126.978 })
        }
    }, [isLoaded])

    // center prop 변경 시 지도 이동
    useEffect(() => {
        const map = mapInstanceRef.current
        if (!map || !isLoaded || !center) return // center가 undefined이면 이동하지 않음

        const currentCenter = map.getCenter()
        // @ts-ignore - Naver Map 타입 정의 불일치 대응
        const currentLat = typeof currentCenter.lat === 'function' ? currentCenter.lat() : currentCenter.y
        // @ts-ignore
        const currentLng = typeof currentCenter.lng === 'function' ? currentCenter.lng() : currentCenter.x

        if (Math.abs(currentLat - center.lat) > 0.000001 || Math.abs(currentLng - center.lng) > 0.000001) {
            console.log('Moving map to:', center)
            map.panTo(new naver.maps.LatLng(center.lat, center.lng), { duration: 300 })
        }
    }, [center, isLoaded])

    // 마커 업데이트
    useEffect(() => {
        const map = mapInstanceRef.current
        if (!map || !isLoaded) return

        // 기존 마커 제거
        markersInstanceRef.current.forEach((marker) => marker.setMap(null))
        markersInstanceRef.current = []

        // 새 마커 추가
        markers.forEach((markerData) => {
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(markerData.lat, markerData.lng),
                map,
                title: markerData.title,
                icon: {
                    content: `
            <div style="
              width: 36px;
              height: 36px;
              background: #8b5cf6;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
                    anchor: new naver.maps.Point(18, 18),
                },
            })

            if (markerData.onClick) {
                naver.maps.Event.addListener(marker, 'click', markerData.onClick)
            }

            markersInstanceRef.current.push(marker)
        })
    }, [markers, isLoaded])

    // 현재 위치로 이동
    const moveToCurrentLocation = useCallback(() => {
        if (!navigator.geolocation || !mapInstanceRef.current) return

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                mapInstanceRef.current?.panTo(new naver.maps.LatLng(latitude, longitude))
            },
            (err) => {
                console.error('Geolocation error:', err)
            }
        )
    }, [])



    if (error) {
        return (
            <div className={`flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 m-4 ${className}`}>
                <div className="text-center p-8 max-w-sm">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">지도를 불러올 수 없습니다</h3>
                    <p className="text-xs text-slate-500 leading-relaxed break-keep">
                        네이버 클라우드 콘솔에서 <strong>Web 서비스 URL</strong>에<br />
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">http://localhost:3000</code>을 등록해주세요.
                    </p>
                    {error && <p className="mt-4 text-[10px] text-red-400 font-mono bg-red-50 p-2 rounded">{error}</p>}
                </div>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 ${className}`}>
                <div className="text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-lg backdrop-blur-sm animate-pulse">
                        <MapPin className="h-8 w-8 text-violet-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">지도 로딩중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            <div ref={mapRef} className="w-full h-full" />

            {/* 현재 위치 버튼 */}
            {showCurrentLocation && (
                <button
                    onClick={moveToCurrentLocation}
                    className="absolute bottom-32 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-slate-100/50 transition-all hover:scale-105 active:scale-95 dark:bg-slate-800 z-10"
                    title="현재 위치로 이동"
                >
                    <Crosshair className="h-5 w-5 text-slate-600" />
                </button>
            )}
        </div>
    )
}

// 현재 위치 훅
export function useCurrentLocation() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('이 브라우저에서는 위치 서비스를 지원하지 않습니다.')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                setLoading(false)
                setError(null)
            },
            (err) => {
                console.error(err)
                setError('위치 정보를 가져올 수 없습니다.')
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        )
    }, [])

    return { location, error, loading, getCurrentLocation }
}
