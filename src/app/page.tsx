import { Building, ExternalLink, Plus, Target, Users } from "lucide-react";
import Link from "next/link";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								らくらくリーグ戦
							</h1>
							<p className="text-muted-foreground mt-1">
								卓球のリーグ戦をWEB上で簡単に作成・管理
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-24">
				<div className="text-center max-w-3xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
						手軽にリーグ戦を
						<span className="text-primary">始めよう</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						面倒な登録なしで即座にリーグ戦を作成・共有できます。
					</p>

					<div className="flex justify-center">
						<Button
							asChild
							size="lg"
							className="text-xl px-12 py-6 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
						>
							<Link href="/create">
								<Plus className="mr-3 h-6 w-6" />
								リーグ戦を作成
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-muted/50 py-24">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold tracking-tight mb-4">
							こんな方におすすめ
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							さまざまなシーンでご利用いただけます
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<Card className="border-0 shadow-sm">
							<CardHeader className="text-center pb-4">
								<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
									<Building className="h-6 w-6 text-primary-foreground" />
								</div>
								<CardTitle className="text-xl">会社の卓球部</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<CardDescription className="text-base leading-relaxed">
									昼休みや業後の試合結果をその場で入力。部員みんなでリアルタイムに順位をチェック
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-sm">
							<CardHeader className="text-center pb-4">
								<div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
									<Users className="h-6 w-6 text-secondary-foreground" />
								</div>
								<CardTitle className="text-xl">地域サークル</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<CardDescription className="text-base leading-relaxed">
									試合後にみんなでスマホを見ながら順位確認。次の対戦相手も一目瞭然
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-sm">
							<CardHeader className="text-center pb-4">
								<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
									<Target className="h-6 w-6 text-accent-foreground" />
								</div>
								<CardTitle className="text-xl">友人グループ</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<CardDescription className="text-base leading-relaxed">
									月1回の集まりで継続的にリーグ戦。前回の結果を見ながら今回の対戦も楽しく
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="py-24">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold tracking-tight mb-4">
							3ステップで簡単スタート
						</h2>
						<p className="text-muted-foreground text-lg">
							誰でも簡単にリーグ戦を始められます
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
						<div className="text-center">
							<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-primary-foreground font-bold text-2xl">
									1
								</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">作る</h3>
							<p className="text-muted-foreground leading-relaxed">
								リーグ戦名と参加者を入力するだけ。台数や試合形式も設定可能
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-primary-foreground font-bold text-2xl">
									2
								</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">共有</h3>
							<p className="text-muted-foreground leading-relaxed">
								URLをLINEやメールで共有。QRコードでも簡単アクセス
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-primary-foreground font-bold text-2xl">
									3
								</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">入力</h3>
							<p className="text-muted-foreground leading-relaxed">
								試合結果をその場で入力。リアルタイムで順位表に反映
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-muted py-24">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-3xl font-bold tracking-tight mb-4">
							今すぐリーグ戦を始めましょう
						</h2>
						<p className="text-muted-foreground text-lg mb-8">
							無料で利用開始。登録不要でご利用いただけます。
						</p>
						<Button asChild size="lg" className="text-lg px-8">
							<Link href="/create">
								<Plus className="mr-2 h-5 w-5" />
								リーグ戦を作成する
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-12">
				<div className="container mx-auto px-4 text-center">
					<p className="text-muted-foreground">
						© 2024 らくらくリーグ戦. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
