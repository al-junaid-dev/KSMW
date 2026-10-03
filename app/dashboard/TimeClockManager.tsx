'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { 
  Clock, 
  CheckCircle2, 
  Coffee, 
  CalendarCheck, 
  Calendar,
  AlertCircle 
} from 'lucide-react'
import { clockIn, clockOut } from './actions'

interface TimeClockManagerProps {
  activeLog: any
  profile: any
  hasCompletedToday: boolean
  todayStatus?: 'Scheduled' | 'Weekoff' | 'Leave' | 'Completed' | 'Active'
}

export default function TimeClockManager({ 
  activeLog, 
  profile,
  hasCompletedToday,
  todayStatus = 'Scheduled'
}: TimeClockManagerProps) {
  const [loading, setLoading] = useState(false)

  // Helper to convert 'HH:MM' string to today's Date object
  const getTimeObject = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const d = new Date()
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  const handleClockIn = async () => {
    // Guard against clocking in on weekoff or approved leave
    if (todayStatus === 'Weekoff') {
      toast.error('Today is your scheduled weekly off. Clock-in is not required.')
      return
    }
    if (todayStatus === 'Leave') {
      toast.error('Today is marked as an approved leave.')
      return
    }

    try {
      setLoading(true)
      const now = new Date()
      const shiftStart = getTimeObject(profile.shift_start || '09:30')
      
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
    const shiftEnd = getTimeObject(profile.shift_end || '18:30')
    
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

      {/* Schedule & Daily Classification Banner */}
      {todayStatus === 'Weekoff' ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between text-blue-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Daily Status</p>
              <p className="text-base font-bold text-blue-950">Weekly Off (No Shift Scheduled)</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 hidden sm:inline-block">
            Rest Day
          </span>
        </div>
      ) : todayStatus === 'Leave' ? (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between text-purple-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Daily Status</p>
              <p className="text-base font-bold text-purple-950">Approved Leave</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200 hidden sm:inline-block">
            On Leave
          </span>
        </div>
      ) : (
        <div className="bg-[#be9a62]/5 border border-[#be9a62]/30 p-4 rounded-xl flex justify-between items-center shadow-2xs">
          <div>
            <p className="text-xs text-[#be9a62] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Today's Scheduled Shift
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {profile.shift_start ? profile.shift_start.slice(0, 5) : '09:30'} - {profile.shift_end ? profile.shift_end.slice(0, 5) : '18:30'}
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Working Day
          </span>
        </div>
      )}

      {/* Main Shift Status & Action Card */}
      <div className={`bg-white rounded-xl shadow-xs p-8 text-center border-t-4 ${
        activeLog 
          ? 'border-blue-600' 
          : todayStatus === 'Weekoff'
          ? 'border-blue-500'
          : todayStatus === 'Leave'
          ? 'border-purple-500'
          : hasCompletedToday
          ? 'border-emerald-600'
          : 'border-[#be9a62]'
      }`}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
          Attendance Terminal
        </h2>
        
        {/* CASE 1: Active Clocked-in Shift */}
        {activeLog ? (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-full mb-2">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>

            <div>
              <p className="text-gray-600 text-sm">
                Shift currently active. Clocked in at:
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1 font-mono">
                {new Date(activeLog.clock_in_time).toLocaleTimeString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {activeLog.status === 'Late' && (
              <p className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 py-1.5 px-3 rounded-full inline-flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {activeLog.remarks || 'Clocked in late'}
              </p>
            )}

            <div>
              <button 
                onClick={handleClockOut}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                {loading ? 'Processing...' : 'Time Out (Clock Out)'}
              </button>
            </div>
          </div>
        ) : todayStatus === 'Weekoff' ? (
          /* CASE 2: Weekoff (No Shift) */
          <div className="space-y-4 max-w-md mx-auto py-2">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-full">
              <Coffee className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">Weekly Off Scheduled</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                You do not have a shift assigned for today. Attendance clock-in is disabled so your day off is maintained. Enjoy your rest!
              </p>
            </div>
          </div>
        ) : todayStatus === 'Leave' ? (
          /* CASE 3: Approved Leave */
          <div className="space-y-4 max-w-md mx-auto py-2">
            <div className="inline-flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-full">
              <CalendarCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">Official Leave Day</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your attendance status is registered as Approved Leave for today. Have a restful time away!
              </p>
            </div>
          </div>
        ) : hasCompletedToday ? (
          /* CASE 4: Shift Completed for Today */
          <div className="space-y-4 max-w-md mx-auto py-2">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">Shift Completed for Today</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                You have already fulfilled and clocked out from your scheduled shift for today. See you next shift!
              </p>
            </div>
          </div>
        ) : (
          /* CASE 5: Scheduled Day - Ready to Clock In */
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-gray-100 text-gray-400 rounded-full">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 font-bold text-lg">Ready to start your shift?</p>
              <p className="text-xs text-gray-500">
                Ensure you are physically at your assigned outlet before recording your arrival.
              </p>
            </div>
            <div>
              <button 
                onClick={handleClockIn}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                {loading ? 'Processing...' : 'Time In (Clock In)'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}