from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Artwork, Bid
from .serializers import ArtworkSerializer, BidSerializer, BidCreateSerializer

class ArtworkListCreateView(generics.ListCreateAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticated]  # Require auth for creating

class ArtworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bid(request):
    serializer = BidCreateSerializer(data=request.data)
    if serializer.is_valid():
        artwork = get_object_or_404(Artwork, id=serializer.validated_data['artwork_id'])
        bid = Bid.objects.create(
            artwork=artwork,
            bidder=request.user,
            amount=serializer.validated_data['amount']
        )
        artwork.current_bid = bid.amount
        artwork.highest_bidder = request.user
        artwork.save()
        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def artwork_bids(request, artwork_id):
    bids = Bid.objects.filter(artwork_id=artwork_id)
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)
