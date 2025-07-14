import {useAuth} from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import {getPincodeFromLocation} from '@/utils/location'
import '../utils/loader.css'


import React, {useEffect, useState} from 'react';

const Index = () => {
    const {user, loading} = useAuth();
    const [pincode, setPincode] = useState(null);

    useEffect(() => {
        const fetchPincode = async () => {
            const result = await getPincodeFromLocation();
            if (result && result.pincode) {
                setPincode(result.pincode);
            }
        };

        fetchPincode(); // auto-run on mount
    }, []);

    if (loading) {
        return (
            <div
                className="min-h-screen from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center text-white">
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
        );
    }

    return user ? <Dashboard/> : <LandingPage pincode={pincode}/>;
};

export default Index;
