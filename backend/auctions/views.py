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
from bson.objectid import ObjectId
import base64

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
    Try multiple strategies to find the Artwork corresponding to raw_id:
     - 24-hex ObjectId -> lookup by _id field (MongoDB) - CHECKED FIRST
     - direct pk/id/_id matches
     - base64url -> bytes -> ObjectId (12 bytes) or decoded utf-8 string
    Raises Http404 if not found.
    """
    if not raw_id and raw_id != 0:
        raise Http404("Artwork id missing")

    try:
        if isinstance(raw_id, str) and len(raw_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in raw_id):
            oid = ObjectId(raw_id)
            # Try to find by _id (MongoDB field where Djongo stores the ObjectId)
            try:
                return Artwork.objects.get(_id=oid)
            except Artwork.DoesNotExist:
                pass
            # Also try by id field as fallback
            try:
                return Artwork.objects.get(id=oid)
            except Artwork.DoesNotExist:
                pass
    except Exception:
        pass

    # 1) direct lookups (pk / id / _id)
    for field in ("pk", "id", "_id"):
        try:
            if field == "pk":
                return Artwork.objects.get(pk=raw_id)
            else:
                # Try direct match
                kwargs = {field: raw_id}
                try:
                    return Artwork.objects.get(**kwargs)
                except Exception:
                    # If it's base64url, try converting to base64 and Binary
                    if isinstance(raw_id, str):
                        b64 = raw_id.replace("-", "+").replace("_", "/")
                        pad = (-len(b64)) % 4
                        if pad:
                            b64 += "=" * pad
                        import base64
                        from bson.binary import Binary
                        try:
                            decoded = base64.b64decode(b64)
                            b = Binary(decoded, 3)
                            kwargs = {field: b}
                            return Artwork.objects.get(**kwargs)
                        except Exception:
                            pass
        except Exception:
            pass

    # 2) try base64url decode -> bytes
    try:
        s = str(raw_id)
        # convert base64url to base64
        b64 = s.replace("-", "+").replace("_", "/")
        # pad
        pad = (-len(b64)) % 4
        if pad:
            b64 += "=" * pad
        decoded = base64.b64decode(b64)
        # if 12 bytes, try ObjectId from bytes
        if len(decoded) == 12:
            try:
                return Artwork.objects.get(_id=ObjectId(decoded))
            except Exception:
                pass
        # try decoded bytes as utf-8 string id
        try:
            decoded_str = decoded.decode("utf-8")
            for field in ("id", "_id"):
                try:
                    kwargs = {field: decoded_str}
                    return Artwork.objects.get(**kwargs)
                except Exception:
                    pass
        except Exception:
            pass
    except Exception:
        pass

    # not found
    raise Http404("Artwork not found")


class ArtworkListCreateView(generics.ListCreateAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []

class ArtworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    # permission_classes = [IsAuthenticated]

    # Override to support frontend normalized ids
    def get_object(self):
        raw_pk = self.kwargs.get(self.lookup_field or "pk")
        return resolve_artwork_by_id(raw_pk)

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