// components/PincodeForm.tsx


import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast.ts";
import {Simulate} from "react-dom/test-utils";
import {useAuth} from "@/hooks/useAuth.tsx";

interface PincodeFormProps {
    endpoint?: string; // optional API endpoint override
    email: string;
    user_uid: string
}

export function PincodeForm({endpoint, email, user_uid}: PincodeFormProps) {
    const {user} = useAuth();
    const {toast} = useToast();
    const [pincode, setPincode] = useState("");

    const HandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await user.getIdToken();
        if (!pincode || pincode.length !== 6) {
            alert("Enter a valid 6-digit pincode");
            return;
        }
        const data = {
            pincode: pincode,
            email: email,
            uid: user_uid
        }
        try {
            await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            toast({
                title: "Success",
                description: "Successfully Updated Your Pincode!",
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            window.location.reload();
        } catch (err) {
            toast({
                title: "Error",
                description: "Sorry, Couldn't Update Your Pincode",
                variant: "destructive"
            });
        }


    };

// flex gap-2 items-center max-w-sm
//   grid gap-4 py-4
    return (
        <form onSubmit={HandleSubmit} className="flex gap-4 py-4">
            <Input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Update your pincode"
                className="flex-grow"
            />
            <Button type="submit" className="shrink-0">
                Update
            </Button>
        </form>
    );
}
