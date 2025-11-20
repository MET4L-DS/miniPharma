// file: ./src/App.tsx
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import MedicinePage from "@/pages/MedicinePage";
import LoginPage from "@/pages/LoginPage";
import RegistrationPage from "@/pages/RegistrationPage";
import BillingPage from "@/pages/BillingPage";
import DashboardPage from "@/pages/DashboardPage";
import StockPage from "@/pages/StockPage";
import PaymentPage from "@/pages/PaymentPage";
import StaffManagementPage from "@/pages/StaffManagementPage";
import ShopManagementPage from "@/pages/ShopManagementPage";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Public routes */}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegistrationPage />} />

					{/* Protected routes */}
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/medicines"
						element={
							<ProtectedRoute>
								<MedicinePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/stock"
						element={
							<ProtectedRoute>
								<StockPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/billing"
						element={
							<ProtectedRoute>
								<BillingPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/payments"
						element={
							<ProtectedRoute>
								<PaymentPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/staff"
						element={
							<ProtectedRoute>
								<StaffManagementPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/shops"
						element={
							<ProtectedRoute>
								<ShopManagementPage />
							</ProtectedRoute>
						}
					/>

					{/* Default redirect */}
					<Route
						path="/"
						element={<Navigate to="/dashboard" replace />}
					/>
					<Route
						path="*"
						element={<Navigate to="/dashboard" replace />}
					/>
				</Routes>
				<Toaster />
			</Router>
		</AuthProvider>
	);
}

export default App;
