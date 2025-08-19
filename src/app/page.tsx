"use client";

import Link from "next/link";

import ThreeBackground from "../components/ThreeBackground";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50 relative overflow-hidden">
			{/* Three.js Background */}
			<ThreeBackground />
			
			{/* Main Content */}
			<div className="relative z-10">
				{/* Header */}
				<header className="container mx-auto px-4 pt-8 md:pt-12">
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
							<span className="gradient-text">らくらく</span><span className="text-gray-800">リーグ戦</span>
						</h1>
						<p className="text-lg md:text-xl text-gray-600 mb-8">卓球リーグ戦を手軽に管理・共有</p>
					</div>
				</header>
				
				{/* Main Section */}
				<main className="container mx-auto px-4">
					{/* Device Mockup Section (First View) */}
					<section className="mb-4 sm:mb-8 md:mb-12">
						<div className="max-w-7xl mx-auto text-center">
							{/* Device Mockups Container */}
							<div className="relative">
								{/* Mobile Layout - Stacked mockups (below 550px) */}
								<div className="sm:hidden max-w-md mx-auto h-60 sm:h-80">
									{/* PC Mockup (Background) */}
									<div className="absolute left-4 top-0 transform rotate-2 z-10">
										<div className="neumorphism shadow-2xl">
											<img 
												src="/images/pc_mockup.png" 
												alt="PCでのリーグ戦管理画面"
												className="w-64 h-auto rounded-lg object-cover"
											/>
										</div>
									</div>
									
									{/* Smartphone Mockup (Foreground) */}
									<div className="absolute right-4 top-8 transform -rotate-3 z-20">
										<div className="neumorphism shadow-2xl">
											<img 
												src="/images/sumaho_mockup.png" 
												alt="スマホでのリーグ戦管理画面"
												className="w-28 h-auto rounded-xl object-cover"
											/>
										</div>
									</div>
								</div>
								
								{/* Desktop Layout - Side by side mockups (550px and above) */}
								<div className="hidden sm:flex justify-center items-center gap-8 lg:gap-16">
									{/* PC Mockup */}
									<div className="flex-1 max-w-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
										<div className="neumorphism shadow-2xl">
											<img 
												src="/images/pc_mockup.png" 
												alt="PCでのリーグ戦管理画面"
												className="w-full max-w-lg md:max-w-xl lg:max-w-2xl h-auto rounded-lg object-cover"
											/>
										</div>
									</div>
									
									{/* Smartphone Mockup */}
									<div className="flex-shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
										<div className="neumorphism shadow-2xl">
											<img 
												src="/images/sumaho_mockup.png" 
												alt="スマホでのリーグ戦管理画面"
												className="w-48 lg:w-56 xl:w-64 h-auto rounded-xl object-cover"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* CTA After Mockup */}
					<section className="text-center mb-12 md:mb-20">
						<div className="btn-primary-container">
							<Link href="/create" className="btn-primary inline-flex items-center gap-3">
								<i className="fas fa-plus"></i>
								リーグを作成
							</Link>
						</div>
						<p className="text-gray-500 mt-6 text-sm">
							<i className="fas fa-check-circle text-orange-500 mr-1"></i>
							完全無料・登録不要
						</p>
					</section>
					
					{/* Hero Section */}
					{/* <section className="text-center mb-12 md:mb-20">
						<div className="max-w-4xl mx-auto">
							<div className="neumorphism p-4 md:p-8 mb-8 md:mb-12 float-animation">
								<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
									3ステップで始める簡単リーグ戦
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-8">
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<i className="fas fa-plus text-white text-2xl"></i>
										</div>
										<h3 className="font-semibold text-lg mb-2">1. 作る</h3>
										<p className="text-gray-600">リーグを簡単作成</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<i className="fas fa-share-alt text-white text-2xl"></i>
										</div>
										<h3 className="font-semibold text-lg mb-2">2. 共有</h3>
										<p className="text-gray-600">URLで参加者に共有</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<i className="fas fa-edit text-white text-2xl"></i>
										</div>
										<h3 className="font-semibold text-lg mb-2">3. 入力</h3>
										<p className="text-gray-600">試合結果を入力・閲覧</p>
									</div>
								</div>
							</div>
						</div>
					</section> */}
					
					{/* Demo Video Section */}
					<section className="mb-12 md:mb-20">
						<div className="max-w-4xl mx-auto text-center">
							<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
								<span className="gradient-text">使い方</span>デモ動画
							</h2>
							<div className="neumorphism p-4 md:p-8 mb-8 md:mb-12">
								<div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
									{/* Placeholder for demo video */}
									<div className="text-center">
										<i className="fas fa-play-circle text-6xl text-orange-500 mb-4"></i>
										<h3 className="text-xl font-semibold text-gray-700 mb-2">デモ動画</h3>
										<p className="text-gray-500">3分でわかる簡単操作</p>
									</div>
									
									{/* Video placeholder overlay */}
									<div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50 opacity-30"></div>
								</div>
							</div>
						</div>
					</section>
					
					{/* Features Section */}
					<section className="mb-12 md:mb-20">
						<div className="max-w-6xl mx-auto">
							<h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
								<span className="gradient-text">らくらく</span>な特徴
							</h2>
							
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
								<div className="feature-card neumorphism p-4 md:p-6 text-center">
									<i className="fas fa-user-slash text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">アカウント不要</h3>
									<p className="text-gray-600">面倒な登録なしで即座に利用開始</p>
								</div>
								
								<div className="feature-card neumorphism p-4 md:p-6 text-center">
									<i className="fas fa-share-alt text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">URL共有</h3>
									<p className="text-gray-600">URLを送るだけで参加者に簡単共有</p>
								</div>
								
								<div className="feature-card neumorphism p-4 md:p-6 text-center">
									<i className="fas fa-sync-alt text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">リアルタイム更新</h3>
									<p className="text-gray-600">結果入力と同時に全員の画面に反映</p>
								</div>
								
								<div className="feature-card neumorphism p-4 md:p-6 text-center">
									<i className="fas fa-chart-line text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">自動集計</h3>
									<p className="text-gray-600">勝敗表、順位表を自動作成</p>
								</div>
							</div>
						</div>
					</section>
					
					{/* Use Cases Section */}
					<section className="mb-12 md:mb-20">
						<div className="max-w-6xl mx-auto">
							<h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
								<span className="gradient-text">活用</span>シーン
							</h2>
							
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
								<div className="feature-card neumorphism p-6 md:p-8 text-center">
									<i className="fas fa-users text-4xl text-orange-500 mb-6"></i>
									<h3 className="font-semibold text-xl mb-4">地域サークル</h3>
									<p className="text-gray-600 mb-4">地域の卓球サークルでの定期大会や月例リーグ戦に最適</p>
									<div className="text-sm text-gray-500">
										<i className="fas fa-check text-orange-500 mr-2"></i>
										参加者15名以下の規模
									</div>
								</div>
								
								<div className="feature-card neumorphism p-6 md:p-8 text-center">
									<i className="fas fa-building text-4xl text-orange-500 mb-6"></i>
									<h3 className="font-semibold text-xl mb-4">会社・企業</h3>
									<p className="text-gray-600 mb-4">社内の卓球部やレクリエーション活動での利用</p>
									<div className="text-sm text-gray-500">
										<i className="fas fa-check text-orange-500 mr-2"></i>
										部署対抗戦にも対応
									</div>
								</div>
								
								<div className="feature-card neumorphism p-6 md:p-8 text-center">
									<i className="fas fa-heart text-4xl text-orange-500 mb-6"></i>
									<h3 className="font-semibold text-xl mb-4">友人グループ</h3>
									<p className="text-gray-600 mb-4">気軽な仲間同士でのカジュアルなリーグ戦</p>
									<div className="text-sm text-gray-500">
										<i className="fas fa-check text-orange-500 mr-2"></i>
										少人数でも楽しめる
									</div>
								</div>
							</div>
						</div>
					</section>
				</main>
				
				{/* Final CTA Section */}
				<section className="bg-gray-100 py-24">
					<div className="container mx-auto px-4">
						<div className="text-center">
							<h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-800">
								今すぐリーグ戦を始めましょう
							</h2>
							<p className="text-gray-600 text-lg mb-12">
								無料で利用開始。登録不要でご利用いただけます。
							</p>
							<div className="btn-primary-container">
								<Link href="/create" className="btn-primary inline-flex items-center gap-3">
									<i className="fas fa-plus"></i>
									リーグを作成
								</Link>
							</div>
						</div>
					</div>
				</section>
				
				{/* Footer */}
				<footer className="text-center py-8 text-gray-500">
					<p>&copy; 2024 らくらくリーグ戦. シンプルな卓球リーグ管理システム</p>
				</footer>
			</div>
		</div>
	);
}