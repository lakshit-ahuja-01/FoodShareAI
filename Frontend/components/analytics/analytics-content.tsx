"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts"
import {
  TrendingUp, Package, Building2, Trophy, Zap, Leaf,
  BarChart2, PieChart as PieIcon, Loader2
} from "lucide-react"

type Food = {
  _id: string
  category: string
  quantity: { value: number; unit: string }
  status: string
  createdAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  cooked:   "#10b981",
  produce:  "#06b6d4",
  bakery:   "#f59e0b",
  dairy:    "#8b5cf6",
  canned:   "#f97316",
  other:    "#6b7280",
}

function getColor(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] ?? "#6b7280"
}

// Build monthly bar chart data from food list
function buildMonthlyData(foods: Food[]) {
  const monthly: Record<string, { month: string; donated: number; matched: number }> = {}
  const now = new Date()

  // Pre-fill last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("default", { month: "short" })
    monthly[key] = { month: label, donated: 0, matched: 0 }
  }

  foods.forEach((f) => {
    const d = new Date(f.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!monthly[key]) return
    monthly[key].donated += Number(f.quantity?.value || 0)
    if (f.status === "matched" || f.status === "collected") {
      monthly[key].matched += Number(f.quantity?.value || 0)
    }
  })

  return Object.values(monthly)
}

// Build category donut data
function buildCategoryData(foods: Food[]) {
  const counts: Record<string, number> = {}
  foods.forEach((f) => {
    const cat = f.category?.toLowerCase() || "other"
    counts[cat] = (counts[cat] || 0) + Number(f.quantity?.value || 0)
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: getColor(name) }))
    .sort((a, b) => b.value - a.value)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value} kg</span>
        </p>
      ))}
    </div>
  )
}

export function AnalyticsContent() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [ngoCount, setNgoCount] = useState(0)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    const load = async () => {
      try {
        const [foodRes, ngoRes] = await Promise.all([
          fetch(`${API_BASE}/food`),
          fetch(`${API_BASE}/ngos`),
        ])
        if (foodRes.ok) setFoods(await foodRes.json())
        if (ngoRes.ok) setNgoCount((await ngoRes.json()).length || 0)
      } catch (err) {
        console.error("Analytics fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [API_BASE])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const monthlyData = buildMonthlyData(foods)
  const categoryData = buildCategoryData(foods)

  const totalKg = foods.reduce((a, f) => a + Number(f.quantity?.value || 0), 0)
  const matched = foods.filter((f) => f.status === "matched" || f.status === "collected").length
  const matchRate = foods.length > 0 ? Math.round((matched / foods.length) * 100) : 0
  const mealsSaved = Math.round(totalKg * 3.5) // ~3.5 meals per kg

  const impactStats = [
    { label: "Total Food Donated", value: `${totalKg.toFixed(1)} kg`, icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Meals Saved", value: mealsSaved.toLocaleString(), icon: Leaf, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "AI Match Rate", value: `${matchRate}%`, icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Partner NGOs", value: ngoCount, icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" /> Analytics & Impact
        </h1>
        <p className="text-muted-foreground mt-1">Live insights on food donation activity and AI matching performance.</p>
      </div>

      {/* Impact Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {impactStats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} shrink-0`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Donations Bar Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Monthly Food Activity (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.every((d) => d.donated === 0) ? (
              <div className="flex h-56 items-center justify-center text-muted-foreground text-sm">
                No data yet — start by adding food donations!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit=" kg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="donated" name="Donated" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="matched" name="Matched/Collected" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} kg`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{d.value} kg</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match Success Rate Line */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Monthly Match Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.every((d) => d.donated === 0) ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyData.map((d) => ({
                month: d.month,
                rate: d.donated > 0 ? Math.round((d.matched / d.donated) * 100) : 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Match Rate"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
