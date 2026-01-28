'use client'

import React from 'react'
import QRCode from 'react-qr-code'

interface QRCodeDisplayProps {
    token: string
}

export function QRCodeDisplay({ token }: QRCodeDisplayProps) {
    return (
        <div className="bg-white p-2">
            <QRCode
                value={token}
                size={180}
                fgColor="#000000"
                bgColor="#ffffff"
            />
        </div>
    )
}
