from rest_framework import serializers
from .models import Artwork, Bid
from django.utils import timezone
from decimal import Decimal


# ========== Artwork Serializer ==========
class ArtworkSerializer(serializers.ModelSerializer):
    highest_bidder_name = serializers.CharField(source='highest_bidder.username', read_only=True)
    
    class Meta:
        model = Artwork
        fields = [
            'id', 'title', 'artist', 'description', 'category', 'image_url',
            'starting_bid', 'current_bid', 'min_increment', 'end_time',
            'highest_bidder', 'highest_bidder_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_end_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("End time must be in the future.")
        return value


# ========== Bid Serializer ==========
class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)
    artwork = ArtworkSerializer(read_only=True)  # ✅ Now defined above

    class Meta:
        model = Bid
        fields = ['id', 'artwork', 'bidder', 'bidder_name', 'amount', 'timestamp']
        read_only_fields = ['id', 'timestamp']


# ========== Bid Create Serializer ==========
class BidCreateSerializer(serializers.Serializer):
    artwork_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        print("Raw incoming data:", data)

        try:
            artwork = Artwork.objects.get(id=data['artwork_id'])
        except Artwork.DoesNotExist:
            raise serializers.ValidationError("Artwork does not exist.")

        print("Artwork current bid:", artwork.current_bid)
        print("Artwork min increment:", artwork.min_increment)

        if artwork.end_time <= timezone.now():
            raise serializers.ValidationError("Auction has ended.")

        try:
            current_bid = Decimal(str(artwork.current_bid))
            min_increment = Decimal(str(artwork.min_increment))
            min_bid = current_bid + min_increment

            amount = Decimal(str(data['amount']))
        except Exception as e:
            print("Decimal conversion error:", e)
            raise serializers.ValidationError("Invalid decimal conversion")

        print("Calculated min bid:", min_bid)
        print("Incoming bid amount:", amount)

        if amount < min_bid:
            raise serializers.ValidationError(f"Bid must be at least {min_bid}.")

        data['amount'] = amount
        return data