import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border-light">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-primary">
            らくらくリーグ戦
          </h1>
          <p className="text-text-secondary mt-2">
            卓球のリーグ戦をWEB上で簡単に作成・管理
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-text-primary mb-6">
            手軽にリーグ戦を始めよう
          </h2>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            「調整さんのリーグ戦バージョン」をコンセプトに、<br />
            面倒な登録なしで即座にリーグ戦を作成・共有できます
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/create" 
              className="button button-primary text-lg px-8 py-4"
            >
              リーグ戦を作成する
            </Link>
            <button className="button button-secondary text-lg px-8 py-4">
              既存のリーグ戦にアクセス
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-text-primary">
          こんな方におすすめ
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🏢</span>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-text-primary">
              会社の卓球部
            </h4>
            <p className="text-text-secondary">
              昼休みや業後の試合結果をその場で入力。部員みんなでリアルタイムに順位をチェック
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👥</span>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-text-primary">
              地域サークル
            </h4>
            <p className="text-text-secondary">
              試合後にみんなでスマホを見ながら順位確認。次の対戦相手も一目瞭然
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-text-primary">
              友人グループ
            </h4>
            <p className="text-text-secondary">
              月1回の集まりで継続的にリーグ戦。前回の結果を見ながら今回の対戦も楽しく
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-text-primary">
            3ステップで簡単スタート
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3 text-text-primary">作る</h4>
              <p className="text-text-secondary">
                リーグ戦名と参加者を入力するだけ。台数や試合形式も設定可能
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3 text-text-primary">共有</h4>
              <p className="text-text-secondary">
                URLをLINEやメールで共有。QRコードでも簡単アクセス
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3 text-text-primary">入力</h4>
              <p className="text-text-secondary">
                試合結果をその場で入力。リアルタイムで順位表に反映
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-8">
        <div className="container text-center">
          <p className="text-text-tertiary">
            © 2024 らくらくリーグ戦. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}