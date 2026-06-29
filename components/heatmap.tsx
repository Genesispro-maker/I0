import { useCallback, useState } from "react"

interface Props {
    data: Record<string, number>,
    weeks?: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const levels = ["bg-zinc-800", "bg-emerald-900", "bg-emerald-700", "bg-emerald-500", "bg-emerald-400"]

function getLevel(value: number, max: number){
    if(value === 0) return 0
    if(value <= max * 0.25) return 1
    if(value <= max * 0.50) return 2
    if(value <= max * 0.75) return 3

    return 4
}

function format(date: Date){
    return date.toISOString().split("T")[0]
}

function Grid(weeks: number): Date[] {
    const days : Date[] = []
    const today = new Date()
    const total = weeks * 7
    const start = new Date(today)
    start.setDate(today.getDate() - total + 1)

    for(let i = 0; i < total; i++){
        const d = new Date(start)
        d.setDate(start.getDate() + 1)
        days.push(d)
    }

    return days
}

function label(days: Date[], weeks: number){
    const labels = []
    let lastmonth = -1

    for(let w = 0; w < weeks; w++){
        const d = days[w * 7]
        if(!d) continue

        const m = d.getMonth()
        if(m !== lastmonth){
            labels.push({label: MONTHS[m], col: w})
            lastmonth = m
        }
    }

    return labels
}

export function Heatmap({data = {}, weeks = 52}: Props){
    const [tooltip, setTooltip] = useState<{text: string, x: number, y: number} | null>(null)

    const days = Grid(weeks)
    const max = Math.max(...Object.values(data), 1)
    const monthlabel = label(days, weeks)

    const total = Object.values(data).reduce((a, b) => a + b, 0)
    const active = Object.values(data).filter(v => v > 0).length
    const best = Math.max(...Object.values(data), 0)

    const onMouseEnter = useCallback((e: MouseEvent, date: Date, value: number) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setTooltip({
            text: value === 0 ? `No activity on ${date.toDateString()}` : `${value} contribution${value !== 1 ? "s" : ""} on ${date.toDateString()}`,
            x: rect.left + rect.width / 2,
            y: rect.top - 8
        })
    })
}