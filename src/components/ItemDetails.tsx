import React, {useEffect, useState} from 'react';
import {Link, useParams, useSearchParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
    ArrowLeft,
    Clock,
    ExternalLink,
    Home,
    MapPin,
    Package,
    Star,
    TrendingDown,
    TrendingUp,
    User
} from 'lucide-react';
import AlertForm from './AlertForm';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import {Line, LineChart, XAxis, YAxis} from 'recharts';
import '../utils/loader.css'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {getPincodeFromLocation} from "@/utils/location.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import MapContainer from 'react-ola-maps-wrapper';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const olaMapsApiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;

function formatTimestamp(isoString) {
    return new Date(isoString).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata',});
}

const MarkerBox = ({label}: { label: string }) => (
    <Card className="px-3 py-2 bg-black text-white rounded-lg shadow-md border-none">
        <span className="font-semibold text-sm">{label}</span>
    </Card>
)


function getZoomLevel(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km

    // Approx mapping distance → zoom
    if (distance < 1) return 13;  // very close
    if (distance < 5) return 12;
    if (distance < 10) return 11;
    if (distance < 25) return 10;
    if (distance < 50) return 9;
    if (distance < 100) return 8;
    if (distance < 200) return 7;
    if (distance < 400) return 6;
    if (distance < 800) return 5;
    if (distance < 1600) return 4;
    return 3; // very far
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
    storeLat: number;
    storeLng: number;
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
    const {id} = useParams();
    const [searchParams] = useSearchParams();
    const pincode = searchParams.get("pincode");
    const {toast, dismiss} = useToast();
    const [item, setItem] = useState<ItemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lat, setLat] = useState(null);

    const [lon, setLng] = useState(null);

    useEffect(() => {

        const fetchPincode = async () => {
            try {
                // Try browser location first
                const result = await getPincodeFromLocation();

                if (result?.lat != null && result?.lon != null) {
                    setLat(result.lat);
                    setLng(result.lon);
                    return; // ✅ Done
                }

                // ❌ No location → show toast & fallback
                toast({
                    title: "Location Required",
                    description:
                        "We could’t access your device location. Using approximate location from your IP instead.",
                    variant: "destructive",
                    duration: 8000,
                    className: "text-sm px-3 py-2",
                });

                throw new Error("No location from getPincodeFromLocation");
            } catch (err) {
                console.warn("Falling back to IP-based location:", err);

                try {
                    const response = await fetch("https://ipapi.co/json/");
                    const data = await response.json();

                    if (data?.latitude && data?.longitude) {
                        setLat(data.latitude);
                        setLng(data.longitude);
                    } else {
                        console.warn("IP-based location failed:", data);
                    }
                } catch (ipErr) {
                    console.warn("IP fallback also failed:", ipErr);
                }
            }
        };

        fetchPincode(); //we will get pincode here

        const data = {
            pincode: pincode,
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
                const Item: ItemData = {
                    id: id || '1',
                    name: result.name,
                    storeLat: result.store_lat,
                    storeLng: result.store_lng,
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
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-xl">
                        <div className="loader">
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__ball"></div>
                        </div>
                    </div>
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
                                    {item?.metadata?.rating && (
                                        <Badge variant="secondary">
                                            <Star className="h-4 w-4 flex-shrink-0 text-black mr-1"/>
                                            {item.metadata.rating}
                                        </Badge>
                                    )}
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
                                        <span className="break-words">
                                          Delivery distance: {item.metadata?.distance != null ? `${item.metadata.distance} KM` : "NA"}
                                        </span>
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

                <MapContainer
                    className="mt-6 bg-black text-white rounded-lg shadow-md border-none"
                    apiKey={olaMapsApiKey}
                    width="100%"
                    height="400px"
                    center={{longitude: (lat + item.storeLat) / 2, latitude: (lon + item.storeLng) / 2}}
                    markers={[
                        {
                            latitude: lon,
                            longitude: lat,

                            element: (
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white shadow-md">
                                    <User className="w-5 h-5"/>
                                </div>
                            ),
                            popUp: (<Card className="p-3 shadow-md">
                                Your location
                            </Card>),
                        },
                        {
                            latitude: item.storeLng,
                            longitude: item.storeLat,
                            element: (<div
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white shadow-md">
                                <Home className="w-5 h-5"/>
                            </div>),
                            popUp: (
                                <Card className="p-3 shadow-md">
                                    Your item is in this warehouse
                                </Card>
                            ),
                        }
                    ]}
                    zoom={getZoomLevel(lat, lon, item.storeLat, item.storeLng)}
                />
            </div>

        </div>
    );
};

export default ItemDetails;
