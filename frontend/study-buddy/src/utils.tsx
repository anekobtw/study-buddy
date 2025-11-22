export const parseClassLevel = (level: number) => {
const levels = [
    { label: 'Beginner', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    { label: 'Intermediate', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    { label: 'Advanced', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
]
return levels[level] || levels[0]
}

