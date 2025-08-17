"use client";

import { cn } from "@/lib/utils";

interface WizardStep {
	id: string;
	title: string;
	status: "completed" | "active" | "pending";
}

interface WizardProgressProps {
	steps: WizardStep[];
	className?: string;
}

export function WizardProgress({ steps, className }: WizardProgressProps) {
	return (
		<div
			className={cn("flex items-center justify-between mb-8 px-4", className)}
		>
			{steps.map((step, index) => (
				<div
					key={step.id}
					className="flex flex-col items-center relative flex-1"
				>
					{/* Step Number */}
					<div
						className={cn(
							"w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all duration-300 relative z-10",
							{
								"bg-green-500 text-white": step.status === "completed",
								"bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20":
									step.status === "active",
								"bg-muted text-muted-foreground border-2 border-border":
									step.status === "pending",
							},
						)}
					>
						{step.status === "completed" ? (
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						) : (
							index + 1
						)}
					</div>

					{/* Step Label */}
					<span
						className={cn(
							"text-sm text-center transition-colors duration-300 max-w-24",
							{
								"text-foreground font-medium": step.status === "active",
								"text-muted-foreground":
									step.status === "completed" || step.status === "pending",
							},
						)}
					>
						{step.title}
					</span>

					{/* Connector Line */}
					{index < steps.length - 1 && (
						<div
							className={cn(
								"absolute top-5 left-1/2 w-full h-0.5 -translate-y-0.5 transition-colors duration-300",
								{
									"bg-green-500": step.status === "completed",
									"bg-border":
										step.status === "active" || step.status === "pending",
								},
							)}
							style={{ left: "50%", right: "-50%" }}
						/>
					)}
				</div>
			))}
		</div>
	);
}
