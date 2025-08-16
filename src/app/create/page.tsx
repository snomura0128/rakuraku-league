'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { 
  Button, Input, Card, CardContent, 
  WizardProgress, WizardNavigation, WizardStep 
} from '@/components/ui'
import { formatMatchFormat } from '@/lib/utils'
import type { MatchFormat } from '@/types'

// Form validation schema
const createLeagueSchema = z.object({
  name: z.string().min(1, 'リーグ戦名は必須です').max(100, 'リーグ戦名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  table_count: z.number().min(1, '台数は1台以上必要です').max(10, '台数は10台以下で入力してください'),
  match_format: z.enum(['1_game', '3_game', '5_game']),
  participants: z.array(z.string().min(1, '参加者名は必須です').max(50, '参加者名は50文字以内で入力してください')).min(3, '最低3名の参加者が必要です').max(20, '参加者は20名以下で入力してください'),
})

type CreateLeagueForm = z.infer<typeof createLeagueSchema>

const WIZARD_STEPS = [
  { id: 'basic', title: '基本情報' },
  { id: 'settings', title: '試合設定' },
  { id: 'participants', title: '参加者' },
  { id: 'confirm', title: '確認' },
]

export default function CreateLeaguePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [participants, setParticipants] = useState<string[]>(['', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors } } = useForm<CreateLeagueForm>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      name: '',
      description: '',
      table_count: 2,
      match_format: '3_game',
      participants: ['', '', ''],
    },
    mode: 'onChange'
  })
  
  const watchedValues = watch()
  
  // Get wizard steps with status
  const getWizardSteps = () => {
    return WIZARD_STEPS.map((step, index) => ({
      ...step,
      status: (index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending') as 'completed' | 'active' | 'pending'
    }))
  }
  
  // Validate current step
  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0: // Basic Info
        return await trigger(['name', 'description'])
      case 1: // Settings
        return await trigger(['table_count', 'match_format'])
      case 2: // Participants
        return await trigger(['participants'])
      case 3: // Confirm
        return true
      default:
        return false
    }
  }
  
  // Handle next step
  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  // Add participant field
  const addParticipant = () => {
    if (participants.length < 20) {
      const newParticipants = [...participants, '']
      setParticipants(newParticipants)
      setValue('participants', newParticipants)
    }
  }
  
  // Remove participant field
  const removeParticipant = (index: number) => {
    if (participants.length > 3) {
      const newParticipants = participants.filter((_, i) => i !== index)
      setParticipants(newParticipants)
      setValue('participants', newParticipants)
    }
  }
  
  // Update participant value
  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants]
    newParticipants[index] = value
    setParticipants(newParticipants)
    setValue('participants', newParticipants)
    trigger('participants')
  }
  
  const onSubmit = async () => {
    const data = getValues()
    setIsSubmitting(true)
    try {
      // Filter out empty participant names
      const validParticipants = data.participants.filter(name => name.trim() !== '')
      
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          participants: validParticipants,
        }),
      })
      
      if (!response.ok) {
        throw new Error('リーグ戦の作成に失敗しました')
      }
      
      const result = await response.json()
      
      // Redirect to the admin URL
      if (result.success && result.data?.admin_url) {
        window.location.href = result.data.admin_url
      }
    } catch (error) {
      console.error('Error creating league:', error)
      alert('リーグ戦の作成に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <main className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border-light">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary hover:text-primary-dark">
              ← 戻る
            </Link>
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
          <Card className="min-h-96 relative">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Basic Information */}
                <WizardStep
                  title="基本情報"
                  description="リーグ戦の名前と説明を入力してください"
                  isActive={currentStep === 0}
                >
                  <div className="space-y-6">
                    <Input
                      label="リーグ戦名"
                      placeholder="例: 会社卓球部 12月リーグ戦"
                      {...register('name')}
                      error={errors.name?.message}
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        説明・備考
                      </label>
                      <textarea
                        className="input min-h-24 resize-none"
                        placeholder="例: 毎週金曜日の昼休みに実施。優勝者には豪華景品！"
                        {...register('description')}
                        rows={4}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </WizardStep>
                
                {/* Step 2: Settings */}
                <WizardStep
                  title="試合設定"
                  description="台数と試合形式を選択してください"
                  isActive={currentStep === 1}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          台数 <span className="text-primary">*</span>
                        </label>
                        <select
                          className="input"
                          {...register('table_count', { valueAsNumber: true })}
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}台</option>
                          ))}
                        </select>
                        {errors.table_count && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.table_count.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          試合形式 <span className="text-primary">*</span>
                        </label>
                        <select
                          className="input"
                          {...register('match_format')}
                        >
                          <option value="1_game">{formatMatchFormat('1_game')}</option>
                          <option value="3_game">{formatMatchFormat('3_game')}</option>
                          <option value="5_game">{formatMatchFormat('5_game')}</option>
                        </select>
                        {errors.match_format && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.match_format.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-background-tertiary rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {formatMatchFormat(watchedValues.match_format || '3_game')}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {watchedValues.match_format === '1_game' && '1ゲーム勝負で勝敗を決定します'}
                            {watchedValues.match_format === '3_game' && '3ゲームのうち2ゲーム先取で勝敗を決定します'}
                            {watchedValues.match_format === '5_game' && '5ゲームのうち3ゲーム先取で勝敗を決定します'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </WizardStep>
                
                {/* Step 3: Participants */}
                <WizardStep
                  title="参加者"
                  description="参加者の名前を入力してください（最低3名、最大20名）"
                  isActive={currentStep === 2}
                >
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {participants.map((participant, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-2">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder={`参加者 ${index + 1}`}
                              value={participant}
                              onChange={(e) => updateParticipant(index, e.target.value)}
                              error={errors.participants?.[index]?.message}
                            />
                          </div>
                          {participants.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="text-text-tertiary hover:text-red-500 p-2 transition-colors mt-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {participants.length < 20 && (
                      <button
                        type="button"
                        onClick={addParticipant}
                        className="w-full border-2 border-dashed border-border-medium rounded-lg p-4 text-text-secondary hover:border-primary hover:text-primary hover:bg-background-tertiary transition-all"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          参加者を追加
                        </span>
                      </button>
                    )}
                    
                    {errors.participants && typeof errors.participants.message === 'string' && (
                      <p className="text-sm text-red-600">
                        {errors.participants.message}
                      </p>
                    )}
                    
                    <div className="text-sm text-text-tertiary">
                      現在 {participants.filter(p => p.trim()).length}名 / 最大20名
                    </div>
                  </div>
                </WizardStep>
                
                {/* Step 4: Confirmation */}
                <WizardStep
                  title="設定内容の確認"
                  description="以下の内容でリーグ戦を作成します"
                  isActive={currentStep === 3}
                >
                  <div className="space-y-6">
                    <div className="bg-background-secondary rounded-lg p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-1">リーグ戦名</h4>
                          <p className="text-text-secondary">{watchedValues.name || '（未入力）'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-1">台数</h4>
                          <p className="text-text-secondary">{watchedValues.table_count}台</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-1">試合形式</h4>
                          <p className="text-text-secondary">{formatMatchFormat(watchedValues.match_format || '3_game')}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-1">参加者数</h4>
                          <p className="text-text-secondary">
                            {participants.filter(p => p.trim()).length}名
                          </p>
                        </div>
                      </div>
                      
                      {watchedValues.description && (
                        <div>
                          <h4 className="font-medium text-text-primary mb-1">説明</h4>
                          <p className="text-text-secondary">{watchedValues.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">参加者一覧</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {participants.filter(p => p.trim()).map((participant, index) => (
                            <div key={index} className="bg-white rounded px-3 py-2 text-sm">
                              {index + 1}. {participant}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">試合数</h4>
                        <p className="text-text-secondary">
                          {(() => {
                            const count = participants.filter(p => p.trim()).length
                            return count >= 2 ? (count * (count - 1)) / 2 : 0
                          })()}試合（総当たり戦）
                        </p>
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
    </main>
  )
}