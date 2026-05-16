"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, MapPin, Users, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NgoOnboarding() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    capacity: "",
    lat: "",
    lng: ""
  })

  // Helper to get user's current location automatically
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          })
        },
        (error) => {
          alert("Unable to retrieve your location. Please enter manually.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

      const res = await fetch(`${API_BASE}/ngos/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          capacity: Number(formData.capacity),
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert("NGO Profile Setup Complete! ✅")
        // Optionally update local storage user object if needed
        router.push("/dashboard")
      } else {
        alert(data.message || "Failed to setup profile")
      }
    } catch (err) {
      console.error("Setup Error:", err)
      alert("Connection error. Is the backend running?")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 text-cyan-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete NGO Profile</CardTitle>
          <CardDescription>
            We need a few more details so the AI can match food donations to your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. City Food Bank"
                  className="pl-9"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Specialty / Category</Label>
              <Input
                id="category"
                placeholder="e.g. Bakery, Prepared Meals, Produce"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Daily Capacity (Meals or Kg)</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-9"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label>Location Coordinates</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={getLocation}
                  className="text-xs h-8"
                >
                  <MapPin className="w-3 h-3 mr-2" />
                  Auto-Detect
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 40.7128"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lng" className="text-xs text-muted-foreground">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="e.g. -74.0060"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
            >
              {isLoading ? "Saving Profile..." : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
