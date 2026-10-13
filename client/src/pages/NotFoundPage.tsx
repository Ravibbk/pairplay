import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { HeartCrack, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full p-8 text-center bg-white border border-cream-300 shadow-soft-lg space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-plum-100 text-plum-800 flex items-center justify-center mx-auto">
          <HeartCrack className="w-8 h-8 text-plum-700" />
        </div>

        <div>
          <h1 className="text-4xl font-serif font-extrabold text-plum-950">404</h1>
          <h2 className="text-lg font-bold font-serif text-plum-800 mt-1">
            Page Not Found
          </h2>
          <p className="text-xs text-plum-500 mt-2 leading-relaxed">
            We couldn’t find the page or private room you’re looking for. It may have expired or been moved.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
