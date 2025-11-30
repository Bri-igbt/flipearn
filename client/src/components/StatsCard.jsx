import React from 'react'

const StatsCard = ({ title, value, color, icon}) => {
    const colorMap = {
        indigo: 'bg-indigo-100',
        yellow: 'bg-yellow-100',
        green: 'bg-green-100'
    }

    return (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
                <div className=''>
                    <p className='text-sm font-medium text-gray-600'>{title}</p>
                    <p className='text-2xl font-bold text-gray-800'>{value}</p>
                </div>

                <div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorMap[color]}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default StatsCard
