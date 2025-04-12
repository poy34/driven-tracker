
import React, { useState, useEffect } from "react"
import { format, addDays, startOfWeek, isToday, isSunday } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function App() {
  const urlParams = new URLSearchParams(window.location.search)
  const clientId = urlParams.get("client")

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p className="text-lg text-red-600 font-medium">
          Client ID Missing<br />Please contact your coach to get the correct link.
        </p>
      </div>
    )
  }

  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDates, setWeekDates] = useState([])
  const [savedDays, setSavedDays] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showWeeklySummary, setShowWeeklySummary] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    trainingType: "",
    weight: "",
    steps: "",
    waterIntake: "",
    bathroom: "1",
    meals: ["", "", "", ""],
    mealOptions: [1, 1, 1, 1],
    biofeedback: {
      sleep: 5,
      energy: 5,
      stress: 5,
      hunger: 5,
      digestion: 5,
      bloating: 5
    },
    supplements: "",
    notes: ""
  })

  // Load saved days and form data from localStorage on mount and date change
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)
      try {
        // Load saved days
        const savedDaysFromStorage = localStorage.getItem('savedDays')
        if (savedDaysFromStorage) {
          setSavedDays(JSON.parse(savedDaysFromStorage))
        }

        // Load form data for the current date
        const currentDateStr = format(currentDate, 'yyyy-MM-dd')
        const savedFormData = localStorage.getItem(`dailyLog_${currentDateStr}`)
        if (savedFormData) {
          setFormData(JSON.parse(savedFormData))
        } else {
          // Only reset form if there's no saved data
          setFormData({
            trainingType: "",
            weight: "",
            steps: "",
            waterIntake: "",
            bathroom: "1",
            meals: ["", "", "", ""],
            mealOptions: [1, 1, 1, 1],
            biofeedback: {
              sleep: 5,
              energy: 5,
              stress: 5,
              hunger: 5,
              digestion: 5,
              bloating: 5
            },
            supplements: "",
            notes: ""
          })
        }
      } catch (error) {
        console.error('Error loading daily log data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentDate])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) { // Only save if not in loading state
      const currentDateStr = format(currentDate, 'yyyy-MM-dd')
      localStorage.setItem(`dailyLog_${currentDateStr}`, JSON.stringify(formData))
    }
  }, [formData, currentDate, isLoading])

  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    setWeekDates(dates)
  }, [currentDate])

  const calculateStreak = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd')
    let streak = 1 // Start with 1 for today
    let checkDate = addDays(currentDate, -1) // Start checking from yesterday
    
    // Check previous days
    while (true) {
      const checkDateStr = format(checkDate, 'yyyy-MM-dd')
      if (!savedDays.includes(checkDateStr)) {
        break
      }
      streak++
      checkDate = addDays(checkDate, -1)
    }
    
    return streak
  }

  const calculateWeeklySummary = () => {
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd'))
    
    // Count saved days this week
    const savedDaysThisWeek = weekDates.filter(date => savedDays.includes(date)).length

    // Calculate steps average
    let totalSteps = 0
    let daysWithSteps = 0
    weekDates.forEach(date => {
      const dayData = localStorage.getItem(`dailyLog_${date}`)
      if (dayData) {
        const data = JSON.parse(dayData)
        if (data.steps) {
          totalSteps += Number(data.steps)
          daysWithSteps++
        }
      }
    })
    const stepsAverage = daysWithSteps > 0 ? Math.round(totalSteps / daysWithSteps) : 0

    // Count training sessions and meals
    let trainingSessions = {
      cardio: 0,
      weight: 0,
      hiit: 0,
      bodyweight: 0,
      rest: 0
    }
    let totalMealsLogged = 0

    weekDates.forEach(date => {
      const dayData = localStorage.getItem(`dailyLog_${date}`)
      if (dayData) {
        const data = JSON.parse(dayData)
        // Count training sessions
        if (data.trainingType) {
          trainingSessions[data.trainingType]++
        }
        // Count non-empty meals
        if (data.meals) {
          totalMealsLogged += data.meals.filter(meal => meal && meal.trim() !== '').length
        }
      }
    })

    return {
      savedDaysThisWeek,
      stepsAverage,
      trainingSessions,
      totalMealsLogged
    }
  }

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7))
  }

  const handleBiofeedbackChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      biofeedback: {
        ...prev.biofeedback,
        [type]: value
      }
    }))
  }

  const getBiofeedbackColor = (value) => {
    const colors = {
      1: "bg-red-500 hover:bg-red-600",
      2: "bg-orange-500 hover:bg-orange-600",
      3: "bg-yellow-500 hover:bg-yellow-600",
      4: "bg-green-300 hover:bg-green-400",
      5: "bg-green-500 hover:bg-green-600"
    }
    return colors[value] || "bg-gray-200"
  }

  const handlePasteFromMealPlan = () => {
    const savedMealData = localStorage.getItem('mealPlanData')
    if (savedMealData) {
      const { supplements } = JSON.parse(savedMealData)
      setFormData(prev => ({
        ...prev,
        supplements
      }))
    }
  }

  const handleMealOptionClick = (mealIndex, optionNum) => {
    const savedMealData = localStorage.getItem('mealPlanData')
    if (savedMealData) {
      const { meals } = JSON.parse(savedMealData)
      const selectedOption = meals[mealIndex][optionNum - 1]
      
      if (selectedOption) {
        const newMeals = [...formData.meals]
        newMeals[mealIndex] = selectedOption
        
        const newOptions = [...formData.mealOptions]
        newOptions[mealIndex] = optionNum
        
        setFormData(prev => ({
          ...prev,
          meals: newMeals,
          mealOptions: newOptions
        }))
      }
    }
  }

  const handleSaveLog = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd')
    const newSavedDays = [...savedDays, currentDateStr]
    
    // Save to localStorage
    localStorage.setItem('savedDays', JSON.stringify(newSavedDays))
    setSavedDays(newSavedDays)

    // 🔁 Send data to Make webhook
    fetch("https://hook.eu2.make.com/cmisp812xpoab5zhiy7z52h1d6kh73wn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        date: currentDateStr,
        ...formData
      }),
    })
    .then((res) => {
      if (!res.ok) {
        console.error("Failed to send data to Make")
      }
    })
    .catch((err) => console.error("Error:", err))
  
// Prepare data for Make automation
const payload = {
  clientId,
  date: format(currentDate, "yyyy-MM-dd"),
  trainingType: formData.trainingType,
  weight: formData.weight,
  steps: formData.steps,
  waterIntake: formData.waterIntake,
  bathroom: formData.bathroom,
  supplements: formData.supplements,
  meals: formData.meals,
  biofeedback: formData.biofeedback,
  notes: formData.notes,
}

// Simulate sending to Make (for now we just log it)
console.log("Preparing data for Make automation...")
console.log(payload)

    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)

    // Show weekly summary on Sunday
    if (isSunday(currentDate)) {
      setShowWeeklySummary(true)
    }
  }

  const isDateSaved = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return savedDays.includes(dateStr)
  }

  const SupplementsSection = ({ className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <Textarea
        value={formData.supplements}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, supplements: e.target.value }))
        }
        placeholder="Enter your supplements..."
      />
      <Button 
        variant="outline"
        onClick={handlePasteFromMealPlan}
        className="w-full"
      >
        Paste from meal plan
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your daily log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center h-16">
          <img 
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/a3deed0e-8581-480b-b83c-f36b3d96645c/4ad44a9884b6d66ed85e71f7e4fe67be.png" 
            alt="Driven Logo" 
            className="w-[200px] md:w-[300px] object-contain"
            style={{
              imageRendering: 'crisp-edges',
              WebkitFontSmoothing: 'antialiased',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              willChange: 'transform'
            }}
          />
        </div>

        {/* Calendar Navigation */}
        <div className="text-center mt-2">
          <h2 className="text-xl font-semibold mb-4">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1 overflow-x-auto py-2">
              {weekDates.map((date, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center justify-center w-14 h-14 rounded-full
                    ${isToday(date) ? "border-2 border-red-500" : "border border-gray-200"}
                    ${date.getTime() === currentDate.getTime() ? "bg-black text-white" : 
                      isDateSaved(date) ? "bg-green-500 text-white" : "bg-gray-50"}
                  `}
                  onClick={() => setCurrentDate(date)}
                >
                  <span className="text-xs">{format(date, "EEE")}</span>
                  <span className="text-sm font-semibold">{format(date, "d")}</span>
                </motion.button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          {/* Basic Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Training Type */}
              <div className="space-y-2">
                <label className="text-[17px] font-medium">Training Type</label>
                <Select
                  value={formData.trainingType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, trainingType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">Rest</SelectItem>
                    <SelectItem value="weight">Weight Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="bodyweight">Bodyweight Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <label className="text-[17px] font-medium">Weight (kg)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  placeholder="Enter weight"
                />
              </div>

              {/* Steps Input */}
              <div className="space-y-2">
                <label className="text-[17px] font-medium">Steps</label>
                <Input
                  type="number"
                  value={formData.steps}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, steps: e.target.value }))
                  }
                  placeholder="Enter steps"
                />
              </div>

              {/* Water Intake Input */}
              <div className="space-y-2">
                <label className="text-[17px] font-medium">Water Intake (L)</label>
                <Input
                  type="number"
                  value={formData.waterIntake}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, waterIntake: e.target.value }))
                  }
                  placeholder="Enter water intake"
                />
              </div>

              {/* Bathroom Buttons */}
              <div className="space-y-2">
                <label className="text-[17px] font-medium">Bathroom #2</label>
                <div className="flex gap-2">
                  {["0", "1", "2", "3+"].map((value) => (
                    <Button
                      key={value}
                      variant={formData.bathroom === value ? "default" : "outline"}
                      className="flex-1"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, bathroom: value }))
                      }
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Supplements - Desktop Only */}
              <div className="hidden md:block space-y-2">
                <label className="text-[17px] font-medium">Supplements</label>
                <SupplementsSection />
              </div>
            </CardContent>
          </Card>

          {/* Meals Card */}
          <Card>
            <CardHeader>
              <CardTitle>Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4].map((mealNum, index) => (
                <div key={mealNum} className="space-y-2">
                  <label className="text-[17px] font-medium">Meal {mealNum}</label>
                  <Textarea
                    value={formData.meals[index]}
                    onChange={(e) => {
                      const newMeals = [...formData.meals]
                      newMeals[index] = e.target.value
                      setFormData((prev) => ({ ...prev, meals: newMeals }))
                    }}
                    placeholder={`Enter meal ${mealNum} details`}
                  />
                  <div className="flex gap-[2px]">
                    {[1, 2, 3, 4].map((option) => (
                      <Button
                        key={option}
                        variant={
                          formData.mealOptions[index] === option
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="flex-1 text-[12px] px-0.5 min-w-[23%]"
                        onClick={() => handleMealOptionClick(index, option)}
                      >
                        Option {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Biofeedback Card */}
          <Card>
            <CardHeader>
              <CardTitle>Biofeedback</CardTitle>
              <p className="text-sm text-muted-foreground">1 is bad – 5 is good</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(formData.biofeedback).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[17px] font-medium capitalize">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={value === num ? "default" : "outline"}
                        className={`flex-1 transition-colors duration-200 ${
                          value === num ? `${getBiofeedbackColor(num)} text-white` : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleBiofeedbackChange(key, num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Supplements - Mobile Only */}
        <div className="px-4 md:hidden">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Supplements</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplementsSection />
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div className="px-4">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Save Button and Success Message */}
        <div className="p-4 pb-20 space-y-4">
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-center font-medium shadow-sm"
              >
                {savedDays.length === 1 
                  ? "Nice work — first day completed!"
                  : `Nice work — ${calculateStreak()}-day streak!`}
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            className="w-full bg-black text-white" 
            size="lg"
            onClick={handleSaveLog}
          >
            Save Daily Log
          </Button>
        </div>
      </div>

      {/* Weekly Summary Dialog */}
      <Dialog open={showWeeklySummary} onOpenChange={setShowWeeklySummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4">Weekly Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {(() => {
              const summary = calculateWeeklySummary()
              return (
                <>
                  <div className="space-y-2">
                    <h3 className="font-medium">✅ Days Logged</h3>
                    <p className="text-2xl font-bold">{summary.savedDaysThisWeek} of 7</p>
                  </div>

                  {summary.stepsAverage > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">🚶 Steps Average</h3>
                      <p className="text-2xl font-bold">{summary.stepsAverage.toLocaleString()} steps</p>
                    </div>
                  )}

                  {/* Training Sessions - Only show if count > 0 */}
                  {summary.trainingSessions.weight > 0 && (
                    <div className="space-y-1">
                      <h3 className="font-medium">🏋️ Weight Training</h3>
                      <p className="text-2xl font-bold">{summary.trainingSessions.weight} sessions</p>
                    </div>
                  )}

                  {summary.trainingSessions.cardio > 0 && (
                    <div className="space-y-1">
                      <h3 className="font-medium">🏃 Cardio</h3>
                      <p className="text-2xl font-bold">{summary.trainingSessions.cardio} sessions</p>
                    </div>
                  )}

                  {summary.trainingSessions.bodyweight > 0 && (
                    <div className="space-y-1">
                      <h3 className="font-medium">💪 Bodyweight Training</h3>
                      <p className="text-2xl font-bold">{summary.trainingSessions.bodyweight} sessions</p>
                    </div>
                  )}

                  {summary.trainingSessions.hiit > 0 && (
                    <div className="space-y-1">
                      <h3 className="font-medium">🔥 HIIT</h3>
                      <p className="text-2xl font-bold">{summary.trainingSessions.hiit} sessions</p>
                    </div>
                  )}

                  {summary.trainingSessions.rest > 0 && (
                    <div className="space-y-1">
                      <h3 className="font-medium">🧘 Rest Days</h3>
                      <p className="text-2xl font-bold">{summary.trainingSessions.rest} days</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-medium">🍽 Meals Logged</h3>
                    <p className="text-2xl font-bold">{summary.totalMealsLogged} meals</p>
                  </div>

                  <p className="text-center font-medium text-green-600 mt-6">
                    Keep the consistency going!
                  </p>
                </>
              )
            })()}
          </div>
          <DialogFooter className="mt-6">
            <Button
              className="w-full bg-black text-white"
              onClick={() => setShowWeeklySummary(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
