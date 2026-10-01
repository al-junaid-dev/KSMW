import { createClient } from '../../../utils/supabase/server'
import { User, MapPin, Clock, BadgeIndianRupee } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeDirectoryPage() {
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('role', 'employee')
    .order('full_name')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
        <p className="text-[#be9a62]/80 text-sm">Manage staff records, schedules, and view individual attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees && employees.length > 0 ? (
          employees.map(emp => {
            const shopName = emp.shops ? (Array.isArray(emp.shops) ? emp.shops[0]?.name : emp.shops?.name) : 'Unassigned'
            
            return (
              <Link 
                key={emp.id} 
                href={`/admin/directory/${emp.id}`}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md hover:border-[#132322] transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#132322]/10 text-[#132322] flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-[#be9a62] group-hover:text-white transition-colors">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-[#be9a62] transition-colors">{emp.full_name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {shopName}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5"/> Schedule
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{emp.shift_start} - {emp.shift_end}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                      <BadgeIndianRupee className="h-3.5 w-3.5"/> Base Pay
                    </p>
                    <p className="text-sm font-semibold text-gray-800">₹{(emp.fixed_basic || 0).toLocaleString('en-IN')}/mo</p>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            No employees found in the directory.
          </div>
        )}
      </div>
    </div>
  )
}