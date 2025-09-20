"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ThreeBackground from "@/components/ThreeBackground";
import {
	Button,
	Card,
	CardContent,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	WizardNavigation,
	WizardProgress,
	WizardStep,
} from "@/components/ui";
import { apiClient } from "@/lib/api";
import { formatMatchFormat } from "@/lib/utils";
import type { MatchFormat } from "@/types";

// Form validation schema
const createLeagueSchema = z.object({
	name: z
		.string()
		.min(1, "リーグ戦名は必須です")
		.max(100, "リーグ戦名は100文字以内で入力してください"),
	description: z
		.string()
		.max(500, "説明は500文字以内で入力してください")
		.optional(),
	table_count: z
		.number()
		.min(1, "台数は1台以上必要です")
		.max(10, "台数は10台以下で入力してください"),
	match_format: z.enum(["1_game", "3_game", "5_game"]),
	participants: z
		.array(
			z
				.string()
				.min(1, "選手名は必須です")
				.max(50, "選手名は50文字以内で入力してください"),
		)
		.min(3, "最低3名の選手が必要です")
		.max(15, "選手は15名以下で入力してください"),
});

type CreateLeagueForm = z.infer<typeof createLeagueSchema>;

const WIZARD_STEPS = [
	{ id: "basic", title: "基本情報" },
	{ id: "participants", title: "選手" },
	{ id: "settings", title: "試合設定" },
	{ id: "confirm", title: "確認" },
];

export default function CreateLeaguePage() {
	const [currentStep, setCurrentStep] = useState(0);
	const [participants, setParticipants] = useState<string[]>(["", "", ""]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		trigger,
		formState: { errors },
	} = useForm<CreateLeagueForm>({
		resolver: zodResolver(createLeagueSchema),
		defaultValues: {
			name: "",
			description: "",
			table_count: 2,
			match_format: "5_game",
			participants: ["", "", ""],
		},
		mode: "onChange",
	});

	const watchedValues = watch();

	// Get wizard steps with status
	const getWizardSteps = () => {
		return WIZARD_STEPS.map((step, index) => ({
			...step,
			status: (index < currentStep
				? "completed"
				: index === currentStep
					? "active"
					: "pending") as "completed" | "active" | "pending",
		}));
	};

	// Validate current step
	const validateCurrentStep = async () => {
		switch (currentStep) {
			case 0: // Basic Info
				return await trigger(["name", "description"]);
			case 1: // Participants
				return await trigger(["participants"]);
			case 2: // Settings
				return await trigger(["table_count", "match_format"]);
			case 3: // Confirm
				return true;
			default:
				return false;
		}
	};

	// Handle next step
	const handleNext = async () => {
		const isValid = await validateCurrentStep();
		if (isValid && currentStep < WIZARD_STEPS.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	// Handle previous step
	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	// Add participant field
	const addParticipant = () => {
		if (participants.length < 15) {
			const newParticipants = [...participants, ""];
			setParticipants(newParticipants);
			setValue("participants", newParticipants);
		}
	};

	// Remove participant field
	const removeParticipant = (index: number) => {
		if (participants.length > 3) {
			const newParticipants = participants.filter((_, i) => i !== index);
			setParticipants(newParticipants);
			setValue("participants", newParticipants);
		}
	};

	// Update participant value
	const updateParticipant = (index: number, value: string) => {
		const newParticipants = [...participants];
		newParticipants[index] = value;
		setParticipants(newParticipants);
		setValue("participants", newParticipants);
	};

	const onSubmit = async () => {
		const data = getValues();
		setIsSubmitting(true);
		try {
			// Filter out empty participant names
			const validParticipants = data.participants.filter(
				(name) => name.trim() !== "",
			);

			const response = await apiClient.post("/api/leagues", {
				...data,
				participants: validParticipants,
			});

			if (!response.ok) {
				throw new Error("リーグ戦の作成に失敗しました");
			}

			const result = await response.json();

			// Redirect to the admin URL
			if (result.success && result.data?.admin_url) {
				window.location.href = result.data.admin_url;
			}
		} catch (error) {
			console.error("Error creating league:", error);
			alert("リーグ戦の作成に失敗しました。もう一度お試しください。");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-background-secondary">
			<ThreeBackground />
			<div className="relative z-10">
				{/* Header */}
				<header className="bg-white shadow-sm border-b border-border-light">
					<div className="container py-6">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm" asChild>
								<Link href="/">← 戻る</Link>
							</Button>
							<div>
								<h1 className="text-2xl font-bold text-primary">
									リーグ戦を作成
								</h1>
								<p className="text-text-secondary mt-1">
									{WIZARD_STEPS[currentStep].title}の設定を行ってください
								</p>
							</div>
						</div>
					</div>
				</header>

				<div className="container py-8">
					<div className="max-w-3xl mx-auto">
						{/* Wizard Progress */}
						<WizardProgress steps={getWizardSteps()} />

						{/* Wizard Content */}
						<Card className="min-h-96 relative bg-white">
							<CardContent className="p-8">
								<form onSubmit={handleSubmit(onSubmit)}>
									{/* Step 1: Basic Information */}
									<WizardStep
										title="基本情報"
										description="リーグ戦の名前と説明を入力してください"
										isActive={currentStep === 0}
									>
										<div className="space-y-6">
											<div className="space-y-2">
												<Label htmlFor="name">
													リーグ戦名 <span className="text-red-500">*</span>
												</Label>
												<Input
													id="name"
													type="text"
													placeholder="例: 会社卓球部 12月リーグ戦"
													{...register("name")}
												/>
												{errors.name && (
													<p className="text-sm text-red-600">
														{errors.name.message}
													</p>
												)}
											</div>

											<div className="space-y-2">
												<Label htmlFor="description">説明</Label>
												<Input
													id="description"
													type="text"
													placeholder="例: 毎週金曜日の昼休みに実施。優勝者には豪華景品！"
													{...register("description")}
												/>
												{errors.description && (
													<p className="text-sm text-red-600">
														{errors.description.message}
													</p>
												)}
											</div>
										</div>
									</WizardStep>

									{/* Step 3: Settings */}
									<WizardStep
										title="試合設定"
										description="台数と試合形式を選択してください"
										isActive={currentStep === 2}
									>
										<div className="space-y-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="space-y-2">
													<Label htmlFor="table_count">
														台数 <span className="text-red-500">*</span>
													</Label>
													<Select
														onValueChange={(value) =>
															setValue("table_count", parseInt(value))
														}
														defaultValue="2"
													>
														<SelectTrigger id="table_count">
															<SelectValue placeholder="台数を選択" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 10 }, (_, i) => i + 1).map(
																(num) => (
																	<SelectItem key={num} value={num.toString()}>
																		{num}台
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
													{errors.table_count && (
														<p className="text-sm text-red-600">
															{errors.table_count.message}
														</p>
													)}
												</div>

												<div className="space-y-2">
													<Label htmlFor="match_format">
														試合形式 <span className="text-red-500">*</span>
													</Label>
													<Select
														onValueChange={(value) =>
															setValue(
																"match_format",
																value as "1_game" | "3_game" | "5_game",
															)
														}
														defaultValue="5_game"
													>
														<SelectTrigger id="match_format">
															<SelectValue placeholder="試合形式を選択" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="1_game">
																{formatMatchFormat("1_game")}
															</SelectItem>
															<SelectItem value="3_game">
																{formatMatchFormat("3_game")}
															</SelectItem>
															<SelectItem value="5_game">
																{formatMatchFormat("5_game")}
															</SelectItem>
														</SelectContent>
													</Select>
													{errors.match_format && (
														<p className="text-sm text-red-600">
															{errors.match_format.message}
														</p>
													)}
												</div>
											</div>

											<div className="p-4 bg-background-tertiary rounded-lg">
												<div className="flex items-start gap-3">
													<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
														<svg
															className="w-4 h-4 text-primary"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													</div>
													<div>
														<p className="font-medium text-text-primary">
															{formatMatchFormat(
																watchedValues.match_format || "5_game",
															)}
														</p>
														<p className="text-sm text-text-secondary mt-1">
															{watchedValues.match_format === "1_game" &&
																"1ゲーム勝負で勝敗を決定します"}
															{watchedValues.match_format === "3_game" &&
																"3ゲームのうち2ゲーム先取で勝敗を決定します"}
															{watchedValues.match_format === "5_game" &&
																"5ゲームのうち3ゲーム先取で勝敗を決定します"}
														</p>
													</div>
												</div>
											</div>
										</div>
									</WizardStep>

									{/* Step 2: Participants */}
									<WizardStep
										title="選手"
										description="選手の名前を入力してください（最低3名、最大15名）"
										isActive={currentStep === 1}
									>
										<div className="space-y-4">
											<div className="space-y-3">
												{participants.map((participant, index) => (
													<div key={index} className="flex items-start gap-3">
														<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
															{index + 1}
														</div>
														<div className="flex-1">
															<Input
																placeholder={`選手 ${index + 1}`}
																value={participant}
																onChange={(e) =>
																	updateParticipant(index, e.target.value)
																}
															/>
															{errors.participants?.[index] && (
																<p className="text-sm text-red-600 mt-1">
																	{errors.participants[index]?.message}
																</p>
															)}
														</div>
														{participants.length > 3 && (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => removeParticipant(index)}
																className="text-muted-foreground hover:text-red-500 p-2"
															>
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
																		d="M6 18L18 6M6 6l12 12"
																	/>
																</svg>
															</Button>
														)}
													</div>
												))}
											</div>

											{participants.length < 15 && (
												<Button
													type="button"
													variant="outline"
													onClick={addParticipant}
													className="w-full border-2 border-dashed h-auto p-4"
												>
													<span className="flex items-center justify-center gap-2">
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
																d="M12 6v6m0 0v6m0-6h6m-6 0H6"
															/>
														</svg>
														選手を追加
													</span>
												</Button>
											)}

											{errors.participants &&
												typeof errors.participants.message === "string" && (
													<p className="text-sm text-red-600">
														{errors.participants.message}
													</p>
												)}

											<div className="text-sm text-text-tertiary">
												現在 {participants.filter((p) => p.trim()).length}名 /
												最大15名
											</div>
										</div>
									</WizardStep>

									{/* Step 4: Confirmation */}
									<WizardStep
										title="設定内容の確認"
										description="以下の内容でリーグ戦を作成します"
										isActive={currentStep === 3}
									>
										<div className="bg-gray-50 rounded-lg p-6 space-y-6">
											{/* リーグ戦名 */}
											<div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
												<div className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
													リーグ戦名
												</div>
												<div className="text-right font-medium text-gray-900 min-w-0">
													{watchedValues.name || "（未入力）"}
												</div>
											</div>
											{/* 説明 */}
											{watchedValues.description && (
												<div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
													<div className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
														説明
													</div>
													<div className="text-right text-gray-900 min-w-0">
														{watchedValues.description}
													</div>
												</div>
											)}

											{/* 選手一覧 */}
											<div className="py-3 border-b border-gray-200">
												<div className="text-sm font-medium text-gray-600 mb-3">
													選手一覧
												</div>
												<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
													{participants
														.filter((p) => p.trim())
														.map((participant, index) => (
															<div
																key={index}
																className="bg-white rounded px-3 py-2 text-sm text-gray-900"
															>
																{index + 1}. {participant}
															</div>
														))}
												</div>
											</div>

											{/* 台数 */}
											<div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
												<div className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
													台数
												</div>
												<div className="text-right font-medium text-gray-900 min-w-0">
													{watchedValues.table_count}台
												</div>
											</div>

											{/* 試合形式 */}
											<div className="flex justify-between items-start gap-4 py-3">
												<div className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
													試合形式
												</div>
												<div className="text-right font-medium text-gray-900 min-w-0">
													{formatMatchFormat(
														watchedValues.match_format || "5_game",
													)}
												</div>
											</div>
										</div>
									</WizardStep>

									{/* Navigation */}
									<WizardNavigation
										currentStep={currentStep}
										totalSteps={WIZARD_STEPS.length}
										onPrevious={handlePrevious}
										onNext={handleNext}
										onComplete={onSubmit}
										isNextDisabled={false}
										isSubmitting={isSubmitting}
									/>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
