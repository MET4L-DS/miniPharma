import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import MedicinePage from "@/pages/MedicinePage";
import LoginPage from "@/pages/LoginPage";
import { Toaster } from "sonner";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/medicines" element={<MedicinePage />} />
			</Routes>
			<Toaster richColors closeButton position="top-right" />
		</Router>
	);
}

export default App;
