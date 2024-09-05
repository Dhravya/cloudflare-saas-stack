"use client";

import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const icon = theme === "dark" ? <Sun /> : <Moon />;

	return (
		<button type="button" onClick={toggleTheme}>
			{icon}
		</button>
	);
}
