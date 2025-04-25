import { Button } from "@/components/ui/button";
import { MedicineTable } from "@/components/ui/MedicineTable";

function App() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen h-full">
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<Button>Click me</Button>
				<div className="mt-8 w-full">
					<MedicineTable />
				</div>
			</div>
		</div>
	);
}

export default App;
