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

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

export function ItemActionsDropdown({onView, onEdit, onDelete}: {
    onView: () => void,
    onEdit: () => void,
    onDelete: () => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/90">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md">
                <DropdownMenuItem onClick={onView}>
                    View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                    Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
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

        fetch('https://o207ltrv.leopard-boa.ts.net/get-items', {
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

                setRecentAlerts(alerts); // ✅ Save to state
            })
            .catch((error) => {
                console.error("Error fetching items:", error);
            });
    }, [user]); // Run once on mount

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };


    // const recentAlerts = [
    //   {
    //     id: 1,
    //     productName: "Samsung Galaxy Buds Pro",
    //     site: "JioMart",
    //     targetPrice: 15000,
    //     currentPrice: 14850,
    //     status: "active",
    //     change: "+2.3%",
    //     url: "https://www.jiomart.com/product/samsung-galaxy-buds-pro"
    //   },
    //   {
    //     id: 2,
    //     productName: "iPhone 15 Pro Max",
    //     site: "Amazon",
    //     targetPrice: 120000,
    //     currentPrice: 125000,
    //     status: "triggered",
    //     change: "+5.1%",
    //     url: "https://www.amazon.in/product/iphone-15-pro-max"
    //   },
    //   {
    //     id: 3,
    //     productName: "OnePlus 12 5G",
    //     site: "Flipkart",
    //     targetPrice: 45000,
    //     currentPrice: 43500,
    //     status: "active",
    //     change: "-1.2%",
    //     url: "https://www.flipkart.com/product/oneplus-12-5g"
    //   }
    // ];

    // const quickStats = [
    //     {
    //         title: "Active Alerts",
    //         value: "12",
    //         change: "+3 from last week",
    //         icon: Bell,
    //         color: "text-blue-600"
    //     },
    //     {
    //         title: "Triggered Today",
    //         value: "3",
    //         change: "2 profit, 1 loss",
    //         icon: Target,
    //         color: "text-green-600"
    //     },
    //     {
    //         title: "Watchlist Items",
    //         value: "24",
    //         change: "+5 this week",
    //         icon: Activity,
    //         color: "text-purple-600"
    //     },
    //     {
    //         title: "Success Rate",
    //         value: "87%",
    //         change: "+2% this month",
    //         icon: CheckCircle2,
    //         color: "text-emerald-600"
    //     }
    // ];

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5"/>
                            </Button>
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-primary-foreground"/>
                                </div>
                                <span className="text-xl font-bold">Jugaad</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5"/>
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5"/>
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''}/>
                                    <AvatarFallback>
                                        {user?.displayName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium">{user?.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                            >
                                <LogOut className="h-4 w-4"/>
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {user?.displayName?.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor your favorite products and get notified when prices drop.
                    </p>
                </div>

                {/*/!* Quick Stats *!/*/}
                {/*<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">*/}
                {/*    {quickStats.map((stat, index) => (*/}
                {/*        <Card key={index}>*/}
                {/*            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
                {/*                <CardTitle className="text-sm font-medium text-muted-foreground">*/}
                {/*                    {stat.title}*/}
                {/*                </CardTitle>*/}
                {/*                <stat.icon className={`h-4 w-4 ${stat.color}`}/>*/}
                {/*            </CardHeader>*/}
                {/*            <CardContent>*/}
                {/*                <div className="text-2xl font-bold">{stat.value}</div>*/}
                {/*                <p className="text-xs text-muted-foreground mt-1">*/}
                {/*                    {stat.change}*/}
                {/*                </p>*/}
                {/*            </CardContent>*/}
                {/*        </Card>*/}
                {/*    ))}*/}
                {/*</div>*/}

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Alerts List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Price Alerts</CardTitle>
                                        <CardDescription>
                                            Manage your active price monitoring alerts
                                        </CardDescription>
                                    </div>
                                    <AlertForm/>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="active" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="active">Active</TabsTrigger>
                                        <TabsTrigger value="triggered">Triggered</TabsTrigger>
                                        <TabsTrigger value="all">All</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="active" className="space-y-4 mt-4">
                                        {recentAlerts.map((alert) => (
                                            <div key={alert.id}
                                                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div
                                                        className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <TrendingUp className="h-5 w-5 text-primary"/>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                to={`/item/${alert.item_id}`}
                                                                className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]" // tailwind classes
                                                                title={alert.name} // show full name on hover
                                                            >
                                                                {alert.name}
                                                            </Link>
                                                            <Badge
                                                                variant={alert.is_available === 'triggered' ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {alert.is_available === 'triggered' ?
                                                                    <CheckCircle2 className="h-3 w-3 mr-1"/> :
                                                                    <AlertCircle className="h-3 w-3 mr-1"/>}
                                                                {alert.is_available}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{alert.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-muted-foreground">Now:</p>
                                                        <p className="font-medium">₹{alert.selling_price.toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">MRP:
                                                        ₹{alert.mrp_price.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={alert.price_change.startsWith('+') ? 'text-red-600' : 'text-green-600'}
                                                    >
                                                        {Math.round((1 - (alert.selling_price / alert.mrp_price)) * 100)}%
                                                    </Badge>

                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-gray-600">
                                                        ₹{alert.max_price} &nbsp;
                                                        <Bell className="h-4 w-4 text-blue-600"/>
                                                        &nbsp;
                                                        {alert.max_offer}%
                                                    </Badge>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={alert.source_url} target="_blank"
                                                           rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4"/>
                                                        </a>
                                                    </Button>
                                                    <ItemActionsDropdown
                                                        onView={() => console.log("View clicked")}
                                                        onEdit={() => console.log("Edit clicked")}
                                                        onDelete={() => console.log("Delete clicked")}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="triggered" className="mt-4">
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                                            <p className="text-muted-foreground">No triggered alerts today</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="all" className="mt-4">
                                        <div className="text-center py-8">
                                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                                            <p className="text-muted-foreground">View all your alerts here</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <AlertForm/>

                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Activity className="h-4 w-4"/>
                                    Price Prediction
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Supported Sites</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">JioMart</span>
                                    <Badge variant="default" className="bg-green-500">Active</Badge>
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
