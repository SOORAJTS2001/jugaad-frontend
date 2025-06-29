import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {signOut} from '@/services/authService';
import {useAuth} from '@/hooks/useAuth';
import {Link} from 'react-router-dom';
import AlertForm from './AlertForm';
import {
    Activity,
    AlertCircle,
    Bell,
    CheckCircle2,
    ExternalLink,
    LogOut,
    Menu,
    MoreHorizontal,
    Settings,
    TrendingUp
} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {useToast} from '@/hooks/use-toast';

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Props {
    userId: string;
    itemId: string;
    emailId: string;
}

export function ItemActionsDropdown({userId, itemId, emailId,}: Props) {
    const {toast} = useToast();
    const handleDelete = async (userId, itemId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-item`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({uid: userId, item_id: itemId, email: emailId}), // ✅ using itemId here
            });

            if (!res.ok) {
                const {detail} = await res.json();
                throw new Error(detail ?? 'Delete failed');
            }

            toast({
                title: "Success",
                description: "Successfully Deleted",
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            window.location.reload();
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Could not delete the item",
                variant: "destructive"
            });
            console.error(err);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/90 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md">
                <DropdownMenuItem>
                    View
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(userId, itemId)}
                                  className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const Dashboard = ({pincode}) => {
    const {user} = useAuth();
    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        if (!user) return; // Wait for user to be authenticated

        const data = {
            uid: user.uid,
            email: user.email,
            username: user.displayName,
            pincode: pincode
        }

        fetch(`${backendUrl}/get-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((items) => {
                const alerts = items.map((item, index) => ({
                    id: index + 1,
                    name: item.name,
                    item_id: item.item_id,
                    source_url: item.source_url,
                    mrp_price: item.mrp_price,
                    selling_price: item.selling_price,
                    category: item.category,
                    is_available: item.is_available ? "active" : "unavailable",
                    price_change: item.price_change,
                    max_price: item.max_price,
                    max_offer: item.max_offer
                }));

                setRecentAlerts(alerts); // ✅ Save to state and localStorage via useEffect
            })
            .catch((error) => {
                console.error("Error fetching items:", error);
            });
    }, [user, pincode]); // Add pincode as dependency

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav
                className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16 items-center">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                                <Menu className="h-4 w-4"/>
                            </Button>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <div
                                    className="h-6 w-6 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-primary-foreground"/>
                                </div>
                                <span className="text-lg sm:text-xl font-bold">Jugaad</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                                <Bell className="h-4 w-4 sm:h-5 sm:w-5"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 sm:h-10 sm:w-10">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5"/>
                            </Button>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''}/>
                                    <AvatarFallback className="text-xs">
                                        {user?.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium truncate max-w-[120px]">{user?.displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                size="sm"
                                className="gap-1 sm:gap-2 h-8 px-2 sm:px-3"
                            >
                                <LogOut className="h-3 w-3 sm:h-4 sm:w-4"/>
                                <span className="hidden sm:inline text-xs sm:text-sm">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Welcome Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Welcome back, {user?.displayName?.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Monitor your favorite products and get notified when prices drop.
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    {/* Alerts List */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg sm:text-xl">Price Alerts</CardTitle>
                                        <CardDescription className="text-sm">
                                            Manage your active price monitoring alerts
                                        </CardDescription>
                                    </div>
                                    <div className="sm:hidden">
                                        <AlertForm/>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="active" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 h-9">
                                        <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                                        <TabsTrigger value="triggered"
                                                     className="text-xs sm:text-sm">Triggered</TabsTrigger>
                                        <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="active" className="space-y-3 sm:space-y-4 mt-4">
                                        {recentAlerts.map((alert) => (
                                            <div key={alert.id}
                                                 className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                {/* Top Row - Product Info */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                                                        <div
                                                            className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary"/>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Link
                                                                    to={`/item/${alert.item_id}`}
                                                                    className="font-medium hover:text-primary transition-colors text-sm sm:text-base line-clamp-2 flex-1 block truncate max-w-[200px]"
                                                                    title={alert.name}
                                                                >
                                                                    {alert.name}
                                                                </Link>
                                                                <Badge
                                                                    variant={alert.is_available === 'triggered' ? 'default' : 'secondary'}
                                                                    className="text-xs flex-shrink-0"
                                                                >
                                                                    {alert.is_available === 'triggered' ?
                                                                        <CheckCircle2 className="h-3 w-3 mr-1"/> :
                                                                        <AlertCircle className="h-3 w-3 mr-1"/>}
                                                                    {alert.is_available}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{alert.category}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row - Price Info and Actions */}
                                                <div className="flex items-center justify-between gap-2">
                                                    {/* Price Info */}
                                                    <div
                                                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-muted-foreground">Now:</p>
                                                            <p className="font-medium text-sm sm:text-base">₹{alert.selling_price.toLocaleString()}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            MRP: ₹{alert.mrp_price.toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Discount and Actions */}
                                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-green-600 text-xs"
                                                        >
                                                            {Math.round((1 - (alert.selling_price / alert.mrp_price)) * 100)}%
                                                        </Badge>
                                                        <Badge variant="outline"
                                                               className="text-gray-600 text-xs hidden sm:flex">
                                                            ₹{alert.max_price} &nbsp;
                                                            <Bell className="h-3 w-3 text-blue-600"/>
                                                            &nbsp;
                                                            {alert.max_offer}%
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                            <a href={alert.source_url} target="_blank"
                                                               rel="noopener noreferrer">
                                                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4"/>
                                                            </a>
                                                        </Button>
                                                        <ItemActionsDropdown
                                                            userId={user.uid}
                                                            emailId={user.email}
                                                            itemId={alert.item_id}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Mobile Alert Info */}
                                                <div className="sm:hidden">
                                                    <Badge variant="outline" className="text-gray-600 text-xs">
                                                        Target: ₹{alert.max_price} | {alert.max_offer}% off
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="triggered" className="mt-4">
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                                            <p className="text-muted-foreground text-sm">No triggered alerts today</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="all" className="mt-4">
                                        <div className="text-center py-8">
                                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                                            <p className="text-muted-foreground text-sm">View all your alerts here</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="hidden sm:block">
                                    <AlertForm/>
                                </div>
                                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                                    <Activity className="h-4 w-4"/>
                                    Price Prediction
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base sm:text-lg">Supported Sites</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">JioMart</span>
                                    <Badge variant="default" className="bg-green-500 text-xs">Active</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
