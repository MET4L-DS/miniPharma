// file: ./src/pages/LoginPage.tsx

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
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Validate phone number format
		if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
			toast.error("Please enter a valid 10-digit phone number");
			setIsLoading(false);
			return;
		}

		if (!phoneNumber.trim() || !password.trim()) {
			toast.error("Please enter both phone number and password");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/login/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					phone: phoneNumber,
					password: password,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Login successful!");
				// Store user info if needed
				localStorage.setItem("userPhone", phoneNumber);
				navigate("/dashboard");
			} else {
				toast.error(data.error || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Network error. Please try again.");
		} finally {
			setIsLoading(false);
		}
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
				<form onSubmit={handleLogin} className="grid gap-4">
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								type="tel"
								placeholder="10-digit phone number"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								maxLength={10}
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
					<CardFooter className="flex flex-col space-y-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
						<div className="text-center text-sm">
							Don't have an account?{" "}
							<Button
								variant="link"
								className="p-0"
								onClick={() => navigate("/register")}
							>
								Register now
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default LoginPage;
