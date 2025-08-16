import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "らくらくリーグ戦",
	description: "卓球のリーグ戦をWEB上で簡単に作成・管理できるサービス",
	keywords: "卓球, リーグ戦, トーナメント, スポーツ管理",
	viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
