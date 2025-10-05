from rest_framework import serializers
from .models import Won

class WonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Won
        fields = ['id', 'artwork', 'winner', 'amount', 'won_at']
        depth = 1  # optional, to include artwork details
