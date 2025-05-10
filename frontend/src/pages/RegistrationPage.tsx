// src/pages/RegistrationPage.tsx

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const RegistrationPage = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState("Manager");
	const [managerPhone, setManagerPhone] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleRegister = (e: React.FormEvent) => {
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

		if (role !== "Manager" && !managerPhone) {
			toast.error("Please provide your manager's phone number");
			setIsLoading(false);
			return;
		}

		// Simulate API call delay
		setTimeout(() => {
			setIsLoading(false);
			toast.success("Registration successful!");
			navigate("/login");
		}, 1000);
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
							<Label htmlFor="phoneNumber">Phone Number</Label>
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
							<Label htmlFor="password">Password</Label>
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
								Confirm Password
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

						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select value={role} onValueChange={setRole}>
								<SelectTrigger>
									<SelectValue placeholder="Select your role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Manager">
										Manager
									</SelectItem>
									<SelectItem value="Staff">Staff</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{role !== "Manager" && (
							<div className="space-y-2">
								<Label htmlFor="managerPhone">
									Manager's Phone Number
								</Label>
								<Input
									id="managerPhone"
									type="tel"
									placeholder="10-digit phone number"
									value={managerPhone}
									onChange={(e) =>
										setManagerPhone(e.target.value)
									}
									maxLength={10}
								/>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
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
