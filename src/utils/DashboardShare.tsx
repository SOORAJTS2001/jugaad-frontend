import {useToast} from "@/components/ui/use-toast";
import {Button} from "@/components/ui/button.tsx";
import {Share2} from "lucide-react";

export function WishlistSection({UserItems}: { UserItems: any[] }) {
    const {toast} = useToast();
    const baseUrl = window.location.origin;

    const handleShare = async () => {
        const shareText = `🛍️ Check out my wishlist!\n\n${UserItems.map((item, index) => {
            const offer =
                item.mrp_price && item.selling_price
                    ? `₹${item.mrp_price - item.selling_price} off`
                    : "No discount";
            const itemUrl = `${baseUrl}/item/${item.item_id}?pincode=${item.pincode}`;

            return `${index + 1}. ${item.name}
Price: ₹${item.selling_price} (MRP ₹${item.mrp_price})
Offer: ${offer}
Status: ${item.is_available}
Link: ${itemUrl}`;
        }).join("\n\n")}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My Wishlist",
                    text: shareText,
                });
                toast({
                    title: "Success",
                    description: "Your wishlist has been copied.",
                });
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not share your wishlist",
                    variant: "destructive",
                });
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                toast({
                    title: "Success",
                    description: "Your wishlist has been copied.",
                });
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not copy to clipboard",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <>
            {UserItems && UserItems.length > 0 && (
                <Button
                    className="w-full justify-center gap-2 h-9 text-sm"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4"/>
                    Share
                </Button>
            )}
        </>
    );
}

