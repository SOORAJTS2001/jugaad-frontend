import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {signInWithGoogle} from '@/services/authService';
import {ArrowRight, BarChart3, Bell, KeyRound, Target, TrendingUp, Zap} from 'lucide-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const getPublicIP = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip; // e.g., "123.123.123.123"
    } catch (err) {
        console.error("Failed to get IP:", err);
        return null;
    }
};

const LandingPage = ({pincode}) => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            const ip = await getPublicIP();

            const user = await signInWithGoogle(); // Assuming signInWithGoogle returns a UserCredential

            console.log(ip)
            // Prepare data for the backend call
            const userData = {
                uid: user.uid,
                email: user.email,
                username: user.displayName,
                pincode: pincode,
                ip: ip
                // You might want to add other relevant user data here
            };

            // Make the backend POST call
            const response = await fetch(`${backendUrl}/signup`, { // Replace with your actual backend endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                await response.json();
                // Handle successful backend response (e.g., redirect user, show success message)
            } else {
                console.error('Backend call failed:', response.statusText);
                // Handle backend error
            }

        } catch (error) {
            console.error('Sign in failed:', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    const features = [
        {
            icon: Bell,
            title: "Real-time Alerts",
            description: "Get instant notifications when your target prices are reached",
            badge: "Instant"
        },
        {
            icon: BarChart3,
            title: "Smart Analytics",
            description: "Advanced charts and insights to track market movements",
            badge: "Smart"
        },
        {
            icon: Target,
            title: "Precision Targeting",
            description: "Set precise price targets with customizable alert conditions",
            badge: "Accurate"
        },
        {
            icon: KeyRound,
            title: "One-Tap Sign-In",
            description: "Sign in easily using your Google account — no passwords to manage.",
            badge: "Access"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Navigation */}
            <nav
                className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-primary-foreground"/>
                            </div>
                            <span className="text-xl font-bold">Jugaad</span>
                        </div>
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn}
                            className="gap-2"
                        >
                            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                            <ArrowRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <Badge
                                variant="outline"
                                className="px-5 py-2 text-sm font-medium rounded-full border border-neutral-300 bg-white/50 backdrop-blur-sm text-neutral-800 shadow-sm hover:shadow transition-all duration-300"
                            >
                                AI Shopping Assistant for JioMart
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Smart Shopping Starts
                                <span className="pl-2 block md:inline bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] bg-[position:0%_50%] transition-all duration-500 hover:bg-[position:100%_50%]">
                                 Here.
                              </span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                Track prices. Save money. Simple.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={handleGoogleSignIn}
                                disabled={isSigningIn}
                                className="gap-2"
                            >
                                {isSigningIn ? 'Signing in...' : 'Get Started with Google'}
                                <ArrowRight className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-indigo-500/25 transition-all duration-300"
                                onClick={() => window.location.href = '/chat'}
                            >
                                Ask Jaggu AI
                                <Zap className="h-4 w-4 animate-pulse"/>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Built for real-world price intelligence</h2>
                        <p className="text-muted-foreground text-lg">
                            Accurate, automated, and transparent — everything you need to monitor prices efficiently.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="relative group hover:shadow-lg transition-all duration-300"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div
                                            className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <feature.icon className="h-6 w-6 text-primary"/>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {feature.badge}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>


                {/* Stats Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Card className="bg-primary text-primary-foreground">
                        <CardContent className="p-8">
                            <div
                                className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                                {/* Logo Section */}
                                <div className="flex items-center justify-center md:justify-start">
                                    <TrendingUp className="h-25 w-25 text-primary-foreground"/>
                                    <div className="flex pl-2 items-center text-lg font-semibold">
                                        Jugaad
                                    </div>
                                </div>


                                {/* Links Section */}
                                <div
                                    className="flex flex-col md:flex-row justify-center md:justify-end gap-6 text-center md:text-left">
                                    <a href="/terms" className="hover:underline">
                                        Terms
                                    </a>
                                    <a href="/privacy" className="hover:underline">
                                        Privacy
                                    </a>
                                    <a href="/disclaimer" className="hover:underline">
                                        Disclaimer
                                    </a>
                                    <a href="/report-bug" className="hover:underline">
                                        Report a Bug
                                    </a>
                                    <a href="/features" className="hover:underline">
                                        Features
                                    </a>
                                </div>
                            </div>
                            <div className="mt-8 text-center text-sm text-primary-foreground/70">
                                Powered by code, caffeine, and curiosity.
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </div>
    );
};

export default LandingPage;
