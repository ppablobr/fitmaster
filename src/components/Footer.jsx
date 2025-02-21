import React from 'react'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-2">
          <span>Made with</span>
          <Heart className="h-5 w-5 text-red-500" />
          <span>by Gupi</span>
        </div>
      </div>
    </footer>
  )
}
