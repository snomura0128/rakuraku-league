"use client";

import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface WizardNavigationProps {
	currentStep: number;
	totalSteps: number;
	onPrevious?: () => void;
	onNext?: () => void;
	onComplete?: () => void;
	isNextDisabled?: boolean;
	isSubmitting?: boolean;
	className?: string;
}

export function WizardNavigation({
	currentStep,
	totalSteps,
	onPrevious,
	onNext,
	onComplete,
	isNextDisabled = false,
	isSubmitting = false,
	className,
}: WizardNavigationProps) {
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === totalSteps - 1;

	return (
		<div
			className={cn(
				"flex justify-between items-center mt-8 pt-6 border-border-light",
				className,
			)}
		>
			<div>
				{!isFirstStep && (
					<Button
						type="button"
						variant="outline"
						onClick={onPrevious}
						disabled={isSubmitting}
					>
						戻る
					</Button>
				)}
			</div>

			<div className="flex gap-3">
				{isLastStep ? (
					<Button
						type="button"
						onClick={onComplete}
						disabled={isNextDisabled || isSubmitting}
						size="lg"
						className="min-w-32"
					>
						{isSubmitting ? "作成中..." : "リーグを作成"}
					</Button>
				) : (
					<Button
						type="button"
						onClick={onNext}
						disabled={isNextDisabled || isSubmitting}
						className="min-w-32"
					>
						次へ
					</Button>
				)}
			</div>
		</div>
	);
}
