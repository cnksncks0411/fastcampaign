'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { AlertCircle } from 'lucide-react'

interface QRScannerProps {
    onScan: (decodedText: string) => void
    onError?: (error: any) => void
    fps?: number
    qrbox?: number
    aspectRatio?: number
}

export function QRScanner({
    onScan,
    onError,
    fps = 10,
    qrbox = 250,
    aspectRatio = 1.0,
}: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [scanError, setScanError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)

    useEffect(() => {
        // ID 'reader'를 가진 div가 마운트된 후 실행
        const html5QrCode = new Html5Qrcode('reader')
        scannerRef.current = html5QrCode

        const config = {
            fps,
            qrbox,
            aspectRatio,
            disableFlip: false, // 전면/후면 카메라 전환 시 좌우 반전 방지
        }

        html5QrCode
            .start(
                { facingMode: 'environment' }, // 후면 카메라 우선
                config,
                (decodedText) => {
                    // 성공 시
                    html5QrCode.stop().then(() => {
                        setIsScanning(false)
                        onScan(decodedText)
                    }).catch(err => {
                        console.error('Failed to stop scanner after success', err)
                        // 그래도 콜백은 실행
                        onScan(decodedText)
                    })
                },
                (errorMessage) => {
                    // 스캔 중 에러 (계속 발생하므로 콘솔 도배 방지하려면 로그 최소화)
                    // if (onError) onError(errorMessage)
                }
            )
            .catch((err) => {
                console.error('Error starting QR scanner', err)
                setScanError('카메라를 시작할 수 없습니다. 권한을 확인해주세요.')
                if (onError) onError(err)
            })

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        console.log('Scanner stopped')
                        scannerRef.current?.clear()
                    })
                    .catch((err) => console.error('Error stopping scanner cleanup', err))
            } else {
                scannerRef.current?.clear()
            }
        }
    }, [fps, qrbox, aspectRatio]) // onScan을 의존성에 넣으면 재생성 루프 가능성 있음

    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black relative">
            <div id="reader" className="w-full h-full" />

            {/* 스캔 라인 애니메이션 (커스텀 오버레이) */}
            {isScanning && !scanError && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-scan-line" />
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-violet-500 -mt-1 -ml-1" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-violet-500 -mt-1 -mr-1" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-violet-500 -mb-1 -ml-1" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-violet-500 -mb-1 -mr-1" />
                    </div>
                </div>
            )}

            {scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                    <p>{scanError}</p>
                </div>
            )}

            <style jsx global>{`
                @keyframes scan-line {
                    0% { top: 0; opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { top: 100%; opacity: 1; }
                }
                .animate-scan-line {
                    animation: scan-line 2s linear infinite;
                }
                #reader video {
                    object-fit: cover;
                }
            `}</style>
        </div>
    )
}
