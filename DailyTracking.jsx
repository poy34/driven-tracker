
import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

function DailyTracking() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 pt-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Daily Tracking</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/meal-plan')}
            className="text-base"
          >
            Go to Meal Plan
          </Button>
        </div>

        {/* Rest of your Daily Tracking content */}
      </div>
    </div>
  )
}

export default DailyTracking
