"use client"

import { useEffect, useState, useRef } from "react"
import { database } from "./firebaseConfig"
import { ref, onValue } from "firebase/database"
import { Calendar, RotateCcw, Car, Menu, X } from "lucide-react"
import { Notification } from "./components/notification"

interface SpeedEntry {
  timestamp: number
  speed: number
  isNew?: boolean
}

const getDayName = (date: Date) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  return days[date.getDay()]
}

export default function App() {
  const [data, setData] = useState<SpeedEntry[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [showMobileView, setShowMobileView] = useState(false)
  const [notifications, setNotifications] = useState<SpeedEntry[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [latestEntry, setLatestEntry] = useState<SpeedEntry | null>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio("/notification-sound.mp3")
  }, [])

  useEffect(() => {
    const speedRef = ref(database, "vehicle_speed_log")
    let isFirstLoad = true
    let previousData: Record<number, SpeedEntry> = {}

    onValue(speedRef, (snapshot) => {
      const raw = snapshot.val()
      if (raw) {
        const newEntries: SpeedEntry[] = []
        const currentData: Record<number, SpeedEntry> = {}

        // Process all entries
        const list = Object.entries(raw).map(([id, val]: [string, any]) => {
          const entry = {
            timestamp: Number(val.timestamp),
            speed: val.speed,
            isNew: false,
          }
          currentData[entry.timestamp] = entry
          return entry
        })

        // Sort by timestamp (newest first)
        const sortedList = list.sort((a, b) => b.timestamp - a.timestamp)

        // Check for new entries (if not first load)
        if (!isFirstLoad) {
          for (const timestamp in currentData) {
            if (!previousData[Number(timestamp)]) {
              const newEntry = currentData[Number(timestamp)]
              newEntry.isNew = true
              newEntries.push(newEntry)
            }
          }

          // Handle notifications for new entries
          if (newEntries.length > 0 && notificationsEnabled) {
            // Play sound
            if (notificationSound.current) {
              notificationSound.current.play().catch((e) => console.log("Audio play failed:", e))
            }

            // Set latest entry for notification display
            setLatestEntry(newEntries[0])
            setShowNotification(true)

            // Auto-hide notification after 5 seconds
            setTimeout(() => {
              setShowNotification(false)
            }, 5000)

            // Add to notifications list
            setNotifications((prev) => [...newEntries, ...prev].slice(0, 10))
          }
        }

        // Update state
        setData(sortedList)
        previousData = currentData
        isFirstLoad = false
      }
      setLoading(false)
    })
  }, [notificationsEnabled])

  const filteredData = selectedDate
    ? data.filter((entry) => {
        const entryDate = new Date(entry.timestamp).toISOString().split("T")[0]
        return entryDate === selectedDate
      })
    : data

  const getSpeedStatus = (speed: number) => {
    if (speed > 80) return { label: "Cepat", color: "bg-red-100 text-red-800" }
    if (speed > 60) return { label: "Sedang", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Normal", color: "bg-green-100 text-green-800" }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Log Kecepatan Mobil</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Pantau dan analisis data kecepatan kendaraan secara real-time
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Lihat berdasarkan tanggal:
              </label>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs sm:text-sm text-blue-700">
                Menampilkan data untuk tanggal: {new Date(selectedDate).toLocaleDateString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Entri</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{filteredData.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Kecepatan Maksimal</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {filteredData.length > 0 ? Math.max(...filteredData.map((entry) => entry.speed)) : 0}{" "}
                  <span className="text-sm sm:text-base">km/h</span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg sm:text-xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Data Kecepatan</h2>
            <button
              onClick={() => setShowMobileView(!showMobileView)}
              className="sm:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              {showMobileView ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 text-sm sm:text-base">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kecepatan (km/h)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((entry, index) => {
                        const status = getSpeedStatus(entry.speed)
                        return (
                          <tr
                            key={entry.timestamp}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                              entry.isNew ? "animate-highlight" : ""
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">
                                  {getDayName(new Date(entry.timestamp))},{" "}
                                  {new Date(entry.timestamp).toLocaleDateString("id-ID")}
                                </div>
                                <div className="text-gray-500">
                                  {new Date(entry.timestamp).toLocaleTimeString("id-ID")}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">{entry.speed}</span>
                                <span className="ml-1 text-xs text-gray-500">km/h</span>
                                {entry.isNew && (
                                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Baru
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Car className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">Tidak ada data</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {selectedDate
                                ? "Tidak ada data untuk tanggal yang dipilih"
                                : "Belum ada data kecepatan yang tercatat"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden">
                {filteredData.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredData.map((entry) => {
                      const status = getSpeedStatus(entry.speed)
                      return (
                        <div key={entry.timestamp} className={`p-4 ${entry.isNew ? "animate-highlight" : ""}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">{entry.speed}</span>
                              <span className="text-sm text-gray-500">km/h</span>
                              {entry.isNew && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Baru
                                </span>
                              )}
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>
                              {getDayName(new Date(entry.timestamp))},{" "}
                              {new Date(entry.timestamp).toLocaleDateString("id-ID")}
                            </div>
                            <div className="text-gray-500">{new Date(entry.timestamp).toLocaleTimeString("id-ID")}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Car className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                    <p className="text-gray-500 font-medium">Tidak ada data</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedDate
                        ? "Tidak ada data untuk tanggal yang dipilih"
                        : "Belum ada data kecepatan yang tercatat"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>Data diperbarui secara real-time dari Firebase</p>
        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && latestEntry && (
        <Notification
          entry={latestEntry}
          onClose={() => setShowNotification(false)}
          status={getSpeedStatus(latestEntry.speed)}
        />
      )}
    </div>
  )
}
