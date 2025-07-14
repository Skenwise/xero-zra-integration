import React from 'react';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 flex  items-center justify-center">
            <div className="bg-white p-8 rounded shadow text-center">
                <h1 className="text-2xl font-bold mb-4">Xero-ZRA Integration</h1>
                <a
                    href="http://localhost:8000/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Connect to Xero
                </a>
            </div>
        </div>
    );
}