// Create a new file: src/pages/LoginPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call delay
		setTimeout(() => {
			setIsLoading(false);

			// This is a dummy login - in a real app, you would validate credentials
			// For this demo, we accept any non-empty input
			if (email.trim() && password.trim()) {
				toast.success("Login successful!");
				navigate("/medicines");
			} else {
				toast.error("Please enter both email and password");
			}
		}, 1000);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">
						Login
					</CardTitle>
					<CardDescription className="text-center">
						Enter your credentials to access the Medicine Dashboard
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleLogin} className=" grid gap-4">
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="your.email@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default LoginPage;
