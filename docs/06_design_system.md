# デザインシステム仕様書

## 概要
楽々リーグは、カジュアルで楽しい雰囲気を持つリーグ管理システムです。Todoistのようなクリーンで見やすいデザインパターンを参考に、スポーツリーグに特化したカジュアルなデザインシステムを構築します。

## デザイン理念
- **カジュアルさ**: 堅苦しくない、親しみやすいインターフェース
- **楽しさ**: ユーザーが楽しく使える要素を随所に配置
- **視認性**: 情報が見やすく整理されたレイアウト
- **一貫性**: 統一されたデザインパターンで迷いを軽減

## カラーパレット

### プライマリカラー
```css
:root {
  /* メインカラー - スポーツの活力と熱意を表現 */
  --primary-red: #DE483A;
  --primary-red-light: #FF6B5C;
  --primary-red-dark: #B73E32;
  
  /* セカンダリカラー - 信頼感と安定感 */
  --secondary-blue: #4A90E2;
  --secondary-blue-light: #6BA3E8;
  --secondary-blue-dark: #3A7BC8;
  
  /* アクセントカラー - 成功や達成感 */
  --accent-green: #7ED321;
  --accent-orange: #F5A623;
  --accent-yellow: #F8E71C;
}
```

### ニュートラルカラー
```css
:root {
  /* 背景色 */
  --background-primary: #FEFEFE;
  --background-secondary: #F8F9FA;
  --background-tertiary: #F1F3F4;
  
  /* テキストカラー */
  --text-primary: #202124;
  --text-secondary: #5F6368;
  --text-tertiary: #80868B;
  
  /* ボーダー */
  --border-light: #E8EAED;
  --border-medium: #DADCE0;
  --border-dark: #BDC1C6;
}
```

## タイポグラフィ

### フォントファミリー
```css
:root {
  --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-display: 'Inter', 'Hiragino Sans', 'Yu Gothic', sans-serif;
}
```

### フォントサイズスケール
```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
}
```

## スペーシングシステム

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

## ボーダーラディウス

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-base: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* 完全な円形 */
}
```

## コンポーネント

### ボタン

#### プライマリボタン
```css
.button-primary {
  background: var(--primary-red);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button-primary:hover {
  background: var(--primary-red-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(222, 72, 58, 0.3);
}
```

#### セカンダリボタン
```css
.button-secondary {
  background: transparent;
  color: var(--primary-red);
  border: 2px solid var(--primary-red);
  border-radius: var(--radius-lg);
  padding: calc(var(--space-3) - 2px) calc(var(--space-6) - 2px);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button-secondary:hover {
  background: var(--primary-red);
  color: white;
  transform: translateY(-1px);
}
```

### カード

```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: var(--space-6);
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-interactive:hover {
  border-color: var(--primary-red);
}
```

### ウィザード形式コンポーネント

#### ステップインジケーター
```css
.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  padding: 0 var(--space-4);
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.wizard-step-number {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
  transition: all 0.3s ease;
}

.wizard-step.completed .wizard-step-number {
  background: var(--accent-green);
  color: white;
}

.wizard-step.active .wizard-step-number {
  background: var(--primary-red);
  color: white;
  box-shadow: 0 0 0 4px rgba(222, 72, 58, 0.2);
}

.wizard-step.pending .wizard-step-number {
  background: var(--background-tertiary);
  color: var(--text-tertiary);
  border: 2px solid var(--border-medium);
}

.wizard-step-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  transition: color 0.3s ease;
}

.wizard-step.active .wizard-step-label {
  color: var(--text-primary);
  font-weight: 600;
}

.wizard-step-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: var(--border-light);
  z-index: -1;
}

.wizard-step.completed + .wizard-step .wizard-step-connector {
  background: var(--accent-green);
}
```

#### ウィザードナビゲーション
```css
.wizard-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-light);
}

.wizard-nav-group {
  display: flex;
  gap: var(--space-3);
}

.wizard-button {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.wizard-button.back {
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid var(--border-medium);
}

.wizard-button.back:hover {
  background: var(--background-secondary);
  color: var(--text-primary);
}

.wizard-button.next {
  background: var(--primary-red);
  color: white;
}

.wizard-button.next:hover {
  background: var(--primary-red-dark);
  transform: translateY(-1px);
}

.wizard-button.complete {
  background: var(--accent-green);
  color: white;
}

.wizard-button.complete:hover {
  background: #6BC218;
  transform: translateY(-1px);
}

.wizard-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### ウィザードコンテンツエリア
```css
.wizard-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  min-height: 400px;
  transition: all 0.3s ease;
}

.wizard-step-content {
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s ease;
}

.wizard-step-content.active {
  opacity: 1;
  transform: translateX(0);
}

.wizard-step-title {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  font-weight: 600;
}

.wizard-step-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}
```

### フォーム要素

#### マルチステップフォーム
```css
.form-step {
  display: none;
}

.form-step.active {
  display: block;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-group {
  margin-bottom: var(--space-6);
}

.form-group-title {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.form-group-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  line-height: 1.5;
}

.form-validation-error {
  color: var(--primary-red);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.form-validation-success {
  color: var(--accent-green);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.participants-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.participant-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.participant-item:hover {
  background: var(--background-tertiary);
}

.participant-number {
  background: var(--primary-red);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
  flex-shrink: 0;
}

.participant-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-2);
  font-size: var(--font-size-base);
}

.participant-remove {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.participant-remove:hover {
  background: var(--primary-red);
  color: white;
}

.add-participant-button {
  background: var(--background-tertiary);
  color: var(--text-secondary);
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.add-participant-button:hover {
  background: var(--primary-red);
  color: white;
  border-color: var(--primary-red);
}
```

#### 入力フィールド
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: all 0.2s ease;
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(222, 72, 58, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

## 勝利時のアニメーション（Lottie）

### アニメーション要件
試合に勝利した際に、ユーザーの達成感と楽しさを演出するLottieアニメーションを実装します。

#### 1. 花火アニメーション
```typescript
// components/animations/VictoryFireworks.tsx
import Lottie from 'lottie-react';
import fireworksAnimation from '@/assets/animations/fireworks.json';

export const VictoryFireworks = ({ trigger }: { trigger: boolean }) => {
  if (!trigger) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Lottie
        animationData={fireworksAnimation}
        loop={false}
        autoplay={true}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};
```

#### 2. トロフィーアニメーション
```typescript
// components/animations/VictoryTrophy.tsx
export const VictoryTrophy = ({ show }: { show: boolean }) => {
  return (
    <div className={`victory-trophy ${show ? 'show' : ''}`}>
      <Lottie
        animationData={trophyAnimation}
        loop={false}
        autoplay={show}
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
};
```

#### 3. 紙吹雪アニメーション
```css
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.confetti-burst {
  position: absolute;
  animation: confetti-fall 3s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
```

### アニメーショントリガー
```typescript
// hooks/useVictoryAnimation.ts
export const useVictoryAnimation = () => {
  const [showVictory, setShowVictory] = useState(false);
  
  const triggerVictoryAnimation = useCallback(() => {
    setShowVictory(true);
    
    // 複数のアニメーションを順次実行
    setTimeout(() => {
      // トロフィーアニメーション
    }, 500);
    
    setTimeout(() => {
      // 花火アニメーション
    }, 1000);
    
    setTimeout(() => {
      // 紙吹雪アニメーション
    }, 1500);
    
    // 5秒後にアニメーション終了
    setTimeout(() => {
      setShowVictory(false);
    }, 5000);
  }, []);
  
  return { showVictory, triggerVictoryAnimation };
};
```

## レスポンシブデザイン

### ブレークポイント
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### レスポンシブグリッド
```css
.responsive-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
```

## インタラクション

### ホバーエフェクト
```css
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### フォーカスエフェクト
```css
.focusable {
  transition: all 0.2s ease;
}

.focusable:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(222, 72, 58, 0.2);
}
```

## アクセシビリティ

### カラーコントラスト
- テキストと背景のコントラスト比は最低4.5:1を維持
- 重要な情報は色だけでなく形やテキストでも判別可能

### キーボードナビゲーション
- すべてのインタラクティブ要素はキーボードでアクセス可能
- フォーカス状態を明確に表示

### スクリーンリーダー対応
```html
<!-- 適切なaria属性の使用 -->
<button aria-label="チーム詳細を表示" aria-expanded="false">
  <span>チーム情報</span>
</button>

<!-- セマンティックHTML -->
<nav aria-label="メインナビゲーション">
  <ul>
    <li><a href="/teams">チーム</a></li>
    <li><a href="/matches">試合</a></li>
  </ul>
</nav>
```

## 実装ガイドライン

### CSS設計
- BEMまたはCSS Modulesを使用してスタイルを管理
- CSS-in-JSライブラリ（styled-componentsやemotionなど）の活用も検討

### パフォーマンス
- 画像の最適化（WebP形式の使用）
- アニメーションのパフォーマンス最適化
- CSSの効率的な読み込み

### ブラウザサポート
- モダンブラウザ（Chrome、Firefox、Safari、Edge）の最新2バージョン
- モバイルブラウザの対応

## まとめ
このデザインシステムは、楽々リーグの「カジュアルで楽しい」体験を実現するための基盤です。特に勝利時のLottieアニメーションにより、ユーザーの達成感と喜びを視覚的に演出し、継続的な利用を促進します。