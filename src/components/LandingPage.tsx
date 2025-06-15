import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {signInWithGoogle} from '@/services/authService';
import {ArrowRight, BarChart3, Bell, Shield, Target, TrendingUp, Zap} from 'lucide-react';

const LandingPage = ({pincode}) => {
    console.log(pincode)
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            const user = await signInWithGoogle(); // Assuming signInWithGoogle returns a UserCredential


            // Prepare data for the backend call
            const userData = {
                uid: user.uid,
                email: user.email,
                username: user.displayName,
                pincode: pincode
                // You might want to add other relevant user data here
            };

            // Make the backend POST call
            const response = await fetch('https://jugaad-backend-production.up.railway.app/signup', { // Replace with your actual backend endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Backend call successful:', responseData);
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
            badge: "AI-Powered"
        },
        {
            icon: Target,
            title: "Precision Targeting",
            description: "Set precise price targets with customizable alert conditions",
            badge: "Accurate"
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Bank-level security with Google authentication",
            badge: "Secure"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Navigation */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                            <Badge variant="secondary" className="px-4 py-1">
                                ✨ Smart Price Monitoring
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Never Miss a
                                <span className="text-primary block md:inline"> Price Drop</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                Set intelligent price alerts for stocks, crypto, and products.
                                Get notified instantly when prices hit your target with our AI-powered monitoring
                                system.
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
                            <Button variant="outline" size="lg" className="gap-2">
                                Watch Demo
                                <Zap className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to stay ahead</h2>
                        <p className="text-muted-foreground text-lg">
                            Professional-grade tools for smart price monitoring
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
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
                            <div className="grid md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="text-3xl font-bold mb-2">10M+</div>
                                    <div className="text-primary-foreground/80">Price Alerts Set</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-2">99.9%</div>
                                    <div className="text-primary-foreground/80">Uptime Guarantee</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-2">2.3s</div>
                                    <div className="text-primary-foreground/80">Avg Response Time</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
