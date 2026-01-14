/**
 * Subscription Plans Component
 * Demonstrates complex state interactions with checkout flow
 */

import React from 'react';
import {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
} from '@/services/api';
import { useToast, useApiError } from '@/hooks';

export const SubscriptionPlans: React.FC = () => {
  const toast = useToast();
  const { handleError } = useApiError();

  // Fetch data with caching
  const { data: plansData, isLoading: plansLoading } = useGetSubscriptionPlansQuery();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetMySubscriptionQuery();

  // Mutations
  const [createCheckout, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  const plans = plansData?.data || [];
  const currentSubscription = subscriptionData?.data;

  const handleSubscribe = async (planId: string) => {
    try {
      // This will redirect to Stripe checkout automatically
      await createCheckout({
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      }).unwrap();
    } catch (err) {
      handleError(err);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      // Optimistic update happens automatically
      await cancelSubscription().unwrap();
      toast.success('Subscription cancelled successfully');
    } catch (err) {
      handleError(err);
    }
  };

  if (plansLoading || subscriptionLoading) {
    return <div>Loading subscription information...</div>;
  }

  return (
    <div className="subscription-plans-container">
      <h1>Subscription Plans</h1>

      {/* Current subscription info */}
      {currentSubscription && (
        <div className="current-subscription">
          <h2>Your Current Plan</h2>
          <div className="subscription-card">
            <h3>{currentSubscription.plan?.name}</h3>
            <p>Status: {currentSubscription.status}</p>
            <p>Started: {new Date(currentSubscription.startDate).toLocaleDateString()}</p>
            {currentSubscription.endDate && (
              <p>Ends: {new Date(currentSubscription.endDate).toLocaleDateString()}</p>
            )}
            
            {currentSubscription.status === 'active' && (
              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="btn-danger"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available plans */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
          >
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}
            
            <h3>{plan.name}</h3>
            <p className="description">{plan.description}</p>
            
            <div className="price">
              <span className="amount">${plan.price}</span>
              <span className="interval">/{plan.interval}</span>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {plan.limits && (
              <div className="limits">
                <h4>Limits:</h4>
                <ul>
                  {plan.limits.serviceRequests && (
                    <li>{plan.limits.serviceRequests} service requests/month</li>
                  )}
                  {plan.limits.documents && (
                    <li>{plan.limits.documents} documents</li>
                  )}
                  {plan.limits.appointments && (
                    <li>{plan.limits.appointments} appointments/month</li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={
                isCreatingCheckout || 
                currentSubscription?.plan?.id === plan.id
              }
              className="subscribe-btn"
            >
              {currentSubscription?.plan?.id === plan.id
                ? 'Current Plan'
                : isCreatingCheckout
                ? 'Processing...'
                : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
