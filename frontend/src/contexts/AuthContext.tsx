// file: ./src/contexts/AuthContext.tsx
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface User {
	phone: string;
	shopname?: string;
	manager?: string;
	accountPhone?: string; // The actual account (staff or manager)
	shopId?: number; // The current shop context (shop_id)
	role?: "manager" | "staff"; // User role
}

interface AuthContextType {
	user: User | null;
	login: (userData: User, token?: string) => void;
	logout: () => void;
	updateShop: (
		shopData: { shopId: number; shopname: string },
		token: string
	) => void;
	isAuthenticated: boolean;
	isLoading: boolean;
	isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for stored user data on app initialization
		const storedUser = localStorage.getItem("userPhone");
		const storedUserData = localStorage.getItem("userData");
		const storedToken = localStorage.getItem("authToken");

		if (storedUser && storedUserData) {
			try {
				const userData = JSON.parse(storedUserData);
				setUser(userData);
			} catch (error) {
				console.error("Error parsing stored user data:", error);
				localStorage.removeItem("userPhone");
				localStorage.removeItem("userData");
			}
		}

		if (storedToken) {
			setToken(storedToken);
		}
		setIsLoading(false);
	}, []);

	const login = (userData: User, authToken?: string) => {
		setUser(userData);
		localStorage.setItem("userPhone", userData.phone);
		localStorage.setItem("userData", JSON.stringify(userData));
		if (authToken) {
			setToken(authToken);
			localStorage.setItem("authToken", authToken);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("authToken");
		localStorage.removeItem("userPhone");
		localStorage.removeItem("userData");
	};

	const updateShop = (
		shopData: { shopId: number; shopname: string },
		newToken: string
	) => {
		if (user) {
			const updatedUser = {
				...user,
				shopId: shopData.shopId,
				shopname: shopData.shopname,
			};
			setUser(updatedUser);
			setToken(newToken);
			localStorage.setItem("userData", JSON.stringify(updatedUser));
			localStorage.setItem("authToken", newToken);
		}
	};

	const isManager = user?.role === "manager";

	const value: AuthContextType = {
		user,
		login,
		logout,
		updateShop,
		isAuthenticated: !!user,
		isLoading,
		isManager,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
