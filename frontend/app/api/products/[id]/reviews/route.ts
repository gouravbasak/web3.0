import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    console.log(`✅ API called for product: ${productId}`);
    
    // Mock reviews
    const reviews = [
      {
        _id: "1",
        userId: {
          _id: "user1",
          name: "Windows Test User",
          avatar: null,
        },
        rating: 5,
        comment: "This is working from the API route!",
        createdAt: new Date().toISOString(),
        productId: productId,
      },
      {
        _id: "2",
        userId: {
          _id: "user2",
          name: "Another Tester",
          avatar: null,
        },
        rating: 4,
        comment: "API route is functioning correctly.",
        createdAt: new Date().toISOString(),
        productId: productId,
      }
    ];
    
    return NextResponse.json({
      success: true,
      reviews: reviews,
      total: reviews.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        reviews: [],
        total: 0
      },
      { status: 500 }
    );
  }
}