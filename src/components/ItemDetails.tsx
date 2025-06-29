import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ArrowLeft, Clock, ExternalLink, MapPin, Package, Star, TrendingDown, TrendingUp} from 'lucide-react';
import AlertForm from './AlertForm';
import {useAuth} from "@/hooks/useAuth.tsx";
import {ScrollArea} from '@/components/ui/scroll-area';
import {ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import {Line, LineChart, XAxis, YAxis} from 'recharts';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {getPincodeFromLocation} from "@/utils/location.tsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function formatTimestamp(isoString) {
    return new Date(isoString).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata',});
}

function ItemImage({src, alt}) {
    const [imgSrc, setImgSrc] = useState(src);
    const fallback = "/placeholder.svg"; // your fallback image path

    return (
        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
            <img
                src={imgSrc}
                alt={alt}
                onError={() => setImgSrc(fallback)}
                className="max-w-full max-h-full object-contain"
            />
        </div>
    );
}

interface ItemData {
    id: string;
    name: string;
    currentPrice: number;
    originalPrice: number;
    discount: number;
    url: string;
    image: string;
    site: string;
    lastUpdated: string;
    priceHistory: Array<{
        last_updated_timestamp: string;
        selling_price: number;
    }>;
    metadata: {
        rating: number;
        summary: string;
        distance: number
    };
    maxOrderQuantity: string;
    availability: 'in-stock' | 'out-of-stock' | 'limited';
}

const chartConfig = {
    selling_price: {
        label: "Price",
        color: "#22c55e",
    },
}

const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
};

const ItemDetails = () => {
    const {user} = useAuth();
    const {id} = useParams();
    const [item, setItem] = useState<ItemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lat, setLat] = useState(null);

    const [lon, setLng] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchPincode = async () => {
            try {
                const result = await getPincodeFromLocation();
                setLat(result.lat);
                setLng(result.lon);
            } catch (err) {
                console.error("Failed to get location:", err);
            }
        };

        fetchPincode();
    }, [user]); // Run once when user is ready

    useEffect(() => {
        // Wait for user, id, and lat/lng to be available
        if (!user || !id || lat === null || lon === null) return;

        const data = {
            uid: user.uid,
            email: user.email,
            username: user.displayName,
            item_id: id,
            lat: lat,
            lng: lon,
        };

        const fetchItemDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${backendUrl}/get-item`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();

                dayjs.extend(relativeTime);
                const last_updated = dayjs(result.last_updated_timestamp).fromNow();
                const Item = {
                    id: id || '1',
                    name: result.name,
                    currentPrice: result.selling_price,
                    originalPrice: result.mrp_price,
                    discount: result.discount_percent,
                    url: result.source_url,
                    image: result.image_url,
                    site: 'JioMart',
                    lastUpdated: last_updated,
                    priceHistory: result.logs,
                    maxOrderQuantity: result.max_order_quantity,
                    availability: result.is_available ? 'in-stock' : 'out-of-stock',
                    metadata: result.item_metadata,
                };

                setItem(Item);
            } catch (error) {
                console.error("Failed to fetch item details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetails();
    }, [user, id, lat, lon]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading item details...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Item not found</h2>
                    <Link to="/">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = item.priceHistory
        .slice() // clone to avoid mutating original
        .reverse()
        .map(entry => ({
            date: formatTimestamp(entry.last_updated_timestamp),
            selling_price: entry.selling_price,
            fullDate: entry.last_updated_timestamp
        }));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <Link to="/">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="h-4 w-4"/>
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="w-full sm:w-auto">
                            <AlertForm/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                    {/* Product Image and Basic Info */}
                    <div className="space-y-4 lg:space-y-6">
                        <Card>
                            <CardContent className="p-4 sm:p-6">
                                <ItemImage src={item.image} alt={item.name}/>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge variant="secondary">{item.site}</Badge>
                                    <Badge variant="secondary">
                                        <Star className="h-4 w-4 flex-shrink-0 text-black mr-1"/>
                                        {item.metadata.rating}
                                    </Badge>

                                    <Badge
                                        variant={item.availability === 'in-stock' ? 'default' : 'destructive'}
                                    >
                                        {item.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold mb-4 line-clamp-3">{item.name}</h1>
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 flex-shrink-0"/>
                                        <span className="break-words">Last updated: {item.lastUpdated}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 flex-shrink-0"/>
                                        <span className="break-words">Max order quantity: {item.maxOrderQuantity}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 flex-shrink-0"/>
                                        <span
                                            className="break-words">Delivery distance: {item.metadata.distance} KM</span>
                                    </div>


                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Price Info and Actions */}
                    <div className="space-y-4 lg:space-y-3">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardDescription className="text-muted-foreground text-sm">
                                    {item.metadata?.summary && (
                                        <p className="text-gray-700">
                                            <span className="text-2xl font-serif leading-none mr-1">“</span>
                                            {item.metadata.summary}
                                            <span className="text-2xl font-serif leading-none ml-1">”</span>
                                        </p>
                                    )}

                                </CardDescription>
                                <CardTitle className="space-y-4 text-lg sm:text-xl">Current Price</CardTitle>

                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span
                                            className="text-2xl sm:text-3xl font-bold text-primary">₹{item.currentPrice.toLocaleString()}</span>
                                        <span
                                            className="text-base sm:text-lg text-muted-foreground line-through">₹{item.originalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="default" className="bg-green-500">
                                            <TrendingDown className="h-3 w-3 mr-1"/>
                                            {item.discount}% OFF
                                        </Badge>
                                        <span className="text-sm text-green-600">
                                            You save ₹{(item.originalPrice - item.currentPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg sm:text-xl">Price History</CardTitle>
                                <CardDescription>Track price changes over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-48 sm:h-56 pr-2 sm:pr-4">
                                    <div className="space-y-3">
                                        {item.priceHistory.map((entry, index) => (
                                            <div key={index}
                                                 className="flex items-center justify-between p-3 border rounded-lg">
                                                <span className="text-sm text-muted-foreground break-words">
                                                    {formatTimestamp(entry.last_updated_timestamp)}
                                                </span>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span
                                                        className="font-medium">₹{entry.selling_price.toLocaleString()}</span>
                                                    {index > 0 && (
                                                        <div className="flex items-center">
                                                            {entry.selling_price < item.priceHistory[index - 1].selling_price ? (
                                                                <TrendingDown className="h-4 w-4 text-green-500"/>
                                                            ) : (
                                                                <TrendingUp className="h-4 w-4 text-red-500"/>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" asChild>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2"/>
                                        View on {item.site}
                                    </a>
                                </Button>
                                <AlertForm/>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Price History Chart - Full Width */}
                <div className="mt-6 lg:mt-8">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Price Trend</CardTitle>
                            <CardDescription>Visual representation of price changes over time</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[400px] w-full">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 20,
                                        bottom: 20
                                    }}
                                >
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 10}}
                                        className="text-xs"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 10}}
                                        tickFormatter={formatPrice}
                                        className="text-xs"
                                        width={60}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent
                                            formatter={(value) => [formatPrice(value as number)]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="selling_price"
                                        stroke="var(--color-selling_price)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
