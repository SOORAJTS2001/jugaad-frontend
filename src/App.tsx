import {useEffect} from "react";
import {inject} from "@vercel/analytics";
import {SpeedInsights} from "@vercel/speed-insights/react";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Index from "./pages/Index";
import ItemDetails from "./components/ItemDetails";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => {
    useEffect(() => {
        inject();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index/>}/>
                        <Route path="/chat" element={<Chat/>}/>
                        <Route path="/item/:id" element={<ItemDetails/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
                <SpeedInsights/> {/* For Vercel Speed Insights */}
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;

