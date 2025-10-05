from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Artwork, Bid
from won.models import Won
from .serializers import ArtworkSerializer, BidSerializer, BidCreateSerializer
from decimal import Decimal
from bson.decimal128 import Decimal128
from django.forms.models import model_to_dict


class ArtworkListCreateView(generics.ListCreateAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticated]  # Require auth for creating

class ArtworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticated]

def to_decimal(value):
        """Convert any Decimal128 to Python Decimal."""
        if isinstance(value, Decimal128):
            return value.to_decimal()
        elif isinstance(value, Decimal):
            return value
        elif value is None:
            return Decimal(0)
        else:
            return Decimal(str(value))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bid(request):
    serializer = BidCreateSerializer(data=request.data)

    if serializer.is_valid():
        artwork = get_object_or_404(Artwork, id=serializer.validated_data['artwork_id'])
        if timezone.now() >= artwork.end_time:
            return Response(
                {"error": "This auction has already ended."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        amount = to_decimal(serializer.validated_data['amount'])
        artwork.current_bid = to_decimal(artwork.current_bid)
        artwork.min_increment = to_decimal(artwork.min_increment)
        artwork.starting_bid = to_decimal(artwork.starting_bid)
      

        # Validation
        if amount < artwork.current_bid + artwork.min_increment:
            return Response({"error": f"Bid must be at least {artwork.current_bid + artwork.min_increment}"}, status=400)

        # Create bid
        bid = Bid.objects.create(
            artwork=artwork,
            bidder=request.user,
            amount=amount
        )

        # Update artwork fields (force Decimal)
        artwork.current_bid = amount
        artwork.highest_bidder = request.user
        artwork.save()
        return Response(BidSerializer(bid).data, status=201)

    return Response(serializer.errors, status=400)

@api_view(['GET'])
def artwork_bids(request, artwork_id):
    bids = Bid.objects.filter(artwork_id=artwork_id)
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bids(request):
    """
    Return all bids made by the currently logged-in user.
    """
    user = request.user
    bids = Bid.objects.filter(bidder=user).select_related('artwork')
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def run_close_auctions(request):
    now = timezone.now()
    # 1️⃣ Fetch all artworks (no filter for Djongo compatibility)
    all_auctions = list(Artwork.objects.all())
    all_auctions_dicts = [model_to_dict(a) for a in all_auctions]

    print("Total auctions fetched:", all_auctions_dicts)
    print("Current time:", now)
    # 2️⃣ Filter manually in Python (safe with Djongo)
    auctions_to_process = [
        a for a in all_auctions if a.is_active and a.end_time <= now
    ]

    if not auctions_to_process:
        print('No auctions to close at this time.')
        return Response({
            "status": "success",
            "processed": 0,
            "message": "No auctions to close at this time."
        }) 

    results = []
    for artwork in auctions_to_process:
        if artwork.highest_bidder:
            won_obj, created = Won.objects.get_or_create(
                artwork=artwork,
                defaults={"winner": artwork.highest_bidder, "amount": to_decimal(artwork.current_bid)}
            )
            if created:
                results.append(f"Won created for {artwork.title}")
        artwork.is_active = False
        artwork.save(update_fields=['is_active'])

    return Response({
        "status": "success",
        "processed": len(auctions_to_process),
        "message": results or "No ended auctions."
    })