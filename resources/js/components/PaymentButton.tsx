import React, { useState } from 'react';
import { Button } from '@/components/wdr';
import {
    paymentsApi,
    type CheckoutRequest,
    type CheckoutResponse,
} from '@/api/payments';

interface PaymentButtonProps {
    payload: CheckoutRequest;
    disabled?: boolean;
    className?: string;
    idleLabel: string;
    loadingLabel: string;
    onCheckoutCreated?: (response: CheckoutResponse) => void;
    onError?: (message: string) => void;
}

export default function PaymentButton({
    payload,
    disabled = false,
    className,
    idleLabel,
    loadingLabel,
    onCheckoutCreated,
    onError,
}: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        onError?.('');

        try {
            const response = await paymentsApi.checkout(payload);
            onCheckoutCreated?.(response);
            window.location.assign(response.url);
        } catch (error) {
            const fallback =
                "Impossible d'ouvrir Stripe Checkout pour le moment.";
            const message =
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof error.response === 'object' &&
                error.response !== null &&
                'data' in error.response &&
                typeof error.response.data === 'object' &&
                error.response.data !== null &&
                'message' in error.response.data &&
                typeof error.response.data.message === 'string'
                    ? error.response.data.message
                    : fallback;

            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="primary"
            size="lg"
            className={className}
            loading={isLoading}
            disabled={disabled}
            onClick={handleClick}
        >
            {isLoading ? loadingLabel : idleLabel}
        </Button>
    );
}
