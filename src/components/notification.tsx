"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface NotificationProps {
  entry: {
    timestamp: number
    speed: number
  }
  status: {
    label: string
    color: string
  }
  onClose: () => void
}

export function Notification({ entry, status, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 border-blue-500 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">Kecepatan Baru Terdeteksi!</p>
            <div className="mt-1 flex items-center">
              <span className="text-lg font-bold">{entry.speed}</span>
              <span className="ml-1 text-sm text-gray-500">km/h</span>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString("id-ID")}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
            >
              <span className="sr-only">Tutup</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
