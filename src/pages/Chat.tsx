import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Bot, ChefHat, Clock, Menu, Plus, Search, Send, ShoppingCart, Sparkles, User, Users} from 'lucide-react';
import {StreamingText} from '@/components/StreamingText';
import {MessageSkeleton, ProductSkeleton} from '@/components/LoadingSkeleton';
import {NeonBorder} from "@/components/NeonBorder.tsx";

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    recipe?: RecipeData;
    isStreaming?: boolean;
}

interface RecipeData {
    title: string;
    description: string;
    cookTime: string;
    servings: number;
    items: {
        id: string;
        name: string;
        quantity: string;
        image: string;
        price: number;
    }[];
}

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
}

const Chat = () => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const taglines = [
        "culinary assistant",
        "recipe suggestions",
        "smart meal planner",
        "ingredient matcher",
        "AI cooking companion",
    ];
    const [taglineIndex, setTaglineIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % taglines.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([
        {
            id: '1',
            name: 'Fresh Tomatoes (1kg)',
            price: 45,
            image: 'https://cdnasd.countrydelight.in/cdproductimg/new-website/TomatoDesi-pdp.jpg_1723791939200.jpg',
            category: 'Vegetables',
            inStock: true
        },
        {
            id: '2',
            name: 'Basmati Rice (5kg)',
            price: 320,
            image: 'https://fitmencook.com/wp-content/uploads/2024/03/How-to-Cook-Basmati-Rice.jpg',
            category: 'Grains',
            inStock: true
        },
        {
            id: '3',
            name: 'Olive Oil (500ml)',
            price: 280,
            image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop',
            category: 'Cooking Oil',
            inStock: false
        }
    ]);

const handleSend = async () => {
    if (!input.trim()) return;

    if (!hasStartedChat) {
        setHasStartedChat(true);
    }

    const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: input,
        timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsLoadingProducts(true);

    // Create a placeholder bot message
    const botMsgId = (Date.now() + 1).toString();
    const placeholderBot: Message = {
        id: botMsgId,
        type: 'bot',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
    };

    setMessages(prev => [...prev, placeholderBot]);

    const evtSource = new EventSource(`http://localhost:8000/chat/stream-plan?query=${input}`);

    // Stream recipe text into the same message
    evtSource.addEventListener("recipe_step", (e) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === botMsgId
                    ? { ...msg, content: msg.content + e.data + " " }
                    : msg
            )
        );
    });

    // When product suggestions arrive, add recipe card below the same bot message
    evtSource.addEventListener("product_suggestions", (e) => {
        const products = JSON.parse(e.data);
        console.log(products)
        setMessages(prev =>
            prev.map(msg =>
                msg.id === botMsgId
                    ? {
                        ...msg,
                        isStreaming: false,
                        recipe: {
                            title: "Suggested Ingredients",
                            description: "Products you can buy for this recipe",
                            cookTime: "",
                            servings: 0,
                            items: products.map((p: any, idx: number) => ({
                                id: `${idx}`,
                                name: p.name,
                                quantity: p.quantity || "",
                                image: "https://www.jiomart.com/images/product/original/"+p.image_url || "",
                                price: p.price,
                            })),
                        },
                    }
                    : msg
            )
        );
    });

    evtSource.addEventListener("end", () => {
        console.log("Stream finished. Closing connection.");
        evtSource.close();
        setIsLoading(false);
        setIsLoadingProducts(false);

        // Mark message as finished
        setMessages(prev =>
            prev.map(msg =>
                msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
            )
        );
    });
};

    const RecipeCard = ({recipe}: { recipe: RecipeData }) => (
        <Card className="mt-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ChefHat className="h-5 w-5 text-primary"/>
                    </div>
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{recipe.description}</p>
            </CardHeader>

            <CardContent>
                <div className="flex gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4"/>
                        <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4"/>
                        <span>{recipe.servings} servings</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4"/>
                        Ingredients needed
                    </h4>
                    <div className="grid gap-3">
                        {recipe.items.map((item) => (
                            <Card key={item.id} className="p-3 bg-muted/30 border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground-15">
                                            {item.name
                                                .toLowerCase()
                                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{item.price}</p>
                                        <Button size="sm" variant="outline" className="mt-1 h-7 text-xs">
                                            <Plus className="h-3 w-3 mr-1"/>
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const ProductRecommendations = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4"/>
                    Recommendations
                </h3>
                <Badge variant="secondary" className="text-xs">JioMart</Badge>
            </div>

            {isLoadingProducts ? (
                <ProductSkeleton/>
            ) : (
                <div className="space-y-3">
                    {recommendedProducts.map((product) => (
                        <Card key={product.id} className="p-3 hover:shadow-md transition-all hover:scale-[1.02]">
                            <div className="flex gap-3">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-14 h-14 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span
                                            className="font-semibold text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
                                        <Badge
                                            variant={product.inStock ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full mt-2 h-7"
                                        disabled={!product.inStock}
                                        variant={product.inStock ? "default" : "secondary"}
                                    >
                                        <Plus className="h-3 w-3 mr-1"/>
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    if (!hasStartedChat) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="mb-6">
                            <div
                                className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-8 w-8 text-primary-foreground"/>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                                Recipe AI
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Your intelligent {" "}
                                <span
                                    key={taglineIndex}
                                    className="text-primary font-bold font-mono animate-fade-up transition-all duration-500"
                                >
                                {taglines[taglineIndex]}
                              </span>
                            </p>

                        </div>
                    </div>

                    <NeonBorder className="mb-8 p-2">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me for a recipe, ingredient suggestions, or meal ideas..."
                                    className="pr-12 py-3 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl"
                                >
                                    <Send className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </NeonBorder>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <ChefHat className="h-8 w-8 text-primary mx-auto mb-2"/>
                            <h3 className="font-semibold text-sm">Recipe Discovery</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Find recipes based on ingredients you have
                            </p>
                        </Card>

                        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2"/>
                            <h3 className="font-semibold text-sm">Smart Shopping</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Get ingredient lists with prices from JioMart
                            </p>
                        </Card>

                        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <Users className="h-8 w-8 text-primary mx-auto mb-2"/>
                            <h3 className="font-semibold text-sm">Meal Planning</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Plan meals for any number of servings
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col">
            <div className="flex flex-1 h-screen">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="border-b bg-card/50 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="h-8 w-8 text-primary-foreground"/>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Recipe AI</h1>
                                    <p className="text-sm text-muted-foreground">Your culinary assistant</p>
                                </div>
                            </div>

                            {/* Mobile Menu */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="lg:hidden">
                                        <Menu className="h-4 w-4"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-80">
                                    <div className="mt-6">
                                        <ProductRecommendations/>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                                >
                                    {message.type === 'bot' && (
                                        <Avatar
                                            className="h-8 w-8 bg-gradient-to-r from-primary to-neon-primary shrink-0">
                                            <AvatarFallback className="bg-black">
                                                <Bot className="h-4 w-4 text-primary-foreground"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`max-w-[85%] sm:max-w-[70%] ${message.type === 'user' ? 'order-1' : ''}`}>
                                        <div
                                            className={`p-4 rounded-2xl backdrop-blur-sm ${
                                                message.type === 'user'
                                                    ? 'bg-primary text-primary-foreground ml-auto'
                                                    : 'bg-card/80 border border-border/50'
                                            }`}
                                        >
                                            {message.isStreaming ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div
                                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                                                        <div
                                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                                                        <div
                                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm leading-relaxed">
                                                    {message.type === "bot" ? (
                                                        <StreamingText text={message.content}/>
                                                    ) : (
                                                        <div>{message.content}</div>
                                                    )}
                                                </div>

                                            )}
                                        </div>
                                        {message.recipe && !message.isStreaming &&
                                            <RecipeCard recipe={message.recipe}/>}
                                    </div>

                                    {message.type === 'user' && (
                                        <Avatar className="h-8 w-8 bg-muted shrink-0">
                                            <AvatarFallback>
                                                <User className="h-4 w-4"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {isLoading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
                                <MessageSkeleton/>
                            )}
                            <div ref={messagesEndRef}/>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="sticky bottom-0 z-10 border-t bg-card/50 backdrop-blur-sm p-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask for a recipe or ingredient suggestions..."
                                        className="pr-12 py-3 rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl"
                                    >
                                        <Send className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Product Recommendations */}
                <div className="w-80 border-l bg-card/30 backdrop-blur-sm hidden lg:flex flex-col">
                    <div className="p-4 border-b border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <ShoppingCart className="h-4 w-4 text-primary"/>
                            </div>
                            <h2 className="font-semibold">Smart Recommendations</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-background/50 border-border/50"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <ProductRecommendations/>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default Chat;
