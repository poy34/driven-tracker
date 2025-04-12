
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ToastProvider } from "@/components/ui/toast"

function MealPlan() {
  const navigate = useNavigate()
  const [mealData, setMealData] = useState(() => {
    const savedData = localStorage.getItem('mealPlanData')
    return savedData ? JSON.parse(savedData) : {
      meals: Array(4).fill().map(() => Array(4).fill('')),
      supplements: ''
    }
  })

  useEffect(() => {
    localStorage.setItem('mealPlanData', JSON.stringify(mealData))
  }, [mealData])

  const handleMealOptionChange = (mealIndex, optionIndex, value) => {
    const newMeals = [...mealData.meals]
    newMeals[mealIndex][optionIndex] = value
    setMealData(prev => ({
      ...prev,
      meals: newMeals
    }))
  }

  const handleSupplementsChange = (value) => {
    setMealData(prev => ({
      ...prev,
      supplements: value
    }))
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 pt-4 mb-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="text-base"
            >
              Go to Daily Tracking
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Your Meal Plan</h1>
          </div>

          {/* Meals Section */}
          <div className="px-4 space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-6 mt-2">
            {[0, 1, 2, 3].map((mealIndex) => (
              <Card key={mealIndex}>
                <CardHeader>
                  <CardTitle>Meal {mealIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="space-y-2">
                      <label className="text-[17px] font-medium">
                        Option {optionIndex + 1}
                      </label>
                      <Textarea 
                        placeholder="Enter meal details..."
                        className="min-h-[80px] text-base"
                        value={mealData.meals[mealIndex][optionIndex]}
                        onChange={(e) => handleMealOptionChange(mealIndex, optionIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Supplements Section */}
          <div className="px-4 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter supplements..."
                  className="min-h-[120px] text-base"
                  value={mealData.supplements}
                  onChange={(e) => handleSupplementsChange(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Spacing */}
          <div className="h-8" />
        </div>
      </div>
    </ToastProvider>
  )
}

export default MealPlan
