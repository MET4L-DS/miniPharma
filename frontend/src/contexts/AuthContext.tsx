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
}

interface AuthContextType {
	user: User | null;
	login: (userData: User) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for stored user data on app initialization
		const storedUser = localStorage.getItem("userPhone");
		const storedUserData = localStorage.getItem("userData");

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
		setIsLoading(false);
	}, []);

	const login = (userData: User) => {
		setUser(userData);
		localStorage.setItem("userPhone", userData.phone);
		localStorage.setItem("userData", JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("userPhone");
		localStorage.removeItem("userData");
	};

	const value: AuthContextType = {
		user,
		login,
		logout,
		isAuthenticated: !!user,
		isLoading,
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
