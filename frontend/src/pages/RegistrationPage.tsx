// file: ./src/pages/RegistrationPage.tsx

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
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const RegistrationPage = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [shopName, setShopName] = useState("");
	const [manager, setManager] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Basic validation
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
			toast.error("Phone number must be exactly 10 digits");
			setIsLoading(false);
			return;
		}

		if (!phoneNumber.trim() || !password.trim() || !shopName.trim()) {
			toast.error("Please fill in all required fields");
			setIsLoading(false);
			return;
		}

		try {
			const data: any = await apiService.register({
				phone: phoneNumber,
				password: password,
				shopname: shopName,
				manager: manager || undefined,
			});

			// If backend returned a token, auto-login and navigate to dashboard
			const userData = {
				phone: phoneNumber,
				shopname: data.shopname || "",
				manager: data.manager || "",
			};
			if (data.token) {
				login(userData, data.token);
				toast.success(
					"Registration successful — you are now logged in."
				);
				navigate("/dashboard");
			} else {
				toast.success(
					"Registration successful! Please login to continue."
				);
				navigate("/login");
			}
		} catch (error) {
			console.error("Registration error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Registration failed";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">
						Register
					</CardTitle>
					<CardDescription className="text-center">
						Create a new account to access the Medicine Dashboard
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleRegister}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="phoneNumber">Phone Number *</Label>
							<Input
								id="phoneNumber"
								type="tel"
								placeholder="10-digit phone number"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								required
								maxLength={10}
							/>
							<p className="text-xs text-gray-500">
								Your phone number will be used as your username
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="shopName">Shop Name *</Label>
							<Input
								id="shopName"
								type="text"
								placeholder="Enter your shop name"
								value={shopName}
								onChange={(e) => setShopName(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="manager">Manager</Label>
							<Input
								id="manager"
								type="text"
								placeholder="Manager name (optional)"
								value={manager}
								onChange={(e) => setManager(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password *</Label>
							<Input
								id="password"
								type="password"
								placeholder="Create a strong password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm Password *
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 pt-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Registering..." : "Register"}
						</Button>
						<div className="text-center text-sm">
							Already have an account?{" "}
							<Button
								variant="link"
								className="p-0"
								onClick={() => navigate("/login")}
							>
								Login here
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default RegistrationPage;
