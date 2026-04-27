import Link from "next/link"
import { Logo } from "@/core/components/logo"
import { cn } from "@/core/lib/utils"

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="bg-background relative flex min-h-screen flex-col">
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
				<header className="flex flex-col gap-2 text-center">
					<Logo href="/" text="OPAPRU EDMS" className="self-center" />
					<p className="text-muted-foreground text-sm">
						Enterprise Document Management System
					</p>
				</header>
				<main className="flex flex-1 flex-col">{children}</main>
			</div>
		</div>
	)
}
