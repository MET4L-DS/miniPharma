// file: ./src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const LoginPage = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	// Get the intended destination from location state
	const from = location.state?.from?.pathname || "/dashboard";

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
			const data: any = await apiService.login({
				phone: phoneNumber,
				password: password,
			});

			toast.success("Login successful!");

			// Decode token to determine role
			const tokenPayload = data.token
				? JSON.parse(atob(data.token.split(".")[1]))
				: null;
			const accountPhone = tokenPayload?.account || phoneNumber;
			const shopIdFromToken = tokenPayload?.shop || data.shop_id;

			// Determine role from response
			const role: "manager" | "staff" = data.is_manager
				? "manager"
				: data.is_staff
				? "staff"
				: "manager";

			// Create user object with available data
			const userData = {
				phone: accountPhone, // The account phone (manager or staff)
				shopname: data.shopname || "",
				manager: data.manager || "",
				accountPhone: accountPhone,
				shopId: shopIdFromToken,
				role: role,
			};

			// Update authentication state with token
			login(userData, data.token);

			// Navigate to intended destination or dashboard
			navigate(from, { replace: true });
		} catch (error) {
			console.error("Login error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Login failed";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Pharmacy Login
					</CardTitle>
					<CardDescription className="text-center">
						Enter your phone number and password to continue
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleLogin}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="Enter 10-digit phone number"
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
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
						<div className="text-center text-sm">
							Don't have an account?{" "}
							<Button
								variant="link"
								className="p-0 h-auto"
								onClick={() => navigate("/register")}
							>
								Register here
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default LoginPage;
