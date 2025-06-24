import {useAuth} from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import {getPincodeFromLocation} from '@/utils/location'


import React, {useEffect, useState} from 'react';

const Index = () => {
    const {user, loading} = useAuth();
    const [pincode, setPincode] = useState(null);

    useEffect(() => {
        const fetchPincode = async () => {
            const result = await getPincodeFromLocation();
            setPincode(result.pincode);
        };

        fetchPincode(); // auto-run on mount
    }, []);

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return user ? <Dashboard pincode={pincode}/> : <LandingPage pincode={pincode}/>;
};

export default Index;
