import React, { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`
        flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
      `}>
        <div className="flex items-center gap-2">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
