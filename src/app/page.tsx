"use client";

import { Plus, Users, Building, Target, CheckCircle, PlayCircle, Share, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HomePage() {
	const threeContainerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const spheresRef = useRef<THREE.Mesh[]>([]);
	const paddlesRef = useRef<THREE.Mesh[]>([]);
	const animationIdRef = useRef<number | null>(null);

	useEffect(() => {
		if (!threeContainerRef.current) return;

		const container = threeContainerRef.current;

		// Three.js Setup
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0);
		container.appendChild(renderer.domElement);

		sceneRef.current = scene;
		cameraRef.current = camera;
		rendererRef.current = renderer;

		// Orange ping pong balls
		for (let i = 0; i < 5; i++) {
			const geometry = new THREE.SphereGeometry(0.5, 32, 32);
			const material = new THREE.MeshBasicMaterial({ 
				color: 0xff6600,
				transparent: true,
				opacity: 0.6
			});
			const sphere = new THREE.Mesh(geometry, material);
			
			sphere.position.x = (Math.random() - 0.5) * 20;
			sphere.position.y = (Math.random() - 0.5) * 20;
			sphere.position.z = (Math.random() - 0.5) * 20;
			
			(sphere as any).userData = {
				velocity: {
					x: (Math.random() - 0.5) * 0.02,
					y: (Math.random() - 0.5) * 0.02,
					z: (Math.random() - 0.5) * 0.02
				}
			};
			
			spheresRef.current.push(sphere);
			scene.add(sphere);
		}
		
		// White paddle shapes
		for (let i = 0; i < 3; i++) {
			const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
			const material = new THREE.MeshBasicMaterial({ 
				color: 0xffffff,
				transparent: true,
				opacity: 0.4
			});
			const paddle = new THREE.Mesh(geometry, material);
			
			paddle.position.x = (Math.random() - 0.5) * 25;
			paddle.position.y = (Math.random() - 0.5) * 25;
			paddle.position.z = (Math.random() - 0.5) * 25;
			
			(paddle as any).userData = {
				rotationSpeed: {
					x: (Math.random() - 0.5) * 0.01,
					y: (Math.random() - 0.5) * 0.01,
					z: (Math.random() - 0.5) * 0.01
				}
			};
			
			paddlesRef.current.push(paddle);
			scene.add(paddle);
		}
		
		camera.position.z = 15;

		// Animation loop
		const animate = () => {
			animationIdRef.current = requestAnimationFrame(animate);
			
			// Animate spheres
			spheresRef.current.forEach(sphere => {
				const userData = (sphere as any).userData;
				sphere.position.x += userData.velocity.x;
				sphere.position.y += userData.velocity.y;
				sphere.position.z += userData.velocity.z;
				
				// Bounce off boundaries
				if (Math.abs(sphere.position.x) > 15) userData.velocity.x *= -1;
				if (Math.abs(sphere.position.y) > 15) userData.velocity.y *= -1;
				if (Math.abs(sphere.position.z) > 15) userData.velocity.z *= -1;
			});
			
			// Animate paddles
			paddlesRef.current.forEach(paddle => {
				const userData = (paddle as any).userData;
				paddle.rotation.x += userData.rotationSpeed.x;
				paddle.rotation.y += userData.rotationSpeed.y;
				paddle.rotation.z += userData.rotationSpeed.z;
			});
			
			renderer.render(scene, camera);
		};

		animate();

		// Handle window resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		// Mouse interaction
		const handleMouseMove = (e: MouseEvent) => {
			if (camera) {
				const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
				const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
				
				camera.position.x = mouseX * 2;
				camera.position.y = mouseY * 2;
				camera.lookAt(scene.position);
			}
		};

		window.addEventListener('resize', handleResize);
		document.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('mousemove', handleMouseMove);
			
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current);
			}

			// Clean up Three.js resources
			if (container && renderer.domElement) {
				container.removeChild(renderer.domElement);
			}
			renderer.dispose();
		};
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Three.js Background Container */}
			<div ref={threeContainerRef} id="three-container" />
			
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
					<section className="mb-8 md:mb-12">
						<div className="max-w-6xl mx-auto text-center">
							{/* Device Mockups Container */}
							<div className="relative max-w-3xl mx-auto h-72 md:h-96">
								{/* PC Mockup (Background) */}
								<div className="absolute left-0 md:left-2 lg:left-4 top-0 transform rotate-2 z-10">
									<div className="neumorphism p-3 bg-gray-800 rounded-lg shadow-2xl">
										{/* PC Screen */}
										<div className="w-72 md:w-96 h-44 md:h-56 bg-white rounded-md overflow-hidden relative">
											{/* Simulated webpage content */}
											<div className="bg-gradient-to-r from-orange-100 to-orange-50 h-8 flex items-center px-2">
												<div className="flex space-x-1">
													<div className="w-2 h-2 bg-red-400 rounded-full"></div>
													<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
													<div className="w-2 h-2 bg-green-400 rounded-full"></div>
												</div>
											</div>
											<div className="p-3 text-xs">
												<div className="text-center mb-2">
													<div className="inline-block px-2 py-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs rounded">
														らくらくリーグ戦
													</div>
												</div>
												<div className="space-y-2">
													<div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
													<div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
													<div className="flex justify-center mt-3">
														<div className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
															リーグを作成
														</div>
													</div>
												</div>
											</div>
										</div>
										{/* PC Base */}
										<div className="w-72 md:w-96 h-2 bg-gray-700 rounded-b-lg"></div>
									</div>
								</div>
								
								{/* Smartphone Mockup (Foreground) */}
								<div className="absolute right-4 md:right-2 lg:right-4 top-8 md:top-12 transform -rotate-3 z-20">
									<div className="neumorphism p-2 bg-gray-900 rounded-xl shadow-2xl">
										{/* Phone Screen */}
										<div className="w-32 md:w-40 h-60 md:h-72 bg-white rounded-lg overflow-hidden relative">
											{/* Status bar */}
											<div className="bg-gray-900 h-4 flex items-center justify-between px-2 text-white text-xs">
												<span>9:41</span>
												<div className="flex items-center space-x-1">
													<div className="w-3 h-2 bg-white rounded-sm"></div>
												</div>
											</div>
											{/* Mobile content */}
											<div className="p-2 text-xs">
												<div className="text-center mb-3">
													<div className="inline-block px-2 py-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs rounded">
														らくらく
													</div>
												</div>
												<div className="space-y-2 mb-4">
													<div className="h-1.5 bg-gray-200 rounded w-3/4 mx-auto"></div>
													<div className="h-1.5 bg-gray-200 rounded w-1/2 mx-auto"></div>
												</div>
												
												{/* Mobile 3-step cards */}
												<div className="space-y-2 mb-4">
													<div className="bg-orange-50 p-2 rounded text-center">
														<div className="w-4 h-4 mx-auto mb-1 bg-orange-500 rounded-full flex items-center justify-center">
															<span className="text-xs text-white">1</span>
														</div>
														<div className="h-1 bg-gray-200 rounded mb-1"></div>
													</div>
													<div className="bg-orange-50 p-2 rounded text-center">
														<div className="w-4 h-4 mx-auto mb-1 bg-orange-500 rounded-full flex items-center justify-center">
															<span className="text-xs text-white">2</span>
														</div>
														<div className="h-1 bg-gray-200 rounded mb-1"></div>
													</div>
												</div>
												
												<div className="flex justify-center">
													<div className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
														リーグを作成
													</div>
												</div>
											</div>
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
								<Plus className="h-6 w-6" />
								リーグを作成
							</Link>
						</div>
						<p className="text-gray-500 mt-6 text-sm">
							<CheckCircle className="text-orange-500 mr-1 inline h-4 w-4" />
							完全無料・登録不要
						</p>
					</section>
					
					{/* Hero Section */}
					<section className="text-center mb-12 md:mb-20">
						<div className="max-w-4xl mx-auto">
							<div className="neumorphism p-4 md:p-8 mb-8 md:mb-12 float-animation">
								<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
									3ステップで始める簡単リーグ戦
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-8">
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<Plus className="text-white text-2xl" />
										</div>
										<h3 className="font-semibold text-lg mb-2">1. 作る</h3>
										<p className="text-gray-600">リーグを簡単作成</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<Share className="text-white text-2xl" />
										</div>
										<h3 className="font-semibold text-lg mb-2">2. 共有</h3>
										<p className="text-gray-600">URLで参加者に共有</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
											<Edit className="text-white text-2xl" />
										</div>
										<h3 className="font-semibold text-lg mb-2">3. 入力</h3>
										<p className="text-gray-600">試合結果を入力・閲覧</p>
									</div>
								</div>
							</div>
						</div>
					</section>
					
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
										<PlayCircle className="text-6xl text-orange-500 mb-4" />
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
									<i className="fas fa-mobile-alt text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">直感的操作</h3>
									<p className="text-gray-600">スマートフォンでも操作しやすい</p>
								</div>
								
								<div className="feature-card neumorphism p-4 md:p-6 text-center">
									<i className="fas fa-sync-alt text-3xl text-orange-500 mb-4"></i>
									<h3 className="font-semibold text-lg mb-3">リアルタイム</h3>
									<p className="text-gray-600">結果入力と同時に全員に反映</p>
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
									<Users className="text-4xl text-orange-500 mb-6 mx-auto" />
									<h3 className="font-semibold text-xl mb-4">地域サークル</h3>
									<p className="text-gray-600 mb-4">地域の卓球サークルでの定期大会や月例リーグ戦に最適</p>
									<div className="text-sm text-gray-500">
										<CheckCircle className="text-orange-500 mr-2 inline h-4 w-4" />
										参加者15名以下の規模
									</div>
								</div>
								
								<div className="feature-card neumorphism p-6 md:p-8 text-center">
									<Building className="text-4xl text-orange-500 mb-6 mx-auto" />
									<h3 className="font-semibold text-xl mb-4">会社・企業</h3>
									<p className="text-gray-600 mb-4">社内の卓球部やレクリエーション活動での利用</p>
									<div className="text-sm text-gray-500">
										<CheckCircle className="text-orange-500 mr-2 inline h-4 w-4" />
										部署対抗戦にも対応
									</div>
								</div>
								
								<div className="feature-card neumorphism p-6 md:p-8 text-center">
									<Target className="text-4xl text-orange-500 mb-6 mx-auto" />
									<h3 className="font-semibold text-xl mb-4">友人グループ</h3>
									<p className="text-gray-600 mb-4">気軽な仲間同士でのカジュアルなリーグ戦</p>
									<div className="text-sm text-gray-500">
										<CheckCircle className="text-orange-500 mr-2 inline h-4 w-4" />
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
									<Plus className="h-6 w-6" />
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