// file: ./src/App.tsx
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import MedicinePage from "@/pages/medicine/MedicinePage";
import LoginPage from "@/pages/LoginPage";
import RegistrationPage from "@/pages/RegistrationPage";
import BillingPage from "@/pages/BillingPage";
import DashboardPage from "@/pages/DashboardPage";
import StockPage from "@/pages/StockPage";
import PaymentPage from "@/pages/PaymentPage";

import { Toaster } from "sonner";

function App() {
	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={<Navigate to="/dashboard" replace />}
				/>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegistrationPage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/medicines" element={<MedicinePage />} />
				<Route path="/stock" element={<StockPage />} />
				<Route path="/billing" element={<BillingPage />} />
				<Route path="/payments" element={<PaymentPage />} />
			</Routes>
			<Toaster />
		</Router>
	);
}

export default App;
