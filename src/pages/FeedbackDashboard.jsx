import React, { useState, useEffect } from 'react';
import api from '../api';

export default function FeedbackDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbackAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/feedbacks/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load feedback analytics:', err);
      setError('Unable to load customer feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackAnalytics();
  }, []);

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return { label: 'Positive', bg: '#E8F5E9', text: '#2E6F40', border: '#C8E6C9' };
      case 'NEGATIVE':
        return { label: 'Needs Attention', bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
      default:
        return { label: 'Neutral', bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Analyzing customer reviews and feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#FFEBEE', color: '#C62828', borderRadius: '12px', border: '1px solid #FFCDD2', margin: '20px 0' }}>
        <strong>Error:</strong> {error}
        <button 
          onClick={fetchFeedbackAnalytics} 
          style={{ marginLeft: '16px', padding: '6px 14px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const hasFeedback = data && data.totalReviews > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#24140D', margin: '0 0 6px 0' }}>
            Customer Feedback & Reviews
          </h1>
          <p style={{ margin: 0, color: '#735F54', fontSize: '14px' }}>
            Real-time customer ratings, sentiment analysis, and AI suggestions for your restaurant.
          </p>
        </div>
        <button
          onClick={fetchFeedbackAnalytics}
          style={{
            backgroundColor: '#4A2E1B',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔄</span> Refresh Reviews
        </button>
      </div>

      {!hasFeedback ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #EADBCC',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>💬</div>
          <h3 style={{ fontSize: '18px', color: '#24140D', margin: '0 0 8px 0', fontWeight: '700' }}>
            No Customer Feedback Yet
          </h3>
          <p style={{ color: '#735F54', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            When customers place orders or share reviews using the customer feedback form, honest ratings, sentiment insights, and dish recommendations will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {/* Average Rating */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #EADBCC',
              boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#735F54', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Average Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#24140D' }}>
                  {data.averageRating ? data.averageRating.toFixed(1) : '0.0'}
                </span>
                <span style={{ fontSize: '20px', color: '#E0A96D' }}>★</span>
                <span style={{ fontSize: '13px', color: '#8C7A6B' }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8C7A6B', marginTop: '6px' }}>
                Based on {data.totalReviews} customer {data.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Total Reviews */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #EADBCC',
              boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#735F54', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Reviews
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#24140D', marginTop: '10px' }}>
                {data.totalReviews}
              </div>
              <div style={{ fontSize: '12px', color: '#2E6F40', marginTop: '6px', fontWeight: '500' }}>
                100% verified customer entries
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #EADBCC',
              boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#735F54', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Customer Sentiment
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E6F40',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  👍 {data.positiveCount} Positive
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#FFF8E1',
                  color: '#F57F17',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  😐 {data.neutralCount} Neutral
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#FFEBEE',
                  color: '#C62828',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  👎 {data.negativeCount} Issues
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#8C7A6B', marginTop: '10px' }}>
                {Math.round((data.positiveCount / data.totalReviews) * 100)}% positive customer satisfaction
              </div>
            </div>
          </div>

          {/* AI Insights: Most Liked Dishes & Suggestions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Most Liked Dishes */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '22px',
              border: '1px solid #EADBCC',
              boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px' }}>🍲</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#24140D' }}>
                  Most Liked Dishes
                </h3>
              </div>
              {data.mostLikedDishes && data.mostLikedDishes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.mostLikedDishes.map((dish, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: '#FAF6F0',
                        borderRadius: '8px',
                        border: '1px solid #EADBCC'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#24140D', fontSize: '14px' }}>
                          #{idx + 1} {dish.dishName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#735F54' }}>
                          {dish.reviewCount} {dish.reviewCount === 1 ? 'rating' : 'ratings'} received
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '16px', border: '1px solid #EADBCC' }}>
                        <span style={{ color: '#E0A96D', fontSize: '14px' }}>★</span>
                        <span style={{ fontWeight: '700', color: '#24140D', fontSize: '13px' }}>
                          {dish.averageRating ? dish.averageRating.toFixed(1) : '5.0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8C7A6B', fontSize: '13px', margin: 0 }}>
                  No dish-specific ratings submitted yet.
                </p>
              )}
            </div>

            {/* AI Action Suggestions */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '22px',
              border: '1px solid #EADBCC',
              boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#24140D' }}>
                  AI Improvement Suggestions
                </h3>
              </div>
              {data.improvementSuggestions && data.improvementSuggestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.improvementSuggestions.map((sugg, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#F4EFE6',
                        borderRadius: '8px',
                        borderLeft: '4px solid #C28E52',
                        fontSize: '13.5px',
                        color: '#3B2215',
                        lineHeight: '1.4'
                      }}
                    >
                      {sugg}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8C7A6B', fontSize: '13px', margin: 0 }}>
                  Customer satisfaction is steady. No critical alerts.
                </p>
              )}

              {data.commonComplaints && data.commonComplaints.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#C62828', marginBottom: '8px' }}>
                    Recurring Issues to Address:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {data.commonComplaints.map((comp, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: '#FFEBEE',
                          color: '#C62828',
                          border: '1px solid #FFCDD2',
                          borderRadius: '14px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        ⚠️ {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Customer Reviews Feed */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #EADBCC',
            boxShadow: '0 2px 8px rgba(36,20,13,0.04)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: '#24140D' }}>
              Recent Customer Reviews
            </h3>

            {data.recentReviews && data.recentReviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recentReviews.map((rev) => {
                  const badge = getSentimentBadge(rev.sentiment);
                  return (
                    <div
                      key={rev.id}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        backgroundColor: '#FAF6F0',
                        border: '1px solid #EADBCC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', color: '#24140D', fontSize: '14px' }}>
                            {rev.customerName || 'Anonymous Customer'}
                          </span>
                          {rev.dishName && (
                            <span style={{
                              backgroundColor: '#EAE0D5',
                              color: '#4A2E1B',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              🍽️ {rev.dishName}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Star Rating */}
                          <div style={{ color: '#E0A96D', fontSize: '14px', letterSpacing: '2px' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                          {/* Sentiment */}
                          <span style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {rev.reviewText && (
                        <p style={{ margin: '4px 0 0 0', color: '#3B2215', fontSize: '13.5px', lineHeight: '1.4' }}>
                          "{rev.reviewText}"
                        </p>
                      )}

                      <div style={{ fontSize: '11px', color: '#8C7A6B', alignSelf: 'flex-end' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#8C7A6B', fontSize: '13px', margin: 0 }}>
                No individual reviews to display.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
