"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-app-theme/use-theme";

export default function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const icon = theme === "dark" ? <Sun /> : <Moon />;

	return (
		<button type="button" onClick={toggleTheme}>
			{icon}
		</button>
	);
}
