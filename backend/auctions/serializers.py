from rest_framework import serializers
from .models import Artwork, Bid
from django.utils import timezone

class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)
    
    class Meta:
        model = Bid
        fields = ['id', 'artwork', 'bidder', 'bidder_name', 'amount', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ArtworkSerializer(serializers.ModelSerializer):
    bid_history = BidSerializer(many=True, read_only=True)
    highest_bidder_name = serializers.CharField(source='highest_bidder.username', read_only=True)
    
    class Meta:
        model = Artwork
        fields = [
            'id', 'title', 'artist', 'description', 'category', 'image_url',
            'starting_bid', 'current_bid', 'min_increment', 'end_time',
            'highest_bidder', 'highest_bidder_name', 'bid_history', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_end_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("End time must be in the future.")
        return value

class BidCreateSerializer(serializers.Serializer):
    artwork_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        artwork = Artwork.objects.get(id=data['artwork_id'])
        if artwork.end_time <= timezone.now():
            raise serializers.ValidationError("Auction has ended.")
        min_bid = artwork.current_bid + artwork.min_increment
        if data['amount'] < min_bid:
            raise serializers.ValidationError(f"Bid must be at least {min_bid}.")
        return data
