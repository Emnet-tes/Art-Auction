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
from django.http import Http404
from bson import Binary, ObjectId
import base64
import uuid 

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

# New: resolve various id formats used by the frontend (safe for routing)
def resolve_artwork_by_id(raw_id):
    """
    Resolve an Artwork by either:
    - UUID string (normal Django UUID)
    - ObjectId (MongoDB _id)
    Uses MongoDB connection directly to bypass Djongo UUID conversion issues
    """
    if not raw_id:
        raise Http404("Artwork id missing")

    print(f"\n[v0] ===== UUID RESOLUTION DEBUG =====")
    print(f"[v0] Frontend sent: {raw_id}")
    print(f"[v0] Type: {type(raw_id)}")

    # --- 1) Try regular UUID format using MongoDB connection directly ---
    try:
        parsed_uuid = uuid.UUID(str(raw_id))
        print(f"[v0] Parsed as UUID: {parsed_uuid}")
        
        # Convert UUID to BSON Binary for MongoDB query
        uuid_binary = Binary(parsed_uuid.bytes, subtype=3)
        print(f"[v0] UUID binary: {uuid_binary}")
        
        # Get MongoDB connection and query directly
        from django.db import connections
        db = connections['default'].get_database()
        
        # Query the artworks collection directly
        artwork_doc = db['auctions_artwork'].find_one({"id": uuid_binary})
        
        if artwork_doc:
            print(f"[v0] ✓ Found artwork document in MongoDB!")
            # Convert MongoDB document back to Django model
            artwork = Artwork.objects.filter(id=parsed_uuid).first()
            if artwork:
                print(f"[v0] ✓ Successfully retrieved Django model!")
                return artwork
            else:
                print(f"[v0] ✗ Found in MongoDB but failed to retrieve Django model")
        else:
            print(f"[v0] ✗ UUID not found in MongoDB")
    except Exception as e:
        print(f"[v0] ✗ UUID lookup failed: {type(e).__name__}: {str(e)}")

    # --- 2) Try ObjectId format ---
    try:
        obj_id = ObjectId(str(raw_id))
        print(f"[v0] Parsed as ObjectId: {obj_id}")
        artwork = Artwork.objects.filter(_id=obj_id).first()
        if artwork:
            print(f"[v0] ✓ Found artwork by ObjectId!")
            return artwork
        else:
            print(f"[v0] ✗ ObjectId not found in database")
    except Exception as e:
        print(f"[v0] ✗ ObjectId lookup failed: {type(e).__name__}: {str(e)}")

    # --- 3) Debug: Show all artworks in database ---
    print(f"\n[v0] ===== DATABASE DEBUG =====")
    try:
        all_artworks = Artwork.objects.all()
        print(f"[v0] Total artworks in database: {all_artworks.count()}")
        for artwork in all_artworks:
            print(f"[v0] - ID: {artwork.id} (type: {type(artwork.id).__name__})")
            print(f"[v0]   Title: {artwork.title}")
    except Exception as e:
        print(f"[v0] ✗ Failed to list artworks: {type(e).__name__}: {str(e)}")

    raise Http404("Artwork not found")
class ArtworkListCreateView(generics.ListCreateAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []

class ArtworkDetailView(generics.RetrieveAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    lookup_field = 'pk'

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            # convert to UUID if valid
            uuid_obj = uuid.UUID(pk)
            return get_object_or_404(Artwork, id=uuid_obj)
        except ValueError:
            return get_object_or_404(Artwork, id=pk)

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
    # Resolve the artwork using the flexible resolver, then fetch bids
    artwork = resolve_artwork_by_id(artwork_id)
    bids = Bid.objects.filter(artwork=artwork)
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