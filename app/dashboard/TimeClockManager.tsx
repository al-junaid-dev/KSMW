'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, CheckCircle2 } from 'lucide-react'
import { clockIn, clockOut } from './actions'

export default function TimeClockManager({ 
  activeLog, 
  profile,
  hasCompletedToday
}: { 
  activeLog: any, 
  profile: any,
  hasCompletedToday: boolean
}) {
  const [loading, setLoading] = useState(false)

  // Helper to convert 'HH:MM' string to today's Date object
  const getTimeObject = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const d = new Date()
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  const handleClockIn = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const shiftStart = getTimeObject(profile.shift_start)
      
      let status = 'On Time'
      let remarks = ''

      // Allow 15 mins grace period
      shiftStart.setMinutes(shiftStart.getMinutes() + 15)
      
      if (now > shiftStart) {
        status = 'Late'
        const diffMins = Math.floor((now.getTime() - shiftStart.getTime()) / 60000)
        remarks = `Clocked in late by ${diffMins} minutes.`
      }

      await clockIn(status, remarks)
      toast.success('Successfully clocked in!')
    } catch (error: any) {
      toast.error('Failed to clock in: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    const now = new Date()
    const shiftEnd = getTimeObject(profile.shift_end)
    
    let status = activeLog.status // Preserve existing status (e.g., 'Late')
    let remarks = 'Clocked out normally.'

    // Check for early clock out
    if (now < shiftEnd) {
      const confirmEarly = window.confirm(
        `WARNING: Your shift ends at ${profile.shift_end}. You are clocking out early. Are you sure you want to proceed?`
      )
      if (!confirmEarly) return // Cancel action

      status = 'Early Leave'
      remarks = 'Clocked out early.'
    } else {
      const confirmOut = window.confirm('Are you sure you want to clock out now?')
      if (!confirmOut) return
    }

    try {
      setLoading(true)
      await clockOut(activeLog.id, activeLog.clock_in_time, status, remarks)
      toast.success('Successfully clocked out!')
    } catch (error: any) {
      toast.error('Failed to clock out: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Schedule Banner */}
      <div className="bg-[#be9a62]/5 border border-[#be9a62] p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-sm text-[#be9a62] font-semibold">Today's Schedule</p>
          <p className="text-lg font-bold text-gray-900">
            {profile.shift_start} - {profile.shift_end}
          </p>
        </div>
      </div>

      {/* Clock Controls */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border-t-4 border-[green]/80">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Current Shift Status</h2>
        
        {activeLog ? (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-full mb-4">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-gray-600">Clocked in at: <span className="font-bold text-gray-900">
                {new Date(activeLog.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            </p>
            {activeLog.status === 'Late' && (
              <p className="text-sm text-red-600 bg-red-50 py-1 px-3 rounded-full inline-block">
                ⚠️ {activeLog.remarks}
              </p>
            )}
            <div>
              <button 
                onClick={handleClockOut}
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Time Out'}
              </button>
            </div>
          </div>
        ) : hasCompletedToday ? (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-gray-800 font-semibold">Shift Completed for Today</p>
            <p className="text-sm text-gray-500">You have already completed your shift and clocked out for today. See you tomorrow!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-gray-100 text-gray-400 rounded-full mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <p className="text-gray-500">You are not currently clocked in.</p>
            <div>
              <button 
                onClick={handleClockIn}
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-[green] hover:bg-[green]/80 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                 {loading ? 'Processing...' : 'Time In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}