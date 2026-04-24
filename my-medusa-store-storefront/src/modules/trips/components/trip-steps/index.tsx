"use client"


interface TripStepsProps {
    currentStep: 1 | 2 | 3 | 4 | 5
    currentLocale?: string | null
}


const STEPS = [
    { id: 1, label: "Outbound flight" },
    { id: 2, label: "Return flight" },
    { id: 3, label: "Hotel" },
    { id: 4, label: "Car" },
    { id: 5, label: "Payment" },
]


export default function TripSteps({ currentStep }: TripStepsProps) {
    return (
        <div className="w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 max-w-4xl py-4">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, i) => {
                        const isDone = step.id < currentStep
                        const isActive = step.id === currentStep
                        const isLast = i === STEPS.length - 1


                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                {/* Step */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isDone
                                            ? "bg-teal-500 text-white"
                                            : isActive
                                                ? "bg-teal-600 text-white ring-4 ring-teal-100"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {isDone ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : step.id}
                                    </div>
                                    <span className={`text-xs mt-1 whitespace-nowrap hidden sm:block ${isActive ? "text-teal-700 font-semibold" : isDone ? "text-teal-500" : "text-gray-400"
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>


                                {/* Connector */}
                                {!isLast && (
                                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${isDone ? "bg-teal-400" : "bg-gray-200"
                                        }`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}



