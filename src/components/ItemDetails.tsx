import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ArrowLeft, Clock, ExternalLink, TrendingDown, TrendingUp} from 'lucide-react';
import AlertForm from './AlertForm';
import {useAuth} from "@/hooks/useAuth.tsx";
import { ScrollArea } from '@/components/ui/scroll-area';

function formatTimestamp(isoString) {
    try {
        const cleanIso = isoString.split('.')[0]; // Remove microseconds
        const dateUtc = new Date(cleanIso + 'Z'); // Treat as UTC

        if (isNaN(dateUtc.getTime())) return "Invalid date";

        const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5.5 hours in ms
        const dateIST = new Date(dateUtc.getTime() + istOffsetMs); // ✅ getTime() returns number

        return dateIST.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata', // Optional (but ensures clarity)
        });
    } catch (err) {
        return "Error formatting date";
    }
}


function ItemImage({ src, alt }) {
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
    availability: 'in-stock' | 'out-of-stock' | 'limited';
}

const ItemDetails = () => {
    const {user} = useAuth();
    const {id} = useParams();
    const [item, setItem] = useState<ItemData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return; // Wait for user to be authenticated

        const data = {
            uid: user.uid,
            email: user.email,
            username: user.displayName,
            pincode: "682020",
            item_id: id
        }
        const fetchItemDetails = async () => {
            setLoading(true);
            fetch('https:/jugaad-backend-production.up.railway.app/get-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((response) => {
                    // Mock data based on ID
                    const Item: ItemData = {
                        id: id || '1',
                        name: response.name,
                        currentPrice: response.selling_price,
                        originalPrice: response.mrp_price,
                        discount: response.discount_percent,
                        url: response.source_url,
                        image: response.image_url,
                        site: 'JioMart',
                        lastUpdated: '2 minutes ago',
                        priceHistory: response.logs,
                        availability: 'in-stock'
                    };
                    setItem(Item);
                })
            setLoading(false);
        };

        fetchItemDetails();
    }, [user, id]);

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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="h-4 w-4"/>
                                Back to Dashboard
                            </Button>
                        </Link>
                        <AlertForm/>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Product Image and Basic Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <ItemImage src={item.image} alt={item.name} />
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{item.site}</Badge>
                                    <Badge
                                        variant={item.availability === 'in-stock' ? 'default' : 'destructive'}
                                    >
                                        {item.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4"/>
                                    Last updated: {item.lastUpdated}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Price Info and Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Price</CardTitle>
                                <CardDescription>Live pricing information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className="text-3xl font-bold text-primary">₹{item.currentPrice.toLocaleString()}</span>
                                        <span
                                            className="text-lg text-muted-foreground line-through">₹{item.originalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                            <CardHeader>
                                <CardTitle>Price History</CardTitle>
                                <CardDescription>Track price changes over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                                                                <ScrollArea className="h-48 pr-4">

                                <div className="space-y-3">
                                    {item.priceHistory.map((entry, index) => (
                                        <div key={index}
                                             className="flex items-center justify-between p-3 border rounded-lg">
                                            <span
                                                className="text-sm text-muted-foreground">{formatTimestamp(entry.last_updated_timestamp)}</span>
                                            <div className="flex items-center gap-2">
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
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
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
            </div>
        </div>
    );
};

export default ItemDetails;
